'use client'

import React from 'react'
import { PageHeader } from '@/components/layout/page-header'
import { useTranslations } from 'next-intl'
import { RealTimeTelemetry } from '@/components/iot/RealTimeTelemetry'
import { HistoricalTelemetry } from '@/components/iot/HistoricalTelemetry'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function IoTPage() {
  const t = useTranslations('Sidebar')
  const [tenantSlug, setTenantSlug] = React.useState<string | null>(null)

  React.useEffect(() => {
    setTenantSlug(localStorage.getItem('current_tenant_slug'))
  }, [])

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('iot')}
        description="Monitore a saúde e telemetria dos seus ativos em tempo real com inteligência artificial."
      />

      <Tabs defaultValue="realtime" className="space-y-4">
        <TabsList>
          <TabsTrigger value="realtime">Tempo Real</TabsTrigger>
          <TabsTrigger value="history">Análise Histórica</TabsTrigger>
        </TabsList>

        <TabsContent value="realtime">
          {tenantSlug ? (
            <div className="space-y-6">
              <RealTimeTelemetry tenantId={tenantSlug} />
            </div>
          ) : (
            <div className="flex h-[400px] items-center justify-center rounded-lg border border-dashed">
              <p className="text-muted-foreground text-sm">
                Selecione um tenant para visualizar os dados de IoT.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="history">
          <HistoricalTelemetry />
        </TabsContent>
      </Tabs>
    </div>
  )
}
