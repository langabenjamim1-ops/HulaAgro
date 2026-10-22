import { useEffect, useState, useCallback } from 'react'
import { sendFarmAlert, FarmAlert, sendLocalNotification } from './notifications'

interface UseNotificationsOptions {
  enabled?: boolean
  checkInterval?: number // in milliseconds, default 5 minutes
}

export function useNotifications(options: UseNotificationsOptions = {}) {
  const { enabled = true, checkInterval = 5 * 60 * 1000 } = options

  const [isReady, setIsReady] = useState(false)
  const [hasPermission, setHasPermission] = useState(false)

  useEffect(() => {
    if (!enabled) return

    const init = async () => {
      try {
        // Check if notifications are supported
        const supported =
          'Notification' in window &&
          'serviceWorker' in navigator &&
          'PushManager' in window

        if (supported) {
          const permission = Notification.permission
          setHasPermission(permission === 'granted')
          setIsReady(true)
        }
      } catch (error) {
        console.error('Error initializing notifications hook:', error)
      }
    }

    init()
  }, [enabled])

  const sendAlert = useCallback(
    async (alert: FarmAlert) => {
      if (!hasPermission) {
        console.warn('Notification permission not granted')
        return
      }

      try {
        await sendFarmAlert(alert)
      } catch (error) {
        console.error('Error sending notification:', error)
      }
    },
    [hasPermission]
  )

  const sendNotification = useCallback(
    async (title: string, body: string, data?: Record<string, any>) => {
      if (!hasPermission) {
        console.warn('Notification permission not granted')
        return
      }

      try {
        await sendLocalNotification({
          title,
          body,
          data,
        })
      } catch (error) {
        console.error('Error sending notification:', error)
      }
    },
    [hasPermission]
  )

  return {
    isReady,
    hasPermission,
    sendAlert,
    sendNotification,
  }
}

// Alert helpers
export const farmAlerts = {
  highMortality: (percentage: number): FarmAlert => ({
    type: 'mortality',
    severity: percentage > 10 ? 'critical' : 'high',
    message: `Mortalidade de ${percentage.toFixed(1)}% detectada. Verifique as condições da granja.`,
    action: {
      label: 'Verificar',
      url: '/modules/health',
    },
  }),

  lowFeedStock: (percentage: number): FarmAlert => ({
    type: 'feed',
    severity: percentage < 20 ? 'critical' : 'high',
    message: `Ração em nível baixo (${percentage.toFixed(0)}%). Agendar entrega urgente.`,
    action: {
      label: 'Gerenciar',
      url: '/modules/supplies',
    },
  }),

  vaccinationDue: (vaccineName: string, daysUntil: number): FarmAlert => ({
    type: 'vaccination',
    severity: daysUntil <= 1 ? 'critical' : daysUntil <= 3 ? 'high' : 'medium',
    message:
      daysUntil === 0
        ? `${vaccineName} vence hoje!`
        : `${vaccineName} vence em ${daysUntil} dias`,
    action: {
      label: 'Programar',
      url: '/modules/health',
    },
  }),

  newReport: (reportType: string): FarmAlert => ({
    type: 'report',
    severity: 'medium',
    message: `Novo relatório de ${reportType} disponível`,
    action: {
      label: 'Visualizar',
      url: '/modules/production-analysis',
    },
  }),

  abnormalBehavior: (message: string): FarmAlert => ({
    type: 'mortality',
    severity: 'high',
    message,
    action: {
      label: 'Verificar',
      url: '/modules/health',
    },
  }),
}
