export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CabecalhoPagina } from "@/componentes/compartilhados/cabecalho-pagina";
import { formatarDataCurta } from "@/lib/formatadores";
import { prisma } from "@/lib/prisma";

export default async function DegustadorasAcaoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const acao = await prisma.acao.findUnique({
    where: { id },
    select: {
      id: true,
      numero: true,
      titulo: true,
      status: true,
      acaoDegustadoras: {
        include: { degustadora: { select: { id: true, nome: true } } },
        orderBy: [{ dataTrabalho: "asc" }, { horaInicio: "asc" }],
      },
    },
  });

  if (!acao) notFound();

  return (
    <div className="pagina-conteudo">
      <div style={{ marginBottom: 16 }}>
        <Link href={`/acoes/${acao.id}`} style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--cor-texto-3)", fontSize: 11 }}>
          <ArrowLeft size={14} /> Voltar para a ação
        </Link>
      </div>

      <CabecalhoPagina
        etiqueta="Ações"
        titulo={`Degustadoras — ${acao.numero}`}
        descricao={`${acao.titulo} · ${acao.acaoDegustadoras.length} agendamento(s)`}
      />

      <div className="painel">
        <div className="painel-cabecalho">
          <div>
            <h2>Agendamentos de degustadoras</h2>
            <p>{acao.acaoDegustadoras.length} registro(s)</p>
          </div>
        </div>

        {acao.acaoDegustadoras.length > 0 ? (
          <div className="tabela-wrap">
            <table>
              <thead>
                <tr>
                  <th>Degustadora</th>
                  <th>Data de trabalho</th>
                  <th>Hora início</th>
                  <th>Hora fim</th>
                  <th>Observações</th>
                </tr>
              </thead>
              <tbody>
                {acao.acaoDegustadoras.map((d) => (
                  <tr key={d.id}>
                    <td><strong>{d.degustadora.nome}</strong></td>
                    <td>{formatarDataCurta(d.dataTrabalho.toISOString().slice(0, 10))}</td>
                    <td>{d.horaInicio}</td>
                    <td>{d.horaFim}</td>
                    <td>{d.observacoes ?? <span style={{ color: "var(--cor-texto-3)" }}>—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="estado-vazio">
            <strong>Nenhuma degustadora vinculada a esta ação.</strong>
            <span>Edite a ação para adicionar degustadoras.</span>
          </div>
        )}
      </div>
    </div>
  );
}
