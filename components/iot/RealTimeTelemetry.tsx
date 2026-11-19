'use client'

import React, { useEffect, useState } from 'react'
import { Line, LineChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { useEcho } from '@/lib/providers/echo-provider'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Activity, 
  BrainCircuit, 
  Flame, 
  Gauge, 
  Pause, 
  Play, 
  RotateCcw, 
  Sliders, 
  Sparkles, 
  Thermometer, 
  Wifi, 
  WifiOff 
} from 'lucide-react'
import { ISO20816SeverityGauge } from '@/components/iot/ISO20816SeverityGauge'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'

interface TelemetryData {
  rms_global: number
  rms_x: number
  rms_y: number
  rms_z: number
  temperature?: number
  timestamp: string
  ml_status: string
  ml_confidence: number
  cloud_ml_status?: string
  cloud_ml_confidence?: number
  velocity_rms?: number
  iso_zone?: string
  iso_applicable?: boolean
  iso_group?: string
  iso_evaluation?: {
    iso_applicable?: boolean
    machine_group?: string
    foundation?: string
    thresholds?: {
      zone_a_max: number
      zone_b_max: number
      zone_c_max: number
    }
    standard?: string
  } | null
}

const chartConfig = {
  rms_global: {
    label: 'RMS Global (g)',
    color: '#2563eb',
  },
  rms_x: {
    label: 'Eixo Radial X (g)',
    color: '#06b6d4',
  },
  rms_y: {
    label: 'Eixo Radial Y (g)',
    color: '#10b981',
  },
  rms_z: {
    label: 'Eixo Axial Z (g)',
    color: '#f59e0b',
  },
  velocity_rms: {
    label: 'Velocidade RMS (mm/s)',
    color: '#8b5cf6',
  },
  temperature: {
    label: 'Temperatura Mancal (°C)',
    color: '#ef4444',
  },
}

export function RealTimeTelemetry({ tenantId }: { tenantId: string }) {
  const { echo } = useEcho()
  const [dataPoints, setDataPoints] = useState<any[]>([])
  const [lastData, setLastData] = useState<TelemetryData | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [bufferSize, setBufferSize] = useState<number>(100)
  const [selectedMetric, setSelectedMetric] = useState<keyof typeof chartConfig>('rms_global')

  useEffect(() => {
    if (!echo) return

    let effectiveSlug = tenantId
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname
      if (hostname.includes('leantech.andremacedo.dev.br') && hostname !== 'leantech.andremacedo.dev.br') {
        effectiveSlug = hostname.split('.')[0]
      }
    }

    if (!effectiveSlug) {
      console.warn('IoT: No tenant ID found for real-time connection.')
      return
    }

    // Monitora status da conexão WebSocket Reverb
    if (echo.connector?.pusher?.connection) {
      setIsConnected(echo.connector.pusher.connection.state === 'connected')
      echo.connector.pusher.connection.bind('state_change', (states: any) => {
        setIsConnected(states.current === 'connected')
      })
    }

    const channel = echo.channel(`tenant.${effectiveSlug}.iot`)
    
    channel.listen('.sensor.data', (data: any) => {
      if (isPaused) return

      const processedPoint: TelemetryData = {
        rms_global: Number(data.rms_global || (data.features && data.features.rms_global)) || 0,
        rms_x: Number(data.time_domain?.rms_x || data.rms_x || (data.features && data.features.x_rms)) || 0,
        rms_y: Number(data.time_domain?.rms_y || data.rms_y || (data.features && data.features.y_rms)) || 0,
        rms_z: Number(data.time_domain?.rms_z || data.rms_z || (data.features && data.features.z_rms)) || 0,
        temperature: data.temperature !== undefined ? Number(data.temperature) : (data.features && data.features.temp_contact ? Number(data.features.temp_contact) : undefined),
        velocity_rms: data.velocity_rms !== undefined && data.velocity_rms !== null ? Number(data.velocity_rms) : undefined,
        iso_zone: data.iso_zone,
        iso_applicable: data.iso_applicable ?? data.iso_evaluation?.iso_applicable,
        iso_group: data.iso_group ?? data.iso_evaluation?.machine_group,
        iso_evaluation: data.iso_evaluation ?? null,
        ml_status: data.ml_status || 'saudavel',
        ml_confidence: Number(data.ml_confidence || 0.95),
        cloud_ml_status: data.cloud_ml_status,
        cloud_ml_confidence: data.cloud_ml_confidence,
        timestamp: data.timestamp || new Date().toISOString(),
      }

      setLastData(processedPoint)
      setDataPoints((prev) => {
        const next = [...prev, processedPoint]
        return next.slice(-bufferSize)
      })
    })

    return () => {
      channel.stopListening('.sensor.data')
    }
  }, [echo, tenantId, isPaused, bufferSize])

  const clearBuffer = () => {
    setDataPoints([])
  }

  return (
    <div className="space-y-5">
      {/* Barra de Status e Controles da Transmissão */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-lg border border-border/70 bg-card p-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${
            isConnected ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground'
          }`}>
            <Activity className={`h-5 w-5 ${isConnected ? 'animate-pulse' : ''}`} />
          </div>
          <div>
            <h2 className="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
              <span>Transmissão de Telemetria Contínua</span>
              <Badge variant={isConnected ? "default" : "secondary"} className={`text-[10px] font-mono gap-1 ${
                isConnected ? 'bg-emerald-600 hover:bg-emerald-600' : ''
              }`}>
                {isConnected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                <span>{isConnected ? "Reverb Conectado" : "Aguardando Broker"}</span>
              </Badge>
            </h2>
            <p className="text-xs text-muted-foreground">
              Canal WebSocket: <code className="font-mono text-[11px] text-primary">tenant.{tenantId || 'local'}.iot</code>
            </p>
          </div>
        </div>

        {/* Controles de Reprodução e Filtros */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsPaused(!isPaused)}
            className="h-8 gap-1.5 text-xs font-semibold"
          >
            {isPaused ? <Play className="h-3.5 w-3.5 text-emerald-500" /> : <Pause className="h-3.5 w-3.5 text-amber-500" />}
            <span>{isPaused ? "Retomar" : "Pausar"}</span>
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={clearBuffer}
            className="h-8 gap-1 text-xs text-muted-foreground hover:text-foreground"
            title="Limpar buffer de leituras"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Limpar</span>
          </Button>

          <Select value={bufferSize.toString()} onValueChange={(v) => setBufferSize(Number(v))}>
            <SelectTrigger className="h-8 w-[110px] text-xs">
              <SelectValue placeholder="Buffer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="50">50 pts</SelectItem>
              <SelectItem value="100">100 pts</SelectItem>
              <SelectItem value="200">200 pts</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedMetric} onValueChange={(v: any) => setSelectedMetric(v)}>
            <SelectTrigger className="h-8 w-[180px] text-xs font-semibold">
              <SelectValue placeholder="Métrica" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rms_global">RMS Global (g)</SelectItem>
              <SelectItem value="rms_x">Eixo Radial X (g)</SelectItem>
              <SelectItem value="rms_y">Eixo Radial Y (g)</SelectItem>
              <SelectItem value="rms_z">Eixo Axial Z (g)</SelectItem>
              <SelectItem value="velocity_rms">Velocidade RMS (mm/s)</SelectItem>
              <SelectItem value="temperature">Temperatura Mancal (°C)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Grid de KPIs Instantâneos da Bancada */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        
        {/* RMS Global */}
        <Card className="border-border/80 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Aceleração RMS Global
            </CardTitle>
            <Gauge className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black font-mono tabular-nums tracking-tight text-foreground">
              {typeof lastData?.rms_global === 'number' ? lastData.rms_global.toFixed(4) : "0.0000"}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">g (Aceleração pico)</p>
          </CardContent>
        </Card>

        {/* Velocidade RMS (sempre exibida em mm/s) */}
        <Card className="border-border/80 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Velocidade RMS
            </CardTitle>
            <Sparkles className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black font-mono tabular-nums tracking-tight text-purple-600 dark:text-purple-400">
              {typeof lastData?.velocity_rms === 'number' ? lastData.velocity_rms.toFixed(2) : "--"}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {lastData?.iso_applicable === false || lastData?.iso_group === 'baseline_only'
                ? 'mm/s (RMS global)'
                : 'mm/s (RMS · ISO)'}
            </p>
          </CardContent>
        </Card>

        {/* Temperatura do Mancal */}
        <Card className="border-border/80 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Temperatura Mancal
            </CardTitle>
            <Flame className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black font-mono tabular-nums tracking-tight text-amber-500">
              {typeof lastData?.temperature === 'number' ? `${lastData.temperature.toFixed(1)}°C` : "38.2°C"}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Sonda 1-Wire DS18B20</p>
          </CardContent>
        </Card>

        {/* Status IA & Predição */}
        <Card className="border-border/80 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Diagnóstico IA
            </CardTitle>
            <BrainCircuit className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-1">
              <Badge 
                variant={lastData?.ml_status === 'normal' || lastData?.ml_status === 'saudavel' ? "default" : "destructive"} 
                className="uppercase w-fit font-mono text-[10px] py-0.5"
              >
                {lastData?.ml_status || "Aguardando"}
              </Badge>
              {lastData?.cloud_ml_status && (
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-[10px] text-muted-foreground font-bold">Cloud:</span>
                  <Badge variant="outline" className="text-[10px] py-0 h-4 border-primary text-primary font-mono">
                    {lastData.cloud_ml_status}
                  </Badge>
                </div>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Confiança: <span className="font-mono font-semibold text-foreground">
                {typeof lastData?.ml_confidence === 'number' ? (lastData.ml_confidence * 100).toFixed(1) : "95.0"}%
              </span>
            </p>
          </CardContent>
        </Card>

      </div>

      {/* Régua de Severidade ISO (exibida somente para máquinas dentro do escopo normativo) */}
      {lastData?.iso_applicable !== false && lastData?.iso_group !== 'baseline_only' && (
        <ISO20816SeverityGauge
          velocityRms={lastData?.velocity_rms}
          zone={lastData?.iso_zone}
          isoApplicable={lastData?.iso_applicable}
          machineGroup={lastData?.iso_group}
          foundationType={lastData?.iso_evaluation?.foundation}
          thresholds={lastData?.iso_evaluation?.thresholds}
          standardLabel={lastData?.iso_evaluation?.standard}
        />
      )}

      {/* Gráfico Contínuo de Linha com Recharts */}
      <Card className="border-border/80 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-base font-bold">Osciloscópio Temporal de Telemetria</CardTitle>
            <CardDescription className="text-xs">
              Resolução: {bufferSize} leituras | Canal: {chartConfig[selectedMetric].label}
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono text-muted-foreground">
              {lastData?.timestamp ? new Date(lastData.timestamp).toLocaleTimeString() : "--:--:--"}
            </span>
          </div>
        </CardHeader>

        <CardContent className="px-2">
          <ChartContainer config={chartConfig} className="h-[360px] w-full">
            <LineChart
              data={dataPoints}
              margin={{ left: 12, right: 12, top: 10, bottom: 10 }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.2} />
              
              <XAxis
                dataKey="timestamp"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                className="text-[10px] font-mono fill-muted-foreground"
                tickFormatter={(value) => value ? new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : ''}
              />
              
              <YAxis 
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                className="text-[10px] font-mono fill-muted-foreground"
                allowDataOverflow={false}
              />

              <ChartTooltip
                cursor={true}
                content={<ChartTooltipContent />}
              />

              <Line
                dataKey={selectedMetric}
                name={chartConfig[selectedMetric].label}
                type="linear"
                stroke={chartConfig[selectedMetric].color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
                isAnimationActive={false}
                connectNulls={true}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
