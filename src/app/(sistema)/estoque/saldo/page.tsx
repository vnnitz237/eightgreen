export const dynamic = "force-dynamic";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CabecalhoPagina } from "@/componentes/compartilhados/cabecalho-pagina";
import { buscarSaldoAtual } from "@/lib/actions/estoque";
import { SaldoFiltro } from "@/componentes/estoque/saldo-filtro";

export default async function SaldoEstoquePage() {
  const saldos = await buscarSaldoAtual();
  const totalSkus = saldos.length;
  const totalUnidades = saldos.reduce((s, x) => s + x.quantidade, 0);

  return (
    <div className="pagina-conteudo">
      <div style={{ marginBottom: 16 }}>
        <Link href="/estoque" style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--cor-texto-3)", fontSize: 11 }}>
          <ArrowLeft size={14} /> Voltar para documentos
        </Link>
      </div>

      <CabecalhoPagina
        etiqueta="Estoque"
        titulo="Saldo de estoque"
        descricao={`${totalSkus} SKU${totalSkus !== 1 ? "s" : ""} · ${totalUnidades} unidade${totalUnidades !== 1 ? "s" : ""} no total`}
      />

      <div className="painel">
        <div className="painel-cabecalho"><div><h2>Saldo por produto</h2><p>Atualizado ao encerrar documentos</p></div></div>
        <SaldoFiltro saldos={saldos.map((s) => ({
          id: s.id,
          produtoId: s.produtoId,
          quantidade: s.quantidade,
          nome: s.produto.nome,
          unidade: s.produto.unidade,
          grupo: s.produto.grupo?.nome ?? "—",
        }))} />
      </div>
    </div>
  );
}
