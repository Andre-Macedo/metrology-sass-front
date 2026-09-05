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
import { 
    FileDown, 
    LogOut, 
    Search, 
    Gauge, 
    Building2, 
    Archive, 
    CheckCircle2, 
    AlertTriangle, 
    XCircle, 
    Clock, 
    Loader2 
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { apiClient } from '@/lib/api/client'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { toast } from 'sonner'

export default function ClientPortalDashboard() {
    const [certificates, setCertificates] = useState<any[]>([])
    const [instruments, setInstruments] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [branding, setBranding] = useState<any>(null)
    const [client, setClient] = useState<any>(null)
    const [search, setSearch] = useState('')
    const [activeTab, setActiveTab] = useState<'certificates' | 'instruments'>('certificates')
    const [selectedCertIds, setSelectedCertIds] = useState<string[]>([])
    const [isDownloadingZip, setIsDownloadingZip] = useState(false)
    const [downloadingCertId, setDownloadingCertId] = useState<string | null>(null)
    
    const router = useRouter()
    const locale = useLocale()

    useEffect(() => {
        const storedClient = localStorage.getItem('portal_client')
        const storedBranding = localStorage.getItem('portal_branding')
        const storedToken = localStorage.getItem('portal_token')
        
        if (!storedClient || !storedBranding || !storedToken) {
            router.push(`/${locale}/portal`)
            return
        }

        setClient(JSON.parse(storedClient))
        setBranding(JSON.parse(storedBranding))

        const fetchData = async () => {
            try {
                const [certsRes, instsRes] = await Promise.all([
                    apiClient.get<any[]>('/public/portal/certificates'),
                    apiClient.get<any[]>('/public/portal/instruments'),
                ])
                setCertificates(certsRes || [])
                setInstruments(instsRes || [])
            } catch (error) {
                console.error("Failed to fetch portal data", error)
                toast.error("Erro ao carregar dados do portal.")
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [router, locale])

    const handleLogout = () => {
        localStorage.removeItem('portal_client')
        localStorage.removeItem('portal_branding')
        localStorage.removeItem('portal_token')
        toast.info("Você saiu do portal.")
        router.push(`/${locale}/portal`)
    }

    const filteredCerts = certificates.filter(c => 
        (c.certificate_code && c.certificate_code.toLowerCase().includes(search.toLowerCase())) ||
        (c.instrument && c.instrument.toLowerCase().includes(search.toLowerCase())) || 
        (c.serial_number && c.serial_number.toLowerCase().includes(search.toLowerCase())) ||
        (c.id && c.id.toLowerCase().includes(search.toLowerCase()))
    )

    const filteredInstruments = instruments.filter(i => 
        (i.name && i.name.toLowerCase().includes(search.toLowerCase())) ||
        (i.serial_number && i.serial_number.toLowerCase().includes(search.toLowerCase())) ||
        (i.tag && i.tag.toLowerCase().includes(search.toLowerCase())) ||
        (i.type && i.type.toLowerCase().includes(search.toLowerCase()))
    )

    const handleSelectAllCerts = () => {
        if (selectedCertIds.length === filteredCerts.length) {
            setSelectedCertIds([])
        } else {
            setSelectedCertIds(filteredCerts.map(c => c.id))
        }
    }

    const handleToggleCert = (id: string) => {
        setSelectedCertIds(prev => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        )
    }

    const handleDownloadSingle = async (cert: any) => {
        setDownloadingCertId(cert.id)
        try {
            const blob = await apiClient.getBlob(`/public/portal/certificates/${cert.id}/download`)
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', `Certificado_${cert.certificate_code || cert.id}.pdf`)
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(url)
            toast.success(`Certificado ${cert.certificate_code || cert.id} baixado.`)
        } catch (error) {
            toast.error("Erro ao realizar o download do certificado.")
        } finally {
            setDownloadingCertId(null)
        }
    }

    const handleDownloadZip = async () => {
        if (selectedCertIds.length === 0) {
            toast.error("Selecione pelo menos um certificado na tabela.")
            return
        }

        setIsDownloadingZip(true)
        try {
            const blob = await apiClient.postBlob('/public/portal/certificates/download-zip', {
                ids: selectedCertIds
            })
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            const sanitizedClientName = client?.name ? client.name.replace(/[^a-zA-Z0-9_-]/g, '_') : 'Certificados'
            link.setAttribute('download', `Certificados_${sanitizedClientName}.zip`)
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(url)
            toast.success(`Pacote com ${selectedCertIds.length} certificados baixado com sucesso!`)
        } catch (error) {
            toast.error("Erro ao gerar pacote ZIP de certificados.")
        } finally {
            setIsDownloadingZip(false)
        }
    }

    // Contadores de status de instrumentos
    const validCount = instruments.filter(i => i.status === 'valid').length
    const expiringSoonCount = instruments.filter(i => i.status === 'expiring_soon').length
    const expiredCount = instruments.filter(i => i.status === 'expired').length

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
                            <p className="text-xs text-muted-foreground uppercase font-bold tracking-tighter">Portal do Cliente B2B</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-right hidden md:block">
                            <p className="text-sm font-medium">{client?.name}</p>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                                CNPJ: {client?.cnpj || 'Identificado'}
                            </p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={handleLogout} title="Sair do Portal">
                            <LogOut className="h-5 w-5 text-slate-500" />
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* KPI Cards de Resumo */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <Card className="shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">Total Certificados</CardTitle>
                            <FileDown className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{certificates.length}</div>
                            <p className="text-xs text-muted-foreground mt-1">Documentos digitais válidos</p>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">Calibração em Dia</CardTitle>
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-600">{validCount}</div>
                            <p className="text-xs text-muted-foreground mt-1">Conformidade assegurada</p>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">Vencendo em Breve</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-500">{expiringSoonCount}</div>
                            <p className="text-xs text-muted-foreground mt-1">Próximos 30 dias</p>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">Calibrações Vencidas</CardTitle>
                            <XCircle className="h-4 w-4 text-rose-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-rose-600">{expiredCount}</div>
                            <p className="text-xs text-muted-foreground mt-1">Requer ação imediata</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Abas e Barra de Ações */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-2">
                        <Button 
                            variant={activeTab === 'certificates' ? 'default' : 'outline'}
                            onClick={() => setActiveTab('certificates')}
                            className="font-medium"
                        >
                            <FileDown className="mr-2 h-4 w-4" />
                            Certificados ({certificates.length})
                        </Button>
                        <Button 
                            variant={activeTab === 'instruments' ? 'default' : 'outline'}
                            onClick={() => setActiveTab('instruments')}
                            className="font-medium"
                        >
                            <Gauge className="mr-2 h-4 w-4" />
                            Meus Instrumentos ({instruments.length})
                        </Button>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Filtrar por código, tag, serial..." 
                                className="pl-9 h-10"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>

                        {activeTab === 'certificates' && (
                            <Button 
                                variant="outline" 
                                onClick={handleDownloadZip}
                                disabled={selectedCertIds.length === 0 || isDownloadingZip}
                                className="h-10 bg-white dark:bg-slate-900 border-primary/20 hover:bg-primary/5 text-primary"
                            >
                                {isDownloadingZip ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Archive className="mr-2 h-4 w-4" />
                                )}
                                Baixar Pacote ZIP ({selectedCertIds.length})
                            </Button>
                        )}
                    </div>
                </div>

                {/* Conteúdo da Aba 1: Certificados */}
                {activeTab === 'certificates' && (
                    <Card className="border-0 shadow-md">
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                                    <TableRow>
                                        <TableHead className="w-12 text-center">
                                            <input 
                                                type="checkbox" 
                                                checked={filteredCerts.length > 0 && selectedCertIds.length === filteredCerts.length}
                                                onChange={handleSelectAllCerts}
                                                className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4"
                                            />
                                        </TableHead>
                                        <TableHead className="font-bold">Cód. Certificado</TableHead>
                                        <TableHead className="font-bold">Instrumento</TableHead>
                                        <TableHead className="font-bold">S/N</TableHead>
                                        <TableHead className="font-bold">Data Calibração</TableHead>
                                        <TableHead className="font-bold">Próx. Vencimento</TableHead>
                                        <TableHead className="font-bold">Resultado</TableHead>
                                        <TableHead className="text-right font-bold">Download</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow><TableCell colSpan={8} className="text-center py-12 text-muted-foreground animate-pulse">Carregando seus documentos...</TableCell></TableRow>
                                    ) : filteredCerts.length === 0 ? (
                                        <TableRow><TableCell colSpan={8} className="text-center py-12 text-muted-foreground">Nenhum certificado disponível com esses filtros.</TableCell></TableRow>
                                    ) : filteredCerts.map((cert) => (
                                        <TableRow key={cert.id} className="hover:bg-slate-50/50 transition-colors">
                                            <TableCell className="text-center">
                                                <input 
                                                    type="checkbox" 
                                                    checked={selectedCertIds.includes(cert.id)}
                                                    onChange={() => handleToggleCert(cert.id)}
                                                    className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4"
                                                />
                                            </TableCell>
                                            <TableCell className="font-mono text-xs font-bold text-primary">
                                                {cert.certificate_code || cert.id}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    <Gauge className="h-3 w-3 text-muted-foreground" />
                                                    {cert.instrument}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">{cert.serial_number}</TableCell>
                                            <TableCell>{cert.date}</TableCell>
                                            <TableCell className="text-muted-foreground">{cert.next_due_date || 'N/A'}</TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${
                                                    cert.result_value === 'approved' 
                                                        ? 'bg-emerald-100 text-emerald-700' 
                                                        : cert.result_value === 'approved_with_restrictions'
                                                        ? 'bg-amber-100 text-amber-700'
                                                        : 'bg-rose-100 text-rose-700'
                                                }`}>
                                                    {cert.result}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button 
                                                    size="sm" 
                                                    variant="ghost" 
                                                    className="h-8 w-8 p-0 text-primary hover:text-primary/80"
                                                    disabled={downloadingCertId === cert.id}
                                                    onClick={() => handleDownloadSingle(cert)}
                                                    title="Baixar PDF assinado"
                                                >
                                                    {downloadingCertId === cert.id ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <FileDown className="h-5 w-5" />
                                                    )}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}

                {/* Conteúdo da Aba 2: Meus Instrumentos */}
                {activeTab === 'instruments' && (
                    <Card className="border-0 shadow-md">
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                                    <TableRow>
                                        <TableHead className="font-bold">Instrumento</TableHead>
                                        <TableHead className="font-bold">S/N</TableHead>
                                        <TableHead className="font-bold">Tag / Setor</TableHead>
                                        <TableHead className="font-bold">Tipo</TableHead>
                                        <TableHead className="font-bold">Status de Validade</TableHead>
                                        <TableHead className="font-bold">Última Calibração</TableHead>
                                        <TableHead className="font-bold">Vencimento</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground animate-pulse">Carregando instrumentos...</TableCell></TableRow>
                                    ) : filteredInstruments.length === 0 ? (
                                        <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground">Nenhum instrumento localizado.</TableCell></TableRow>
                                    ) : filteredInstruments.map((inst) => (
                                        <TableRow key={inst.id} className="hover:bg-slate-50/50 transition-colors">
                                            <TableCell className="font-semibold text-slate-900 dark:text-white">
                                                <div className="flex items-center gap-2">
                                                    <Gauge className="h-4 w-4 text-primary" />
                                                    {inst.name}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground font-mono text-xs">{inst.serial_number || 'N/A'}</TableCell>
                                            <TableCell>{inst.tag || 'Geral'}</TableCell>
                                            <TableCell className="text-muted-foreground">{inst.type || 'N/D'}</TableCell>
                                            <TableCell>
                                                {inst.status === 'valid' && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                                                        <CheckCircle2 className="h-3 w-3" /> Em Dia
                                                    </span>
                                                )}
                                                {inst.status === 'expiring_soon' && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                                                        <Clock className="h-3 w-3" /> Vence em 30d
                                                    </span>
                                                )}
                                                {inst.status === 'expired' && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
                                                        <XCircle className="h-3 w-3" /> Vencido
                                                    </span>
                                                )}
                                                {inst.status === 'unknown' && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">
                                                        Não calibrado
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-xs">{inst.last_calibration || 'Nenhuma'}</TableCell>
                                            <TableCell className="font-semibold text-xs">{inst.calibration_due || 'N/A'}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}
            </main>

            <footer className="max-w-7xl mx-auto px-4 py-12 text-center text-[10px] text-muted-foreground uppercase tracking-widest opacity-50">
                Powered by Amemiya Metrology SaaS &copy; 2026
            </footer>
        </div>
    )
}
