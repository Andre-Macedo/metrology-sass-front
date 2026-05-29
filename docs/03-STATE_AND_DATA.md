# 03. Gerenciamento de Estado, Dados e Validação

O gerenciamento de dados e estado no MetroLab é essencial para garantir consistência, validação robusta (especialmente na metrologia) e boa performance.

## 1. Estado Remoto (API e Dados Assíncronos)

**Ferramenta Oficial:** TanStack React Query (`@tanstack/react-query`).

O React Query é o nosso gerenciador de estado global para tudo o que vem do backend.
- **Nunca** use `useEffect` + `useState` para fazer fetch de dados.
- Mantenha os hooks do React Query isolados por módulo (ex: `hooks/use-instruments.ts`).

### Padrão de Fetching
```typescript
// ✅ Bom: Hook encapsulado
export function useInstruments(page: number, search: string) {
  return useQuery({
    queryKey: ['instruments', page, search],
    queryFn: () => fetchInstruments(page, search),
    staleTime: 5 * 60 * 1000, // 5 minutos (Evita refetch desnecessário)
  })
}
```

### Padrão de Mutação
- Sempre use `onSuccess` para invalidar a query correspondente após uma mutação (ex: atualizar a lista de instrumentos após criar um novo).

```typescript
export function useCreateInstrument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: InstrumentFormData) => api.post('/instruments', data),
    onSuccess: () => {
      // Força a recarga da lista
      queryClient.invalidateQueries({ queryKey: ['instruments'] })
    },
  })
}
```

## 2. Formulários e Validação

A combinação sagrada no MetroLab para formulários é: **React Hook Form + Zod + Shadcn UI Form**.

### Regras para Formulários
1.  **Sempre defina um Schema Zod:** É a fonte da verdade para o tipo e validação.
2.  **Validação Internacionalizada:** Como implementado, as mensagens do Zod devem utilizar o `next-intl` (ex: `tV('required')`).
3.  **Inferência de Tipos:** Sempre inferir o tipo do formulário a partir do schema Zod.

```tsx
// ✅ Padrão MetroLab
const tV = useTranslations('Validations');

const formSchema = z.object({
  name: z.string().min(1, tV('required')),
  nominal_value: z.coerce.number().optional(), // coerce para forçar conversão segura
});

type FormData = z.infer<typeof formSchema>;
```

## 3. Estado Local e Global (UI)

Para estados que pertencem estritamente à interface do usuário:

1.  **Estado Local (`useState`, `useReducer`):** Para estados simples de um componente (ex: modais abertos, abas ativas, inputs de busca).
2.  **URL State (`useSearchParams`, `useRouter`):** Para estados que devem ser compartilháveis via URL ou persistentes ao recarregar (ex: Filtros, Paginação, Buscas ativas). **Sempre priorize isso para listagens.**
3.  **Estado Global (`Context API` ou `Zustand`):** **Evite ao máximo.** Use apenas para dados que afetam toda a aplicação e raramente mudam (ex: Temas de UI, Idioma, Sessão de Usuário Autenticado). Para cache de API, o React Query já resolve.