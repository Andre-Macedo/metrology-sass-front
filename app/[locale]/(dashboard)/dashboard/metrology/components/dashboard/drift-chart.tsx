"use client"

import { useMemo, useState } from 'react'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ReferenceLine
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'

interface DriftPoint {
    date: string
    value: number
    uncertainty: number
    type: 'macro' | 'micro'
    nominal_value?: string
}

interface DriftData {
    points: DriftPoint[]
    available_nominals: string[]
}

interface DriftChartProps {
    data: DriftData
    instrumentId: string
}

export function DriftChart({ data, instrumentId }: DriftChartProps) {
    const [viewMode, setViewMode] = useState<'macro' | 'micro'>('macro')
    const [selectedNominal, setSelectedNominal] = useState<string>('')

    // Set default nominal if switching to micro and none selected
    useMemo(() => {
        if (viewMode === 'micro' && !selectedNominal && data.available_nominals.length > 0) {
            setSelectedNominal(data.available_nominals[0])
        }
    }, [viewMode, data.available_nominals, selectedNominal])

    const filteredPoints = useMemo(() => {
        if (viewMode === 'macro') {
            return data.points.filter(p => p.type === 'macro')
        } else {
            return data.points.filter(p => p.type === 'micro' && p.nominal_value === selectedNominal)
        }
    }, [data.points, viewMode, selectedNominal])

    // Calculate trend description
    const trend = useMemo(() => {
        if (filteredPoints.length < 2) return { direction: 'stable', color: 'text-muted-foreground' }
        const start = filteredPoints[0].value
        const end = filteredPoints[filteredPoints.length - 1].value
        const diff = end - start

        if (Math.abs(diff) < 0.01) return { direction: 'Stable', color: 'text-green-500' }
        return diff > 0
            ? { direction: 'Upward Drift', color: 'text-amber-500' }
            : { direction: 'Downward Drift', color: 'text-amber-500' }
    }, [filteredPoints])

    return (
        <Card className="col-span-4">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Drift Analysis</CardTitle>
                        <CardDescription>
                            Historical performance and stability tracking
                        </CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Select
                            value={viewMode}
                            onValueChange={(v: 'macro' | 'micro') => setViewMode(v)}
                        >
                            <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="View Mode" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="macro">Macro View (Avg)</SelectItem>
                                <SelectItem value="micro">Micro View (Point)</SelectItem>
                            </SelectContent>
                        </Select>

                        {viewMode === 'micro' && (
                            <Select
                                value={selectedNominal}
                                onValueChange={setSelectedNominal}
                                disabled={data.available_nominals.length === 0}
                            >
                                <SelectTrigger className="w-[120px]">
                                    <SelectValue placeholder="Nominal" />
                                </SelectTrigger>
                                <SelectContent>
                                    {data.available_nominals.map(nom => (
                                        <SelectItem key={nom} value={nom}>
                                            {nom}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="mb-4 flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <span className="font-medium">Trend:</span>
                        <span className={trend.color}>{trend.direction}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="font-medium">Datapoints:</span>
                        <span>{filteredPoints.length}</span>
                    </div>
                    {filteredPoints.length === 0 && (
                        <Badge variant="outline" className="text-muted-foreground">
                            No data available for this selection
                        </Badge>
                    )}
                </div>

                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={filteredPoints} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis
                                dataKey="date"
                                tickFormatter={(val) => format(new Date(val), 'MMM d, yyyy')}
                                className="text-xs text-muted-foreground"
                            />
                            <YAxis className="text-xs text-muted-foreground" />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}
                                labelStyle={{ color: 'var(--foreground)' }}
                                labelFormatter={(val) => format(new Date(val), 'PP')}
                            />
                            <Legend />
                            <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
                            <Line
                                type="monotone"
                                dataKey="value"
                                name="Deviation"
                                stroke="hsl(var(--primary))"
                                strokeWidth={2}
                                dot={{ r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="uncertainty"
                                name="Uncertainty (±)"
                                stroke="hsl(var(--muted-foreground))"
                                strokeDasharray="5 5"
                                strokeWidth={1}
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
