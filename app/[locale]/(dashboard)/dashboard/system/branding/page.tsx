"use client"

import { useState, useEffect } from "react"
import { PageHeader } from "@/components/layout/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { apiClient } from "@/lib/api/client"
import { Loader2, Upload, Palette, Building2, Zap } from "lucide-react"

export default function BrandingPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [data, setData] = useState({
        lab_name: "",
        lab_address: "",
        lab_contact: "",
        certificate_footer: "",
        lab_logo_url: null as string | null,
        accent_color: "#3b82f6",
        auto_generate_work_orders: false,
        work_order_lead_days: 30
    })
    const [logoFile, setLogoFile] = useState<File | null>(null)

    useEffect(() => {
        const fetchBranding = async () => {
            try {
                const res = await apiClient.get<any>('/system/lab-identity')
                setData({
                    lab_name: res.lab_name || "",
                    lab_address: res.lab_address || "",
                    lab_contact: res.lab_contact || "",
                    certificate_footer: res.certificate_footer || "",
                    lab_logo_url: res.lab_logo_url,
                    accent_color: res.accent_color || "#3b82f6",
                    auto_generate_work_orders: res.auto_generate_work_orders === 'true',
                    work_order_lead_days: parseInt(res.work_order_lead_days) || 30
                })
            } catch (error) {
                toast.error("Failed to load settings")
            } finally {
                setIsLoading(false)
            }
        }
        fetchBranding()
    }, [])

    const handleSave = async () => {
        setIsSaving(true)
        try {
            const formData = new FormData()
            formData.append('lab_name', data.lab_name)
            formData.append('lab_address', data.lab_address)
            formData.append('lab_contact', data.lab_contact)
            formData.append('certificate_footer', data.certificate_footer)
            formData.append('accent_color', data.accent_color)
            formData.append('auto_generate_work_orders', data.auto_generate_work_orders ? 'true' : 'false')
            formData.append('work_order_lead_days', data.work_order_lead_days.toString())
            
            if (logoFile) {
                formData.append('logo', logoFile)
            }

            await apiClient.post('/system/lab-identity', formData)
            toast.success("Settings updated successfully!")
        } catch (error) {
            toast.error("Failed to save settings")
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="animate-spin" /></div>

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-12">
            <PageHeader 
                title="Laboratory & Branding Settings" 
                description="Customize your industrial environment and certificate presentation." 
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    {/* Lab Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5" /> Identification</CardTitle>
                            <CardDescription>This information will appear in the header of all issued certificates.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="lab_name">Official Lab Name</Label>
                                <Input 
                                    id="lab_name" 
                                    value={data.lab_name} 
                                    onChange={e => setData({...data, lab_name: e.target.value})} 
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lab_address">Full Address</Label>
                                <Input 
                                    id="lab_address" 
                                    value={data.lab_address} 
                                    onChange={e => setData({...data, lab_address: e.target.value})} 
                                    placeholder="St. Example, 123 - City, State"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lab_contact">Contact Info (Phone/Email)</Label>
                                <Input 
                                    id="lab_contact" 
                                    value={data.lab_contact} 
                                    onChange={e => setData({...data, lab_contact: e.target.value})} 
                                    placeholder="+55 (11) 9999-9999 | rbc@lab.com"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Operational Logistics */}
                    <Card className="border-amber-200 bg-amber-50/20">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Zap className="h-5 w-5 text-amber-600" /> Operational Logistics</CardTitle>
                            <CardDescription>Automate your workflow by generating predictive service orders.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Auto-generate Work Orders</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Automatically create a "Scheduled" OS when an instrument is near expiration.
                                    </p>
                                </div>
                                <Switch 
                                    checked={data.auto_generate_work_orders} 
                                    onCheckedChange={checked => setData({...data, auto_generate_work_orders: checked})} 
                                />
                            </div>

                            {data.auto_generate_work_orders && (
                                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                    <Label htmlFor="lead_days">Days before expiration</Label>
                                    <div className="flex items-center gap-3">
                                        <Input 
                                            id="lead_days" 
                                            type="number" 
                                            className="w-24"
                                            value={data.work_order_lead_days} 
                                            onChange={e => setData({...data, work_order_lead_days: parseInt(e.target.value) || 0})} 
                                        />
                                        <span className="text-sm text-muted-foreground text-amber-700 font-medium">days before calibration is due.</span>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Legal Footer */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Compliance Disclaimer</CardTitle>
                            <CardDescription>Legal text for the bottom of your PDF certificates.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Label htmlFor="footer">Footer Text</Label>
                                <Textarea 
                                    id="footer" 
                                    value={data.certificate_footer} 
                                    onChange={e => setData({...data, certificate_footer: e.target.value})} 
                                    className="min-h-[100px]"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Brand Sidebar */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Logo & Identity</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <Label>Laboratory Logo</Label>
                                <div className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center bg-muted/30">
                                    {data.lab_logo_url ? (
                                        <img src={data.lab_logo_url} alt="Lab Logo" className="max-h-24 mb-4" />
                                    ) : (
                                        <div className="h-20 w-20 rounded bg-muted flex items-center justify-center mb-4">
                                            <Upload className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                    )}
                                    <Input 
                                        type="file" 
                                        accept="image/*" 
                                        className="text-xs" 
                                        onChange={e => setLogoFile(e.target.files?.[0] || null)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t">
                                <Label className="flex items-center gap-2"><Palette className="h-4 w-4" /> Brand Color</Label>
                                <div className="flex items-center gap-3">
                                    <Input 
                                        type="color" 
                                        value={data.accent_color} 
                                        onChange={e => setData({...data, accent_color: e.target.value})}
                                        className="w-12 h-10 p-1 rounded cursor-pointer border-0"
                                    />
                                    <Input 
                                        value={data.accent_color} 
                                        onChange={e => setData({...data, accent_color: e.target.value})}
                                        className="font-mono text-sm"
                                    />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" onClick={handleSave} disabled={isSaving}>
                                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Settings
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    )
}
