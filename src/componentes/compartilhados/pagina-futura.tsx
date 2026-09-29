import Link from "next/link";
import { ArrowLeft, Construction, LockKeyhole } from "lucide-react";
import { CabecalhoPagina } from "./cabecalho-pagina";

export function PaginaFutura({ titulo, dominio }: { titulo: string; dominio: string }) {
  return <div className="pagina-conteudo">
    <CabecalhoPagina etiqueta={dominio} titulo={titulo} descricao="Este módulo está mapeado e será implementado em uma etapa futura, após validação das regras de negócio." />
    <section className="estado-desenvolvimento">
      <div className="icone-construcao"><Construction size={26}/></div>
      <h2>Em desenvolvimento</h2>
      <p>A estrutura de navegação já está pronta. Nenhuma operação foi simulada ou automatizada nesta etapa.</p>
      <div className="aviso-seguranca"><LockKeyhole size={17}/><span>Sem autenticação ou persistência conectada</span></div>
      <Link href="/"><ArrowLeft size={16}/>Voltar à visão geral</Link>
    </section>
  </div>;
}
