import { type ReactNode } from 'react'

interface AuthLayoutProps {
  children: ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex h-screen items-center justify-center overflow-y-auto bg-muted/30">
      <div className="w-full max-w-md px-4">{children}</div>
    </div>
  )
}
