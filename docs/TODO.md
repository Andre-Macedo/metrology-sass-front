# Frontend Roadmap & TODO

Este documento lista as melhorias técnicas recomendadas para elevar a maturidade do frontend do MetroLab para um nível Enterprise.

## 🟢 Prioridade Baixa (Melhoria de DX e Consistência)

- [ ] **Zod Schema Factories:** Refatorar schemas fixos para funções que aceitam o hook de tradução (`t`).
  - *Objetivo:* Garantir que validações funcionem corretamente em Server e Client components com tradução reativa.
- [ ] **Storybook - Design System:** Criar stories para todos os componentes em `components/ui`.
  - *Objetivo:* Documentar o guia de estilos e evitar componentes duplicados.
- [ ] **Storybook - Publicação e Catálogo Vivo:** Automatizar `npm run build-storybook` para deploy público acessível por avaliadores e clientes.
- [ ] **Storybook - Visual Regression:** Configurar testes de regressão visual para componentes críticos de UI.
- [ ] **TSDoc nas Props dos Componentes:** Documentar interfaces de `Props` com comentários `/** ... */` em componentes centrais (ex: `ISO20816SeverityGauge`) para auto-documentação no editor.
- [ ] **Atalho para a Central de Documentação:** Adicionar link `"Documentação & Ajuda"` no Navbar e Footer apontando para o portal público VitePress em nova aba.


## 🟡 Prioridade Média (Resiliência e UX)

- [ ] **Error Boundaries:** Implementar arquivos `error.tsx` em cada rota principal do App Router.
  - *Objetivo:* Isolar erros de componentes (ex: um gráfico que falha) para não quebrar a página inteira.
- [ ] **Skeleton Screens:** Substituir o texto "Loading..." por componentes de Skeleton reais no `Suspense` das tabelas.
- [ ] **Empty States Padronizados:** Criar um componente reutilizável para quando as buscas não retornam resultados.

## 🔴 Prioridade Alta (Integridade de Dados & Auditoria ISO 17025 - Rodada 6)

- [x] **Correção do Endpoint de Cálculo de Incerteza (Wizard 404):**
  - *Problema:* O botão "Calculate" em `calibration-wizard.tsx` chama `useCalculateUncertainty` (`POST /calibrations/calculate`), resultando em erro 404 porque a rota não foi registrada no backend.
  - *Ação:* Rota `POST /api/v1/calibrations/calculate` implementada no backend com `CalculateCalibrationUncertaintyAction` e integrada ao frontend.
- [x] **Botão de Impressão de Etiqueta Adesiva na Calibração Aprovada (`calibrations/[id]`):**
  - *Problema:* A tela de visualização da calibração exibe apenas o download do Certificado A4. O técnico não tem atalho imediato para imprimir a etiqueta adesiva física para afixar no instrumento.
  - *Ação:* Botão "Imprimir Etiqueta" implementado em `calibrations/[id]/page.tsx` consumindo o endpoint de label do instrumento.
- [x] **MPE Customizado no Formulário de Instrumento (`instrument-form.tsx`):**
  - *Objetivo:* Campos `mpe_value`, `mpe_type`, `resolution` e `measuring_range` adicionados no schema e no formulário de criação/edição.
- [x] **Validador Estrito de CNPJ/CPF (Módulo 11):**
  - *Objetivo:* Validação matemática oficial dos dígitos verificadores implementada em `lib/validators/cpf-cnpj.ts` e aplicada no `supplier-form.tsx`.
- [ ] **Modo de Coleta Offline (PWA / IndexedDB):**
  - *Objetivo:* Permitir que técnicos realizem a coleta de dados de calibração em áreas industriais sem conectividade de rede (estilo Beamex bMobile), sincronizando automaticamente ao reconectar.
- [ ] **Importação em Lote de Leituras (Paste from Spreadsheet):**
  - *Objetivo:* Permitir copiar e colar matrizes de dados do Excel diretamente no grid de calibração para instrumentos com dezenas de pontos.
- [ ] **Testes Unitários (Vitest):** Cobrir 100% dos `utils/adapters` e funções de cálculos metrológicos.
  - *Por que:* Erros em cálculos de incerteza ou conversão de unidades são críticos em sistemas de qualidade.
- [ ] **Testes E2E (Playwright):** Implementar o "Caminho Crítico":
  - Login -> Criar Instrumento -> Registrar Calibração -> Validar Status do Instrumento.
- [ ] **Interceptação de Erros Globais:** Padronizar como erros da API (422, 403, 500) são exibidos via Toast para o usuário final.

## 🔵 Cockpit Preditivo & Spectrum Studio (Norma ISO 20816 & Benchmark Tractian)

Módulo analítico em tempo real para monitoramento de vibração e saúde de motores/ativos industriais, desacoplado do backoffice administrativo do Filament.

### 1. Dashboard de Monitoramento da Planta (Visão Semáforo ISO 20816-3)
- [x] **Grid de Ativos Monitorados (`PlantAssetCockpit.tsx`):**
  - Cards reativos para cada motor com indicação semafórica, busca instantânea e filtros por estado (Todos, Saudáveis, Alerta, Crítico):
    * 🟢 **Normal (Zonas A/B - ISO 20816-3):** Operação irrestrita, vibração e temperatura estáveis;
    * 🟡 **Alerta (Zona C - ISO 20816-3):** Operação restrita, vibração acima do padrão, planejar inspeção;
    * 🔴 **Crítico (Zona D - ISO 20816-3):** Vibração perigosa, risco de danos graves, parada obrigatória.
- [x] **Métricas Principais no Card:**
  - Velocidade de vibração RMS ($mm/s$);
  - Rotação estimada instantânea ($1\times\text{RPM}$);
  - Temperatura de contato do mancal ($^\circ\text{C}$);
  - Horímetro acumulado de operação (horas ligadas).

### 2. Estúdio de Análise Espectral (`SpectrumStudio.tsx` - Benchmark Tractian)
- [x] **Renderização FFT com Recharts / ResponsiveContainer:**
  - Suporte a 400+ pontos de FFT com resolução de 2.5 Hz (0 a 1.000 Hz) e cursor de precisão magnético.
- [x] **Alternância de Domínio Espectro vs Forma de Onda:**
  - **Espectro FFT:** Domínio da Frequência com zoom selecionável (0-200 Hz, 0-500 Hz e 0-1.000 Hz);
  - **Forma de Onda no Tempo:** Domínio Temporal (0 a 120 ms) exibindo a senoide instantânea ou picos de choque impulsivos.
- [x] **Sobreposição Multi-Eixos Triaxial (Sem Microfone):**
  - Plotagem simultânea dos canais ortogonais com toggle individual de visibilidade:
    * **Ciano (#06b6d4):** Eixo Radial Horizontal ($X$);
    * **Verde (#10b981):** Eixo Radial Vertical ($Y$);
    * **Azul (#3b82f6):** Eixo Axial ($Z$).
- [x] **Seletor de Harmônicos Automáticos (*Harmonic Picker*):**
  - Identificação automática do pico fundamental $1X$ (29.17 Hz @ 1750 RPM);
  - Projeção de linhas verticais pontilhadas na fundamental e harmônicos: `1X (29.2 Hz)`, `2X (58.3 Hz)`, `3X (87.5 Hz)`;
  - Tooltip interativo com leitura de frequência, amplitude e ordem harmônica instantânea.
- [x] **Marcadores de Frequências de Falha de Rolamento (*Bearing Kinematics Overlay*):**
  - Cinemática exata do rolamento SKF 6204-2Z integrada ao componente;
  - Linhas de referência tracejadas com tags de identificação:
    * **Vermelho (#ef4444):** $BPFO$ (104.2 Hz) e $2\times BPFO$ (208.4 Hz);
    * **Roxo (#8b5cf6):** $BPFI$ (149.8 Hz).
- [x] **Cursor de Mira Interativo (*Peak Target Cursor*):**
  - Clique em qualquer pico dominante da lista para fixar linha de mira vertical com frequência, amplitude e delta de rotação no gráfico.
- [x] **Alternância de Domínio e Escala:**
  - Alternar entre Aceleração ($g$) e Velocidade ($mm/s$) com recálculo físico instantâneo.
- [ ] **Integração com Apache ECharts (`echarts-for-react`) / WebGL:**
  - Evolução futura para suportar 16.384+ pontos de FFT contínua de bancada a 60 FPS com Pan/Zoom horizontal.
- [ ] **Comparador de Coletas (*+ Comparar Coleta*):**
  - Sobrepor espectro histórico da linha de base (*Baseline*) em cinza transparente (30% opacidade).

### 3. Card de Diagnóstico Prescritivo (Causa-Raiz IA + Severidade ISO 20816-3)
- [x] **Painel Explicativo Superior (`PredictiveInsightsEngine.tsx`):**
  - Tradução dos modelos XGBoost Especialista e Multimodal em diagnóstico mastigado:
    * **Causa-Raiz da Falha:** Diagnósticos físicos precisos (Desbalanceamento 1X, Desalinhamento 2X/Axial, Pista Externa BPFO, Cavitação);
    * **Severidade do Ativo:** Classificação ISO 20816-3 (Zonas A, B, C, D);
    * **Grau de Urgência:** Prazos recomendados (Nenhuma, Em até 14 dias, Em até 7 dias, Imediata < 24h);
    * **Prescrições de Campo:** Checklist numerado de ações corretivas detalhadas para o time de manutenção.
- [x] **Abertura de Ordem de Serviço Imediata (`CreatePredictiveWorkOrderModal.tsx`):**
  - Modal integrado com pré-preenchimento automático do ativo, falha diagnosticada, laudo técnico e prioridade;
  - Despacho direto para o módulo de Work Orders via mutation React Query.

### 4. Visualizador de Tendência & Horímetro (`ThermalTrendCard.tsx`)
- [x] **Gráfico de Tendência de 30 Dias:**
  - Linha contínua de Temperatura do Mancal (°C) com linhas de referência de alarme SKF (Alerta 70°C, Crítico 85°C);
  - Curva de Velocidade RMS (mm/s) sobreposta em eixo secundário;
  - Gradiente diário de elevação térmica (°C/dia) e delta térmico ($\Delta T$) sobre o ambiente.
- [x] **Horímetro & Turno Operacional:**
  - Gráfico de barras empilhadas diárias de horas em operação vs horas paradas;
  - Indicador de disponibilidade global dos últimos 30 dias (%).

### 5. Biblioteca de Datasets Físicos & Simulador de Cenários (`tractian-mock-data.ts`)
- [x] **5 Cenários Físicos Calibrados:**
  - **Cenário 1 - Saudável (Zona A):** 1750 RPM, 0.88 mm/s, 38.4°C, 48 dB (Saúde: 98%);
  - **Cenário 2 - Desbalanceamento 1X (Zona C):** Pico dominante em 29.2 Hz, 3.82 mm/s, 54.8°C (Saúde: 62%);
  - **Cenário 3 - Desalinhamento Combinado (Zona C):** Picos em 1X e 2X com vibração axial Z severa, 4.25 mm/s, 67.4°C (Saúde: 54%);
  - **Cenário 4 - Defeito de Rolamento BPFO (Zona D):** Picos em 104.2 Hz com harmônicos e bandas laterais, 5.95 mm/s, 84.1°C, curtose 5.8 (Saúde: 24%);
  - **Cenário 5 - Folga Mecânica Estrutural (Zona C):** Sub-harmônico em 14.58 Hz (0.5X) e múltiplos harmônicos de impacto (1X a 5X), 3.95 mm/s, 52.4°C (Saúde: 42%).
- [x] **Chaveamento Dinâmico:**
  - Alternância rápida entre simulação calibrada e transmissão real via WebSockets (Laravel Reverb) no canal `tenant.{slug}.iot`.

## 🟣 Infraestrutura, Servidor e Monitoramento (SaaS)

- [ ] **Ambiente Remoto de Staging (`dev.leantech.andremacedo.dev.br`):** Testes integrados com a API de staging antes do merge na branch `main`.
- [x] **Configuração do Docker:** Containers Next.js em multi-stage build integrados ao docker-compose com Reverb e API.
- [x] **Adição do Redis:** Redis configurado no cluster para filas e cache.
- [x] **Monitoramento de Exceções (Sentry):** Integração com `@sentry/nextjs` no frontend e `sentry/sentry-laravel` no backend.
- [x] **Monitoramento de Saúde (Laravel Pulse):** Monitoramento de jobs, rotas e uso de recursos ativo no backend.
- [x] **Rotina de Backup Automatizada:** Implementada com `spatie/laravel-backup` no backend.

---
*Nota: Este documento deve ser atualizado conforme as melhorias forem implementadas.*
