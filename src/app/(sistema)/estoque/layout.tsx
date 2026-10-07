import { exigirPermissaoPagina } from "@/lib/autorizacao";

export default async function LayoutEstoque({ children }: { children: React.ReactNode }) {
  await exigirPermissaoPagina("MUTAR_ESTOQUE");
  return <>{children}</>;
}
