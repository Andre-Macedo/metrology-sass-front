'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Activity, 
  AlertOctagon, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Download, 
  Gauge, 
  RotateCw, 
  Settings2, 
  Thermometer, 
  Wrench, 
  Zap,
  Radio
} from 'lucide-react'
import { 
  PlantAsset, 
  ScenarioData, 
  ScenarioKey, 
  SCENARIOS_DICTIONARY 
} from '@/features/iot/data/tractian-mock-data'

interface AssetHealthHeroProps {
  asset: PlantAsset
  scenario: ScenarioData
  selectedScenarioKey: ScenarioKey
  onSelectScenario: (key: ScenarioKey) => void
  isLiveMode: boolean
  onToggleLiveMode: (live: boolean) => void
  onOpenWorkOrderModal: () => void
}

export function AssetHealthHero({
  asset,
  scenario,
  selectedScenarioKey,
  onSelectScenario,
  isLiveMode,
  onToggleLiveMode,
  onOpenWorkOrderModal,
}: AssetHealthHeroProps) {
  // Cores semânticas para o Health Index
  const getHealthColor = (score: number) => {
    if (score >= 80) return { bar: 'bg-emerald-500', borderL: 'border-l-emerald-500', text: 'text-emerald-600 dark:text-emerald-400', badge: 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10', label: 'Operação Normal' }
    if (score >= 60) return { bar: 'bg-sky-500', borderL: 'border-l-sky-500', text: 'text-sky-600 dark:text-sky-400', badge: 'border-sky-500/30 text-sky-600 dark:text-sky-400 bg-sky-500/10', label: 'Aceitável' }
    if (score >= 40) return { bar: 'bg-amber-500', borderL: 'border-l-amber-500', text: 'text-amber-600 dark:text-amber-400', badge: 'border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10', label: 'Alerta Preventivo' }
    return { bar: 'bg-rose-500', borderL: 'border-l-rose-500', text: 'text-rose-600 dark:text-rose-400', badge: 'border-rose-500/30 text-rose-600 dark:text-rose-400 bg-rose-500/10', label: 'Parada Crítica Iminente' }
  }

  const healthMeta = getHealthColor(scenario.healthScore)

  return (
    <Card className={`relative overflow-hidden border border-border border-l-4 ${healthMeta.borderL} bg-card shadow-none`}>
      <CardContent className="p-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          
          {/* Lado Esquerdo: Readout Técnico de Saúde & Identificação */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="w-32 shrink-0 space-y-1.5 border-b sm:border-b-0 sm:border-r border-border pb-3 sm:pb-0 sm:pr-5">
              <span className="block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Índice de Saúde
              </span>
              <div className="flex items-baseline gap-0.5">
                <span className={`font-mono text-3xl font-semibold tracking-tight ${healthMeta.text}`}>
                  {scenario.healthScore}
                </span>
                <span className="font-mono text-xs text-muted-foreground">%</span>
              </div>
              <div className="h-1 w-full overflow-hidden rounded-xs bg-muted">
                <div
                  className={`h-full transition-all duration-500 ${healthMeta.bar}`}
                  style={{ width: `${Math.min(100, Math.max(0, scenario.healthScore))}%` }}
                />
              </div>
            </div>

            {/* Informações Centrais do Ativo */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                  {asset.name}
                </h1>
                
                <Badge 
                  variant="outline" 
                  className={`gap-1.5 px-2 py-0.5 text-[11px] font-medium ${healthMeta.badge}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${healthMeta.bar}`} />
                  <span>{healthMeta.label}</span>
                </Badge>

                {isLiveMode && (
                  <Badge variant="default" className="gap-1 bg-emerald-600 hover:bg-emerald-600 text-[11px] font-mono">
                    <Radio className="h-3 w-3 animate-pulse" />
                    <span>LIVE</span>
                  </Badge>
                )}
              </div>

              <p className="text-xs text-muted-foreground line-clamp-1">
                {scenario.tagline}
              </p>

              {/* Faixa Técnica de Especificação Industrial */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 font-mono text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <RotateCw className="h-3 w-3" />
                  <strong className="font-semibold text-foreground">{scenario.operatingRpm}</strong> RPM
                </span>
                <span className="text-border">|</span>
                <span className="inline-flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  <strong className="font-semibold text-foreground">{asset.nominalPowerKw}</strong> kW
                </span>
                <span className="text-border">|</span>
                <span className="inline-flex items-center gap-1">
                  <Gauge className="h-3 w-3" />
                  <strong className="font-semibold text-foreground">{asset.bearing.model}</strong>
                </span>
                <span className="text-border">|</span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <strong className="font-semibold text-foreground">{scenario.runningHours}h</strong>
                </span>
              </div>
            </div>

          </div>

          {/* Lado Direito: Seletor de Cenários / Datasets e Ações */}
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row items-stretch lg:items-end xl:items-center">
            
            {/* Seletor de Cenários / Dados */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                <Settings2 className="h-3 w-3" />
                Cenário Físico / Dataset de Treino:
              </label>
              <Select
                value={selectedScenarioKey}
                onValueChange={(val: any) => {
                  onToggleLiveMode(false)
                  onSelectScenario(val)
                }}
              >
                <SelectTrigger className="w-full sm:w-[260px] bg-background">
                  <SelectValue placeholder="Selecione o cenário" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(SCENARIOS_DICTIONARY).map((sc) => (
                    <SelectItem key={sc.id} value={sc.id}>
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${
                          sc.isoZone === 'A' ? 'bg-emerald-500' : sc.isoZone === 'B' ? 'bg-blue-500' : sc.isoZone === 'C' ? 'bg-amber-500' : 'bg-rose-500'
                        }`} />
                        <span>{sc.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Ações Primárias */}
            <div className="flex items-center gap-2 pt-1 sm:pt-4 lg:pt-0">
              <Button
                variant={scenario.healthScore < 80 ? 'destructive' : 'default'}
                className="gap-2 shadow-sm font-semibold"
                onClick={onOpenWorkOrderModal}
              >
                <Wrench className="h-4 w-4" />
                <span>Gerar O.S. Preditiva</span>
              </Button>

              <Button
                variant="outline"
                size="icon"
                className="shrink-0 text-muted-foreground hover:text-foreground"
                title="Exportar Laudo Técnico e Espectro FFT"
                onClick={() => {
                  window.print()
                }}
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>

          </div>

        </div>
      </CardContent>
    </Card>
  )
}
