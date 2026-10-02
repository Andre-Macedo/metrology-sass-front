"use client"

import { useState } from "react"
import { 
    useDigitalCertificate, 
    useUploadCertificate, 
    useDeleteCertificate 
} from "@/features/system/hooks/use-system"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { 
    ShieldCheck, 
    ShieldAlert, 
    KeyRound, 
    FileCheck2, 
    Trash2, 
    UploadCloud, 
    Loader2, 
    Eye, 
    EyeOff, 
    CheckCircle2, 
    AlertCircle,
    Building2,
    Calendar
} from "lucide-react"

export function DigitalCertificateSection() {
    const { data: cert, isLoading } = useDigitalCertificate()
    const uploadMutation = useUploadCertificate()
    const deleteMutation = useDeleteCertificate()

    const [isEditing, setIsEditing] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!file) {
            toast.error("Selecione um arquivo de certificado (.pfx ou .p12)")
            return
        }

        if (!password) {
            toast.error("Informe a senha do certificado digital")
            return
        }

        try {
            const res = await uploadMutation.mutateAsync({ file, password })
            toast.success(res.message || "Certificado digital configurado com sucesso!")
            setFile(null)
            setPassword("")
            setIsEditing(false)
        } catch (error: any) {
            toast.error(error?.message || "Falha ao processar o certificado. Verifique o arquivo e a senha.")
        }
    }

    const handleDelete = async () => {
        if (!confirm("Tem certeza que deseja remover o certificado digital do laboratório? Novos laudos voltarão a ser assinados apenas com hash SHA-256.")) {
            return
        }

        try {
            const res = await deleteMutation.mutateAsync()
            toast.success(res.message || "Certificado removido.")
            setIsEditing(false)
        } catch (error: any) {
            toast.error(error?.message || "Erro ao remover certificado.")
        }
    }

    if (isLoading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-10">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        )
    }

    const isConfigured = cert?.configured
    const isValid = cert?.is_valid
    const daysRemaining = cert?.days_remaining ?? 0

    return (
        <Card className="border-slate-200">
            <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-base font-semibold">
                            <KeyRound className="h-5 w-5 text-emerald-600" />
                            Certificado Digital X.509 (A1 / ICP-Brasil)
                        </CardTitle>
                        <CardDescription className="mt-1">
                            Assinatura criptográfica PKCS#7 para certificados de calibração e relatórios normativos (ISO/IEC 17025 e FDA 21 CFR Part 11).
                        </CardDescription>
                    </div>
                    {isConfigured && (
                        <div>
                            {isValid ? (
                                daysRemaining > 30 ? (
                                    <Badge className="bg-emerald-600 hover:bg-emerald-700 gap-1.5 py-1 px-3">
                                        <ShieldCheck className="h-3.5 w-3.5" />
                                        Ativo e Válido
                                    </Badge>
                                ) : (
                                    <Badge variant="outline" className="text-amber-700 border-amber-300 bg-amber-50 gap-1.5 py-1 px-3">
                                        <AlertCircle className="h-3.5 w-3.5" />
                                        Expira em {daysRemaining} dias
                                    </Badge>
                                )
                            ) : (
                                <Badge variant="destructive" className="gap-1.5 py-1 px-3">
                                    <ShieldAlert className="h-3.5 w-3.5" />
                                    Certificado Expirado
                                </Badge>
                            )}
                        </div>
                    )}
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Se o certificado estiver configurado e não estiver no modo de edição */}
                {isConfigured && !isEditing ? (
                    <div className="rounded-lg border bg-card p-5 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="space-y-1">
                                <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                                    <Building2 className="h-3.5 w-3.5" /> Titular / CN
                                </span>
                                <p className="font-medium text-foreground break-all">
                                    {cert?.common_name || "Laboratório Metrológico"}
                                </p>
                            </div>

                            <div className="space-y-1">
                                <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Autoridade Certificadora
                                </span>
                                <p className="font-medium text-foreground">
                                    {cert?.issuer || "ICP-Brasil"}
                                </p>
                            </div>

                            <div className="space-y-1">
                                <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                                    <Calendar className="h-3.5 w-3.5" /> Validade do Certificado
                                </span>
                                <p className="font-medium text-foreground">
                                    {cert?.valid_to ? new Date(cert.valid_to).toLocaleDateString('pt-BR') : "—"}
                                    {isValid && (
                                        <span className="text-xs text-muted-foreground ml-2">
                                            ({daysRemaining} dias restantes)
                                        </span>
                                    )}
                                </p>
                            </div>

                            <div className="space-y-1">
                                <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                                    <FileCheck2 className="h-3.5 w-3.5" /> Número de Série
                                </span>
                                <p className="font-mono text-xs text-muted-foreground break-all">
                                    {cert?.serial_number || "—"}
                                </p>
                            </div>
                        </div>

                        <div className="pt-3 border-t flex flex-wrap items-center justify-between gap-3">
                            <p className="text-xs text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1.5 rounded border border-emerald-200 flex items-center gap-1.5">
                                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                                Laudos e certificados emitidos por este tenant estão assinados criptograficamente.
                            </p>

                            <div className="flex items-center gap-2">
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => setIsEditing(true)}
                                >
                                    Substituir Certificado
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="text-destructive hover:bg-destructive/10" 
                                    onClick={handleDelete}
                                    disabled={deleteMutation.isPending}
                                >
                                    {deleteMutation.isPending ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Formulário de Upload / Substituição */
                    <form onSubmit={handleUpload} className="space-y-4">
                        {!isConfigured && (
                            <div className="rounded-lg border border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 p-4 text-xs text-blue-800 dark:text-blue-300 flex items-start gap-3">
                                <FileCheck2 className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-semibold mb-1">Nenhum certificado A1 configurado</p>
                                    <p className="text-muted-foreground">
                                        Os certificados emitidos continuam autenticados por hash SHA-256 e QR Code público. Para conformidade com assinatura digital padrão ICP-Brasil (PKCS#7), faça o upload do arquivo <code>.pfx</code> ou <code>.p12</code> do laboratório.
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="cert_file">Arquivo do Certificado (.pfx ou .p12)</Label>
                                <Input 
                                    id="cert_file"
                                    type="file"
                                    accept=".pfx,.p12,.pem"
                                    className="cursor-pointer file:cursor-pointer text-xs"
                                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                                />
                                <span className="text-xs text-muted-foreground">
                                    Formatos aceitos: PKCS#12 (.pfx, .p12) ou PEM (.pem).
                                </span>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="cert_password">Senha do Certificado Digital</Label>
                                <div className="relative">
                                    <Input 
                                        id="cert_password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Digite a senha de proteção"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                    A senha é validada de imediato via OpenSSL e criptografada com AES-256 no banco.
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-2">
                            {isConfigured && (
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    onClick={() => {
                                        setIsEditing(false)
                                        setFile(null)
                                        setPassword("")
                                    }}
                                >
                                    Cancelar
                                </Button>
                            )}
                            <Button 
                                type="submit" 
                                disabled={uploadMutation.isPending || !file || !password}
                                className="gap-2"
                            >
                                {uploadMutation.isPending ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Validando e Criptografando...
                                    </>
                                ) : (
                                    <>
                                        <UploadCloud className="h-4 w-4" />
                                        Salvar Certificado Digital
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                )}
            </CardContent>
        </Card>
    )
}
