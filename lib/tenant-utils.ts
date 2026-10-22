// Multi-Tenant Architecture Utilities
// Provides tenant context, isolation, and tenant-scoped queries

import { createClient } from '@supabase/supabase-js'

export interface TenantContext {
  tenant_id: string
  user_id: string
  farm_id: string
  role: 'admin' | 'manager' | 'operator' | 'viewer'
}

export interface TenantInfo {
  id: string
  name: string
  plan: 'free' | 'premium' | 'enterprise'
  farms_limit: number
  active_farms: number
}

// Extract tenant context from request headers or session
export function getTenantContext(request?: any): TenantContext | null {
  if (!request) return null
  
  try {
    const tenantHeader = request.headers?.get?.('x-tenant-id') || 
                         request.headers?.['x-tenant-id']
    const farmHeader = request.headers?.get?.('x-farm-id') || 
                       request.headers?.['x-farm-id']
    
    if (!tenantHeader || !farmHeader) return null
    
    return {
      tenant_id: tenantHeader,
      farm_id: farmHeader,
      user_id: request.headers?.get?.('x-user-id') || '',
      role: (request.headers?.get?.('x-user-role') || 'viewer') as any,
    }
  } catch (error) {
    console.error('[v0] Error extracting tenant context:', error)
    return null
  }
}

// Create tenant-scoped query
export function withTenantScope(query: any, tenantContext: TenantContext) {
  return query
    .eq('tenant_id', tenantContext.tenant_id)
    .eq('farm_id', tenantContext.farm_id)
}

// Create tenant-scoped Supabase client with RLS
export function createTenantClient(tenantContext: TenantContext) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  // Set tenant context for RLS policies
  const withTenant = (baseQuery: any) => {
    return withTenantScope(baseQuery, tenantContext)
  }
  
  return { supabase, withTenant }
}

// Tenant isolation middleware
export async function validateTenantAccess(
  tenantContext: TenantContext | null,
  requiredRole?: string
): Promise<boolean> {
  if (!tenantContext) return false
  
  if (requiredRole && !isRoleAllowed(tenantContext.role, requiredRole)) {
    return false
  }
  
  return true
}

function isRoleAllowed(userRole: string, requiredRole: string): boolean {
  const hierarchy = { admin: 3, manager: 2, operator: 1, viewer: 0 }
  return (hierarchy[userRole as keyof typeof hierarchy] || 0) >= 
         (hierarchy[requiredRole as keyof typeof hierarchy] || 0)
}

// Get tenant info
export async function getTenantInfo(tenantId: string): Promise<TenantInfo | null> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  
  try {
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', tenantId)
      .single()
    
    if (error) throw error
    return data as TenantInfo
  } catch (error) {
    console.error('[v0] Error fetching tenant info:', error)
    return null
  }
}
