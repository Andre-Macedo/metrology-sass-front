'use client'

import { useState, useEffect, type ReactNode } from 'react'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { Header } from '@/components/layout/header'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/hooks/use-auth'
import { LegalModal } from '@/components/shared/legal-modal'
import AnomalyMonitor from '@/components/iot/AnomalyMonitor'

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, isLoading } = useAuth()

  // Verifica se o usuário precisa aceitar os termos
  const needsLegalAcceptance = user && !user.terms_accepted_at && !isLoading

  const [tenantSlug, setTenantSlug] = useState<string | null>(null)
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setTenantSlug(localStorage.getItem('current_tenant_slug'))
    }
  }, [])

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <AppSidebar />
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto p-6">
            {children}
        </main>
      </div>

      {/* Bloqueio Legal: Só sai daqui se aceitar */}
      <LegalModal isOpen={!!needsLegalAcceptance} />

      {/* Alertas de IoT Globais */}
      {tenantSlug && (
        <AnomalyMonitor tenantId={tenantSlug} />
      )}
    </div>
  )
}
