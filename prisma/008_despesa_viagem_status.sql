-- Migration 008: add status to despesas_viagem
CREATE TYPE "StatusDespesaViagem" AS ENUM ('PENDENTE', 'APROVADA', 'REJEITADA');
ALTER TABLE "despesas_viagem" ADD COLUMN "status" "StatusDespesaViagem" NOT NULL DEFAULT 'PENDENTE';
