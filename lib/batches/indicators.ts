// Cálculo dos indicadores de um lote. Funções puras (sem base de dados), para serem fáceis de testar.
// Os padrões (alvos) vêm sempre da tabela genetics_standards, preenchida pelo utilizador. Nada aqui é inventado.

export type StdMetric = 'weight_g' | 'laying_rate' | 'slaughter_weight_g'
export type Std = { metric: StdMetric; age_days: number; value: number }
export type ProdRow = {
  record_date: string; record_kind: string | null
  eggs_produced: number | null; eggs_broken: number | null; feed_consumption: number | null
  average_weight: number | null; sample_size: number | null
}
export type LossRow = { loss_date: string; quantity: number }
export type CostRow = { cost_type: string | null; amount: number; currency: string | null }
export type BatchInfo = {
  bird_type: string; birds_count: number; start_date: string; hatch_date?: string | null; end_date?: string | null
}

export type LayingDay = { date: string; eggs: number; broken: number; alive: number; rate: number | null; feed_kg: number | null }
export type WeightPoint = { date: string; grams: number; age_days: number | null; target: number | null }

export type Indicators = {
  age_days: number | null
  age_basis: 'hatch' | 'entry' | 'unknown'
  alive_count: number
  layers: null | {
    eggs_total: number
    broken_total: number
    broken_pct: number | null
    last: LayingDay | null
    rate_7d: number | null
    target_rate: number | null
    series: LayingDay[]
    feed: { total_kg: number; grams_per_bird_day: number | null; kg_per_dozen: number | null; days: number }
    cost: null | { total: number; feed_total: number; per_egg: number | null; feed_per_egg: number | null; currency: string }
  }
  weight: null | {
    last: WeightPoint
    diff_pct: number | null
    series: WeightPoint[]
  }
  broilers: null | {
    fcr: number | null
    feed_total_kg: number
    feed_coverage_pct: number | null
    slaughter_target_g: number | null
    projection: null | { date: string; days: number; gain_g_per_day: number } | { reached: true }
  }
  notes: string[]
}

const r = (n: number, d = 2) => Math.round(n * 10 ** d) / 10 ** d
const day = (s: string) => String(s).slice(0, 10)
const ms = (s: string) => Date.parse(`${day(s)}T00:00:00Z`)
export const daysBetween = (from: string, to: string) => Math.floor((ms(to) - ms(from)) / 86400000)
const addDays = (s: string, n: number) => new Date(ms(s) + n * 86400000).toISOString().slice(0, 10)
const num = (v: unknown) => (v === null || v === undefined || v === '' || Number.isNaN(Number(v)) ? null : Number(v))

/** Último padrão com idade ≤ à do lote (o valor vale até ao padrão seguinte). */
export function lookupStd(standards: Std[], metric: StdMetric, age: number | null) {
  if (age === null) return null
  let found: Std | null = null
  for (const s of standards) if (s.metric === metric && s.age_days <= age && (!found || s.age_days > found.age_days)) found = s
  return found ? Number(found.value) : null
}

export function computeIndicators(input: {
  batch: BatchInfo; prod: ProdRow[]; losses: LossRow[]; costs: CostRow[]; standards: Std[]; today: string
}): Indicators {
  const { batch, prod, losses, costs, standards, today } = input
  const notes: string[] = []
  const totalLost = losses.reduce((sum, l) => sum + (num(l.quantity) ?? 0), 0)
  const initial = Number(batch.birds_count) || 0

  // Idade de referência: data de nascimento; nos frangos de corte, a entrada (pintos chegam com 1 dia).
  const refDate = batch.hatch_date ? day(batch.hatch_date) : batch.bird_type === 'broilers' ? day(batch.start_date) : null
  const age_basis: Indicators['age_basis'] = batch.hatch_date ? 'hatch' : refDate ? 'entry' : 'unknown'
  const ageAt = (date: string) => (refDate ? Math.max(0, daysBetween(refDate, date)) : null)
  const endRef = batch.end_date ? day(batch.end_date) : today
  if (age_basis === 'unknown') notes.push('Sem data de nascimento do lote, não é possível comparar com o padrão da linhagem. Preencha-a na edição do lote.')

  // Aves vivas no início de cada dia = iniciais − baixas ocorridas antes desse dia.
  const aliveAtStart = (date: string) => {
    const lost = losses.reduce((sum, l) => (day(l.loss_date) < day(date) ? sum + (num(l.quantity) ?? 0) : sum), 0)
    return Math.max(0, initial - lost)
  }

  const isWeighing = (row: ProdRow) => row.record_kind === 'weighing'
  const dailyRows = prod.filter((row) => !isWeighing(row) && row.average_weight === null)
  const weighRows = prod.filter((row) => isWeighing(row) || (row.record_kind === null && row.average_weight !== null))

  // Agrupa registos diários por data (podem existir vários no mesmo dia).
  const byDate = new Map<string, { eggs: number; hasEggs: boolean; broken: number; feed: number; hasFeed: boolean }>()
  for (const row of dailyRows) {
    const key = day(row.record_date)
    const g = byDate.get(key) ?? { eggs: 0, hasEggs: false, broken: 0, feed: 0, hasFeed: false }
    const eggs = num(row.eggs_produced); const broken = num(row.eggs_broken); const feed = num(row.feed_consumption)
    if (eggs !== null) { g.eggs += eggs; g.hasEggs = true }
    if (broken !== null) g.broken += broken
    if (feed !== null && feed > 0) { g.feed += feed; g.hasFeed = true }
    byDate.set(key, g)
  }
  const dates = [...byDate.keys()].sort()

  const isLayer = batch.bird_type === 'layers' || batch.bird_type === 'breeders'
  let layers: Indicators['layers'] = null
  if (isLayer) {
    const series: LayingDay[] = []
    for (const date of dates) {
      const g = byDate.get(date)!
      if (!g.hasEggs) continue
      const alive = aliveAtStart(date)
      series.push({ date, eggs: g.eggs, broken: g.broken, alive, rate: alive > 0 ? r((g.eggs / alive) * 100, 1) : null, feed_kg: g.hasFeed ? r(g.feed, 3) : null })
    }
    const eggsTotal = series.reduce((s, d) => s + d.eggs, 0)
    const brokenTotal = series.reduce((s, d) => s + d.broken, 0)
    const last = series.length ? series[series.length - 1] : null
    const recent = series.slice(-7).filter((d) => d.alive > 0)
    const rate7 = recent.length ? r((recent.reduce((s, d) => s + d.eggs, 0) / recent.reduce((s, d) => s + d.alive, 0)) * 100, 1) : null

    const feedDays = dates.filter((d) => byDate.get(d)!.hasFeed)
    const feedTotal = feedDays.reduce((s, d) => s + byDate.get(d)!.feed, 0)
    const birdDays = feedDays.reduce((s, d) => s + aliveAtStart(d), 0)
    const eggsOnFeedDays = feedDays.reduce((s, d) => s + byDate.get(d)!.eggs, 0)

    let cost: NonNullable<Indicators['layers']>['cost'] = null
    if (costs.length) {
      const currencies = new Set(costs.map((c) => c.currency || 'MZN'))
      if (currencies.size > 1) notes.push('Os custos do lote estão em mais de uma moeda; o custo por ovo não foi calculado.')
      else {
        const total = costs.reduce((s, c) => s + (num(c.amount) ?? 0), 0)
        const feedCost = costs.filter((c) => c.cost_type === 'feed').reduce((s, c) => s + (num(c.amount) ?? 0), 0)
        cost = { total: r(total), feed_total: r(feedCost), per_egg: eggsTotal > 0 ? r(total / eggsTotal, 3) : null, feed_per_egg: eggsTotal > 0 && feedCost > 0 ? r(feedCost / eggsTotal, 3) : null, currency: [...currencies][0] }
      }
    }

    layers = {
      eggs_total: eggsTotal,
      broken_total: brokenTotal,
      broken_pct: eggsTotal > 0 ? r((brokenTotal / eggsTotal) * 100, 1) : null,
      last,
      rate_7d: rate7,
      target_rate: last ? lookupStd(standards, 'laying_rate', ageAt(last.date)) : null,
      series: series.slice(-30),
      feed: {
        total_kg: r(feedTotal, 1),
        grams_per_bird_day: birdDays > 0 ? r((feedTotal * 1000) / birdDays, 0) : null,
        kg_per_dozen: eggsOnFeedDays > 0 ? r(feedTotal / (eggsOnFeedDays / 12), 2) : null,
        days: feedDays.length,
      },
      cost,
    }
  }

  // Pesagens (várias na mesma data → média ponderada pelo nº de aves pesadas).
  const wByDate = new Map<string, { sum: number; n: number }>()
  for (const row of weighRows) {
    const grams = num(row.average_weight); if (grams === null) continue
    const w = Math.max(1, num(row.sample_size) ?? 1)
    const key = day(row.record_date)
    const g = wByDate.get(key) ?? { sum: 0, n: 0 }
    g.sum += grams * w; g.n += w; wByDate.set(key, g)
  }
  const wDates = [...wByDate.keys()].sort()
  const wSeries: WeightPoint[] = wDates.map((date) => {
    const g = wByDate.get(date)!
    const age = ageAt(date)
    return { date, grams: r(g.sum / g.n, 0), age_days: age, target: lookupStd(standards, 'weight_g', age) }
  })
  const lastW = wSeries.length ? wSeries[wSeries.length - 1] : null
  const weight: Indicators['weight'] = lastW ? { last: lastW, diff_pct: lastW.target ? r(((lastW.grams - lastW.target) / lastW.target) * 100, 1) : null, series: wSeries.slice(-30) } : null

  // Frangos de corte: conversão alimentar aproximada e previsão de abate.
  let broilers: Indicators['broilers'] = null
  if (batch.bird_type === 'broilers') {
    const slaughter = standards.find((s) => s.metric === 'slaughter_weight_g')
    const slaughterTarget = slaughter ? Number(slaughter.value) : null
    let fcr: number | null = null
    let feedTotalKg = 0
    let coverage: number | null = null
    if (lastW) {
      const feedDays = dates.filter((d) => d <= lastW.date && byDate.get(d)!.hasFeed)
      feedTotalKg = feedDays.reduce((s, d) => s + byDate.get(d)!.feed, 0)
      const biomass = (aliveAtStart(lastW.date) * lastW.grams) / 1000
      if (feedTotalKg > 0 && biomass > 0) fcr = r(feedTotalKg / biomass, 2)
      const period = daysBetween(day(batch.start_date), lastW.date) + 1
      coverage = period > 0 ? r((feedDays.length / period) * 100, 0) : null
      if (feedTotalKg > 0 && coverage !== null && coverage < 80) notes.push(`A ração só foi registada em ${feedDays.length} dos ${period} dias; a conversão alimentar fica abaixo do real.`)
    }
    let projection: NonNullable<Indicators['broilers']>['projection'] = null
    if (lastW && slaughterTarget) {
      if (lastW.grams >= slaughterTarget) projection = { reached: true }
      else {
        const base = wSeries.find((p) => p.date < lastW.date && daysBetween(p.date, lastW.date) >= 2 && daysBetween(p.date, lastW.date) <= 14)
        if (base) {
          const gain = (lastW.grams - base.grams) / daysBetween(base.date, lastW.date)
          if (gain > 0) {
            const days = Math.ceil((slaughterTarget - lastW.grams) / gain)
            projection = { date: addDays(lastW.date, days), days, gain_g_per_day: r(gain, 1) }
          }
        }
      }
    }
    broilers = { fcr, feed_total_kg: r(feedTotalKg, 1), feed_coverage_pct: coverage, slaughter_target_g: slaughterTarget, projection }
  }

  return { age_days: refDate ? Math.max(0, daysBetween(refDate, endRef)) : null, age_basis, alive_count: Math.max(0, initial - totalLost), layers, weight, broilers, notes }
}