// Textos e formatação partilhados pelos ecrãs de lotes (seguro para usar no browser).

export const BIRD_TYPE_LABELS: Record<string, string> = {
  layers: 'Postura',
  broilers: 'Corte',
  breeders: 'Reprodução',
}

export const STATUS_LABELS: Record<string, string> = {
  active: 'Ativo',
  finished: 'Finalizado',
  ended: 'Culminado',
}

export const LOSS_TYPE_LABELS: Record<string, string> = {
  mortality: 'Mortalidade',
  culled: 'Descarte',
}

export const LOSS_CAUSES = [
  'Doença', 'Calor', 'Frio', 'Predador', 'Esmagamento', 'Canibalismo', 'Acidente', 'Causa desconhecida',
]

export function birdTypeLabel(value?: string | null) {
  return (value && BIRD_TYPE_LABELS[value]) || value || '—'
}

export function statusLabel(value?: string | null) {
  return (value && STATUS_LABELS[value]) || value || '—'
}

export function statusClass(value?: string | null) {
  if (value === 'active') return 'bg-green-100 text-green-800'
  if (value === 'finished') return 'bg-blue-100 text-blue-800'
  return 'bg-red-100 text-red-800'
}

export function formatNumber(value?: number | null) {
  return typeof value === 'number' && Number.isFinite(value) ? value.toLocaleString('pt-MZ') : '—'
}

export function formatMZN(value?: number | null) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '—'
  return new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(value)
}

/** 'YYYY-MM-DD' → 'DD/MM/YYYY' sem depender do fuso horário. */
export function formatDate(value?: string | null) {
  if (!value) return '—'
  const [year, month, day] = value.slice(0, 10).split('-')
  return year && month && day ? `${day}/${month}/${year}` : '—'
}

export function formatAge(days?: number | null) {
  if (typeof days !== 'number') return '—'
  if (days < 14) return `${days} ${days === 1 ? 'dia' : 'dias'}`
  const weeks = Math.floor(days / 7)
  const rest = days % 7
  return rest ? `${weeks} sem ${rest} d` : `${weeks} sem`
}

/**
 * Fase do lote por idade. São intervalos típicos de referência; cada linhagem
 * tem o seu manual e estes limites devem ser ajustados à genética usada.
 */
export function batchPhase(birdType?: string | null, days?: number | null) {
  if (typeof days !== 'number') return null
  if (birdType === 'broilers') {
    if (days <= 14) return 'Inicial'
    if (days <= 28) return 'Crescimento'
    return 'Acabamento'
  }
  if (birdType === 'layers' || birdType === 'breeders') {
    if (days <= 42) return 'Cria'
    if (days <= 119) return 'Recria'
    return 'Produção'
  }
  return null
}