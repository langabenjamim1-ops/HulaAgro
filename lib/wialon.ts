import { WialonUnit } from '@/lib/wialon-types'

const DEFAULT_HOST = 'https://hst-api.wialon.com'

type WialonResponse<T> = T & { error?: number }

function getHost() {
  return (process.env.WIALON_API_HOST || DEFAULT_HOST).replace(/\/+$/, '')
}

export async function wialonRequest<T>(
  service: string,
  params: Record<string, unknown>,
  sid?: string
): Promise<WialonResponse<T>> {
  const url = new URL(`${getHost()}/wialon/ajax.html`)
  url.searchParams.set('svc', service)
  url.searchParams.set('params', JSON.stringify(params))
  if (sid) url.searchParams.set('sid', sid)

  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(`Wialon HTTP ${response.status}`)
  }

  const data = await response.json()
  if (typeof data === 'number' && data !== 0) {
    throw new Error(`Wialon API error ${data}`)
  }
  if (typeof data === 'object' && data !== null && 'error' in data && data.error) {
    throw new Error(`Wialon API error ${data.error}`)
  }

  return data
}

export async function getWialonSession() {
  const token = process.env.WIALON_TOKEN?.trim()
  if (!token) {
    throw new Error('WIALON_TOKEN não configurado')
  }

  const data = await wialonRequest<{
    eid: string
    user?: { nm?: string; id?: number }
  }>('token/login', { token, fl: 256 + 512 })

  if (!data.eid) {
    throw new Error('Wialon não devolveu uma sessão válida')
  }

  return data
}

export async function getWialonUnits(sessionArg?: Awaited<ReturnType<typeof getWialonSession>>): Promise<WialonUnit[]> {
  const session = sessionArg ?? await getWialonSession()

  // 1 = general, 1024 = last position/message,
  // 4096 = sensors, 2097152 = connection status.
  const flags = 1 + 1024 + 4096 + 2097152

  const result = await wialonRequest<{
    items: Array<Record<string, any>>
  }>(
    'core/search_items',
    {
      spec: {
        itemsType: 'avl_unit',
        propName: 'sys_name',
        propValueMask: '*',
        sortType: 'sys_name',
      },
      force: 1,
      flags,
      from: 0,
      to: 0,
    },
    session.eid
  )

  const items = result.items || []
  if (!items.length) return []

  // calc_last returns the latest calculated sensor values and key indicators
  // for all requested units in a single request.
  const calculated = await wialonRequest<Array<Record<string, any>>>(
    'unit/calc_last',
    { itemIds: items.map((item) => Number(item.id)) },
    session.eid
  )

  const calcByUnit = new Map<number, Record<string, any>>(
    (calculated || []).map((item) => [Number(item.i), item])
  )

  return items.map((item) => {
    const id = Number(item.id)
    const calc = calcByUnit.get(id)
    const sensorsConfig = item.sens || {}
    const sensorValues = calc?.sensors || {}

    const sensors = Object.values(sensorsConfig).map((sensor: any) => {
      const value = sensorValues[String(sensor.id)]
      return {
        id: Number(sensor.id),
        name: String(sensor.n || `Sensor ${sensor.id}`),
        type: String(sensor.t || ''),
        unit: String(sensor.m || ''),
        parameter: String(sensor.p || ''),
        value: value?.value ?? null,
        formattedValue: value?.format?.value ?? null,
      }
    })

    return {
      id,
      name: String(item.nm || `Unidade ${id}`),
      position: item.pos
        ? {
            latitude: Number(item.pos.y),
            longitude: Number(item.pos.x),
            altitude: Number(item.pos.z ?? 0),
            speed: Number(item.pos.s ?? 0),
            course: Number(item.pos.c ?? 0),
            satellites: Number(item.pos.sc ?? 0),
            timestamp: Number(item.pos.t ?? 0),
          }
        : null,
      connected: Boolean(item.lmsg?.rt),
      lastMessageTimestamp: Number(item.pos?.t ?? 0),
      mileage: calc?.mileage?.format?.value ?? null,
      engineHours: calc?.engine_hours?.format?.value ?? null,
      sensors,
    } satisfies WialonUnit
  })
}

type WialonItem = Record<string, any> & { id: number; nm?: string }

async function searchWialonItems(
  sessionId: string,
  itemsType: string,
  flags: number,
): Promise<WialonItem[]> {
  const result = await wialonRequest<{ items?: WialonItem[] }>(
    'core/search_items',
    {
      spec: {
        itemsType,
        propName: 'sys_name',
        propValueMask: '*',
        sortType: 'sys_name',
      },
      force: 1,
      flags,
      from: 0,
      to: 0,
    },
    sessionId,
  )
  return result.items ?? []
}

async function loadWialonFleetData() {
  const session = await getWialonSession()
  const [units, groups, users, resources, routes] = await Promise.all([
    getWialonUnits(session),
    searchWialonItems(session.eid, 'avl_unit_group', 1),
    searchWialonItems(session.eid, 'user', 1 + 2 + 256),
    searchWialonItems(session.eid, 'avl_resource', 1 + 256 + 1024 + 8192 + 32768),
    searchWialonItems(session.eid, 'avl_route', 1 + 256 + 512 + 1024 + 2048),
  ])

  const drivers = resources.flatMap((resource) => Object.values(resource.drvrs ?? {}).map((driver: any) => ({
    id: Number(driver.id),
    resourceId: Number(resource.id),
    resourceName: String(resource.nm || ''),
    name: String(driver.n || `Motorista ${driver.id}`),
    code: String(driver.c || ''),
    phone: String(driver.p || ''),
    description: String(driver.ds || ''),
    assignedUnitId: Number(driver.bu || 0) || null,
    assignmentTimestamp: Number(driver.bt || 0) || null,
  })))

  const driverGroups = resources.flatMap((resource) => Object.values(resource.drvrsgr ?? {}).map((group: any) => ({
    id: Number(group.id),
    resourceId: Number(resource.id),
    resourceName: String(resource.nm || ''),
    name: String(group.n || `Grupo ${group.id}`),
    description: String(group.d || ''),
    driverIds: Array.isArray(group.drs) ? group.drs.map(Number) : [],
  })))

  const reportTemplates = resources.flatMap((resource) => Object.values(resource.rep ?? {}).map((template: any) => ({
    id: Number(template.id),
    resourceId: Number(resource.id),
    resourceName: String(resource.nm || ''),
    name: String(template.n || `Relatório ${template.id}`),
    type: String(template.ct || ''),
  })))

  const notifications = (await Promise.all(resources.map(async (resource) => {
    try {
      const items = await wialonRequest<Array<Record<string, any>>>(
        'resource/get_notification_data',
        { itemId: Number(resource.id) },
        session.eid,
      )
      return (Array.isArray(items) ? items : []).map((notification) => ({
      id: Number(notification.id),
      resourceId: Number(resource.id),
      resourceName: String(resource.nm || ''),
      name: String(notification.n || `Notificação ${notification.id}`),
      text: String(notification.txt || ''),
      disabled: Boolean((Number(notification.fl || 0) & 2) !== 0),
      alarmsCount: Number(notification.ac || 0),
      unitIds: Array.isArray(notification.un) ? notification.un.map(Number) : [],
      triggerType: String(notification.trg?.t || ''),
      actionTypes: Array.isArray(notification.act)
        ? notification.act.map((action: any) => String(action.t || '')).filter(Boolean)
        : [],
      modifiedAt: Number(notification.mt || 0),
      }))
    } catch {
      return []
    }
  }))).flat()

  return {
    updatedAt: new Date().toISOString(),
    account: { id: Number(session.user?.id || 0), name: String(session.user?.nm || '') },
    units,
    groups: groups.map((group) => ({
      id: Number(group.id),
      name: String(group.nm || `Grupo ${group.id}`),
      unitIds: Array.isArray(group.u) ? group.u.map(Number) : [],
    })),
    users: users.map((user) => ({
      id: Number(user.id),
      name: String(user.nm || `Utilizador ${user.id}`),
      lastLogin: Number(user.ld || 0),
    })),
    resources: resources.map((resource) => ({ id: Number(resource.id), name: String(resource.nm || '') })),
    drivers,
    driverGroups,
    routes: routes.map((route) => ({
      id: Number(route.id),
      name: String(route.nm || `Rota ${route.id}`),
      description: String(route.rcfg?.descr || ''),
      unitIds: Array.isArray(route.rcfg?.units) ? route.rcfg.units.map(Number) : [],
      checkpoints: Array.isArray(route.rpts) ? route.rpts.map((point: any) => ({
        name: String(point.n || ''), latitude: Number(point.y || 0), longitude: Number(point.x || 0),
      })) : [],
      schedulesCount: Object.keys(route.rs || {}).length,
      ridesCount: Object.keys(route.rr || {}).length,
    })),
    notifications,
    reportTemplates,
  }
}

const WIALON_FLEET_CACHE_MS = 30_000
type FleetData = Awaited<ReturnType<typeof loadWialonFleetData>>
let cachedFleet: { token: string; expiresAt: number; data: FleetData } | null = null
let pendingFleet: { token: string; promise: Promise<FleetData> } | null = null

export async function getWialonFleetData(forceRefresh = false): Promise<FleetData> {
  const token = process.env.WIALON_TOKEN?.trim() || ''
  if (!forceRefresh && cachedFleet?.token === token && cachedFleet.expiresAt > Date.now()) return cachedFleet.data
  if (pendingFleet?.token === token) return pendingFleet.promise
  if (forceRefresh) cachedFleet = null

  const promise = loadWialonFleetData().then((data) => {
    cachedFleet = { token, data, expiresAt: Date.now() + WIALON_FLEET_CACHE_MS }
    return data
  }).finally(() => {
    if (pendingFleet?.promise === promise) pendingFleet = null
  })
  pendingFleet = { token, promise }
  return promise
}

export async function runWialonReport(input: {
  resourceId: number
  templateId: number
  objectId: number
  from: number
  to: number
}) {
  const session = await getWialonSession()
  const result = await wialonRequest<{ reportResult?: { tables?: Array<Record<string, any>> } }>(
    'report/exec_report',
    {
      reportResourceId: input.resourceId,
      reportTemplateId: input.templateId,
      reportObjectId: input.objectId,
      reportObjectSecId: 0,
      interval: { from: input.from, to: input.to, flags: 0 },
    },
    session.eid,
  )
  const tables = result.reportResult?.tables ?? []
  const populatedTables = await Promise.all(tables.map(async (table, tableIndex) => {
    const rowCount = Math.min(Number(table.rows || 0), 250)
    const rows = rowCount > 0
      ? await wialonRequest<Array<Record<string, any>>>(
          'report/get_result_rows',
          { tableIndex, indexFrom: 0, indexTo: rowCount - 1 },
          session.eid,
        )
      : []
    return {
      name: String(table.label || table.name || `Tabela ${tableIndex + 1}`),
      headers: Array.isArray(table.header) ? table.header.map(String) : [],
      total: Array.isArray(table.total) ? table.total.map(String) : [],
      rows: rows.map((row) => Array.isArray(row.c) ? row.c.map((cell: any) => String(cell.t ?? '')) : []),
      truncated: Number(table.rows || 0) > rowCount,
    }
  }))
  return { tables: populatedTables }
}
