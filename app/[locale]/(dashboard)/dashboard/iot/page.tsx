'use client'

import React from 'react'
import { PageHeader } from '@/components/layout/page-header'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/lib/hooks/use-auth'
import { TractianAssetHealthStudio } from '@/components/iot/tractian/TractianAssetHealthStudio'
import { RealTimeTelemetry } from '@/components/iot/RealTimeTelemetry'
import { HistoricalTelemetry } from '@/components/iot/HistoricalTelemetry'
import { IoTLogsDiagnostic } from '@/components/iot/IoTLogsDiagnostic'
import { IoTDatasetsManager } from '@/components/iot/IoTDatasetsManager'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Sparkles, Activity, History, Terminal, Database, Building2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function IoTPage() {
  const t = useTranslations('Sidebar')
  const { user } = useAuth()
  const [tenantSlug, setTenantSlug] = React.useState<string>('amemiya')

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const slug = localStorage.getItem('current_tenant_slug') || user?.tenant_slug || 'amemiya'
      setTenantSlug(slug)
      if (!localStorage.getItem('current_tenant_slug')) {
        localStorage.setItem('current_tenant_slug', slug)
      }
    }
  }, [user])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Monitoramento Preditivo de Ativos (IoT & IA)"
          description="Gestão de saúde de ativos, análise espectral FFT, severidade ISO 20816-3 e diagnóstico prescritivo em tempo real."
        />

        <div className="flex items-center gap-2 self-start sm:self-auto bg-muted/60 border border-border px-3 py-1.5 rounded-lg text-xs shadow-xs">
          <Building2 className="h-4 w-4 text-primary" />
          <span className="text-muted-foreground font-medium">Tenant Ativo:</span>
          <Badge variant="outline" className="font-mono text-primary font-bold uppercase tracking-wider bg-background">
            {tenantSlug}
          </Badge>
        </div>
      </div>

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
          <div className="space-y-6">
            <RealTimeTelemetry tenantId={tenantSlug} />
          </div>
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
