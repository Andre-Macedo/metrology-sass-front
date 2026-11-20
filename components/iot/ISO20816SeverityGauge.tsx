'use client'

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react'

interface ISOThresholds {
  zone_a_max: number
  zone_b_max: number
  zone_c_max: number
}

interface ISO20816SeverityGaugeProps {
  velocityRms?: number | null
  zone?: string | null
  isoApplicable?: boolean | null
  machineGroup?: string | null
  foundationType?: string | null
  thresholds?: ISOThresholds | null
  standardLabel?: string | null
  showDetails?: boolean
  compact?: boolean
}

const ISO_PRESETS: Record<string, Record<string, ISOThresholds>> = {
  small_machine: {
    rigid: { zone_a_max: 0.71, zone_b_max: 1.8, zone_c_max: 4.5 },
    flexible: { zone_a_max: 1.12, zone_b_max: 2.8, zone_c_max: 7.1 },
  },
  group_2: {
    rigid: { zone_a_max: 1.4, zone_b_max: 2.8, zone_c_max: 4.5 },
    flexible: { zone_a_max: 2.3, zone_b_max: 4.5, zone_c_max: 7.1 },
  },
  group_1: {
    rigid: { zone_a_max: 2.3, zone_b_max: 4.5, zone_c_max: 7.1 },
    flexible: { zone_a_max: 3.5, zone_b_max: 7.1, zone_c_max: 11.0 },
  },
}

export function ISO20816SeverityGauge({
  velocityRms,
  zone,
  isoApplicable,
  machineGroup = 'group_2',
  foundationType = 'rigid',
  thresholds,
  standardLabel,
  showDetails = true,
  compact = false,
}: ISO20816SeverityGaugeProps) {
  const val = typeof velocityRms === 'number' ? velocityRms : null
  const isIsoApplicable = isoApplicable !== false && machineGroup !== 'baseline_only'

  const resolvedGroup = machineGroup && ISO_PRESETS[machineGroup] ? machineGroup : 'group_2'
  const resolvedFoundation = foundationType === 'flexible' ? 'flexible' : 'rigid'
  const activeThresholds = thresholds ?? ISO_PRESETS[resolvedGroup][resolvedFoundation]

  const limitA = activeThresholds.zone_a_max
  const limitB = activeThresholds.zone_b_max
  const limitC = activeThresholds.zone_c_max
  const maxScale = Math.max(6.0, Number((limitC * 1.35).toFixed(1)))

  if (!isIsoApplicable) {
    if (compact) {
      return (
        <Badge
          variant="outline"
          className="font-mono text-[11px] font-semibold border-border text-foreground bg-muted/30 flex items-center gap-1 w-fit"
        >
          <span>{val !== null ? `${val.toFixed(2)} mm/s` : '—'}</span>
        </Badge>
      )
    }

    return (
      <Card className="p-4 border border-border bg-muted/20 flex items-center justify-between gap-3">
        <div className="space-y-0.5">
          <span className="text-xs font-bold uppercase tracking-wider text-foreground block">
            Velocidade RMS Global (Sem Zonas ISO 20816-3)
          </span>
          <p className="text-[11px] text-muted-foreground">
            {standardLabel || 'Ativo abaixo de 15 kW: avaliado por velocidade (mm/s), linha de base e IA.'}
          </p>
        </div>
        <div className="text-right shrink-0">
          <span className="text-[10px] uppercase font-bold text-muted-foreground block">Velocidade RMS</span>
          <span className="text-base font-mono font-bold text-foreground">
            {val !== null ? `${val.toFixed(2)} mm/s` : 'N/A'}
          </span>
        </div>
      </Card>
    )
  }

  // Se a zona não veio explícita, calcula
  let currentZone = zone?.toUpperCase() || null
  if (!currentZone && val !== null) {
    if (val <= limitA) currentZone = 'A'
    else if (val <= limitB) currentZone = 'B'
    else if (val <= limitC) currentZone = 'C'
    else currentZone = 'D'
  }

  const headerTitle =
    standardLabel ||
    (resolvedGroup === 'small_machine'
      ? `Severidade ISO 10816-1 Classe I (< 15 kW - ${resolvedFoundation === 'flexible' ? 'Base Flexível' : 'Base Rígida'})`
      : `Severidade ISO 20816-3 (${resolvedGroup === 'group_1' ? 'Grupo 1' : 'Grupo 2'} - ${resolvedFoundation === 'flexible' ? 'Base Flexível' : 'Base Rígida'})`)

  // Posição percentual na régua (0 a 100%)
  const percentage = val !== null 
    ? Math.min(Math.max((val / maxScale) * 100, 2), 98) 
    : null

  const getZoneMeta = (z: string | null) => {
    switch (z) {
      case 'A':
        return {
          label: 'Zona A - Excelente',
          short: 'Zona A',
          desc: 'Vibração típica de máquina nova ou recém-revisada (ISO 20816-3).',
          color: 'bg-emerald-500',
          textColor: 'text-emerald-600 dark:text-emerald-400',
          borderColor: 'border-emerald-500/40',
          bgColor: 'bg-emerald-500/10',
          icon: CheckCircle,
        }
      case 'B':
        return {
          label: 'Zona B - Aceitável',
          short: 'Zona B',
          desc: 'Operação irrestrita de longo prazo. Nível estável de engenharia.',
          color: 'bg-blue-500',
          textColor: 'text-blue-600 dark:text-blue-400',
          borderColor: 'border-blue-500/40',
          bgColor: 'bg-blue-500/10',
          icon: CheckCircle,
        }
      case 'C':
        return {
          label: 'Zona C - Alerta de Manutenção',
          short: 'Zona C',
          desc: 'Operação restrita. Planejar parada para revisão mecânica preventiva.',
          color: 'bg-amber-500',
          textColor: 'text-amber-600 dark:text-amber-400',
          borderColor: 'border-amber-500/40',
          bgColor: 'bg-amber-500/10',
          icon: AlertTriangle,
        }
      case 'D':
        return {
          label: 'Zona D - Perigo / Parada Imediata',
          short: 'Zona D',
          desc: 'Vibração crítica inaceitável. Risco de fadiga estrutural ou quebra iminente.',
          color: 'bg-rose-500',
          textColor: 'text-rose-600 dark:text-rose-400',
          borderColor: 'border-rose-500/40',
          bgColor: 'bg-rose-500/10',
          icon: ShieldAlert,
        }
      default:
        return {
          label: 'Não Avaliado',
          short: 'N/A',
          desc: 'Aguardando telemetria de velocidade para classificação da norma.',
          color: 'bg-muted',
          textColor: 'text-muted-foreground',
          borderColor: 'border-border',
          bgColor: 'bg-muted/30',
          icon: CheckCircle,
        }
    }
  }

  const meta = getZoneMeta(currentZone)
  const Icon = meta.icon

  if (compact) {
    return (
      <Badge 
        variant="outline" 
        className={`font-mono text-[11px] font-bold ${meta.borderColor} ${meta.textColor} ${meta.bgColor} flex items-center gap-1 w-fit`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${meta.color}`} />
        <span>{meta.short}</span>
        {val !== null && <span className="opacity-80">({val.toFixed(2)} mm/s)</span>}
      </Badge>
    )
  }

  return (
    <Card className={`p-4 border ${meta.borderColor} ${meta.bgColor} transition-colors space-y-3`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${meta.textColor}`} />
          <span className="text-xs font-bold uppercase tracking-wider text-foreground">
            {headerTitle}
          </span>
        </div>
        <Badge variant="outline" className={`font-mono font-bold ${meta.borderColor} ${meta.textColor} bg-background`}>
          {meta.label}
        </Badge>
      </div>

      {/* Régua Técnica com as 4 Zonas */}
      <div className="space-y-1.5 pt-1">
        <div className="relative flex h-2.5 w-full overflow-visible rounded-xs border border-border bg-muted">
          {/* Zona A */}
          <div style={{ width: `${(limitA / maxScale) * 100}%` }} className="h-full border-r border-background/80 bg-emerald-500/90" title={`Zona A: 0 a ${limitA} mm/s`} />
          {/* Zona B */}
          <div style={{ width: `${((limitB - limitA) / maxScale) * 100}%` }} className="h-full border-r border-background/80 bg-sky-500/90" title={`Zona B: ${limitA} a ${limitB} mm/s`} />
          {/* Zona C */}
          <div style={{ width: `${((limitC - limitB) / maxScale) * 100}%` }} className="h-full border-r border-background/80 bg-amber-500/90" title={`Zona C: ${limitB} a ${limitC} mm/s`} />
          {/* Zona D */}
          <div style={{ width: `${((maxScale - limitC) / maxScale) * 100}%` }} className="h-full bg-rose-500/90" title={`Zona D: > ${limitC} mm/s`} />

          {/* Agulha Indicadora */}
          {percentage !== null && (
            <div 
              style={{ left: `${percentage}%` }}
              className="absolute -top-1 -bottom-1 w-0.5 -ml-px bg-foreground ring-2 ring-background"
              title={`Valor Atual: ${val?.toFixed(2)} mm/s`}
            />
          )}
        </div>

        {/* Legendas de Limites na Régua */}
        <div className="flex justify-between text-[10px] font-mono text-muted-foreground px-0.5">
          <span>0</span>
          <span>{limitA} (A)</span>
          <span>{limitB} (B)</span>
          <span>{limitC} (C)</span>
          <span>{maxScale}+ (D)</span>
        </div>
      </div>

      {/* Detalhes de Engenharia */}
      {showDetails && (
        <div className="flex items-center justify-between text-xs pt-1 border-t border-border/40">
          <p className="text-[11px] text-muted-foreground">
            {meta.desc}
          </p>
          <div className="text-right shrink-0 ml-3">
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">Velocidade RMS</span>
            <span className={`text-base font-mono font-bold ${meta.textColor}`}>
              {val !== null ? `${val.toFixed(2)} mm/s` : 'N/A'}
            </span>
          </div>
        </div>
      )}
    </Card>
  )
}
