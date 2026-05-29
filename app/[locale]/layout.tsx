import React from "react"
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { QueryProvider } from '@/lib/providers/query-provider'
import { Toaster } from "@/components/ui/sonner"
import {EchoProvider} from "@/lib/providers/echo-provider";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import '../globals.css'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Index' });

  return {
    title: {
      default: t('meta_title'),
      template: `%s | MetroLab`,
    },
    description: t('meta_description'),
    generator: 'v0.app',
    icons: {
      icon: [
        {
          url: '/icon-light-32x32.png',
          media: '(prefers-color-scheme: light)',
        },
        {
          url: '/icon-dark-32x32.png',
          media: '(prefers-color-scheme: dark)',
        },
        {
          url: '/icon.svg',
          type: 'image/svg+xml',
        },
      ],
      apple: '/apple-icon.png',
    },
  }
}

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  // getMessages is called without arguments. It will automatically
  // use the locale from the middleware.
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <QueryProvider>
            <EchoProvider>
              {children}
              <Toaster />
            </EchoProvider>
          </QueryProvider>
          <Analytics />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
