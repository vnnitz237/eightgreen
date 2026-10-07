export const dynamic = "force-dynamic";

import { redirect, notFound } from "next/navigation";
import { CabecalhoPagina } from "@/componentes/compartilhados/cabecalho-pagina";
import { obterRota, editarRota } from "@/lib/actions/merchan";
import { prisma } from "@/lib/prisma";
import { RotaForm } from "@/componentes/rotas/RotaForm";

type Params = Promise<{ id: string }>;

export default async function EditarRotaPage({ params }: { params: Params }) {
  const { id } = await params;
  const [rota, estabelecimentos, promotores] = await Promise.all([
    obterRota(id),
    prisma.estabelecimento.findMany({ where: { ativo: true }, orderBy: { razaoSocial: "asc" }, select: { id: true, razaoSocial: true } }),
    prisma.usuario.findMany({ where: { ativo: true }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!rota) notFound();

  const rotaId = rota.id;
  async function salvar(fd: FormData) {
    "use server";
    const res = await editarRota(rotaId, fd);
    if (res.ok) redirect(`/rotas/${rotaId}`);
  }

  return (
    <div className="pagina-conteudo">
      <CabecalhoPagina etiqueta="Equipe" titulo="Editar rota" descricao={rota.nome || rota.descricao} />
      <RotaForm
        action={salvar}
        estabelecimentos={estabelecimentos}
        promotores={promotores}
        defaultValues={{
          nome: rota.nome,
          descricao: rota.descricao,
          data: rota.data.toISOString().slice(0, 10),
          promotorId: rota.promotorId ?? undefined,
          observacoes: rota.observacoes ?? undefined,
          paradas: rota.paradas.map((p) => ({
            id: p.id,
            ordem: p.ordem,
            estabelecimentoId: p.estabelecimentoId,
            estabelecimento: { razaoSocial: p.estabelecimento.razaoSocial },
          })),
        }}
      />
    </div>
  );
}
