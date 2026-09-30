export const dynamic = "force-dynamic";

import { repositorioAcoesPrisma } from "@/funcionalidades/acoes/repositorio-prisma";
import { ListaAcoes } from "@/funcionalidades/acoes/lista-acoes";

export default async function AcoesPage() {
  const acoes = await repositorioAcoesPrisma.listar();
  return <ListaAcoes acoes={acoes} />;
}
