"use client"

import { useSystemSettings, useUpdateSystemSettings } from "@/features/system/hooks/use-system"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"

export function GlobalSettingsForm() {
    const { data: settings, isLoading } = useSystemSettings()
    const updateSettings = useUpdateSystemSettings()

    const [strictEnforcement, setStrictEnforcement] = useState(false)

    useEffect(() => {
        if (settings) {
            setStrictEnforcement(settings.strict_competence_enforcement === 'true')
        }
    }, [settings])

    const handleSave = async () => {
        try {
            await updateSettings.mutateAsync({
                strict_competence_enforcement: strictEnforcement ? 'true' : 'false'
            })
            toast.success("Settings saved successfully")
        } catch (error) {
            toast.error("Failed to save settings")
        }
    }

    if (isLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-muted-foreground h-6 w-6" /></div>
    }

    return (
        <Card className="max-w-2xl">
            <CardHeader>
                <CardTitle>System & Compliance Preferences</CardTitle>
                <CardDescription>
                    Configure strict rules for calibration enforcement and quality standards.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <Label className="text-base">Strict Competence Enforcement</Label>
                        <p className="text-sm text-muted-foreground">
                            If enabled (Hard Stop), the system will actively block any calibration submission if the technician's training for that instrument type is expired or missing. If disabled (Soft Stop), it allows the calibration but logs a warning.
                        </p>
                    </div>
                    <Switch
                        checked={strictEnforcement}
                        onCheckedChange={setStrictEnforcement}
                    />
                </div>
            </CardContent>
            <CardFooter>
                <Button onClick={handleSave} disabled={updateSettings.isPending}>
                    {updateSettings.isPending ? "Saving..." : "Save Preferences"}
                </Button>
            </CardFooter>
        </Card>
    )
}
