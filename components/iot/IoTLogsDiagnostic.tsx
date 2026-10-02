'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/lib/api/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Activity,
  AlertTriangle, 
  BrainCircuit,
  CheckCircle2, 
  Copy, 
  Eye, 
  Filter, 
  Gauge, 
  Layers, 
  RefreshCcw, 
  Search, 
  ShieldCheck,
  Sliders,
  Terminal, 
  Zap 
} from 'lucide-react'
import { toast } from 'sonner'

export interface IoTDeviceLogItem {
  id: string
  tenant_id: string
  gateway_id?: string | null
  node_id?: string | null
  machine_id?: string | null
  level: 'info' | 'warning' | 'error' | 'critical'
  event_type: string
  ml_status?: string | null
  ml_confidence?: number | null
  cloud_ml_status?: string | null
  cloud_ml_confidence?: number | null
  rpm?: number | null
  rms_global?: number | null
  raw_payload?: Record<string, any> | null
  features?: Record<string, any> | null
  sent_command?: Record<string, any> | null
  message?: string | null
  measured_at?: string | null
  created_at: string
  node?: { id: string; name: string; node_id: string } | null
  gateway?: { id: string; name: string; device_id: string } | null
  machine?: { id: string; name: string } | null
}

interface PaginatedResponse {
  data: IoTDeviceLogItem[]
  current_page: number
  last_page: number
  total: number
}

export function IoTLogsDiagnostic() {
  const [logs, setLogs] = useState<IoTDeviceLogItem[]>([])
  const [nodes, setNodes] = useState<{ id: string; name: string; node_id: string }[]>([])
  const [selectedNode, setSelectedNode] = useState<string>('all')
  const [selectedLevel, setSelectedLevel] = useState<string>('all')
  const [onlyAnomalies, setOnlyAnomalies] = useState<boolean>(true)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [totalCount, setTotalCount] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  
  // Sheet Inspection State
  const [inspectedLog, setInspectedLog] = useState<IoTDeviceLogItem | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState<boolean>(false)
  const [isLabeling, setIsLabeling] = useState<boolean>(false)
  const [availableDatasets, setAvailableDatasets] = useState<{ id: string; name: string; type: string }[]>([])
  const [selectedDatasetForLabel, setSelectedDatasetForLabel] = useState<string>('auto')

  const handleLabelLog = async (logId: string, label: string, isBaseline = false) => {
    setIsLabeling(true)
    try {
      await apiClient.post(`/iot-logs/${logId}/label`, {
        ground_truth_label: label,
        is_baseline: isBaseline,
        dataset_id: selectedDatasetForLabel !== 'auto' ? selectedDatasetForLabel : undefined,
      })
      toast.success(`Amostra rotulada com sucesso como: ${label.replace(/_/g, ' ').toUpperCase()}!`)
      fetchLogs(currentPage)
    } catch (err: any) {
      toast.error('Erro ao rotular evento: ' + (err.message || 'Falha'))
    } finally {
      setIsLabeling(false)
    }
  }

  // Carrega nós e datasets disponíveis
  useEffect(() => {
    async function fetchInitialData() {
      try {
        const [nodesRes, datasetsRes] = await Promise.allSettled([
          apiClient.get<any>('/iot-nodes'),
          apiClient.get<any>('/iot-datasets'),
        ])
        
        if (nodesRes.status === 'fulfilled' && nodesRes.value?.data) {
          const list = Array.isArray(nodesRes.value.data) ? nodesRes.value.data : nodesRes.value.data.data || []
          setNodes(list)
        }

        if (datasetsRes.status === 'fulfilled' && datasetsRes.value?.data) {
          const dsList = Array.isArray(datasetsRes.value.data) ? datasetsRes.value.data : datasetsRes.value.data.data || []
          setAvailableDatasets(dsList)
        }
      } catch (err) {
        console.error('Falha ao carregar dados auxiliares de IoT:', err)
      }
    }
    fetchInitialData()
  }, [])

  // Carrega logs com filtros aplicados
  const fetchLogs = useCallback(async (page = 1) => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('page', page.toString())
      params.append('per_page', '20')

      if (selectedNode !== 'all') {
        params.append('node_id', selectedNode)
      }
      if (selectedLevel !== 'all') {
        params.append('level', selectedLevel)
      }
      if (onlyAnomalies) {
        params.append('only_anomalies', '1')
      }
      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim())
      }

      const response = await apiClient.get<PaginatedResponse>(`/iot-logs?${params.toString()}`)
      if (response) {
        setLogs(response.data || [])
        setCurrentPage(response.current_page || 1)
        setTotalPages(response.last_page || 1)
        setTotalCount(response.total || 0)
      }
    } catch (err: any) {
      toast.error('Erro ao carregar logs de diagnóstico: ' + (err.message || 'Falha de comunicação'))
    } finally {
      setIsLoading(false)
    }
  }, [selectedNode, selectedLevel, onlyAnomalies, searchTerm])

  useEffect(() => {
    fetchLogs(1)
  }, [fetchLogs])

  const copyToClipboard = (data: any, label = 'JSON') => {
    const content = typeof data === 'string' ? data : JSON.stringify(data, null, 2)
    navigator.clipboard.writeText(content)
    toast.success(`${label} copiado para a área de transferência!`)
  }

  const renderBadgeLevel = (level: string) => {
    switch (level) {
      case 'critical':
        return <Badge variant="destructive" className="font-bold uppercase tracking-wider">Crítico</Badge>
      case 'warning':
        return <Badge className="bg-amber-500 hover:bg-amber-600 text-white font-bold uppercase tracking-wider">Aviso</Badge>
      case 'error':
        return <Badge className="bg-orange-600 hover:bg-orange-700 text-white font-bold uppercase tracking-wider">Erro</Badge>
      default:
        return <Badge variant="secondary" className="font-semibold uppercase tracking-wider">Info</Badge>
    }
  }

  const renderStatusBadge = (status?: string | null, confidence?: number | null) => {
    if (!status) return <span className="text-muted-foreground text-xs italic">N/A</span>

    const isFail = status === 'desbalanceamento' || status === 'falha_confirmada'
    const isPending = status === 'analise_pendente'
    const confPercent = confidence !== null && confidence !== undefined ? `${(Number(confidence) * 100).toFixed(1)}%` : null

    return (
      <div className="flex items-center gap-1.5">
        <span className={`inline-block h-2 w-2 rounded-full ${
          isFail ? 'bg-red-500 animate-pulse' : isPending ? 'bg-yellow-500' : 'bg-emerald-500'
        }`} />
        <span className="font-medium text-xs capitalize">
          {status.replace(/_/g, ' ')}
        </span>
        {confPercent && (
          <span className="text-[10px] font-mono text-muted-foreground">({confPercent})</span>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Barra de Filtros de Auditoria */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Terminal className="h-5 w-5 text-primary" />
                Logs de Telemetria e Diagnóstico de Falhas
              </CardTitle>
              <CardDescription>
                Audite exatamente o payload de dados enviado pelos nós no instante em que a IA detectou desbalanceamentos ou anomalias.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => fetchLogs(currentPage)}
                disabled={isLoading}
              >
                <RefreshCcw className={`h-4 w-4 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
            {/* Seletor de Nó */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Nó de Sensor</Label>
              <Select value={selectedNode} onValueChange={setSelectedNode}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Todos os Nós" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Nós</SelectItem>
                  {nodes.map(n => (
                    <SelectItem key={n.id} value={n.id}>
                      {n.name} ({n.node_id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Severidade */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Severidade</Label>
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Todas as Severidades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="critical">Crítico (Falhas)</SelectItem>
                  <SelectItem value="warning">Aviso (Divergências)</SelectItem>
                  <SelectItem value="error">Erros Operacionais</SelectItem>
                  <SelectItem value="info">Informativo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Busca textual */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Buscar no Log</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Ex: desbalanceamento, erro..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 h-9 text-xs"
                />
              </div>
            </div>

            {/* Switch: Apenas Falhas */}
            <div className="flex items-center space-x-2 pt-2 sm:pt-0">
              <Switch
                id="only-anomalies"
                checked={onlyAnomalies}
                onCheckedChange={setOnlyAnomalies}
              />
              <Label htmlFor="only-anomalies" className="text-xs font-semibold cursor-pointer">
                Apenas Falhas / Anomalias
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Eventos */}
      <Card className="border-border/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="w-[170px]">Data / Hora</TableHead>
                <TableHead>Nó / Máquina</TableHead>
                <TableHead>Evento</TableHead>
                <TableHead>Veredito Edge IA</TableHead>
                <TableHead>Veredito Nuvem</TableHead>
                <TableHead className="w-[100px]">Nível</TableHead>
                <TableHead className="text-right w-[130px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground text-sm">
                    <RefreshCcw className="h-5 w-5 animate-spin mx-auto mb-2 text-primary" />
                    Carregando eventos de telemetria...
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground text-sm">
                    Nenhum registro de anomalia ou evento encontrado com os filtros atuais.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-mono text-xs whitespace-nowrap">
                      {new Date(log.measured_at || log.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-xs text-foreground">
                        {log.node?.name || log.node?.node_id || 'Nó N/A'}
                      </div>
                      {log.machine?.name && (
                        <div className="text-[11px] text-muted-foreground">
                          {log.machine.name}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-xs capitalize">
                      <span className="font-semibold text-foreground">
                        {log.event_type.replace(/_/g, ' ')}
                      </span>
                    </TableCell>
                    <TableCell>
                      {renderStatusBadge(log.ml_status, log.ml_confidence)}
                    </TableCell>
                    <TableCell>
                      {renderStatusBadge(log.cloud_ml_status, log.cloud_ml_confidence)}
                    </TableCell>
                    <TableCell>
                      {renderBadgeLevel(log.level)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-8 text-xs font-semibold"
                        onClick={() => {
                          setInspectedLog(log)
                          setIsSheetOpen(true)
                        }}
                      >
                        <Eye className="h-3.5 w-3.5 mr-1 text-primary" />
                        Inspecionar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Paginação */}
        <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/20 text-xs text-muted-foreground">
          <div>
            Total de <strong>{totalCount}</strong> eventos registrados
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => fetchLogs(currentPage - 1)}
              disabled={currentPage <= 1 || isLoading}
            >
              Anterior
            </Button>
            <span>
              Página {currentPage} de {totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => fetchLogs(currentPage + 1)}
              disabled={currentPage >= totalPages || isLoading}
            >
              Próxima
            </Button>
          </div>
        </div>
      </Card>

      {/* Drawer Lateral de Inspeção de Payload Completo */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          {inspectedLog && (
            <div className="space-y-6 py-2">
              <SheetHeader>
                <div className="flex items-center justify-between pr-6">
                  <SheetTitle className="text-lg flex items-center gap-2">
                    <Terminal className="h-5 w-5 text-primary" />
                    Inspeção de Payload & Diagnóstico
                  </SheetTitle>
                </div>
                <SheetDescription>
                  Disparo registrado em {new Date(inspectedLog.measured_at || inspectedLog.created_at).toLocaleString()}
                </SheetDescription>
              </SheetHeader>

              {/* KPI Cards Rápidos */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <Card className="p-3 bg-muted/30">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">RPM</span>
                  <p className="text-lg font-mono font-bold">{inspectedLog.rpm ?? 'N/A'}</p>
                </Card>
                <Card className="p-3 bg-muted/30">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">RMS Global</span>
                  <p className="text-lg font-mono font-bold">
                    {inspectedLog.rms_global ? `${Number(inspectedLog.rms_global).toFixed(3)}g` : 'N/A'}
                  </p>
                </Card>
                <Card className="p-3 bg-muted/30">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Confiança Edge</span>
                  <p className="text-lg font-mono font-bold text-foreground">
                    {inspectedLog.ml_confidence !== null ? `${(Number(inspectedLog.ml_confidence) * 100).toFixed(1)}%` : 'N/A'}
                  </p>
                </Card>
                <Card className="p-3 bg-muted/30">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Nuvem XGBoost</span>
                  <p className="text-lg font-mono font-bold text-primary">
                    {inspectedLog.cloud_ml_confidence !== null ? `${(Number(inspectedLog.cloud_ml_confidence) * 100).toFixed(1)}%` : 'N/A'}
                  </p>
                </Card>
              </div>

              {/* Mensagem descritiva */}
              {inspectedLog.message && (
                <div className="rounded-lg border border-border bg-muted/20 p-3 text-xs flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="font-medium text-foreground">{inspectedLog.message}</p>
                </div>
              )}

              {/* Triagem & Rotulação MLOps (Human-in-the-Loop) */}
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader className="p-3.5 pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-primary">
                      <BrainCircuit className="h-4 w-4" />
                      Triagem Humana & Curadoria MLOps
                    </CardTitle>
                    <Badge variant="outline" className="text-[10px] bg-background">
                      {isLabeling ? 'Gravando Amostra...' : 'Pronto para Rotulação'}
                    </Badge>
                  </div>
                  <CardDescription className="text-[11px]">
                    Valide o evento para alimentar a esteira de retreino (XGBoost / Isolation Forest). 
                    As 36 features canônicas deste disparo serão anexadas ao dataset selecionado.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-3.5 pt-0 space-y-3">
                  {/* Seletor de Dataset Opcional */}
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">Dataset Destino:</span>
                    <Select 
                      value={selectedDatasetForLabel} 
                      onValueChange={setSelectedDatasetForLabel}
                      disabled={isLabeling}
                    >
                      <SelectTrigger className="h-7 text-xs flex-1">
                        <SelectValue placeholder="Automático (Baseado no Ativo)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Automático (Baseado na Máquina/Ativo)</SelectItem>
                        {availableDatasets.map((ds) => (
                          <SelectItem key={ds.id} value={ds.id}>
                            {ds.name} ({ds.type === 'supervised_xgboost' ? 'XGBoost' : 'iForest'})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Botões de Ação Rápida de Rotulação */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs font-medium justify-start border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-700 dark:hover:text-emerald-300"
                      disabled={isLabeling}
                      onClick={() => handleLabelLog(inspectedLog.id, 'saudavel', true)}
                    >
                      <ShieldCheck className="h-3.5 w-3.5 mr-1.5 text-emerald-500 shrink-0" />
                      <span className="truncate">Saudável (Baseline)</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs font-medium justify-start border-amber-500/30 hover:bg-amber-500/10 hover:text-amber-700 dark:hover:text-amber-300"
                      disabled={isLabeling}
                      onClick={() => handleLabelLog(inspectedLog.id, 'desbalanceamento')}
                    >
                      <AlertTriangle className="h-3.5 w-3.5 mr-1.5 text-amber-500 shrink-0" />
                      <span className="truncate">Desbalanceamento</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs font-medium justify-start border-amber-500/30 hover:bg-amber-500/10 hover:text-amber-700 dark:hover:text-amber-300"
                      disabled={isLabeling}
                      onClick={() => handleLabelLog(inspectedLog.id, 'folga_mecanica')}
                    >
                      <Sliders className="h-3.5 w-3.5 mr-1.5 text-amber-600 shrink-0" />
                      <span className="truncate">Folga Mecânica</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs font-medium justify-start border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-700 dark:hover:text-rose-300"
                      disabled={isLabeling}
                      onClick={() => handleLabelLog(inspectedLog.id, 'falha_rolamento')}
                    >
                      <Activity className="h-3.5 w-3.5 mr-1.5 text-rose-500 shrink-0" />
                      <span className="truncate">Falha de Rolamento</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs font-medium justify-start border-blue-500/30 hover:bg-blue-500/10 hover:text-blue-700 dark:hover:text-blue-300 col-span-2 sm:col-span-2"
                      disabled={isLabeling}
                      onClick={() => handleLabelLog(inspectedLog.id, 'falso_positivo')}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1.5 text-blue-500 shrink-0" />
                      <span className="truncate">Falso Alarme (Ruído Transitório / Ignorar)</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Abas com Cargas JSON */}
              <Tabs defaultValue="raw" className="space-y-3">
                <div className="flex items-center justify-between">
                  <TabsList className="grid grid-cols-3 h-8">
                    <TabsTrigger value="raw" className="text-xs">Payload Bruto</TabsTrigger>
                    <TabsTrigger value="features" className="text-xs">Features ML</TabsTrigger>
                    <TabsTrigger value="command" className="text-xs">Comando MQTT</TabsTrigger>
                  </TabsList>
                </div>

                {/* Tab: Payload Bruto */}
                <TabsContent value="raw" className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">JSON original enviado pelo microcontrolador:</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 text-xs"
                      onClick={() => copyToClipboard(inspectedLog.raw_payload, 'Payload Bruto')}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copiar
                    </Button>
                  </div>
                  <pre className="p-3.5 rounded-lg bg-zinc-950 text-zinc-100 font-mono text-[11px] overflow-x-auto max-h-[350px] border border-zinc-800 leading-relaxed">
                    {JSON.stringify(inspectedLog.raw_payload || {}, null, 2)}
                  </pre>
                </TabsContent>

                {/* Tab: Features Extraídas */}
                <TabsContent value="features" className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Vetor de características extraídas para inferência:</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 text-xs"
                      onClick={() => copyToClipboard(inspectedLog.features, 'Features ML')}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copiar
                    </Button>
                  </div>
                  <pre className="p-3.5 rounded-lg bg-zinc-950 text-zinc-100 font-mono text-[11px] overflow-x-auto max-h-[350px] border border-zinc-800 leading-relaxed">
                    {JSON.stringify(inspectedLog.features || {}, null, 2)}
                  </pre>
                </TabsContent>

                {/* Tab: Comando MQTT */}
                <TabsContent value="command" className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Comando de feedback devolvido via broker:</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 text-xs"
                      onClick={() => copyToClipboard(inspectedLog.sent_command, 'Comando MQTT')}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copiar
                    </Button>
                  </div>
                  <pre className="p-3.5 rounded-lg bg-zinc-950 text-zinc-100 font-mono text-[11px] overflow-x-auto max-h-[350px] border border-zinc-800 leading-relaxed">
                    {JSON.stringify(inspectedLog.sent_command || {}, null, 2)}
                  </pre>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsSheetOpen(false)}
                >
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
