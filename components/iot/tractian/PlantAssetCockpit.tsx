'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  MOCK_PLANT_ASSETS, 
  PlantAsset, 
  SCENARIOS_DICTIONARY 
} from '@/features/iot/data/tractian-mock-data'
import { 
  Activity, 
  AlertTriangle, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  Cpu, 
  Filter, 
  Flame, 
  Gauge, 
  Radio, 
  RotateCw, 
  Search, 
  ShieldAlert, 
  Thermometer, 
  Zap 
} from 'lucide-react'

interface PlantAssetCockpitProps {
  onSelectAsset: (asset: PlantAsset) => void
  selectedAssetId: string
}

export function PlantAssetCockpit({
  onSelectAsset,
  selectedAssetId,
}: PlantAssetCockpitProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'healthy' | 'warning' | 'critical'>('all')

  const filteredAssets = MOCK_PLANT_ASSETS.filter((a) => {
    const matchesSearch = 
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.tag.toLowerCase().includes(search.toLowerCase()) ||
      a.sector.toLowerCase().includes(search.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Contadores de status da planta
  const healthyCount = MOCK_PLANT_ASSETS.filter((a) => a.status === 'healthy').length
  const warningCount = MOCK_PLANT_ASSETS.filter((a) => a.status === 'warning').length
  const criticalCount = MOCK_PLANT_ASSETS.filter((a) => a.status === 'critical').length

  return (
    <div className="space-y-4">
      {/* Barra de Filtros & Status Semafórico Global */}
      <div className="flex flex-col gap-3 rounded-lg border border-border/80 bg-card p-4 sm:flex-row sm:items-center sm:justify-between shadow-xs">
        
        {/* Chips de Filtro Rápido Semafórico */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant={statusFilter === 'all' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('all')}
            className="text-xs h-8"
          >
            Todos ({MOCK_PLANT_ASSETS.length})
          </Button>

          <Button
            size="sm"
            variant={statusFilter === 'healthy' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('healthy')}
            className={`text-xs h-8 gap-1.5 ${
              statusFilter === 'healthy' ? 'bg-emerald-600 hover:bg-emerald-600' : 'text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Saudáveis ({healthyCount})</span>
          </Button>

          <Button
            size="sm"
            variant={statusFilter === 'warning' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('warning')}
            className={`text-xs h-8 gap-1.5 ${
              statusFilter === 'warning' ? 'bg-amber-600 hover:bg-amber-600' : 'text-amber-600 border-amber-500/30 hover:bg-amber-500/10'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            <span>Alerta ({warningCount})</span>
          </Button>

          <Button
            size="sm"
            variant={statusFilter === 'critical' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('critical')}
            className={`text-xs h-8 gap-1.5 ${
              statusFilter === 'critical' ? 'bg-rose-600 hover:bg-rose-600' : 'text-rose-600 border-rose-500/30 hover:bg-rose-500/10'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-rose-500" />
            <span>Crítico ({criticalCount})</span>
          </Button>
        </div>

        {/* Campo de Busca Rápida */}
        <div className="relative w-full sm:w-[240px]">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Buscar por tag, nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 text-xs h-8"
          />
        </div>
      </div>

      {/* Grid de Cards de Ativos Industriais */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {filteredAssets.map((asset) => {
          const isSelected = asset.id === selectedAssetId
          const scenario = SCENARIOS_DICTIONARY[asset.scenarioId]

          return (
            <Card
              key={asset.id}
              className={`cursor-pointer transition-all hover:shadow-md border-2 ${
                isSelected
                  ? 'border-primary shadow-sm bg-muted/10'
                  : 'border-border/80 hover:border-border'
              }`}
              onClick={() => onSelectAsset(asset)}
            >
              <CardHeader className="p-4 pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <Badge variant="outline" className="font-mono text-[10px] text-muted-foreground">
                      {asset.tag}
                    </Badge>
                    <CardTitle className="text-sm font-bold leading-snug line-clamp-1">
                      {asset.name}
                    </CardTitle>
                    <CardDescription className="text-[11px] line-clamp-1">
                      {asset.sector}
                    </CardDescription>
                  </div>

                  {/* Health Score Mini Ring */}
                  <div className="flex flex-col items-center justify-center shrink-0">
                    <span className={`font-mono text-base font-semibold ${
                      asset.healthScore >= 80 ? 'text-emerald-500' : asset.healthScore >= 40 ? 'text-amber-500' : 'text-rose-500'
                    }`}>
                      {asset.healthScore}%
                    </span>
                    <span className="text-[9px] uppercase tracking-wider text-muted-foreground">
                      Saúde
                    </span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-4 pt-2 space-y-3">
                {/* Métricas Chave do Ativo */}
                <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted/30 p-2.5 text-xs">
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Vibração Global</span>
                    <span className={`font-mono font-bold text-sm ${
                      asset.velocityRms > 4.5 ? 'text-rose-500' : asset.velocityRms > 2.8 ? 'text-amber-500' : 'text-foreground'
                    }`}>
                      {asset.velocityRms.toFixed(2)} mm/s
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-muted-foreground block">Temp. Mancal</span>
                    <span className={`font-mono font-bold text-sm ${
                      asset.temperatureC > 70 ? 'text-rose-500' : 'text-foreground'
                    }`}>
                      {asset.temperatureC.toFixed(1)} °C
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-muted-foreground block">Rotação</span>
                    <span className="font-mono font-bold text-sm text-foreground">
                      {asset.nominalRpm} RPM
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-muted-foreground block">Horímetro</span>
                    <span className="font-mono font-bold text-sm text-foreground">
                      {asset.hoursRunningTotal}h
                    </span>
                  </div>
                </div>

                {/* Footer do Card */}
                <div className="flex items-center justify-between text-xs pt-1 border-t border-border/60">
                  <span className="text-[11px] text-muted-foreground truncate max-w-[170px]">
                    {scenario.insights.rootCause}
                  </span>
                  
                  <div className="flex items-center gap-1 font-semibold text-primary text-[11px]">
                    <span>Analisar</span>
                    <ArrowUpRight className="h-3 w-3" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
