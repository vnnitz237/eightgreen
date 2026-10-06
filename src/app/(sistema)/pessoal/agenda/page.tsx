export const dynamic = "force-dynamic";

import { CabecalhoPagina } from "@/componentes/compartilhados/cabecalho-pagina";
import { listarCompromissos } from "@/funcionalidades/pessoal/actions";
import { formatarDataCurta } from "@/lib/formatadores";

export default async function AgendaPage() {
  const compromissos = await listarCompromissos();
  const hoje = new Date().toISOString().slice(0, 10);
  const futuros = compromissos.filter((c) => c.inicio.toISOString().slice(0, 10) >= hoje);
  const passados = compromissos.filter((c) => c.inicio.toISOString().slice(0, 10) < hoje);

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
              <thead><tr><th>Título</th><th>Início</th><th>Fim</th><th>Tipo</th></tr></thead>
              <tbody>
                {futuros.map((c) => (
                  <tr key={c.id}>
                    <td><strong>{c.titulo}</strong></td>
                    <td>{formatarDataCurta(c.inicio.toISOString().slice(0, 10))}</td>
                    <td>{c.diaInteiro ? <span style={{ color: "var(--cor-texto-3)" }}>Dia inteiro</span> : formatarDataCurta(c.fim.toISOString().slice(0, 10))}</td>
                    <td><span className="tag">{c.tipo}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="estado-vazio"><strong>Nenhum compromisso futuro</strong></div>
        )}
      </div>

      {passados.length > 0 && (
        <div className="painel">
          <div className="painel-cabecalho">
            <div><h2>Compromissos passados</h2><p>{passados.length} item(s)</p></div>
          </div>
          <div className="tabela-wrap">
            <table>
              <thead><tr><th>Título</th><th>Data</th><th>Tipo</th></tr></thead>
              <tbody>
                {passados.map((c) => (
                  <tr key={c.id} style={{ opacity: 0.6 }}>
                    <td><strong>{c.titulo}</strong></td>
                    <td>{formatarDataCurta(c.inicio.toISOString().slice(0, 10))}</td>
                    <td>{c.tipo}</td>
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
