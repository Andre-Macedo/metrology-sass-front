import { client } from "./client"
import { Material } from "@/lib/types"

export async function fetchMaterials(): Promise<Material[]> {
    const { data } = await client.get<Material[]>("/materials")
    return data
}
