-- Criação do schema completo do Eight Green
-- Execute este SQL no Editor SQL do Supabase

-- ─── Enums ───────────────────────────────────────────────────────────────────

CREATE TYPE "StatusAcao" AS ENUM ('aberta', 'encerrada', 'cancelada');
CREATE TYPE "TipoMovimentacaoEstoque" AS ENUM ('entrada', 'saida', 'ajuste');
CREATE TYPE "TipoContaFinanceira" AS ENUM ('pagar', 'receber', 'despesa');

-- ─── Cadastros base ──────────────────────────────────────────────────────────

CREATE TABLE "distribuidoras" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "distribuidoras_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "estabelecimentos" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "estabelecimentos_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "degustadoras" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "degustadoras_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "fornecedores" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fornecedores_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "grupos_produto" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "grupos_produto_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "canais" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "canais_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "bancos" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "codigo" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "bancos_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "produtos" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "unidade" TEXT NOT NULL DEFAULT 'un',
    "estoque_minimo" INTEGER NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "grupo_id" TEXT,
    CONSTRAINT "produtos_pkey" PRIMARY KEY ("id")
);

-- ─── Ação promocional ────────────────────────────────────────────────────────

CREATE TABLE "acoes" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "data" DATE NOT NULL,
    "horario" TEXT NOT NULL,
    "status" "StatusAcao" NOT NULL DEFAULT 'aberta',
    "distribuidora_id" TEXT,
    "estabelecimento_id" TEXT,
    "estabelecimento_avulso" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "acoes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "acao_profissionais" (
    "id" TEXT NOT NULL,
    "acao_id" TEXT NOT NULL,
    "degustadora_id" TEXT,
    "nome_avulso" TEXT,
    CONSTRAINT "acao_profissionais_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "acao_produtos" (
    "id" TEXT NOT NULL,
    "acao_id" TEXT NOT NULL,
    "produto_id" TEXT NOT NULL,
    "quantidade_planejada" INTEGER NOT NULL,
    CONSTRAINT "acao_produtos_pkey" PRIMARY KEY ("id")
);

-- ─── Estoque ─────────────────────────────────────────────────────────────────

CREATE TABLE "movimentacoes_estoque" (
    "id" TEXT NOT NULL,
    "tipo" "TipoMovimentacaoEstoque" NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "observacao" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "produto_id" TEXT NOT NULL,
    CONSTRAINT "movimentacoes_estoque_pkey" PRIMARY KEY ("id")
);

-- ─── Financeiro ──────────────────────────────────────────────────────────────

CREATE TABLE "contas_financeiras" (
    "id" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "valor" DECIMAL(12,2) NOT NULL,
    "tipo" "TipoContaFinanceira" NOT NULL,
    "vencimento" DATE NOT NULL,
    "pago" BOOLEAN NOT NULL DEFAULT false,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "contas_financeiras_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "despesas_operacionais" (
    "id" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "valor" DECIMAL(12,2) NOT NULL,
    "data" DATE NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "despesas_operacionais_pkey" PRIMARY KEY ("id")
);

-- ─── Merchan ─────────────────────────────────────────────────────────────────

CREATE TABLE "merchan" (
    "id" TEXT NOT NULL,
    "data" DATE NOT NULL,
    "observacao" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "distribuidora_id" TEXT,
    "estabelecimento_id" TEXT,
    "estabelecimento_avulso" TEXT,
    CONSTRAINT "merchan_pkey" PRIMARY KEY ("id")
);

-- ─── Pessoal ─────────────────────────────────────────────────────────────────

CREATE TABLE "compromissos" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "data" DATE NOT NULL,
    "horario" TEXT,
    "privado" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "compromissos_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "rotas" (
    "id" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "data" DATE NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "rotas_pkey" PRIMARY KEY ("id")
);

-- ─── Foreign Keys ────────────────────────────────────────────────────────────

ALTER TABLE "produtos" ADD CONSTRAINT "produtos_grupo_id_fkey"
    FOREIGN KEY ("grupo_id") REFERENCES "grupos_produto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "acoes" ADD CONSTRAINT "acoes_distribuidora_id_fkey"
    FOREIGN KEY ("distribuidora_id") REFERENCES "distribuidoras"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "acoes" ADD CONSTRAINT "acoes_estabelecimento_id_fkey"
    FOREIGN KEY ("estabelecimento_id") REFERENCES "estabelecimentos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "acao_profissionais" ADD CONSTRAINT "acao_profissionais_acao_id_fkey"
    FOREIGN KEY ("acao_id") REFERENCES "acoes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "acao_profissionais" ADD CONSTRAINT "acao_profissionais_degustadora_id_fkey"
    FOREIGN KEY ("degustadora_id") REFERENCES "degustadoras"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "acao_produtos" ADD CONSTRAINT "acao_produtos_acao_id_fkey"
    FOREIGN KEY ("acao_id") REFERENCES "acoes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "acao_produtos" ADD CONSTRAINT "acao_produtos_produto_id_fkey"
    FOREIGN KEY ("produto_id") REFERENCES "produtos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "movimentacoes_estoque" ADD CONSTRAINT "movimentacoes_estoque_produto_id_fkey"
    FOREIGN KEY ("produto_id") REFERENCES "produtos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "merchan" ADD CONSTRAINT "merchan_distribuidora_id_fkey"
    FOREIGN KEY ("distribuidora_id") REFERENCES "distribuidoras"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "merchan" ADD CONSTRAINT "merchan_estabelecimento_id_fkey"
    FOREIGN KEY ("estabelecimento_id") REFERENCES "estabelecimentos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ─── Tabela de controle de migrations (Prisma) ────────────────────────────────

CREATE TABLE "_prisma_migrations" (
    "id" VARCHAR(36) NOT NULL,
    "checksum" VARCHAR(64) NOT NULL,
    "finished_at" TIMESTAMPTZ,
    "migration_name" VARCHAR(255) NOT NULL,
    "logs" TEXT,
    "rolled_back_at" TIMESTAMPTZ,
    "started_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "applied_steps_count" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "_prisma_migrations_pkey" PRIMARY KEY ("id")
);
