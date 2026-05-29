'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ShieldCheck, Loader2, Building2, Key } from 'lucide-react'
import { apiClient } from '@/lib/api/client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'

export default function ClientPortalLoginPage() {
    const [cnpj, setCnpj] = useState('')
    const [token, setToken] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const locale = useLocale()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await apiClient.post<any>('/public/portal/login', { cnpj, token })
            
            // Salva os dados do portal e o branding
            localStorage.setItem('portal_client', JSON.stringify(res.client))
            localStorage.setItem('portal_branding', JSON.stringify(res.branding))
            localStorage.setItem('portal_token', res.auth_token)
            
            toast.success(`Bem-vindo, ${res.client.name}!`)
            router.push(`/${locale}/portal/dashboard`)
        } catch (error: any) {
            toast.error(error.message || "Acesso negado. Verifique o CNPJ e o Código.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
            <Card className="max-w-md w-full shadow-2xl border-primary/10">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 bg-primary/5 w-16 h-16 rounded-2xl flex items-center justify-center border border-primary/10 shadow-inner">
                        <ShieldCheck className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Portal do Cliente</CardTitle>
                    <CardDescription>Consulte seus certificados de calibração de forma segura.</CardDescription>
                </CardHeader>
                <form onSubmit={handleLogin}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="cnpj">CNPJ da Empresa</Label>
                            <div className="relative">
                                <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    id="cnpj" 
                                    placeholder="00.000.000/0000-00" 
                                    className="pl-9"
                                    value={cnpj}
                                    onChange={e => setCnpj(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="token">Código de Acesso</Label>
                            <div className="relative">
                                <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    id="token" 
                                    type="password"
                                    placeholder="Informe o token do laboratório" 
                                    className="pl-9"
                                    value={token}
                                    onChange={e => setToken(e.target.value)}
                                    required
                                />
                            </div>
                            <p className="text-[10px] text-muted-foreground italic">
                                Este código está impresso nos seus certificados físicos.
                            </p>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full h-11" type="submit" disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Acessar Documentos"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
