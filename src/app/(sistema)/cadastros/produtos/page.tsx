export const dynamic = "force-dynamic";

import { CabecalhoPagina } from "@/componentes/compartilhados/cabecalho-pagina";
import { listarProdutos, listarGruposProduto } from "@/funcionalidades/cadastros/consultas";
import { criarProduto, toggleAtivoProduto } from "@/funcionalidades/cadastros/actions";

export default async function ProdutosPage() {
  const [itens, grupos] = await Promise.all([listarProdutos(), listarGruposProduto()]);

  return (
    <div className="pagina-conteudo">
      <CabecalhoPagina etiqueta="Cadastros" titulo="Produtos" descricao={`${itens.length} produto(s) cadastrado(s)`} />

      <div className="painel">
        <div className="painel-cabecalho">
          <div><h2>Lista de produtos</h2></div>
        </div>

        {itens.length > 0 ? (
          <div className="tabela-wrap">
            <table>
              <thead><tr><th>Nome</th><th>Unidade</th><th>Estoque mínimo</th><th>Grupo</th><th>Status</th><th>Ação</th></tr></thead>
              <tbody>
                {itens.map((item) => (
                  <tr key={item.id}>
                    <td><strong>{item.nome}</strong><small>{item.id}</small></td>
                    <td>{item.unidade}</td>
                    <td>{item.estoqueMinimo}</td>
                    <td>{item.grupo?.nome ?? <span style={{ color: "var(--muted)" }}>—</span>}</td>
                    <td><span className={item.ativo ? "tag tag-ativo" : "tag tag-inativo"}>{item.ativo ? "Ativo" : "Inativo"}</span></td>
                    <td>
                      <form action={toggleAtivoProduto.bind(null, item.id, !item.ativo)}>
                        <button type="submit" style={{ border: 0, background: "transparent", color: "var(--verde-700)", fontSize: 10, fontWeight: 700, cursor: "pointer" }}>
                          {item.ativo ? "Desativar" : "Ativar"}
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="estado-vazio"><strong>Nenhum produto cadastrado</strong></div>
        )}

        <form className="form-criar" action={criarProduto}>
          <label>Nome<input name="nome" required placeholder="Nome do produto" /></label>
          <label>Unidade<input name="unidade" defaultValue="un" style={{ width: 70 }} /></label>
          <label>Estoque mínimo<input name="estoqueMinimo" type="number" min="0" defaultValue="0" style={{ width: 110 }} /></label>
          <label>
            Grupo
            <select name="grupoId">
              <option value="">Sem grupo</option>
              {grupos.map((g) => <option key={g.id} value={g.id}>{g.nome}</option>)}
            </select>
          </label>
          <button type="submit">Adicionar</button>
        </form>
      </div>
    </div>
  );
}
