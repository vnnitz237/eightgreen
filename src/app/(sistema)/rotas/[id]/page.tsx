export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { CabecalhoPagina } from "@/componentes/compartilhados/cabecalho-pagina";
import { obterRota, atualizarStatusRota, marcarParadaVisitada } from "@/lib/actions/merchan";
import { formatarDataCurta } from "@/lib/formatadores";

type Params = Promise<{ id: string }>;

const corStatus: Record<string, string> = {
  PENDENTE: "cinza",
  EM_ANDAMENTO: "azul",
  CONCLUIDA: "verde",
  CANCELADA: "vermelho",
};

const labelStatus: Record<string, string> = {
  PENDENTE: "Pendente",
  EM_ANDAMENTO: "Em andamento",
  CONCLUIDA: "Concluída",
  CANCELADA: "Cancelada",
};

export default async function RotaDetalhePage({ params }: { params: Params }) {
  const { id } = await params;
  const rota = await obterRota(id);
  if (!rota) notFound();

  const rotaId = rota.id;

  async function iniciar(_: FormData) {
    "use server";
    await atualizarStatusRota(rotaId, "EM_ANDAMENTO");
  }

  async function concluir(_: FormData) {
    "use server";
    await atualizarStatusRota(rotaId, "CONCLUIDA");
  }

  async function cancelar(_: FormData) {
    "use server";
    await atualizarStatusRota(rotaId, "CANCELADA");
  }

  const visitadas = rota.paradas.filter((p) => p.visitado).length;

  return (
    <div className="pagina-conteudo">
      <CabecalhoPagina
        etiqueta="Equipe"
        titulo={rota.nome || rota.descricao}
        descricao={`${formatarDataCurta(rota.data.toISOString().slice(0, 10))} · ${visitadas}/${rota.paradas.length} paradas`}
        acao={
          <Link href={`/rotas/${id}/editar`} className="bt-secundario">Editar</Link>
        }
      />

      {/* Status e ações */}
      <div className="painel" style={{ marginBottom: 18 }}>
        <div className="painel-cabecalho">
          <div>
            <h2>Status</h2>
            <p><span className={`tag tag-${corStatus[rota.status] ?? "cinza"}`}>{labelStatus[rota.status] ?? rota.status}</span></p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {rota.status === "PENDENTE" && (
              <form action={iniciar}><button type="submit" className="botao">Iniciar</button></form>
            )}
            {rota.status === "EM_ANDAMENTO" && (
              <>
                <form action={concluir}><button type="submit" className="botao">Concluir</button></form>
                <form action={cancelar}><button type="submit" className="bt-danger">Cancelar</button></form>
              </>
            )}
          </div>
        </div>

        <div className="detalhe-campos" style={{ padding: "14px 19px" }}>
          {rota.promotor && (
            <div className="detalhe-campo">
              <span>Promotor</span>
              <strong>{rota.promotor.name}</strong>
            </div>
          )}
          {rota.observacoes && (
            <div className="detalhe-campo" style={{ gridColumn: "1/-1" }}>
              <span>Observações</span>
              <p style={{ margin: 0 }}>{rota.observacoes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Paradas */}
      <div className="painel">
        <div className="painel-cabecalho">
          <div><h2>Paradas</h2><p>{visitadas}/{rota.paradas.length} visitadas</p></div>
        </div>

        {rota.paradas.length > 0 ? (
          <div className="tabela-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Estabelecimento</th>
                  <th>Checklist</th>
                  <th>Horário</th>
                  <th>Situação</th>
                  <th aria-label="Ações" />
                </tr>
              </thead>
              <tbody>
                {rota.paradas.map((p) => {
                  const paradaId = p.id;
                  async function marcar(fd: FormData) {
                    "use server";
                    await marcarParadaVisitada(paradaId, !p.visitado);
                  }
                  return (
                    <tr key={p.id} style={{ opacity: p.visitado ? 0.7 : 1 }}>
                      <td><span style={{ fontFamily: "monospace" }}>{p.ordem + 1}</span></td>
                      <td><strong>{p.estabelecimento.razaoSocial}</strong></td>
                      <td>
                        {p.merchan
                          ? <span className={`tag tag-${p.merchan.checklistOk ? "verde" : "amarelo"}`}>{p.merchan.checklistOk ? "OK" : "Parcial"}</span>
                          : <span style={{ color: "var(--cor-texto-3)" }}>—</span>}
                      </td>
                      <td>
                        {p.merchan?.horaEntrada
                          ? `${p.merchan.horaEntrada}${p.merchan.horaSaida ? ` – ${p.merchan.horaSaida}` : ""}`
                          : <span style={{ color: "var(--cor-texto-3)" }}>—</span>}
                      </td>
                      <td>
                        <span className={`tag tag-${p.visitado ? "verde" : "cinza"}`}>
                          {p.visitado ? "Visitado" : "Pendente"}
                        </span>
                      </td>
                      <td style={{ display: "flex", gap: 6 }}>
                        {p.merchan
                          ? <Link href={`/merchan/${p.merchan.id}`} className="bt-link" style={{ fontSize: 12 }}>Ver</Link>
                          : <Link href={`/merchan/novo`} className="bt-link" style={{ fontSize: 12 }}>Registrar</Link>}
                        <form action={marcar} style={{ display: "inline" }}>
                          <button type="submit" className="bt-link" style={{ fontSize: 12 }}>
                            {p.visitado ? "Desmarcar" : "Marcar"}
                          </button>
                        </form>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="estado-vazio" style={{ minHeight: 60 }}>
            <span>Nenhuma parada cadastrada.</span>
          </div>
        )}
      </div>
    </div>
  );
}
