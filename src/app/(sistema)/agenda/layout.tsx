import { exigirPermissaoPagina } from "@/lib/autorizacao";

export default async function LayoutAgenda({ children }: { children: React.ReactNode }) {
  await exigirPermissaoPagina("MUTAR_PESSOAL");
  return <>{children}</>;
}
