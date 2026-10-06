export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import { FormDocumentoEstoque } from "@/componentes/estoque/form-documento-estoque";
import { editarDocumento } from "@/lib/actions/estoque";
import { listarProdutos, listarFornecedores } from "@/funcionalidades/cadastros/consultas";
import { prisma } from "@/lib/prisma";

export default async function EditarDocumentoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [doc, produtos, fornecedores, acoesAbertas, usuarios] = await Promise.all([
    prisma.documentoEstoque.findUnique({
      where: { id },
      include: {
        itens: {
          include: { produto: { select: { nome: true, unidade: true } } },
          orderBy: { produto: { nome: "asc" } },
        },
      },
    }),
    listarProdutos(),
    listarFornecedores(),
    prisma.acao.findMany({ where: { status: "aberta" }, select: { id: true, numero: true }, orderBy: { numero: "asc" } }),
    prisma.usuario.findMany({ where: { ativo: true }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  if (!doc) notFound();
  if (doc.status !== "ABERTO") redirect(`/estoque/${id}`);

  async function submit(fd: FormData) {
    "use server";
    const resultado = await editarDocumento(id, fd);
    if (resultado.ok) redirect(`/estoque/${id}`);
    return resultado;
  }

  const docParaEditar = {
    id: doc.id,
    numero: doc.numero,
    data: doc.data.toISOString().slice(0, 10),
    fornecedorId: doc.fornecedorId,
    acaoId: doc.acaoId,
    responsavelId: doc.responsavelId,
    observacao: doc.observacao,
    itens: doc.itens.map((i) => ({
      produtoId: i.produtoId,
      quantidade: Number(i.quantidade),
      quantidadeAnterior: i.saldoSistema ? Number(i.saldoSistema) : null,
      custo: i.valorUnitario ? Number(i.valorUnitario) : null,
    })),
  };

  return (
    <FormDocumentoEstoque
      documento={docParaEditar}
      tipo={doc.tipo}
      produtos={produtos.map((p) => ({ id: p.id, nome: p.nome, unidade: p.unidade, custo: p.custo ? Number(p.custo) : null }))}
      fornecedores={fornecedores}
      acoes={acoesAbertas}
      usuarios={usuarios}
      onSubmit={submit}
    />
  );
}
