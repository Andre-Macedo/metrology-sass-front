'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { 
  MOCK_PLANT_ASSETS, 
  PlantAsset, 
  ScenarioData, 
  ScenarioKey, 
  SCENARIOS_DICTIONARY 
} from '@/features/iot/data/tractian-mock-data'
import { apiClient } from '@/lib/api/client'
import type { IoTNodeOption, NodeSpectrumApiResponse } from '@/features/iot/lib/spectrum-adapter'
import { AssetHierarchyBreadcrumb } from './AssetHierarchyBreadcrumb'
import { AssetHealthHero } from './AssetHealthHero'
import { VibrationSeverityCockpit } from './VibrationSeverityCockpit'
import { SpectrumStudio } from './SpectrumStudio'
import { ThermalTrendCard } from './ThermalTrendCard'
import { PredictiveInsightsEngine } from './PredictiveInsightsEngine'
import { PlantAssetCockpit } from './PlantAssetCockpit'
import { CreatePredictiveWorkOrderModal } from './CreatePredictiveWorkOrderModal'
import { useEcho } from '@/lib/providers/echo-provider'
import { Button } from '@/components/ui/button'
import { LayoutGrid, Cpu, ArrowLeft, Radio } from 'lucide-react'

export function TractianAssetHealthStudio() {
  const { echo } = useEcho()
  const [selectedAsset, setSelectedAsset] = useState<PlantAsset>(MOCK_PLANT_ASSETS[0])
  const [selectedScenarioKey, setSelectedScenarioKey] = useState<ScenarioKey>(selectedAsset.scenarioId)
  const [viewMode, setViewMode] = useState<'asset_detail' | 'plant_overview'>('asset_detail')
  const [isLiveMode, setIsLiveMode] = useState(false)
  const [isWorkOrderModalOpen, setIsWorkOrderModalOpen] = useState(false)
  const [iotNodes, setIotNodes] = useState<IoTNodeOption[]>([])
  const [selectedRealNodeId, setSelectedRealNodeId] = useState<string>('')
  const [liveSpectrum, setLiveSpectrum] = useState<NodeSpectrumApiResponse | null>(null)
  const [isRefreshingLive, setIsRefreshingLive] = useState(false)

  // Dados do cenário ativo atual
  const [currentScenario, setCurrentScenario] = useState<ScenarioData>(
    SCENARIOS_DICTIONARY[selectedScenarioKey]
  )

  // Quando o ativo mudar, sincroniza o cenário
  const handleSelectAsset = (asset: PlantAsset) => {
    setSelectedAsset(asset)
    setSelectedScenarioKey(asset.scenarioId)
    setCurrentScenario(SCENARIOS_DICTIONARY[asset.scenarioId])
    setViewMode('asset_detail')
  }

  // Quando o cenário mudar pelo dropdown
  const handleSelectScenario = (key: ScenarioKey) => {
    setSelectedScenarioKey(key)
    setCurrentScenario(SCENARIOS_DICTIONARY[key])
  }

  useEffect(() => {
    let active = true
    apiClient
      .get<any>('/iot-nodes')
      .then((res) => {
        if (!active) return
        const rows: IoTNodeOption[] = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : []
        setIotNodes(rows)
      })
      .catch(() => {
        // Fallback silencioso para o simulador local quando API/auth não estiver disponível
      })
    return () => {
      active = false
    }
  }, [])

  const fetchNodeSpectrum = useCallback(async (nodeId: string) => {
    if (!nodeId) {
      setLiveSpectrum(null)
      return
    }
    setIsRefreshingLive(true)
    try {
      const data = await apiClient.get<NodeSpectrumApiResponse>(`/iot-nodes/${nodeId}/spectrum`)
      setLiveSpectrum(data)
    } catch {
      // Mantém fallback gracioso para o espectro simulado
    } finally {
      setIsRefreshingLive(false)
    }
  }, [])

  useEffect(() => {
    if (!selectedRealNodeId) {
      setLiveSpectrum(null)
      return
    }
    void fetchNodeSpectrum(selectedRealNodeId)
  }, [selectedRealNodeId, fetchNodeSpectrum])

  // Efeito para conectar com WebSockets Reverb se o usuário ativar "Ao Vivo"
  useEffect(() => {
    if (!isLiveMode || !echo) return

    const slug = typeof window !== 'undefined' ? localStorage.getItem('current_tenant_slug') || 'default' : 'default'
    const channel = echo.channel(`tenant.${slug}.iot`)

    channel.listen('.sensor.data', (payload: any) => {
      console.log('Tractian Live WebSocket Telemetry:', payload)
      // Atualiza os valores do cenário em tempo real a partir dos dados do ESP32
      const globalVel = Number(payload.velocity_rms || payload.rms_global || 0)
      const rx = Number(payload.rms_x || payload.features?.x_rms || 0)
      const ry = Number(payload.rms_y || payload.features?.y_rms || 0)
      const az = Number(payload.rms_z || payload.features?.z_rms || 0)
      const tempBearing = payload.temperature !== undefined ? Number(payload.temperature) : undefined

      setCurrentScenario((prev) => ({
        ...prev,
        triaxialVelocityRms: {
          radialX: rx > 0 ? rx : prev.triaxialVelocityRms.radialX,
          radialY: ry > 0 ? ry : prev.triaxialVelocityRms.radialY,
          axialZ: az > 0 ? az : prev.triaxialVelocityRms.axialZ,
          global: globalVel > 0 ? globalVel : prev.triaxialVelocityRms.global,
        },
        temperature: {
          ...prev.temperature,
          bearingContactC: tempBearing !== undefined && tempBearing > 0 ? tempBearing : prev.temperature.bearingContactC,
        },
        isoZone: globalVel > 4.5 ? 'D' : globalVel > 2.8 ? 'C' : globalVel > 1.4 ? 'B' : 'A',
      }))

      if (selectedRealNodeId) {
        const selectedNode = iotNodes.find((n) => n.id === selectedRealNodeId)
        if (!payload.node_id || payload.node_id === selectedNode?.node_id) {
          void fetchNodeSpectrum(selectedRealNodeId)
        }
      }
    })

    return () => {
      channel.stopListening('.sensor.data')
    }
  }, [isLiveMode, echo, selectedRealNodeId, iotNodes, fetchNodeSpectrum])

  return (
    <div className="space-y-5">
      {/* Barra Superior de Alternância de Visões */}
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          {viewMode === 'asset_detail' ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('plant_overview')}
              className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Ver Planta Inteira</span>
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('asset_detail')}
              className="gap-1.5 text-xs text-primary font-semibold"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Voltar ao Ativo ({selectedAsset.tag})</span>
            </Button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {iotNodes.length > 0 && (
            <label className="flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2 py-1 text-xs">
              <Radio className={`h-3.5 w-3.5 ${selectedRealNodeId ? 'text-emerald-500' : 'text-muted-foreground'}`} />
              <span className="text-muted-foreground">Espectro:</span>
              <select
                aria-label="Selecionar nó IoT para espectro real"
                value={selectedRealNodeId}
                onChange={(e) => setSelectedRealNodeId(e.target.value)}
                className="bg-transparent font-medium text-foreground focus:outline-none"
              >
                <option value="">Simulador Local</option>
                {iotNodes.map((node) => (
                  <option key={node.id} value={node.id}>
                    {node.name} ({node.node_id}){node.machine?.name ? ` — ${node.machine.name}` : ''}
                  </option>
                ))}
              </select>
            </label>
          )}

          <div className="flex items-center gap-1 rounded-md border border-border bg-muted/40 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setViewMode('asset_detail')}
              className={`flex items-center gap-1.5 rounded px-2.5 py-1 font-medium transition-colors ${
                viewMode === 'asset_detail'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Cpu className="h-3.5 w-3.5" />
              <span>Cockpit do Ativo</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('plant_overview')}
              className={`flex items-center gap-1.5 rounded px-2.5 py-1 font-medium transition-colors ${
                viewMode === 'plant_overview'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Visão da Planta (4 Ativos)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      {viewMode === 'plant_overview' ? (
        <PlantAssetCockpit
          selectedAssetId={selectedAsset.id}
          onSelectAsset={handleSelectAsset}
        />
      ) : (
        <div className="space-y-5">
          {/* Breadcrumb Industrial */}
          <AssetHierarchyBreadcrumb asset={selectedAsset} />

          {/* Hero Header do Ativo (Health Score + Seletor de Cenários + Ações) */}
          <AssetHealthHero
            asset={selectedAsset}
            scenario={currentScenario}
            selectedScenarioKey={selectedScenarioKey}
            onSelectScenario={handleSelectScenario}
            isLiveMode={isLiveMode}
            onToggleLiveMode={setIsLiveMode}
            onOpenWorkOrderModal={() => setIsWorkOrderModalOpen(true)}
          />

          {/* Grid Principal do Cockpit */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
            
            {/* Coluna Esquerda: Severidade ISO 20816 + Spectrum Studio FFT */}
            <div className="space-y-5 lg:col-span-7">
              <VibrationSeverityCockpit scenario={currentScenario} />
              <SpectrumStudio
                scenario={currentScenario}
                liveSpectrum={liveSpectrum}
                onRefreshLive={selectedRealNodeId ? () => void fetchNodeSpectrum(selectedRealNodeId) : undefined}
                isRefreshingLive={isRefreshingLive}
              />
            </div>

            {/* Coluna Direita: Motor de Diagnóstico Prescritivo IA + Tendência Térmica 30D */}
            <div className="space-y-5 lg:col-span-5">
              <PredictiveInsightsEngine
                scenario={currentScenario}
                onOpenWorkOrderModal={() => setIsWorkOrderModalOpen(true)}
              />
              <ThermalTrendCard scenario={currentScenario} />
            </div>

          </div>
        </div>
      )}

      {/* Modal de Criação de Ordem de Serviço Preditiva */}
      <CreatePredictiveWorkOrderModal
        isOpen={isWorkOrderModalOpen}
        onClose={() => setIsWorkOrderModalOpen(false)}
        asset={selectedAsset}
        scenario={currentScenario}
      />
    </div>
  )
}
