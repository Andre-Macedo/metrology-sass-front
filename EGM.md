# Metrology SaaS Web Portal (Frontend Next.js) Blueprint

## System Overview
Portal web corporativo do Sistema Metrológico Lean Tech desenvolvido em Next.js (App Router), TypeScript e Tailwind CSS 4. Oferece a interface para gestão metrológica de alta conformidade (ISO/IEC 17025 e 21 CFR Part 11), visualização de séries temporais de sensores industriais em tempo real, painéis de manutenção preditiva com severidade ISO 20816 e gestão multi-tenant.

## Local Interface & Invariants
- `package.json`: Definição de dependências e scripts de automação (`dev`, `build`, `test`, `lint`).
- `tailwind.config.ts`: Configurações do tema e tokens do sistema de design industrial.

## Subdirectories & System Boundaries
- [app/](./app/EGM.md): Roteamento App Router internacionalizado (`[locale]`), fluxos de login `(auth)` e painel operacional `(dashboard)`.
- [features/](./features/EGM.md): Módulos funcionais de negócio (calibrações, instrumentos, IoT, não-conformidades e padrões de referência).
- [components/](./components/EGM.md): Biblioteca de componentes de interface e instrumentação visual de telemetria IoT.
- [lib/](./lib/EGM.md): Cliente de API RESTful com injeção de cabeçalho `X-Tenant`, hooks utilitários e tipagem TypeScript.

## Global Invariants
- **Multi-Tenancy por Header HTTP**: Toda requisição para a API central DEVE injetar `X-Tenant: {tenantSlug}`.
- **Rigor Metrológico nas Interfaces**: Exibição de valores de calibração e incerteza deve respeitar regras de algarismos significativos e notação padrão RBC/Inmetro.
- **Zero Divergência de Tipos**: TypeScript configurado em modo estrito; proibições de asserções arbitrárias que mascarem inconsistências de contrato com o backend.

## Global Side Effects
- Consumo de recursos de rede com tráfego HTTP RESTful e WebSockets para o backend Laravel.
- Armazenamento em cache de navegador com TanStack Query.

## System Verification
- Run: `npx tsc --noEmit`
- Run: `npm run build`
