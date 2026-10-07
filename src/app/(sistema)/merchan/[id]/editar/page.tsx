export const dynamic = "force-dynamic";

import { redirect, notFound } from "next/navigation";
import { CabecalhoPagina } from "@/componentes/compartilhados/cabecalho-pagina";
import { obterMerchan, editarMerchan } from "@/lib/actions/merchan";
import { prisma } from "@/lib/prisma";
import { UploadFotos } from "@/componentes/merchan/UploadFotos";

type Params = Promise<{ id: string }>;

export default async function EditarMerchanPage({ params }: { params: Params }) {
  const { id } = await params;
  const [visita, estabelecimentos, promotores] = await Promise.all([
    obterMerchan(id),
    prisma.estabelecimento.findMany({ where: { ativo: true }, orderBy: { razaoSocial: "asc" }, select: { id: true, razaoSocial: true } }),
    prisma.usuario.findMany({ where: { ativo: true }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!visita) notFound();

  const visitaId = visita.id;
  async function salvar(fd: FormData) {
    "use server";
    const res = await editarMerchan(visitaId, fd);
    if (res.ok) redirect(`/merchan/${visitaId}`);
  }

  return (
    <div className="pagina-conteudo">
      <CabecalhoPagina etiqueta="Merchan" titulo="Editar visita" descricao={visita.estabelecimento?.razaoSocial ?? ""} />

      <div className="painel">
        <div className="painel-cabecalho"><div><h2>Dados da visita</h2></div></div>
        <form action={salvar} className="form-completo" style={{ padding: "14px 19px" }}>
          <div className="form-completo-grupo">
            <label>
              Estabelecimento *
              <select name="estabelecimentoId" required defaultValue={visita.estabelecimentoId ?? ""}>
                <option value="">— Selecionar —</option>
                {estabelecimentos.map((e) => <option key={e.id} value={e.id}>{e.razaoSocial}</option>)}
              </select>
            </label>
            <label>
              Promotor
              <select name="promotorId" defaultValue={visita.promotorId ?? ""}>
                <option value="">— Selecionar —</option>
                {promotores.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </label>
            <label>
              Data *
              <input name="data" type="date" required defaultValue={visita.data.toISOString().slice(0, 10)} />
            </label>
          </div>
          <div className="form-completo-grupo">
            <label>
              Hora de entrada
              <input name="horaEntrada" type="time" defaultValue={visita.horaEntrada ?? ""} />
            </label>
            <label>
              Hora de saída
              <input name="horaSaida" type="time" defaultValue={visita.horaSaida ?? ""} />
            </label>
            <label>
              Checklist OK?
              <select name="checklistOk" defaultValue={visita.checklistOk ? "true" : "false"}>
                <option value="false">Não</option>
                <option value="true">Sim</option>
              </select>
            </label>
          </div>
          <div className="form-completo-grupo">
            <label style={{ gridColumn: "1/-1" }}>
              Observações
              <textarea name="observacoes" rows={3} defaultValue={visita.observacoes ?? ""} placeholder="Observações da visita…" />
            </label>
          </div>
          <div className="form-completo-grupo">
            <label style={{ gridColumn: "1/-1" }}>
              Fotos
              <UploadFotos fotosIniciais={visita.fotos} />
            </label>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="submit" className="botao">Salvar alterações</button>
            <a href={`/merchan/${id}`} className="bt-secundario">Cancelar</a>
          </div>
        </form>
      </div>
    </div>
  );
}
