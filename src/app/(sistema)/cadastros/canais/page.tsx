export const dynamic = "force-dynamic";

import { CabecalhoPagina } from "@/componentes/compartilhados/cabecalho-pagina";
import { listarCanais } from "@/funcionalidades/cadastros/consultas";
import { criarCanal } from "@/funcionalidades/cadastros/actions";

export default async function CanaisPage() {
  const itens = await listarCanais();

  return (
    <div className="pagina-conteudo">
      <CabecalhoPagina etiqueta="Cadastros" titulo="Canais" descricao={`${itens.length} canal(is) cadastrado(s)`} />

      <div className="painel">
        <div className="painel-cabecalho">
          <div><h2>Lista de canais</h2></div>
        </div>

        {itens.length > 0 ? (
          <div className="tabela-wrap">
            <table>
              <thead><tr><th>Nome</th><th>ID</th></tr></thead>
              <tbody>
                {itens.map((item) => (
                  <tr key={item.id}>
                    <td><strong>{item.nome}</strong></td>
                    <td><small>{item.id}</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="estado-vazio"><strong>Nenhum canal cadastrado</strong></div>
        )}

        <form className="form-criar" action={criarCanal}>
          <label>Nome<input name="nome" required placeholder="Ex: Supermercado, Farmácia..." /></label>
          <button type="submit">Adicionar</button>
        </form>
      </div>
    </div>
  );
}
