"use client"

import React, { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { useLegal } from "@/lib/hooks/use-legal"
import { Loader2, ShieldCheck, FileText, Lock } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface LegalModalProps {
    isOpen: boolean
}

export function LegalModal({ isOpen }: LegalModalProps) {
    const { accept, isAccepting } = useLegal()
    const [acceptedTerms, setAcceptedTerms] = useState(false)
    const [acceptedPrivacy, setAcceptedPrivacy] = useState(false)

    const handleConfirm = () => {
        if (acceptedTerms && acceptedPrivacy) {
            accept()
        }
    }

    return (
        <Dialog open={isOpen}>
            <DialogContent 
                className="sm:max-w-[600px] max-h-[90vh] flex flex-col"
                onPointerDownOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl font-bold">
                        <ShieldCheck className="h-6 w-6 text-primary" />
                        Termos e Privacidade
                    </DialogTitle>
                    <DialogDescription>
                        Para continuar utilizando a plataforma Amemiya, você precisa ler e aceitar nossos termos legais.
                    </DialogDescription>
                </DialogHeader>
                
                <ScrollArea className="flex-1 pr-4 mt-4 border rounded-md p-4 bg-muted/20">
                    <div className="space-y-6 text-sm leading-relaxed">
                        <section>
                            <h4 className="font-bold flex items-center gap-2 mb-2">
                                <FileText className="h-4 w-4" /> 1. Termos de Uso
                            </h4>
                            <p className="text-muted-foreground">
                                Ao acessar o sistema Amemiya, você concorda em cumprir estes termos de serviço, todas as leis e regulamentos aplicáveis. 
                                O sistema é uma ferramenta de suporte à metrologia e a precisão dos dados depende da correta inserção pelo técnico.
                            </p>
                        </section>

                        <section>
                            <h4 className="font-bold flex items-center gap-2 mb-2">
                                <Lock className="h-4 w-4" /> 2. Política de Privacidade
                            </h4>
                            <p className="text-muted-foreground">
                                Seus dados e os dados de sua empresa são protegidos por criptografia em repouso e em trânsito. 
                                Não compartilhamos informações técnicas de calibração com terceiros sem autorização expressa do tenant.
                            </p>
                        </section>

                        <section>
                            <h4 className="font-bold mb-2 text-xs uppercase tracking-widest opacity-70">Responsabilidade Técnica</h4>
                            <p className="text-muted-foreground italic">
                                A assinatura eletrônica realizada via senha pessoal tem validade jurídica e equivale a uma assinatura manuscrita para fins de auditoria ISO 17025.
                            </p>
                        </section>
                    </div>
                </ScrollArea>

                <div className="space-y-4 py-4">
                    <div className="flex items-start space-x-3">
                        <Checkbox 
                            id="terms" 
                            checked={acceptedTerms} 
                            onCheckedChange={(v) => setAcceptedTerms(!!v)} 
                        />
                        <div className="grid gap-1.5 leading-none">
                            <label htmlFor="terms" className="text-sm font-medium leading-none cursor-pointer">
                                Li e concordo com os <strong>Termos de Uso</strong> do sistema.
                            </label>
                        </div>
                    </div>

                    <div className="flex items-start space-x-3">
                        <Checkbox 
                            id="privacy" 
                            checked={acceptedPrivacy} 
                            onCheckedChange={(v) => setAcceptedPrivacy(!!v)} 
                        />
                        <div className="grid gap-1.5 leading-none">
                            <label htmlFor="privacy" className="text-sm font-medium leading-none cursor-pointer">
                                Li e concordo com a <strong>Política de Privacidade</strong> e proteção de dados.
                            </label>
                        </div>
                    </div>
                </div>

                <DialogFooter className="sm:justify-between items-center border-t pt-4">
                    <p className="text-[10px] text-muted-foreground max-w-[200px]">
                        Ao clicar em confirmar, registramos seu IP e data/hora para validade legal.
                    </p>
                    <Button 
                        onClick={handleConfirm} 
                        disabled={!acceptedTerms || !acceptedPrivacy || isAccepting}
                        className="px-8 shadow-lg"
                    >
                        {isAccepting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Confirmar e Acessar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
