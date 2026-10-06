# Segurança de dependências

Análise realizada em 6 de outubro de 2026.

## `source-map-js`

- Alerta: `GHSA-68fv-2mgg-jv7q`, negação de serviço por bloqueio síncrono do event loop ao processar offsets maliciosos em source maps indexados.
- Alcance encontrado: dependência transitiva de PostCSS usada por Next.js, Tailwind, Vite e ferramentas de teste.
- Correção oficial: `source-map-js@1.2.2`.
- Mitigação aplicada: `overrides` fixa `1.2.2` sem atualizar Next.js, Tailwind ou PostCSS.
- Resultado: o alerta deixou de aparecer no `npm audit`.

## `braces`

- Alerta: `GHSA-vfj7-8cjw-p6xm`, estouro de pilha com padrões de chaves profundamente aninhados.
- Cadeia: `eslint-config-next` → `@next/eslint-plugin-next` → `fast-glob` → `micromatch` → `braces@3.0.3`.
- Não existe versão corrigida publicada no momento desta análise.
- Alcance no projeto: somente ferramentas de desenvolvimento/lint; `npm audit --omit=dev` retorna zero vulnerabilidades.
- Medida temporária: não processar padrões glob fornecidos por usuários e manter ESLint fora da imagem/runtime de produção. Reavaliar quando houver release corrigida na cadeia oficial.

Não foi usado `npm audit fix --force`.
