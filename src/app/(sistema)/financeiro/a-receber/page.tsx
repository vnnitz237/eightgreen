export const dynamic = "force-dynamic";

import { CabecalhoPagina } from "@/componentes/compartilhados/cabecalho-pagina";
import { listarContasAReceber } from "@/funcionalidades/financeiro/consultas";
import { criarConta, marcarComoPago } from "@/funcionalidades/financeiro/actions";
import { formatarDataCurta, formatarMoeda } from "@/lib/formatadores";

export default async function AReceberPage() {
  const contas = await listarContasAReceber();
  const pendentes = contas.filter((c) => !c.pago);
  const recebidas = contas.filter((c) => c.pago);
  const totalPendente = pendentes.reduce((s, c) => s + Number(c.valor), 0);

  return (
    <div className="pagina-conteudo">
      <CabecalhoPagina
        etiqueta="Financeiro"
        titulo="Contas a receber"
        descricao={`${pendentes.length} pendente(s) · Total: ${formatarMoeda(totalPendente)}`}
      />

      <div className="painel">
        <div className="painel-cabecalho">
          <div><h2>Valores a receber</h2><p>{pendentes.length} conta(s) em aberto</p></div>
        </div>

        {pendentes.length > 0 ? (
          <div className="tabela-wrap">
            <table>
              <thead><tr><th>Descrição</th><th>Valor</th><th>Vencimento</th><th>Ação</th></tr></thead>
              <tbody>
                {pendentes.map((c) => (
                  <tr key={c.id}>
                    <td><strong>{c.descricao}</strong></td>
                    <td style={{ color: "var(--verde-700)", fontWeight: 700 }}>{formatarMoeda(Number(c.valor))}</td>
                    <td>{formatarDataCurta(c.vencimento.toISOString().slice(0, 10))}</td>
                    <td>
                      <form action={marcarComoPago.bind(null, c.id)}>
                        <button type="submit" style={{ border: 0, background: "transparent", color: "var(--verde-700)", fontSize: 10, fontWeight: 700, cursor: "pointer" }}>
                          Marcar recebido
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="estado-vazio"><strong>Nenhum valor pendente</strong></div>
        )}

        {recebidas.length > 0 && (
          <>
            <div style={{ padding: "12px 19px 8px", borderTop: "1px solid var(--linha)" }}>
              <p style={{ margin: 0, fontSize: 10, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em" }}>Recebidos</p>
            </div>
            <div className="tabela-wrap">
              <table>
                <thead><tr><th>Descrição</th><th>Valor</th><th>Vencimento</th><th>Status</th></tr></thead>
                <tbody>
                  {recebidas.map((c) => (
                    <tr key={c.id}>
                      <td><strong>{c.descricao}</strong></td>
                      <td>{formatarMoeda(Number(c.valor))}</td>
                      <td>{formatarDataCurta(c.vencimento.toISOString().slice(0, 10))}</td>
                      <td><span className="badge badge-pago">Recebido</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        <form className="form-criar" action={criarConta}>
          <input type="hidden" name="tipo" value="receber" />
          <label>Descrição<input name="descricao" required placeholder="Ex: Serviços distribuidora" /></label>
          <label>Valor<input name="valor" type="number" step="0.01" min="0.01" required placeholder="0,00" style={{ width: 110 }} /></label>
          <label>Vencimento<input name="vencimento" type="date" required /></label>
          <button type="submit">Adicionar</button>
        </form>
      </div>
    </div>
  );
}
