-- Migration 005: Estoque — documentos e saldo por produto
-- Run this in the Supabase SQL editor

-- Add numero column to documentos_estoque
ALTER TABLE documentos_estoque
  ADD COLUMN IF NOT EXISTS numero TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS responsavel_id TEXT REFERENCES usuarios(id) ON DELETE SET NULL;

-- Create saldos_estoque table
CREATE TABLE IF NOT EXISTS saldos_estoque (
  id             TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  produto_id     TEXT NOT NULL UNIQUE REFERENCES produtos(id),
  quantidade     INT  NOT NULL DEFAULT 0,
  atualizado_em  TIMESTAMPTZ NOT NULL DEFAULT now()
);
