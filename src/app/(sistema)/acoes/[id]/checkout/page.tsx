export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CabecalhoPagina } from "@/componentes/compartilhados/cabecalho-pagina";
import { CheckoutForm } from "@/componentes/acoes/CheckoutForm";
import { prisma } from "@/lib/prisma";
import { formatarDataCurta } from "@/lib/formatadores";
import { exigirPermissaoPagina } from "@/lib/autorizacao";

export default async function CheckoutAcaoPage({ params }: { params: Promise<{ id: string }> }) {
  await exigirPermissaoPagina("MUTAR_ACOES");
  const { id } = await params;

  const acao = await prisma.acao.findUnique({
    where: { id },
    include: {
      estabelecimento: true,
      produtos: { include: { produto: true } },
    },
  });

  if (!acao) notFound();
  if (acao.status !== "aberta") redirect(`/acoes/${id}`);

  const nomeEstab =
    acao.estabelecimento?.nomeFantasia ??
    acao.estabelecimento?.razaoSocial ??
    acao.estabelecimentoAvulso ??
    "Não informado";

  const produtos = acao.produtos.map((p) => ({
    produtoId: p.produtoId,
    nome: p.produto.nome,
    unidade: p.produto.unidade,
    quantidadePlanejada: p.quantidadePlanejada,
    preco: Number(p.preco),
  }));

  const periodoDescricao = `${nomeEstab} · ${formatarDataCurta(acao.data.toISOString().slice(0, 10))}${acao.dataFim ? " a " + formatarDataCurta(acao.dataFim.toISOString().slice(0, 10)) : ""}`;

  return (
    <div className="pagina-conteudo">
      <div style={{ marginBottom: 16 }}>
        <Link
          href={`/acoes/${id}`}
          style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--cor-texto-3)", fontSize: 11 }}
        >
          <ArrowLeft size={14} /> Voltar ao detalhe
        </Link>
      </div>

      <CabecalhoPagina
        etiqueta="Encerrar Ação"
        titulo={acao.titulo}
        descricao={periodoDescricao}
      />

      {/* Resumo */}
      <div className="painel" style={{ marginBottom: 18 }}>
        <div className="painel-cabecalho">
          <div><h2>Resumo da ação</h2></div>
        </div>
        <div className="detalhe-campos" style={{ padding: "14px 19px" }}>
          <div className="detalhe-campo">
            <label>Número</label>
            <span style={{ fontFamily: "monospace" }}>{acao.numero}</span>
          </div>
          <div className="detalhe-campo">
            <label>Estabelecimento</label>
            <span>{nomeEstab}</span>
          </div>
          <div className="detalhe-campo">
            <label>Data início</label>
            <span>{formatarDataCurta(acao.data.toISOString().slice(0, 10))}</span>
          </div>
          {acao.dataFim && (
            <div className="detalhe-campo">
              <label>Data fim</label>
              <span>{formatarDataCurta(acao.dataFim.toISOString().slice(0, 10))}</span>
            </div>
          )}
          {acao.observacoes && (
            <div className="detalhe-campo" style={{ gridColumn: "1/-1" }}>
              <label>Observações</label>
              <span style={{ whiteSpace: "pre-wrap" }}>{acao.observacoes}</span>
            </div>
          )}
        </div>
      </div>

      {produtos.length === 0 ? (
        <div className="painel">
          <div className="estado-vazio" style={{ minHeight: 80 }}>
            <span>Esta ação não tem produtos. Para encerrar, use a opção na página de detalhe.</span>
          </div>
          <div style={{ padding: "0 19px 14px" }}>
            <a href={`/acoes/${id}`} className="bt-secundario">Voltar</a>
          </div>
        </div>
      ) : (
        <CheckoutForm acaoId={id} produtos={produtos} />
      )}
    </div>
  );
}
