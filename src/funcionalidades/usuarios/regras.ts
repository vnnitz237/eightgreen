import type { PapelUsuario } from "@prisma/client";

export type EstadoAdministrador = { papel: PapelUsuario; ativo: boolean };

export function remocaoExigeOutroAdministrador(antes: EstadoAdministrador, depois: EstadoAdministrador) {
  return antes.papel === "ADMINISTRADOR" && antes.ativo && (depois.papel !== "ADMINISTRADOR" || !depois.ativo);
}

export function validarUltimoAdministrador(quantidadeAtivos: number, antes: EstadoAdministrador, depois: EstadoAdministrador) {
  if (remocaoExigeOutroAdministrador(antes, depois) && quantidadeAtivos <= 1) {
    throw new Error("O último administrador ativo não pode ser rebaixado ou inativado.");
  }
}
