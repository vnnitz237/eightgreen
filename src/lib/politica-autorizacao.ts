import type { PapelUsuario } from "@prisma/client";

export type Operacao =
  | "LER_SISTEMA"
  | "MUTAR_ACOES"
  | "MUTAR_CADASTROS"
  | "MUTAR_ESTOQUE"
  | "MUTAR_FINANCEIRO"
  | "MUTAR_MERCHAN"
  | "MUTAR_PESSOAL"
  | "ADMINISTRAR_USUARIOS";

const permissoes: Record<PapelUsuario, ReadonlySet<Operacao>> = {
  ADMINISTRADOR: new Set<Operacao>(["LER_SISTEMA", "MUTAR_ACOES", "MUTAR_CADASTROS", "MUTAR_ESTOQUE", "MUTAR_FINANCEIRO", "MUTAR_MERCHAN", "MUTAR_PESSOAL", "ADMINISTRAR_USUARIOS"]),
  FUNCIONARIO: new Set<Operacao>(["LER_SISTEMA"]),
};

export function papelPode(papel: PapelUsuario, operacao: Operacao) {
  return permissoes[papel].has(operacao);
}
