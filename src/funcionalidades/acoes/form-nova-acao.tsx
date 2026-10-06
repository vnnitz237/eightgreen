"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { CabecalhoPagina } from "@/componentes/compartilhados/cabecalho-pagina";
import { criarAcao } from "./actions";
import type { Distribuidora, Estabelecimento } from "@prisma/client";

type Props = {
  distribuidoras: Distribuidora[];
  estabelecimentos: Estabelecimento[];
  acaoId?: string;
};

export function FormNovaAcao({ distribuidoras, estabelecimentos }: Props) {
  const [modoEstab, setModoEstab] = useState<"cadastrado" | "avulso">("cadastrado");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      await criarAcao(formData);
    });
  }

  const hoje = new Date().toISOString().slice(0, 10);

  return (
    <div className="pagina-conteudo">
      <CabecalhoPagina
        etiqueta="Ações"
        titulo="Nova ação promocional"
        descricao="Preencha os dados para criar uma nova ação."
      />

      <div className="painel">
        <div className="painel-cabecalho">
          <div><h2>Dados da ação</h2></div>
        </div>

        <form onSubmit={handleSubmit} className="form-completo">
          <div className="form-completo-grupo">
            <label style={{ gridColumn: "1/-1" }}>
              Título
              <input name="titulo" required placeholder="Ex: Ativação Linha Energia" />
            </label>
          </div>

          <div className="form-completo-grupo">
            <label>
              Data
              <input name="data" type="date" required defaultValue={hoje} />
            </label>
            <label>
              Horário
              <input name="horario" type="time" required defaultValue="09:00" />
            </label>
          </div>

          <div className="form-completo-grupo">
            <label>
              Status inicial
              <input value="Aberta" disabled aria-describedby="status-ajuda" />
              <small id="status-ajuda">Novas ações sempre iniciam abertas.</small>
            </label>
            <label>
              Distribuidora (opcional)
              <select name="distribuidoraId">
                <option value="">Sem distribuidora</option>
                {distribuidoras.map((d) => (
                  <option key={d.id} value={d.id}>{d.nome}</option>
                ))}
              </select>
            </label>
          </div>

          <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <label style={{ flexDirection: "row", alignItems: "center", gap: 6, cursor: "pointer", color: "var(--tinta)", fontWeight: 500 }}>
                <input type="radio" name="_modoEstab" value="cadastrado" checked={modoEstab === "cadastrado"} onChange={() => setModoEstab("cadastrado")} />
                Estabelecimento cadastrado
              </label>
              <label style={{ flexDirection: "row", alignItems: "center", gap: 6, cursor: "pointer", color: "var(--tinta)", fontWeight: 500 }}>
                <input type="radio" name="_modoEstab" value="avulso" checked={modoEstab === "avulso"} onChange={() => setModoEstab("avulso")} />
                Local avulso
              </label>
            </div>

            {modoEstab === "cadastrado" ? (
              <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontSize: 10, color: "var(--muted)", fontWeight: 700 }}>ESTABELECIMENTO</span>
                <select name="estabelecimentoId" required style={{ height: 36, border: "1px solid var(--linha)", borderRadius: 7, padding: "0 11px", fontSize: 12 }}>
                  <option value="">Selecione...</option>
                  {estabelecimentos.map((e) => (
                    <option key={e.id} value={e.id}>{e.nome}</option>
                  ))}
                </select>
                <input type="hidden" name="estabelecimentoAvulso" value="" />
              </label>
            ) : (
              <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontSize: 10, color: "var(--muted)", fontWeight: 700 }}>NOME DO LOCAL</span>
                <input name="estabelecimentoAvulso" required placeholder="Ex: Praça Central" style={{ height: 36, border: "1px solid var(--linha)", borderRadius: 7, padding: "0 11px", fontSize: 12 }} />
                <input type="hidden" name="estabelecimentoId" value="" />
              </label>
            )}
          </div>

          <div className="form-acoes" style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button type="button" className="bt-secundario" onClick={() => router.back()}>
              Cancelar
            </button>
            <button type="submit" className="botao" disabled={pending}>
              {pending ? "Criando..." : "Criar ação"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
