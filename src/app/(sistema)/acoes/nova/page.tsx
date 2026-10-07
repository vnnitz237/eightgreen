export const dynamic = "force-dynamic";

import { FormAcao } from "@/funcionalidades/acoes/form-acao";
import { criarAcao } from "@/funcionalidades/acoes/actions";
import { listarDistribuidoras, listarEstabelecimentos, listarProdutos, listarDegustadoras } from "@/funcionalidades/cadastros/consultas";

export default async function NovaAcaoPage() {
  const [distribuidoras, estabelecimentos, produtos, degustadoras] = await Promise.all([
    listarDistribuidoras(),
    listarEstabelecimentos(),
    listarProdutos(),
    listarDegustadoras(),
  ]);

  async function submit(formData: FormData) {
    "use server";
    return criarAcao(formData);
  }

  return (
    <FormAcao
      distribuidoras={distribuidoras.map((d) => ({ id: d.id, nome: d.nome }))}
      estabelecimentos={estabelecimentos.map((e) => ({ id: e.id, nome: e.razaoSocial }))}
      produtos={produtos.map((p) => ({ id: p.id, nome: p.nome, unidade: p.unidade }))}
      degustadoras={degustadoras.map((d) => ({ id: d.id, nome: d.nome }))}
      onSubmit={submit}
    />
  );
}
