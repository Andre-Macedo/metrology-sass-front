import { Instrument, instrumentSchema } from "../types"

export function instrumentAdapter(data: any): Instrument {
    return instrumentSchema.parse(data)
}
