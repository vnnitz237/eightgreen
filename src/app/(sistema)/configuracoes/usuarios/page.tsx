export const dynamic = "force-dynamic";

import { CabecalhoPagina } from "@/componentes/compartilhados/cabecalho-pagina";
import { prisma } from "@/lib/prisma";
import { exigirAdministrador } from "@/lib/autorizacao";
import { atualizarUsuario, provisionarUsuario, reenviarAcesso } from "@/funcionalidades/usuarios/actions";
import { formatarDataCurta } from "@/lib/formatadores";

export default async function UsuariosPage({ searchParams }: { searchParams: Promise<{ convite?: string }> }) {
  const { convite } = await searchParams;
  const atual = await exigirAdministrador();
  const [usuarios, degustadoras] = await Promise.all([
    prisma.usuario.findMany({ include: { degustadora: true }, orderBy: [{ ativo: "desc" }, { name: "asc" }, { email: "asc" }] }),
    prisma.degustadora.findMany({ where: { ativo: true }, orderBy: { nome: "asc" } }),
  ]);
  return <div className="pagina-conteudo pagina-crud">
    <CabecalhoPagina etiqueta="Configurações" titulo="Escalar time" descricao="Crie e administre os acessos internos concedidos pela Eight Green."/>
    {convite === "enviado" && <p className="mensagem sucesso" role="status">Integrante criado e instruções enviadas.</p>}
    {convite === "pendente" && <p className="mensagem erro" role="alert">Integrante criado, mas o envio não foi concluído. Configure o provedor e use “Reenviar acesso”.</p>}
    <div className="crud-grid">
      <form action={provisionarUsuario} className="form-card"><h2>Novo integrante</h2><label>Nome<input name="nome" required minLength={2}/></label><label>E-mail<input name="email" type="email" required autoComplete="off"/></label><label>Cargo<select name="papel" defaultValue="FUNCIONARIO"><option value="FUNCIONARIO">Funcionário</option><option value="ADMINISTRADOR">Administrador</option></select></label><label>Situação<select name="ativo" defaultValue="true"><option value="true">Ativo</option><option value="false">Inativo</option></select></label><label>Degustadora vinculada (opcional)<select name="degustadoraId" defaultValue=""><option value="">Sem vínculo</option>{degustadoras.map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}</select></label><button className="botao-salvar" type="submit">Criar e enviar acesso</button></form>
      <div className="tabela-card"><table><thead><tr><th>Integrante</th><th>Acesso</th><th>Configuração</th></tr></thead><tbody>{usuarios.map((usuario) => {
        const salvar = atualizarUsuario.bind(null, usuario.id);
        const reenviar = reenviarAcesso.bind(null, usuario.id);
        const proprio = usuario.id === atual.id;
        return <tr key={usuario.id}><td><strong>{usuario.name}</strong><small>{usuario.email}</small></td><td><strong>{usuario.estadoConvite === "ACEITO" ? "Aceito" : usuario.estadoConvite === "ENVIO_FALHOU" ? "Envio pendente" : "Convite pendente"}</strong><small>Último acesso: {usuario.ultimoAcesso ? formatarDataCurta(usuario.ultimoAcesso.toISOString().slice(0, 10)) : "Nunca"}</small><form action={reenviar}><button type="submit">Reenviar acesso</button></form></td><td><form action={salvar} className="usuario-config"><select name="papel" defaultValue={usuario.papel} disabled={proprio}><option value="FUNCIONARIO">Funcionário</option><option value="ADMINISTRADOR">Administrador</option></select>{proprio && <input type="hidden" name="papel" value={usuario.papel}/>}<select name="ativo" defaultValue={String(usuario.ativo)} disabled={proprio}><option value="true">Ativo</option><option value="false">Inativo</option></select>{proprio && <input type="hidden" name="ativo" value="true"/>}<select name="degustadoraId" defaultValue={usuario.degustadoraId ?? ""}><option value="">Sem degustadora</option>{degustadoras.map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}</select><button type="submit">Salvar</button></form></td></tr>;
      })}</tbody></table></div>
    </div>
  </div>;
}
