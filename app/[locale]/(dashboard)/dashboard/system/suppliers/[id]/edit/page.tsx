"use client"

import { PageHeader } from "@/components/layout/page-header"
import { SupplierForm } from "@/app/[locale]/(dashboard)/dashboard/system/suppliers/components/supplier-form"
import { useSupplierMutations, useSupplier } from "@/lib/hooks/use-system"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { use } from "react"
import Loading from "../../loading"

export default function EditSupplierPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const { data: supplier, isLoading } = useSupplier(id)
    const { update } = useSupplierMutations()
    const router = useRouter()

    const handleSubmit = async (data: any) => {
        try {
            await update.mutateAsync({ id: parseInt(id), data })
            toast.success("Supplier updated successfully")
            router.push("/dashboard/system/suppliers")
        } catch (error) {
            console.error(error)
            toast.error("Failed to update supplier")
        }
    }

    if (isLoading) return <Loading />
    if (!supplier) return <div>Supplier not found</div>

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <PageHeader
                title={`Edit Supplier: ${supplier.name}`}
                description="Update partner information."
            />
            <div className="border rounded-md p-6 bg-card">
                <SupplierForm initialData={supplier} onSubmit={handleSubmit} isLoading={update.isPending} />
            </div>
        </div>
    )
}
