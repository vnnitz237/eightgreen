const formatadorData = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  timeZone: "America/Fortaleza",
});

export function formatarDataCurta(data: string) {
  return formatadorData.format(new Date(`${data}T12:00:00-03:00`)).replace(" de ", " ");
}

export function formatarInteiro(valor: number) {
  return new Intl.NumberFormat("pt-BR").format(valor);
}

export function formatarMoeda(valor: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor);
}
