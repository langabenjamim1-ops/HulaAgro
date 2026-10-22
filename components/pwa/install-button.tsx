'use client'

import { useEffect, useState } from 'react'
import { Download, X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setIsInstallable(true)
    }

    const handleAppInstalled = () => {
      setIsInstallable(false)
      setDeferredPrompt(null)
      localStorage.setItem('appInstalled', 'true')
    }

    const handleDisplayModeChanged = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      if (isStandalone) {
        setIsInstallable(false)
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    window.addEventListener('displaymodechange', handleDisplayModeChanged)

    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    const alreadyInstalled = localStorage.getItem('appInstalled')

    if (isStandalone || alreadyInstalled) {
      setIsInstallable(false)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
      window.removeEventListener('displaymodechange', handleDisplayModeChanged)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice

      if (outcome === 'accepted') {
        setIsInstallable(false)
        localStorage.setItem('appInstalled', 'true')
      }

      setDeferredPrompt(null)
    } catch (error) {
      console.error('Installation failed:', error)
    }
  }

  if (!isInstallable || !isVisible) return null

  return (
    <div className="fixed top-20 right-6 z-50 animate-in slide-in-from-top duration-300">
      <div className="bg-white border border-[#E8E8E8] rounded-lg shadow-lg p-4 max-w-xs">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-1">
              <Download className="w-5 h-5 text-[#283106]" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm text-[#283106] mb-1">
                Instalar HULA AGRO
              </h3>
              <p className="text-xs text-[#6b7d3f] mb-3">
                Use HULA AGRO como um app nativo no seu dispositivo
              </p>
              <button
                onClick={handleInstall}
                className="w-full px-3 py-2 bg-[#283106] text-white text-xs font-medium rounded hover:bg-[#3D4A2C] transition-colors"
              >
                Instalar Agora
              </button>
            </div>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="flex-shrink-0 text-[#6b7d3f] hover:text-[#283106] transition-colors"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
