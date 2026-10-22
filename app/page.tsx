import Link from 'next/link'

export default function Home() {
  return <main className="flex h-screen items-center justify-center overflow-y-auto bg-[#F5F6F1] px-5 py-10 text-[#283106]">
    <section className="w-full max-w-3xl rounded-3xl border border-[#E2E6D9] bg-white p-8 shadow-sm sm:p-12">
      <p className="text-xs font-bold tracking-[0.2em] text-[#718348]">HULA AGRO</p>
      <h1 className="mt-4 max-w-2xl text-3xl font-bold leading-tight sm:text-5xl">Gestão avícola para a sua exploração</h1>
      <p className="mt-5 max-w-xl text-base leading-7 text-[#68705B]">Organize lotes, produção, saúde, ambiente e custos num só sistema. Crie uma conta para a sua empresa e associe o seu aviário.</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/inscrever" className="rounded-lg bg-[#283106] px-5 py-3 text-sm font-semibold text-white hover:bg-[#3D4A2C]">Inscrever a minha exploração</Link>
        <Link href="/entrar" className="rounded-lg border border-[#B8C3A3] px-5 py-3 text-sm font-semibold text-[#283106] hover:bg-[#F5F6F1]">Já tenho conta</Link>
      </div>
    </section>
  </main>
}
