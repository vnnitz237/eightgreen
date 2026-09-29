import { z } from "zod";

export const periodoSchema = z.object({
  inicio: z.iso.date(),
  fim: z.iso.date(),
}).refine(({ inicio, fim }) => inicio <= fim, {
  message: "A data inicial deve ser anterior ou igual à final.",
  path: ["fim"],
});

export type Periodo = z.infer<typeof periodoSchema>;
