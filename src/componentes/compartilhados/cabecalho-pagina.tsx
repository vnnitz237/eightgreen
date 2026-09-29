export function CabecalhoPagina({ etiqueta, titulo, descricao, acao }: { etiqueta?: string; titulo: string; descricao: string; acao?: React.ReactNode }) {
  return <div className="cabecalho-pagina"><div>{etiqueta && <span className="etiqueta">{etiqueta}</span>}<h1>{titulo}</h1><p>{descricao}</p></div>{acao}</div>;
}
