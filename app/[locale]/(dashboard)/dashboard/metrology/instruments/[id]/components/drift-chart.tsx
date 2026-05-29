'use client'

import { useState } from "react"
import { useDriftData } from "@/app/[locale]/(dashboard)/dashboard/metrology/instruments/hooks/use-instruments"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Area } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"

interface DriftChartProps {
    instrumentId: string
}

export function DriftChart({ instrumentId }: DriftChartProps) {
    const [nominalValue, setNominalValue] = useState<string>('macro')

    // We pass undefined if 'macro' is selected to fetch the general data
    const queryParam = nominalValue === 'macro' ? undefined : nominalValue
    const { data, isLoading } = useDriftData(instrumentId, queryParam)

    if (isLoading) {
        return <div className="flex h-[300px] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
    }

    if (!data) return <div>No data available</div>

    // Transform backend structure to Recharts format
    // Backend: labels: ['d1', 'd2'], datasets: [{data: [v1, v2]}, {data: [u1, u2]}]
    // Recharts: [{date: 'd1', error: v1, uncertainty: u1}, ...]
    const chartData = data.labels.map((label: string, index: number) => ({
        date: label,
        error: data.datasets[0].data[index],
        uncertainty: data.datasets[1].data[index]
    }))

    const mpe = data.mpe ? parseFloat(data.mpe) : 0

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Trend Analysis (Drift)</CardTitle>
                    <CardDescription>Monitor instrument stability over time.</CardDescription>
                </div>
                <div className="w-[200px]">
                    <Select value={nominalValue} onValueChange={setNominalValue}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select View" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="macro">Macro View (Max Error)</SelectItem>
                            {data.available_points.length > 0 && (
                                <>
                                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Specific Points</div>
                                    {data.available_points.map((point: string) => (
                                        <SelectItem key={point} value={point}>
                                            Point: {point}
                                        </SelectItem>
                                    ))}
                                </>
                            )}
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis dataKey="date" className="text-xs" />
                            <YAxis className="text-xs" label={{ value: 'Error (mm)', angle: -90, position: 'insideLeft' }} />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                                itemStyle={{ color: 'hsl(var(--foreground))' }}
                            />
                            <Legend />
                            
                            {/* Limits (MPE) */}
                            {mpe > 0 && (
                                <>
                                    <ReferenceLine y={mpe} stroke="hsl(var(--destructive))" strokeDasharray="3 3" label={{ value: '+MPE', position: 'right', fontSize: 10, fill: 'hsl(var(--destructive))' }} />
                                    <ReferenceLine y={-mpe} stroke="hsl(var(--destructive))" strokeDasharray="3 3" label={{ value: '-MPE', position: 'right', fontSize: 10, fill: 'hsl(var(--destructive))' }} />
                                </>
                            )}

                            <ReferenceLine y={0} stroke="#666" />

                            <Line
                                type="monotone"
                                dataKey="error"
                                name={nominalValue === 'macro' ? "Max Deviation" : "Error"}
                                stroke="#3b82f6"
                                activeDot={{ r: 8 }}
                                strokeWidth={2}
                            />
                            <Line
                                type="monotone"
                                dataKey="uncertainty"
                                name="Uncertainty (U)"
                                stroke="#ef4444"
                                strokeDasharray="5 5"
                                strokeWidth={2}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <div className="mt-4 text-sm text-muted-foreground flex justify-between items-center">
                    <span>
                        {nominalValue === 'macro'
                            ? "Showing the maximum deviation found in each calibration event."
                            : `Showing error evolution specifically for the ${nominalValue} test point.`
                        }
                    </span>
                    {mpe > 0 && (
                        <span className="text-xs font-mono bg-destructive/10 text-destructive px-2 py-1 rounded">
                            MPE: ±{mpe}
                        </span>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
