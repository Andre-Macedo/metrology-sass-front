'use client'

import React from 'react'
import { ChevronRight, Factory, Layers, Cpu, Radio, Copy, Check } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { PlantAsset } from '@/features/iot/data/tractian-mock-data'

interface AssetHierarchyBreadcrumbProps {
  asset: PlantAsset
}

export function AssetHierarchyBreadcrumb({ asset }: AssetHierarchyBreadcrumbProps) {
  const [copied, setCopied] = React.useState(false)

  const copyTag = () => {
    navigator.clipboard.writeText(asset.tag)
    setCopied(true)
    toast.success(`Tag ${asset.tag} copiada para a área de transferência!`)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/60 bg-muted/30 px-3.5 py-2 text-xs">
      <div className="flex flex-wrap items-center gap-1.5 text-muted-foreground">
        <div className="flex items-center gap-1 font-medium text-foreground">
          <Factory className="h-3.5 w-3.5 text-primary" />
          <span>{asset.plant}</span>
        </div>
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />

        <div className="flex items-center gap-1">
          <Layers className="h-3.5 w-3.5" />
          <span>{asset.sector}</span>
        </div>
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />

        <div className="flex items-center gap-1 font-medium text-foreground">
          <Cpu className="h-3.5 w-3.5 text-blue-500" />
          <span className="truncate max-w-[200px] sm:max-w-none">{asset.name}</span>
        </div>
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />

        <div className="flex items-center gap-1 font-semibold text-primary">
          <Radio className="h-3.5 w-3.5 text-emerald-500 animate-pulse" />
          <span>{asset.monitoringPoint}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={copyTag}
          className="inline-flex items-center gap-1 rounded bg-background px-2 py-0.5 font-mono text-[11px] font-semibold text-muted-foreground shadow-xs border border-border/80 transition-colors hover:text-foreground hover:bg-muted"
          title="Clique para copiar a TAG do ativo"
        >
          {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
          <span>{asset.tag}</span>
        </button>

        <Badge variant="outline" className="font-mono text-[10px] text-muted-foreground">
          Node: {asset.sensorNodeId}
        </Badge>
      </div>
    </div>
  )
}
