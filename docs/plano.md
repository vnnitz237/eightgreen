# Plano de implementação

## Sequência e critérios de conclusão

1. **Base visual e arquitetura.** Concluída: shell responsivo, Dashboard e rotas preservados.
2. **Autenticação real e autorização no servidor (implementada; integração pendente).** Login interno, senhas bcrypt, sessões persistidas, credencial temporária, troca obrigatória e política por operação estão no código. Falta validar o fluxo completo com PostgreSQL e envio real de e-mail.
3. **Cadastros mínimos.** Distribuidoras, estabelecimentos (se confirmados), degustadoras, fornecedores, vínculo explícito, produtos e auxiliares persistidos com validação, auditoria e pesquisa.
4. **Ações persistidas.** Criar, editar e consultar com participantes/produtos, inclusive variantes avulsas, concorrência tratada e testes do fluxo principal.
5. **Checkout.** Somente após campos, transições e efeitos serem aprovados; operação idempotente e transacional.
6. **Estoque.** Movimentações rastreáveis, inventário, saldo reconciliável, estornos e precisão adequada.
7. **Financeiro.** Conta corrente, pagar, receber, despesas e títulos após confirmação de valores, comissões e pagamentos; decimal para dinheiro, idempotência e histórico.
8. **Merchan, agenda e rotas.** Visitas, privacidade por registro, uso em campo e política de datas/fuso.
9. **Relatórios.** Filtros validados, exportação, autorização e reconciliação com fontes.
10. **Migração e homologação.** Perfilamento, mapeamento, ensaio, validação de totais, tratamento de anomalias, plano de reversão, aceite e operação paralela quando necessário.

## Requisitos transversais futuros

- Autorização por operação e por registro.
- Transações e idempotência em estoque e financeiro.
- Valores monetários com precisão decimal.
- Histórico de alterações, origem e estornos.
- Datas, horários e fuso tratados explicitamente.
- Validação e reconciliação da migração.
- Observabilidade, backups, política de retenção e tratamento LGPD antes da produção.

## Fora da rodada atual

Checkout, pagamentos, comissões, efeitos automáticos em estoque/financeiro, integrações, publicação e migração de dados legados continuam fora do escopo.
