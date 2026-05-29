"use client"

import { useCallback } from 'react'
import {
    ReactFlow,
    MiniMap,
    Controls,
    Background,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useTraceabilityChain } from '@/features/calibrations'
import { Loader2, AlertCircle } from 'lucide-react'

interface TraceabilityGraphProps {
    calibrationId: string
}

export function TraceabilityGraph({ calibrationId }: TraceabilityGraphProps) {
    const { data, isLoading, error } = useTraceabilityChain(calibrationId)

    if (isLoading) return <div className="flex h-[400px] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
    
    if (error || !data) return (
        <div className="flex h-[400px] items-center justify-center text-muted-foreground flex-col gap-2">
            <AlertCircle className="h-8 w-8" />
            <p>Failed to load traceability chain.</p>
        </div>
    )

    return (
        <div className="h-[500px] border rounded-lg bg-slate-50/50 overflow-hidden">
            <ReactFlow
                nodes={data.nodes.map(n => ({
                    ...n,
                    style: n.type === 'instrument' 
                        ? { background: '#fff', border: '2px solid #3b82f6', borderRadius: '8px', padding: '10px', width: 200, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }
                        : { background: n.data.is_external ? '#f0f9ff' : '#fff', border: n.data.is_external ? '1px dashed #0369a1' : '1px solid #64748b', borderRadius: '4px', padding: '10px', width: 200 },
                    data: { 
                        label: (
                            <div className="text-center">
                                <div className="font-bold text-sm leading-tight text-slate-900">{n.data.label}</div>
                                {n.data.provider && <div className="text-[10px] text-primary font-medium mt-1 truncate">{n.data.provider}</div>}
                                <div className="text-[10px] text-muted-foreground mt-1">Cert: {n.data.sublabel}</div>
                                <div className="text-[10px] text-slate-500">{n.data.date}</div>
                            </div>
                        ) 
                    },
                    type: 'default'
                }))}
                edges={data.edges.map(e => ({
                    ...e,
                    animated: true,
                    style: { stroke: '#94a3b8' }
                }))}
                fitView
            >
                <Controls />
                <MiniMap nodeColor={(n) => n.type === 'instrument' ? '#3b82f6' : '#94a3b8'} />
                <Background gap={12} size={1} color="#e2e8f0" />
            </ReactFlow>
        </div>
    )
}
