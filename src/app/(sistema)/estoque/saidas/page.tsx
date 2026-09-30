export const dynamic = "force-dynamic";

import { CabecalhoPagina } from "@/componentes/compartilhados/cabecalho-pagina";
import { listarMovimentacoes } from "@/funcionalidades/estoque/consultas";
import { listarProdutos } from "@/funcionalidades/cadastros/consultas";
import { registrarMovimentacao } from "@/funcionalidades/estoque/actions";
import { formatarDataCurta, formatarInteiro } from "@/lib/formatadores";

export default async function SaidasPage() {
  const [movimentacoes, produtos] = await Promise.all([
    listarMovimentacoes(),
    listarProdutos(),
  ]);
  const saidas = movimentacoes.filter((m) => m.tipo === "saida");

  return (
    <div className="pagina-conteudo">
      <CabecalhoPagina etiqueta="Estoque" titulo="Saídas de estoque" descricao="Registre e consulte saídas de produtos." />

      <div className="painel">
        <div className="painel-cabecalho">
          <div><h2>Histórico de saídas</h2><p>{saidas.length} registro(s)</p></div>
        </div>

        {saidas.length > 0 ? (
          <div className="tabela-wrap">
            <table>
              <thead><tr><th>Produto</th><th>Quantidade</th><th>Observação</th><th>Data</th></tr></thead>
              <tbody>
                {saidas.map((m) => (
                  <tr key={m.id}>
                    <td><strong>{m.produto.nome}</strong></td>
                    <td>-{formatarInteiro(m.quantidade)}</td>
                    <td>{m.observacao ?? <span style={{ color: "var(--muted)" }}>—</span>}</td>
                    <td>{formatarDataCurta(m.criadoEm.toISOString().slice(0, 10))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="estado-vazio"><strong>Nenhuma saída registrada</strong></div>
        )}

        <form className="form-criar" action={registrarMovimentacao}>
          <input type="hidden" name="tipo" value="saida" />
          <label>
            Produto
            <select name="produtoId" required>
              <option value="">Selecione...</option>
              {produtos.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
            </select>
          </label>
          <label>Quantidade<input name="quantidade" type="number" min="1" required defaultValue="1" style={{ width: 100 }} /></label>
          <label>Observação (opcional)<input name="observacao" placeholder="Ex: Distribuição ação AC-1058" /></label>
          <button type="submit">Registrar saída</button>
        </form>
      </div>
    </div>
  );
}
