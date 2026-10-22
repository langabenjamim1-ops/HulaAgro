import { Activity, Database } from 'lucide-react'

export function ModuleEmptyPage({ title, description, requirement = 'Quando houver registos reais nesta área, serão apresentados aqui.' }: { title: string; description: string; requirement?: string }) {
  return <div className="space-y-6 pb-8">
    <section className="rounded-2xl bg-[#283106] p-6 text-white sm:p-8"><div className="flex items-center gap-3"><span className="rounded-xl bg-white/10 p-3"><Activity className="h-5 w-5" /></span><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#D1D8BD]">Gestão integrada</p><h1 className="mt-1 text-2xl font-bold sm:text-3xl">{title}</h1></div></div><p className="mt-3 max-w-2xl text-sm leading-6 text-[#E0E4D5]">{description}</p></section>
    <section className="rounded-xl border border-[#E2E5D9] bg-white px-6 py-12 text-center shadow-sm"><Database className="mx-auto h-9 w-9 text-[#A0AA82]" /><h2 className="mt-3 font-bold text-[#283106]">Sem dados registados</h2><p className="mx-auto mt-1 max-w-xl text-sm leading-6 text-[#727964]">{requirement}</p></section>
  </div>
}
