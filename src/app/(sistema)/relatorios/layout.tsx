import { exigirPermissaoPagina } from "@/lib/autorizacao";

export default async function LayoutRelatorios({ children }: { children: React.ReactNode }) {
  await exigirPermissaoPagina("MUTAR_ACOES");
  return <>{children}</>;
}
