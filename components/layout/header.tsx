'use client'

import { Bell, Menu, LogOut, User, Settings, QrCode, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/lib/hooks/use-auth'
import { GlobalSearch } from './global-search'
import { useTranslations } from 'next-intl'
import { LanguageSwitcher } from './language-switcher'
import { NotificationCenter } from './notification-center'
import { QrScannerModal } from '../shared/qr-scanner-modal'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

interface HeaderProps {
    onMenuClick?: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
    const { user, logout, isLoggingOut, isImpersonating } = useAuth()
    const t = useTranslations('Header')
    const router = useRouter()
    const [isScannerOpen, setIsScannerOpen] = useState(false)

    const initials = user?.name
        ?.split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase() || 'U'

    const handleScan = (decodedText: string) => {
        setIsScannerOpen(false)
        if (decodedText.includes('/verify/')) {
            const id = decodedText.split('/verify/')[1]
            router.push(`/dashboard/metrology/instruments/${id}`)
        } else if (decodedText.startsWith('INST-') || (decodedText.length < 10 && !isNaN(Number(decodedText)))) {
            router.push(`/dashboard/metrology/instruments?search=${decodedText}`)
        } else {
            toast.info("Scanned: " + decodedText)
        }
    }

    return (
        <>
            {isImpersonating && (
                <div className="bg-warning py-1 px-6 flex items-center justify-between text-warning-foreground text-xs font-medium">
                    <div className="flex items-center gap-2">
                        <ShieldAlert className="h-3 w-3" />
                        <span>Modo de Suporte Ativo: Você está acessando como <strong>{user?.name}</strong></span>
                    </div>
                    <button 
                        onClick={() => logout()} 
                        className="underline hover:opacity-80 flex items-center gap-1"
                    >
                        Sair da personificação
                    </button>
                </div>
            )}
            <header className="flex h-16 items-center justify-between border-b border-border bg-background px-6">
                {/* Left side */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden"
                        onClick={onMenuClick}
                    >
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">{t('toggle_menu')}</span>
                    </Button>

                    <div className="hidden w-full md:block md:w-auto">
                        <GlobalSearch />
                    </div>
                </div>

                {/* Right side */}
                <div className="flex items-center gap-2">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setIsScannerOpen(true)}
                        className="text-muted-foreground hover:text-primary"
                        title="Scan QR Code"
                    >
                        <QrCode className="h-5 w-5" />
                    </Button>

                    <LanguageSwitcher />
                    <NotificationCenter />

                    {/* User menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="gap-2 pl-2 pr-3">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.name || 'User'} />
                                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                        {initials}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="hidden text-sm font-medium md:inline-block">
                                    {user?.name || 'User'}
                                </span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>
                                <div className="flex flex-col">
                                    <span>{user?.name}</span>
                                    <span className="text-xs font-normal text-muted-foreground">
                                        {user?.email}
                                    </span>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                                <User className="mr-2 h-4 w-4" />
                                {t('profile')}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Settings className="mr-2 h-4 w-4" />
                                {t('settings')}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => logout()}
                                disabled={isLoggingOut}
                                className="text-destructive focus:text-destructive"
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                {isLoggingOut ? t('signing_out') : t('sign_out')}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <QrScannerModal 
                    isOpen={isScannerOpen}
                    onClose={() => setIsScannerOpen(false)}
                    onScan={handleScan}
                />
            </header>
        </>
    )
}
