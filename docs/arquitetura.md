# Arquitetura da base

## Decisões atuais

- Next.js 16.3.7 com App Router, React 19.3, TypeScript estrito e Tailwind CSS 4.3.3.
- PostgreSQL 16 e Prisma 5.22 são a persistência operacional. A migration inicial é versionada; o schema continua evolutivo e não replica cegamente o diagnóstico.
- Leituras operacionais usam Prisma em Server Components. Dados sintéticos existem apenas no seed de desenvolvimento.
- Leitura inicial de páginas: Server Components. Interações locais como o filtro: Client Components. Mutações internas autenticadas: Server Actions, com validação e autorização repetidas no servidor. Route Handlers serão usados somente para integrações, webhooks, downloads ou APIs consumidas fora do aplicativo.
- Zod valida limites de entrada. Datas de domínio são representadas explicitamente; a política definitiva de fuso será validada antes da persistência.
- A paleta verde-petróleo, lima discreto e neutros é provisória. Ela diferencia a demonstração sem alegar ser identidade oficial da Eight Green.

## Organização

```text
src/app                    rotas, layouts e estados de rota
src/componentes/ui         primitivas acessíveis
src/componentes/layout     shell, sidebar e cabeçalho
src/componentes/compartilhados  padrões entre domínios
src/funcionalidades        tipos, schemas, consultas, serviços e componentes por domínio
src/conteudos              navegação e conteúdo estático
src/lib                    infraestrutura transversal
docs                       requisitos, decisões, rotas e plano
prisma                     schema, migrations e seed sintético
```

Páginas permanecem finas; regras e consultas ficam em `funcionalidades`. Pastas são introduzidas somente quando possuem conteúdo.

## Fronteira de dados

Consultas e mutações ficam em `src/funcionalidades`; componentes não abrem conexões diretamente. Operações que afetem estoque ou financeiro precisarão de transação, idempotência, histórico e estorno. Criar ou editar uma ação não movimenta estoque nem financeiro.

## Autenticação e autorização

O login interno usa e-mail normalizado, hash bcrypt e sessões persistidas no PostgreSQL. O cookie contém token aleatório; somente seu HMAC é persistido. Não há cadastro público ou provisionamento automático. O proprietário inicial é criado por comando administrativo idempotente e os demais integrantes somente por administrador. Credenciais temporárias expiram em 48 horas e exigem troca antes do acesso interno. A política central mantém `ADMINISTRADOR` com mutações e `FUNCIONARIO` em leitura. Degustadora continua separada, com vínculo opcional.

## Mapa dos módulos e relações

```text
Distribuidora ─┐
Estabelecimento├─ Ação promocional ─ Profissionais (N:N) ─ Degustadora ─ vínculo explícito ─ Fornecedor
Produtos ──────┘          │
                          ├─ Checkout (regras pendentes)
                          ├─ Estoque (efeito pendente)
                          └─ Financeiro (efeito pendente)

Merchan ─ Distribuidora/Estabelecimento/Canal
Pessoal ─ Agenda privada / Rotas
Relatórios ─ projeções de Ações, Financeiro e Estoque
Configurações ─ Usuários e perfil próprio separados
```

Ações e profissionais avulsos são variantes explícitas; não exigem documentos, datas ou cadastros fictícios.
