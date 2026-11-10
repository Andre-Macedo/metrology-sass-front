# Library & Core Services (API Client & Utilities)

## Overview
Camada de serviços centrais, clientes de rede HTTP, autenticação, gerenciamento de tokens e utilitários de estado para o portal web Next.js. Configura e gerencia a comunicação com a API RESTful do backend Laravel, garantindo a injeção do cabeçalho de multi-tenancy `X-Tenant`.

## Interface
- `lib/api/client.ts`: Instância central do cliente HTTP (Axios/Fetch) com interceptors de autenticação Bearer token e injeção dinâmica de `X-Tenant`.
- `lib/api/calibrations.ts`: Funções de consulta e envio de calibrações e certificados.
- `lib/api/instruments.ts`: Gestão de instrumentos e consultas de inventário.
- `lib/types.ts`: Definições globais de interfaces TypeScript para entidades do sistema.
- `lib/utils.ts`: Utilitários de formatação metrológica, classes condicionais e manipulação de datas UTC.

## Invariants
- **Injeção de Cabeçalho X-Tenant**: Todas as chamadas para a API Laravel devem incluir obrigatoriamente o cabeçalho `X-Tenant` com o slug da organização ativa.
- **Tipagem TypeScript Estrita**: Todas as respostas de API devem ser tipadas com genéricos correspondentes; nenhum tipo `any` não justificado é permitido.
- **Tratamento de Sessão Expirada**: Interceptor HTTP deve capturar status 401 e redirecionar o usuário de forma limpa para a tela de login mantendo o estado de retorno.

## Side Effects
- Chamadas de rede HTTP RESTful para o backend Laravel.
- Leitura e escrita de tokens de autenticação em cookies/localStorage protegidos.

## Verification
- Run: `npx tsc --noEmit`
