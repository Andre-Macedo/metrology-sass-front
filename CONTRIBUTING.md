# Guia de Contribuição — MetroLab Frontend

Seja bem-vindo ao repositório frontend da plataforma **MetroLab (Sistema de Metrologia Lean Tech)**. Este guia orienta o fluxo de trabalho, padrões de código e procedimentos de entrega.

---

## 1. Fluxo de Branches

Adotamos um fluxo baseado em **GitFlow simplificado**:

- **`main`**: Branch de produção. É protegida e reflete exatamente a versão estável em execução no ambiente produtivo.
- **`develop`**: Branch principal de desenvolvimento e integração. **Todas as Pull Requests devem ter `develop` como branch base.**
- **Branches de feature/fix**: Devem ser criadas sempre a partir de `develop`:
  - Features: `git checkout -b feat/nome-da-funcionalidade develop`
  - Correções: `git checkout -b fix/descricao-do-bug develop`
  - Refatorações: `git checkout -b refactor/nome-do-modulo develop`

---

## 2. Padrão de Commits

Todos os commits devem seguir rigorosamente o padrão **Conventional Commits** redigidos em **português**:

```text
<tipo>(<escopo opcional>): <descrição no imperativo/presente em minúsculas>
```

### Exemplos:
- `feat(calibracoes): adiciona visualizacao grafica de cartas de controle`
- `fix(instrumentos): corrige parsing de valor de resolucao nulo no zod`
- `docs(readme): atualiza instrucoes de conexao com reverb`
- `refactor(auth): padroniza interceptor axios para refresh token`
- `style(components): ajusta espacamento e cores no design system`

---

## 3. Ambiente de Desenvolvimento

### Pré-requisitos
- Node.js 20+
- npm 10+
- Backend rodando (localmente ou via Docker)

### Passo a Passo
1. Clone o repositório e mude para a branch `develop`:
   ```bash
   git checkout develop
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Configure o arquivo `.env.local` baseado no `.env.example`:
   ```bash
   cp .env.example .env.local
   ```
4. Inicie o servidor Next.js em modo desenvolvimento:
   ```bash
   npm run dev
   ```
   Acesse: [http://localhost:3000](http://localhost:3000)

---

## 4. Verificação de Qualidade Pré-Commit / Pré-PR

Antes de abrir a Pull Request, execute os comandos de verificação:

```bash
# Checagem de tipos TypeScript
npm run typecheck

# Linter de código
npm run lint

# Execução de testes unitários
npm run test
```

Também é possível executar a suíte combinada:
```bash
npm run quality
```

---

## 5. Processo de Pull Request

1. Abra a PR no GitHub apontando **sempre** para a branch `develop`.
2. Preencha o template de Pull Request descrevendo claramente o contexto e as alterações.
3. Certifique-se de que todas as etapas do CI (GitHub Actions) foram concluídas com sucesso.
4. Aguarde a revisão de código de ao menos um mantenedor antes do merge.
