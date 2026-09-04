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

    const echo = new Echo({
      broadcaster: 'reverb',
      key: process.env.NEXT_PUBLIC_REVERB_KEY,
      wsHost: process.env.NEXT_PUBLIC_REVERB_HOST || window.location.hostname,
      wsPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT) || 80,
      wssPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT) || 443,
      forceTLS: process.env.NEXT_PUBLIC_REVERB_SCHEME === 'https',
      enabledTransports: ['ws', 'wss'],
      // Desativa autenticação para canais públicos se necessário, 
      // ou configura se formos usar canais privados futuramente.
      // authEndpoint: `${process.env.NEXT_PUBLIC_API_URL}/broadcasting/auth`,
    })

    setEchoInstance(echo)

    return () => {
      echo.disconnect()
    }
  }, [])

  return (
    <EchoContext.Provider value={{ echo: echoInstance }}>
      {children}
    </EchoContext.Provider>
  )
}

export const useEcho = () => useContext(EchoContext)
