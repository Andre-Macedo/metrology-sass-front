# Components (Design System & Widgets de Interface)

## Overview
Biblioteca de componentes reutilizáveis da interface web Next.js. Abrange o Design System em Tailwind CSS 4, componentes de navegação, tabelas metrológicas, formulários de ensaio e instrumentação visual de telemetria IoT em tempo real.

## Interface
- **Componentes IoT & Monitoramento**:
  - `ISO20816SeverityGauge.tsx`: Indicador visual de zonas de severidade vibracional (Zonas A, B, C e D) conforme a norma ISO 20816-3.
  - `RealTimeTelemetry.tsx`: Gráficos e cards de telemetria em tempo real (vibração RMS, temperatura e ruído).
  - `AnomalyMonitor.tsx`: Painel de monitoramento de anomalias com probabilidade preditiva calculada pelo XGBoost.
  - `HistoricalTelemetry.tsx`: Gráfico de séries temporais históricas para diagnóstico de degradação.
- **Design System UI (`components/ui/`)**:
  - Primitivas visuais acessíveis (Buttons, Modals, Dialogs, Tables, Dropdowns, Badges, Tabs).
- **Componentes Metrológicos (`components/metrology/`)**:
  - Tabelas de histórico de calibração, visualizadores de certificados e checklists dinâmicos.

## Invariants
- **Aderência às Normas Metrológicas**: Componentes de severidade devem seguir rigorosamente as cores e limites da ISO 20816-3 (Verde para Zona A, Amarelo para Zona B, Laranja para Zona C, Vermelho para Zona D).
- **Acessibilidade e Responsividade**: Todos os componentes visuais devem atender aos padrões de contraste WCAG AA e suportar layouts responsivos.
- **Isolamento de Estado**: Componentes de apresentação não devem realizar mutações de estado globais fora dos padrões do TanStack Query ou Context API.

## Side Effects
- Renderização de nós DOM e animações CSS.
- Subscrição em canais de eventos via WebSockets no cliente.

## Verification
- Run: `npm run lint` ou `npx tsc --noEmit`
