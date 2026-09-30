import { redirect } from "next/navigation";
import { auth } from "@/autenticacao";
import { Shell } from "@/componentes/layout/shell";

export default async function LayoutSistema({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return <Shell usuario={session.user}>{children}</Shell>;
}
