import { exigirPermissaoPagina } from "@/lib/autorizacao";

export default async function LayoutMerchan({ children }: { children: React.ReactNode }) {
  await exigirPermissaoPagina("MUTAR_MERCHAN");
  return <>{children}</>;
}
