export const dynamic = "force-dynamic";

import { CabecalhoPagina } from "@/componentes/compartilhados/cabecalho-pagina";
import { listarDistribuidoras } from "@/funcionalidades/cadastros/consultas";
import { criarDistribuidora, toggleAtivoDistribuidora } from "@/funcionalidades/cadastros/actions";

export default async function DistribuidorasPage() {
  const itens = await listarDistribuidoras();

  return (
    <div className="pagina-conteudo">
      <CabecalhoPagina etiqueta="Cadastros" titulo="Distribuidoras" descricao={`${itens.length} distribuidora(s) cadastrada(s)`} />

      <div className="painel">
        <div className="painel-cabecalho">
          <div><h2>Lista de distribuidoras</h2><p>Gerencie as distribuidoras parceiras</p></div>
        </div>

        {itens.length > 0 ? (
          <div className="tabela-wrap">
            <table>
              <thead>
                <tr><th>Nome</th><th>Status</th><th>Ação</th></tr>
              </thead>
              <tbody>
                {itens.map((item) => (
                  <tr key={item.id}>
                    <td><strong>{item.nome}</strong><small>{item.id}</small></td>
                    <td><span className={item.ativo ? "tag tag-ativo" : "tag tag-inativo"}>{item.ativo ? "Ativo" : "Inativo"}</span></td>
                    <td>
                      <form action={toggleAtivoDistribuidora.bind(null, item.id, !item.ativo)}>
                        <button type="submit" className="bt-link" style={{ border: 0, background: "transparent", color: "var(--verde-700)", fontSize: 10, fontWeight: 700, cursor: "pointer" }}>
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
          <div className="estado-vazio"><strong>Nenhuma distribuidora cadastrada</strong></div>
        )}

        <form className="form-criar" action={criarDistribuidora}>
          <label>Nome<input name="nome" required placeholder="Nome da distribuidora" /></label>
          <button type="submit">Adicionar</button>
        </form>
      </div>
    </div>
  );
}
