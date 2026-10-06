export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit3 } from "lucide-react";
import { CabecalhoPagina } from "@/componentes/compartilhados/cabecalho-pagina";
import { Status } from "@/componentes/ui/status";
import { formatarDataCurta } from "@/lib/formatadores";
import { prisma } from "@/lib/prisma";

export default async function DetalheAcaoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const acao = await prisma.acao.findUnique({
    where: { id },
    include: {
      distribuidora: true,
      estabelecimento: true,
      profissionais: { include: { degustadora: true } },
      produtos: { include: { produto: true } },
    },
  });

  if (!acao) notFound();

  const nomeEstab = acao.estabelecimentoId && acao.estabelecimento
    ? acao.estabelecimento.nomeFantasia ?? acao.estabelecimento.razaoSocial
    : acao.estabelecimentoAvulso ?? "Não informado";

  return (
    <div className="pagina-conteudo">
      <div style={{ marginBottom: 20 }}>
        <Link href="/acoes" style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--muted)", fontSize: 11 }}>
          <ArrowLeft size={14} /> Voltar às ações
        </Link>
      </div>

      <CabecalhoPagina
        etiqueta="Ações"
        titulo={acao.titulo}
        descricao={`${acao.id} · ${acao.horario}`}
        acao={
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Link href={`/acoes/${acao.id}/editar`} className="bt-secundario">
              <Edit3 size={14} /> Editar
            </Link>
          </div>
        }
      />

      <div className="painel-grade painel-grade-2" style={{ marginBottom: 18 }}>
        <div className="painel">
          <div className="painel-cabecalho"><div><h2>Informações gerais</h2></div></div>
          <div className="detalhe-campos">
            <div className="detalhe-campo"><label>Data</label><span>{formatarDataCurta(acao.data.toISOString().slice(0, 10))}</span></div>
            <div className="detalhe-campo"><label>Horário</label><span>{acao.horario}</span></div>
            <div className="detalhe-campo"><label>Status</label><span><Status valor={acao.status} /></span></div>
            <div className="detalhe-campo"><label>Distribuidora</label><span>{acao.distribuidora?.nome ?? <em style={{ color: "var(--muted)" }}>Ação avulsa</em>}</span></div>
            <div className="detalhe-campo"><label>Estabelecimento</label><span>{nomeEstab}</span></div>
          </div>
        </div>

        <div className="painel">
          <div className="painel-cabecalho"><div><h2>Profissionais</h2><p>{acao.profissionais.length} profissional(is)</p></div></div>
          {acao.profissionais.length > 0 ? (
            <div className="tabela-wrap">
              <table>
                <thead><tr><th>Nome</th><th>Tipo</th></tr></thead>
                <tbody>
                  {acao.profissionais.map((p) => (
                    <tr key={p.id}>
                      <td>{p.degustadora?.nome ?? p.nomeAvulso ?? "—"}</td>
                      <td><span className={p.degustadoraId ? "tag tag-ativo" : "tag tag-inativo"}>{p.degustadoraId ? "Cadastrada" : "Avulsa"}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="estado-vazio" style={{ minHeight: 100 }}><span>Nenhum profissional vinculado</span></div>
          )}
        </div>
      </div>

      <div className="painel" style={{ marginBottom: 18 }}>
        <div className="painel-cabecalho"><div><h2>Produtos planejados</h2><p>{acao.produtos.length} produto(s)</p></div></div>
        {acao.produtos.length > 0 ? (
          <div className="tabela-wrap">
            <table>
              <thead><tr><th>Produto</th><th>Quantidade planejada</th></tr></thead>
              <tbody>
                {acao.produtos.map((p) => (
                  <tr key={p.id}>
                    <td>{p.produto.nome}</td>
                    <td>{p.quantidadePlanejada.toString()} {p.produto.unidade}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="estado-vazio" style={{ minHeight: 80 }}><span>Nenhum produto planejado</span></div>
        )}
      </div>

      <div className="limite-pendente" role="note">Encerramento, cancelamento, reabertura e exclusão estão indisponíveis até a validação do checkout e de seus efeitos em estoque e financeiro.</div>
    </div>
  );
}
