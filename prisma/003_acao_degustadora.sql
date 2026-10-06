-- Migração: Ações promocionais — campos adicionais e tabela de degustadoras
-- Execute no SQL Editor do Supabase

-- 1. Adiciona campos à tabela acoes
ALTER TABLE "acoes"
  ADD COLUMN IF NOT EXISTS "numero"      TEXT,
  ADD COLUMN IF NOT EXISTS "data_fim"    DATE,
  ADD COLUMN IF NOT EXISTS "observacoes" TEXT;

-- Preenche numero nos registros existentes (usa o id como fallback)
UPDATE "acoes" SET "numero" = "id" WHERE "numero" IS NULL;

-- Torna numero NOT NULL e UNIQUE
ALTER TABLE "acoes"
  ALTER COLUMN "numero" SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'acoes_numero_key'
  ) THEN
    ALTER TABLE "acoes" ADD CONSTRAINT "acoes_numero_key" UNIQUE ("numero");
  END IF;
END $$;

-- 2. Adiciona campo preco à tabela acao_produtos
ALTER TABLE "acao_produtos"
  ADD COLUMN IF NOT EXISTS "preco" DECIMAL(10,2) NOT NULL DEFAULT 0;

-- 3. Cria tabela acao_degustadoras
CREATE TABLE IF NOT EXISTS "acao_degustadoras" (
    "id"              TEXT NOT NULL,
    "acao_id"         TEXT NOT NULL,
    "degustadora_id"  TEXT NOT NULL,
    "data_trabalho"   DATE NOT NULL,
    "hora_inicio"     TEXT NOT NULL,
    "hora_fim"        TEXT NOT NULL,
    "observacoes"     TEXT,
    CONSTRAINT "acao_degustadoras_pkey" PRIMARY KEY ("id")
);

-- 4. Foreign keys de acao_degustadoras
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'acao_degustadoras_acao_id_fkey'
  ) THEN
    ALTER TABLE "acao_degustadoras"
      ADD CONSTRAINT "acao_degustadoras_acao_id_fkey"
      FOREIGN KEY ("acao_id") REFERENCES "acoes"("id") ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'acao_degustadoras_degustadora_id_fkey'
  ) THEN
    ALTER TABLE "acao_degustadoras"
      ADD CONSTRAINT "acao_degustadoras_degustadora_id_fkey"
      FOREIGN KEY ("degustadora_id") REFERENCES "degustadoras"("id");
  END IF;
END $$;
