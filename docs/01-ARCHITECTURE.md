# 01. Arquitetura e Estrutura de Diretórios

Este documento define como organizamos nossos arquivos no frontend para manter o código escalável, previsível e fácil de dar manutenção.

## Princípios Core

1.  **Colocation (Co-localização):** Arquivos que mudam juntos devem morar juntos. Em vez de separar por "tipo" (todos os hooks em uma pasta, todos os componentes em outra), separamos por "funcionalidade/módulo".
2.  **Isolamento de Domínio:** O que é específico de um módulo (ex: `calibrations`) não deve vazar para a pasta global (`/components` ou `/lib`), a menos que se prove útil para múltiplos módulos.
3.  **App Router Purity:** A pasta `app` deve conter **apenas** arquivos de roteamento (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`). Todo o resto (componentes, hooks de página, utils) deve estar fora ou em subpastas bem definidas como `_components`.

## Estrutura de Pastas Ideal

```text
metrology-sass-front/
├── app/
│   └── [locale]/
│       ├── (auth)/             # Rotas de autenticação
│       └── (dashboard)/        # Rotas autenticadas do sistema
│           └── dashboard/
│               └── metrology/
│                   ├── instruments/
│                   │   ├── page.tsx
│                   │   └── [id]/page.tsx
│                   └── ...
├── components/                 # Componentes GLOBAIS e Reutilizáveis
│   ├── ui/                     # Shadcn UI (dumb components)
│   ├── layout/                 # Header, Sidebar, Footer globais
│   └── shared/                 # Componentes compartilhados (ex: StatusBadge genérico)
├── lib/                        # Utilitários GLOBAIS e Configurações
│   ├── api/                    # Configuração base do Axios/Fetch
│   ├── utils.ts                # cn(), formatters globais
│   └── types.ts                # Tipagens GLOBAIS (Evitar tipagens de domínio aqui)
├── features/                   # ✨ NOVO PADRÃO: Lógica separada por domínio (Feature-based)
│   ├── instruments/
│   │   ├── components/         # Componentes específicos de instrumentos (InstrumentForm, etc)
│   │   ├── hooks/              # useInstruments, useCreateInstrument (React Query)
│   │   ├── utils/              # Funções puras específicas do domínio
│   │   └── types.ts            # Tipos e Schemas Zod específicos do domínio
│   ├── calibrations/
│   └── system/
└── hooks/                      # Hooks GLOBAIS (useAuth, useMobile, useDebounce)
```

## Regras de Refatoração (Para o cenário atual)

Atualmente, o projeto mistura os conceitos. Por exemplo, existem pastas `components` e `hooks` *dentro* das rotas no diretório `app` (ex: `app/[locale]/(dashboard)/dashboard/metrology/instruments/hooks`).

**O que precisamos ajustar gradativamente:**
1.  **Mover a lógica de domínio para fora da pasta `app`:** A pasta `app` tem roteamento dinâmico e layouts, o que pode causar confusão ao importar arquivos relativos. A longo prazo, adotaremos o padrão de uma pasta `/features` na raiz.
2.  **Limpar o `components/` raiz:** Manter apenas componentes verdadeiramente agnósticos (UI) e de layout na pasta global `components`. Componentes como `calibration-form.tsx` que estão soltos na pasta global devem ir para seu domínio específico dentro de `/features`.

## O Padrão `index.ts` (Barrel Files)
Para evitar caminhos de importação longos, use `index.ts` para exportar a interface pública de uma feature.

```typescript
// features/instruments/index.ts
export * from './components/instrument-form';
export * from './hooks/use-instruments';
export * from './types';
```
Isso permite importar tudo de uma fonte limpa: `import { InstrumentForm, useInstruments } from '@/features/instruments'`