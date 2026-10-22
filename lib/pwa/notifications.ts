// Push Notification Manager for HULA AGRO PWA

export interface NotificationData {
  title: string
  body: string
  icon?: string
  badge?: string
  tag?: string
  data?: Record<string, any>
  requireInteraction?: boolean
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications')
    return 'denied'
  }

  if (Notification.permission === 'granted') {
    return 'granted'
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission()
    return permission
  }

  return Notification.permission
}

export async function subscribeToPushNotifications(vapidPublicKey: string) {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    throw new Error('Push notifications are not supported')
  }

  try {
    const registration = await navigator.serviceWorker.ready

    // Check if already subscribed
    let subscription = await registration.pushManager.getSubscription()

    if (!subscription) {
      // Subscribe to push notifications
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      })
    }

    return subscription
  } catch (error) {
    console.error('Failed to subscribe to push notifications:', error)
    throw error
  }
}

export async function unsubscribeFromPushNotifications() {
  if (!('serviceWorker' in navigator)) {
    return false
  }

  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()

    if (subscription) {
      await subscription.unsubscribe()
      return true
    }

    return false
  } catch (error) {
    console.error('Failed to unsubscribe from push notifications:', error)
    return false
  }
}

export async function sendLocalNotification(data: NotificationData) {
  if (!('serviceWorker' in navigator)) {
    throw new Error('Service Worker is not supported')
  }

  try {
    const registration = await navigator.serviceWorker.ready

    await registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon || '/icons/icon-192.png',
      badge: data.badge || '/icons/icon-192.png',
      tag: data.tag || 'notification',
      requireInteraction: data.requireInteraction || false,
      data: data.data || {},
    })
  } catch (error) {
    console.error('Failed to send local notification:', error)
    throw error
  }
}

export async function getPushSubscription() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return null
  }

  try {
    const registration = await navigator.serviceWorker.ready
    return await registration.pushManager.getSubscription()
  } catch (error) {
    console.error('Failed to get push subscription:', error)
    return null
  }
}

// Helper function to convert VAPID key from base64 to Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }

  return outputArray
}

// Farm Alert Notifications
export interface FarmAlert {
  type: 'mortality' | 'feed' | 'vaccination' | 'report'
  severity: 'critical' | 'high' | 'medium' | 'low'
  message: string
  action?: {
    label: string
    url: string
  }
}

export async function sendFarmAlert(alert: FarmAlert) {
  const severityColors = {
    critical: '#dc2626',
    high: '#ea580c',
    medium: '#eab308',
    low: '#22c55e',
  }

  const icons = {
    mortality: '💀',
    feed: '🌾',
    vaccination: '💉',
    report: '📊',
  }

  const titles = {
    mortality: 'Alerta de Mortalidade',
    feed: 'Ração Baixa',
    vaccination: 'Vacinação Programada',
    report: 'Novo Relatório',
  }

  const notification: NotificationData = {
    title: titles[alert.type],
    body: alert.message,
    icon: '/icons/icon-192.png',
    tag: `farm-alert-${alert.type}`,
    requireInteraction: alert.severity === 'critical' || alert.severity === 'high',
    data: {
      type: alert.type,
      severity: alert.severity,
      action: alert.action,
    },
  }

  return sendLocalNotification(notification)
}

export function notifyHighMortality(rate: number) {
  return sendFarmAlert({ type: 'mortality', severity: 'critical', message: `A mortalidade registada atingiu ${rate.toFixed(2)}%. Verifique o lote e atualize o registo sanitário.` })
}

export function notifyLowFeedStock(quantity: number) {
  return sendFarmAlert({ type: 'feed', severity: 'high', message: `O stock de ração está baixo: ${quantity.toLocaleString('pt-MZ')} kg. Planeie a reposição.` })
}

export function notifyVaccinationReminder(vaccine: string, date: string) {
  return sendFarmAlert({ type: 'vaccination', severity: 'medium', message: `${vaccine} está previsto para ${date}. Confirme a disponibilidade do lote e da vacina.` })
}

// Periodic background sync for checking farm alerts
export async function registerPeriodicSync(tag: string, minInterval: number = 60 * 60 * 1000) {
  if (!('serviceWorker' in navigator) || !('periodicSync' in ServiceWorkerRegistration.prototype)) {
    console.warn('Periodic Background Sync is not supported')
    return false
  }

  try {
    const registration = await navigator.serviceWorker.ready

    // Request permission first
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      throw new Error('Notification permission not granted')
    }

    // Register periodic sync
    // @ts-ignore - periodicSync is not in all TypeScript versions
    await registration.periodicSync.register(tag, {
      minInterval,
    })

    return true
  } catch (error) {
    console.error('Failed to register periodic sync:', error)
    return false
  }
}

// Check if app is installable
export function isAppInstallable(): boolean {
  if (!('BeforeInstallPromptEvent' in window)) {
    return false
  }

  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    // @ts-ignore
    navigator.standalone === true

  return !isStandalone
}

// Check if app is installed
export function isAppInstalled(): boolean {
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    // @ts-ignore
    navigator.standalone === true

  return isStandalone
}
