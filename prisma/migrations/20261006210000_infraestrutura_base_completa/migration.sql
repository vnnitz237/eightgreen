-- Tipos dos agregados operacionais. A migration é aditiva e preserva as tabelas legadas.
CREATE TYPE "TipoDocumentoEstoque" AS ENUM ('ENTRADA', 'SAIDA', 'INVENTARIO');
CREATE TYPE "StatusDocumentoEstoque" AS ENUM ('ABERTO', 'ENCERRADO', 'CANCELADO');
CREATE TYPE "StatusContaPagar" AS ENUM ('ABERTA', 'PAGA', 'CANCELADA');
CREATE TYPE "StatusContaReceber" AS ENUM ('ABERTA', 'RECEBIDA', 'CANCELADA');
CREATE TYPE "StatusDespesaEmpresarial" AS ENUM ('ABERTA', 'ENCERRADA', 'CANCELADA');
CREATE TYPE "TipoLancamentoCC" AS ENUM ('DEBITO', 'CREDITO');

ALTER TABLE "distribuidoras" ADD COLUMN "canal_id" TEXT;
ALTER TABLE "estabelecimentos" ADD COLUMN "endereco" TEXT, ADD COLUMN "distribuidora_id" TEXT, ADD COLUMN "canal_id" TEXT;
ALTER TABLE "degustadoras" ADD COLUMN "telefone" TEXT, ADD COLUMN "email" TEXT, ADD COLUMN "fornecedor_id" TEXT;
ALTER TABLE "grupos_produto" ADD COLUMN "ativo" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "canais" ADD COLUMN "ativo" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "bancos" ADD COLUMN "ativo" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "acao_profissionais" ADD COLUMN "valor_individual" DECIMAL(12,2) NOT NULL DEFAULT 0;
ALTER TABLE "merchan" ADD COLUMN "tipo_atividade" TEXT, ADD COLUMN "latitude" DECIMAL(10,7), ADD COLUMN "longitude" DECIMAL(10,7), ADD COLUMN "foto" TEXT, ADD COLUMN "responsavel_id" TEXT;
ALTER TABLE "compromissos" ADD COLUMN "usuario_id" TEXT;
ALTER TABLE "rotas" ADD COLUMN "ativo" BOOLEAN NOT NULL DEFAULT true, ADD COLUMN "responsavel_id" TEXT;

CREATE TABLE "documentos_estoque" (
    "id" TEXT NOT NULL,
    "tipo" "TipoDocumentoEstoque" NOT NULL,
    "status" "StatusDocumentoEstoque" NOT NULL DEFAULT 'ABERTO',
    "data" DATE NOT NULL,
    "numero_nota" TEXT,
    "serie_nota" TEXT,
    "observacao" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,
    "fornecedor_id" TEXT,
    "acao_id" TEXT,
    CONSTRAINT "documentos_estoque_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "documentos_estoque_itens" (
    "id" TEXT NOT NULL,
    "quantidade" DECIMAL(14,3) NOT NULL,
    "valor_unitario" DECIMAL(12,2),
    "saldo_sistema" DECIMAL(14,3),
    "contagem_fisica" DECIMAL(14,3),
    "documento_id" TEXT NOT NULL,
    "produto_id" TEXT NOT NULL,
    CONSTRAINT "documentos_estoque_itens_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "documentos_estoque_itens_documento_id_produto_id_key" ON "documentos_estoque_itens"("documento_id", "produto_id");
ALTER TABLE "movimentacoes_estoque" ADD COLUMN "documento_item_id" TEXT;

CREATE TABLE "despesas_empresariais" (
    "id" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "data_inicio" DATE NOT NULL,
    "data_fim" DATE NOT NULL,
    "destino" TEXT,
    "status" "StatusDespesaEmpresarial" NOT NULL DEFAULT 'ABERTA',
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,
    "responsavel_id" TEXT,
    CONSTRAINT "despesas_empresariais_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "despesas_itens" (
    "id" TEXT NOT NULL,
    "data" DATE NOT NULL,
    "tipo" TEXT NOT NULL,
    "descricao" TEXT,
    "valor" DECIMAL(12,2) NOT NULL,
    "comprovante" TEXT,
    "despesa_id" TEXT NOT NULL,
    CONSTRAINT "despesas_itens_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "contas_pagar" (
    "id" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "valor" DECIMAL(12,2) NOT NULL,
    "emissao" DATE NOT NULL,
    "vencimento" DATE NOT NULL,
    "status" "StatusContaPagar" NOT NULL DEFAULT 'ABERTA',
    "data_pagamento" DATE,
    "favorecido" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,
    "banco_id" TEXT,
    "fornecedor_id" TEXT,
    "degustadora_id" TEXT,
    "acao_degustadora_id" TEXT,
    "despesa_empresarial_id" TEXT,
    CONSTRAINT "contas_pagar_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "contas_receber" (
    "id" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "valor" DECIMAL(12,2) NOT NULL,
    "emissao" DATE NOT NULL,
    "vencimento" DATE NOT NULL,
    "status" "StatusContaReceber" NOT NULL DEFAULT 'ABERTA',
    "data_recebimento" DATE,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,
    "banco_id" TEXT,
    "estabelecimento_id" TEXT,
    "acao_id" TEXT,
    CONSTRAINT "contas_receber_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "contas_correntes_clientes" (
    "id" TEXT NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estabelecimento_id" TEXT NOT NULL,
    CONSTRAINT "contas_correntes_clientes_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "contas_correntes_clientes_estabelecimento_id_key" ON "contas_correntes_clientes"("estabelecimento_id");

CREATE TABLE "lancamentos_cc" (
    "id" TEXT NOT NULL,
    "data" DATE NOT NULL,
    "historico" TEXT NOT NULL,
    "tipo" "TipoLancamentoCC" NOT NULL,
    "valor" DECIMAL(12,2) NOT NULL,
    "origem" TEXT NOT NULL DEFAULT 'MANUAL',
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "conta_corrente_id" TEXT NOT NULL,
    "conta_receber_id" TEXT,
    CONSTRAINT "lancamentos_cc_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "registros_merchan_produtos" (
    "registro_id" TEXT NOT NULL,
    "produto_id" TEXT NOT NULL,
    CONSTRAINT "registros_merchan_produtos_pkey" PRIMARY KEY ("registro_id", "produto_id")
);

CREATE TABLE "rotas_estabelecimentos" (
    "rota_id" TEXT NOT NULL,
    "estabelecimento_id" TEXT NOT NULL,
    "ordem" INTEGER,
    CONSTRAINT "rotas_estabelecimentos_pkey" PRIMARY KEY ("rota_id", "estabelecimento_id")
);

ALTER TABLE "distribuidoras" ADD CONSTRAINT "distribuidoras_canal_id_fkey" FOREIGN KEY ("canal_id") REFERENCES "canais"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "estabelecimentos" ADD CONSTRAINT "estabelecimentos_distribuidora_id_fkey" FOREIGN KEY ("distribuidora_id") REFERENCES "distribuidoras"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "estabelecimentos" ADD CONSTRAINT "estabelecimentos_canal_id_fkey" FOREIGN KEY ("canal_id") REFERENCES "canais"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "degustadoras" ADD CONSTRAINT "degustadoras_fornecedor_id_fkey" FOREIGN KEY ("fornecedor_id") REFERENCES "fornecedores"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "documentos_estoque" ADD CONSTRAINT "documentos_estoque_fornecedor_id_fkey" FOREIGN KEY ("fornecedor_id") REFERENCES "fornecedores"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "documentos_estoque" ADD CONSTRAINT "documentos_estoque_acao_id_fkey" FOREIGN KEY ("acao_id") REFERENCES "acoes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "documentos_estoque_itens" ADD CONSTRAINT "documentos_estoque_itens_documento_id_fkey" FOREIGN KEY ("documento_id") REFERENCES "documentos_estoque"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "documentos_estoque_itens" ADD CONSTRAINT "documentos_estoque_itens_produto_id_fkey" FOREIGN KEY ("produto_id") REFERENCES "produtos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "movimentacoes_estoque" ADD CONSTRAINT "movimentacoes_estoque_documento_item_id_fkey" FOREIGN KEY ("documento_item_id") REFERENCES "documentos_estoque_itens"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "despesas_empresariais" ADD CONSTRAINT "despesas_empresariais_responsavel_id_fkey" FOREIGN KEY ("responsavel_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "despesas_itens" ADD CONSTRAINT "despesas_itens_despesa_id_fkey" FOREIGN KEY ("despesa_id") REFERENCES "despesas_empresariais"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "contas_pagar" ADD CONSTRAINT "contas_pagar_banco_id_fkey" FOREIGN KEY ("banco_id") REFERENCES "bancos"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "contas_pagar" ADD CONSTRAINT "contas_pagar_fornecedor_id_fkey" FOREIGN KEY ("fornecedor_id") REFERENCES "fornecedores"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "contas_pagar" ADD CONSTRAINT "contas_pagar_degustadora_id_fkey" FOREIGN KEY ("degustadora_id") REFERENCES "degustadoras"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "contas_pagar" ADD CONSTRAINT "contas_pagar_acao_degustadora_id_fkey" FOREIGN KEY ("acao_degustadora_id") REFERENCES "acao_profissionais"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "contas_pagar" ADD CONSTRAINT "contas_pagar_despesa_empresarial_id_fkey" FOREIGN KEY ("despesa_empresarial_id") REFERENCES "despesas_empresariais"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "contas_receber" ADD CONSTRAINT "contas_receber_banco_id_fkey" FOREIGN KEY ("banco_id") REFERENCES "bancos"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "contas_receber" ADD CONSTRAINT "contas_receber_estabelecimento_id_fkey" FOREIGN KEY ("estabelecimento_id") REFERENCES "estabelecimentos"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "contas_receber" ADD CONSTRAINT "contas_receber_acao_id_fkey" FOREIGN KEY ("acao_id") REFERENCES "acoes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "contas_correntes_clientes" ADD CONSTRAINT "contas_correntes_clientes_estabelecimento_id_fkey" FOREIGN KEY ("estabelecimento_id") REFERENCES "estabelecimentos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "lancamentos_cc" ADD CONSTRAINT "lancamentos_cc_conta_corrente_id_fkey" FOREIGN KEY ("conta_corrente_id") REFERENCES "contas_correntes_clientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "lancamentos_cc" ADD CONSTRAINT "lancamentos_cc_conta_receber_id_fkey" FOREIGN KEY ("conta_receber_id") REFERENCES "contas_receber"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "merchan" ADD CONSTRAINT "merchan_responsavel_id_fkey" FOREIGN KEY ("responsavel_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "registros_merchan_produtos" ADD CONSTRAINT "registros_merchan_produtos_registro_id_fkey" FOREIGN KEY ("registro_id") REFERENCES "merchan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "registros_merchan_produtos" ADD CONSTRAINT "registros_merchan_produtos_produto_id_fkey" FOREIGN KEY ("produto_id") REFERENCES "produtos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "compromissos" ADD CONSTRAINT "compromissos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "rotas" ADD CONSTRAINT "rotas_responsavel_id_fkey" FOREIGN KEY ("responsavel_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "rotas_estabelecimentos" ADD CONSTRAINT "rotas_estabelecimentos_rota_id_fkey" FOREIGN KEY ("rota_id") REFERENCES "rotas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "rotas_estabelecimentos" ADD CONSTRAINT "rotas_estabelecimentos_estabelecimento_id_fkey" FOREIGN KEY ("estabelecimento_id") REFERENCES "estabelecimentos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
