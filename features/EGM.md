# Features (Módulos Funcionais de Negócio Frontend)

## Overview
Camada de implementação das regras de negócio e fluxos de usuário da aplicação frontend. Cada feature agrupa seus próprios hooks, componentes de domínio, estados locais e interações com as rotas do backend.

## Subdirectories & Boundaries
- `calibrations/`: Fluxo completo de calibração metrológica (execução de checklist, coleta de leituras *as-found* e *as-left*, cálculo dinâmico de incerteza e assinatura eletrônica com confirmação de senha).
- `instruments/`: Gestão de inventário metrológico, ciclo de vida de equipamentos, cadastro de tolerâncias e regras de decisão.
- `iot/`: Painéis de gestão de gateways e nós de telemetria, telemetria em tempo real e visualização preditiva.
- `standards/`: Padrões de referência RBC e gestão de rastreabilidade metrológica.
- `non-conformities/`: Registro e tratamento de desvios metrológicos e ações corretivas.

## Invariants
- **Assinatura Eletrônica 21 CFR Part 11**: O fluxo de submissão de calibração em `calibrations` DEVE solicitar a senha do operador antes de disparar o `POST /calibrations`.
- **Desacoplamento de Features**: Uma feature não deve importar componentes internos de outra feature diretamente, devendo comunicar-se através de `components/shared/` ou contratos em `lib/`.

## Side Effects
- Mutação de cache local via TanStack Query.
- Disparo de requisições RESTful de calibração e gerenciamento.

## Verification
- Run: `npx tsc --noEmit`
