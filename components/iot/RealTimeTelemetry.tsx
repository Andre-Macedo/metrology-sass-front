'use client'

import React, { useEffect, useState } from 'react'
import { Line, LineChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { useEcho } from '@/lib/providers/echo-provider'
import { Badge } from '@/components/ui/badge'
import { Activity } from 'lucide-react'
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
  mic_rms: number
  timestamp: string
  ml_status: string
  ml_confidence: number
  cloud_ml_status?: string
  cloud_ml_confidence?: number
}

const chartConfig = {
  rms_global: {
    label: 'RMS Global (g)',
    color: '#2563eb',
    min: 0,
    max: 10
  },
  rms_x: {
    label: 'Eixo X (g)',
    color: '#ef4444',
    min: 0,
    max: 10
  },
  rms_y: {
    label: 'Eixo Y (g)',
    color: '#22c55e',
    min: 0,
    max: 10
  },
  rms_z: {
    label: 'Eixo Z (g)',
    color: '#eab308',
    min: 0,
    max: 10
  },
  mic_db: {
    label: 'Microfone (dB)',
    color: '#ec4899',
    min: 0,
    max: 120
  },
}

export function RealTimeTelemetry({ tenantId }: { tenantId: string }) {
  const { echo } = useEcho()
  const [dataPoints, setDataPoints] = useState<any[]>([])
  const [lastData, setLastData] = useState<TelemetryData | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [selectedMetric, setSelectedMetric] = useState<keyof typeof chartConfig>('rms_global')

  // Função para converter RMS para dB
  const toDecibels = (rms: number) => {
    const r = Number(rms) || 0;
    if (r <= 0) return -100;
    return 20 * Math.log10(r / 0.00002);
  }

  useEffect(() => {
    if (!echo) return

    // Tenta detectar o slug do tenant se não foi passado ou for inconsistente
    let effectiveSlug = tenantId;
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

    console.log(`IoT: Connecting to channel [tenant.${effectiveSlug}.iot]`)
    
    // Log connection state
    echo.connector.pusher.connection.bind('state_change', (states: any) => {
      console.log('IoT: Connection State:', states.current)
      setIsConnected(states.current === 'connected')
    })

    const channel = echo.channel(`tenant.${effectiveSlug}.iot`)
    
    channel.listen('.sensor.data', (data: any) => {
      console.log('IoT: Live Telemetry received:', data)
      
      // Achata os dados para o gráfico e garante que são números
      const processedPoint = {
        ...data,
        rms_global: Number(data.rms_global) || 0,
        rms_x: Number(data.time_domain?.rms_x || data.rms_x || (data.features && data.features.x_rms)) || 0,
        rms_y: Number(data.time_domain?.rms_y || data.rms_y || (data.features && data.features.y_rms)) || 0,
        rms_z: Number(data.time_domain?.rms_z || data.rms_z || (data.features && data.features.z_rms)) || 0,
        mic_db: toDecibels(data.mic_rms || (data.features && data.features.mic_rms) || 0)
      }

      setLastData(processedPoint)
      setDataPoints((prev) => {
        const newPoints = [...prev, processedPoint]
        // Aumentado para 100 pontos para maior resolução X
        return newPoints.slice(-100)
      })
    })

    return () => {
      channel.stopListening('.sensor.data')
      // Não desconectamos o echo global aqui pois outros componentes podem usar
    }
  }, [echo, tenantId])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className={`h-5 w-5 ${isConnected ? 'text-green-500 animate-pulse' : 'text-muted-foreground'}`} />
          <h2 className="text-lg font-semibold tracking-tight">Telemetria em Tempo Real</h2>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedMetric} onValueChange={(v: any) => setSelectedMetric(v)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Selecione o indicador" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rms_global">RMS Global</SelectItem>
              <SelectItem value="rms_x">Eixo X</SelectItem>
              <SelectItem value="rms_y">Eixo Y</SelectItem>
              <SelectItem value="rms_z">Eixo Z</SelectItem>
              <SelectItem value="mic_db">Microfone (dB)</SelectItem>
            </SelectContent>
          </Select>
          <Badge variant={isConnected ? "default" : "secondary"}>
            {isConnected ? "Conectado" : "Desconectado"}
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">RMS Global</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {typeof lastData?.rms_global === 'number' ? lastData.rms_global.toFixed(4) : "0.0000"}
            </div>
            <p className="text-xs text-muted-foreground">g (Aceleração)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nível Acústico</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-pink-500">
              {typeof lastData?.mic_db === 'number' ? lastData.mic_db.toFixed(1) : "0.0"}
            </div>
            <p className="text-xs text-muted-foreground">dB (Microfone)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status IA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-1">
              <Badge variant={lastData?.ml_status === 'normal' || lastData?.ml_status === 'saudavel' ? "default" : "destructive"} className="uppercase w-fit">
                {lastData?.ml_status || "Aguardando"}
              </Badge>
              {lastData?.cloud_ml_status && (
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-[10px] text-muted-foreground font-bold uppercase">Cloud:</span>
                  <Badge variant="outline" className="text-[10px] py-0 h-4 border-primary text-primary">
                    {lastData.cloud_ml_status}
                  </Badge>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Confiança: {typeof lastData?.ml_confidence === 'number' ? (lastData.ml_confidence * 100).toFixed(1) : "0.0"}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Última Leitura</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-mono">
              {lastData?.timestamp ? new Date(lastData.timestamp).toLocaleTimeString() : "--:--:--"}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="col-span-4">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Análise de Tendência (Tempo Real)</CardTitle>
            <CardDescription>
              Resolução: 100 pontos | Indicador: {chartConfig[selectedMetric].label}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-2">
          <ChartContainer config={chartConfig} className="h-[350px] w-full">
            <LineChart
              data={dataPoints}
              margin={{ left: 12, right: 12 }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
              <XAxis
                dataKey="timestamp"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value ? new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : ''}
              />
              <YAxis 
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                domain={selectedMetric === 'mic_db' ? [0, 120] : [0, 'auto']}
                allowDataOverflow={false}
              />
              <ChartTooltip
                cursor={true}
                content={<ChartTooltipContent />}
              />
              <Line
                dataKey={selectedMetric}
                name={selectedMetric}
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
