import type { Preview } from '@storybook/react'
import '../app/globals.css'
import { Geist, Geist_Mono } from 'next/font/google'
import { QueryProvider } from '../lib/providers/query-provider'
import React from 'react'
import { NextIntlClientProvider } from 'next-intl'
import messages from '../messages/en.json'

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

const preview: Preview = {
    parameters: {
        nextjs: {
            appDirectory: true,
        },
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },
        a11y: {
            test: 'todo'
        }
    },
    decorators: [
        (Story) => (
            <div className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
                <NextIntlClientProvider locale="en" messages={messages}>
                    <QueryProvider>
                        <Story />
                    </QueryProvider>
                </NextIntlClientProvider>
            </div>
        ),
    ],
};

export default preview;
