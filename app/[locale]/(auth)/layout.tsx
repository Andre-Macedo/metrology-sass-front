import { type ReactNode } from 'react'

interface AuthLayoutProps {
  children: ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="relative flex h-screen items-center justify-center overflow-y-auto bg-background">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.57_0.145_163_/_0.09),transparent_60%)]" />
      <div className="relative w-full max-w-md px-4">{children}</div>
    </div>
  )
}
