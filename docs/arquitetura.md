# Arquitetura da base

## Decisões da Etapa 1

- Next.js 16.3.7 com App Router, React 19.3, TypeScript estrito e Tailwind CSS 4.3.3.
- PostgreSQL e Prisma são a direção de persistência, mas nenhum schema foi fechado nesta etapa. O modelo do diagnóstico é ilustrativo e contém relações que precisam ser corrigidas.
- Dados sintéticos ficam atrás do contrato `RepositorioAcoes`. A interface consome tipos e consultas do domínio, permitindo trocar o repositório demonstrativo por Prisma sem reescrever os componentes.
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
prisma                     será criado junto do primeiro schema validado
```

Páginas permanecem finas; regras e consultas ficam em `funcionalidades`. Pastas são introduzidas somente quando possuem conteúdo.

## Fronteira de dados

`RepositorioAcoes` define a porta de leitura. `repositorioAcoesDemonstrativo` é o adaptador temporário. O futuro adaptador Prisma deve retornar o mesmo contrato de domínio, sem expor modelos gerados à camada visual. Operações que afetem estoque ou financeiro precisarão de transação, idempotência, histórico e estorno.

## Autenticação e autorização

Não há autenticação falsa. `/login` informa a limitação e oferece apenas acesso à demonstração local. Na próxima etapa, a sessão será validada no servidor; autorização será por operação e por registro, com negação por padrão. A matriz de cargos não será codificada antes de validação. Diretoria não terá acesso automático aos compromissos pessoais de terceiros. Degustadora (cadastro de negócio) é distinta de usuário de autenticação e pode ter vínculo opcional.

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
