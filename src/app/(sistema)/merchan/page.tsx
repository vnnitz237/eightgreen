export const dynamic = "force-dynamic";

import { CabecalhoPagina } from "@/componentes/compartilhados/cabecalho-pagina";
import { listarDistribuidoras, listarEstabelecimentos } from "@/funcionalidades/cadastros/consultas";
import { criarMerchan, listarMerchan } from "@/funcionalidades/merchan/actions";
import { formatarDataCurta } from "@/lib/formatadores";

export default async function MerchanPage() {
  const [visitas, distribuidoras, estabelecimentos] = await Promise.all([
    listarMerchan(),
    listarDistribuidoras(),
    listarEstabelecimentos(),
  ]);

  return (
    <div className="pagina-conteudo">
      <CabecalhoPagina etiqueta="Operação" titulo="Merchan" descricao={`${visitas.length} visita(s) de merchandising`} />

      <div className="painel">
        <div className="painel-cabecalho">
          <div><h2>Histórico de visitas</h2></div>
        </div>

        {visitas.length > 0 ? (
          <div className="tabela-wrap">
            <table>
              <thead><tr><th>Data</th><th>Distribuidora</th><th>Estabelecimento</th><th>Observação</th></tr></thead>
              <tbody>
                {visitas.map((v) => (
                  <tr key={v.id}>
                    <td>{formatarDataCurta(v.data.toISOString().slice(0, 10))}</td>
                    <td>{v.distribuidora?.nome ?? <span style={{ color: "var(--muted)" }}>—</span>}</td>
                    <td>
                      {(v.estabelecimento ? v.estabelecimento.nomeFantasia ?? v.estabelecimento.razaoSocial : null) ?? v.estabelecimentoAvulso ?? <span style={{ color: "var(--muted)" }}>—</span>}
                    </td>
                    <td>{v.observacao ?? <span style={{ color: "var(--muted)" }}>—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="estado-vazio"><strong>Nenhuma visita registrada</strong></div>
        )}

        <form className="form-criar" action={criarMerchan}>
          <label>Data<input name="data" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} /></label>
          <label>
            Distribuidora
            <select name="distribuidoraId">
              <option value="">Sem distribuidora</option>
              {distribuidoras.map((d) => <option key={d.id} value={d.id}>{d.nome}</option>)}
            </select>
          </label>
          <label>
            Estabelecimento
            <select name="estabelecimentoId">
              <option value="">Avulso / sem vínculo</option>
              {estabelecimentos.map((e) => <option key={e.id} value={e.id}>{e.nomeFantasia ?? e.razaoSocial}</option>)}
            </select>
          </label>
          <label>Local avulso<input name="estabelecimentoAvulso" placeholder="Se não cadastrado" /></label>
          <label>Observação<input name="observacao" placeholder="Opcional" /></label>
          <button type="submit">Registrar visita</button>
        </form>
      </div>
    </div>
  );
}
