# Estado atual

## Implementado

- PostgreSQL 16 reproduzível em `compose.yaml`, migration inicial versionada e seed sintético idempotente.
- Persistência Prisma para Dashboard, cadastros, ações, estoque, financeiro, merchan e pessoal já conectados no código existente.
- Login interno por e-mail e senha bcrypt, sessão persistida, logout, rotas privadas, bloqueio de inativos e negação de contas desconhecidas.
- Credencial temporária expira em 48 horas e obriga troca de senha antes do acesso às páginas internas.
- Primeiro proprietário criado por `npm run owner:create`; demais integrantes somente por administrador em “Escalar time”.
- Papéis `ADMINISTRADOR` e `FUNCIONARIO`; política central no servidor. Funcionário permanece em leitura até validação da matriz.
- Administração de usuários com pré-autorização, papel, situação e vínculo opcional com degustadora. O próprio administrador não pode se inativar nem alterar o próprio papel.
- O último administrador ativo não pode ser rebaixado ou inativado, mesmo por outro administrador.
- Novas ações nascem sempre `aberta` e exigem um estabelecimento cadastrado ou local avulso.
- Criação e alteração de usuários e ações gravam auditoria na mesma transação, com autor, operação, entidade, registro e estados aplicáveis.

## Contenções

- Encerrar, cancelar, reabrir e excluir ações estão indisponíveis.
- Criar/editar ações não gera estoque, títulos, pagamentos ou comissões.
- Checkout e seus efeitos aguardam regra de negócio.
- Nenhuma credencial real integra o repositório.

## Autorização inicial

| Operação | Administrador | Funcionário |
| --- | --- | --- |
| Consultar módulos privados | Sim | Sim |
| Alterar ações e cadastros | Sim | Não |
| Alterar estoque/financeiro/merchan/pessoal | Sim | Não |
| Administrar usuários | Sim | Não |

## Validação da infraestrutura em 06/10/2026

- As quatro migrations foram aplicadas do zero com `prisma migrate deploy` em PostgreSQL local isolado; `prisma migrate status` confirmou o schema atualizado.
- O seed foi executado repetidamente e confirmou dois usuários ativos e dados sintéticos mínimos dos agregados operacionais.
- Login administrativo, sessão persistida após recarregamento, logout, bloqueio de inativo e troca obrigatória da senha temporária foram validados contra o banco.
- As 31 rotas privadas documentadas redirecionaram para `/login` sem cookie de sessão.
- O host não possui Docker; a validação usou PostgreSQL compatível e efêmero. Para execução cotidiana, instale Docker e use `npm run db:up`, ou forneça outra instância PostgreSQL 16 isolada.

## Verificações independentes do banco

- Schema Prisma formatado e validado; Prisma Client gerado.
- Typecheck, lint, testes e build são executados antes da entrega.
- Testes unitários cobrem autorização inicial, administrador permitido, conta desconhecida, usuário inativo, configuração incompleta, último administrador e contrato de local/status das ações.
- `source-map-js` foi atualizado transitivamente para a versão corrigida `1.2.2`.
- O alerta restante de `braces` pertence somente à cadeia de desenvolvimento do ESLint; `npm audit --omit=dev` retorna zero vulnerabilidades. Consulte `docs/seguranca-dependencias.md`.
