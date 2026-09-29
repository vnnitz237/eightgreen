# Versões e compatibilidade

Consulta realizada em 29/09/2026 nas documentações oficiais e no registro npm:

- Next.js 16.3.7, linha estável 16.3.
- React 19.3.0, canal estável.
- Tailwind CSS 4.3.3 com `@tailwindcss/postcss` na mesma versão.
- TypeScript estrito; versão resolvida pelo lockfile.
- Zod 4.6.5 para schemas tipados.
- Prisma não instalado. Prisma 8 ainda estava em release candidate; a direção futura é a linha estável Prisma 7, sujeita a revisão no início da etapa de persistência. O ambiente local Node.js 24.17 atende aos requisitos atuais documentados.

Dependências visuais redundantes foram evitadas: o gráfico usa HTML/CSS com valores numéricos, sem biblioteca de gráficos nesta etapa.
