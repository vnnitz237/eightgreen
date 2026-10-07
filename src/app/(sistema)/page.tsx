export const dynamic = "force-dynamic";

import { Dashboard } from "@/funcionalidades/dashboard/dashboard";
import { buscarDadosDashboard } from "@/funcionalidades/dashboard/consultas";

export default async function Home() {
  const { acoes, saldoEstoque, alertas } = await buscarDadosDashboard();
  return <Dashboard acoes={acoes} saldoEstoque={saldoEstoque} alertas={alertas} />;
}
