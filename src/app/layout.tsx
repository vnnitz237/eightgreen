import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: { default: "Eight Green · Gestão", template: "%s · Eight Green" }, description: "Demonstração da nova base de gestão Eight Green" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
