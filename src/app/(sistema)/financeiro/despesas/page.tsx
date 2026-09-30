export const dynamic = "force-dynamic";

import { CabecalhoPagina } from "@/componentes/compartilhados/cabecalho-pagina";
import { listarDespesas } from "@/funcionalidades/financeiro/consultas";
import { criarDespesa } from "@/funcionalidades/financeiro/actions";
import { formatarDataCurta, formatarMoeda } from "@/lib/formatadores";

export default async function DespesasPage() {
  const despesas = await listarDespesas();
  const total = despesas.reduce((s, d) => s + Number(d.valor), 0);

  return (
    <div className="pagina-conteudo">
      <CabecalhoPagina
        etiqueta="Financeiro"
        titulo="Despesas operacionais"
        descricao={`${despesas.length} registro(s) · Total: ${formatarMoeda(total)}`}
      />

      <div className="painel">
        <div className="painel-cabecalho">
          <div><h2>Histórico de despesas</h2><p>Total acumulado: {formatarMoeda(total)}</p></div>
        </div>

        {despesas.length > 0 ? (
          <div className="tabela-wrap">
            <table>
              <thead><tr><th>Descrição</th><th>Valor</th><th>Data</th></tr></thead>
              <tbody>
                {despesas.map((d) => (
                  <tr key={d.id}>
                    <td><strong>{d.descricao}</strong></td>
                    <td style={{ color: "var(--amarelo)", fontWeight: 700 }}>{formatarMoeda(Number(d.valor))}</td>
                    <td>{formatarDataCurta(d.data.toISOString().slice(0, 10))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="estado-vazio"><strong>Nenhuma despesa registrada</strong></div>
        )}

        <form className="form-criar" action={criarDespesa}>
          <label>Descrição<input name="descricao" required placeholder="Ex: Combustível, Material..." /></label>
          <label>Valor<input name="valor" type="number" step="0.01" min="0.01" required placeholder="0,00" style={{ width: 110 }} /></label>
          <label>Data<input name="data" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} /></label>
          <button type="submit">Registrar despesa</button>
        </form>
      </div>
    </div>
  );
}
