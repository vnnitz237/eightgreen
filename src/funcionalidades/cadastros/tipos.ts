export type TipoCadastro = "canal" | "banco" | "estabelecimento" | "degustadora" | "fornecedor" | "grupoProduto" | "produto";
export type EstadoCadastro = { sucesso: boolean; mensagem?: string; erros?: Record<string, string>; registroId?: string };
export type OpcaoCadastro = { valor: string; rotulo: string };
export type CampoCadastro = { nome: string; rotulo: string; tipo?: "text" | "email" | "number" | "select"; obrigatorio?: boolean; opcoes?: OpcaoCadastro[]; passo?: string; largura?: "dupla" };
export type RegistroCadastro = { id: string; ativo: boolean; valores: Record<string, string>; colunas: Record<string, string> };
export type DadosPaginaCadastro = { tipo: TipoCadastro; titulo: string; descricao: string; campos: CampoCadastro[]; colunas: Array<{ chave: string; rotulo: string }>; registros: RegistroCadastro[]; total: number; pagina: number; totalPaginas: number; busca: string };
