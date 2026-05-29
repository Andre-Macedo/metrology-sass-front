"use client"

import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, ShieldCheck } from "lucide-react"

interface SignatureModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: (password: string) => void
    isLoading?: boolean
    title?: string
    description?: string
}

export function SignatureModal({ 
    isOpen, 
    onClose, 
    onConfirm, 
    isLoading,
    title = "Electronic Signature Required",
    description = "By entering your password, you are legally and technically signing this document in compliance with FDA 21 CFR Part 11 and ISO 17025."
}: SignatureModalProps) {
    const [password, setPassword] = useState("")

    const handleConfirm = (e: React.FormEvent) => {
        e.preventDefault()
        if (!password) return
        onConfirm(password)
    }

    // Reset password field when modal opens/closes
    if (!isOpen && password !== "") {
        setPassword("")
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleConfirm}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-primary">
                            <ShieldCheck className="h-5 w-5" />
                            {title}
                        </DialogTitle>
                        <DialogDescription className="pt-2 text-sm">
                            {description}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-6">
                        <div className="space-y-2">
                            <Label htmlFor="password">Your Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your login password to sign"
                                required
                                autoFocus
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading || !password}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Signing...
                                </>
                            ) : (
                                "Sign & Approve"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
