'use server'

import { supabase } from '@/lib/supabase'

export async function getFarm() {
  try {
    const { data, error } = await supabase.from('farms').select('*').single()
    if (error) throw error
    return data
  } catch (error) {
    console.log('[v0] Error fetching farm:', error)
    return null
  }
}

export async function getHens() {
  try {
    const { data, error } = await supabase.from('hens').select('*').order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  } catch (error) {
    console.log('[v0] Error fetching hens:', error)
    return []
  }
}

export async function addHen(henData: { tag: string; breed: string; status: string }) {
  try {
    const { data, error } = await supabase
      .from('hens')
      .insert([henData])
      .select()
      .single()
    if (error) throw error
    return data
  } catch (error) {
    console.log('[v0] Error adding hen:', error)
    throw error
  }
}

export async function updateHen(id: string, updates: Record<string, any>) {
  try {
    const { data, error } = await supabase
      .from('hens')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  } catch (error) {
    console.log('[v0] Error updating hen:', error)
    throw error
  }
}

export async function deleteHen(id: string) {
  try {
    const { error } = await supabase.from('hens').delete().eq('id', id)
    if (error) throw error
    return true
  } catch (error) {
    console.log('[v0] Error deleting hen:', error)
    throw error
  }
}

export async function getProduction() {
  try {
    const { data, error } = await supabase
      .from('egg_production')
      .select('*')
      .order('date', { ascending: false })
    if (error) throw error
    return data || []
  } catch (error) {
    console.log('[v0] Error fetching production:', error)
    return []
  }
}

export async function addProduction(productionData: {
  hen_id: string
  date: string
  eggs: number
  notes?: string
}) {
  try {
    const { data, error } = await supabase
      .from('egg_production')
      .insert([productionData])
      .select()
      .single()
    if (error) throw error
    return data
  } catch (error) {
    console.log('[v0] Error adding production:', error)
    throw error
  }
}

export async function getHealth() {
  try {
    const { data, error } = await supabase
      .from('health_records')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  } catch (error) {
    console.log('[v0] Error fetching health records:', error)
    return []
  }
}

export async function addHealth(healthData: {
  hen_id: string
  issue: string
  status: string
  treatment?: string
}) {
  try {
    const { data, error } = await supabase
      .from('health_records')
      .insert([healthData])
      .select()
      .single()
    if (error) throw error
    return data
  } catch (error) {
    console.log('[v0] Error adding health record:', error)
    throw error
  }
}

export async function getVaccinations() {
  try {
    const { data, error } = await supabase
      .from('vaccinations')
      .select('*')
      .order('date', { ascending: false })
    if (error) throw error
    return data || []
  } catch (error) {
    console.log('[v0] Error fetching vaccinations:', error)
    return []
  }
}

export async function addVaccination(vaccinationData: {
  hen_id: string
  vaccine_name: string
  date: string
  notes?: string
}) {
  try {
    const { data, error } = await supabase
      .from('vaccinations')
      .insert([vaccinationData])
      .select()
      .single()
    if (error) throw error
    return data
  } catch (error) {
    console.log('[v0] Error adding vaccination:', error)
    throw error
  }
}

export async function getFinancial() {
  try {
    const { data, error } = await supabase
      .from('financial_records')
      .select('*')
      .order('date', { ascending: false })
    if (error) throw error
    return data || []
  } catch (error) {
    console.log('[v0] Error fetching financial records:', error)
    return []
  }
}

export async function addFinancial(financialData: {
  category: string
  type: 'income' | 'expense'
  amount: number
  description?: string
  date?: string
}) {
  try {
    const { data, error } = await supabase
      .from('financial_records')
      .insert([financialData])
      .select()
      .single()
    if (error) throw error
    return data
  } catch (error) {
    console.log('[v0] Error adding financial record:', error)
    throw error
  }
}
