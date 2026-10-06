import { Shell } from "@/componentes/layout/shell";
import { exigirUsuario } from "@/lib/autorizacao";

export default async function LayoutSistema({ children }: { children: React.ReactNode }) {
  const usuario = await exigirUsuario();
  return <Shell usuario={{ nome: usuario.name, email: usuario.email, papel: usuario.papel }}>{children}</Shell>;
}
