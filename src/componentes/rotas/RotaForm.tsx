"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

type Estabelecimento = { id: string; razaoSocial: string };
type Usuario = { id: string; name: string };
type ParadaExistente = { id: string; ordem: number; estabelecimentoId: string; estabelecimento: { razaoSocial: string } };

type Props = {
  action: (fd: FormData) => void | Promise<void>;
  estabelecimentos: Estabelecimento[];
  promotores: Usuario[];
  defaultValues?: {
    nome?: string;
    descricao?: string;
    data?: string;
    promotorId?: string;
    observacoes?: string;
    paradas?: ParadaExistente[];
  };
};

type Parada = { tempId: string; estabelecimentoId: string; ordem: number };

export function RotaForm({ action, estabelecimentos, promotores, defaultValues }: Props) {
  const [paradas, setParadas] = useState<Parada[]>(
    defaultValues?.paradas?.map((p) => ({ tempId: p.id, estabelecimentoId: p.estabelecimentoId, ordem: p.ordem })) ?? []
  );

  function adicionarParada() {
    setParadas((prev) => [
      ...prev,
      { tempId: Math.random().toString(36).slice(2), estabelecimentoId: "", ordem: prev.length },
    ]);
  }

  function removerParada(tempId: string) {
    setParadas((prev) => prev.filter((p) => p.tempId !== tempId).map((p, i) => ({ ...p, ordem: i })));
  }

  function atualizarEstab(tempId: string, estabelecimentoId: string) {
    setParadas((prev) => prev.map((p) => (p.tempId === tempId ? { ...p, estabelecimentoId } : p)));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("paradas", JSON.stringify(paradas.filter((p) => p.estabelecimentoId)));
    await action(fd);
  }

  return (
    <div className="painel">
      <div className="painel-cabecalho"><div><h2>Dados da rota</h2></div></div>
      <form onSubmit={handleSubmit} className="form-completo" style={{ padding: "14px 19px" }}>
        <div className="form-completo-grupo">
          <label>
            Nome *
            <input name="nome" required defaultValue={defaultValues?.nome ?? ""} placeholder="Ex: Rota Centro — SP" />
          </label>
          <label>
            Data *
            <input name="data" type="date" required defaultValue={defaultValues?.data ?? new Date().toISOString().slice(0, 10)} />
          </label>
          <label>
            Promotor
            <select name="promotorId" defaultValue={defaultValues?.promotorId ?? ""}>
              <option value="">— Selecionar —</option>
              {promotores.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </label>
        </div>
        <div className="form-completo-grupo">
          <label>
            Descrição
            <input name="descricao" defaultValue={defaultValues?.descricao ?? ""} placeholder="Descrição opcional" />
          </label>
          <label style={{ gridColumn: "1/-1" }}>
            Observações
            <textarea name="observacoes" rows={2} defaultValue={defaultValues?.observacoes ?? ""} placeholder="Observações gerais…" />
          </label>
        </div>

        {/* Paradas */}
        <div style={{ marginTop: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <strong style={{ fontSize: 13 }}>Paradas ({paradas.length})</strong>
            <button type="button" className="bt-secundario" style={{ fontSize: 12, height: 28 }} onClick={adicionarParada}>
              <Plus size={12} /> Adicionar
            </button>
          </div>

          {paradas.length === 0 && (
            <div className="estado-vazio" style={{ minHeight: 40, fontSize: 12 }}>
              <span>Nenhuma parada. Clique em "Adicionar" para incluir estabelecimentos.</span>
            </div>
          )}

          {paradas.map((p, i) => (
            <div key={p.tempId} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontFamily: "monospace", fontSize: 12, minWidth: 20, color: "var(--cor-texto-3)" }}>{i + 1}.</span>
              <select
                value={p.estabelecimentoId}
                onChange={(e) => atualizarEstab(p.tempId, e.target.value)}
                style={{ flex: 1 }}
                required
              >
                <option value="">— Selecionar estabelecimento —</option>
                {estabelecimentos.map((e) => <option key={e.id} value={e.id}>{e.razaoSocial}</option>)}
              </select>
              <button type="button" className="bt-danger" style={{ padding: "4px 8px", fontSize: 12 }} onClick={() => removerParada(p.tempId)}>
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <button type="submit" className="botao">Salvar rota</button>
          <a href="/rotas" className="bt-secundario">Cancelar</a>
        </div>
      </form>
    </div>
  );
}
