"use client"

import { PageHeader } from "@/components/layout/page-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InstrumentTypesList } from "@/app/[locale]/(dashboard)/dashboard/metrology/settings/components/instrument-types-list"
import { StandardTypesList } from "@/app/[locale]/(dashboard)/dashboard/metrology/settings/components/standard-types-list"
import { MaterialsList } from "@/app/[locale]/(dashboard)/dashboard/metrology/settings/components/materials-list"
import { GlobalSettingsForm } from "@/app/[locale]/(dashboard)/dashboard/metrology/settings/components/global-settings-form"
import { useTranslations } from "next-intl"

export default function MetrologySettingsPage() {
    const t = useTranslations('Settings')

    return (
        <div className="space-y-6">
            <PageHeader
                title={t('title')}
                description={t('description')}
            />

            <Tabs defaultValue="global" className="w-full">
                <TabsList>
                    <TabsTrigger value="global">{t('global_preferences')}</TabsTrigger>
                    <TabsTrigger value="instruments">{t('instrument_types')}</TabsTrigger>
                    <TabsTrigger value="standards">{t('standard_types')}</TabsTrigger>
                    <TabsTrigger value="materials">{t('materials.tab_title')}</TabsTrigger>
                </TabsList>

                <TabsContent value="global" className="mt-4">
                    <GlobalSettingsForm />
                </TabsContent>

                <TabsContent value="instruments" className="mt-4">
                    <InstrumentTypesList />
                </TabsContent>

                <TabsContent value="standards" className="mt-4">
                    <StandardTypesList />
                </TabsContent>

                <TabsContent value="materials" className="mt-4">
                    <MaterialsList />
                </TabsContent>
            </Tabs>
        </div>
    )
}
