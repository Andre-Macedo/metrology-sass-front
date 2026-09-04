"use client"

import { PageHeader } from "@/components/layout/page-header"
import { SupplierForm } from "@/app/[locale]/(dashboard)/dashboard/system/suppliers/components/supplier-form"
import { useSupplierMutations } from "@/features/system/hooks/use-system"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function CreateSupplierPage() {
    const { create } = useSupplierMutations()
    const router = useRouter()

    const handleSubmit = async (data: any) => {
        try {
            await create.mutateAsync(data)
            toast.success("Supplier created successfully")
            router.push("/dashboard/system/suppliers")
        } catch (error) {
            console.error(error)
            toast.error("Failed to create supplier")
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <PageHeader
                title="Create Supplier"
                description="Register a new external partner or provider."
            />
            <div className="border rounded-md p-6 bg-card">
                <SupplierForm onSubmit={handleSubmit} isLoading={create.isPending} />
            </div>
        </div>
    )
}
