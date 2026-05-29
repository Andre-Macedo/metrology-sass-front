import { useQuery } from "@tanstack/react-query"
import { fetchMaterials } from "@/lib/api/materials"

export function useMaterials() {
    return useQuery({
        queryKey: ["materials"],
        queryFn: fetchMaterials,
        staleTime: 1000 * 60 * 60, // 1 hour (materials rarely change)
    })
}
