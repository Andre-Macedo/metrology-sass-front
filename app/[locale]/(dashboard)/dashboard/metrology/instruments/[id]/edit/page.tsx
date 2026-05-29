"use client"

import { InstrumentForm, useInstrument, useUpdateInstrument } from "@/features/instruments"
import { PageHeader } from "@/components/layout/page-header"
import { useParams, useRouter } from "@/i18n/routing"
import { toast } from "sonner"
import { useTranslations } from "next-intl"

export default function EditInstrumentPage() {
    const t = useTranslations('Instruments')
    const params = useParams()
    const router = useRouter()
    const id = params.id as string

    const { data: instrument, isLoading } = useInstrument(id)
    const mutation = useUpdateInstrument()

    async function onSubmit(values: any) {
        try {
            await mutation.mutateAsync({ id, data: values })
            toast.success(t('messages.updated_success'))
            router.push("/dashboard/metrology/instruments")
        } catch (error) {
            toast.error(t('messages.updated_error'))
            console.error(error)
        }
    }

    if (isLoading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading...</div>
    if (!instrument) return <div className="p-8 text-center text-destructive">{t('messages.not_found')}</div>

    return (
        <div className="space-y-6">
            <PageHeader
                title={`${t('edit_instrument')}: ${instrument.name}`}
                description={t('form.description_edit')}
            />
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                <InstrumentForm initialData={instrument} onSubmit={onSubmit} isLoading={mutation.isPending} />
            </div>
        </div>
    )
}
