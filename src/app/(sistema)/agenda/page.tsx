export const dynamic = "force-dynamic";

import { CabecalhoPagina } from "@/componentes/compartilhados/cabecalho-pagina";
import { Calendario } from "@/componentes/agenda/calendario";
import { listarEstabelecimentos } from "@/funcionalidades/cadastros/consultas";
import { prisma } from "@/lib/prisma";

export default async function AgendaPage() {
  const [estabelecimentos, usuarios] = await Promise.all([
    listarEstabelecimentos(),
    prisma.usuario.findMany({
      where: { ativo: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="pagina-conteudo">
      <CabecalhoPagina
        etiqueta="Agenda"
        titulo="Calendário"
        descricao="Clique em um dia para criar um compromisso; clique em um evento para editar."
      />
      <Calendario
        estabelecimentos={estabelecimentos.map((e) => ({ id: e.id, nome: e.razaoSocial }))}
        responsaveis={usuarios.map((u) => ({ id: u.id, nome: u.name }))}
      />
    </div>
  );
}
