'use client'

import React, { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { 
  ScenarioData, 
  generate30DaysTrend 
} from '@/features/iot/data/tractian-mock-data'
import { Clock, Flame, History, Info, Sparkles, Thermometer, TrendingUp } from 'lucide-react'

interface ThermalTrendCardProps {
  scenario: ScenarioData
}

export function ThermalTrendCard({ scenario }: ThermalTrendCardProps) {
  const [activeTab, setActiveTab] = useState<'thermal_vibe' | 'runtime'>('thermal_vibe')

  const trendData = useMemo(() => {
    return generate30DaysTrend(scenario.id)
  }, [scenario.id])

  const temp = scenario.temperature
  const currentTemp = temp.bearingContactC
  const isTempCritical = currentTemp >= temp.criticalThresholdC
  const isTempWarning = currentTemp >= temp.warningThresholdC

  // Cálculos de horímetro dos últimos 30 dias
  const totalRunHours = useMemo(() => {
    return trendData.reduce((acc, curr) => acc + curr.runningHours, 0)
  }, [trendData])

  const availabilityPct = Number(((totalRunHours / (30 * 24)) * 100).toFixed(1))

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Thermometer className="h-5 w-5 text-amber-500" />
              <CardTitle className="text-base font-bold">
                Tendência Térmica & Horímetro (30 Dias)
              </CardTitle>
            </div>
            <CardDescription className="text-xs">
              Histórico diário de temperatura de carcaça (°C), velocidade RMS (mm/s) e disponibilidade operacional
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-md border border-border bg-muted/40 p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('thermal_vibe')}
                className={`rounded px-2.5 py-1 font-medium transition-colors ${
                  activeTab === 'thermal_vibe'
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Térmico & Vibração
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('runtime')}
                className={`rounded px-2.5 py-1 font-medium transition-colors ${
                  activeTab === 'runtime'
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Horímetro & Turno
              </button>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        
        {/* KPI Strip */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          
          {/* Temperatura Atual Mancal */}
          <div className="rounded-lg border border-border/80 bg-muted/20 p-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Temp. Mancal</span>
              <Flame className={`h-3.5 w-3.5 ${isTempCritical ? 'text-rose-500 animate-bounce' : isTempWarning ? 'text-amber-500' : 'text-emerald-500'}`} />
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className={`font-mono text-2xl font-bold tracking-tight ${
                isTempCritical ? 'text-rose-500' : isTempWarning ? 'text-amber-500' : 'text-foreground'
              }`}>
                {currentTemp.toFixed(1)}
              </span>
              <span className="text-xs text-muted-foreground">°C</span>
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground">
              Alarme: <span className="font-semibold text-foreground">70°C / 85°C</span>
            </div>
          </div>

          {/* Delta T sobre Ambiente */}
          <div className="rounded-lg border border-border/80 bg-muted/20 p-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Delta Térmico (ΔT)</span>
              <TrendingUp className="h-3.5 w-3.5 text-blue-500" />
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="font-mono text-2xl font-bold tracking-tight text-foreground">
                +{temp.deltaTC.toFixed(1)}
              </span>
              <span className="text-xs text-muted-foreground">°C</span>
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground">
              Ambiente: <span className="font-semibold text-foreground">{temp.ambientC.toFixed(1)} °C</span>
            </div>
          </div>

          {/* Taxa de Variação Diária */}
          <div className="rounded-lg border border-border/80 bg-muted/20 p-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Gradiente Térmico</span>
              <History className="h-3.5 w-3.5 text-indigo-500" />
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className={`font-mono text-2xl font-bold tracking-tight ${
                temp.trendRatePerDayC > 2.0 ? 'text-rose-500' : 'text-foreground'
              }`}>
                {temp.trendRatePerDayC > 0 ? `+${temp.trendRatePerDayC.toFixed(1)}` : temp.trendRatePerDayC.toFixed(1)}
              </span>
              <span className="text-xs text-muted-foreground">°C / dia</span>
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground">
              Tendência: <span className="font-semibold text-foreground">{temp.trendRatePerDayC > 1.0 ? 'Ascendente' : 'Estável'}</span>
            </div>
          </div>

          {/* Horímetro / Disponibilidade */}
          <div className="rounded-lg border border-border/80 bg-muted/20 p-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Disponibilidade 30D</span>
              <Clock className="h-3.5 w-3.5 text-emerald-500" />
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="font-mono text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
                {availabilityPct}%
              </span>
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground">
              Rodadas: <span className="font-mono font-semibold text-foreground">{totalRunHours.toFixed(0)}h / 720h</span>
            </div>
          </div>

        </div>

        {/* Gráfico de Linha ou Barras */}
        {activeTab === 'thermal_vibe' ? (
          <div className="h-[280px] w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={trendData}
                margin={{ top: 15, right: 15, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  className="text-[11px] font-mono fill-muted-foreground"
                />

                {/* Eixo Y Esquerdo: Temperatura °C */}
                <YAxis
                  yAxisId="temp"
                  domain={[20, 100]}
                  tickLine={false}
                  axisLine={false}
                  className="text-[11px] font-mono fill-amber-500"
                  tickFormatter={(val) => `${val}°C`}
                />

                {/* Eixo Y Direito: Vibração mm/s */}
                <YAxis
                  yAxisId="vibe"
                  orientation="right"
                  domain={[0, 8]}
                  tickLine={false}
                  axisLine={false}
                  className="text-[11px] font-mono fill-cyan-500"
                  tickFormatter={(val) => `${val} mm/s`}
                />

                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload || !payload.length) return null
                    return (
                      <div className="rounded-lg border border-border bg-popover/95 p-3 shadow-xl backdrop-blur-xs text-xs space-y-1.5 font-mono">
                        <div className="font-bold text-foreground border-b border-border/60 pb-1">
                          Data: {label}
                        </div>
                        {payload.map((entry: any) => (
                          <div key={entry.name} className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-1.5">
                              <span
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: entry.color }}
                              />
                              <span className="text-muted-foreground">{entry.name}:</span>
                            </div>
                            <span className="font-bold text-foreground">
                              {entry.value} {entry.dataKey === 'bearingTempC' ? '°C' : 'mm/s'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )
                  }}
                />

                {/* Limites Térmicos SKF */}
                <ReferenceLine
                  yAxisId="temp"
                  y={temp.warningThresholdC}
                  stroke="#f59e0b"
                  strokeDasharray="4 4"
                  strokeWidth={1}
                  label={{ value: 'Alerta SKF (70°C)', position: 'insideTopLeft', fill: '#f59e0b', fontSize: 10 }}
                />

                <ReferenceLine
                  yAxisId="temp"
                  y={temp.criticalThresholdC}
                  stroke="#ef4444"
                  strokeDasharray="4 4"
                  strokeWidth={1}
                  label={{ value: 'Crítico SKF (85°C)', position: 'insideTopLeft', fill: '#ef4444', fontSize: 10, fontWeight: 700 }}
                />

                {/* Linhas de Dados */}
                <Line
                  yAxisId="temp"
                  type="monotone"
                  dataKey="bearingTempC"
                  name="Temperatura Mancal"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  dot={false}
                />

                <Line
                  yAxisId="vibe"
                  type="monotone"
                  dataKey="velocityRms"
                  name="Vibração RMS (mm/s)"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[280px] w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={trendData}
                margin={{ top: 15, right: 15, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  className="text-[11px] font-mono fill-muted-foreground"
                />

                <YAxis
                  domain={[0, 24]}
                  tickLine={false}
                  axisLine={false}
                  className="text-[11px] font-mono fill-muted-foreground"
                  tickFormatter={(val) => `${val}h`}
                />

                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload || !payload.length) return null
                    return (
                      <div className="rounded-lg border border-border bg-popover/95 p-3 shadow-xl backdrop-blur-xs text-xs space-y-1.5 font-mono">
                        <div className="font-bold text-foreground border-b border-border/60 pb-1">
                          Dia: {label}
                        </div>
                        {payload.map((entry: any) => (
                          <div key={entry.name} className="flex items-center justify-between gap-4">
                            <span className="text-muted-foreground">{entry.name}:</span>
                            <span className="font-bold text-foreground">{entry.value} horas</span>
                          </div>
                        ))}
                      </div>
                    )
                  }}
                />

                <Bar
                  dataKey="runningHours"
                  name="Horas em Operação"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                  stackId="hours"
                />

                <Bar
                  dataKey="stoppedHours"
                  name="Horas Paradas"
                  fill="#94a3b8"
                  radius={[4, 4, 0, 0]}
                  stackId="hours"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

      </CardContent>
    </Card>
  )
}
