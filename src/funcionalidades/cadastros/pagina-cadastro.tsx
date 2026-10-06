import { buscarPaginaCadastro } from "./consultas";
import { GerenciadorCadastro } from "./gerenciador-cadastro";
import type { TipoCadastro } from "./tipos";
export async function PaginaCadastro({tipo,searchParams}:{tipo:TipoCadastro;searchParams:Promise<{busca?:string;pagina?:string}>}){return <GerenciadorCadastro dados={await buscarPaginaCadastro(tipo,await searchParams)}/>}
