# Requisitos, hipóteses e lacunas

## Classificação da fonte

Este documento não transforma o relatório em verdade única. As etiquetas preservadas são: **observado** (visto na interface), **inferido** (dedução), **proposto** (melhoria ou arquitetura) e **pendente** (requer confirmação). Gaps de IDs não são evidência de exclusão histórica.

## Requisitos observados

- Ação possui distribuidora, local, data/horário, múltiplas profissionais e múltiplos produtos; profissionais têm valor individual no registro legado.
- Estados observados de ação: aberta e encerrada. Editar, visualizar, checkout e cancelar aparecem como operações.
- Há cadastros de distribuidoras, degustadoras, fornecedores, produtos, grupos, canais e bancos.
- Estoque possui entradas, saídas, inventário e saldo; conta corrente, contas a pagar, contas a receber, despesas e títulos existem no Financeiro.
- Merchan registra visitas; Pessoal possui agenda e rotas; há quatro entradas de relatórios.
- A agenda observada inclui compromissos pessoais sensíveis e exige privacidade por padrão.
- A moeda observada é BRL e a apresentação de datas é brasileira.

## Inferências que não viraram automação

- Saldo como entradas menos saídas mais ajustes.
- Checkout gerando saída de estoque, título financeiro ou encerramento automático.
- Comissão calculada por percentual.
- Títulos como subconjunto de contas a pagar/receber.
- Brasília como regra definitiva de fuso para persistência.

## Hipóteses reversíveis da base

- Estabelecimento poderá ser cadastrado ou informado como avulso; a cardinalidade final será validada.
- Ação pode não ter distribuidora quando explicitamente avulsa, sem cadastro placeholder.
- Profissional avulsa é uma participação de ação, não uma degustadora fictícia.
- Contas a receber permanece no mapa até decisão explícita.
- O Dashboard demonstra “total”, “abertas” e “encerradas”; não exibe “Ações no Financeiro”. Estoque representa posição atual independente do período.
- Dados exibidos são sintéticos e não reproduzem nomes, documentos, contas bancárias ou compromissos do diagnóstico.

## Perguntas pendentes

| Pergunta | Impacto | Etapa bloqueada |
|---|---|---|
| Quais operações cada cargo pode executar e sobre quais registros? | Alto: segurança e UX | Autenticação/autorização e todos os CRUDs |
| Como degustadora e fornecedor se relacionam juridicamente e qual dado é a fonte canônica? | Alto: evita duplicação de dados pessoais | Cadastros e Financeiro |
| Quais campos e validações compõem checkout? | Alto: define encerramento | Checkout |
| Checkout/encerramento gera saída, pagamento ou conta automaticamente? Em que momento? | Alto: consistência transacional | Estoque e Financeiro |
| Como valores e comissões são definidos? | Alto: cálculo monetário | Financeiro |
| Estabelecimento será cadastro próprio ou texto livre/avulso? | Médio: modelo de Ações e Merchan | Cadastros/Ações |
| Vendedor referencia usuário, outro cadastro ou texto? | Médio | Ações |
| Contas a receber será usada e em qual fluxo? | Médio | Financeiro |
| Como entradas de estoque se relacionam com documentos fiscais? | Médio | Estoque |
| Existem ERP, NF-e, pagamentos ou outras integrações? | Alto | Arquitetura de integração |
| Quais filtros, colunas e formatos de exportação cada relatório exige? | Médio | Relatórios |
| Qual política de datas, horários, virada do dia e fuso? | Alto: consistência | Persistência e agenda |
| Qual escopo de migração, retenção e reconciliação dos dados históricos? | Alto | Migração/homologação |
| Há SLA ou encerramento automático de ações? | Baixo agora | Automação de Ações |

## Definições dos indicadores demonstrativos

- **Total de ações:** quantidade de registros cuja data está no período inclusivo.
- **Abertas/encerradas:** subconjuntos do mesmo recorte, classificados pelo status demonstrativo.
- **Lista de ações:** exatamente o mesmo conjunto que alimenta os indicadores.
- **Próximas ações:** abertas com data a partir da data de referência demonstrativa (29/09/2026), sem depender do filtro.
- **Posição atual do estoque:** soma das quantidades sintéticas atuais, independente do período das ações. O mínimo é apenas demonstrativo e não afirma regra real.
