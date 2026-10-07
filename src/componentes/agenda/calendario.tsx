"use client";

import dynamic from "next/dynamic";
import { useState, useCallback, useEffect, useRef } from "react";
import { ModalCompromisso } from "./modal-compromisso";
import type { CalendarEvent } from "@/types/agenda";

const FullCalendar = dynamic(() => import("@fullcalendar/react"), { ssr: false });

const carregarPlugins = () =>
  Promise.all([
    import("@fullcalendar/daygrid"),
    import("@fullcalendar/timegrid"),
    import("@fullcalendar/interaction"),
    import("@fullcalendar/list"),
  ]).then(([dg, tg, ia, ls]) => [dg.default, tg.default, ia.default, ls.default]);

type Props = {
  estabelecimentos: { id: string; nome: string }[];
  responsaveis: { id: string; nome: string }[];
};

export function Calendario({ estabelecimentos, responsaveis }: Props) {
  const [eventos, setEventos] = useState<CalendarEvent[]>([]);
  const [plugins, setPlugins] = useState<unknown[]>([]);
  const [pluginsCarregados, setPluginsCarregados] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [eventoSelecionado, setEventoSelecionado] = useState<CalendarEvent | null>(null);
  const [dataInicial, setDataInicial] = useState<string>("");

  const carregarRef = useRef(false);

  const inicializar = useCallback(async () => {
    if (carregarRef.current) return;
    carregarRef.current = true;
    const p = await carregarPlugins();
    setPlugins(p);
    setPluginsCarregados(true);
  }, []);

  useEffect(() => {
    void inicializar();
  }, [inicializar]);

  async function carregarEventos(inicio: string, fim: string) {
    const res = await fetch(`/api/agenda/eventos?de=${encodeURIComponent(inicio)}&ate=${encodeURIComponent(fim)}`);
    if (res.ok) {
      const dados = await res.json() as CalendarEvent[];
      setEventos(dados);
    }
  }

  function abrirNovo(data: string) {
    setEventoSelecionado(null);
    setDataInicial(data);
    setModalAberto(true);
  }

  function abrirEvento(evento: CalendarEvent) {
    setEventoSelecionado(evento);
    setDataInicial("");
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setEventoSelecionado(null);
  }

  async function aoSalvar() {
    fecharModal();
    const cal = document.querySelector(".fc") as HTMLElement & { __fcCalendar?: { getView: () => { activeStart: Date; activeEnd: Date } } };
    if (cal?.__fcCalendar) {
      const view = cal.__fcCalendar.getView();
      await carregarEventos(view.activeStart.toISOString(), view.activeEnd.toISOString());
    } else {
      const hoje = new Date();
      const ini = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString();
      const fim = new Date(hoje.getFullYear(), hoje.getMonth() + 2, 0).toISOString();
      await carregarEventos(ini, fim);
    }
  }

  if (!pluginsCarregados) {
    return <div style={{ padding: 40, textAlign: "center", color: "var(--cor-texto-3)" }}>Carregando calendário…</div>;
  }

  return (
    <>
      <div className="painel" style={{ overflow: "hidden" }}>
        <style>{`
          .fc { font-family: inherit; }
          .fc-toolbar-title { font-size: 15px !important; font-weight: 600; }
          .fc-button { background: var(--cor-fundo-2) !important; border: 1px solid var(--cor-linha) !important; color: var(--cor-texto) !important; font-size: 12px !important; padding: 4px 10px !important; border-radius: 6px !important; box-shadow: none !important; }
          .fc-button-primary:not(:disabled):active, .fc-button-primary:not(:disabled).fc-button-active { background: var(--cor-primaria) !important; color: #fff !important; border-color: var(--cor-primaria) !important; }
          .fc-today-button { opacity: 1 !important; }
          .fc-daygrid-day.fc-day-today { background: color-mix(in srgb, var(--cor-primaria) 8%, transparent) !important; }
          .fc-event { border-radius: 4px !important; font-size: 11px !important; padding: 1px 4px !important; cursor: pointer; }
          .fc-col-header-cell { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; }
          .fc-daygrid-day-number { font-size: 12px; }
          .fc-list-event:hover td { background: var(--cor-fundo-2) !important; cursor: pointer; }
        `}</style>
        <FullCalendar
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          plugins={plugins as any[]}
          initialView="dayGridMonth"
          locale="pt-br"
          headerToolbar={{ left: "prev,next today", center: "title", right: "dayGridMonth,timeGridWeek,listMonth" }}
          height="auto"
          events={eventos}
          datesSet={async (arg) => {
            await carregarEventos(arg.startStr, arg.endStr);
          }}
          dateClick={(arg) => abrirNovo(arg.dateStr)}
          eventClick={(arg) => abrirEvento(arg.event as unknown as CalendarEvent)}
          editable={false}
          selectable={false}
        />
      </div>

      {modalAberto && (
        <ModalCompromisso
          evento={eventoSelecionado}
          dataInicial={dataInicial}
          estabelecimentos={estabelecimentos}
          responsaveis={responsaveis}
          onFechar={fecharModal}
          onSalvar={aoSalvar}
        />
      )}
    </>
  );
}
