'use client'

import React, { useState, useEffect } from 'react'
import { Line, LineChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { apiClient } from '@/lib/api/client'
import { Button } from '@/components/ui/button'
import { Calendar as CalendarIcon, Filter, RefreshCcw } from 'lucide-react'
import { toast } from 'sonner'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const chartConfig = {
  rms_global: {
    label: 'RMS Global (Vibração)',
    color: '#2563eb',
  },
  piezo_rms: {
    label: 'Piezo RMS (Ruído)',
    color: '#e11d48',
  },
}

export function HistoricalTelemetry() {
  const [data, setData] = useState<any[]>([])
  const [nodes, setNodes] = useState<any[]>([])
  const [selectedNode, setSelectedNode] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)

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
      
      const response: any = await apiClient.get('/iot-history', params)
      const formattedData = (response.data || []).map((item: any) => ({
        ...item,
        // Facilitar leitura no gráfico
        displayTime: new Date(item.measured_at).toLocaleString([], { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
      }))
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

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Histórico de Telemetria</CardTitle>
            <CardDescription>
              Análise de tendências e assinaturas históricas.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedNode} onValueChange={setSelectedNode}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrar por Sensor" />
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
            <Button variant="outline" size="icon" onClick={fetchHistory} disabled={isLoading}>
              <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full mt-4">
            {data.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="displayTime" 
                    tick={{ fontSize: 10 }}
                    interval="preserveStartEnd"
                    minTickGap={50}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                  />
                  <Legend />
                  <Line
                    name="Vibração (RMS)"
                    type="monotone"
                    dataKey="rms_global"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                  <Line
                    name="Ruído (Piezo)"
                    type="monotone"
                    dataKey="piezo_rms"
                    stroke="#e11d48"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground border-2 border-dashed rounded-lg">
                <Filter className="h-10 w-10 mb-2 opacity-20" />
                <p>{isLoading ? 'Carregando dados...' : 'Nenhum dado histórico encontrado para este filtro.'}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
