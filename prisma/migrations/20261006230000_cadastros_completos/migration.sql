-- Cadastros completos. Mantém as colunas legadas de nome como razão social.
ALTER TABLE "estabelecimentos"
  ADD COLUMN "nome_fantasia" TEXT,
  ADD COLUMN "cnpj_cpf" TEXT,
  ADD COLUMN "ie_rg" TEXT,
  ADD COLUMN "numero" TEXT,
  ADD COLUMN "complemento" TEXT,
  ADD COLUMN "bairro" TEXT,
  ADD COLUMN "cidade" TEXT,
  ADD COLUMN "uf" TEXT,
  ADD COLUMN "cep" TEXT,
  ADD COLUMN "telefone" TEXT,
  ADD COLUMN "email" TEXT,
  ADD COLUMN "contato" TEXT,
  ADD COLUMN "atualizado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "degustadoras"
  ADD COLUMN "cpf" TEXT,
  ADD COLUMN "rg" TEXT,
  ADD COLUMN "cidade" TEXT,
  ADD COLUMN "uf" TEXT,
  ADD COLUMN "agencia" TEXT,
  ADD COLUMN "conta" TEXT,
  ADD COLUMN "banco_dados_id" TEXT;

ALTER TABLE "fornecedores"
  ADD COLUMN "nome_fantasia" TEXT,
  ADD COLUMN "cnpj" TEXT,
  ADD COLUMN "ie" TEXT,
  ADD COLUMN "endereco" TEXT,
  ADD COLUMN "numero" TEXT,
  ADD COLUMN "complemento" TEXT,
  ADD COLUMN "bairro" TEXT,
  ADD COLUMN "cidade" TEXT,
  ADD COLUMN "uf" TEXT,
  ADD COLUMN "cep" TEXT,
  ADD COLUMN "telefone" TEXT,
  ADD COLUMN "email" TEXT,
  ADD COLUMN "contato" TEXT,
  ADD COLUMN "atualizado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "produtos"
  ADD COLUMN "codigo" TEXT,
  ADD COLUMN "custo" DECIMAL(12,2),
  ADD COLUMN "valor_venda" DECIMAL(12,2),
  ADD COLUMN "atualizado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ALTER COLUMN "unidade" SET DEFAULT 'UN',
  ALTER COLUMN "estoque_minimo" TYPE DECIMAL(14,3) USING "estoque_minimo"::DECIMAL(14,3);

ALTER TABLE "acao_produtos"
  ALTER COLUMN "quantidade_planejada" TYPE DECIMAL(14,3) USING "quantidade_planejada"::DECIMAL(14,3);

ALTER TABLE "movimentacoes_estoque"
  ALTER COLUMN "quantidade" TYPE DECIMAL(14,3) USING "quantidade"::DECIMAL(14,3);

CREATE UNIQUE INDEX "canais_nome_key" ON "canais"("nome");
CREATE UNIQUE INDEX "bancos_nome_key" ON "bancos"("nome");
CREATE UNIQUE INDEX "grupos_produto_nome_key" ON "grupos_produto"("nome");
CREATE UNIQUE INDEX "produtos_codigo_key" ON "produtos"("codigo");

ALTER TABLE "degustadoras" ADD CONSTRAINT "degustadoras_banco_dados_id_fkey"
  FOREIGN KEY ("banco_dados_id") REFERENCES "bancos"("id") ON DELETE SET NULL ON UPDATE CASCADE;
