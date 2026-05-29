"use client"

import { StandardForm, useCreateStandard } from "@/features/standards"
import { PageHeader } from "@/components/layout/page-header"
import { useRouter } from "@/i18n/routing"
import { toast } from "sonner"
import { useTranslations } from "next-intl"

export default function CreateStandardPage() {
    const t = useTranslations('Standards')
    const router = useRouter()
    const mutation = useCreateStandard()

    async function onSubmit(values: any) {
        try {
            await mutation.mutateAsync(values)
            toast.success(t('messages.created_success'))
            router.push("/dashboard/metrology/standards")
        } catch (error) {
            toast.error(t('messages.created_error'))
            console.error(error)
        }
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title={t('new_standard')}
                description={t('form.description_add')}
            />
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                <StandardForm onSubmit={onSubmit} isLoading={mutation.isPending} />
            </div>
        </div>
    )
}
