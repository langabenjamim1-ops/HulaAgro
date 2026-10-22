'use client'

import { useEffect, useState } from 'react'
import { Bell, BellOff, AlertCircle } from 'lucide-react'
import {
  requestNotificationPermission,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  sendLocalNotification,
  isAppInstalled,
} from '@/lib/pwa/notifications'

export function NotificationsSetup() {
  const [isSupported, setIsSupported] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    const init = async () => {
      try {
        // Check if notifications are supported
        const supported =
          'Notification' in window &&
          'serviceWorker' in navigator &&
          'PushManager' in window

        setIsSupported(supported)
        setIsInstalled(isAppInstalled())

        if (supported) {
          // Check current subscription status
          if ('serviceWorker' in navigator) {
            const registration = await navigator.serviceWorker.ready
            const subscription = await registration.pushManager.getSubscription()
            setIsSubscribed(!!subscription)
          }
        }
      } catch (error) {
        console.error('Error initializing notifications:', error)
        setError('Erro ao inicializar notificações')
      }
    }

    init()
  }, [])

  const handleToggleNotifications = async () => {
    if (!isSupported) {
      setError('Notificações não são suportadas neste navegador')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      if (isSubscribed) {
        // Unsubscribe
        const success = await unsubscribeFromPushNotifications()
        if (success) {
          setIsSubscribed(false)
          await sendLocalNotification({
            title: 'Notificações Desativadas',
            body: 'Você não receberá mais notificações',
          })
        }
      } else {
        // Request permission first
        const permission = await requestNotificationPermission()

        if (permission === 'granted') {
          // Subscribe to push notifications
          const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

          if (!VAPID_PUBLIC_KEY) {
            setError('Configuração de notificações não está pronta')
            setIsLoading(false)
            return
          }

          await subscribeToPushNotifications(VAPID_PUBLIC_KEY)
          setIsSubscribed(true)

          await sendLocalNotification({
            title: 'Notificações Ativadas',
            body: 'Você receberá alertas sobre sua fazenda',
          })
        } else if (permission === 'denied') {
          setError('Você negou permissão para notificações')
        }
      }
    } catch (error) {
      console.error('Error toggling notifications:', error)
      setError('Erro ao configurar notificações')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isSupported || !isInstalled) {
    return null
  }

  return (
    <div className="space-y-3">
      {/* Notification Status */}
      <div className="bg-[#f0f2ed] border border-[#E8E8E8] rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            {isSubscribed ? (
              <Bell className="w-5 h-5 text-green-600" />
            ) : (
              <BellOff className="w-5 h-5 text-[#6b7d3f]" />
            )}
          </div>

          <div className="flex-1">
            <h3 className="font-medium text-[#283106] mb-1">
              {isSubscribed ? 'Notificações Ativadas' : 'Notificações Desativadas'}
            </h3>
            <p className="text-sm text-[#6b7d3f] mb-3">
              {isSubscribed
                ? 'Você receberá alertas sobre mortalidade, ração e vacinação'
                : 'Ative as notificações para receber alertas importantes'}
            </p>

            <button
              onClick={handleToggleNotifications}
              disabled={isLoading}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                isSubscribed
                  ? 'bg-red-100 text-red-700 hover:bg-red-200 disabled:bg-red-100'
                  : 'bg-green-100 text-green-700 hover:bg-green-200 disabled:bg-green-100'
              }`}
            >
              {isLoading ? 'Carregando...' : isSubscribed ? 'Desativar' : 'Ativar'}
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
        <p className="font-medium mb-1">Tipos de Notificações</p>
        <ul className="space-y-1 text-xs">
          <li>• Alertas de mortalidade alta</li>
          <li>• Aviso de ração baixa</li>
          <li>• Lembretes de vacinação</li>
          <li>• Novos relatórios disponíveis</li>
        </ul>
      </div>
    </div>
  )
}
