"use client";

import type { CSSProperties, MouseEvent, ReactNode } from "react";

type BotaoSubmitConfirmacaoProps = {
  children: ReactNode;
  mensagem: string;
  className?: string;
  style?: CSSProperties;
};

export function BotaoSubmitConfirmacao({
  children,
  mensagem,
  className,
  style,
}: BotaoSubmitConfirmacaoProps) {
  function confirmarEnvio(evento: MouseEvent<HTMLButtonElement>) {
    if (!window.confirm(mensagem)) {
      evento.preventDefault();
    }
  }

  return (
    <button type="submit" className={className} style={style} onClick={confirmarEnvio}>
      {children}
    </button>
  );
}
