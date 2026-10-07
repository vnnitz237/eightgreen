export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { CabecalhoPagina } from "@/componentes/compartilhados/cabecalho-pagina";
import { criarMerchan } from "@/lib/actions/merchan";
import { prisma } from "@/lib/prisma";

export default async function NovoMerchanPage() {
  const [estabelecimentos, promotores] = await Promise.all([
    prisma.estabelecimento.findMany({ where: { ativo: true }, orderBy: { razaoSocial: "asc" }, select: { id: true, razaoSocial: true } }),
    prisma.usuario.findMany({ where: { ativo: true }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  async function criar(fd: FormData) {
    "use server";
    const res = await criarMerchan(fd);
    if (res.ok) redirect(`/merchan/${res.id}`);
  }

  return (
    <div className="pagina-conteudo">
      <CabecalhoPagina etiqueta="Merchan" titulo="Nova visita" descricao="Registre uma visita de merchandising." />

      <div className="painel">
        <div className="painel-cabecalho"><div><h2>Dados da visita</h2></div></div>
        <form action={criar} className="form-completo" style={{ padding: "14px 19px" }}>
          <div className="form-completo-grupo">
            <label>
              Estabelecimento *
              <select name="estabelecimentoId" required>
                <option value="">— Selecionar —</option>
                {estabelecimentos.map((e) => <option key={e.id} value={e.id}>{e.razaoSocial}</option>)}
              </select>
            </label>
            <label>
              Promotor
              <select name="promotorId">
                <option value="">— Selecionar —</option>
                {promotores.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </label>
            <label>
              Data *
              <input name="data" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} />
            </label>
          </div>
          <div className="form-completo-grupo">
            <label>
              Hora de entrada
              <input name="horaEntrada" type="time" />
            </label>
            <label>
              Hora de saída
              <input name="horaSaida" type="time" />
            </label>
            <label>
              Checklist OK?
              <select name="checklistOk">
                <option value="false">Não</option>
                <option value="true">Sim</option>
              </select>
            </label>
          </div>
          <div className="form-completo-grupo">
            <label style={{ gridColumn: "1/-1" }}>
              Observações
              <textarea name="observacoes" rows={3} placeholder="Observações da visita…" />
            </label>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="submit" className="botao">Registrar visita</button>
            <a href="/merchan" className="bt-secundario">Cancelar</a>
          </div>
        </form>
      </div>
    </div>
  );
}
