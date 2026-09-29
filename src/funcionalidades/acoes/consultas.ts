import type { AcaoPromocional } from "./tipos";
import type { Periodo } from "./schemas";

export function filtrarAcoesPorPeriodo(acoes: AcaoPromocional[], periodo: Periodo) {
  return acoes.filter(({ data }) => data >= periodo.inicio && data <= periodo.fim);
}

export function resumirAcoes(acoes: AcaoPromocional[]) {
  return {
    total: acoes.length,
    abertas: acoes.filter(({ status }) => status === "aberta").length,
    encerradas: acoes.filter(({ status }) => status === "encerrada").length,
    canceladas: acoes.filter(({ status }) => status === "cancelada").length,
  };
}
