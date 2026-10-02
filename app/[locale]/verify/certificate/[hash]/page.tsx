"use client"

import React, { useEffect, useState, useRef } from "react"
import { useParams } from "next/navigation"
import { apiClient } from "@/lib/api/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
    CheckCircle2, 
    XCircle, 
    FileText, 
    Loader2, 
    AlertTriangle, 
    ShieldCheck, 
    ShieldAlert, 
    Upload, 
    Copy, 
    Check, 
    Lock, 
    FileCheck
} from "lucide-react"

interface CertificateData {
    id: string
    certificate_code: string
    verification_hash: string
    pdf_hash: string | null
    calibration_date: string
    next_due_date: string | null
    result: string
    result_value: string
    technician: string
    approved_by: string | null
    approved_at: string | null
    deviation: number | null
    uncertainty: number | null
    instrument: {
        name: string
        serial_number: string
        tag_code: string | null
        model: string | null
        manufacturer: string | null
    }
    tenant: {
        name: string
    }
    verification_date: string
}

interface VerificationResult {
    valid: boolean
    authentic: boolean
    tampered: boolean
    message: string
    uploaded_sha256?: string
    expected_sha256?: string
}

export default function CertificateVerificationPage() {
    const params = useParams()
    const hash = params.hash as string
    
    const [certificate, setCertificate] = useState<CertificateData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    
    const [isCheckingFile, setIsCheckingFile] = useState(false)
    const [fileResult, setFileResult] = useState<VerificationResult | null>(null)
    const [copiedHash, setCopiedHash] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        const fetchCertificate = async () => {
            try {
                const response = await apiClient.get<any>(`/public/certificates/verify/${hash}`)
                if (response.valid && response.certificate) {
                    setCertificate(response.certificate)
                } else {
                    setError("Certificado não encontrado ou inválido.")
                }
            } catch (err: any) {
                console.error("Falha ao buscar certificado:", err)
                setError(err?.message || "Certificado não localizado na base pública.")
            } finally {
                setLoading(false)
            }
        }
        
        if (hash) {
            fetchCertificate()
        }
    }, [hash])

    const handleCopyHash = () => {
        if (!certificate?.pdf_hash) return
        navigator.clipboard.writeText(certificate.pdf_hash)
        setCopiedHash(true)
        setTimeout(() => setCopiedHash(false), 2500)
    }

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        setIsCheckingFile(true)
        setFileResult(null)

        try {
            const formData = new FormData()
            formData.append("file", file)
            formData.append("code", hash)

            // Chamada direta para o endpoint de integridade SHA-256
            const response = await apiClient.post<any>("/public/certificates/verify-file", formData)

            setFileResult({
                valid: response.valid,
                authentic: response.authentic,
                tampered: response.tampered,
                message: response.message,
                uploaded_sha256: response.uploaded_sha256,
                expected_sha256: response.expected_sha256,
            })
        } catch (err: any) {
            console.error("Erro na verificação do arquivo:", err)
            const data = err?.response?.data
            setFileResult({
                valid: false,
                authentic: false,
                tampered: data?.tampered ?? true,
                message: data?.message || "O arquivo PDF enviado foi modificado ou é inválido.",
                uploaded_sha256: data?.uploaded_sha256,
                expected_sha256: data?.expected_sha256 || certificate?.pdf_hash || undefined,
            })
        } finally {
            setIsCheckingFile(false)
            if (fileInputRef.current) {
                fileInputRef.current.value = ""
            }
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                <p className="text-slate-600 dark:text-slate-400 font-medium">Validando certificado na autoridade metrológica...</p>
            </div>
        )
    }

    if (error || !certificate) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
                <Card className="w-full max-w-lg border-red-200 dark:border-red-900/50 shadow-xl">
                    <CardHeader className="text-center pb-2">
                        <div className="mx-auto bg-red-100 dark:bg-red-950 p-4 rounded-full w-fit mb-4">
                            <XCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
                        </div>
                        <CardTitle className="text-xl font-bold text-red-700 dark:text-red-400">
                            Certificado Não Encontrado
                        </CardTitle>
                        <CardDescription className="text-sm mt-2">
                            O código ou hash informado (<code className="font-mono text-xs">{hash}</code>) não corresponde a nenhum certificado oficial publicado.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center pt-4">
                        <p className="text-xs text-muted-foreground">
                            Certifique-se de que o documento foi aprovado e emitido pela gestão do laboratório.
                        </p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const isApproved = certificate.result_value === "approved" || certificate.result_value === "approved_with_restrictions"

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4 flex flex-col items-center justify-center">
            <div className="w-full max-w-2xl space-y-6">
                
                {/* Card Principal do Laudo */}
                <Card className={`shadow-xl border-t-8 ${isApproved ? 'border-t-emerald-500' : 'border-t-rose-500'}`}>
                    <CardHeader className="text-center pb-4">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <Lock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                Autenticidade Registrada (ISO/IEC 17025)
                            </span>
                        </div>
                        <div className={`mx-auto p-3 rounded-full w-fit mb-3 ${isApproved ? 'bg-emerald-100 dark:bg-emerald-950' : 'bg-rose-100 dark:bg-rose-950'}`}>
                            {isApproved ? (
                                <ShieldCheck className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                                <AlertTriangle className="h-10 w-10 text-rose-600 dark:text-rose-400" />
                            )}
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            {certificate.certificate_code || `Certificado #${certificate.id.substring(0, 8)}`}
                        </h1>
                        <p className="text-xs font-mono text-muted-foreground">
                            Token: {certificate.verification_hash}
                        </p>
                        <div className="pt-2">
                            <Badge className={`text-sm px-3 py-0.5 ${isApproved ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'}`}>
                                {certificate.result}
                            </Badge>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {/* Dados do Ativo e Calibração */}
                        <div className="grid grid-cols-2 gap-4 text-sm bg-muted/30 p-4 rounded-lg border border-border/50">
                            <div>
                                <p className="text-xs text-muted-foreground uppercase font-semibold">Instrumento</p>
                                <p className="font-bold text-foreground">{certificate.instrument.name}</p>
                                <p className="text-xs font-mono text-muted-foreground">S/N: {certificate.instrument.serial_number}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground uppercase font-semibold">Laboratório Emissor</p>
                                <p className="font-bold text-foreground">{certificate.tenant.name}</p>
                                <p className="text-xs text-muted-foreground">{certificate.technician ? `Técnico: ${certificate.technician}` : ''}</p>
                            </div>
                            <div className="border-t border-border/40 pt-2">
                                <p className="text-xs text-muted-foreground uppercase font-semibold">Data da Calibração</p>
                                <p className="font-medium text-foreground">{certificate.calibration_date}</p>
                            </div>
                            <div className="border-t border-border/40 pt-2">
                                <p className="text-xs text-muted-foreground uppercase font-semibold">Próxima Calibração</p>
                                <p className="font-medium text-foreground">{certificate.next_due_date || 'Sob Demanda'}</p>
                            </div>
                        </div>

                        {/* Fingerprint Criptográfico SHA-256 */}
                        <div className="space-y-2 bg-slate-900 text-slate-100 p-4 rounded-lg border border-slate-800">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                    <Lock className="h-3.5 w-3.5 text-emerald-400" />
                                    Assinatura Criptográfica SHA-256 do Arquivo
                                </span>
                                {certificate.pdf_hash && (
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={handleCopyHash}
                                        className="h-7 text-xs text-slate-300 hover:text-white hover:bg-slate-800"
                                    >
                                        {copiedHash ? <Check className="h-3.5 w-3.5 text-emerald-400 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                                        {copiedHash ? "Copiado!" : "Copiar Hash"}
                                    </Button>
                                )}
                            </div>
                            <p className="font-mono text-[11px] break-all bg-black/40 p-2.5 rounded border border-slate-800 text-emerald-400 select-all">
                                {certificate.pdf_hash || "Hash não gerado no momento da emissão."}
                            </p>
                            <p className="text-[10px] text-slate-400">
                                Este código SHA-256 é a impressão digital matemática inalterável do arquivo oficial. Qualquer modificação de caractere, valor ou data no PDF altera completamente este hash.
                            </p>
                        </div>

                        {/* Validador Interativo Anti-Adulteração de Arquivo */}
                        <div className="space-y-3 border-t border-border pt-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                                    <FileCheck className="h-4 w-4 text-primary" />
                                    Auditoria de Integridade do Arquivo PDF
                                </h3>
                                <Badge variant="outline" className="text-[10px] font-mono">
                                    Bit-by-Bit Validation
                                </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Possui o arquivo PDF deste certificado? Envie-o abaixo para conferência matemática imediata contra o registro oficial emitido pelo laboratório:
                            </p>

                            <input 
                                type="file" 
                                ref={fileInputRef}
                                accept="application/pdf"
                                onChange={handleFileUpload}
                                className="hidden" 
                            />

                            <Button 
                                type="button"
                                variant="outline"
                                className="w-full h-16 border-dashed border-2 flex items-center justify-center gap-2 hover:bg-muted/50 cursor-pointer"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isCheckingFile}
                            >
                                {isCheckingFile ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                                        <span>Calculando SHA-256 e confrontando hashes...</span>
                                    </>
                                ) : (
                                    <>
                                        <Upload className="h-5 w-5 text-muted-foreground" />
                                        <div className="text-left">
                                            <p className="text-sm font-semibold">Clique para selecionar ou arraste o PDF do laudo</p>
                                            <p className="text-[11px] text-muted-foreground">Formatos suportados: .pdf (máx. 20MB)</p>
                                        </div>
                                    </>
                                )}
                            </Button>

                            {/* Resultado da Auditoria de Arquivo */}
                            {fileResult && (
                                <div className={`p-4 rounded-lg border text-sm space-y-2 animate-in fade-in-50 duration-200 ${
                                    fileResult.authentic 
                                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-950 dark:text-emerald-200' 
                                        : 'bg-rose-500/10 border-rose-500/40 text-rose-950 dark:text-rose-200'
                                }`}>
                                    <div className="flex items-center gap-2 font-bold text-base">
                                        {fileResult.authentic ? (
                                            <>
                                                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                                <span>DOCUMENTO 100% ÍNTEGRO & AUTÊNTICO</span>
                                            </>
                                        ) : (
                                            <>
                                                <ShieldAlert className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                                                <span>ALERTA DE ADULTERAÇÃO DETECTADA!</span>
                                            </>
                                        )}
                                    </div>
                                    <p className="text-xs leading-relaxed">
                                        {fileResult.message}
                                    </p>
                                    
                                    {!fileResult.authentic && (
                                        <div className="pt-2 border-t border-rose-500/20 space-y-1 font-mono text-[11px]">
                                            <p><span className="font-bold text-rose-600 dark:text-rose-400">Hash Esperado:</span> {fileResult.expected_sha256}</p>
                                            <p><span className="font-bold text-rose-600 dark:text-rose-400">Hash do Arquivo:</span> {fileResult.uploaded_sha256}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Rodapé Metrológico */}
                        <div className="text-center text-[11px] text-muted-foreground border-t border-border pt-4">
                            Em conformidade com a ABNT NBR ISO/IEC 17025 e FDA 21 CFR Part 11.
                            <br />
                            Auditado em: {new Date().toLocaleString()}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
