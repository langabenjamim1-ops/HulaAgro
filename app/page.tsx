import Link from 'next/link'

export default function Home() {
  return <main className="flex h-screen items-center justify-center overflow-y-auto bg-[#F9F9F9] px-5 py-10 text-[#515062]">
    <section className="w-full max-w-3xl rounded-3xl border border-[#E2E8E6] bg-white p-8 shadow-sm sm:p-12">
      <p className="text-xs font-bold tracking-[0.2em] text-[#2FB394]">HULA AGRO</p>
      <h1 className="mt-4 max-w-2xl text-3xl font-bold leading-tight sm:text-5xl">Gestão avícola para a sua exploração</h1>
      <p className="mt-5 max-w-xl text-base leading-7 text-[#7D8B89]">Organize lotes, produção, saúde, ambiente e custos num só sistema. Crie uma conta para a sua empresa e associe o seu aviário.</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/inscrever" className="rounded-lg bg-[#515062] px-5 py-3 text-sm font-semibold text-white hover:bg-[#5F5E73]">Inscrever a minha exploração</Link>
        <Link href="/entrar" className="rounded-lg border border-[#C9D4D1] px-5 py-3 text-sm font-semibold text-[#515062] hover:bg-[#F9F9F9]">Já tenho conta</Link>
      </div>
    </section>
  </main>
}
