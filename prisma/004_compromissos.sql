-- Migration 004: Agenda de Compromissos
-- Run this in the Supabase SQL editor

-- Drop old columns
ALTER TABLE compromissos DROP COLUMN IF EXISTS data;
ALTER TABLE compromissos DROP COLUMN IF EXISTS horario;
ALTER TABLE compromissos DROP COLUMN IF EXISTS privado;

-- Rename usuario_id → responsavel_id
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'compromissos' AND column_name = 'usuario_id'
  ) THEN
    ALTER TABLE compromissos RENAME COLUMN usuario_id TO responsavel_id;
  END IF;
END$$;

-- Add new columns
ALTER TABLE compromissos
  ADD COLUMN IF NOT EXISTS tipo TEXT NOT NULL DEFAULT 'OUTRO',
  ADD COLUMN IF NOT EXISTS inicio TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS fim TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS dia_inteiro BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS observacoes TEXT,
  ADD COLUMN IF NOT EXISTS atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS estabelecimento_id TEXT REFERENCES estabelecimentos(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS acao_id TEXT REFERENCES acoes(id) ON DELETE SET NULL;

-- Backfill existing rows
UPDATE compromissos SET inicio = now(), fim = now() WHERE inicio IS NULL;

-- Make required columns NOT NULL
ALTER TABLE compromissos ALTER COLUMN inicio SET NOT NULL;
ALTER TABLE compromissos ALTER COLUMN fim SET NOT NULL;
