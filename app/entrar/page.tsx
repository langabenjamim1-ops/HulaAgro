'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError('')
    const form = new FormData(event.currentTarget)
    const { error: loginError } = await getSupabaseClient().auth.signInWithPassword({ email: String(form.get('email') || '').trim(), password: String(form.get('password') || '') })
    setBusy(false)
    if (loginError) { setError('Email ou palavra-passe inválidos.'); return }
    router.replace('/dashboard'); router.refresh()
  }
  const field = 'w-full rounded-lg border border-[#D6DCCB] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#6F833D] focus:ring-2 focus:ring-[#6F833D]/20'
  return <main className="flex h-screen items-center justify-center overflow-y-auto bg-[#F5F6F1] px-4 py-8 text-[#283106]">
    <section className="w-full max-w-md rounded-2xl border border-[#E2E6D9] bg-white p-7 shadow-sm sm:p-9">
      <Link href="/" className="text-sm font-semibold text-[#65783A]">← HULA Agro</Link>
      <h1 className="mt-5 text-2xl font-bold">Entrar no HULA Agro</h1>
      <p className="mt-2 text-sm text-[#68705B]">Aceda à conta da sua exploração.</p>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <label className="block text-sm font-medium">Email<input className={`${field} mt-1`} name="email" type="email" required autoComplete="email" /></label>
        <label className="block text-sm font-medium">Palavra-passe<input className={`${field} mt-1`} name="password" type="password" required autoComplete="current-password" /></label>
        {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <button disabled={busy} className="w-full rounded-lg bg-[#283106] px-4 py-3 text-sm font-semibold text-white hover:bg-[#3D4A2C] disabled:opacity-50">{busy ? 'A entrar…' : 'Entrar'}</button>
      </form>
      <p className="mt-5 text-center text-sm text-[#68705B]">Novo cliente? <Link className="font-semibold text-[#53692E] underline" href="/inscrever">Criar conta</Link></p>
    </section>
  </main>
}
