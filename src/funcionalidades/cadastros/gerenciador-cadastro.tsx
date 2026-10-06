"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { alterarSituacaoCadastro, salvarCadastro } from "./actions";
import type { DadosPaginaCadastro, EstadoCadastro, RegistroCadastro } from "./tipos";

const inicial: EstadoCadastro = { sucesso: false };

function Formulario({ dados, registro, cancelar }: { dados: DadosPaginaCadastro; registro: RegistroCadastro | null; cancelar: () => void }) {
  const [estado, acao, pendente] = useActionState(salvarCadastro, inicial);
  return <form action={acao} className="cadastro-formulario">
    <input type="hidden" name="tipo" value={dados.tipo}/><input type="hidden" name="id" value={registro?.id ?? ""}/>
    <div className="cadastro-grade">
      {dados.campos.map(campo => <label key={campo.nome} className={campo.largura === "dupla" ? "campo-duplo" : undefined}>{campo.rotulo}{campo.obrigatorio && " *"}
        {campo.tipo === "select" ? <select name={campo.nome} required={campo.obrigatorio} defaultValue={registro?.valores[campo.nome] ?? (campo.nome === "unidade" ? "UN" : "")}><option value="">Selecione</option>{campo.opcoes?.map(o=><option key={o.valor} value={o.valor}>{o.rotulo}</option>)}</select> : <input name={campo.nome} type={campo.tipo ?? "text"} step={campo.passo} min={campo.tipo === "number" ? "0" : undefined} required={campo.obrigatorio} defaultValue={registro?.valores[campo.nome] ?? (campo.nome === "estoqueMinimo" ? "0" : "")}/>} 
        {estado.erros?.[campo.nome] && <span className="erro-campo">{estado.erros[campo.nome]}</span>}
      </label>)}
      <label>Situação<select name="situacao" defaultValue={registro?.ativo === false ? "INATIVO" : "ATIVO"}><option value="ATIVO">Ativo</option><option value="INATIVO">Inativo</option></select></label>
    </div>
    {estado.mensagem && <p className={estado.sucesso ? "mensagem-sucesso" : "mensagem-erro"} role="status">{estado.mensagem}</p>}
    <div className="acoes-formulario"><button type="submit" disabled={pendente}>{pendente ? "Salvando…" : registro ? "Salvar alterações" : "Criar registro"}</button>{registro && <button type="button" className="botao-secundario" onClick={cancelar}>Cancelar edição</button>}</div>
  </form>;
}

function Situacao({ dados, registro }: { dados: DadosPaginaCadastro; registro: RegistroCadastro }) {
  const [estado, acao, pendente] = useActionState(alterarSituacaoCadastro, inicial);
  return <form action={acao} onSubmit={e=>{if(registro.ativo&&!window.confirm("Confirmar a inativação deste registro? Ele deixará de aparecer em novas seleções."))e.preventDefault()}}>
    <input type="hidden" name="tipo" value={dados.tipo}/><input type="hidden" name="id" value={registro.id}/><input type="hidden" name="ativo" value={String(!registro.ativo)}/>
    <button className="acao-tabela" type="submit" disabled={pendente}>{pendente ? "Aguarde…" : registro.ativo ? "Inativar" : "Ativar"}</button>
    {estado.mensagem && <small className={estado.sucesso ? "mensagem-sucesso" : "mensagem-erro"}>{estado.mensagem}</small>}
  </form>;
}

export function GerenciadorCadastro({ dados }: { dados: DadosPaginaCadastro }) {
 const [edicao,setEdicao]=useState<RegistroCadastro|null>(null); const base=`/cadastros/${dados.tipo==="grupoProduto"?"grupos-produto":dados.tipo==="canal"?"canais":dados.tipo==="banco"?"bancos":dados.tipo==="produto"?"produtos":dados.tipo==="fornecedor"?"fornecedores":dados.tipo==="degustadora"?"degustadoras":"estabelecimentos"}`;
 return <div className="pagina-conteudo"><div className="cabecalho-pagina"><div><span>Cadastros</span><h1>{dados.titulo}</h1><p>{dados.descricao}</p></div></div>
  <div className="painel cadastro-painel"><div className="painel-cabecalho"><div><h2>{edicao?"Editar registro":"Novo registro"}</h2><p>Os campos marcados com * são obrigatórios.</p></div></div><Formulario key={edicao?.id??"novo"} dados={dados} registro={edicao} cancelar={()=>setEdicao(null)}/></div>
  <div className="painel"><div className="painel-cabecalho cadastro-lista-cabecalho"><div><h2>Registros</h2><p>{dados.total} resultado(s)</p></div><form method="get" className="busca-cadastro"><input name="busca" defaultValue={dados.busca} placeholder="Buscar por nome…"/><button type="submit">Buscar</button>{dados.busca&&<Link href={base}>Limpar</Link>}</form></div>
   {dados.registros.length?<div className="tabela-wrap"><table><thead><tr>{dados.colunas.map(c=><th key={c.chave}>{c.rotulo}</th>)}<th>Situação</th><th>Ações</th></tr></thead><tbody>{dados.registros.map(r=><tr key={r.id}>{dados.colunas.map(c=><td key={c.chave}>{r.colunas[c.chave]||"—"}</td>)}<td><span className={r.ativo?"tag tag-ativo":"tag tag-inativo"}>{r.ativo?"Ativo":"Inativo"}</span></td><td className="acoes-tabela"><button className="acao-tabela" onClick={()=>{setEdicao(r);window.scrollTo({top:0,behavior:"smooth"})}}>Editar</button><Situacao dados={dados} registro={r}/></td></tr>)}</tbody></table></div>:<div className="estado-vazio"><strong>Nenhum registro encontrado</strong><p>Ajuste a busca ou crie o primeiro registro.</p></div>}
   <nav className="paginacao" aria-label="Paginação">{dados.pagina>1&&<Link href={`${base}?${new URLSearchParams({...(dados.busca?{busca:dados.busca}:{}),pagina:String(dados.pagina-1)})}`}>Anterior</Link>}<span>Página {dados.pagina} de {dados.totalPaginas}</span>{dados.pagina<dados.totalPaginas&&<Link href={`${base}?${new URLSearchParams({...(dados.busca?{busca:dados.busca}:{}),pagina:String(dados.pagina+1)})}`}>Próxima</Link>}</nav>
  </div></div>;
}
