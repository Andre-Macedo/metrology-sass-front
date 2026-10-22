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
  // Cores dinâmicas para o Health Index Ring
  const getHealthColor = (score: number) => {
    if (score >= 80) return { stroke: '#10b981', text: 'text-emerald-500', bg: 'bg-emerald-500/10', label: 'Saudável' }
    if (score >= 60) return { stroke: '#3b82f6', text: 'text-blue-500', bg: 'bg-blue-500/10', label: 'Aceitável' }
    if (score >= 40) return { stroke: '#f59e0b', text: 'text-amber-500', bg: 'bg-amber-500/10', label: 'Atenção' }
    return { stroke: '#ef4444', text: 'text-rose-500', bg: 'bg-rose-500/10', label: 'Crítico' }
  }

  const healthMeta = getHealthColor(scenario.healthScore)
  const radius = 38
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (scenario.healthScore / 100) * circumference

  return (
    <Card className="relative overflow-hidden border-border/80 shadow-sm bg-gradient-to-br from-card via-card to-muted/20">
      <CardContent className="p-5 sm:p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          
          {/* Lado Esquerdo: Health Gauge Ring & Título */}
          <div className="flex items-start sm:items-center gap-5">
            {/* SVG Ring Gauge */}
            <div className="relative flex shrink-0 items-center justify-center">
              <svg className="h-24 w-24 -rotate-90 transform">
                <circle
                  cx="48"
                  cy="48"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-muted/40"
                  fill="transparent"
                />
                <circle
                  cx="48"
                  cy="48"
                  r={radius}
                  stroke={healthMeta.stroke}
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                  fill="transparent"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="font-mono text-2xl font-black tracking-tight text-foreground">
                  {scenario.healthScore}%
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Saúde
                </span>
              </div>
            </div>

            {/* Informações Centrais do Ativo */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                  {asset.name}
                </h1>
                
                {/* Status Operacional */}
                <Badge 
                  variant="outline" 
                  className={`gap-1.5 px-2.5 py-0.5 font-medium ${
                    scenario.healthScore >= 80 
                      ? 'border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10' 
                      : scenario.healthScore >= 40 
                        ? 'border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-500/10'
                        : 'border-rose-500/40 text-rose-600 dark:text-rose-400 bg-rose-500/10'
                  }`}
                >
                  <span className="h-2 w-2 rounded-full bg-current animate-pulse" />
                  <span>
                    {scenario.healthScore >= 80 ? 'Operação Normal' : scenario.healthScore >= 40 ? 'Alerta Preventivo' : 'Parada Crítica Iminente'}
                  </span>
                </Badge>

                {isLiveMode && (
                  <Badge variant="default" className="gap-1 bg-emerald-600 hover:bg-emerald-600">
                    <Radio className="h-3 w-3 animate-ping" />
                    <span>Ao Vivo (Reverb)</span>
                  </Badge>
                )}
              </div>

              <p className="text-sm text-muted-foreground line-clamp-1">
                {scenario.tagline}
              </p>

              {/* Badges Técnicas de Especificação Industrial */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                <div className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-0.5 text-muted-foreground">
                  <RotateCw className="h-3 w-3 text-blue-500" />
                  <span className="font-semibold text-foreground">{scenario.operatingRpm}</span> RPM
                </div>
                
                <div className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-0.5 text-muted-foreground">
                  <Zap className="h-3 w-3 text-amber-500" />
                  <span className="font-semibold text-foreground">{asset.nominalPowerKw}</span> kW (3 CV)
                </div>

                <div className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-0.5 text-muted-foreground">
                  <Gauge className="h-3 w-3 text-indigo-500" />
                  <span className="font-semibold text-foreground">{asset.bearing.model}</span>
                </div>

                <div className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-0.5 text-muted-foreground">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="font-mono text-foreground font-semibold">{scenario.runningHours}h</span> horímetro
                </div>
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
