# Zod: The Frontend Validator

**Zod** is a TypeScript-first schema declaration and validation library. We use it to ensure the data coming from our Backend API matches exactly what our Frontend expects, preventing runtime crashes.

## Why use it?
1.  **Type Safety**: It automatically generates TypeScript interfaces from your schema (`z.infer<typeof schema>`).
2.  **Runtime Check**: It verifies data *at runtime*. If the API returns a number where you expect a string, Zod catches it before your React component tries to `.toUpperCase()` it and crashes.
3.  **Coercion**: It can magically fix data types (e.g., turning a backend number `123` into a frontend string `"123"`).

## Common Patterns in This Project

### 1. Basic Object
Define the shape of your data.
```typescript
const userSchema = z.object({
  username: z.string(),
})
```

### 2. Handling IDs (Number vs String)
Backends usually store IDs as integers (`1`), but frontends often prefer strings (`"1"`) for consistency (URL params are strings).
**Use `z.coerce.string()` to handle both.**
```typescript
// Works for input "123" AND 123
id: z.coerce.string()
```

### 3. Handling Nulls & Optionals
APIs often return `null` for empty fields, or omit the key entirely.
```typescript
// Handles "value", null, and undefined
description: z.string().nullable().optional()
```

### 4. Default Values (Transforms)
To avoid checking `if (x === null)` in your UI, transform nulls into safe defaults.
```typescript
// If null or undefined, becomes "Unknown"
category: z.string().nullable().optional().transform(val => val || "Unknown")
```

### 5. Arrays of Objects
```typescript
const responseSchema = z.array(userSchema);
// or within an object
items: z.array(itemSchema)
```

## Troubleshooting "No Data Found"
If your API returns 200 OK but your table is empty, **Zod is likely failing validation**.
Check the browser console or wrap your parsing in a `safeParse` to see the error:

```typescript
// adapter.ts
const result = schema.safeParse(data);
if (!result.success) {
  console.error("Zod Validation Error:", result.error);
  return fallbackData;
}
return result.data;
```
