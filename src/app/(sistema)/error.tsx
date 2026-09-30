"use client";

import { useEffect } from "react";

export default function ErroSistema({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const semBanco = error.message?.includes("Can't reach database") || error.message?.includes("PrismaClient");

  return (
    <div className="pagina-conteudo" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
      <div style={{ textAlign: "center", maxWidth: 420 }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: "var(--verde-50)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px", fontSize: 24 }}>
          {semBanco ? "🔌" : "⚠️"}
        </div>
        <h2 style={{ fontFamily: "Georgia, serif", fontSize: 22, margin: "0 0 10px" }}>
          {semBanco ? "Banco de dados inacessível" : "Erro ao carregar"}
        </h2>
        <p style={{ color: "var(--texto)", fontSize: 13, lineHeight: 1.6, margin: "0 0 22px" }}>
          {semBanco
            ? "Esta instância de desenvolvimento não tem acesso direto ao banco. Faça o deploy para ver os dados reais, ou rode localmente com a variável DATABASE_URL apontando para um banco acessível."
            : error.message}
        </p>
        <button
          onClick={reset}
          style={{ height: 36, border: 0, borderRadius: 7, background: "var(--verde-800)", color: "white", padding: "0 18px", fontWeight: 700, fontSize: 12, cursor: "pointer" }}
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
}
