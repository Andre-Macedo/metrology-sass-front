'use client'

import React, { useEffect, useState } from 'react'
import { Line, LineChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { useEcho } from '@/lib/providers/echo-provider'
import { Badge } from '@/components/ui/badge'
import { Activity } from 'lucide-react'

interface TelemetryData {
  rms_global: number
  piezo: {
    rms: number
  }
  timestamp: string
  ml_status: string
  ml_confidence: number
}

const chartConfig = {
  rms_global: {
    label: 'RMS Global (Vibração)',
    color: 'hsl(var(--primary))',
  },
  piezo_rms: {
    label: 'Piezo RMS (Ruído)',
    color: 'hsl(var(--destructive))',
  },
}

export function RealTimeTelemetry({ tenantId }: { tenantId: string }) {
  const { echo } = useEcho()
  const [dataPoints, setDataPoints] = useState<any[]>([])
  const [lastData, setLastData] = useState<TelemetryData | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!echo || !tenantId) return

    console.log(`Connecting to IoT channel: tenant.${tenantId}.iot`)
    const channel = echo.channel(`tenant.${tenantId}.iot`)
    
    setIsConnected(true)

    channel.listen('.sensor.data', (data: TelemetryData) => {
      console.log('Live Telemetry:', data)
      setLastData(data)
      setDataPoints((prev) => {
        const newPoint = {
          ...data,
          piezo_rms: data.piezo?.rms || 0
        }
        const newPoints = [...prev, newPoint]
        // Keep last 30 points
        return newPoints.slice(-30)
      })
    })

    return () => {
      channel.stopListening('.sensor.data')
      setIsConnected(false)
    }
  }, [echo, tenantId])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className={`h-5 w-5 ${isConnected ? 'text-green-500 animate-pulse' : 'text-muted-foreground'}`} />
          <h2 className="text-lg font-semibold tracking-tight">Telemetria em Tempo Real</h2>
        </div>
        <Badge variant={isConnected ? "success" : "secondary"}>
          {isConnected ? "Conectado" : "Desconectado"}
        </Badge>
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
            <p className="text-xs text-muted-foreground">mm/s (Vibração)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Piezo RMS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {typeof lastData?.piezo?.rms === 'number' ? lastData.piezo.rms.toFixed(4) : "0.0000"}
            </div>
            <p className="text-xs text-muted-foreground">V (Ruído)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status IA</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={lastData?.ml_status === 'normal' ? "success" : "destructive"} className="uppercase">
              {lastData?.ml_status || "Aguardando"}
            </Badge>
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
        <CardHeader>
          <CardTitle>Monitoramento de Ativos</CardTitle>
          <CardDescription>
            Visualização em tempo real das assinaturas de vibração e ruído.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-2">
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <LineChart
              data={dataPoints}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} />
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
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Line
                dataKey="rms_global"
                type="linear"
                stroke="#2563eb"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 5 }}
                isAnimationActive={false}
              />
              <Line
                dataKey="piezo_rms"
                type="linear"
                stroke="#e11d48"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 5 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
