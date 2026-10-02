'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/lib/api/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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
  Bot, 
  BrainCircuit, 
  CheckCircle, 
  Database, 
  Download, 
  Layers, 
  Plus, 
  RefreshCcw, 
  Rocket, 
  Sliders, 
  Sparkles, 
  Zap 
} from 'lucide-react'
import { toast } from 'sonner'

export interface MLDatasetItem {
  id: string
  name: string
  slug: string
  type: 'diagnostic_multiclass' | 'baseline_normal' | 'benchmark_golden_set' | 'run_to_failure' | 'supervised_xgboost' | 'unsupervised_iforest'
  target_machine_id?: string | null
  description?: string | null
  status: 'collecting' | 'ready' | 'archived'
  class_distribution?: Record<string, number> | null
  total_samples: number
  bursts_count?: number
  models_count?: number
  created_at: string
  target_machine?: { id: string; name: string; code?: string } | null
}

export interface MLModelItem {
  id: string
  name: string
  model_type: 'xgboost_cloud' | 'iforest_edge'
  version: string
  target_device: 'cloud' | 'edge_esp32'
  status: 'in_production' | 'shadow' | 'candidate' | 'deprecated'
  metrics?: Record<string, any> | null
  notes?: string | null
  deployed_at?: string | null
  dataset?: { id: string; name: string; type: string } | null
}

export function IoTDatasetsManager() {
  const [datasets, setDatasets] = useState<MLDatasetItem[]>([])
  const [models, setModels] = useState<MLModelItem[]>([])
  const [machines, setMachines] = useState<{ id: string; name: string }[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // Modais de Criação
  const [isDatasetModalOpen, setIsDatasetModalOpen] = useState<boolean>(false)
  const [isModelModalOpen, setIsModelModalOpen] = useState<boolean>(false)

  // Form New Dataset
  const [datasetName, setDatasetName] = useState('')
  const [datasetType, setDatasetType] = useState<string>('diagnostic_multiclass')
  const [targetMachineId, setTargetMachineId] = useState<string>('none')
  const [datasetDesc, setDatasetDesc] = useState('')
  const [isSubmittingDataset, setIsSubmittingDataset] = useState(false)

  // Form New Model
  const [modelName, setModelName] = useState('')
  const [modelType, setModelType] = useState<'xgboost_cloud' | 'iforest_edge'>('xgboost_cloud')
  const [modelVersion, setModelVersion] = useState('')
  const [targetDevice, setTargetDevice] = useState<'cloud' | 'edge_esp32'>('cloud')
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('none')
  const [modelF1, setModelF1] = useState('')
  const [modelAccuracy, setModelAccuracy] = useState('')
  const [modelNotes, setModelNotes] = useState('')
  const [isSubmittingModel, setIsSubmittingModel] = useState(false)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [dsRes, mdRes, mcRes] = await Promise.all([
        apiClient.get<{ data: MLDatasetItem[] }>('/iot-datasets'),
        apiClient.get<{ data: MLModelItem[] }>('/iot-models'),
        apiClient.get<any>('/system/stations'),
      ])

      setDatasets(dsRes?.data || [])
      setModels(mdRes?.data || [])
      if (mcRes?.data) {
        setMachines(Array.isArray(mcRes.data) ? mcRes.data : mcRes.data.data || [])
      }
    } catch (err: any) {
      toast.error('Erro ao carregar ecossistema MLOps: ' + (err.message || 'Falha de comunicação'))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Download do CSV pronto para o Jupyter Notebook
  const handleExportDataset = (id: string, slug: string) => {
    toast.info('Iniciando exportação do dataset consolidado...')
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
    const tenantId = typeof window !== 'undefined' ? localStorage.getItem('current_tenant_id') : null

    // Cria requisição com stream direto
    fetch(`${apiBase}/iot-datasets/${id}/export`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(tenantId ? { 'X-Tenant-ID': tenantId } : {}),
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Falha ao gerar arquivo CSV')
        return res.blob()
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${slug}_export.csv`
        document.body.appendChild(a)
        a.click()
        a.remove()
        toast.success('Download do dataset concluído! Pronto para o Jupyter.')
      })
      .catch((err) => {
        toast.error('Erro no download: ' + err.message)
      })
  }

  // Criação de Dataset
  const handleCreateDataset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!datasetName.trim()) return

    setIsSubmittingDataset(true)
    try {
      await apiClient.post('/iot-datasets', {
        name: datasetName.trim(),
        type: datasetType,
        target_machine_id: targetMachineId !== 'none' ? targetMachineId : null,
        description: datasetDesc.trim() || null,
      })

      toast.success('Novo dataset criado com sucesso!')
      setIsDatasetModalOpen(false)
      setDatasetName('')
      setDatasetDesc('')
      fetchData()
    } catch (err: any) {
      toast.error('Erro ao criar dataset: ' + (err.message || 'Falha na requisição'))
    } finally {
      setIsSubmittingDataset(false)
    }
  }

  // Registro de Modelo
  const handleCreateModel = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!modelName.trim() || !modelVersion.trim()) return

    setIsSubmittingModel(true)
    try {
      const metrics: Record<string, number> = {}
      if (modelF1) metrics.f1_score = parseFloat(modelF1)
      if (modelAccuracy) metrics.accuracy = parseFloat(modelAccuracy)

      await apiClient.post('/iot-models', {
        name: modelName.trim(),
        model_type: modelType,
        version: modelVersion.trim(),
        target_device: targetDevice,
        dataset_id: selectedDatasetId !== 'none' ? selectedDatasetId : null,
        status: 'candidate',
        metrics: Object.keys(metrics).length > 0 ? metrics : null,
        notes: modelNotes.trim() || null,
      })

      toast.success('Modelo registrado no catálogo de MLOps!')
      setIsModelModalOpen(false)
      setModelName('')
      setModelVersion('')
      setModelF1('')
      setModelAccuracy('')
      setModelNotes('')
      fetchData()
    } catch (err: any) {
      toast.error('Erro ao registrar modelo: ' + (err.message || 'Falha na requisição'))
    } finally {
      setIsSubmittingModel(false)
    }
  }

  // Deploy / Promoção de Modelo
  const handleDeployModel = async (id: string, status: 'in_production' | 'shadow') => {
    try {
      await apiClient.post(`/iot-models/${id}/deploy`, { status })
      toast.success(`Modelo promovido para status: ${status === 'in_production' ? 'PRODUÇÃO ATIVA' : 'MODO SOMBRA'}`)
      fetchData()
    } catch (err: any) {
      toast.error('Erro ao alterar status do modelo: ' + (err.message || 'Falha'))
    }
  }

  const renderDatasetTypeBadge = (type: string) => {
    switch (type) {
      case 'diagnostic_multiclass':
      case 'supervised_xgboost':
        return <Badge variant="default" className="text-[10px] uppercase font-bold shrink-0">Diagnóstico</Badge>
      case 'baseline_normal':
      case 'unsupervised_iforest':
        return <Badge variant="secondary" className="text-[10px] uppercase font-bold shrink-0 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30">Linha de Base</Badge>
      case 'benchmark_golden_set':
        return <Badge variant="outline" className="text-[10px] uppercase font-bold shrink-0 border-purple-500/40 text-purple-600 bg-purple-50 dark:bg-purple-950/30">Benchmark</Badge>
      case 'run_to_failure':
        return <Badge variant="outline" className="text-[10px] uppercase font-bold shrink-0 border-amber-500/40 text-amber-600 bg-amber-50 dark:bg-amber-950/30">Degradação (R2F)</Badge>
      default:
        return <Badge variant="outline" className="text-[10px] uppercase font-bold shrink-0">{type}</Badge>
    }
  }

  return (
    <div className="space-y-8">
      {/* Top Header & Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <BrainCircuit className="h-6 w-6 text-primary" />
            Curadoria de Datasets & MLOps
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Gerencie os dados rotulados pós-operação, exporte arquivos para retreinamento no Jupyter e controle as versões de IA em produção.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchData}
            disabled={isLoading}
          >
            <RefreshCcw className={`h-4 w-4 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button 
            size="sm" 
            className="bg-primary text-primary-foreground font-semibold"
            onClick={() => setIsDatasetModalOpen(true)}
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Novo Dataset
          </Button>
        </div>
      </div>

      {/* Grid de Datasets */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold flex items-center gap-2">
            <Database className="h-4 w-4 text-primary" />
            Datasets Curados para Treinamento
          </h3>
          <span className="text-xs text-muted-foreground">
            {datasets.length} datasets catalogados
          </span>
        </div>

        {datasets.length === 0 ? (
          <Card className="border-dashed p-8 text-center bg-muted/20">
            <Database className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-50" />
            <h4 className="font-semibold text-sm">Nenhum dataset curado ainda</h4>
            <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1 mb-4">
              Crie um novo dataset ou rotule anomalias na aba &ldquo;Logs & Diagnóstico de Falhas&rdquo; para iniciar a coleta de amostras automaticamente.
            </p>
            <Button size="sm" onClick={() => setIsDatasetModalOpen(true)}>
              <Plus className="h-4 w-4 mr-1.5" /> Criar Primeiro Dataset
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {datasets.map((ds) => (
              <Card key={ds.id} className="border-border/60 shadow-sm flex flex-col justify-between hover:border-primary/40 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base font-bold leading-tight">
                      {ds.name}
                    </CardTitle>
                    {renderDatasetTypeBadge(ds.type)}
                  </div>
                  <CardDescription className="text-xs line-clamp-2 mt-1">
                    {ds.description || 'Sem descrição cadastrada.'}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 pt-0">
                  <div className="rounded-lg bg-muted/40 p-2.5 space-y-2 border border-border/40">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Total de Rajadas Validadas:</span>
                      <span className="font-mono font-bold text-foreground">{ds.total_samples}</span>
                    </div>

                    {/* Distribuição de Classes */}
                    {ds.class_distribution && Object.keys(ds.class_distribution).length > 0 && (
                      <div className="space-y-1.5 pt-1 border-t border-border/40">
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                          Distribuição de Classes:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(ds.class_distribution).map(([cls, count]) => (
                            <Badge 
                              key={cls} 
                              variant="outline" 
                              className={`text-[10px] font-mono capitalize ${
                                cls === 'desbalanceamento' ? 'border-red-400 text-red-600 bg-red-50 dark:bg-red-950/40' :
                                cls === 'saudavel' ? 'border-emerald-400 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40' :
                                'border-amber-400 text-amber-600 bg-amber-50 dark:bg-amber-950/40'
                              }`}
                            >
                              {cls.replace(/_/g, ' ')}: {count}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {ds.target_machine?.name || 'Geral (Multiativo)'}
                    </span>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="text-xs h-8 font-semibold border-primary/40 hover:bg-primary hover:text-primary-foreground"
                      onClick={() => handleExportDataset(ds.id, ds.slug)}
                    >
                      <Download className="h-3.5 w-3.5 mr-1.5" />
                      Exportar CSV
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Model Registry (Catálogo de Modelos) */}
      <div className="space-y-4 pt-4 border-t">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold flex items-center gap-2">
              <Bot className="h-4 w-4 text-primary" />
              Catálogo de Modelos & Registro de Versões (Model Registry)
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Rastreabilidade de qual modelo de IA está ativo na nuvem (FastAPI) e qual baseline está embarcado nos ESP32.
            </p>
          </div>
          <Button 
            size="sm" 
            variant="outline"
            className="text-xs font-semibold"
            onClick={() => setIsModelModalOpen(true)}
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Registrar Modelo
          </Button>
        </div>

        <Card className="border-border/60 shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead>Modelo / Arquitetura</TableHead>
                <TableHead>Versão</TableHead>
                <TableHead>Alvo de Execução</TableHead>
                <TableHead>Métricas de Validação</TableHead>
                <TableHead>Status Operacional</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {models.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground text-xs">
                    Nenhum modelo registrado no catálogo. O microserviço FastAPI está executando a versão padrão de fábrica.
                  </TableCell>
                </TableRow>
              ) : (
                models.map((mod) => (
                  <TableRow key={mod.id} className="hover:bg-muted/30">
                    <TableCell>
                      <div className="font-semibold text-xs text-foreground">{mod.name}</div>
                      <div className="text-[11px] text-muted-foreground font-mono">
                        {mod.model_type === 'xgboost_cloud' ? 'XGBoost Classifier' : 'Isolation Forest (C)'}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs font-bold text-primary">
                      {mod.version}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] font-semibold">
                        {mod.target_device === 'cloud' ? 'Nuvem (FastAPI)' : 'Borda (ESP32-S3)'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {mod.metrics ? (
                        <div className="flex items-center gap-2 text-xs font-mono">
                          {mod.metrics.f1_score && (
                            <span>F1: <strong>{(mod.metrics.f1_score * 100).toFixed(1)}%</strong></span>
                          )}
                          {mod.metrics.accuracy && (
                            <span className="text-muted-foreground">Acc: {(mod.metrics.accuracy * 100).toFixed(1)}%</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Sem métricas</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {mod.status === 'in_production' ? (
                        <Badge className="bg-emerald-600 text-white font-bold text-[10px] uppercase tracking-wider">
                          Produção Ativa
                        </Badge>
                      ) : mod.status === 'shadow' ? (
                        <Badge className="bg-blue-600 text-white font-bold text-[10px] uppercase tracking-wider">
                          Modo Sombra
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px] uppercase">
                          {mod.status}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {mod.status !== 'in_production' && (
                        <Button
                          variant="secondary"
                          size="sm"
                          className="h-7 text-xs font-semibold"
                          onClick={() => handleDeployModel(mod.id, 'in_production')}
                        >
                          <Rocket className="h-3 w-3 mr-1 text-primary" />
                          Ativar
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Modal: Novo Dataset */}
      <Dialog open={isDatasetModalOpen} onOpenChange={setIsDatasetModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Criar Novo Dataset Curado</DialogTitle>
            <DialogDescription>
              Organize amostras de rajadas por máquina ou família de equipamentos para alimentar os notebooks de treinamento.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateDataset} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Nome do Dataset</Label>
              <Input
                placeholder="Ex: Motor WEG 5HP - Bancada Real"
                value={datasetName}
                onChange={(e) => setDatasetName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Tipo do Dataset (Propósito MLOps)</Label>
              <Select value={datasetType} onValueChange={(val: any) => setDatasetType(val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="diagnostic_multiclass">Diagnóstico Multiclasse (Saudável + Falhas)</SelectItem>
                  <SelectItem value="baseline_normal">Linha de Base Padrão-Ouro (Apenas Saudável)</SelectItem>
                  <SelectItem value="benchmark_golden_set">Benchmark / Teste Cego (Auditoria de Modelos)</SelectItem>
                  <SelectItem value="run_to_failure">Degradação Mecânica / Histórico (R2F)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Máquina Vinculada (Opcional)</Label>
              <Select value={targetMachineId} onValueChange={setTargetMachineId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma máquina ou Geral" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Geral (Multiativo / Bancada)</SelectItem>
                  {machines.map((m) => (
                    <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Descrição / Metadados</Label>
              <Input
                placeholder="Ex: Ensaios de desbalanceamento em regime permanente de 1750 RPM"
                value={datasetDesc}
                onChange={(e) => setDatasetDesc(e.target.value)}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsDatasetModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmittingDataset || !datasetName.trim()}>
                Criar Dataset
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal: Registrar Modelo */}
      <Dialog open={isModelModalOpen} onOpenChange={setIsModelModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar Versão de Modelo (Model Registry)</DialogTitle>
            <DialogDescription>
              Documente os resultados obtidos após rodar o treinamento no Jupyter Notebook.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateModel} className="space-y-3.5 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Nome do Modelo</Label>
              <Input
                placeholder="Ex: XGBoost Especialista Vibração"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Versão Semântica</Label>
                <Input
                  placeholder="v2.1.0"
                  value={modelVersion}
                  onChange={(e) => setModelVersion(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Alvo de Execução</Label>
                <Select value={targetDevice} onValueChange={(val: any) => setTargetDevice(val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cloud">Nuvem (FastAPI)</SelectItem>
                    <SelectItem value="edge_esp32">Borda (ESP32-S3)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">F1-Score (0 a 1)</Label>
                <Input
                  placeholder="0.975"
                  value={modelF1}
                  onChange={(e) => setModelF1(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Acurácia (0 a 1)</Label>
                <Input
                  placeholder="0.982"
                  value={modelAccuracy}
                  onChange={(e) => setModelAccuracy(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Notas do Treinamento</Label>
              <Input
                placeholder="Ex: Treinado com group-aware split nas 50 rajadas da bancada"
                value={modelNotes}
                onChange={(e) => setModelNotes(e.target.value)}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsModelModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmittingModel || !modelName.trim() || !modelVersion.trim()}>
                Salvar Modelo
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
