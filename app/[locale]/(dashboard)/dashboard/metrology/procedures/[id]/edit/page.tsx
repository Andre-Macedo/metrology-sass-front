"use client"

import { ProcedureForm, useProcedure, useUpdateProcedure } from "@/features/procedures"
import { PageHeader } from "@/components/layout/page-header"
import { useParams, useRouter } from "@/i18n/routing"
import { toast } from "sonner"
import { useTranslations } from "next-intl"

export default function EditProcedurePage() {
    const t = useTranslations('Procedures')
    const params = useParams()
    const router = useRouter()
    const id = params.id as string

    const { data: procedure, isLoading } = useProcedure(id)
    const mutation = useUpdateProcedure()

    async function onSubmit(values: any) {
        try {
            await mutation.mutateAsync({ id, data: values })
            toast.success(t('messages.updated_success'))
            router.push("/dashboard/metrology/procedures")
        } catch (error) {
            toast.error(t('messages.updated_error'))
            console.error(error)
        }
    }

    if (isLoading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading...</div>
    if (!procedure) return <div className="p-8 text-center text-destructive">{t('messages.not_found')}</div>

    return (
        <div className="space-y-6">
            <PageHeader
                title={`${t('edit_procedure')}: ${procedure.name}`}
                description={t('form.description_edit')}
            />
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                <ProcedureForm initialData={procedure} onSubmit={onSubmit} isLoading={mutation.isPending} />
            </div>
        </div>
    )
}
