export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit3, Copy, CheckCircle } from "lucide-react";
import { CabecalhoPagina } from "@/componentes/compartilhados/cabecalho-pagina";
import { Status } from "@/componentes/ui/status";
import { formatarDataCurta, formatarMoeda } from "@/lib/formatadores";
import { cancelarAcao, clonarAcao } from "@/funcionalidades/acoes/actions";
import { prisma } from "@/lib/prisma";
import { formatData } from "@/lib/format";
import type { StatusAcao } from "@/funcionalidades/acoes/tipos";
import { exigirUsuario } from "@/lib/autorizacao";

export default async function DetalheAcaoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const usuario = await exigirUsuario();
  const ehAdmin = usuario.papel === "ADMINISTRADOR";

  const [acao, historico] = await Promise.all([
    prisma.acao.findUnique({
      where: { id },
      include: {
        distribuidora: true,
        estabelecimento: true,
        profissionais: { include: { degustadora: true } },
        produtos: { include: { produto: true } },
        acaoDegustadoras: { include: { degustadora: true } },
      },
    }),
    prisma.auditoria.findMany({
      where: { entidade: "Acao", registroId: id },
      include: { autor: { select: { name: true } } },
      orderBy: { criadoEm: "desc" },
    }),
  ]);

  if (!acao) notFound();

  if (!ehAdmin) {
    const atribuida = acao.acaoDegustadoras.some((ad) => ad.degustadoraId === usuario.degustadoraId);
    if (!atribuida) notFound();
  }

  const nomeEstab = acao.estabelecimentoId && acao.estabelecimento
    ? acao.estabelecimento.nomeFantasia ?? acao.estabelecimento.razaoSocial
    : acao.estabelecimentoAvulso ?? "Não informado";

  const totalProdutos = acao.produtos.reduce(
    (s, p) => s + p.quantidadePlanejada * Number(p.preco),
    0
  );

  const clonar = clonarAcao.bind(null, acao.id);
  const cancelar = cancelarAcao.bind(null, acao.id);

  return (
    <div className="pagina-conteudo">
      <div style={{ marginBottom: 16 }}>
        <Link href="/acoes" style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--cor-texto-3)", fontSize: 11 }}>
          <ArrowLeft size={14} /> Voltar às ações
        </Link>
      </div>

      <CabecalhoPagina
        etiqueta="Ações"
        titulo={acao.numero}
        descricao={`${acao.titulo} · criado em ${formatarDataCurta(acao.criadoEm.toISOString().slice(0, 10))}`}
        acao={
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <Status valor={acao.status as StatusAcao} />
            {ehAdmin && acao.status === "aberta" && (
              <>
                <Link href={`/acoes/${acao.id}/editar`} className="bt-secundario" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Edit3 size={14} /> Editar
                </Link>
                <form action={clonar} style={{ display: "contents" }}>
                  <button
                    type="submit"
                    className="bt-secundario"
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                    onClick={(e) => { if (!confirm("Clonar esta ação?")) e.preventDefault(); }}
                  >
                    <Copy size={14} /> Clonar
                  </button>
                </form>
                <Link
                  href={`/acoes/${acao.id}/checkout`}
                  className="botao"
                  style={{ display: "flex", alignItems: "center", gap: 6 }}
                >
                  <CheckCircle size={14} /> Encerrar
                </Link>
                <form action={cancelar} style={{ display: "contents" }}>
                  <button
                    type="submit"
                    className="bt-danger"
                    onClick={(e) => { if (!confirm("Cancelar esta ação? Esta ação não poderá ser reaberta.")) e.preventDefault(); }}
                  >
                    Cancelar ação
                  </button>
                </form>
              </>
            )}
          </div>
        }
      />

      {/* Dados gerais */}
      <div className="painel-grade painel-grade-2" style={{ marginBottom: 18 }}>
        <div className="painel">
          <div className="painel-cabecalho"><div><h2>Dados gerais</h2></div></div>
          <div className="detalhe-campos">
            <div className="detalhe-campo"><label>Número</label><span style={{ fontFamily: "monospace" }}>{acao.numero}</span></div>
            <div className="detalhe-campo"><label>Status</label><span><Status valor={acao.status as StatusAcao} /></span></div>
            <div className="detalhe-campo"><label>Data início</label><span>{formatarDataCurta(acao.data.toISOString().slice(0, 10))}</span></div>
            <div className="detalhe-campo"><label>Data fim</label><span>{acao.dataFim ? formatarDataCurta(acao.dataFim.toISOString().slice(0, 10)) : <em style={{ color: "var(--cor-texto-3)" }}>Não informado</em>}</span></div>
            <div className="detalhe-campo"><label>Horário</label><span>{acao.horario}</span></div>
            <div className="detalhe-campo"><label>Distribuidora</label><span>{acao.distribuidora?.nome ?? <em style={{ color: "var(--cor-texto-3)" }}>Ação avulsa</em>}</span></div>
            <div className="detalhe-campo"><label>Estabelecimento</label><span>{nomeEstab}</span></div>
            {acao.observacoes && (
              <div className="detalhe-campo" style={{ gridColumn: "1/-1" }}>
                <label>Observações</label>
                <span style={{ whiteSpace: "pre-wrap" }}>{acao.observacoes}</span>
              </div>
            )}
          </div>
        </div>

        {/* Degustadoras resumo */}
        <div className="painel">
          <div className="painel-cabecalho">
            <div><h2>Degustadoras</h2><p>{acao.acaoDegustadoras.length} agendamento(s)</p></div>
            <Link href={`/acoes/${acao.id}/degustadoras`} className="bt-link" style={{ fontSize: 11 }}>
              Ver todas →
            </Link>
          </div>
          {acao.acaoDegustadoras.length > 0 ? (
            <div className="tabela-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Data</th>
                    <th>Horário</th>
                  </tr>
                </thead>
                <tbody>
                  {acao.acaoDegustadoras.slice(0, 5).map((d) => (
                    <tr key={d.id}>
                      <td>{d.degustadora.nome}</td>
                      <td>{formatarDataCurta(d.dataTrabalho.toISOString().slice(0, 10))}</td>
                      <td>{d.horaInicio} – {d.horaFim}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="estado-vazio" style={{ minHeight: 80 }}>
              <span>Nenhuma degustadora vinculada</span>
            </div>
          )}
        </div>
      </div>

      {/* Histórico de status */}
      {historico.length > 0 && (
        <div className="painel" style={{ marginBottom: 18 }}>
          <div className="painel-cabecalho">
            <div><h2>Histórico de alterações</h2><p>{historico.length} registro(s)</p></div>
          </div>
          <div className="tabela-wrap">
            <table>
              <thead>
                <tr>
                  <th>Data / hora</th>
                  <th>Operação</th>
                  <th>De</th>
                  <th>Para</th>
                  <th>Responsável</th>
                </tr>
              </thead>
              <tbody>
                {historico.map((h) => {
                  const anterior = (h.estadoAnterior as { status?: string } | null)?.status ?? "—";
                  const posterior = (h.estadoPosterior as { status?: string } | null)?.status ?? "—";
                  return (
                    <tr key={h.id}>
                      <td style={{ fontFamily: "monospace", fontSize: 12 }}>
                        {formatData(h.criadoEm)}
                      </td>
                      <td>{h.operacao}</td>
                      <td>{anterior}</td>
                      <td>{posterior}</td>
                      <td>{h.autor.name}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Produtos */}
      <div className="painel" style={{ marginBottom: 18 }}>
        <div className="painel-cabecalho"><div><h2>Produtos planejados</h2><p>{acao.produtos.length} produto(s)</p></div></div>
        {acao.produtos.length > 0 ? (
          <div className="tabela-wrap">
            <table>
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Unidade</th>
                  <th style={{ textAlign: "right" }}>Quantidade</th>
                  <th style={{ textAlign: "right" }}>Preço unit.</th>
                  <th style={{ textAlign: "right" }}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {acao.produtos.map((p) => (
                  <tr key={p.id}>
                    <td><strong>{p.produto.nome}</strong></td>
                    <td>{p.produto.unidade}</td>
                    <td style={{ textAlign: "right" }}>{p.quantidadePlanejada}</td>
                    <td style={{ textAlign: "right" }}>{formatarMoeda(Number(p.preco))}</td>
                    <td style={{ textAlign: "right" }}>{formatarMoeda(p.quantidadePlanejada * Number(p.preco))}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={4} style={{ textAlign: "right", fontWeight: 700 }}>Total</td>
                  <td style={{ textAlign: "right", fontWeight: 700 }}>{formatarMoeda(totalProdutos)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <div className="estado-vazio" style={{ minHeight: 80 }}>
            <span>Nenhum produto planejado</span>
          </div>
        )}
      </div>
    </div>
  );
}
