'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScenarioData } from '@/features/iot/data/tractian-mock-data'
import { 
  AlertOctagon, 
  AlertTriangle, 
  ArrowRight, 
  BrainCircuit, 
  CheckCircle2, 
  Clock, 
  Cpu, 
  FileCheck, 
  HelpCircle, 
  ListChecks, 
  ShieldAlert, 
  Wrench 
} from 'lucide-react'

interface PredictiveInsightsEngineProps {
  scenario: ScenarioData
  onOpenWorkOrderModal: () => void
}

export function PredictiveInsightsEngine({
  scenario,
  onOpenWorkOrderModal,
}: PredictiveInsightsEngineProps) {
  const insight = scenario.insights
  const isHealthy = insight.classification === 'healthy'
  const isDanger = insight.classification === 'danger'
  const isWarning = insight.classification === 'warning'

  const getUrgencyBadge = (urgency: string) => {
    if (urgency.includes('Imediata')) {
      return { variant: 'destructive', color: 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/30' }
    }
    if (urgency.includes('7 dias')) {
      return { variant: 'outline', color: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/30' }
    }
    if (urgency.includes('14 dias') || urgency.includes('30 dias')) {
      return { variant: 'secondary', color: 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/30' }
    }
    return { variant: 'outline', color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30' }
  }

  const urgencyMeta = getUrgencyBadge(insight.urgency)

  return (
    <Card className={`border-2 shadow-sm transition-all ${
      isDanger 
        ? 'border-rose-500/60 bg-gradient-to-br from-card via-card to-rose-500/5' 
        : isWarning 
          ? 'border-amber-500/60 bg-gradient-to-br from-card via-card to-amber-500/5' 
          : 'border-emerald-500/40 bg-gradient-to-br from-card via-card to-emerald-500/5'
    }`}>
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <BrainCircuit className={`h-5 w-5 ${
                isDanger ? 'text-rose-500' : isWarning ? 'text-amber-500' : 'text-emerald-500'
              }`} />
              <CardTitle className="text-base font-bold">
                Motor de Diagnóstico Prescritivo IA (Tractian Engine)
              </CardTitle>
            </div>
            <CardDescription className="text-xs">
              Inferência automática com árvore de decisão XGBoost especializada e detecção de anomalias por bandas de energia
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="font-mono text-[10px] text-muted-foreground gap-1">
              <Cpu className="h-3 w-3 text-primary" />
              <span>{insight.mlModel}</span>
            </Badge>

            <Badge variant="default" className="bg-primary/90 text-[11px] font-mono">
              Confiança: {insight.confidencePercent.toFixed(1)}%
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        
        {/* Bloco Central de Causa-Raiz */}
        <div className="rounded-lg border border-border/80 bg-background/80 p-4 space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Diagnóstico Identificado:
              </span>
              <h3 className="text-lg font-extrabold text-foreground tracking-tight">
                {insight.rootCause}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className={`font-semibold text-xs px-2.5 py-1 ${urgencyMeta.color}`}>
                <Clock className="h-3.5 w-3.5 mr-1" />
                <span>Intervenção: {insight.urgency}</span>
              </Badge>
            </div>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">
            {insight.summary}
          </p>
        </div>

        {/* Recomendações e Prescrições Técnicas de Manutenção */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
            <ListChecks className="h-4 w-4 text-primary" />
            <span>Prescrições Técnicas Recomendadas para a Equipe de Campo:</span>
          </div>

          <div className="space-y-1.5">
            {insight.prescriptions.map((action, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 rounded-md border border-border/70 bg-muted/20 px-3.5 py-2 text-xs text-foreground"
              >
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary text-[11px]">
                  {idx + 1}
                </div>
                <span className="leading-snug">{action}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Rodapé: Ação Direta para Gerar Ordem de Serviço */}
        <div className="flex flex-col gap-3 rounded-lg border border-border/80 bg-muted/30 p-3.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Ordem de Serviço Sugerida pelo Sistema:
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-foreground text-sm">
                {insight.suggestedWorkOrder.title}
              </span>
              <Badge variant="secondary" className="text-[10px]">
                {insight.suggestedWorkOrder.category}
              </Badge>
              <Badge variant="outline" className="text-[10px] font-mono">
                ~{insight.suggestedWorkOrder.estimatedHours}h estimadas
              </Badge>
            </div>
          </div>

          <Button
            size="sm"
            variant={isHealthy ? 'outline' : 'default'}
            className="gap-2 font-semibold shadow-xs shrink-0"
            onClick={onOpenWorkOrderModal}
          >
            <Wrench className="h-3.5 w-3.5" />
            <span>{isHealthy ? 'Agendar Preventiva' : 'Emitir Ordem de Serviço Imediata'}</span>
            <ArrowRight className="h-3 w-3" />
          </Button>
        </div>

      </CardContent>
    </Card>
  )
}
