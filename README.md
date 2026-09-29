# Eight Green — Gestão promocional

Base demonstrativa da reconstrução do sistema de gestão da Eight Green. Esta entrega corresponde somente à Etapa 1: fundação visual, arquitetura, Dashboard e rotas de apresentação.

## Executar

Requer Node.js 24 (ou versão LTS compatível com Next.js 16).

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000`. O ambiente usa somente dados sintéticos locais, não possui autenticação real, banco conectado nem integrações com o sistema legado.

## Verificações

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

Consulte [docs/arquitetura.md](docs/arquitetura.md), [docs/requisitos-e-lacunas.md](docs/requisitos-e-lacunas.md), [docs/rotas.md](docs/rotas.md) e [docs/plano.md](docs/plano.md).
