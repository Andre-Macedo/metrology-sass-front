'use client'

import React, { useState, useEffect } from 'react'
import { Line, LineChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Legend } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { apiClient } from '@/lib/api/client'
import { Button } from '@/components/ui/button'
import { Filter, RefreshCcw, LayoutGrid, Download } from 'lucide-react'
import { toast } from 'sonner'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

const METRICS = [
  { id: 'rms_global', label: 'RMS Global (g)', color: '#2563eb' },
  { id: 'rms_x', label: 'Eixo X (g)', color: '#ef4444' },
  { id: 'rms_y', label: 'Eixo Y (g)', color: '#22c55e' },
  { id: 'rms_z', label: 'Eixo Z (g)', color: '#eab308' },
  { id: 'mic_db', label: 'Microfone (dB)', color: '#ec4899' },
  { id: 'ml_confidence', label: 'Confiança IA', color: '#8b5cf6' },
]

export function HistoricalTelemetry() {
  const [data, setData] = useState<any[]>([])
  const [nodes, setNodes] = useState<any[]>([])
  const [selectedNode, setSelectedNode] = useState<string>('all')
  const [selectedMetric, setSelectedMetric] = useState<string>('rms_global')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  // Função para exportar os dados atuais para CSV
  const exportToCSV = () => {
    if (data.length === 0) {
      toast.error('Não há dados para exportar')
      return
    }

    const headers = [
      'Data/Hora',
      'Status',
      'Confianca (%)',
      'RMS Global (g)',
      'RMS X (g)',
      'RMS Y (g)',
      'RMS Z (g)',
      'Microfone (dB)'
    ]

    const csvRows = data.map(item => [
      item.measured_at,
      item.ml_status,
      (Number(item.ml_confidence || 0) * 100).toFixed(2),
      Number(item.rms_global || 0).toFixed(4),
      Number(item.rms_x || 0).toFixed(4),
      Number(item.rms_y || 0).toFixed(4),
      Number(item.rms_z || 0).toFixed(4),
      Number(item.mic_db || 0).toFixed(2)
    ])

    const csvContent = [
      headers.join(','),
      ...csvRows.map(row => row.join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `telemetria_historica_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast.success('CSV exportado com sucesso!')
  }

  // Função para converter RMS para dB
  const toDecibels = (rms: number) => {
    const r = Number(rms) || 0;
    if (r <= 0) return 0;
    return 20 * Math.log10(r / 0.00002);
  }

  const fetchNodes = async () => {
    try {
      const response: any = await apiClient.get('/iot-nodes')
      setNodes(response.data || [])
    } catch (error) {
      console.error('Failed to fetch nodes:', error)
    }
  }

  const fetchHistory = async () => {
    try {
      setIsLoading(true)
      const params: any = {}
      if (selectedNode !== 'all') params.node_id = selectedNode
      if (startDate) params.start_date = startDate
      if (endDate) params.end_date = endDate
      
      // Se tiver filtros, traz muito mais dados (5000), senão traz os 500 últimos por padrão
      const hasFilters = selectedNode !== 'all' || startDate || endDate;
      params.limit = hasFilters ? 5000 : 500;
      
      const response: any = await apiClient.get('/iot-history', params)
      const formattedData = (response.data || []).map((item: any) => {
        const features = item.features || {}
        return {
          ...item,
          // Garante que métricas decompostas existam (do banco ou das features JSON)
          rms_x: Number(item.rms_x || features.x_rms || 0),
          rms_y: Number(item.rms_y || features.y_rms || 0),
          rms_z: Number(item.rms_z || features.z_rms || 0),
          mic_db: toDecibels(item.mic_rms || features.mic_rms || 0),
          ml_confidence: Number(item.ml_confidence || 0),
          displayTime: new Date(item.measured_at).toLocaleString([], { 
            day: '2-digit', 
            month: '2-digit', 
            hour: '2-digit', 
            minute: '2-digit' 
          })
        }
      })
      setData(formattedData)
    } catch (error) {
      console.error('Failed to fetch history:', error)
      toast.error('Falha ao carregar histórico')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchNodes()
    fetchHistory()
  }, [])

  const currentMetric = METRICS.find(m => m.id === selectedMetric) || METRICS[0]

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Histórico de Telemetria</CardTitle>
              <CardDescription>
                Análise de tendências e auditoria de ativos.
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg border">
                <Input 
                  type="date" 
                  className="h-8 w-[130px] text-[10px] border-none bg-transparent" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <span className="text-muted-foreground text-xs">até</span>
                <Input 
                  type="date" 
                  className="h-8 w-[130px] text-[10px] border-none bg-transparent" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <Select value={selectedNode} onValueChange={setSelectedNode}>
                <SelectTrigger className="h-9 w-[150px]">
                  <SelectValue placeholder="Sensor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Sensores</SelectItem>
                  {nodes.map((node) => (
                    <SelectItem key={node.id} value={node.id}>
                      {node.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button size="sm" onClick={fetchHistory} disabled={isLoading}>
                <RefreshCcw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Filtrar
              </Button>
              <Button size="sm" variant="outline" onClick={exportToCSV} disabled={isLoading || data.length === 0}>
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-2">
            <LayoutGrid className="h-4 w-4 text-muted-foreground mr-2 shrink-0" />
            {METRICS.map((metric) => (
              <Button
                key={metric.id}
                variant={selectedMetric === metric.id ? 'default' : 'outline'}
                size="sm"
                className="h-7 text-[10px] px-3 shrink-0"
                onClick={() => setSelectedMetric(metric.id)}
              >
                {metric.label}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[450px] w-full mt-4">
            {data.length > 0 ? (
              <ChartContainer config={{ [selectedMetric]: { label: currentMetric.label, color: currentMetric.color } }} className="h-full w-full">
                <LineChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.5} />
                  <XAxis 
                    dataKey="displayTime" 
                    tick={{ fontSize: 9 }}
                    axisLine={false}
                    tickLine={false}
                    interval="preserveStartEnd"
                    minTickGap={60}
                  />
                  <YAxis 
                    tick={{ fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(val) => Number(val).toFixed(2)}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    name={currentMetric.label}
                    type="monotone"
                    dataKey={selectedMetric}
                    stroke={currentMetric.color}
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 5, strokeWidth: 0 }}
                    isAnimationActive={true}
                  />
                </LineChart>
              </ChartContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground border-2 border-dashed rounded-xl bg-muted/20">
                <Filter className="h-10 w-10 mb-2 opacity-20" />
                <p className="text-sm">{isLoading ? 'Buscando dados no banco...' : 'Nenhum dado encontrado para este período.'}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
