'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScenarioData } from '@/features/iot/data/tractian-mock-data'
import { Activity, AlertTriangle, CheckCircle2, Gauge, Info, ShieldAlert, Thermometer } from 'lucide-react'

interface VibrationSeverityCockpitProps {
  scenario: ScenarioData
}

export function VibrationSeverityCockpit({ scenario }: VibrationSeverityCockpitProps) {
  const globalVel = scenario.triaxialVelocityRms.global
  const rx = scenario.triaxialVelocityRms.radialX
  const ry = scenario.triaxialVelocityRms.radialY
  const az = scenario.triaxialVelocityRms.axialZ
  const temp = scenario.temperature

  // Limites normalizados da ISO 20816-3 Grupo 2 (Base Rígida)
  const limitA = 1.4 // mm/s
  const limitB = 2.8 // mm/s
  const limitC = 4.5 // mm/s
  const maxScale = 7.0 // mm/s para o range visual

  // Posição percentual do cursor na barra da ISO
  const currentPosPct = Math.min(Math.max((globalVel / maxScale) * 100, 2), 98)

  const getZoneBadge = (zone: 'A' | 'B' | 'C' | 'D') => {
    switch (zone) {
      case 'A':
        return {
          title: 'Zona A - Excelente',
          desc: 'Operação irrestrita. Vibração de máquina nova ou recém-revisada.',
          variant: 'default',
          bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
          icon: CheckCircle2,
        }
      case 'B':
        return {
          title: 'Zona B - Aceitável',
          desc: 'Condição normal de trabalho contínuo a longo prazo.',
          variant: 'secondary',
          bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
          icon: Activity,
        }
      case 'C':
        return {
          title: 'Zona C - Alerta de Manutenção',
          desc: 'Operação restrita. Planejar parada técnica para correção.',
          variant: 'outline',
          bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
          icon: AlertTriangle,
        }
      case 'D':
        return {
          title: 'Zona D - Perigo / Parada Obrigatória',
          desc: 'Vibração inaceitável. Alto risco de fadiga estrutural e quebra.',
          variant: 'destructive',
          bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30',
          icon: ShieldAlert,
        }
    }
  }

  const zoneMeta = getZoneBadge(scenario.isoZone)
  const ZoneIcon = zoneMeta.icon

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Gauge className="h-5 w-5 text-primary" />
              <CardTitle className="text-base font-bold">
                Severidade de Vibração Global & Triaxial
              </CardTitle>
            </div>
            <CardDescription className="text-xs">
              Classificação em tempo real conforme a norma internacional ISO 20816-3 (Grupo 2 - Base Rígida)
            </CardDescription>
          </div>

          <Badge variant="outline" className={`gap-1.5 px-3 py-1 font-semibold ${zoneMeta.bg}`}>
            <ZoneIcon className="h-3.5 w-3.5" />
            <span>{zoneMeta.title}</span>
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Régua Contínua da ISO 20816-3 */}
        <div className="space-y-2">
          <div className="relative pt-6">
            {/* Marcador móvel do valor atual */}
            <div
              className="absolute top-0 -translate-x-1/2 flex flex-col items-center transition-all duration-500"
              style={{ left: `${currentPosPct}%` }}
            >
              <span className="font-mono text-xs font-semibold px-1.5 py-0.5 rounded-xs bg-foreground text-background">
                {globalVel.toFixed(2)} mm/s
              </span>
              <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-foreground" />
            </div>

            {/* Barra multicor das 4 zonas */}
            <div className="flex h-4 w-full overflow-hidden rounded-full border border-border/70 shadow-inner">
              {/* Zona A: 0 a 1.4 mm/s */}
              <div
                className="bg-emerald-500 flex items-center justify-center text-[10px] font-bold text-white transition-opacity hover:opacity-90"
                style={{ width: `${(limitA / maxScale) * 100}%` }}
                title="Zona A: 0 a 1.4 mm/s (Excelente)"
              >
                A
              </div>
              {/* Zona B: 1.4 a 2.8 mm/s */}
              <div
                className="bg-blue-500 flex items-center justify-center text-[10px] font-bold text-white transition-opacity hover:opacity-90"
                style={{ width: `${((limitB - limitA) / maxScale) * 100}%` }}
                title="Zona B: 1.4 a 2.8 mm/s (Aceitável)"
              >
                B
              </div>
              {/* Zona C: 2.8 a 4.5 mm/s */}
              <div
                className="bg-amber-500 flex items-center justify-center text-[10px] font-bold text-white transition-opacity hover:opacity-90"
                style={{ width: `${((limitC - limitB) / maxScale) * 100}%` }}
                title="Zona C: 2.8 a 4.5 mm/s (Alerta)"
              >
                C
              </div>
              {/* Zona D: > 4.5 mm/s */}
              <div
                className="bg-rose-500 flex items-center justify-center text-[10px] font-bold text-white transition-opacity hover:opacity-90"
                style={{ width: `${((maxScale - limitC) / maxScale) * 100}%` }}
                title="Zona D: > 4.5 mm/s (Perigo / Parada)"
              >
                D
              </div>
            </div>

            {/* Marcadores numéricos inferiores */}
            <div className="relative mt-1 flex justify-between text-[11px] font-mono text-muted-foreground">
              <span>0.0</span>
              <span style={{ position: 'absolute', left: `${(limitA / maxScale) * 100}%`, transform: 'translateX(-50%)' }}>1.4</span>
              <span style={{ position: 'absolute', left: `${(limitB / maxScale) * 100}%`, transform: 'translateX(-50%)' }}>2.8</span>
              <span style={{ position: 'absolute', left: `${(limitC / maxScale) * 100}%`, transform: 'translateX(-50%)' }}>4.5</span>
              <span>7.0 mm/s</span>
            </div>
          </div>
        </div>

        {/* Grid de Medidores dos 3 Eixos Ortogonais + Temperatura de Contato */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          
          {/* Radial Horizontal X */}
          <div className="rounded-lg border border-border/80 bg-muted/20 p-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Radial X (Horiz)</span>
              <span className="font-mono text-[10px] text-cyan-600 dark:text-cyan-400">Canal 1</span>
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="font-mono text-2xl font-bold tracking-tight text-foreground">
                {rx.toFixed(2)}
              </span>
              <span className="text-xs text-muted-foreground">mm/s</span>
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground">
              Acel: <span className="font-mono font-medium text-foreground">{scenario.triaxialAccelG.radialX} g</span>
            </div>
          </div>

          {/* Radial Vertical Y */}
          <div className="rounded-lg border border-border/80 bg-muted/20 p-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Radial Y (Vert)</span>
              <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400">Canal 2</span>
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="font-mono text-2xl font-bold tracking-tight text-foreground">
                {ry.toFixed(2)}
              </span>
              <span className="text-xs text-muted-foreground">mm/s</span>
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground">
              Acel: <span className="font-mono font-medium text-foreground">{scenario.triaxialAccelG.radialY} g</span>
            </div>
          </div>

          {/* Axial Z */}
          <div className="rounded-lg border border-border/80 bg-muted/20 p-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Axial Z</span>
              <span className="font-mono text-[10px] text-blue-600 dark:text-blue-400">Canal 3</span>
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="font-mono text-2xl font-bold tracking-tight text-foreground">
                {az.toFixed(2)}
              </span>
              <span className="text-xs text-muted-foreground">mm/s</span>
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground">
              Acel: <span className="font-mono font-medium text-foreground">{scenario.triaxialAccelG.axialZ} g</span>
            </div>
          </div>

          {/* Temperatura Mancal (DS18B20 1-Wire) */}
          <div className="rounded-lg border border-border/80 bg-muted/20 p-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Temp. Mancal</span>
              <Thermometer className={`h-3.5 w-3.5 ${
                temp.bearingContactC >= temp.criticalThresholdC 
                  ? 'text-rose-500' 
                  : temp.bearingContactC >= temp.warningThresholdC 
                    ? 'text-amber-500' 
                    : 'text-emerald-500'
              }`} />
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className={`font-mono text-2xl font-bold tracking-tight ${
                temp.bearingContactC >= temp.criticalThresholdC
                  ? 'text-rose-500'
                  : temp.bearingContactC >= temp.warningThresholdC
                    ? 'text-amber-500'
                    : 'text-foreground'
              }`}>
                {temp.bearingContactC.toFixed(1)}
              </span>
              <span className="text-xs text-muted-foreground">°C</span>
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground">
              ΔT: <span className="font-mono font-medium text-foreground">+{temp.deltaTC.toFixed(1)}°C</span>
            </div>
          </div>

        </div>

        {/* Indicadores Avançados de Impacto (Kurtosis, Crest Factor, Pk-Pk) */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md bg-muted/40 px-3.5 py-2 text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Info className="h-3.5 w-3.5 text-primary" />
            <span>Métricas de Choque & Impulso:</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 font-mono text-[11px]">
            <div>
              <span className="text-muted-foreground">Curtose (Kurtosis): </span>
              <span className={`font-bold ${scenario.triaxialAccelG.kurtosis > 4.0 ? 'text-rose-500 font-extrabold' : 'text-foreground'}`}>
                {scenario.triaxialAccelG.kurtosis.toFixed(2)}
              </span>
              <span className="text-muted-foreground text-[10px]"> (Normal ~3.0)</span>
            </div>

            <div>
              <span className="text-muted-foreground">Fator de Crista: </span>
              <span className="font-bold text-foreground">{scenario.triaxialAccelG.crestFactor.toFixed(1)}</span>
            </div>

            <div>
              <span className="text-muted-foreground">Aceleração Pk-Pk: </span>
              <span className="font-bold text-foreground">{scenario.triaxialAccelG.peakToPeak.toFixed(2)} g</span>
            </div>
          </div>
        </div>

      </CardContent>
    </Card>
  )
}
