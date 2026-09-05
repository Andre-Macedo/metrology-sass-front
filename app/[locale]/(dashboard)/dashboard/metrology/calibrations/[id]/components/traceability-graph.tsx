"use client"

import { useCallback } from 'react'
import {
    ReactFlow,
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    type Connection,
    type Edge,
    type Node,
    Position,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useTraceabilityChain } from '@/app/[locale]/(dashboard)/dashboard/metrology/calibrations/hooks/use-calibrations'
import { Loader2, AlertCircle } from 'lucide-react'

// Custom Node Component (Optional - using default for MVP)
// const CustomNode = ({ data }: any) => { ... }

interface TraceabilityGraphProps {
    calibrationId: string
}

export function TraceabilityGraph({ calibrationId }: TraceabilityGraphProps) {
    const { data, isLoading, error } = useTraceabilityChain(calibrationId)

    // React Flow state
    // Note: In a real app, we would use useEffect to setNodes/setEdges when data arrives
    // and use dagre to calculate layout. For this MVP, we rely on backend positions or simple layout.
    
    if (isLoading) return <div className="flex h-[400px] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
    
    if (error || !data) return (
        <div className="flex h-[400px] items-center justify-center text-muted-foreground flex-col gap-2">
            <AlertCircle className="h-8 w-8" />
            <p>Failed to load traceability chain.</p>
        </div>
    )

    return (
        <div className="h-[500px] border rounded-lg bg-slate-50">
            <ReactFlow
                nodes={data.nodes.map(n => ({
                    ...n,
                    // Style adjustments based on type
                    style: n.type === 'instrument' 
                        ? { background: '#fff', border: '2px solid #3b82f6', borderRadius: '8px', padding: '10px', width: 200 }
                        : { background: n.data.is_external ? '#f0f9ff' : '#fff', border: n.data.is_external ? '1px dashed #0369a1' : '1px solid #64748b', borderRadius: '4px', padding: '10px', width: 200 },
                    data: { 
                        label: (
                            <div className="text-center">
                                <div className="font-bold text-sm leading-tight">{n.data.label}</div>
                                <div className="text-[10px] text-primary font-medium mt-1">{n.data.provider}</div>
                                <div className="text-[10px] text-muted-foreground mt-1">Cert: {n.data.sublabel}</div>
                                <div className="text-[10px] text-slate-500">{n.data.date}</div>
                            </div>
                        ) 
                    },
                    type: 'default'
                }))}
                edges={data.edges}
                fitView
            >
                <Controls />
                <MiniMap />
                <Background gap={12} size={1} />
            </ReactFlow>
        </div>
    )
}
