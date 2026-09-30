export const dynamic = "force-dynamic";

import { CabecalhoPagina } from "@/componentes/compartilhados/cabecalho-pagina";
import { listarGruposProduto } from "@/funcionalidades/cadastros/consultas";
import { criarGrupoProduto } from "@/funcionalidades/cadastros/actions";

export default async function GruposPage() {
  const itens = await listarGruposProduto();

  return (
    <div className="pagina-conteudo">
      <CabecalhoPagina etiqueta="Cadastros" titulo="Grupos de produtos" descricao={`${itens.length} grupo(s) cadastrado(s)`} />

      <div className="painel">
        <div className="painel-cabecalho">
          <div><h2>Lista de grupos</h2></div>
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
          <div className="estado-vazio"><strong>Nenhum grupo cadastrado</strong></div>
        )}

        <form className="form-criar" action={criarGrupoProduto}>
          <label>Nome<input name="nome" required placeholder="Ex: Bebidas, Snacks..." /></label>
          <button type="submit">Adicionar</button>
        </form>
      </div>
    </div>
  );
}
