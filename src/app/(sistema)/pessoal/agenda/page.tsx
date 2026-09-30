export const dynamic = "force-dynamic";

import { CabecalhoPagina } from "@/componentes/compartilhados/cabecalho-pagina";
import { criarCompromisso, listarCompromissos } from "@/funcionalidades/pessoal/actions";
import { formatarDataCurta } from "@/lib/formatadores";

export default async function AgendaPage() {
  const compromissos = await listarCompromissos();
  const hoje = new Date().toISOString().slice(0, 10);
  const futuros = compromissos.filter((c) => c.data.toISOString().slice(0, 10) >= hoje);
  const passados = compromissos.filter((c) => c.data.toISOString().slice(0, 10) < hoje);

  return (
    <div className="pagina-conteudo">
      <CabecalhoPagina etiqueta="Pessoal" titulo="Agenda" descricao={`${futuros.length} compromisso(s) futuros`} />

      <div className="painel" style={{ marginBottom: 18 }}>
        <div className="painel-cabecalho">
          <div><h2>Próximos compromissos</h2><p>{futuros.length} item(s)</p></div>
        </div>

        {futuros.length > 0 ? (
          <div className="tabela-wrap">
            <table>
              <thead><tr><th>Título</th><th>Data</th><th>Horário</th><th>Privado</th></tr></thead>
              <tbody>
                {futuros.map((c) => (
                  <tr key={c.id}>
                    <td><strong>{c.titulo}</strong></td>
                    <td>{formatarDataCurta(c.data.toISOString().slice(0, 10))}</td>
                    <td>{c.horario ?? <span style={{ color: "var(--muted)" }}>—</span>}</td>
                    <td><span className={c.privado ? "tag tag-inativo" : "tag tag-ativo"}>{c.privado ? "Privado" : "Público"}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="estado-vazio"><strong>Nenhum compromisso futuro</strong></div>
        )}

        <form className="form-criar" action={criarCompromisso}>
          <label>Título<input name="titulo" required placeholder="Ex: Reunião com distribuidora" /></label>
          <label>Data<input name="data" type="date" required defaultValue={hoje} /></label>
          <label>Horário (opcional)<input name="horario" type="time" /></label>
          <label style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <input type="checkbox" name="privado" value="true" defaultChecked />
            Privado
          </label>
          <button type="submit">Adicionar</button>
        </form>
      </div>

      {passados.length > 0 && (
        <div className="painel">
          <div className="painel-cabecalho">
            <div><h2>Compromissos passados</h2><p>{passados.length} item(s)</p></div>
          </div>
          <div className="tabela-wrap">
            <table>
              <thead><tr><th>Título</th><th>Data</th><th>Horário</th></tr></thead>
              <tbody>
                {passados.map((c) => (
                  <tr key={c.id} style={{ opacity: 0.6 }}>
                    <td><strong>{c.titulo}</strong></td>
                    <td>{formatarDataCurta(c.data.toISOString().slice(0, 10))}</td>
                    <td>{c.horario ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
