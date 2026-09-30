export const dynamic = "force-dynamic";

import { listarDistribuidoras, listarEstabelecimentos } from "@/funcionalidades/cadastros/consultas";
import { FormNovaAcao } from "@/funcionalidades/acoes/form-nova-acao";

export default async function NovaAcaoPage() {
  const [distribuidoras, estabelecimentos] = await Promise.all([
    listarDistribuidoras(),
    listarEstabelecimentos(),
  ]);
  return <FormNovaAcao distribuidoras={distribuidoras} estabelecimentos={estabelecimentos} />;
}
