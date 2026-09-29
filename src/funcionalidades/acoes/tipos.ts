export type StatusAcao = "aberta" | "encerrada" | "cancelada";

export type AcaoPromocional = {
  id: string;
  titulo: string;
  data: string;
  horario: `${number}:${number}`;
  status: StatusAcao;
  distribuidora: { id: string; nome: string } | null;
  estabelecimento: { modo: "cadastrado"; id: string; nome: string } | { modo: "avulso"; nome: string };
  profissionais: Array<{ id: string; nome: string; modo: "cadastrada" | "avulsa" }>;
  produtos: Array<{ id: string; nome: string; quantidadePlanejada: number }>;
};

export interface RepositorioAcoes {
  listar(): Promise<AcaoPromocional[]>;
}
