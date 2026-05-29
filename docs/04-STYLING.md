# 04. Estilização e UI

A consistência visual da plataforma SaaS do MetroLab é garantida pelo uso rigoroso do Tailwind CSS e da biblioteca de componentes Shadcn UI.

## 1. O Padrão Utility-First (Tailwind)

- **Apenas Classes do Tailwind:** Evite criar arquivos `.css` ou `.scss` customizados. 99% da estilização deve ser feita in-line usando classes utilitárias.
- **Design Tokens:** Use as variáveis CSS definidas no Shadcn (ex: `bg-primary`, `text-muted-foreground`, `border-border`). Isso garante que o Dark Mode funcione automaticamente sem precisar escrever `dark:bg-white` manualmente em todos os lugares.

### ❌ Ruim (Cores fixas, quebra no dark mode)
```tsx
<div className="bg-[#f4f4f5] text-[#333] border-[#ccc]">...</div>
```

### ✅ Bom (Variáveis semânticas)
```tsx
<div className="bg-muted text-foreground border-border">...</div>
```

## 2. Manipulação de Classes Dinâmicas (cn)

Nunca concatene strings manualmente para classes dinâmicas. Use sempre a função `cn()` (fornecida pelo `clsx` e `tailwind-merge` no utilitário de sistema).

### ❌ Ruim
```tsx
<div className={`p-4 rounded ${isActive ? 'bg-primary' : 'bg-transparent'} ${className || ''}`} />
```

### ✅ Bom
```tsx
import { cn } from "@/lib/utils"

<div className={cn(
  "p-4 rounded bg-transparent", 
  isActive && "bg-primary text-primary-foreground",
  className
)} />
```

## 3. Componentes Base (Shadcn UI)

O Shadcn UI não é uma biblioteca instalada via npm, é código-fonte (vivendo em `components/ui/`).
1.  **Não altere o core levianamente:** Se você modificar um arquivo base em `components/ui/`, essa modificação afetará a aplicação inteira. 
2.  **Extensibilidade via Variants:** Se precisar de um novo "estilo" de botão, não crie uma classe extra onde o botão é usado; modifique o `cva` no `components/ui/button.tsx` adicionando uma nova `variant`.
3.  **Use o que existe:** Antes de construir um Dropdown, Select, Dialog ou Tooltip do zero, verifique se já existe no Shadcn.

## 4. Tipografia e Espaçamento

- Use as classes de layout do Tailwind para espaçamento: `space-y-4` (para espaçamento vertical automático entre filhos) e `gap-4` (dentro de grids e flexboxes) no lugar de usar `mb-4` ou `mt-4` em cada item.
- Tipografia: Respeite a hierarquia. Títulos principais usam `text-2xl font-bold tracking-tight`. Textos de apoio usam `text-sm text-muted-foreground`.

```tsx
// Exemplo de cabeçalho bem estruturado
<div className="flex flex-col space-y-1.5">
  <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
  <p className="text-sm text-muted-foreground">Visão geral do sistema.</p>
</div>
```