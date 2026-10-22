'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronDown, Brain, Camera, Wind, MessageCircle, Smartphone, TrendingUp, BarChart3, Zap, AlertTriangle, Users, Leaf } from 'lucide-react'

export default function HULAAgro() {
  const [activeTab, setActiveTab] = useState('features')

  return (
    <div className="bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 min-h-screen text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-slate-900/95 backdrop-blur border-b border-green-500/30">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Leaf className="w-8 h-8 text-green-400" />
            <span className="text-2xl font-bold text-green-400">HULA Agro</span>
          </div>
          <button className="px-6 py-2 bg-green-500 text-slate-900 font-bold rounded-lg hover:bg-green-400 transition">
            Começar Agora
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-green-500/10 -z-10" />
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-green-300 via-green-400 to-yellow-300 bg-clip-text text-transparent">
            HULA Agro
          </h1>
          <p className="text-2xl md:text-3xl text-green-100 mb-8 max-w-3xl mx-auto">
            A Plataforma AgriTech Completa para Avicultura Moderna
          </p>
          <p className="text-lg text-gray-300 mb-12 max-w-2xl mx-auto">
            Inteligência Artificial + IoT + Marketplace Integrado = Máxima Produtividade e Lucro
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button className="px-8 py-3 bg-green-500 text-slate-900 font-bold rounded-lg hover:bg-green-400 transition text-lg">
              Solicitar Demo
            </button>
            <button className="px-8 py-3 border-2 border-green-400 text-green-400 font-bold rounded-lg hover:bg-green-400/10 transition text-lg">
              Ver Plataforma
            </button>
          </div>
          
          {/* Hero Image */}
          <div className="mt-16 rounded-2xl overflow-hidden border-2 border-green-500/50 shadow-2xl">
            <Image
              src="/hula-agro-hero.jpg"
              alt="HULA Agro Platform Visualization"
              width={1200}
              height={600}
              className="w-full h-auto object-cover"
              priority
            />
          </div>
          
          {/* Scroll Indicator */}
          <div className="mt-12 animate-bounce">
            <ChevronDown className="w-8 h-8 mx-auto text-green-400" />
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 px-4 bg-slate-800/50 border-y border-green-500/30">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { number: 'Produção', label: 'Registos por lote' },
            { number: 'Sanidade', label: 'Acompanhamento integrado' },
            { number: 'Custos', label: 'Dados financeiros' },
            { number: 'Análises', label: 'Indicadores da exploração' }
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-xl md:text-2xl font-bold text-green-400 mb-2">{stat.number}</p>
              <p className="text-gray-300">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4 text-green-300">Funcionalidades Essenciais</h2>
          <p className="text-center text-gray-300 mb-16 max-w-2xl mx-auto">
            Tudo que você precisa para gerenciar sua avicultura em um só lugar
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Zap, title: 'Gestão de Lotes', desc: 'Entrada de pintos, idade, população, genética' },
              { icon: TrendingUp, title: 'Produção', desc: 'Ovos, peso das aves, conversão alimentar (FCR)' },
              { icon: AlertTriangle, title: 'Mortalidade', desc: 'Rastreamento por dia, causa da morte' },
              { icon: Leaf, title: 'Alimentação', desc: 'Consumo de ração, custos, análise nutricional' },
              { icon: Users, title: 'Saúde', desc: 'Vacinação, medicamentos, histórico veterinário' },
              { icon: BarChart3, title: 'Financeiro', desc: 'Custos, lucro, vendas, análise de ROI' }
            ].map((feat, i) => (
              <div key={i} className="bg-slate-800/80 border border-green-500/30 rounded-xl p-6 hover:border-green-400 transition group">
                <feat.icon className="w-10 h-10 text-green-400 mb-4 group-hover:scale-110 transition" />
                <h3 className="text-xl font-bold mb-2 text-green-300">{feat.title}</h3>
                <p className="text-gray-300">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Advanced Differentials */}
      <section className="py-24 px-4 bg-gradient-to-r from-green-900/30 to-yellow-900/30 border-y border-green-500/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4 text-yellow-300">Diferenciais Avançados</h2>
          <p className="text-center text-gray-300 mb-16 max-w-2xl mx-auto">
            Tecnologia de ponta que coloca você à frente da concorrência
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                icon: Brain,
                title: 'IA Preditiva',
                items: ['Previsão de mortalidade', 'Otimização de produção', 'Crescimento das aves'],
                color: 'from-purple-500 to-blue-500'
              },
              {
                icon: Camera,
                title: 'Diagnóstico por Câmera',
                items: ['Detecta aves doentes', 'Reconhece comportamentos anormais', 'Alertas automáticos em tempo real'],
                color: 'from-red-500 to-orange-500'
              },
              {
                icon: Wind,
                title: 'Sensores Ambientais IoT',
                items: ['Temperatura e umidade', 'Amônia e CO₂', 'Alertas inteligentes de ventilação'],
                color: 'from-blue-500 to-cyan-500'
              },
              {
                icon: MessageCircle,
                title: 'Assistente Virtual IA',
                items: ['ChatGPT para avicultura', 'Suporte 24/7', 'Recomendações personalizadas'],
                color: 'from-green-500 to-emerald-500'
              },
              {
                icon: Smartphone,
                title: 'App Mobile Offline',
                items: ['Funciona sem internet', 'Sincroniza dados automaticamente', 'Interface intuitiva'],
                color: 'from-indigo-500 to-purple-500'
              },
              {
                icon: TrendingUp,
                title: 'Marketplace Integrado',
                items: ['Vender frango e ovos', 'Comprar ração direto', 'Integração com financeiro'],
                color: 'from-yellow-500 to-amber-500'
              }
            ].map((diff, i) => (
              <div key={i} className={`bg-slate-800/80 border border-green-500/30 rounded-xl p-8 hover:border-green-400 transition`}>
                <div className={`bg-gradient-to-br ${diff.color} p-3 w-fit rounded-lg mb-4`}>
                  <diff.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-green-300">{diff.title}</h3>
                <ul className="space-y-2">
                  {diff.items.map((item, j) => (
                    <li key={j} className="flex items-center gap-2 text-gray-300">
                      <span className="w-2 h-2 bg-green-400 rounded-full" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* System Architecture Visualization */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 text-green-300">Arquitetura Integrada</h2>

          {/* Simplified Architecture Diagram */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Input Layer */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-yellow-300 mb-4">📍 Camada de Entrada</h3>
              <div className="bg-slate-800 border border-yellow-500/50 rounded-lg p-4 text-sm">
                <p className="font-semibold text-yellow-300 mb-2">Aviários</p>
                <p className="text-gray-300">Sensores IoT</p>
                <p className="text-gray-300">Câmeras IA</p>
                <p className="text-gray-300">Mobile App</p>
              </div>
            </div>

            {/* Processing Layer */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-green-300 mb-4">⚙️ Camada de Processamento</h3>
              <div className="bg-slate-800 border border-green-500/50 rounded-lg p-4 text-sm">
                <p className="font-semibold text-green-300 mb-2">IA & Analytics</p>
                <p className="text-gray-300">Processamento de imagem</p>
                <p className="text-gray-300">Modelos preditivos</p>
                <p className="text-gray-300">Alertas inteligentes</p>
              </div>
            </div>

            {/* Output Layer */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-blue-300 mb-4">📊 Camada de Saída</h3>
              <div className="bg-slate-800 border border-blue-500/50 rounded-lg p-4 text-sm">
                <p className="font-semibold text-blue-300 mb-2">Dashboard & Ações</p>
                <p className="text-gray-300">Relatórios em tempo real</p>
                <p className="text-gray-300">Marketplace</p>
                <p className="text-gray-300">Benchmark regional</p>
              </div>
            </div>
          </div>

          {/* Data Flow Visualization */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-700 border border-green-500/30 rounded-xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-center">
              {['🐔 Aviário', '📹 Câmera IA', '🧠 Processamento', '📊 Dashboard', '💰 Marketplace'].map((step, i) => (
                <div key={i}>
                  <div className="text-3xl mb-2">{step.split(' ')[0]}</div>
                  <p className="text-sm text-gray-300">{step.split(' ').slice(1).join(' ')}</p>
                  {i < 4 && <div className="text-2xl text-green-400 mt-2">→</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benchmark Section */}
      <section className="py-24 px-4 bg-slate-800/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 text-green-300">Benchmark de Produção</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="rounded-xl border border-green-500/30 bg-slate-800 p-8">
              <h3 className="text-xl font-bold text-yellow-300">Benchmark regional</h3>
              <p className="mt-3 text-sm leading-6 text-gray-300">A comparação será apresentada quando existirem dados reais da exploração e uma fonte regional validada.</p>
            </div>
            <div className="rounded-xl border border-green-500/30 bg-slate-800 p-8">
              <h3 className="text-xl font-bold text-yellow-300">Análise de rentabilidade</h3>
              <p className="mt-3 text-sm leading-6 text-gray-300">Os resultados financeiros dependem dos custos e da produção efetivamente registados na conta.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4 text-green-300">Dashboard em Tempo Real</h2>
          <p className="text-center text-gray-300 mb-12 max-w-2xl mx-auto">
            Visualize todos os dados do seu aviário em um único lugar
          </p>

          <div className="bg-gradient-to-br from-slate-800 to-slate-700 border border-green-500/30 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6">
              {['Lotes', 'Produção', 'Mortalidade', 'Consumo de ração'].map((label) => (
                <div key={label} className="rounded-lg border border-green-500/20 bg-slate-900/80 p-4">
                  <p className="mb-2 text-xs uppercase tracking-widest text-gray-400">{label}</p>
                  <p className="text-sm font-medium text-gray-300">Aguardando dados</p>
                </div>
              ))}
            </div>

            {/* Graph Area */}
            <div className="px-6 pb-6">
              <div className="flex h-64 items-center justify-center rounded-lg border border-green-500/20 bg-slate-900/50 p-6 text-center text-sm text-gray-400">
                O gráfico será preenchido com os registos reais de produção da exploração.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 px-4 bg-gradient-to-r from-green-900/50 to-yellow-900/50 border-y border-green-500/30">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6 text-green-300">Pronto para Transformar sua Avicultura?</h2>
          <p className="text-xl text-gray-300 mb-10">
            Organize a gestão da sua exploração com registos e indicadores num só lugar.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button className="px-10 py-4 bg-green-500 text-slate-900 font-bold rounded-lg hover:bg-green-400 transition text-lg">
              Começar Agora (Grátis)
            </button>
            <button className="px-10 py-4 border-2 border-green-400 text-green-400 font-bold rounded-lg hover:bg-green-400/10 transition text-lg">
              Agendar Demonstração
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-green-500/30 py-12 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {[
            { title: 'Produto', items: ['Dashboard', 'Mobile App', 'IA Preditiva'] },
            { title: 'Recursos', items: ['Documentação', 'Blog', 'Tutoriais'] },
            { title: 'Empresa', items: ['Sobre', 'Contato', 'Carreiras'] },
            { title: 'Legal', items: ['Privacidade', 'Termos', 'Segurança'] }
          ].map((col, i) => (
            <div key={i}>
              <p className="font-bold text-green-400 mb-3">{col.title}</p>
              <ul className="space-y-2">
                {col.items.map((item, j) => (
                  <li key={j} className="text-gray-400 hover:text-green-400 transition cursor-pointer">{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="text-center border-t border-green-500/30 pt-8 text-gray-400">
          <p>&copy; {new Date().getFullYear()} HULA Agro. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
