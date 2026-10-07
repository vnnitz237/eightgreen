"use client";

import { useState, useTransition } from "react";
import { pagarContaPagar } from "@/lib/actions/financeiro";

type Props = {
  id: string;
  descricao: string;
  valor: number;
};

export function ModalPagar({ id, descricao, valor }: Props) {
  const [aberto, setAberto] = useState(false);
  const [data, setData] = useState(new Date().toISOString().slice(0, 10));
  const [erro, setErro] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function confirmar() {
    setErro(null);
    startTransition(async () => {
      const res = await pagarContaPagar(id, data);
      if (res.ok) {
        setAberto(false);
      } else {
        setErro(res.erro);
      }
    });
  }

  if (!aberto) {
    return (
      <button className="bt-link" style={{ fontSize: 11, color: "var(--cor-sucesso)" }} onClick={() => setAberto(true)}>
        Pagar
      </button>
    );
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,.45)" }}
      onClick={(e) => { if (e.target === e.currentTarget) setAberto(false); }}>
      <div style={{ background: "var(--cor-fundo)", borderRadius: 10, padding: 28, width: 360, boxShadow: "0 8px 32px rgba(0,0,0,.2)" }}>
        <h3 style={{ margin: "0 0 6px" }}>Registrar pagamento</h3>
        <p style={{ margin: "0 0 20px", color: "var(--cor-texto-3)", fontSize: 13 }}>
          {descricao} · R$ {valor.toFixed(2).replace(".", ",")}
        </p>

        <label style={{ display: "block", marginBottom: 16 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: "var(--cor-texto-3)", textTransform: "uppercase", letterSpacing: ".05em" }}>
            Data do pagamento
          </span>
          <input type="date" value={data} onChange={(e) => setData(e.target.value)} style={{ marginTop: 6, width: "100%" }} />
        </label>

        {erro && <p style={{ color: "var(--cor-erro)", fontSize: 12, margin: "0 0 12px" }}>{erro}</p>}

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button className="bt-secundario" onClick={() => setAberto(false)} disabled={pending}>Cancelar</button>
          <button className="botao" onClick={confirmar} disabled={pending || !data}>
            {pending ? "Salvando…" : "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
}
