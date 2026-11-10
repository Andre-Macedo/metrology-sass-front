# App Router (Next.js App Router & Roteamento Internacionalizado)

## Overview
Camada de roteamento da aplicação web baseada no Next.js App Router. Implementa rotas internacionalizadas sob o prefixo `[locale]` (suporte a `pt-BR`, `en`, `es`), autenticação com rotas agrupadas `(auth)` e painel de controle operacional `(dashboard)`.

## Interface
- `app/[locale]/layout.tsx`: Layout raiz com provedores de tema, internacionalização e React Query Client.
- `app/[locale]/(auth)/`: Telas de autenticação, login de operador e recuperação de senha.
- `app/[locale]/(dashboard)/`:
  - `dashboard/iot/`: Monitor de telemetria industrial, análise espectral e acompanhamento preditivo.
  - `dashboard/metrology/`: Execução de calibrações, consulta de instrumentos e auditoria de certificados.
  - `dashboard/billing/`: Faturamento, planos e gestão de assinaturas SaaS.

## Invariants
- **Proteção de Rotas**: Todas as páginas sob o grupo `(dashboard)` exigem autenticação ativa e contexto de tenant válido.
- **Server vs Client Components**: Manter páginas e layouts como Server Components por padrão; utilizar a diretiva `'use client'` estritamente onde interação de estado, WebSockets ou efeitos forem mandatórios.

## Side Effects
- Roteamento de páginas no navegador.
- Carregamento assíncrono de dados do backend Laravel.

## Verification
- Run: `npm run build` ou `npx tsc --noEmit`
