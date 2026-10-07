import { exigirPermissaoPagina } from "@/lib/autorizacao";

export default async function LayoutFinanceiro({ children }: { children: React.ReactNode }) {
  await exigirPermissaoPagina("MUTAR_FINANCEIRO");
  return <>{children}</>;
}
