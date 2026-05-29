"use client"

import { InstrumentForm, useCreateInstrument } from "@/features/instruments"
import { PageHeader } from "@/components/layout/page-header"
import { useRouter } from "@/i18n/routing"
import { toast } from "sonner"
import { useTranslations } from "next-intl"

export default function CreateInstrumentPage() {
    const t = useTranslations('Instruments')
    const router = useRouter()
    const mutation = useCreateInstrument()

    async function onSubmit(values: any) {
        try {
            await mutation.mutateAsync(values)
            toast.success(t('messages.created_success'))
            router.push("/dashboard/metrology/instruments")
        } catch (error) {
            toast.error(t('messages.created_error'))
            console.error(error)
        }
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title={t('add_instrument')}
                description={t('form.description_add')}
            />
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                <InstrumentForm onSubmit={onSubmit} isLoading={mutation.isPending} />
            </div>
        </div>
    )
}
