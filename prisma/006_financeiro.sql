-- Migration 006: Financeiro completo
-- Adiciona campos novos a ContaPagar e ContaReceber,
-- cria LancamentoBanco (por banco) e DespesaViagem

-- ── ContaPagar: novos campos ──────────────────────────────────────────────────
ALTER TABLE contas_pagar
  ADD COLUMN IF NOT EXISTS numero          TEXT,
  ADD COLUMN IF NOT EXISTS categoria       TEXT,
  ADD COLUMN IF NOT EXISTS forma_pagamento TEXT,
  ADD COLUMN IF NOT EXISTS acao_id         TEXT REFERENCES acoes(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS contas_pagar_numero_key ON contas_pagar(numero);

-- ── ContaReceber: novos campos ────────────────────────────────────────────────
ALTER TABLE contas_receber
  ADD COLUMN IF NOT EXISTS numero          TEXT,
  ADD COLUMN IF NOT EXISTS categoria       TEXT,
  ADD COLUMN IF NOT EXISTS forma_pagamento TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS contas_receber_numero_key ON contas_receber(numero);

-- ── LancamentoBanco (extrato por banco) ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS lancamentos_banco (
  id              TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  data            DATE        NOT NULL,
  historico       TEXT        NOT NULL,
  tipo            TEXT        NOT NULL, -- DEBITO | CREDITO
  valor           NUMERIC(12,2) NOT NULL,
  criado_em       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  banco_id        TEXT        NOT NULL REFERENCES bancos(id) ON DELETE CASCADE,
  conta_pagar_id  TEXT        REFERENCES contas_pagar(id) ON DELETE SET NULL,
  conta_receber_id TEXT       REFERENCES contas_receber(id) ON DELETE SET NULL
);

-- ── DespesaViagem ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS despesas_viagem (
  id            TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  descricao     TEXT        NOT NULL,
  data          DATE        NOT NULL,
  destino       TEXT,
  tipo_despesa  TEXT,
  valor         NUMERIC(12,2) NOT NULL,
  comprovante   TEXT,
  criado_em     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  colaborador_id TEXT       REFERENCES usuarios(id) ON DELETE SET NULL
);
