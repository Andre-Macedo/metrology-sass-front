# 02. Padrões de Componentes

Este documento orienta a criação, tipagem e organização de componentes React no projeto MetroLab.

## 1. Separação de Responsabilidades (Smart vs. Dumb)

### Dumb Components (Apresentação / UI)
- Vivem em `components/ui/` ou dentro da subpasta `components/` de um módulo.
- **Não sabem de onde vêm os dados.** Recebem tudo via `props`.
- **Não têm estado global** (nem Contexto, nem Zustand, nem chamadas de API).
- Emitem eventos (via `onXxx` props) em vez de acionar mutações diretamente.
- *Exemplo:* Um botão, um campo de input, ou um `InstrumentCard` que apenas renderiza dados.

### Smart Components (Containers / Páginas)
- Vivem nas rotas do Next.js (`page.tsx`) ou são wrappers de alto nível.
- **Buscam dados** (via React Query ou Server Components).
- **Gerenciam estado complexo** ou interagem com a API/Mutações.
- Passam os dados e callbacks para os *Dumb Components*.
- *Exemplo:* `InstrumentsPage` (faz o fetch da lista e passa para o `DataTable`).

## 2. Padrão de Nomenclatura e Arquivos

- **Arquivos:** Usar `kebab-case.tsx` (ex: `instrument-form.tsx`, `data-table.tsx`).
- **Componentes:** Usar `PascalCase` (ex: `InstrumentForm`, `DataTable`).
- **Props:** Usar o padrão `{NomeDoComponente}Props`.

```tsx
// ❌ Ruim
export default function userProfile(props: any) { ... }

// ✅ Bom
interface UserProfileProps {
  user: User;
  onEdit: (id: string) => void;
}

export function UserProfile({ user, onEdit }: UserProfileProps) { ... }
```

## 3. Tipagem

- Use `interface` para objetos e props. Use `type` para uniões ou tipos primitivos.
- **Nunca** use `any`. Se não souber o tipo, use `unknown` ou crie um tipo temporário.
- Mantenha os tipos de domínio (ex: `Instrument`, `Calibration`) centralizados (em `lib/types.ts` ou dentro do arquivo `types.ts` do respectivo módulo) e importe-os nos componentes.

## 4. O Padrão Server vs Client Components (Next.js App Router)

- **Default = Server Component:** O Next.js cria componentes do servidor por padrão. Use-os sempre que possível para SEO, performance e carregamento inicial rápido.
- **Quando usar `"use client"`:**
  - Se precisar de hooks do React (`useState`, `useEffect`, `useRef`).
  - Se precisar de interatividade de UI (botões com `onClick`, forms).
  - Se usar hooks do Next.js dependentes do cliente (`useRouter`, `usePathname`, `useSearchParams`).
  - Se usar hooks de dados do cliente (ex: `useQuery` do React Query).
- **Regra de Ouro:** Coloque o `"use client"` no nível mais baixo possível da árvore de componentes. Não coloque no `layout.tsx` global ou na página raiz se apenas um botão precisa de interatividade.

## 5. Destructuring e Valores Padrão

Sempre desestruture props e forneça valores padrão diretamente na assinatura da função.

```tsx
// ✅ Bom
interface BadgeProps {
  label: string;
  variant?: 'default' | 'outline' | 'destructive';
}

export function Badge({ label, variant = 'default' }: BadgeProps) {
  return <span className={`badge-${variant}`}>{label}</span>;
}
```