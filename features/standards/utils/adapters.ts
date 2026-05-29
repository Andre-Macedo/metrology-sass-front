import { ReferenceStandard, standardSchema } from "../types"

export function standardAdapter(data: any): ReferenceStandard {
    return standardSchema.parse(data)
}
