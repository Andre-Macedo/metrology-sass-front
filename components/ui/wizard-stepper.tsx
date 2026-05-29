"use client"

import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface WizardStep {
    id: string;
    title: string;
    description?: string;
}

interface WizardStepperProps {
    steps: WizardStep[];
    currentStep: number;
}

export function WizardStepper({ steps, currentStep }: WizardStepperProps) {
    return (
        <div className="relative after:absolute after:inset-x-0 after:top-1/2 after:block after:h-0.5 after:-translate-y-1/2 after:rounded-lg after:bg-muted">
            <ol className="relative z-10 flex justify-between text-sm font-medium text-muted-foreground">
                {steps.map((step, index) => {
                    const isCompleted = index < currentStep;
                    const isCurrent = index === currentStep;

                    return (
                        <li key={step.id} className="flex items-center gap-2 bg-background p-2">
                            <span
                                className={cn(
                                    "flex h-8 w-8 items-center justify-center rounded-full border-2",
                                    isCompleted ? "border-primary bg-primary text-primary-foreground" :
                                        isCurrent ? "border-primary text-primary" : "border-muted"
                                )}
                            >
                                {isCompleted ? <Check className="h-4 w-4" /> : index + 1}
                            </span>
                            <span className={cn("hidden sm:block", isCurrent && "text-foreground font-semibold")}>
                                {step.title}
                            </span>
                        </li>
                    )
                })}
            </ol>
        </div>
    )
}
