"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { encerrarAcaoCheckout } from "@/funcionalidades/acoes/actions";
import { formatarMoeda } from "@/lib/formatadores";

type Produto = {
  produtoId: string;
  nome: string;
  unidade: string;
  quantidadePlanejada: number;
  preco: number;
};

export function CheckoutForm({ acaoId, produtos: produtosIniciais }: { acaoId: string; produtos: Produto[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [quantidades, setQuantidades] = useState<Record<string, number>>(
    Object.fromEntries(produtosIniciais.map((p) => [p.produtoId, p.quantidadePlanejada]))
  );
  const [erro, setErro] = useState<string | null>(null);

  const total = produtosIniciais.reduce(
    (s, p) => s + (quantidades[p.produtoId] ?? p.quantidadePlanejada) * p.preco,
    0
  );

  function handleSubmit() {
    if (!confirm("Confirmar encerramento da ação? Esta operação não pode ser desfeita.")) return;
    setErro(null);
    const produtosAtualizados = produtosIniciais.map((p) => ({
      produtoId: p.produtoId,
      quantidade: quantidades[p.produtoId] ?? p.quantidadePlanejada,
    }));

    startTransition(async () => {
      const res = await encerrarAcaoCheckout(acaoId, produtosAtualizados);
      if (!res.ok) {
        setErro(res.erro);
        return;
      }
      router.push(`/acoes/${acaoId}`);
    });
  }

  return (
    <div className="painel">
      <div className="painel-cabecalho">
        <div>
          <h2>Confirmar encerramento</h2>
          <p>Ajuste as quantidades reais antes de encerrar</p>
        </div>
      </div>
      <div className="tabela-wrap">
        <table>
          <thead>
            <tr>
              <th>Produto</th>
              <th>Unidade</th>
              <th style={{ textAlign: "right" }}>Quantidade</th>
              <th style={{ textAlign: "right" }}>Preço unit.</th>
              <th style={{ textAlign: "right" }}>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {produtosIniciais.map((p) => {
              const qtd = quantidades[p.produtoId] ?? p.quantidadePlanejada;
              return (
                <tr key={p.produtoId}>
                  <td><strong>{p.nome}</strong></td>
                  <td>{p.unidade}</td>
                  <td style={{ textAlign: "right" }}>
                    <input
                      type="number"
                      min={0}
                      value={qtd}
                      onChange={(e) =>
                        setQuantidades((prev) => ({
                          ...prev,
                          [p.produtoId]: Math.max(0, parseInt(e.target.value) || 0),
                        }))
                      }
                      style={{ width: 80, textAlign: "right", padding: "4px 6px" }}
                      disabled={pending}
                    />
                  </td>
                  <td style={{ textAlign: "right" }}>{formatarMoeda(p.preco)}</td>
                  <td style={{ textAlign: "right" }}>{formatarMoeda(qtd * p.preco)}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={4} style={{ textAlign: "right", fontWeight: 700 }}>Total</td>
              <td style={{ textAlign: "right", fontWeight: 700 }}>{formatarMoeda(total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      {erro && (
        <p style={{ color: "var(--cor-perigo, #dc2626)", padding: "10px 19px", margin: 0, fontSize: 13 }}>
          {erro}
        </p>
      )}
      <div style={{ display: "flex", gap: 8, padding: "14px 19px" }}>
        <button onClick={handleSubmit} disabled={pending} className="botao">
          {pending ? "Encerrando…" : "Encerrar ação"}
        </button>
        <a href={`/acoes/${acaoId}`} className="bt-secundario">Cancelar</a>
      </div>
    </div>
  );
}
