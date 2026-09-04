"use client"

import { PageHeader } from "@/components/layout/page-header"
import { StationForm } from "@/app/[locale]/(dashboard)/dashboard/system/stations/components/station-form"
import { useStationMutations, useStation } from "@/features/system/hooks/use-system"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { use } from "react"
import Loading from "../../loading"

export default function EditStationPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const { data: station, isLoading } = useStation(id)
    const { update } = useStationMutations()
    const router = useRouter()

    const handleSubmit = async (data: any) => {
        try {
            await update.mutateAsync({ id: parseInt(id), data })
            toast.success("Station updated successfully")
            router.push("/dashboard/system/stations")
        } catch (error) {
            console.error(error)
            toast.error("Failed to update station")
        }
    }

    if (isLoading) return <Loading />
    if (!station) return <div>Station not found</div>

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <PageHeader
                title={`Edit Station: ${station.name}`}
                description="Update workstation information."
            />
            <div className="border rounded-md p-6 bg-card">
                <StationForm initialData={station} onSubmit={handleSubmit} isLoading={update.isPending} />
            </div>
        </div>
    )
}
