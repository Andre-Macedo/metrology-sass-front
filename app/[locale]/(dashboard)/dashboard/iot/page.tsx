'use client'

import React from 'react'
import { PageHeader } from '@/components/layout/page-header'
import { useTranslations } from 'next-intl'
import { TractianAssetHealthStudio } from '@/components/iot/tractian/TractianAssetHealthStudio'
import { RealTimeTelemetry } from '@/components/iot/RealTimeTelemetry'
import { HistoricalTelemetry } from '@/components/iot/HistoricalTelemetry'
import { IoTLogsDiagnostic } from '@/components/iot/IoTLogsDiagnostic'
import { IoTDatasetsManager } from '@/components/iot/IoTDatasetsManager'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Sparkles, Activity, History, Terminal, Database } from 'lucide-react'

export default function IoTPage() {
  const t = useTranslations('Sidebar')
  const [tenantSlug, setTenantSlug] = React.useState<string | null>(null)

  React.useEffect(() => {
    setTenantSlug(localStorage.getItem('current_tenant_slug'))
  }, [])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Monitoramento Preditivo de Ativos (IoT & IA)"
        description="Gestão de saúde de ativos, análise espectral FFT, severidade ISO 20816-3 e diagnóstico prescritivo em tempo real."
      />

      <Tabs defaultValue="tractian" className="space-y-4">
        <TabsList className="flex flex-wrap h-auto p-1 bg-muted/60 border border-border/60">
          <TabsTrigger 
            value="tractian" 
            className="gap-2 font-bold data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-xs"
          >
            <Sparkles className="h-4 w-4 text-primary" />
            <span>Cockpit Preditivo (Tractian)</span>
          </TabsTrigger>
          
          <TabsTrigger value="realtime" className="gap-1.5">
            <Activity className="h-3.5 w-3.5" />
            <span>Telemetria ao Vivo</span>
          </TabsTrigger>
          
          <TabsTrigger value="history" className="gap-1.5">
            <History className="h-3.5 w-3.5" />
            <span>Análise Histórica</span>
          </TabsTrigger>
          
          <TabsTrigger value="logs" className="gap-1.5">
            <Terminal className="h-3.5 w-3.5" />
            <span>Logs & Diagnóstico</span>
          </TabsTrigger>
          
          <TabsTrigger value="datasets" className="gap-1.5">
            <Database className="h-3.5 w-3.5" />
            <span>Datasets & Modelos IA</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tractian" className="space-y-6 focus-visible:outline-none">
          <TractianAssetHealthStudio />
        </TabsContent>

        <TabsContent value="realtime" className="space-y-6 focus-visible:outline-none">
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

        <TabsContent value="history" className="space-y-6 focus-visible:outline-none">
          <HistoricalTelemetry />
        </TabsContent>

        <TabsContent value="logs" className="space-y-6 focus-visible:outline-none">
          <IoTLogsDiagnostic />
        </TabsContent>

        <TabsContent value="datasets" className="space-y-6 focus-visible:outline-none">
          <IoTDatasetsManager />
        </TabsContent>
      </Tabs>
    </div>
  )
}
