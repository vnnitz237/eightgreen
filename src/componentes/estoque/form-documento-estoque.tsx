"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { CabecalhoPagina } from "@/componentes/compartilhados/cabecalho-pagina";
import type { TipoDocumentoEstoque } from "@prisma/client";

type Produto = { id: string; nome: string; unidade: string; custo: number | null };
type ItemLocal = {
  localId: string;
  produtoId: string;
  quantidade: number;
  quantidadeAnterior?: number;
  custo?: number;
};

type DocExistente = {
  id: string;
  numero?: string | null;
  data: string;
  fornecedorId?: string | null;
  acaoId?: string | null;
  responsavelId?: string | null;
  observacao?: string | null;
  itens: {
    produtoId: string;
    quantidade: number;
    quantidadeAnterior?: number | null;
    custo?: number | null;
  }[];
};

type Props = {
  documento?: DocExistente;
  tipo: TipoDocumentoEstoque;
  produtos: Produto[];
  fornecedores: { id: string; razaoSocial: string }[];
  acoes: { id: string; numero: string }[];
  usuarios: { id: string; name: string }[];
  onSubmit: (fd: FormData) => Promise<{ ok: boolean; id?: string; erro?: string }>;
};

const ROTULOS: Record<TipoDocumentoEstoque, string> = {
  ENTRADA: "Entrada",
  SAIDA: "Saída",
  INVENTARIO: "Inventário",
};

const CORES: Record<TipoDocumentoEstoque, string> = {
  ENTRADA: "verde",
  SAIDA: "vermelho",
  INVENTARIO: "azul",
};

let contadorLocal = 0;
function novoId() { return `local-${++contadorLocal}`; }

export function FormDocumentoEstoque({ documento, tipo, produtos, fornecedores, acoes, usuarios, onSubmit }: Props) {
  const router = useRouter();
  const hoje = new Date().toISOString().slice(0, 10);
  const [erro, setErro] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const [itens, setItens] = useState<ItemLocal[]>(
    documento?.itens?.length
      ? documento.itens.map((i) => ({
          localId: novoId(),
          produtoId: i.produtoId,
          quantidade: i.quantidade,
          quantidadeAnterior: i.quantidadeAnterior ?? undefined,
          custo: i.custo ?? undefined,
        }))
      : [{ localId: novoId(), produtoId: "", quantidade: 1 }]
  );

  function adicionarItem() {
    setItens((prev) => [...prev, { localId: novoId(), produtoId: "", quantidade: 1 }]);
  }

  function removerItem(localId: string) {
    setItens((prev) => prev.filter((i) => i.localId !== localId));
  }

  function atualizarItem(localId: string, campo: Partial<ItemLocal>) {
    setItens((prev) => prev.map((i) => (i.localId === localId ? { ...i, ...campo } : i)));
  }

  async function aoSelecionarProduto(localId: string, produtoId: string) {
    atualizarItem(localId, { produtoId });

    if (tipo === "INVENTARIO" && produtoId) {
      try {
        const res = await fetch(`/api/estoque/saldo?produtoId=${encodeURIComponent(produtoId)}`);
        if (res.ok) {
          const { quantidade } = await res.json() as { quantidade: number };
          atualizarItem(localId, { quantidadeAnterior: quantidade });
        }
      } catch { /* silencia */ }
    }

    if (tipo === "ENTRADA" && produtoId) {
      const prod = produtos.find((p) => p.id === produtoId);
      if (prod?.custo != null) {
        atualizarItem(localId, { custo: prod.custo });
      }
    }
  }

  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formRef.current) return;
    const fd = new FormData(formRef.current);

    const itensSerializados = itens
      .filter((i) => i.produtoId)
      .map((i) => ({
        produtoId: i.produtoId,
        quantidade: i.quantidade,
        ...(tipo === "INVENTARIO" && i.quantidadeAnterior != null ? { quantidadeAnterior: i.quantidadeAnterior } : {}),
        ...(tipo === "ENTRADA" && i.custo != null ? { custo: i.custo } : {}),
      }));

    fd.set("itens_json", JSON.stringify(itensSerializados));
    fd.set("tipo", tipo);

    setErro(null);
    startTransition(async () => {
      const resultado = await onSubmit(fd);
      if (!resultado.ok) { setErro(resultado.erro ?? "Erro ao salvar."); return; }
      if (resultado.id) router.push(`/estoque/${resultado.id}`);
      else router.push("/estoque");
    });
  }

  return (
    <div className="pagina-conteudo">
      <CabecalhoPagina
        etiqueta="Estoque"
        titulo={documento ? `Editar ${ROTULOS[tipo]}` : `Novo Documento — ${ROTULOS[tipo]}`}
        descricao={documento?.numero ?? "Preencha os dados e adicione os itens"}
        acao={
          <span className={`tag tag-${CORES[tipo]}`}>{ROTULOS[tipo]}</span>
        }
      />

      <form ref={formRef} onSubmit={handleSubmit}>
        {/* Cabeçalho */}
        <div className="painel" style={{ marginBottom: 18 }}>
          <div className="painel-cabecalho"><div><h2>Dados do documento</h2></div></div>
          <div className="form-completo" style={{ padding: "14px 19px" }}>
            <div className="form-completo-grupo">
              <label>
                Data
                <input name="data" type="date" required defaultValue={documento?.data ?? hoje} />
              </label>
              {tipo === "ENTRADA" && (
                <label>
                  Fornecedor
                  <select name="fornecedorId" defaultValue={documento?.fornecedorId ?? ""}>
                    <option value="">Nenhum</option>
                    {fornecedores.map((f) => <option key={f.id} value={f.id}>{f.razaoSocial}</option>)}
                  </select>
                </label>
              )}
              {tipo === "SAIDA" && (
                <label>
                  Ação vinculada
                  <select name="acaoId" defaultValue={documento?.acaoId ?? ""}>
                    <option value="">Nenhuma</option>
                    {acoes.map((a) => <option key={a.id} value={a.id}>{a.numero}</option>)}
                  </select>
                </label>
              )}
              <label>
                Responsável
                <select name="responsavelId" defaultValue={documento?.responsavelId ?? ""}>
                  <option value="">Nenhum</option>
                  {usuarios.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </label>
            </div>
            <label>
              Observações
              <textarea name="observacao" rows={2} defaultValue={documento?.observacao ?? ""} style={{ resize: "vertical" }} />
            </label>
          </div>
        </div>

        {/* Itens */}
        <div className="painel" style={{ marginBottom: 18 }}>
          <div className="painel-cabecalho">
            <div><h2>Itens</h2><p>{itens.length} item(s)</p></div>
            <button type="button" className="bt-link" onClick={adicionarItem} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}>
              <Plus size={13} /> Adicionar item
            </button>
          </div>

          <div style={{ padding: "14px 19px", display: "flex", flexDirection: "column", gap: 10 }}>
            {itens.map((item, idx) => (
              <div key={item.localId} style={{ display: "grid", gridTemplateColumns: "2fr 1fr" + (tipo !== "SAIDA" ? " 1fr" : "") + " auto", gap: 8, alignItems: "end", padding: "10px 12px", background: "var(--cor-fundo-2)", borderRadius: 7, border: "1px solid var(--cor-linha)" }}>
                <label style={{ margin: 0 }}>
                  {idx === 0 && <span style={{ fontSize: 11, fontWeight: 600, color: "var(--cor-texto-3)", marginBottom: 4, display: "block" }}>Produto</span>}
                  <select
                    value={item.produtoId}
                    onChange={(e) => aoSelecionarProduto(item.localId, e.target.value)}
                    required
                  >
                    <option value="">Selecione…</option>
                    {produtos.map((p) => <option key={p.id} value={p.id}>{p.nome} ({p.unidade})</option>)}
                  </select>
                </label>

                <label style={{ margin: 0 }}>
                  {idx === 0 && <span style={{ fontSize: 11, fontWeight: 600, color: "var(--cor-texto-3)", marginBottom: 4, display: "block" }}>Quantidade</span>}
                  <input
                    type="number"
                    min="1"
                    value={item.quantidade}
                    onChange={(e) => atualizarItem(item.localId, { quantidade: parseInt(e.target.value, 10) || 1 })}
                    required
                  />
                </label>

                {tipo === "INVENTARIO" && (
                  <label style={{ margin: 0 }}>
                    {idx === 0 && <span style={{ fontSize: 11, fontWeight: 600, color: "var(--cor-texto-3)", marginBottom: 4, display: "block" }}>Qtd Anterior</span>}
                    <input
                      type="number"
                      min="0"
                      value={item.quantidadeAnterior ?? ""}
                      readOnly
                      style={{ background: "var(--cor-fundo)", cursor: "not-allowed", opacity: 0.7 }}
                    />
                  </label>
                )}

                {tipo === "ENTRADA" && (
                  <label style={{ margin: 0 }}>
                    {idx === 0 && <span style={{ fontSize: 11, fontWeight: 600, color: "var(--cor-texto-3)", marginBottom: 4, display: "block" }}>Custo Unit.</span>}
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.custo ?? ""}
                      onChange={(e) => atualizarItem(item.localId, { custo: parseFloat(e.target.value) || undefined })}
                      placeholder="0,00"
                    />
                  </label>
                )}

                <button
                  type="button"
                  onClick={() => removerItem(item.localId)}
                  disabled={itens.length === 1}
                  title="Remover item"
                  style={{ background: "none", border: "1px solid var(--cor-linha)", borderRadius: 5, padding: "6px 8px", cursor: itens.length === 1 ? "not-allowed" : "pointer", opacity: itens.length === 1 ? 0.4 : 1, alignSelf: "flex-end" }}
                >
                  <X size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {erro && (
          <div className="painel" style={{ marginBottom: 18, padding: "12px 19px", borderLeft: "3px solid var(--cor-erro)" }}>
            <p style={{ color: "var(--cor-erro)", fontSize: 13, margin: 0 }}>{erro}</p>
          </div>
        )}

        <div style={{ display: "flex", gap: 8 }}>
          <button type="submit" className="botao" disabled={pending}>{pending ? "Salvando…" : "Salvar"}</button>
          <button type="button" className="bt-secundario" onClick={() => router.push("/estoque")} disabled={pending}>Cancelar</button>
        </div>
      </form>
    </div>
  );
}
