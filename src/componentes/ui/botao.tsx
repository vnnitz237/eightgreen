import type { ButtonHTMLAttributes } from "react";

export function Botao({ className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`botao ${className}`} {...props} />;
}
