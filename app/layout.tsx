import React from "react"
import type { Metadata } from 'next'
import { Montserrat, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AviculturaChatbot } from '@/components/ai/avicultura-chatbot'
import { InstallButton } from '@/components/pwa/install-button'
import { OfflineIndicator } from '@/components/pwa/offline-indicator'
import './globals.css'

const montserrat = Montserrat({ subsets: ["latin"], variable: '--font-sans' });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'HULA AGRO - Gestão Avícola Inteligente',
  description: 'Sistema completo de gestão avícola com IA. Instale como app no seu celular.',
  generator: 'v0.app',
  applicationName: 'HULA AGRO',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'HULA AGRO',
  },
  formatDetection: {
    telephone: false,
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      {
        url: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        url: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: [
      {
        url: '/icons/icon-192.png',
        sizes: '192x192',
      },
    ],
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'mobile-web-app-status-bar-style': 'black-translucent',
    'mobile-web-app-title': 'HULA AGRO',
    'theme-color': '#283106',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className="bg-background">
      <body className={`${montserrat.variable} ${jetbrainsMono.variable} antialiased overflow-hidden`}>
        <OfflineIndicator />
        {children}
        <InstallButton />
        <AviculturaChatbot />
        <Analytics />
      </body>
    </html>
  )
}
