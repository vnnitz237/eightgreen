import type { StatusAcao } from "@/funcionalidades/acoes/tipos";

export function Status({ valor }: { valor: StatusAcao }) {
  return <span className={`status status-${valor}`}><span aria-hidden="true" />{valor}</span>;
}
