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

## 🔴 Prioridade Alta (Integridade de Dados - Qualidade/Metrologia)

- [ ] **Testes Unitários (Vitest):** Cobrir 100% dos `utils/adapters` e funções de cálculos metrológicos.
  - *Por que:* Erros em cálculos de incerteza ou conversão de unidades são críticos em sistemas de qualidade.
- [ ] **Testes E2E (Playwright):** Implementar o "Caminho Crítico":
  - Login -> Criar Instrumento -> Registrar Calibração -> Validar Status do Instrumento.
- [ ] **Interceptação de Erros Globais:** Padronizar como erros da API (422, 403, 500) são exibidos via Toast para o usuário final.

## 🟣 Infraestrutura, Servidor e Monitoramento (SaaS)

- [ ] **Configuração do Docker (Supervisord):** Centralizar os processos de Web (PHP-FPM), Fila (queue:work) e Agendamentos (cron) no mesmo container para otimizar o uso da RAM da VPS.
- [ ] **Adição do Redis:** Instalar e configurar o Redis no `docker-compose` para gerenciar as filas de processamento assíncrono (ex: geração de PDFs).
- [ ] **Monitoramento de Exceções (Sentry/Flare):** Integrar ferramenta de rastreamento de erros para capturar falhas antes do cliente reportar.
- [ ] **Monitoramento de Saúde (Laravel Pulse):** Instalar o Pulse para monitorar gargalos de banco de dados, lentidão de rotas e uso de CPU em tempo real.
- [ ] **Rotina de Backup Automatizada:** Configurar o `spatie/laravel-backup` com dump do banco de dados e envio automatizado para a nuvem (S3/Cloudflare R2).

---
*Nota: Este documento deve ser atualizado conforme as melhorias forem implementadas.*
