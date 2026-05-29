'use client'

import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/routing'

interface MetrologyLayoutProps {
  children: ReactNode
}

export default function MetrologyLayout({ children }: MetrologyLayoutProps) {
  return (
    <div>
      {/* Module content */}
      {children}
    </div>
  )
}
