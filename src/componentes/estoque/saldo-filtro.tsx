"use client";

import { useState } from "react";
import { Search } from "lucide-react";

type SaldoItem = {
  id: string;
  produtoId: string;
  quantidade: number;
  nome: string;
  unidade: string;
  grupo: string;
};

export function SaldoFiltro({ saldos }: { saldos: SaldoItem[] }) {
  const [busca, setBusca] = useState("");

  const filtrados = busca.trim()
    ? saldos.filter((s) => s.nome.toLowerCase().includes(busca.toLowerCase()) || s.grupo.toLowerCase().includes(busca.toLowerCase()))
    : saldos;

  const totalUnidades = filtrados.reduce((s, x) => s + x.quantidade, 0);

  return (
    <div>
      <div style={{ padding: "12px 19px", borderBottom: "1px solid var(--cor-linha)" }}>
        <div style={{ position: "relative", maxWidth: 320 }}>
          <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--cor-texto-3)" }} />
          <input
            type="text"
            placeholder="Filtrar por produto ou grupo…"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            style={{ paddingLeft: 30, width: "100%" }}
          />
        </div>
      </div>

      {filtrados.length > 0 ? (
        <div className="tabela-wrap">
          <table>
            <thead>
              <tr>
                <th>Produto</th>
                <th>Grupo</th>
                <th>Unidade</th>
                <th style={{ textAlign: "right" }}>Quantidade em Estoque</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((s) => (
                <tr key={s.id} style={s.quantidade === 0 ? { color: "var(--cor-erro)" } : undefined}>
                  <td><strong>{s.nome}</strong></td>
                  <td>{s.grupo}</td>
                  <td>{s.unidade}</td>
                  <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{s.quantidade}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} style={{ textAlign: "right", fontWeight: 700 }}>
                  {filtrados.length} SKU{filtrados.length !== 1 ? "s" : ""}
                </td>
                <td style={{ textAlign: "right", fontWeight: 700 }}>{totalUnidades} un.</td>
              </tr>
            </tfoot>
          </table>
        </div>
      ) : (
        <div className="estado-vazio" style={{ minHeight: 80 }}>
          <span>{busca ? "Nenhum produto encontrado para esse filtro." : "Nenhum saldo registrado."}</span>
        </div>
      )}
    </div>
  );
}
