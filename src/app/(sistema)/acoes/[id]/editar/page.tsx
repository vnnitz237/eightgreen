export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { FormAcao } from "@/funcionalidades/acoes/form-acao";
import { editarAcao } from "@/funcionalidades/acoes/actions";
import { listarDistribuidoras, listarEstabelecimentos, listarProdutos, listarDegustadoras } from "@/funcionalidades/cadastros/consultas";

export default async function EditarAcaoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [acao, distribuidoras, estabelecimentos, produtos, degustadoras] = await Promise.all([
    prisma.acao.findUnique({
      where: { id },
      include: {
        produtos: true,
        acaoDegustadoras: true,
      },
    }),
    listarDistribuidoras(),
    listarEstabelecimentos(),
    listarProdutos(),
    listarDegustadoras(),
  ]);

  if (!acao) notFound();
  if (acao.status !== "aberta") redirect(`/acoes/${id}`);

  async function submit(formData: FormData) {
    "use server";
    const resultado = await editarAcao(id, formData);
    if (resultado.ok) {
      redirect(`/acoes/${id}`);
    }
    return resultado;
  }

  const acaoParaEditar = {
    id: acao.id,
    numero: acao.numero,
    titulo: acao.titulo,
    data: acao.data.toISOString().slice(0, 10),
    dataFim: acao.dataFim ? acao.dataFim.toISOString().slice(0, 10) : null,
    horario: acao.horario,
    status: acao.status,
    distribuidoraId: acao.distribuidoraId,
    estabelecimentoId: acao.estabelecimentoId,
    estabelecimentoAvulso: acao.estabelecimentoAvulso,
    observacoes: acao.observacoes,
    produtos: acao.produtos.map((p) => ({
      produtoId: p.produtoId,
      quantidadePlanejada: p.quantidadePlanejada,
      preco: Number(p.preco),
    })),
    acaoDegustadoras: acao.acaoDegustadoras.map((d) => ({
      degustadoraId: d.degustadoraId,
      dataTrabalho: d.dataTrabalho.toISOString().slice(0, 10),
      horaInicio: d.horaInicio,
      horaFim: d.horaFim,
      observacoes: d.observacoes,
    })),
  };

  return (
    <FormAcao
      acao={acaoParaEditar}
      distribuidoras={distribuidoras.map((d) => ({ id: d.id, nome: d.nome }))}
      estabelecimentos={estabelecimentos.map((e) => ({ id: e.id, nome: e.razaoSocial }))}
      produtos={produtos.map((p) => ({ id: p.id, nome: p.nome, unidade: p.unidade }))}
      degustadoras={degustadoras.map((d) => ({ id: d.id, nome: d.nome }))}
      onSubmit={submit}
    />
  );
}
