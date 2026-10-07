export const dynamic = "force-dynamic";

import { Dashboard } from "@/funcionalidades/dashboard/dashboard";
import { buscarDadosDashboard, buscarAcoesDegustadora } from "@/funcionalidades/dashboard/consultas";
import { exigirUsuario } from "@/lib/autorizacao";

export default async function Home() {
  const usuario = await exigirUsuario();
  if (usuario.papel !== "ADMINISTRADOR") {
    const acoes = await buscarAcoesDegustadora(usuario.degustadoraId ?? null);
    return <Dashboard acoes={acoes} saldoEstoque={[]} alertas={{ cpVencidas: 0, crVencidas: 0, saldoNegativo: 0 }} modoFuncionario />;
  }
  const { acoes, saldoEstoque, alertas } = await buscarDadosDashboard();
  return <Dashboard acoes={acoes} saldoEstoque={saldoEstoque} alertas={alertas} />;
}
