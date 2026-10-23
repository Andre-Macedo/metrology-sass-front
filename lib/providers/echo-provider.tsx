'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

// Necessário para o Laravel Echo funcionar com o Reverb/Pusher
if (typeof window !== 'undefined') {
  ;(window as any).Pusher = Pusher
}

interface EchoContextType {
  echo: Echo<any> | null
}

const EchoContext = createContext<EchoContextType>({ echo: null })

export function EchoProvider({ children }: { children: React.ReactNode }) {
  const [echoInstance, setEchoInstance] = useState<Echo<any> | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const reverbKey = process.env.NEXT_PUBLIC_REVERB_KEY || process.env.NEXT_PUBLIC_REVERB_APP_KEY

    if (!reverbKey) {
      console.warn('Laravel Reverb key is not configured. WebSockets disabled.')
      return
    }

    try {
      const echo = new Echo({
        broadcaster: 'reverb',
        key: reverbKey,
        wsHost: process.env.NEXT_PUBLIC_REVERB_HOST || window.location.hostname,
        wsPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT) || 80,
        wssPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT) || 443,
        forceTLS: process.env.NEXT_PUBLIC_REVERB_SCHEME === 'https',
        enabledTransports: ['ws', 'wss'],
      })

      setEchoInstance(echo)

      return () => {
        echo.disconnect()
      }
    } catch (err) {
      console.error('Failed to initialize Laravel Echo:', err)
    }
  }, [])

  return (
    <EchoContext.Provider value={{ echo: echoInstance }}>
      {children}
    </EchoContext.Provider>
  )
}

export const useEcho = () => useContext(EchoContext)
