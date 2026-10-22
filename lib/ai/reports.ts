import { generateFarmSummary } from './farm-data'

export interface ReportData {
  title: string
  date: string
  summary: string
  sections: ReportSection[]
}

export interface ReportSection {
  title: string
  content: string
  metrics?: Record<string, string | number>
}

export async function generateDailyReport(): Promise<ReportData> {
  const summary = await generateFarmSummary()
  const today = new Date().toLocaleDateString('pt-BR')

  const sections: ReportSection[] = []

  if (summary?.flocks) {
    sections.push({
      title: 'Status dos Lotes',
      content: `Lotes ativos: ${summary.flocks}`,
      metrics: {
        total_birds: summary.activeBirds || 0,
        flocks: summary.flocks,
      },
    })
  }

  if (summary?.recentMortality && summary.recentMortality.length > 0) {
    const totalMortality = summary.recentMortality.reduce(
      (sum: number, m: any) => sum + (m.mortality_count || 0),
      0
    )
    sections.push({
      title: 'Mortalidade',
      content: `Mortes registradas: ${totalMortality}`,
      metrics: {
        total_deaths: totalMortality,
        records: summary.recentMortality.length,
      },
    })
  }

  if (summary?.feedStatus && summary.feedStatus.length > 0) {
    const totalFeed = summary.feedStatus.reduce(
      (sum: number, f: any) => sum + (f.feed_consumption || 0),
      0
    )
    sections.push({
      title: 'Consumo de Ração',
      content: `Consumo total: ${totalFeed.toFixed(2)} kg`,
      metrics: {
        total_feed_kg: parseFloat(totalFeed.toFixed(2)),
      },
    })
  }

  return {
    title: 'Relatório Diário da Fazenda',
    date: today,
    summary: `Relatório gerado em ${today}`,
    sections,
  }
}

export async function generateWeeklyReport(): Promise<ReportData> {
  const summary = await generateFarmSummary()
  const weekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')
  const today = new Date().toLocaleDateString('pt-BR')

  const sections: ReportSection[] = []

  if (summary?.flocks) {
    sections.push({
      title: 'Resumo da Semana',
      content: `Período: ${weekStart} a ${today}`,
      metrics: {
        total_flocks: summary.flocks,
        total_birds: summary.activeBirds || 0,
      },
    })
  }

  if (summary?.recentMortality && summary.recentMortality.length > 0) {
    const totalMortality = summary.recentMortality.reduce(
      (sum: number, m: any) => sum + (m.mortality_count || 0),
      0
    )
    const avgDaily = (totalMortality / 7).toFixed(2)
    sections.push({
      title: 'Análise de Mortalidade',
      content: `Total de mortes: ${totalMortality}, Média diária: ${avgDaily}`,
      metrics: {
        total_mortality: totalMortality,
        daily_average: parseFloat(avgDaily),
      },
    })
  }

  if (summary?.financial && summary.financial.length > 0) {
    const totalExpenses = summary.financial.reduce((sum: number, f: any) => sum + (f.amount || 0), 0)
    sections.push({
      title: 'Análise Financeira',
      content: `Despesas da semana: ${totalExpenses.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}`,
      metrics: {
        total_expenses: parseFloat(totalExpenses.toFixed(2)),
      },
    })
  }

  return {
    title: 'Relatório Semanal da Fazenda',
    date: `${weekStart} a ${today}`,
    summary: `Resumo do período de ${weekStart} a ${today}`,
    sections,
  }
}

export async function generateMonthlyReport(): Promise<ReportData> {
  const summary = await generateFarmSummary()
  const month = new Date().toLocaleDateString('pt-MZ', { month: 'long', year: 'numeric' })

  const sections: ReportSection[] = []

  if (summary?.flocks) {
    sections.push({
      title: 'Visão Geral Mensal',
      content: `Mês: ${month}`,
      metrics: {
        active_flocks: summary.flocks,
        total_birds: summary.activeBirds || 0,
      },
    })
  }

  if (summary?.recentMortality && summary.recentMortality.length > 0) {
    const totalMortality = summary.recentMortality.reduce(
      (sum: number, m: any) => sum + (m.mortality_count || 0),
      0
    )
    sections.push({
      title: 'Saúde do Rebanho',
      content: `Total de mortes no mês: ${totalMortality}`,
      metrics: {
        mortality_count: totalMortality,
      },
    })
  }

  if (summary?.financial && summary.financial.length > 0) {
    const totalExpenses = summary.financial.reduce((sum: number, f: any) => sum + (f.amount || 0), 0)

    sections.push({
      title: 'Despesas registadas',
      content: `Despesas do mês: ${totalExpenses.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}`,
      metrics: {
        expenses: parseFloat(totalExpenses.toFixed(2)),
      },
    })
  }

  return {
    title: 'Relatório Mensal da Fazenda',
    date: month,
    summary: `Análise completa de ${month}`,
    sections,
  }
}

export async function generateProductionReport(): Promise<ReportData> {
  const summary = await generateFarmSummary()
  const today = new Date().toLocaleDateString('pt-BR')

  const sections: ReportSection[] = []

  if (summary?.flocks) {
    sections.push({
      title: 'Produção Atual',
      content: `Lotes em produção: ${summary.flocks}`,
      metrics: {
        flocks: summary.flocks,
        birds: summary.activeBirds || 0,
      },
    })
  }

  if (summary?.feedStatus && summary.feedStatus.length > 0) {
    const totalFeed = summary.feedStatus.reduce(
      (sum: number, f: any) => sum + (f.feed_consumption || 0),
      0
    )
    const avgFeed = totalFeed / summary.feedStatus.length
    sections.push({
      title: 'Consumo de Ração',
      content: `Consumo diário médio: ${avgFeed.toFixed(2)} kg`,
      metrics: {
        total_feed: parseFloat(totalFeed.toFixed(2)),
        daily_average: parseFloat(avgFeed.toFixed(2)),
      },
    })
  }

  return {
    title: 'Relatório de Produção',
    date: today,
    summary: 'Análise de produção atual',
    sections,
  }
}
