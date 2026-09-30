export const dynamic = "force-dynamic";

import { CabecalhoPagina } from "@/componentes/compartilhados/cabecalho-pagina";
import { listarBancos } from "@/funcionalidades/cadastros/consultas";
import { criarBanco } from "@/funcionalidades/cadastros/actions";

export default async function BancosPage() {
  const itens = await listarBancos();

  return (
    <div className="pagina-conteudo">
      <CabecalhoPagina etiqueta="Cadastros" titulo="Bancos" descricao={`${itens.length} banco(s) cadastrado(s)`} />

      <div className="painel">
        <div className="painel-cabecalho">
          <div><h2>Lista de bancos</h2></div>
        </div>

        {itens.length > 0 ? (
          <div className="tabela-wrap">
            <table>
              <thead><tr><th>Nome</th><th>Código</th></tr></thead>
              <tbody>
                {itens.map((item) => (
                  <tr key={item.id}>
                    <td><strong>{item.nome}</strong><small>{item.id}</small></td>
                    <td>{item.codigo ?? <span style={{ color: "var(--muted)" }}>—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="estado-vazio"><strong>Nenhum banco cadastrado</strong></div>
        )}

        <form className="form-criar" action={criarBanco}>
          <label>Nome<input name="nome" required placeholder="Ex: Banco do Brasil" /></label>
          <label>Código (opcional)<input name="codigo" placeholder="001" style={{ width: 90 }} /></label>
          <button type="submit">Adicionar</button>
        </form>
      </div>
    </div>
  );
}
