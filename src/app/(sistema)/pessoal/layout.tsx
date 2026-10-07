import { exigirPermissaoPagina } from "@/lib/autorizacao";

export default async function LayoutPessoal({ children }: { children: React.ReactNode }) {
  await exigirPermissaoPagina("MUTAR_PESSOAL");
  return <>{children}</>;
}
