import { apiClient } from "./client"
import { Material } from "@/lib/types"

export async function fetchMaterials(): Promise<Material[]> {
    const { data } = await apiClient.get<{ data: Material[] }>("/materials")
    return data
}
