'use client'

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { AlertTriangle, CheckCircle, ShieldAlert, Sparkles } from 'lucide-react'

interface ISO20816SeverityGaugeProps {
  velocityRms?: number | null
  zone?: string | null
  showDetails?: boolean
  compact?: boolean
}

export function ISO20816SeverityGauge({
  velocityRms,
  zone,
  showDetails = true,
  compact = false,
}: ISO20816SeverityGaugeProps) {
  // Limites da ISO 20816-3 (Grupo 2: Motores de 15 a 300 kW, Base Rígida)
  const limitA = 1.4
  const limitB = 2.8
  const limitC = 4.5
  const maxScale = 6.0

  const val = typeof velocityRms === 'number' ? velocityRms : null

  // Se a zona não veio explícita, calcula
  let currentZone = zone?.toUpperCase() || null
  if (!currentZone && val !== null) {
    if (val <= limitA) currentZone = 'A'
    else if (val <= limitB) currentZone = 'B'
    else if (val <= limitC) currentZone = 'C'
    else currentZone = 'D'
  }

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
          icon: Sparkles,
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
            Severidade ISO 20816-3 (Grupo 2 - Base Rígida)
          </span>
        </div>
        <Badge variant="outline" className={`font-mono font-bold ${meta.borderColor} ${meta.textColor} bg-background`}>
          {meta.label}
        </Badge>
      </div>

      {/* Régua de Gradiente com as 4 Zonas */}
      <div className="space-y-1.5 pt-1">
        <div className="relative w-full h-3 rounded-full overflow-hidden bg-muted flex border border-border/60">
          {/* Zona A: 0 a 1.4 (23.3%) */}
          <div style={{ width: '23.3%' }} className="bg-emerald-500 h-full opacity-90" title="Zona A: 0 a 1.4 mm/s" />
          {/* Zona B: 1.4 a 2.8 (23.3%) */}
          <div style={{ width: '23.3%' }} className="bg-blue-500 h-full opacity-90" title="Zona B: 1.4 a 2.8 mm/s" />
          {/* Zona C: 2.8 a 4.5 (28.3%) */}
          <div style={{ width: '28.3%' }} className="bg-amber-500 h-full opacity-90" title="Zona C: 2.8 a 4.5 mm/s" />
          {/* Zona D: > 4.5 (25.1%) */}
          <div style={{ width: '25.1%' }} className="bg-rose-500 h-full opacity-90" title="Zona D: > 4.5 mm/s" />

          {/* Marcador do Ponteiro Atual */}
          {percentage !== null && (
            <div 
              style={{ left: `${percentage}%` }}
              className="absolute top-0 bottom-0 w-1.5 -ml-0.5 bg-white border border-black shadow-lg rounded-full animate-pulse"
              title={`Valor Atual: ${val?.toFixed(2)} mm/s`}
            />
          )}
        </div>

        {/* Legendas de Limites na Régua */}
        <div className="flex justify-between text-[10px] font-mono text-muted-foreground px-0.5">
          <span>0</span>
          <span>1.4 (A)</span>
          <span>2.8 (B)</span>
          <span>4.5 (C)</span>
          <span>6.0+ (D)</span>
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
