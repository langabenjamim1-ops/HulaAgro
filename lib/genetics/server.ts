export const GENETIC_BIRD_TYPES = ['layers', 'broilers', 'breeders'] as const

/** Código curto a partir do nome: "Lohmann Brown" → "LOHMANN-BROWN". */
export function slugCode(name: string) {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50) || 'GEN'
}

export function geneticsError(error: { code?: string; message: string }) {
  if (error.code === '23505') return 'Já existe uma genética com este nome ou código nesta quinta.'
  if (error.code === '42703' || error.code === '42P01') {
    return `A base de dados ainda não está preparada. Execute a migração 11_genetics.sql. (${error.message})`
  }
  return error.message
}