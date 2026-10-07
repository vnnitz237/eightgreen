import { exigirPermissaoPagina } from "@/lib/autorizacao";

export default async function LayoutCadastros({ children }: { children: React.ReactNode }) {
  await exigirPermissaoPagina("MUTAR_CADASTROS");
  return <>{children}</>;
}
