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
        'flex h-full w-64 flex-col border-r border-sidebar-border bg-sidebar',
        className
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-sidebar-border px-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Gauge className="h-6 w-6 text-sidebar-primary" />
          <span className="text-lg font-semibold text-sidebar-foreground">
            MetroLab
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 overflow-y-auto p-4">
        {navigation.map((section) => (
          <NavSectionComponent 
            key={section.title} 
            section={section} 
            pathname={pathname} 
          />
        ))}
      </nav>
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
    <div className="mb-2">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between h-8 px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            {section.title}
            <ChevronDown
              className={cn(
                'h-3 w-3 transition-transform duration-200',
                isOpen && 'rotate-180'
              )}
            />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-1 mt-1">
          <ul className="space-y-1">
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
  const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
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
          'flex items-center gap-3 rounded-md px-3 py-2 text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
          isActive &&
          'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
        )}
      >
        <Icon className="h-4 w-4" />
        {item.title}
      </Link>
    </li>
  )
}
