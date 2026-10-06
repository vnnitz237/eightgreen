# Eight Green — Gestão promocional

Sistema interno de gestão promocional da Eight Green. O projeto usa Next.js 16, PostgreSQL, Prisma e autenticação interna por e-mail e senha.

## Executar

Requer Node.js 24 (ou versão LTS compatível com Next.js 16), Docker e um provedor de e-mail.

```bash
npm install
cp .env.example .env
npm run db:up
npm run db:deploy
npm run db:generate
npm run db:seed
npm run dev -- --port 3001
```

Após as migrations, crie o primeiro proprietário uma única vez com `OWNER_NAME`, `OWNER_EMAIL` e `npm run owner:create`. A credencial temporária é enviada pelo provedor configurado e exige troca no primeiro acesso. Usuários seguintes são criados em `/configuracoes/usuarios`. Nunca envie o `.env` ao Git.

Para validação local reproduzível, o seed cria um administrador ativo, um funcionário ativo com troca obrigatória de senha e registros sintéticos mínimos de todos os agregados. Configure as variáveis `SEED_ADMIN_*` e `SEED_FUNCIONARIO_*` documentadas em `.env.example`; essas credenciais são exclusivas do ambiente isolado de desenvolvimento.

Para um serviço HTTP de e-mail, configure `EMAIL_PROVIDER=api`, `EMAIL_FROM`, `EMAIL_API_URL` e `EMAIL_API_KEY`. Em desenvolvimento isolado, `EMAIL_PROVIDER=arquivo` salva a mensagem com permissão restrita em `.emails-dev`, diretório ignorado pelo Git e proibido em produção.

O seed é idempotente e contém apenas dados sintéticos. Não execute `prisma migrate reset` em bases existentes. Para uma base previamente criada sem histórico de migrations, faça antes um diagnóstico de baseline.

## Verificações

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

Consulte [docs/arquitetura.md](docs/arquitetura.md), [docs/requisitos-e-lacunas.md](docs/requisitos-e-lacunas.md), [docs/rotas.md](docs/rotas.md) e [docs/plano.md](docs/plano.md).

A análise atual de dependências está em [docs/seguranca-dependencias.md](docs/seguranca-dependencias.md).
