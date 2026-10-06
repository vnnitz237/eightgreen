"use client";

import { useRef, useState, useTransition } from "react";
import { criarCompromisso, editarCompromisso, excluirCompromisso } from "@/lib/actions/compromissos";
import type { CalendarEvent } from "@/types/agenda";

type Props = {
  evento?: CalendarEvent | null;
  dataInicial?: string;
  estabelecimentos: { id: string; nome: string }[];
  responsaveis: { id: string; nome: string }[];
  onFechar: () => void;
  onSalvar: () => void;
};

const TIPOS = [
  { valor: "REUNIAO", rotulo: "Reunião" },
  { valor: "VISITA", rotulo: "Visita" },
  { valor: "ENTREGA", rotulo: "Entrega" },
  { valor: "DEGUSTACAO", rotulo: "Degustação" },
  { valor: "OUTRO", rotulo: "Outro" },
];

export function ModalCompromisso({ evento, dataInicial, estabelecimentos, responsaveis, onFechar, onSalvar }: Props) {
  const [erro, setErro] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const inicio = evento?.start?.slice(0, 16) ?? (dataInicial ? `${dataInicial}T08:00` : "");
  const fim = evento?.end?.slice(0, 16) ?? (dataInicial ? `${dataInicial}T09:00` : "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formRef.current) return;
    const fd = new FormData(formRef.current);

    const dados = {
      titulo: String(fd.get("titulo") ?? ""),
      tipo: String(fd.get("tipo") ?? "OUTRO") as "REUNIAO" | "VISITA" | "ENTREGA" | "DEGUSTACAO" | "OUTRO",
      inicio: String(fd.get("inicio") ?? ""),
      fim: String(fd.get("fim") ?? ""),
      diaInteiro: fd.get("diaInteiro") === "true",
      observacoes: String(fd.get("observacoes") ?? "") || undefined,
      estabelecimentoId: String(fd.get("estabelecimentoId") ?? "") || undefined,
      responsavelId: String(fd.get("responsavelId") ?? "") || undefined,
    };

    setErro(null);
    startTransition(async () => {
      const resultado = evento?.id
        ? await editarCompromisso(evento.id, dados)
        : await criarCompromisso(dados);
      if (!resultado.ok) { setErro(resultado.erro); return; }
      onSalvar();
    });
  }

  function handleExcluir() {
    if (!evento?.id) return;
    if (!confirm("Excluir este compromisso?")) return;
    startTransition(async () => {
      await excluirCompromisso(evento.id);
      onSalvar();
    });
  }

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.4)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onFechar(); }}
    >
      <div style={{ background: "var(--cor-fundo)", borderRadius: 10, padding: 24, width: "100%", maxWidth: 460, boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}>
        <h2 style={{ marginBottom: 18, fontSize: 16 }}>{evento?.id ? "Editar compromisso" : "Novo compromisso"}</h2>

        <form ref={formRef} onSubmit={handleSubmit} className="form-completo">
          <div className="form-completo-grupo">
            <label style={{ gridColumn: "1/-1" }}>
              Título
              <input name="titulo" required defaultValue={evento?.title ?? ""} placeholder="Ex: Reunião com distribuidora" />
            </label>
          </div>
          <div className="form-completo-grupo">
            <label>
              Tipo
              <select name="tipo" defaultValue={evento?.extendedProps.tipo ?? "OUTRO"}>
                {TIPOS.map((t) => <option key={t.valor} value={t.valor}>{t.rotulo}</option>)}
              </select>
            </label>
            <label style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingTop: 22 }}>
              <input type="checkbox" name="diaInteiro" value="true" defaultChecked={evento?.allDay ?? false} />
              Dia inteiro
            </label>
          </div>
          <div className="form-completo-grupo">
            <label>
              Início
              <input name="inicio" type="datetime-local" required defaultValue={inicio} />
            </label>
            <label>
              Fim
              <input name="fim" type="datetime-local" required defaultValue={fim} />
            </label>
          </div>
          <div className="form-completo-grupo">
            <label>
              Estabelecimento
              <select name="estabelecimentoId" defaultValue={evento?.extendedProps.estabelecimentoId ?? ""}>
                <option value="">Nenhum</option>
                {estabelecimentos.map((e) => <option key={e.id} value={e.id}>{e.nome}</option>)}
              </select>
            </label>
            <label>
              Responsável
              <select name="responsavelId" defaultValue={evento?.extendedProps.responsavelId ?? ""}>
                <option value="">Nenhum</option>
                {responsaveis.map((r) => <option key={r.id} value={r.id}>{r.nome}</option>)}
              </select>
            </label>
          </div>
          <label>
            Observações
            <textarea name="observacoes" rows={2} defaultValue={evento?.extendedProps.observacoes ?? ""} placeholder="Observações opcionais" style={{ resize: "vertical" }} />
          </label>

          {erro && <p style={{ color: "var(--cor-erro)", fontSize: 12 }}>{erro}</p>}

          <div style={{ display: "flex", gap: 8, justifyContent: "space-between", marginTop: 4 }}>
            <div style={{ display: "flex", gap: 8 }}>
              <button type="submit" className="botao" disabled={pending}>{pending ? "Salvando…" : "Salvar"}</button>
              <button type="button" className="bt-secundario" onClick={onFechar} disabled={pending}>Cancelar</button>
            </div>
            {evento?.id && (
              <button type="button" className="bt-danger" onClick={handleExcluir} disabled={pending}>Excluir</button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
