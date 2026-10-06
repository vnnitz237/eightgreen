"use client";

import { useId, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import { CabecalhoPagina } from "@/componentes/compartilhados/cabecalho-pagina";

type Distribuidora = { id: string; nome: string };
type Estabelecimento = { id: string; nome: string };
type Produto = { id: string; nome: string; unidade: string };
type DegustadoraOpc = { id: string; nome: string };

type ProdutoLinha = {
  uid: string;
  produtoId: string;
  quantidade: number;
  preco: number;
};

type DegustadoraLinha = {
  uid: string;
  degustadoraId: string;
  dataTrabalho: string;
  horaInicio: string;
  horaFim: string;
  observacoes: string;
};

export type AcaoParaEditar = {
  id: string;
  numero: string;
  titulo: string;
  data: string;          // YYYY-MM-DD
  dataFim: string | null;
  horario: string;
  status: string;
  distribuidoraId: string | null;
  estabelecimentoId: string | null;
  estabelecimentoAvulso: string | null;
  observacoes: string | null;
  produtos: { produtoId: string; quantidadePlanejada: number; preco: number }[];
  acaoDegustadoras: {
    degustadoraId: string;
    dataTrabalho: string;
    horaInicio: string;
    horaFim: string;
    observacoes: string | null;
  }[];
};

type Props = {
  acao?: AcaoParaEditar;
  distribuidoras: Distribuidora[];
  estabelecimentos: Estabelecimento[];
  produtos: Produto[];
  degustadoras: DegustadoraOpc[];
  onSubmit: (formData: FormData) => Promise<{ ok: boolean; id?: string; erro?: string } | void>;
};

const hoje = new Date().toISOString().slice(0, 10);

function uid() {
  return Math.random().toString(36).slice(2);
}

export function FormAcao({
  acao,
  distribuidoras,
  estabelecimentos,
  produtos,
  degustadoras,
  onSubmit,
}: Props) {
  const modoEdicao = !!acao;
  const router = useRouter();
  const prefixo = useId();
  const [pending, startTransition] = useTransition();
  const [erro, setErro] = useState("");

  // Modo estabelecimento
  const [modoEstab, setModoEstab] = useState<"cadastrado" | "avulso">(
    acao?.estabelecimentoAvulso ? "avulso" : "cadastrado"
  );

  // Produtos
  const [linhasProduto, setLinhasProduto] = useState<ProdutoLinha[]>(() => {
    if (acao?.produtos.length) {
      return acao.produtos.map((p) => ({
        uid: uid(),
        produtoId: p.produtoId,
        quantidade: p.quantidadePlanejada,
        preco: Number(p.preco),
      }));
    }
    return [{ uid: uid(), produtoId: "", quantidade: 1, preco: 0 }];
  });

  // Degustadoras
  const [linhasDegust, setLinhasDegust] = useState<DegustadoraLinha[]>(() => {
    if (acao?.acaoDegustadoras.length) {
      return acao.acaoDegustadoras.map((d) => ({
        uid: uid(),
        degustadoraId: d.degustadoraId,
        dataTrabalho: d.dataTrabalho,
        horaInicio: d.horaInicio,
        horaFim: d.horaFim,
        observacoes: d.observacoes ?? "",
      }));
    }
    return [];
  });

  function adicionarProduto() {
    setLinhasProduto((prev) => [
      ...prev,
      { uid: uid(), produtoId: "", quantidade: 1, preco: 0 },
    ]);
  }

  function removerProduto(u: string) {
    if (linhasProduto.length <= 1) return;
    setLinhasProduto((prev) => prev.filter((l) => l.uid !== u));
  }

  function atualizarProduto(u: string, campo: keyof ProdutoLinha, valor: string | number) {
    setLinhasProduto((prev) =>
      prev.map((l) => (l.uid === u ? { ...l, [campo]: valor } : l))
    );
  }

  function aoSelecionarProduto(u: string, produtoId: string) {
    const prod = produtos.find((p) => p.id === produtoId);
    setLinhasProduto((prev) =>
      prev.map((l) => (l.uid === u ? { ...l, produtoId, preco: 0 } : l))
    );
    void prod; // preço não está disponível aqui (sem precoVenda no schema)
  }

  function adicionarDegustadora() {
    setLinhasDegust((prev) => [
      ...prev,
      { uid: uid(), degustadoraId: "", dataTrabalho: hoje, horaInicio: "08:00", horaFim: "17:00", observacoes: "" },
    ]);
  }

  function removerDegustadora(u: string) {
    setLinhasDegust((prev) => prev.filter((l) => l.uid !== u));
  }

  function atualizarDegustadora(u: string, campo: keyof DegustadoraLinha, valor: string) {
    setLinhasDegust((prev) =>
      prev.map((l) => (l.uid === u ? { ...l, [campo]: valor } : l))
    );
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro("");

    if (linhasProduto.some((l) => !l.produtoId)) {
      setErro("Selecione o produto em todas as linhas.");
      return;
    }

    const fd = new FormData(e.currentTarget);
    fd.set(
      "produtos_json",
      JSON.stringify(
        linhasProduto.map((l) => ({
          produtoId: l.produtoId,
          quantidade: l.quantidade,
          preco: l.preco,
        }))
      )
    );
    fd.set(
      "degustadoras_json",
      JSON.stringify(
        linhasDegust
          .filter((l) => l.degustadoraId)
          .map((l) => ({
            degustadoraId: l.degustadoraId,
            dataTrabalho: l.dataTrabalho,
            horaInicio: l.horaInicio,
            horaFim: l.horaFim,
            observacoes: l.observacoes || undefined,
          }))
      )
    );

    startTransition(async () => {
      try {
        const resultado = await onSubmit(fd);
        if (resultado && !resultado.ok) {
          setErro(resultado.erro ?? "Erro ao salvar.");
          return;
        }
        if (resultado && resultado.ok && resultado.id) {
          router.push(`/acoes/${resultado.id}`);
        } else if (resultado && resultado.ok) {
          router.back();
        }
      } catch (err) {
        setErro(err instanceof Error ? err.message : "Erro ao salvar.");
      }
    });
  }

  return (
    <div className="pagina-conteudo">
      <CabecalhoPagina
        etiqueta="Ações"
        titulo={modoEdicao ? `Editar ${acao.numero}` : "Nova ação promocional"}
        descricao={modoEdicao ? "Altere os dados da ação aberta." : "Preencha os dados para criar uma nova ação."}
      />

      <form onSubmit={handleSubmit}>
        {/* ── Dados gerais ─────────────────────────────────────────── */}
        <div className="painel" style={{ marginBottom: 18 }}>
          <div className="painel-cabecalho"><div><h2>Dados gerais</h2></div></div>
          <div className="form-completo">
            <div className="form-completo-grupo">
              <label style={{ gridColumn: "1/-1" }}>
                Título <span style={{ color: "var(--cor-erro)" }}>*</span>
                <input name="titulo" required defaultValue={acao?.titulo ?? ""} placeholder="Ex: Ativação Linha Energia" />
              </label>
            </div>

            <div className="form-completo-grupo">
              <label>
                Data início <span style={{ color: "var(--cor-erro)" }}>*</span>
                <input name="data" type="date" required defaultValue={acao?.data ?? hoje} />
              </label>
              <label>
                Data fim
                <input name="dataFim" type="date" defaultValue={acao?.dataFim ?? ""} />
              </label>
              <label>
                Horário <span style={{ color: "var(--cor-erro)" }}>*</span>
                <input name="horario" type="time" required defaultValue={acao?.horario ?? "09:00"} />
              </label>
            </div>

            <div className="form-completo-grupo">
              <label>
                Distribuidora
                <select name="distribuidoraId" defaultValue={acao?.distribuidoraId ?? ""}>
                  <option value="">Sem distribuidora</option>
                  {distribuidoras.map((d) => (
                    <option key={d.id} value={d.id}>{d.nome}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="form-completo-grupo">
              <div>
                <div style={{ display: "flex", gap: 16, marginBottom: 8 }}>
                  <label style={{ flexDirection: "row", alignItems: "center", gap: 6, cursor: "pointer", fontWeight: 500 }}>
                    <input type="radio" name="_modoEstab" value="cadastrado" checked={modoEstab === "cadastrado"} onChange={() => setModoEstab("cadastrado")} />
                    Estabelecimento cadastrado
                  </label>
                  <label style={{ flexDirection: "row", alignItems: "center", gap: 6, cursor: "pointer", fontWeight: 500 }}>
                    <input type="radio" name="_modoEstab" value="avulso" checked={modoEstab === "avulso"} onChange={() => setModoEstab("avulso")} />
                    Local avulso
                  </label>
                </div>
                {modoEstab === "cadastrado" ? (
                  <>
                    <select name="estabelecimentoId" defaultValue={acao?.estabelecimentoId ?? ""}>
                      <option value="">Selecione...</option>
                      {estabelecimentos.map((e) => (
                        <option key={e.id} value={e.id}>{e.nome}</option>
                      ))}
                    </select>
                    <input type="hidden" name="estabelecimentoAvulso" value="" />
                  </>
                ) : (
                  <>
                    <input name="estabelecimentoAvulso" placeholder="Ex: Praça Central" defaultValue={acao?.estabelecimentoAvulso ?? ""} />
                    <input type="hidden" name="estabelecimentoId" value="" />
                  </>
                )}
              </div>
            </div>

            <div className="form-completo-grupo">
              <label style={{ gridColumn: "1/-1" }}>
                Observações
                <textarea name="observacoes" rows={3} defaultValue={acao?.observacoes ?? ""} placeholder="Informações adicionais..." style={{ resize: "vertical" }} />
              </label>
            </div>
          </div>
        </div>

        {/* ── Produtos ─────────────────────────────────────────────── */}
        <div className="painel" style={{ marginBottom: 18 }}>
          <div className="painel-cabecalho">
            <div><h2>Produtos</h2><p>Ao menos 1 produto obrigatório</p></div>
            <button type="button" className="bt-secundario" onClick={adicionarProduto} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Plus size={14} /> Adicionar produto
            </button>
          </div>

          <div style={{ padding: "0 19px 19px" }}>
            {linhasProduto.map((linha, idx) => (
              <div key={linha.uid} style={{ display: "grid", gridTemplateColumns: "1fr 100px 120px auto", gap: 10, alignItems: "end", marginBottom: 10 }}>
                <label>
                  {idx === 0 && <span style={{ fontSize: 10, color: "var(--cor-texto-2)", fontWeight: 700, textTransform: "uppercase" }}>Produto</span>}
                  <select
                    value={linha.produtoId}
                    onChange={(e) => aoSelecionarProduto(linha.uid, e.target.value)}
                    required
                    id={`${prefixo}-prod-${linha.uid}`}
                  >
                    <option value="">Selecione...</option>
                    {produtos.map((p) => (
                      <option key={p.id} value={p.id}>{p.nome}</option>
                    ))}
                  </select>
                </label>
                <label>
                  {idx === 0 && <span style={{ fontSize: 10, color: "var(--cor-texto-2)", fontWeight: 700, textTransform: "uppercase" }}>Qtd</span>}
                  <input
                    type="number"
                    min={1}
                    value={linha.quantidade}
                    onChange={(e) => atualizarProduto(linha.uid, "quantidade", Number(e.target.value))}
                    required
                  />
                </label>
                <label>
                  {idx === 0 && <span style={{ fontSize: 10, color: "var(--cor-texto-2)", fontWeight: 700, textTransform: "uppercase" }}>Preço unit.</span>}
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={linha.preco}
                    onChange={(e) => atualizarProduto(linha.uid, "preco", Number(e.target.value))}
                    required
                  />
                </label>
                <div style={{ paddingBottom: 2 }}>
                  {idx === 0 && <div style={{ height: 18 }} />}
                  <button
                    type="button"
                    className="bt-danger"
                    onClick={() => removerProduto(linha.uid)}
                    disabled={linhasProduto.length <= 1}
                    style={{ height: 34, width: 34, padding: 0, display: "grid", placeItems: "center" }}
                    aria-label="Remover produto"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Degustadoras ─────────────────────────────────────────── */}
        <div className="painel" style={{ marginBottom: 18 }}>
          <div className="painel-cabecalho">
            <div><h2>Degustadoras</h2><p>Opcional</p></div>
            <button type="button" className="bt-secundario" onClick={adicionarDegustadora} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Plus size={14} /> Adicionar degustadora
            </button>
          </div>

          {linhasDegust.length === 0 ? (
            <div className="estado-vazio" style={{ minHeight: 80 }}>
              <span>Nenhuma degustadora vinculada</span>
            </div>
          ) : (
            <div style={{ padding: "0 19px 19px" }}>
              {linhasDegust.map((linha, idx) => (
                <div key={linha.uid} style={{ display: "grid", gridTemplateColumns: "1fr 140px 90px 90px auto", gap: 10, alignItems: "end", marginBottom: 10 }}>
                  <label>
                    {idx === 0 && <span style={{ fontSize: 10, color: "var(--cor-texto-2)", fontWeight: 700, textTransform: "uppercase" }}>Degustadora</span>}
                    <select
                      value={linha.degustadoraId}
                      onChange={(e) => atualizarDegustadora(linha.uid, "degustadoraId", e.target.value)}
                    >
                      <option value="">Selecione...</option>
                      {degustadoras.map((d) => (
                        <option key={d.id} value={d.id}>{d.nome}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    {idx === 0 && <span style={{ fontSize: 10, color: "var(--cor-texto-2)", fontWeight: 700, textTransform: "uppercase" }}>Data de trabalho</span>}
                    <input
                      type="date"
                      value={linha.dataTrabalho}
                      onChange={(e) => atualizarDegustadora(linha.uid, "dataTrabalho", e.target.value)}
                    />
                  </label>
                  <label>
                    {idx === 0 && <span style={{ fontSize: 10, color: "var(--cor-texto-2)", fontWeight: 700, textTransform: "uppercase" }}>Início</span>}
                    <input
                      type="time"
                      value={linha.horaInicio}
                      onChange={(e) => atualizarDegustadora(linha.uid, "horaInicio", e.target.value)}
                    />
                  </label>
                  <label>
                    {idx === 0 && <span style={{ fontSize: 10, color: "var(--cor-texto-2)", fontWeight: 700, textTransform: "uppercase" }}>Fim</span>}
                    <input
                      type="time"
                      value={linha.horaFim}
                      onChange={(e) => atualizarDegustadora(linha.uid, "horaFim", e.target.value)}
                    />
                  </label>
                  <div style={{ paddingBottom: 2 }}>
                    {idx === 0 && <div style={{ height: 18 }} />}
                    <button
                      type="button"
                      className="bt-danger"
                      onClick={() => removerDegustadora(linha.uid)}
                      style={{ height: 34, width: 34, padding: 0, display: "grid", placeItems: "center" }}
                      aria-label="Remover degustadora"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Campos hidden para arrays serializados */}
        <input type="hidden" name="produtos_json" />
        <input type="hidden" name="degustadoras_json" />

        {/* ── Rodapé ───────────────────────────────────────────────── */}
        {erro && (
          <div style={{ background: "#fff0f0", border: "1px solid #f5c0bb", borderRadius: 8, padding: "10px 16px", marginBottom: 14, color: "var(--cor-erro)", fontSize: 12 }}>
            {erro}
          </div>
        )}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <Link href="/acoes" className="bt-secundario">Cancelar</Link>
          <button type="submit" className="botao" disabled={pending}>
            {pending ? "Salvando..." : "Salvar ação"}
          </button>
        </div>
      </form>
    </div>
  );
}
