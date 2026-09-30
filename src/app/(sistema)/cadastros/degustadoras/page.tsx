export const dynamic = "force-dynamic";

import { CabecalhoPagina } from "@/componentes/compartilhados/cabecalho-pagina";
import { listarDegustadoras } from "@/funcionalidades/cadastros/consultas";
import { criarDegustadora, toggleAtivoDegustadora } from "@/funcionalidades/cadastros/actions";

export default async function DegustadorasPage() {
  const itens = await listarDegustadoras();

  return (
    <div className="pagina-conteudo">
      <CabecalhoPagina etiqueta="Cadastros" titulo="Degustadoras" descricao={`${itens.length} profissional(is) cadastrada(s)`} />

      <div className="painel">
        <div className="painel-cabecalho">
          <div><h2>Lista de degustadoras</h2><p>Profissionais de degustação</p></div>
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
                      <form action={toggleAtivoDegustadora.bind(null, item.id, !item.ativo)}>
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
          <div className="estado-vazio"><strong>Nenhuma degustadora cadastrada</strong></div>
        )}

        <form className="form-criar" action={criarDegustadora}>
          <label>Nome<input name="nome" required placeholder="Nome completo" /></label>
          <button type="submit">Adicionar</button>
        </form>
      </div>
    </div>
  );
}
