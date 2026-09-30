"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Plus } from "lucide-react";
import { CabecalhoPagina } from "@/componentes/compartilhados/cabecalho-pagina";
import { Status } from "@/componentes/ui/status";
import { formatarDataCurta } from "@/lib/formatadores";
import type { AcaoPromocional, StatusAcao } from "./tipos";

const FILTROS: { valor: StatusAcao | null; label: string }[] = [
  { valor: null, label: "Todas" },
  { valor: "aberta", label: "Abertas" },
  { valor: "encerrada", label: "Encerradas" },
  { valor: "cancelada", label: "Canceladas" },
];

export function ListaAcoes({ acoes }: { acoes: AcaoPromocional[] }) {
  const [filtro, setFiltro] = useState<StatusAcao | null>(null);
  const filtradas = filtro ? acoes.filter((a) => a.status === filtro) : acoes;

  return (
    <div className="pagina-conteudo">
      <CabecalhoPagina
        etiqueta="Operação"
        titulo="Ações promocionais"
        descricao={`${acoes.length} ação${acoes.length !== 1 ? "ões" : ""} cadastradas`}
        acao={
          <Link href="/acoes/nova" className="botao" style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <Plus size={15} /> Nova ação
          </Link>
        }
      />

      <div className="painel">
        <div className="painel-cabecalho">
          <div>
            <h2>Lista de ações</h2>
            <p>{filtradas.length} {filtro ? `com status "${filtro}"` : "no total"}</p>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {FILTROS.map((f) => (
              <button
                key={String(f.valor)}
                onClick={() => setFiltro(f.valor)}
                className={filtro === f.valor ? "botao" : "bt-secundario"}
                style={{ height: 30, fontSize: 10, padding: "0 12px" }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {filtradas.length > 0 ? (
          <div className="tabela-wrap">
            <table>
              <thead>
                <tr>
                  <th>Ação</th>
                  <th>Data</th>
                  <th>Distribuidora</th>
                  <th>Estabelecimento</th>
                  <th>Status</th>
                  <th aria-label="Abrir" />
                </tr>
              </thead>
              <tbody>
                {filtradas.map((acao) => (
                  <tr key={acao.id}>
                    <td>
                      <strong>{acao.titulo}</strong>
                      <small>{acao.id} · {acao.horario}</small>
                    </td>
                    <td>{formatarDataCurta(acao.data)}</td>
                    <td>{acao.distribuidora?.nome ?? <span style={{ color: "var(--muted)" }}>—</span>}</td>
                    <td>{acao.estabelecimento.nome}</td>
                    <td><Status valor={acao.status} /></td>
                    <td>
                      <Link href={`/acoes/${acao.id}`} aria-label={`Abrir ${acao.titulo}`}>
                        <ChevronRight size={18} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="estado-vazio">
            <strong>Nenhuma ação{filtro ? ` com status "${filtro}"` : ""}</strong>
            <span>Clique em &quot;Nova ação&quot; para cadastrar.</span>
          </div>
        )}
      </div>
    </div>
  );
}
