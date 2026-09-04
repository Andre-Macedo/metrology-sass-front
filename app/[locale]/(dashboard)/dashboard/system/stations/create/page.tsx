"use client"

import { PageHeader } from "@/components/layout/page-header"
import { StationForm } from "@/app/[locale]/(dashboard)/dashboard/system/stations/components/station-form"
import { useStationMutations } from "@/features/system/hooks/use-system"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function CreateStationPage() {
    const { create } = useStationMutations()
    const router = useRouter()

    const handleSubmit = async (data: any) => {
        try {
            await create.mutateAsync(data)
            toast.success("Station created successfully")
            router.push("/dashboard/system/stations")
        } catch (error) {
            console.error(error)
            toast.error("Failed to create station")
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <PageHeader
                title="Create Station"
                description="Register a new workstation or laboratory."
            />
            <div className="border rounded-md p-6 bg-card">
                <StationForm onSubmit={handleSubmit} isLoading={create.isPending} />
            </div>
        </div>
    )
}
