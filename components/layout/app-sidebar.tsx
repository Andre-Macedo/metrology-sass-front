'use client'

import React, { useState, useEffect } from "react"
import {
  LayoutDashboard,
  Gauge,
  Settings,
  Users,
  FileText,
  ChevronDown,
  Package,
  Activity,
  Monitor,
  Building2,
  AlertTriangle,
  Palette,
  CreditCard,
  MessageSquare,
  CheckCircle2,
  BookOpen,
  ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/routing'

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  children?: { title: string; href: string }[]
}

interface NavSection {
  title: string
  items: NavItem[]
}

interface AppSidebarProps {
  className?: string
}

export function AppSidebar({ className }: AppSidebarProps) {
  const pathname = usePathname()
  const t = useTranslations('Sidebar')

  const navigation: NavSection[] = [
    {
      title: t('overview'),
      items: [
        {
          title: t('dashboard'),
          href: '/dashboard',
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: t('metrology'),
      items: [
        {
          title: t('dashboard'),
          href: '/dashboard/metrology',
          icon: LayoutDashboard,
        },
        {
          title: t('instruments'),
          href: '/dashboard/metrology/instruments',
          icon: Gauge,
        },
        {
          title: t('calibrations'),
          href: '/dashboard/metrology/calibrations',
          icon: CheckCircle2,
        },
        {
          title: t('standards'),
          href: '/dashboard/metrology/standards',
          icon: Package,
        },
        {
          title: t('procedures'),
          href: '/dashboard/metrology/procedures',
          icon: FileText,
        },
        {
          title: t('work_orders'),
          href: '/dashboard/metrology/work-orders',
          icon: Package, // Or another suitable icon like ClipboardList
        },
        {
          title: t('non_conformities'),
          href: '/dashboard/metrology/non-conformities',
          icon: AlertTriangle,
        },
        {
          title: t('access_logs'),
          href: '/dashboard/metrology/access-logs',
          icon: Activity,
        },
        {
          title: t('settings'),
          href: '/dashboard/metrology/settings',
          icon: Settings,
        },
      ],
    },
    {
      title: t('system'),
      items: [
        {
          title: t('audit_logs'),
          href: '/dashboard/metrology/audit-logs',
          icon: FileText,
        },
        {
          title: t('users'),
          href: '/dashboard/system/users',
          icon: Users,
        },
        {
          title: t('stations'),
          href: '/dashboard/system/stations',
          icon: Monitor,
        },
        {
          title: t('suppliers'),
          href: '/dashboard/system/suppliers',
          icon: Building2,
        },
        {
          title: 'Branding',
          href: '/dashboard/system/branding',
          icon: Palette,
        },
        {
          title: 'Assinatura e Plano',
          href: '/dashboard/billing',
          icon: CreditCard,
        },
      ],
    },
    {
      title: 'IoT',
      items: [
        {
          title: t('iot'),
          href: '/dashboard/iot',
          icon: Activity,
        },
        {
          title: 'Gateways',
          href: '/dashboard/iot/gateways',
          icon: Monitor,
        },
        {
          title: 'Nodes / Sensores',
          href: '/dashboard/iot/nodes',
          icon: Package,
        },
      ],
    },
    {
      title: 'Suporte',
      items: [
        {
          title: 'Central de Ajuda',
          href: '/dashboard/support',
          icon: MessageSquare,
        },
      ],
    },
  ]

  return (
    <aside
      className={cn(
        'flex h-full w-60 flex-col border-r border-sidebar-border bg-sidebar',
        className
      )}
    >
      {/* Logo */}
      <div className="flex h-14 items-center border-b border-sidebar-border px-4">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-sidebar-primary font-mono text-xs font-semibold tracking-tight text-sidebar-primary-foreground transition-opacity group-hover:opacity-90">
            LT
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-sm font-semibold tracking-tight text-sidebar-foreground">
              Lean Tech
            </span>
            <span className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-sidebar-foreground/50">
              METROLOGY · IIoT
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto p-3">
        {navigation.map((section) => (
          <NavSectionComponent 
            key={section.title} 
            section={section} 
            pathname={pathname} 
          />
        ))}
      </nav>

      {/* Portal de Documentação Técnica */}
      <div className="border-t border-sidebar-border p-3">
        <a
          href={process.env.NEXT_PUBLIC_DOCS_URL || 'https://leantech.andremacedo.dev.br/docs-portal/'}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between rounded-sm border border-sidebar-border bg-sidebar-accent/35 px-2.5 py-2 text-xs font-medium text-sidebar-foreground/80 transition-colors hover:border-sidebar-primary/40 hover:bg-sidebar-accent hover:text-sidebar-foreground"
        >
          <span className="flex items-center gap-2">
            <BookOpen className="h-3.5 w-3.5 text-sidebar-primary" />
            <span>Documentação & Ajuda</span>
          </span>
          <ExternalLink className="h-3 w-3 opacity-60" />
        </a>
      </div>
    </aside>
  )
}

function NavSectionComponent({
  section,
  pathname,
}: {
  section: NavSection
  pathname: string
}) {
  // IoT e Visão Geral ficam abertos por padrão, os outros fechados
  const [isOpen, setIsOpen] = useState(section.title === 'IoT' || section.title === 'Visão Geral' || section.title === 'Overview')

  // Se algum item interno estiver ativo, força a seção a ficar aberta
  useEffect(() => {
    const hasActiveItem = section.items.some(item => 
      pathname === item.href || pathname.startsWith(item.href + '/')
    )
    if (hasActiveItem) setIsOpen(true)
  }, [pathname, section.items])

  return (
    <div className="mb-1.5">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="flex w-full items-center justify-between rounded-sm px-2.5 py-1.5 font-mono text-[11px] font-medium uppercase tracking-wider text-sidebar-foreground/45 transition-colors hover:text-sidebar-foreground/80"
          >
            {section.title}
            <ChevronDown
              className={cn(
                'h-3 w-3 transition-transform duration-200',
                isOpen && 'rotate-180'
              )}
            />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-0.5 mt-0.5">
          <ul className="space-y-0.5">
            {section.items.map((item) => (
              <NavItemComponent
                key={item.href}
                item={item}
                pathname={pathname}
              />
            ))}
          </ul>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}

function NavItemComponent({
  item,
  pathname,
}: {
  item: NavItem
  pathname: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const isActive =
    item.href === '/dashboard'
      ? pathname === item.href
      : pathname === item.href || pathname.startsWith(item.href + '/')
  const Icon = item.icon

  useEffect(() => {
    if (item.children?.some((child) => pathname.startsWith(child.href))) {
      setIsOpen(true)
    }
  }, [pathname, item.children])

  if (item.children) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              'w-full justify-between text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
              isActive && 'bg-sidebar-accent text-sidebar-accent-foreground'
            )}
          >
            <span className="flex items-center gap-3">
              <Icon className="h-4 w-4" />
              {item.title}
            </span>
            <ChevronDown
              className={cn(
                'h-4 w-4 transition-transform',
                isOpen && 'rotate-180'
              )}
            />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="ml-7 mt-1 space-y-1 border-l border-sidebar-border pl-3">
          {item.children.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              className={cn(
                'block rounded-md px-3 py-2 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                pathname === child.href &&
                'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
              )}
            >
              {child.title}
            </Link>
          ))}
        </CollapsibleContent>
      </Collapsible>
    )
  }

  return (
    <li>
      <Link
        href={item.href}
        className={cn(
          'relative flex h-8 items-center gap-2.5 rounded-sm px-2.5 text-[13px] font-medium text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent/70 hover:text-sidebar-foreground',
          isActive &&
            'bg-sidebar-accent text-sidebar-foreground before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-0.5 before:bg-sidebar-primary'
        )}
      >
        <Icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-sidebar-primary' : 'text-sidebar-foreground/60')} />
        <span className="truncate">{item.title}</span>
      </Link>
    </li>
  )
}
