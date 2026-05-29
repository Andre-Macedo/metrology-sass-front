import { Instrument, instrumentSchema } from "./schema"

export function instrumentAdapter(data: any): Instrument {
    // Ensure we handle potential nulls/undefineds from API gracefully if Zod is strict
    // But here we rely on Zod's defaults in schema.ts

    // If we had to map "Aprovado" -> "pass", we would do it here.
    // Example: result: data.result_label === 'Aprovado' ? 'pass' : 'fail'

    // Current backend is aligned, so we just validate.
    return instrumentSchema.parse(data)
}
