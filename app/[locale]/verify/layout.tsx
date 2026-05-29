import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Instrument Verification | Amemiya',
    description: 'Public instrument verification page.',
    robots: {
        index: false,
        follow: false,
        nocache: true,
        googleBot: {
            index: false,
            follow: false,
            noimageindex: true,
        },
    },
}

export default function VerifyLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>
}
