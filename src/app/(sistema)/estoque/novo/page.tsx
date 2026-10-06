export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { FormDocumentoEstoque } from "@/componentes/estoque/form-documento-estoque";
import { criarDocumento } from "@/lib/actions/estoque";
import { listarProdutos, listarFornecedores } from "@/funcionalidades/cadastros/consultas";
import { prisma } from "@/lib/prisma";
import type { TipoDocumentoEstoque } from "@prisma/client";

const TIPOS_VALIDOS: TipoDocumentoEstoque[] = ["ENTRADA", "SAIDA", "INVENTARIO"];

type SearchParams = Promise<{ tipo?: string }>;

export default async function NovoDocumentoPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const tipoRaw = (sp.tipo ?? "ENTRADA").toUpperCase() as TipoDocumentoEstoque;
  const tipo: TipoDocumentoEstoque = TIPOS_VALIDOS.includes(tipoRaw) ? tipoRaw : "ENTRADA";

  const [produtos, fornecedores, acoesAbertas, usuarios] = await Promise.all([
    listarProdutos(),
    listarFornecedores(),
    prisma.acao.findMany({ where: { status: "aberta" }, select: { id: true, numero: true }, orderBy: { numero: "asc" } }),
    prisma.usuario.findMany({ where: { ativo: true }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  async function submit(fd: FormData) {
    "use server";
    return criarDocumento(fd);
  }

  return (
    <div className="pagina-conteudo">
      {/* Atalhos de tipo */}
      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        {TIPOS_VALIDOS.map((t) => (
          <Link key={t} href={`/estoque/novo?tipo=${t}`}
            className={tipo === t ? "botao" : "bt-secundario"}
            style={{ fontSize: 12 }}>
            {t === "ENTRADA" ? "Nova Entrada" : t === "SAIDA" ? "Nova Saída" : "Novo Inventário"}
          </Link>
        ))}
      </div>

      <FormDocumentoEstoque
        tipo={tipo}
        produtos={produtos.map((p) => ({ id: p.id, nome: p.nome, unidade: p.unidade, custo: p.custo ? Number(p.custo) : null }))}
        fornecedores={fornecedores}
        acoes={acoesAbertas}
        usuarios={usuarios}
        onSubmit={submit}
      />
    </div>
  );
}
