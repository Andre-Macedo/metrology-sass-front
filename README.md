# Sistema de Metrologia Lean Tech — Frontend Next.js

Interface moderna de usuário para o **Sistema de Metrologia Lean Tech**, construída com Next.js 14 (App Router), React, Tailwind CSS e TypeScript.

---

## 1. Visão Geral

O frontend contempla:
- **Painel Metrológico & Workflows**: Gestão de calibrações, cartas de controle de Shewhart, laudos de impacto e verificação forense de integridade (ISO 17025).
- **Monitoramento e Telemetria IoT**: Dashboard em tempo real com indicador de severidade de vibração (norma ISO 20816-3), gráficos de telemetria ao vivo via WebSockets (Laravel Reverb) e gaveta de diagnóstico de pacotes.
- **MLOps & Triagem de Anomalias**: Abas para rotulagem humana (*human-in-the-loop*), gerenciamento de conjuntos de dados (datasets) e descarte de outliers/falsos positivos difíceis.
- **Portal B2B do Cliente**: Ambiente *white-label* para consulta pública de certificados, validação bit a bit de PDFs e download em lote.

---

## 2. Pré-requisitos

- **Node.js**: Versão 20.x LTS recomendada
- **Gerenciador de Pacotes**: `npm` (versão 10+)
- **Backend**: Instância do backend Laravel ([`amemiya`](../amemiya)) em execução na porta 8000

---

## 3. Instalação e Execução Local

### 1. Clonar o repositório
```bash
git clone git@github.com:Andre-Macedo/metrology-sass-front.git
cd metrology-sass-front
```

### 2. Configurar Variáveis de Ambiente
Copie o arquivo de exemplo `.env.example` para `.env.local`:
```bash
cp .env.example .env.local
```

Ajuste conforme seu ambiente:
- `NEXT_PUBLIC_API_URL`: URL base da API do Laravel (ex: `http://localhost:8000/api/v1`)
- `NEXT_PUBLIC_REVERB_HOST`: Host do servidor Reverb (ex: `localhost`)
- `NEXT_PUBLIC_REVERB_PORT`: Porta do servidor Reverb (ex: `8080`)
- `NEXT_PUBLIC_REVERB_APP_KEY`: Chave da aplicação Reverb

### 3. Instalar Dependências
```bash
npm install
```

### 4. Executar o Servidor de Desenvolvimento
```bash
npm run dev
```
A aplicação estará disponível em [http://localhost:3000](http://localhost:3000).

---

## 4. Scripts Disponíveis

| Comando | Descrição |
| :--- | :--- |
| `npm run dev` | Inicia o servidor de desenvolvimento com hot-reload (porta 3000) |
| `npm run build` | Compila o projeto em modo standalone para produção |
| `npm start` | Inicia o servidor de produção após o build |
| `npm run lint` | Executa a verificação estática do código com ESLint |
| `npm run typecheck` | Verifica integridade de tipos com TypeScript (`tsc --noEmit`) |
| `npm run quality` | Executa validação de tipos e linter de uma vez |
| `npm run test` | Executa a suíte de testes unitários com Vitest |
| `npm run test:e2e` | Executa os testes ponta a ponta com Playwright |
| `npm run storybook` | Inicia o Storybook para visualização dos componentes (porta 6006) |

---

## 5. Estrutura de Documentação Técnica

Os guias técnicos do frontend estão centralizados no diretório [`docs/`](docs):

- [`docs/01-ARCHITECTURE.md`](docs/01-ARCHITECTURE.md) — Arquitetura de diretórios, convenções e separação de responsabilidades.
- [`docs/02-COMPONENTS.md`](docs/02-COMPONENTS.md) — Padrões de componentes, Shadcn UI e acessibilidade.
- [`docs/03-STATE_AND_DATA.md`](docs/03-STATE_AND_DATA.md) — Camada de dados, TanStack Query e cache.
- [`docs/04-STYLING.md`](docs/04-STYLING.md) — Design system, tokens e Tailwind CSS v4.
- [`docs/05-BACKEND_STANDARDS.md`](docs/05-BACKEND_STANDARDS.md) — Contratos com API Laravel, DTOs e códigos de erro.
- [`docs/06-TESTING_AND_STORYBOOK.md`](docs/06-TESTING_AND_STORYBOOK.md) — Estratégia de testes e componentes isolados.
- [`docs/07-ZOD_GUIDE.md`](docs/07-ZOD_GUIDE.md) — Guia de validação de schemas em tempo de execução com Zod.
- [`docs/TODO.md`](docs/TODO.md) — Roadmap de melhorias e tarefas pendentes.

---

## 6. Fluxo de Contribuição

1. Clone o repositório e trabalhe sempre a partir da branch **`develop`**.
2. Crie uma branch nomeada para sua tarefa: `git checkout -b feat/minha-feature develop`.
3. Garanta que o comando `npm run quality` execute sem erros antes de submeter alterações.
4. Abra uma Pull Request com destino à branch **`develop`** (veja [`CONTRIBUTING.md`](CONTRIBUTING.md)).

---

## 7. Build com Docker

Para construir e executar a imagem isolada do frontend via Docker:

```bash
# Build da imagem
docker build -t metrology-sass-front .

# Execução do container
docker run -p 3000:3000 --env-file .env.local metrology-sass-front
```

