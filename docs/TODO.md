# Frontend Roadmap & TODO

Este documento lista as melhorias técnicas recomendadas para elevar a maturidade do frontend do MetroLab para um nível Enterprise.

## 🟢 Prioridade Baixa (Melhoria de DX e Consistência)

- [ ] **Zod Schema Factories:** Refatorar schemas fixos para funções que aceitam o hook de tradução (`t`).
  - *Objetivo:* Garantir que validações funcionem corretamente em Server e Client components com tradução reativa.
- [ ] **Storybook - Design System:** Criar stories para todos os componentes em `components/ui`.
  - *Objetivo:* Documentar o guia de estilos e evitar componentes duplicados.
- [ ] **Storybook - Visual Regression:** Configurar testes de regressão visual para componentes críticos de UI.

## 🟡 Prioridade Média (Resiliência e UX)

- [ ] **Error Boundaries:** Implementar arquivos `error.tsx` em cada rota principal do App Router.
  - *Objetivo:* Isolar erros de componentes (ex: um gráfico que falha) para não quebrar a página inteira.
- [ ] **Skeleton Screens:** Substituir o texto "Loading..." por componentes de Skeleton reais no `Suspense` das tabelas.
- [ ] **Empty States Padronizados:** Criar um componente reutilizável para quando as buscas não retornam resultados.

## 🔴 Prioridade Alta (Integridade de Dados & Auditoria ISO 17025 - Rodada 6)

- [ ] **Correção do Endpoint de Cálculo de Incerteza (Wizard 404):**
  - *Problema:* O botão "Calculate" em `calibration-wizard.tsx` chama `useCalculateUncertainty` (`POST /calibrations/calculate`), resultando em erro 404 porque a rota não foi registrada no backend.
  - *Ação:* Sincronizar o contrato da API com o novo endpoint do backend ou unificar o fluxo no `UncertaintyBudgetModal`.
- [ ] **Botão de Impressão de Etiqueta Adesiva na Calibração Aprovada (`calibrations/[id]`):**
  - *Problema:* A tela de visualização da calibração exibe apenas o download do Certificado A4. O técnico não tem atalho imediato para imprimir a etiqueta adesiva física para afixar no instrumento.
  - *Ação:* Adicionar botão "Imprimir Etiqueta" em `calibrations/[id]/page.tsx` conectado ao endpoint de emissão de label.
- [ ] **MPE Customizado no Formulário de Instrumento (`instrument-form.tsx`):**
  - *Objetivo:* Expor os campos `mpe_value` e `mpe_type` diretamente no formulário de criação/edição do instrumento para permitir tolerâncias personalizadas além da família padrão.
- [ ] **Validador Estrito de CNPJ/CPF (Módulo 11):**
  - *Objetivo:* Implementar validação matemática oficial dos dígitos verificadores de CNPJ e CPF em formulários de clientes e fornecedores via Zod `refine`.
- [ ] **Modo de Coleta Offline (PWA / IndexedDB):**
  - *Objetivo:* Permitir que técnicos realizem a coleta de dados de calibração em áreas industriais sem conectividade de rede (estilo Beamex bMobile), sincronizando automaticamente ao reconectar.
- [ ] **Importação em Lote de Leituras (Paste from Spreadsheet):**
  - *Objetivo:* Permitir copiar e colar matrizes de dados do Excel diretamente no grid de calibração para instrumentos com dezenas de pontos.
- [ ] **Testes Unitários (Vitest):** Cobrir 100% dos `utils/adapters` e funções de cálculos metrológicos.
  - *Por que:* Erros em cálculos de incerteza ou conversão de unidades são críticos em sistemas de qualidade.
- [ ] **Testes E2E (Playwright):** Implementar o "Caminho Crítico":
  - Login -> Criar Instrumento -> Registrar Calibração -> Validar Status do Instrumento.
- [ ] **Interceptação de Erros Globais:** Padronizar como erros da API (422, 403, 500) são exibidos via Toast para o usuário final.

## 🟣 Infraestrutura, Servidor e Monitoramento (SaaS)

- [ ] **Ambiente Remoto de Staging (`dev.leantech.andremacedo.dev.br`):** Testes integrados com a API de staging antes do merge na branch `main`.
- [x] **Configuração do Docker:** Containers Next.js em multi-stage build integrados ao docker-compose com Reverb e API.
- [x] **Adição do Redis:** Redis configurado no cluster para filas e cache.
- [x] **Monitoramento de Exceções (Sentry):** Integração com `@sentry/nextjs` no frontend e `sentry/sentry-laravel` no backend.
- [x] **Monitoramento de Saúde (Laravel Pulse):** Monitoramento de jobs, rotas e uso de recursos ativo no backend.
- [x] **Rotina de Backup Automatizada:** Implementada com `spatie/laravel-backup` no backend.

---
*Nota: Este documento deve ser atualizado conforme as melhorias forem implementadas.*
