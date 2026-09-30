-- Seed com dados demonstrativos do Eight Green
-- Execute APÓS o 001_schema.sql no Editor SQL do Supabase

-- ─── Distribuidoras ───────────────────────────────────────────────────────────
INSERT INTO "distribuidoras" ("id", "nome") VALUES
  ('D-01', 'Distribuidora Horizonte'),
  ('D-02', 'Rede Litoral'),
  ('D-03', 'Comercial Veredas')
ON CONFLICT ("id") DO NOTHING;

-- ─── Estabelecimentos ─────────────────────────────────────────────────────────
INSERT INTO "estabelecimentos" ("id", "nome") VALUES
  ('E-01', 'Mercado Estação'),
  ('E-02', 'Empório do Parque'),
  ('E-03', 'Loja Movimento'),
  ('E-04', 'Supermercado Alameda'),
  ('E-05', 'Clube Bem Viver')
ON CONFLICT ("id") DO NOTHING;

-- ─── Degustadoras ─────────────────────────────────────────────────────────────
INSERT INTO "degustadoras" ("id", "nome") VALUES
  ('P-01', 'Ana Martins'),
  ('P-02', 'Beatriz Costa'),
  ('P-03', 'Carla Nunes'),
  ('P-04', 'Diana Alves')
ON CONFLICT ("id") DO NOTHING;

-- ─── Produtos ─────────────────────────────────────────────────────────────────
INSERT INTO "produtos" ("id", "nome", "estoque_minimo") VALUES
  ('PR-01', 'Bebida Energia 250 ml', 240),
  ('PR-02', 'Mix Proteico 30 g', 180),
  ('PR-03', 'Snack Cacau 40 g', 160),
  ('PR-04', 'Gel Energia 30 g', 120)
ON CONFLICT ("id") DO NOTHING;

-- ─── Movimentações de estoque (saldo inicial) ─────────────────────────────────
INSERT INTO "movimentacoes_estoque" ("id", "produto_id", "tipo", "quantidade", "observacao") VALUES
  ('ME-01', 'PR-01', 'entrada', 684, 'Saldo inicial'),
  ('ME-02', 'PR-02', 'entrada', 428, 'Saldo inicial'),
  ('ME-03', 'PR-03', 'entrada', 212, 'Saldo inicial'),
  ('ME-04', 'PR-04', 'entrada', 96,  'Saldo inicial')
ON CONFLICT ("id") DO NOTHING;

-- ─── Ações ────────────────────────────────────────────────────────────────────
INSERT INTO "acoes" ("id", "titulo", "data", "horario", "status", "distribuidora_id", "estabelecimento_id", "estabelecimento_avulso") VALUES
  ('AC-1039', 'Encontro Nutrição Prática',       '2026-08-21', '17:00', 'encerrada', 'D-03', 'E-05', NULL),
  ('AC-1048', 'Ativação Linha Energia',           '2026-09-03', '09:00', 'encerrada', 'D-01', 'E-01', NULL),
  ('AC-1051', 'Degustação Bem-estar',             '2026-09-08', '14:00', 'encerrada', 'D-02', 'E-02', NULL),
  ('AC-1054', 'Experiência Sabor & Movimento',   '2026-09-15', '10:30', 'encerrada', 'D-01', NULL,   'Feira Vida Ativa'),
  ('AC-1058', 'Circuito Performance',             '2026-09-22', '16:00', 'aberta',    'D-03', 'E-03', NULL),
  ('AC-1061', 'Ação Comunidade Ativa',            '2026-09-29', '08:30', 'aberta',    NULL,   NULL,   'Praça das Palmeiras'),
  ('AC-1065', 'Semana do Movimento',              '2026-10-05', '13:00', 'aberta',    'D-02', 'E-04', NULL)
ON CONFLICT ("id") DO NOTHING;

-- ─── Profissionais das ações ──────────────────────────────────────────────────
INSERT INTO "acao_profissionais" ("id", "acao_id", "degustadora_id", "nome_avulso") VALUES
  ('AP-01', 'AC-1039', 'P-03', NULL),
  ('AP-02', 'AC-1048', 'P-01', NULL),
  ('AP-03', 'AC-1051', 'P-02', NULL),
  ('AP-04', 'AC-1054', 'P-03', NULL),
  ('AP-05', 'AC-1054', NULL,   'Profissional convidada'),
  ('AP-06', 'AC-1058', 'P-04', NULL),
  ('AP-07', 'AC-1061', 'P-02', NULL),
  ('AP-08', 'AC-1065', 'P-01', NULL)
ON CONFLICT ("id") DO NOTHING;

-- ─── Produtos das ações ───────────────────────────────────────────────────────
INSERT INTO "acao_produtos" ("id", "acao_id", "produto_id", "quantidade_planejada") VALUES
  ('APR-01', 'AC-1039', 'PR-03', 64),
  ('APR-02', 'AC-1048', 'PR-01', 72),
  ('APR-03', 'AC-1051', 'PR-02', 96),
  ('APR-04', 'AC-1054', 'PR-03', 120),
  ('APR-05', 'AC-1058', 'PR-04', 80),
  ('APR-06', 'AC-1061', 'PR-01', 144),
  ('APR-07', 'AC-1065', 'PR-02', 160)
ON CONFLICT ("id") DO NOTHING;
