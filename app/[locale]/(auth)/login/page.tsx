'use client'

import React from "react"

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useAuth } from '@/lib/hooks/use-auth'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'

export default function LoginPage() {
  const t = useTranslations('Auth')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login, isLoggingIn, loginError } = useAuth()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    login({ email, password })
  }

  return (
    <Card className="border border-border bg-card shadow-xs rounded-md">
      <CardHeader className="space-y-1.5 text-left pb-4">
        <div className="flex items-center gap-2 pb-1">
          <div className="flex h-6 w-6 items-center justify-center rounded-sm bg-primary font-mono text-[11px] font-semibold text-primary-foreground">
            LT
          </div>
          <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            Lean Tech // Acesso ao Sistema
          </span>
        </div>
        <CardTitle className="text-lg font-semibold tracking-tight">{t('welcome_back')}</CardTitle>
        <CardDescription className="text-xs">
          {t('sign_in_subtitle')}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-3.5">
          {loginError && (
            <div className="rounded-sm border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive">
              {(loginError as Error).message || t('invalid_credentials')}
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-medium">{t('email')}</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="h-9 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-xs font-medium">{t('password')}</Label>
              <Link
                href="/forgot-password"
                className="text-xs text-muted-foreground hover:text-primary"
              >
                {t('forgot_password')}
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="h-9 text-sm"
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 pt-2">
          <Button type="submit" className="h-9 w-full text-sm font-medium" disabled={isLoggingIn}>
            {isLoggingIn && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('sign_in')}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            {t('no_account')}{' '}
            <Link href="/register" className="font-medium text-primary hover:underline">
              {t('contact_sales')}
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
