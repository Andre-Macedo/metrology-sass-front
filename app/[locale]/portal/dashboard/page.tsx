'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { FileDown, LogOut, Search, Gauge, Building2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { apiClient } from '@/lib/api/client'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { downloadFile } from '@/lib/utils'

export default function ClientPortalDashboard() {
    const [certificates, setCertificates] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [branding, setBranding] = useState<any>(null)
    const [client, setClient] = useState<any>(null)
    const [search, setSearch] = useState('')
    
    const router = useRouter()
    const locale = useLocale()

    useEffect(() => {
        const storedClient = localStorage.getItem('portal_client')
        const storedBranding = localStorage.getItem('portal_branding')
        
        if (!storedClient || !storedBranding) {
            router.push(`/${locale}/portal`)
            return
        }

        setClient(JSON.parse(storedClient))
        setBranding(JSON.parse(storedBranding))

        const fetchCerts = async () => {
            try {
                const c = JSON.parse(storedClient)
                const res = await apiClient.get<any[]>(`/public/portal/clients/${c.id}/certificates`)
                setCertificates(res)
            } catch (error) {
                console.error("Failed to fetch certificates")
            } finally {
                setLoading(false)
            }
        }
        fetchCerts()
    }, [router, locale])

    const handleLogout = () => {
        localStorage.removeItem('portal_client')
        localStorage.removeItem('portal_branding')
        localStorage.removeItem('portal_token')
        router.push(`/${locale}/portal`)
    }

    const filteredCerts = certificates.filter(c => 
        c.instrument.toLowerCase().includes(search.toLowerCase()) || 
        c.serial_number.toLowerCase().includes(search.toLowerCase()) ||
        c.id.toLowerCase().includes(search.toLowerCase())
    )

    if (!branding) return null

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            {/* Header White-label */}
            <header className="bg-white dark:bg-slate-900 border-b shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {branding.lab_logo_url ? (
                            <img src={branding.lab_logo_url} alt={branding.lab_name} className="h-12 w-auto" />
                        ) : (
                            <div className="h-10 w-10 bg-primary/10 rounded flex items-center justify-center text-primary">
                                <Building2 className="h-6 w-6" />
                            </div>
                        )}
                        <div className="hidden sm:block">
                            <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                                {branding.lab_name}
                            </h1>
                            <p className="text-xs text-muted-foreground uppercase font-bold tracking-tighter">Portal do Cliente</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-right hidden md:block">
                            <p className="text-sm font-medium">{client?.name}</p>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Acesso Autorizado</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={handleLogout} title="Sair do Portal">
                            <LogOut className="h-5 w-5 text-slate-500" />
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid gap-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight">Meus Certificados</h2>
                            <p className="text-sm text-muted-foreground">Repositório digital de calibrações realizadas por {branding.lab_name}.</p>
                        </div>

                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Filtrar por instrumento ou SN..." 
                                className="pl-9"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <Card className="border-0 shadow-md">
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                                    <TableRow>
                                        <TableHead className="font-bold">Cód. Registro</TableHead>
                                        <TableHead className="font-bold">Instrumento</TableHead>
                                        <TableHead className="font-bold">S/N</TableHead>
                                        <TableHead className="font-bold">Data</TableHead>
                                        <TableHead className="font-bold">Resultado</TableHead>
                                        <TableHead className="text-right font-bold">Download</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground animate-pulse">Carregando seus documentos...</TableCell></TableRow>
                                    ) : filteredCerts.length === 0 ? (
                                        <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground">Nenhum certificado disponível.</TableCell></TableRow>
                                    ) : filteredCerts.map((cert) => (
                                        <TableRow key={cert.id} className="hover:bg-slate-50/50 transition-colors">
                                            <TableCell className="font-mono text-xs">{cert.id}</TableCell>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    <Gauge className="h-3 w-3 text-muted-foreground" />
                                                    {cert.instrument}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">{cert.serial_number}</TableCell>
                                            <TableCell>{cert.date}</TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${cert.result_value === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {cert.result}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button 
                                                    size="sm" 
                                                    variant="ghost" 
                                                    className="h-8 w-8 p-0 text-primary"
                                                    onClick={() => downloadFile(`/calibrations/${cert.id}/pdf`, `Certificado_${cert.id}.pdf`)}
                                                >
                                                    <FileDown className="h-5 w-5" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </main>

            <footer className="max-w-7xl mx-auto px-4 py-12 text-center text-[10px] text-muted-foreground uppercase tracking-widest opacity-50">
                Powered by Amemiya Industrial Systems &copy; 2026
            </footer>
        </div>
    )
}
