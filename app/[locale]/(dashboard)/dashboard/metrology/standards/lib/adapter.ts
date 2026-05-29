import { ReferenceStandard, standardSchema } from "./schema"

export function standardAdapter(data: any): ReferenceStandard {
    const base = standardSchema.parse(data)
    
    // Recursively adapt children if they exist
    const children = data.children?.map((child: any) => standardAdapter(child))
    const parent = data.parent ? standardAdapter(data.parent) : undefined

    return {
        ...base,
        children,
        parent
    }
}
