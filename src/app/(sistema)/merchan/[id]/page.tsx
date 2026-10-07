export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { CabecalhoPagina } from "@/componentes/compartilhados/cabecalho-pagina";
import { obterMerchan } from "@/lib/actions/merchan";
import { formatarDataCurta } from "@/lib/formatadores";

type Params = Promise<{ id: string }>;

export default async function MerchanDetalhePage({ params }: { params: Params }) {
  const { id } = await params;
  const visita = await obterMerchan(id);
  if (!visita) notFound();

  return (
    <div className="pagina-conteudo">
      <CabecalhoPagina
        etiqueta="Merchan"
        titulo={visita.estabelecimento?.razaoSocial ?? "Visita"}
        descricao={formatarDataCurta(visita.data.toISOString().slice(0, 10))}
        acao={
          <Link href={`/merchan/${id}/editar`} className="bt-secundario">Editar</Link>
        }
      />

      <div className="painel" style={{ marginBottom: 18 }}>
        <div className="painel-cabecalho"><div><h2>Detalhes</h2></div></div>
        <div className="detalhe-campos" style={{ padding: "14px 19px" }}>
          <div className="detalhe-campo">
            <span>Estabelecimento</span>
            <strong>{visita.estabelecimento?.razaoSocial ?? "—"}</strong>
          </div>
          <div className="detalhe-campo">
            <span>Promotor</span>
            <strong>{visita.promotor?.name ?? "—"}</strong>
          </div>
          <div className="detalhe-campo">
            <span>Data</span>
            <strong>{formatarDataCurta(visita.data.toISOString().slice(0, 10))}</strong>
          </div>
          <div className="detalhe-campo">
            <span>Entrada</span>
            <strong>{visita.horaEntrada ?? "—"}</strong>
          </div>
          <div className="detalhe-campo">
            <span>Saída</span>
            <strong>{visita.horaSaida ?? "—"}</strong>
          </div>
          <div className="detalhe-campo">
            <span>Checklist</span>
            <span className={`tag tag-${visita.checklistOk ? "verde" : "cinza"}`}>
              {visita.checklistOk ? "OK" : "Pendente"}
            </span>
          </div>
          {visita.latEntrada && visita.lngEntrada && (
            <div className="detalhe-campo">
              <span>GPS Entrada</span>
              <strong>{visita.latEntrada.toFixed(6)}, {visita.lngEntrada.toFixed(6)}</strong>
            </div>
          )}
          {visita.latSaida && visita.lngSaida && (
            <div className="detalhe-campo">
              <span>GPS Saída</span>
              <strong>{visita.latSaida.toFixed(6)}, {visita.lngSaida.toFixed(6)}</strong>
            </div>
          )}
          {visita.observacoes && (
            <div className="detalhe-campo" style={{ gridColumn: "1/-1" }}>
              <span>Observações</span>
              <p style={{ margin: 0 }}>{visita.observacoes}</p>
            </div>
          )}
        </div>
      </div>

      {visita.rotaParada && (
        <div className="painel">
          <div className="painel-cabecalho"><div><h2>Rota vinculada</h2></div></div>
          <div style={{ padding: "14px 19px" }}>
            <Link href={`/rotas/${visita.rotaParada.rotaId}`} className="bt-link">
              {visita.rotaParada.rota?.nome || visita.rotaParada.rota?.descricao || "Ver rota"}
            </Link>
            {" — parada #"}{visita.rotaParada.ordem + 1}
          </div>
        </div>
      )}

      {visita.fotos.length > 0 && (
        <div className="painel">
          <div className="painel-cabecalho"><div><h2>Fotos</h2></div></div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, padding: "14px 19px" }}>
            {visita.fotos.map((url, i) => (
              <img key={i} src={url} alt={`Foto ${i + 1}`} style={{ width: 120, height: 120, objectFit: "cover", borderRadius: 6 }} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
