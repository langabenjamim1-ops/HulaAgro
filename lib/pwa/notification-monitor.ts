import { createClient } from '@supabase/supabase-js'
import {
  notifyHighMortality,
  notifyLowFeedStock,
  notifyVaccinationReminder,
} from './notifications'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  )
}

export async function startNotificationMonitoring() {
  const supabase = getSupabase()

  // Monitor mortalidade alta
  const monitorMortality = setInterval(async () => {
    try {
      const { data, error } = await supabase
        .from('daily_records')
        .select('mortality_count, total_quantity')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(1)

      if (!error && data && data.length > 0) {
        const record = data[0]
        const mortalityRate = (record.mortality_count / record.total_quantity) * 100

        if (mortalityRate > 2) {
          // Limite: mais de 2% é preocupante
          await notifyHighMortality(mortalityRate)
        }
      }
    } catch (error) {
      console.error('Erro ao monitorar mortalidade:', error)
    }
  }, 60 * 60 * 1000) // A cada hora

  // Monitor estoque de ração
  const monitorFeedStock = setInterval(async () => {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('quantity')
        .eq('item_type', 'feed')
        .single()

      if (!error && data && data.quantity < 500) {
        // Limite: menos de 500kg
        await notifyLowFeedStock(data.quantity)
      }
    } catch (error) {
      console.error('Erro ao monitorar estoque:', error)
    }
  }, 60 * 60 * 1000) // A cada hora

  return () => {
    clearInterval(monitorMortality)
    clearInterval(monitorFeedStock)
  }
}

export async function checkAndNotifyReminders() {
  const supabase = getSupabase()

  try {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('health_records')
      .select('vaccine_name, scheduled_date')
      .eq('scheduled_date', tomorrowStr)
      .eq('status', 'pending')

    if (!error && data) {
      for (const record of data) {
        await notifyVaccinationReminder(
          record.vaccine_name,
          new Date(record.scheduled_date).toLocaleDateString('pt-BR')
        )
      }
    }
  } catch (error) {
    console.error('Erro ao verificar lembretes:', error)
  }
}
