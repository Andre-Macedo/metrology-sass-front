"use client"

import { StandardForm, useStandard, useUpdateStandard } from "@/features/standards"
import { PageHeader } from "@/components/layout/page-header"
import { useParams, useRouter } from "@/i18n/routing"
import { toast } from "sonner"
import { useTranslations } from "next-intl"

export default function EditStandardPage() {
    const t = useTranslations('Standards')
    const params = useParams()
    const router = useRouter()
    const id = params.id as string

    const { data: standard, isLoading } = useStandard(id)
    const mutation = useUpdateStandard()

    async function onSubmit(values: any) {
        try {
            await mutation.mutateAsync({ id, data: values })
            toast.success(t('messages.updated_success'))
            router.push("/dashboard/metrology/standards")
        } catch (error) {
            toast.error(t('messages.updated_error'))
            console.error(error)
        }
    }

    if (isLoading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading...</div>
    if (!standard) return <div className="p-8 text-center text-destructive">{t('messages.not_found')}</div>

    return (
        <div className="space-y-6">
            <PageHeader
                title={`${t('edit_standard')}: ${standard.name}`}
                description={t('form.description_edit')}
            />
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                <StandardForm initialData={standard} onSubmit={onSubmit} isLoading={mutation.isPending} />
            </div>
        </div>
    )
}
