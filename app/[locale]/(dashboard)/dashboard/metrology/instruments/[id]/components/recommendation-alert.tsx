"use client"

import { useCalibrationRecommendation, useUpdateInstrument } from "@/app/[locale]/(dashboard)/dashboard/metrology/instruments/hooks/use-instruments"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { ShieldCheck, TrendingUp, TrendingDown, AlertTriangle, Loader2, Info } from "lucide-react"
import { toast } from "sonner"

interface RecommendationAlertProps {
    instrumentId: string
    currentFrequency: number
}

import { Badge } from "@/components/ui/badge"
import { ArrowRight, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export function RecommendationAlert({ instrumentId, currentFrequency }: RecommendationAlertProps) {
    const { data: recommendation, isLoading } = useCalibrationRecommendation(instrumentId)
    const updateInstrument = useUpdateInstrument()

    if (isLoading) return null
    if (!recommendation) return null

    const handleAccept = () => {
        updateInstrument.mutate({
            id: instrumentId,
            data: { calibration_frequency: recommendation.suggested_interval }
        }, {
            onSuccess: () => {
                toast.success(`Frequency updated to ${recommendation.suggested_interval} months`)
            },
            onError: () => {
                toast.error("Failed to update frequency.")
            }
        })
    }

    // Determine styles based on recommendation type
    let config = {
        label: 'Recommendation',
        borderColor: 'border-blue-200',
        accentColor: 'bg-blue-600',
        textColor: 'text-blue-700',
        bgColor: 'bg-blue-50/50',
        btnText: 'Apply Recommendation',
        icon: Info
    }

    if (recommendation.type === 'increase') {
        config = {
            label: 'Opportunity',
            borderColor: 'border-emerald-200',
            accentColor: 'bg-emerald-600',
            textColor: 'text-emerald-700',
            bgColor: 'bg-emerald-50/50',
            btnText: 'Extend Interval',
            icon: ShieldCheck
        }
    } else if (recommendation.type === 'decrease') {
        config = {
            label: 'Risk Warning',
            borderColor: 'border-red-200',
            accentColor: 'bg-red-600',
            textColor: 'text-red-700',
            bgColor: 'bg-red-50/50',
            btnText: 'Reduce Interval (Safety)',
            icon: AlertTriangle
        }
    }

    const Icon = config.icon

    return (
        <div className={cn(
            "mb-8 rounded-xl border p-5 shadow-sm transition-all",
            config.borderColor,
            config.bgColor
        )}>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                {/* Left Section: Context & Description */}
                <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                        <div className={cn("p-1.5 rounded-lg text-white", config.accentColor)}>
                            <Icon className="h-4 w-4" />
                        </div>
                        <span className={cn("text-xs font-bold uppercase tracking-widest", config.textColor)}>
                            Smart Analysis • ILAC-G24
                        </span>
                    </div>
                    
                    <div className="space-y-1">
                        <h3 className="text-lg font-bold text-foreground">
                            {recommendation.type === 'increase' ? 'Optimize Calibration Frequency' : 
                             recommendation.type === 'decrease' ? 'Urgent Interval Correction Required' : 
                             'Maintenance Recommendation'}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
                            {recommendation.reason}
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3 pt-1">
                        <Badge variant="secondary" className="bg-white/80 border-slate-200 text-slate-700">
                            Reliability: <span className={cn(
                                "ml-1 font-bold",
                                recommendation.reliability_score === 'High' ? 'text-emerald-600' : 'text-amber-600'
                            )}>{recommendation.reliability_score}</span>
                        </Badge>
                        <Badge variant="secondary" className="bg-white/80 border-slate-200 text-slate-700">
                            Drift Usage: <span className="ml-1 font-bold">{recommendation.max_limit_usage}</span>
                        </Badge>
                    </div>
                </div>

                {/* Right Section: Decision Panel */}
                <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-4 bg-white/40 p-4 rounded-xl border border-white/60 min-w-[240px]">
                    <div className="flex items-center gap-4">
                        <div className="text-center">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase">Current</p>
                            <p className="text-xl font-bold text-slate-400">{currentFrequency}m</p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-slate-300" />
                        <div className="text-center">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase">Suggested</p>
                            <p className={cn("text-3xl font-black", config.textColor)}>
                                {recommendation.suggested_interval}m
                            </p>
                        </div>
                    </div>

                    {recommendation.type !== 'maintain' && (
                        <Button
                            onClick={handleAccept}
                            disabled={updateInstrument.isPending}
                            className={cn("w-full lg:w-auto shadow-md font-bold", config.accentColor)}
                        >
                            {updateInstrument.isPending ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <ChevronRight className="mr-2 h-4 w-4" />
                            )}
                            {config.btnText}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}
