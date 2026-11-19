// Catálogo PADRÃO de linhagens comerciais. Não é a lista usada nos formulários:
// serve só para o botão «Importar catálogo padrão» em Configurações → Genéticas,
// que copia estas linhagens para a base de dados da quinta. A partir daí a lista
// é gerida na base de dados (adicionar, editar, desativar).

export interface GeneticGroup {
  label: string
  birdType: 'layers' | 'broilers'
  options: string[]
}

export const GENETIC_GROUPS: GeneticGroup[] = [
  {
    label: 'Postura · ovos castanhos',
    birdType: 'layers',
    options: [
      'Lohmann Brown', 'Lohmann Brown Lite', 'Hy-Line Brown', 'ISA Brown', 'Bovans Brown',
      'Dekalb Brown', 'Hisex Brown', 'Novogen Brown', 'Shaver Brown', 'Tetra Brown',
    ],
  },
  {
    label: 'Postura · ovos brancos',
    birdType: 'layers',
    options: [
      'Lohmann LSL-Lite', 'Hy-Line W-36', 'Hy-Line W-80', 'Hy-Line W-77', 'ISA White',
      'Bovans White', 'Dekalb White', 'Hisex White', 'Novogen White', 'Shaver White',
    ],
  },
  {
    label: 'Corte · crescimento rápido',
    birdType: 'broilers',
    options: ['Cobb 500', 'Cobb 700', 'Ross 308', 'Ross 708', 'Ross 308 AP', 'Arbor Acres Plus', 'Hubbard Flex', 'Hybro PG+'],
  },
  {
    label: 'Corte · crescimento lento / caipira',
    birdType: 'broilers',
    options: ['Sasso', 'Hubbard JA87', 'Kuroiler', 'Boschveld', 'Potchefstroom Koekoek', 'Frango caipira / crioulo'],
  },
]

export function defaultCatalog() {
  return GENETIC_GROUPS.flatMap((group) =>
    group.options.map((name) => ({ genetic_name: name, bird_type: group.birdType, category: group.label }))
  )
}