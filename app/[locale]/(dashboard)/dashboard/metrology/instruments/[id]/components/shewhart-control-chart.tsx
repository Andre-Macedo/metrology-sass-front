'use client'

import { useShewhartChart, ShewhartPoint } from '@/app/[locale]/(dashboard)/dashboard/metrology/instruments/intermediate-checks/hooks/use-intermediate-checks'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ReferenceLine,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, AlertTriangle, CheckCircle2, TrendingUp, Activity, HelpCircle } from "lucide-react"

interface ShewhartControlChartProps {
    instrumentId: string | number
}

interface CustomDotProps {
    cx?: number
    cy?: number
    payload?: ShewhartPoint
}

function RenderCustomDot(props: CustomDotProps) {
    const { cx, cy, payload } = props
    if (cx === undefined || cy === undefined || !payload) return null

    if (payload.is_out_of_control) {
        return (
            <g>
                <circle cx={cx} cy={cy} r={9} fill="none" stroke="#ef4444" strokeWidth={3} className="animate-ping" opacity={0.6} />
                <circle cx={cx} cy={cy} r={7} fill="#ef4444" stroke="#ffffff" strokeWidth={2} />
            </g>
        )
    }

    if (payload.result === 'failed') {
        return (
            <circle cx={cx} cy={cy} r={6} fill="#f97316" stroke="#ffffff" strokeWidth={2} />
        )
    }

    return (
        <circle cx={cx} cy={cy} r={4.5} fill="#2563eb" stroke="#ffffff" strokeWidth={1.5} />
    )
}

export function ShewhartControlChart({ instrumentId }: ShewhartControlChartProps) {
    const { data, isLoading, error } = useShewhartChart(instrumentId)

    if (isLoading) {
        return (
            <Card className="border-dashed">
                <CardContent className="flex h-56 items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mr-2" />
                    <span className="text-sm text-muted-foreground">Calculando estatística de Shewhart...</span>
                </CardContent>
            </Card>
        )
    }

    if (error || !data) {
        return null
    }

    if (!data.has_sufficient_data || !data.statistics) {
        return (
            <Card className="border-dashed border-amber-200 bg-amber-50/40 dark:bg-amber-950/10">
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-amber-600" />
                        <CardTitle className="text-base font-semibold">Carta de Controle de Shewhart (ILAC-G24 / ISO 17025 §6.4.10)</CardTitle>
                    </div>
                    <CardDescription>
                        Monitoramento estatístico de estabilidade e desvio em checagens intermediárias.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-3 text-sm text-amber-800 dark:text-amber-200">
                        <HelpCircle className="h-5 w-5 shrink-0 text-amber-600" />
                        <p>
                            Mínimo de 2 medições com desvio registradas para calcular a média (<span className="font-mono font-bold">X̄</span>) e limites de controle estatístico (<span className="font-mono font-bold">±3σ</span>). Registros atuais: <strong className="font-mono">{data.total_checks}</strong>.
                        </p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    const { statistics, points, in_control, alerts } = data
    const chartData = points.filter(p => p.deviation !== null)

    return (
        <Card className="space-y-4">
            <CardHeader className="pb-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-primary" />
                            <CardTitle className="text-lg font-bold">Carta de Controle de Shewhart (X̄ - Checagens)</CardTitle>
                        </div>
                        <CardDescription className="text-xs mt-1">
                            Avaliação contínua de estabilidade metrológica conforme Método 2 ILAC-G24 / ISO/IEC 17025 §6.4.10.
                        </CardDescription>
                    </div>

                    <div className="flex items-center gap-2">
                        {in_control ? (
                            <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1 px-3 py-1">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Processo Sob Controle (3σ)
                            </Badge>
                        ) : (
                            <Badge variant="destructive" className="font-semibold flex items-center gap-1 px-3 py-1 animate-pulse">
                                <AlertTriangle className="h-3.5 w-3.5" />
                                Fora de Controle Estatístico
                            </Badge>
                        )}
                    </div>
                </div>

                {/* KPI Metrics Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 pt-3">
                    <div className="bg-muted/50 p-2.5 rounded-lg border text-center">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground block">Média (X̄)</span>
                        <span className="text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            {statistics.mean > 0 ? `+${statistics.mean.toFixed(4)}` : statistics.mean.toFixed(4)}
                        </span>
                    </div>

                    <div className="bg-muted/50 p-2.5 rounded-lg border text-center">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground block">Desvio Padrão (s)</span>
                        <span className="text-sm font-mono font-bold text-slate-700 dark:text-slate-300">
                            {statistics.std_dev.toFixed(4)}
                        </span>
                    </div>

                    <div className="bg-muted/50 p-2.5 rounded-lg border text-center">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground block">UCL (+3σ)</span>
                        <span className="text-sm font-mono font-bold text-red-600 dark:text-red-400">
                            +{statistics.ucl.toFixed(4)}
                        </span>
                    </div>

                    <div className="bg-muted/50 p-2.5 rounded-lg border text-center">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground block">LCL (-3σ)</span>
                        <span className="text-sm font-mono font-bold text-red-600 dark:text-red-400">
                            {statistics.lcl.toFixed(4)}
                        </span>
                    </div>

                    <div className="bg-muted/50 p-2.5 rounded-lg border text-center">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground block">Advertência (±2σ)</span>
                        <span className="text-sm font-mono font-bold text-amber-600 dark:text-amber-400">
                            ±{statistics.uwl.toFixed(4)}
                        </span>
                    </div>

                    <div className="bg-muted/50 p-2.5 rounded-lg border text-center">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground block">Tolerância (±MPE)</span>
                        <span className="text-sm font-mono font-black text-purple-600 dark:text-purple-400">
                            {statistics.usl !== null ? `±${statistics.usl.toFixed(4)}` : 'N/A'}
                        </span>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Out of Control Warning Alert */}
                {alerts.length > 0 && (
                    <Alert variant="destructive" className="py-2.5">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle className="text-xs font-bold uppercase tracking-wider">
                            Desvios Detectados nas Regras de Nelson / ISO 17025
                        </AlertTitle>
                        <AlertDescription className="text-xs mt-1">
                            <ul className="list-disc pl-4 space-y-0.5">
                                {alerts.map((alert, idx) => (
                                    <li key={idx}>{alert}</li>
                                ))}
                            </ul>
                        </AlertDescription>
                    </Alert>
                )}

                {/* Shewhart Chart */}
                <div className="h-[360px] w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 15, right: 35, left: 10, bottom: 25 }}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted opacity-60" />
                            <XAxis
                                dataKey="formatted_date"
                                className="text-[11px]"
                                tick={{ fill: 'currentColor' }}
                            />
                            <YAxis
                                className="text-[11px]"
                                tick={{ fill: 'currentColor' }}
                                label={{ value: 'Desvio (e)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 11 } }}
                            />
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (!active || !payload || !payload.length) return null
                                    const pt = payload[0].payload as ShewhartPoint
                                    return (
                                        <div className="rounded-lg border bg-popover p-3 text-popover-foreground shadow-md text-xs space-y-1.5 min-w-[200px]">
                                            <div className="font-bold flex items-center justify-between border-b pb-1">
                                                <span>Data: {pt.formatted_date}</span>
                                                <Badge variant={pt.result === 'passed' ? 'default' : 'destructive'} className="text-[10px] px-1.5 py-0">
                                                    {pt.result.toUpperCase()}
                                                </Badge>
                                            </div>
                                            {pt.nominal_value !== null && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Valor Nominal:</span>
                                                    <span className="font-mono font-medium">{pt.nominal_value}</span>
                                                </div>
                                            )}
                                            {pt.measured_value !== null && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Valor Medido:</span>
                                                    <span className="font-mono font-medium">{pt.measured_value}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Desvio (Erro):</span>
                                                <span className="font-mono font-bold text-primary">
                                                    {pt.deviation !== null && (pt.deviation > 0 ? `+${pt.deviation.toFixed(4)}` : pt.deviation.toFixed(4))}
                                                </span>
                                            </div>
                                            {pt.standard_name && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Padrão:</span>
                                                    <span className="font-medium truncate max-w-[120px]">{pt.standard_name}</span>
                                                </div>
                                            )}
                                            {pt.performer_name && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Técnico:</span>
                                                    <span className="font-medium">{pt.performer_name}</span>
                                                </div>
                                            )}
                                            {pt.is_out_of_control && (
                                                <div className="mt-1 pt-1 border-t text-red-600 font-semibold text-[11px]">
                                                    ⚠️ {pt.out_of_control_reason}
                                                </div>
                                            )}
                                        </div>
                                    )
                                }}
                            />
                            <Legend
                                verticalAlign="top"
                                height={36}
                                wrapperStyle={{ fontSize: '11px', paddingBottom: '10px' }}
                            />

                            {/* Center Line (Mean) */}
                            <ReferenceLine
                                y={statistics.mean}
                                stroke="#10b981"
                                strokeWidth={2}
                                label={{ value: `X̄ = ${statistics.mean.toFixed(3)}`, position: 'right', fill: '#10b981', fontSize: 10 }}
                            />

                            {/* Control Limits (3-Sigma) */}
                            <ReferenceLine
                                y={statistics.ucl}
                                stroke="#ef4444"
                                strokeDasharray="4 4"
                                strokeWidth={1.5}
                                label={{ value: `+3σ UCL (${statistics.ucl.toFixed(3)})`, position: 'right', fill: '#ef4444', fontSize: 10 }}
                            />
                            <ReferenceLine
                                y={statistics.lcl}
                                stroke="#ef4444"
                                strokeDasharray="4 4"
                                strokeWidth={1.5}
                                label={{ value: `-3σ LCL (${statistics.lcl.toFixed(3)})`, position: 'right', fill: '#ef4444', fontSize: 10 }}
                            />

                            {/* Warning Limits (2-Sigma) */}
                            <ReferenceLine
                                y={statistics.uwl}
                                stroke="#f59e0b"
                                strokeDasharray="2 2"
                                label={{ value: `+2σ UWL`, position: 'insideTopRight', fill: '#f59e0b', fontSize: 9 }}
                            />
                            <ReferenceLine
                                y={statistics.lwl}
                                stroke="#f59e0b"
                                strokeDasharray="2 2"
                                label={{ value: `-2σ LWL`, position: 'insideBottomRight', fill: '#f59e0b', fontSize: 9 }}
                            />

                            {/* Tolerance Specification Limits (MPE) */}
                            {statistics.usl !== null && statistics.lsl !== null && (
                                <>
                                    <ReferenceLine
                                        y={statistics.usl}
                                        stroke="#8b5cf6"
                                        strokeDasharray="6 2"
                                        label={{ value: `+MPE (${statistics.usl.toFixed(3)})`, position: 'right', fill: '#8b5cf6', fontSize: 10 }}
                                    />
                                    <ReferenceLine
                                        y={statistics.lsl}
                                        stroke="#8b5cf6"
                                        strokeDasharray="6 2"
                                        label={{ value: `-MPE (${statistics.lsl.toFixed(3)})`, position: 'right', fill: '#8b5cf6', fontSize: 10 }}
                                    />
                                </>
                            )}

                            {/* Baseline Zero */}
                            <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="1 1" opacity={0.5} />

                            {/* Observed Points Line */}
                            <Line
                                type="monotone"
                                dataKey="deviation"
                                name="Desvio Observado (e)"
                                stroke="#2563eb"
                                strokeWidth={2}
                                dot={<RenderCustomDot />}
                                activeDot={{ r: 7 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
