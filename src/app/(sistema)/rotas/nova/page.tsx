export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { CabecalhoPagina } from "@/componentes/compartilhados/cabecalho-pagina";
import { criarRota } from "@/lib/actions/merchan";
import { prisma } from "@/lib/prisma";
import { RotaForm } from "@/componentes/rotas/RotaForm";

export default async function NovaRotaPage() {
  const [estabelecimentos, promotores] = await Promise.all([
    prisma.estabelecimento.findMany({ where: { ativo: true }, orderBy: { razaoSocial: "asc" }, select: { id: true, razaoSocial: true } }),
    prisma.usuario.findMany({ where: { ativo: true }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  async function criar(fd: FormData) {
    "use server";
    const res = await criarRota(fd);
    if (res.ok) redirect(`/rotas/${res.id}`);
  }

  return (
    <div className="pagina-conteudo">
      <CabecalhoPagina etiqueta="Equipe" titulo="Nova rota" descricao="Planeje uma rota de visitas." />
      <RotaForm
        action={criar}
        estabelecimentos={estabelecimentos}
        promotores={promotores}
      />
    </div>
  );
}
