export type CalendarEvent = {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  color?: string;
  extendedProps: {
    tipo: string;
    observacoes?: string | null;
    estabelecimentoId?: string | null;
    estabelecimentoNome?: string | null;
    acaoId?: string | null;
    acaoNumero?: string | null;
    responsavelId?: string | null;
    responsavelNome?: string | null;
  };
};

export type CompromissoForm = {
  titulo: string;
  tipo: string;
  inicio: string;
  fim: string;
  diaInteiro: boolean;
  observacoes?: string;
  estabelecimentoId?: string;
  acaoId?: string;
  responsavelId?: string;
};
