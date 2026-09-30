export const dynamic = "force-dynamic";

import { CabecalhoPagina } from "@/componentes/compartilhados/cabecalho-pagina";
import { criarRota, listarRotas } from "@/funcionalidades/pessoal/actions";
import { formatarDataCurta } from "@/lib/formatadores";

export default async function RotasPage() {
  const rotas = await listarRotas();
  const hoje = new Date().toISOString().slice(0, 10);

  return (
    <div className="pagina-conteudo">
      <CabecalhoPagina etiqueta="Pessoal" titulo="Rotas" descricao={`${rotas.length} rota(s) cadastrada(s)`} />

      <div className="painel">
        <div className="painel-cabecalho">
          <div><h2>Histórico de rotas</h2></div>
        </div>

        {rotas.length > 0 ? (
          <div className="tabela-wrap">
            <table>
              <thead><tr><th>Descrição</th><th>Data</th></tr></thead>
              <tbody>
                {rotas.map((r) => (
                  <tr key={r.id}>
                    <td><strong>{r.descricao}</strong></td>
                    <td>{formatarDataCurta(r.data.toISOString().slice(0, 10))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="estado-vazio"><strong>Nenhuma rota cadastrada</strong></div>
        )}

        <form className="form-criar" action={criarRota}>
          <label>Descrição<input name="descricao" required placeholder="Ex: Visita zona norte" /></label>
          <label>Data<input name="data" type="date" required defaultValue={hoje} /></label>
          <button type="submit">Registrar rota</button>
        </form>
      </div>
    </div>
  );
}
