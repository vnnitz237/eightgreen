export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CabecalhoPagina } from "@/componentes/compartilhados/cabecalho-pagina";
import { formatarDataCurta, formatarMoeda } from "@/lib/formatadores";
import { encerrarDocumento, cancelarDocumento } from "@/lib/actions/estoque";
import { prisma } from "@/lib/prisma";
import type { TipoDocumentoEstoque, StatusDocumentoEstoque } from "@prisma/client";

const ROTULO_TIPO: Record<TipoDocumentoEstoque, string> = {
  ENTRADA: "Entrada",
  SAIDA: "Saída",
  INVENTARIO: "Inventário",
};

const COR_TIPO: Record<TipoDocumentoEstoque, string> = {
  ENTRADA: "verde",
  SAIDA: "vermelho",
  INVENTARIO: "azul",
};

const ROTULO_STATUS: Record<StatusDocumentoEstoque, string> = {
  ABERTO: "Aberto",
  ENCERRADO: "Encerrado",
  CANCELADO: "Cancelado",
};

const COR_STATUS: Record<StatusDocumentoEstoque, string> = {
  ABERTO: "amarelo",
  ENCERRADO: "verde",
  CANCELADO: "cinza",
};

export default async function DetalheDocumentoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const doc = await prisma.documentoEstoque.findUnique({
    where: { id },
    include: {
      fornecedor: true,
      responsavel: { select: { id: true, name: true } },
      acao: { select: { id: true, numero: true } },
      itens: {
        include: { produto: { select: { nome: true, unidade: true } } },
        orderBy: { produto: { nome: "asc" } },
      },
    },
  });

  if (!doc) notFound();

  const docId = doc.id;
  async function encerrar() { "use server"; await encerrarDocumento(docId); }
  async function cancelar() { "use server"; await cancelarDocumento(docId); }

  const totalValor = doc.tipo === "ENTRADA"
    ? doc.itens.reduce((s, i) => s + (i.valorUnitario ? Number(i.valorUnitario) * Number(i.quantidade) : 0), 0)
    : null;

  return (
    <div className="pagina-conteudo">
      <div style={{ marginBottom: 16 }}>
        <Link href="/estoque" style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--cor-texto-3)", fontSize: 11 }}>
          <ArrowLeft size={14} /> Voltar aos documentos
        </Link>
      </div>

      <CabecalhoPagina
        etiqueta="Estoque"
        titulo={doc.numero ?? doc.id.slice(0, 8)}
        descricao={`${ROTULO_TIPO[doc.tipo]} · ${formatarDataCurta(doc.data.toISOString().slice(0, 10))}`}
        acao={
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <span className={`tag tag-${COR_TIPO[doc.tipo]}`}>{ROTULO_TIPO[doc.tipo]}</span>
            <span className={`tag tag-${COR_STATUS[doc.status]}`}>{ROTULO_STATUS[doc.status]}</span>
            {doc.status === "ABERTO" && (
              <>
                <Link href={`/estoque/${doc.id}/editar`} className="bt-secundario">Editar</Link>
                <form action={encerrar} style={{ display: "contents" }}>
                  <button type="submit" className="botao"
                    onClick={(e) => { if (!confirm("Encerrar este documento? O saldo será atualizado.")) e.preventDefault(); }}>
                    Encerrar
                  </button>
                </form>
                <form action={cancelar} style={{ display: "contents" }}>
                  <button type="submit" className="bt-danger"
                    onClick={(e) => { if (!confirm("Cancelar este documento?")) e.preventDefault(); }}>
                    Cancelar
                  </button>
                </form>
              </>
            )}
          </div>
        }
      />

      {/* Dados gerais */}
      <div className="painel" style={{ marginBottom: 18 }}>
        <div className="painel-cabecalho"><div><h2>Dados gerais</h2></div></div>
        <div className="detalhe-campos">
          <div className="detalhe-campo"><label>Número</label><span style={{ fontFamily: "monospace" }}>{doc.numero ?? "—"}</span></div>
          <div className="detalhe-campo"><label>Tipo</label><span><span className={`tag tag-${COR_TIPO[doc.tipo]}`}>{ROTULO_TIPO[doc.tipo]}</span></span></div>
          <div className="detalhe-campo"><label>Status</label><span><span className={`tag tag-${COR_STATUS[doc.status]}`}>{ROTULO_STATUS[doc.status]}</span></span></div>
          <div className="detalhe-campo"><label>Data</label><span>{formatarDataCurta(doc.data.toISOString().slice(0, 10))}</span></div>
          {doc.fornecedor && <div className="detalhe-campo"><label>Fornecedor</label><span>{doc.fornecedor.razaoSocial}</span></div>}
          {doc.acao && <div className="detalhe-campo"><label>Ação vinculada</label><span><Link href={`/acoes/${doc.acao.id}`} className="bt-link">{doc.acao.numero}</Link></span></div>}
          {doc.responsavel && <div className="detalhe-campo"><label>Responsável</label><span>{doc.responsavel.name}</span></div>}
          {doc.observacao && <div className="detalhe-campo" style={{ gridColumn: "1/-1" }}><label>Observações</label><span style={{ whiteSpace: "pre-wrap" }}>{doc.observacao}</span></div>}
        </div>
      </div>

      {/* Itens */}
      <div className="painel">
        <div className="painel-cabecalho"><div><h2>Itens do documento</h2><p>{doc.itens.length} produto(s)</p></div></div>
        {doc.itens.length > 0 ? (
          <div className="tabela-wrap">
            <table>
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Unidade</th>
                  {doc.tipo === "INVENTARIO" && <th style={{ textAlign: "right" }}>Qtd Anterior</th>}
                  <th style={{ textAlign: "right" }}>Quantidade</th>
                  {doc.tipo === "ENTRADA" && <th style={{ textAlign: "right" }}>Custo Unit.</th>}
                  {doc.tipo === "ENTRADA" && <th style={{ textAlign: "right" }}>Subtotal</th>}
                </tr>
              </thead>
              <tbody>
                {doc.itens.map((item) => (
                  <tr key={item.id}>
                    <td><strong>{item.produto.nome}</strong></td>
                    <td>{item.produto.unidade}</td>
                    {doc.tipo === "INVENTARIO" && (
                      <td style={{ textAlign: "right" }}>
                        {item.saldoSistema != null ? Number(item.saldoSistema) : <span style={{ color: "var(--cor-texto-3)" }}>—</span>}
                      </td>
                    )}
                    <td style={{ textAlign: "right" }}>{Number(item.quantidade)}</td>
                    {doc.tipo === "ENTRADA" && (
                      <td style={{ textAlign: "right" }}>
                        {item.valorUnitario ? formatarMoeda(Number(item.valorUnitario)) : <span style={{ color: "var(--cor-texto-3)" }}>—</span>}
                      </td>
                    )}
                    {doc.tipo === "ENTRADA" && (
                      <td style={{ textAlign: "right" }}>
                        {item.valorUnitario ? formatarMoeda(Number(item.valorUnitario) * Number(item.quantidade)) : <span style={{ color: "var(--cor-texto-3)" }}>—</span>}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
              {doc.tipo === "ENTRADA" && totalValor !== null && totalValor > 0 && (
                <tfoot>
                  <tr>
                    <td colSpan={4} style={{ textAlign: "right", fontWeight: 700 }}>Total</td>
                    <td style={{ textAlign: "right", fontWeight: 700 }}>{formatarMoeda(totalValor)}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        ) : (
          <div className="estado-vazio" style={{ minHeight: 80 }}><span>Nenhum item</span></div>
        )}
      </div>
    </div>
  );
}
