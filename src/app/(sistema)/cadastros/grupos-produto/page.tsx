import { PaginaCadastro } from "@/funcionalidades/cadastros/pagina-cadastro";
export const dynamic="force-dynamic"; export default function Page({searchParams}:{searchParams:Promise<{busca?:string;pagina?:string}>}){return <PaginaCadastro tipo="grupoProduto" searchParams={searchParams}/>}
