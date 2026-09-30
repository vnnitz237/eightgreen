export const dynamic = "force-dynamic";

import { CabecalhoPagina } from "@/componentes/compartilhados/cabecalho-pagina";
import { listarFornecedores } from "@/funcionalidades/cadastros/consultas";
import { criarFornecedor, toggleAtivoFornecedor } from "@/funcionalidades/cadastros/actions";

export default async function FornecedoresPage() {
  const itens = await listarFornecedores();

  return (
    <div className="pagina-conteudo">
      <CabecalhoPagina etiqueta="Cadastros" titulo="Fornecedores" descricao={`${itens.length} fornecedor(es) cadastrado(s)`} />

      <div className="painel">
        <div className="painel-cabecalho">
          <div><h2>Lista de fornecedores</h2></div>
        </div>

        {itens.length > 0 ? (
          <div className="tabela-wrap">
            <table>
              <thead><tr><th>Nome</th><th>Status</th><th>Ação</th></tr></thead>
              <tbody>
                {itens.map((item) => (
                  <tr key={item.id}>
                    <td><strong>{item.nome}</strong><small>{item.id}</small></td>
                    <td><span className={item.ativo ? "tag tag-ativo" : "tag tag-inativo"}>{item.ativo ? "Ativo" : "Inativo"}</span></td>
                    <td>
                      <form action={toggleAtivoFornecedor.bind(null, item.id, !item.ativo)}>
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
          <div className="estado-vazio"><strong>Nenhum fornecedor cadastrado</strong></div>
        )}

        <form className="form-criar" action={criarFornecedor}>
          <label>Nome<input name="nome" required placeholder="Nome do fornecedor" /></label>
          <button type="submit">Adicionar</button>
        </form>
      </div>
    </div>
  );
}
