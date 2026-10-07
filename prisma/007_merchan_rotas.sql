-- Migration 007: Merchan visitas e Rotas com paradas
-- Run in Supabase SQL editor

-- ─── StatusRota enum ────────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE "StatusRota" AS ENUM ('PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDA', 'CANCELADA');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── Rota: novas colunas ────────────────────────────────────────────────────
ALTER TABLE rotas
  ADD COLUMN IF NOT EXISTS nome TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS status "StatusRota" NOT NULL DEFAULT 'PENDENTE',
  ADD COLUMN IF NOT EXISTS observacoes TEXT,
  ADD COLUMN IF NOT EXISTS promotor_id TEXT REFERENCES usuarios(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- ─── Merchan visitas ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS merchan_visitas (
  id            TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::text,
  data          DATE        NOT NULL,
  hora_entrada  TEXT,
  hora_saida    TEXT,
  lat_entrada   FLOAT,
  lng_entrada   FLOAT,
  lat_saida     FLOAT,
  lng_saida     FLOAT,
  fotos         TEXT[]      NOT NULL DEFAULT '{}',
  checklist_ok  BOOLEAN     NOT NULL DEFAULT FALSE,
  observacoes   TEXT,
  estabelecimento_id TEXT REFERENCES estabelecimentos(id) ON DELETE SET NULL,
  promotor_id   TEXT        REFERENCES usuarios(id) ON DELETE SET NULL,
  criado_em     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Rota paradas ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rota_paradas (
  id                  TEXT    PRIMARY KEY DEFAULT gen_random_uuid()::text,
  ordem               INT     NOT NULL DEFAULT 0,
  visitado            BOOLEAN NOT NULL DEFAULT FALSE,
  rota_id             TEXT    NOT NULL REFERENCES rotas(id) ON DELETE CASCADE,
  estabelecimento_id  TEXT    NOT NULL REFERENCES estabelecimentos(id) ON DELETE RESTRICT,
  merchan_id          TEXT    UNIQUE REFERENCES merchan_visitas(id) ON DELETE SET NULL
);
