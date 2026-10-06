import { z } from "zod";

export const periodoSchema = z.object({
  inicio: z.iso.date(),
  fim: z.iso.date(),
}).refine(({ inicio, fim }) => inicio <= fim, {
  message: "A data inicial deve ser anterior ou igual à final.",
  path: ["fim"],
});

export type Periodo = z.infer<typeof periodoSchema>;

export const acaoMutacaoSchema = z.object({
  titulo: z.string().trim().min(1, "Título obrigatório"),
  data: z.string().date("Data inválida"),
  horario: z.string().regex(/^\d{2}:\d{2}$/, "Horário inválido"),
  distribuidoraId: z.string().nullable().optional(),
  estabelecimentoId: z.string().nullable().optional(),
  estabelecimentoAvulso: z.string().trim().nullable().optional(),
}).superRefine(({ estabelecimentoId, estabelecimentoAvulso }, contexto) => {
  const cadastrado = Boolean(estabelecimentoId);
  const avulso = Boolean(estabelecimentoAvulso);
  if (cadastrado === avulso) contexto.addIssue({ code: "custom", path: ["estabelecimentoId"], message: "Informe um estabelecimento cadastrado ou um local avulso." });
});
