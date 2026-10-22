'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage(''); setError('')
    const form = new FormData(event.currentTarget)
    const email = String(form.get('email') || '').trim().toLowerCase()
    const password = String(form.get('password') || '')
    if (password.length < 10) { setBusy(false); setError('A palavra-passe deve ter pelo menos 10 caracteres.'); return }
    const supabase = getSupabaseClient()
    const { data, error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: {
        full_name: String(form.get('full_name') || '').trim(),
        organization_name: String(form.get('organization_name') || '').trim(),
        farm_name: String(form.get('farm_name') || '').trim(),
        farm_location: String(form.get('farm_location') || '').trim(),
        phone: String(form.get('phone') || '').trim(),
      } },
    })
    setBusy(false)
    if (signupError) { setError(signupError.message); return }
    if (data.session) router.replace('/dashboard')
    else setMessage('Conta criada. Confirme o endereço de email através do link enviado para concluir a inscrição.')
  }

  const field = 'w-full rounded-lg border border-[#D6DCCB] bg-white px-3 py-2.5 text-sm text-[#283106] outline-none focus:border-[#6F833D] focus:ring-2 focus:ring-[#6F833D]/20'
  return <main className="h-screen overflow-y-auto bg-[#F5F6F1] px-4 py-8 text-[#283106]">
    <div className="mx-auto max-w-2xl rounded-2xl border border-[#E2E6D9] bg-white p-6 shadow-sm sm:p-9">
      <Link href="/" className="text-sm font-semibold text-[#65783A]">← HULA Agro</Link>
      <h1 className="mt-5 text-2xl font-bold">Inscreva o seu aviário</h1>
      <p className="mt-2 text-sm text-[#68705B]">Crie a conta da sua exploração e comece o período de avaliação. A base de dados será criada automaticamente após confirmar a inscrição.</p>
      <form onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium">Seu nome<input className={`${field} mt-1`} name="full_name" required autoComplete="name" /></label>
        <label className="text-sm font-medium">Telefone<input className={`${field} mt-1`} name="phone" autoComplete="tel" /></label>
        <label className="text-sm font-medium sm:col-span-2">Nome da empresa / organização<input className={`${field} mt-1`} name="organization_name" required autoComplete="organization" /></label>
        <label className="text-sm font-medium">Nome do aviário<input className={`${field} mt-1`} name="farm_name" required /></label>
        <label className="text-sm font-medium">Localização<input className={`${field} mt-1`} name="farm_location" /></label>
        <label className="text-sm font-medium sm:col-span-2">Email<input className={`${field} mt-1`} name="email" type="email" required autoComplete="email" /></label>
        <label className="text-sm font-medium sm:col-span-2">Palavra-passe<input className={`${field} mt-1`} name="password" type="password" minLength={10} required autoComplete="new-password" /><span className="mt-1 block text-xs font-normal text-[#68705B]">Mínimo de 10 caracteres.</span></label>
        {error && <p role="alert" className="sm:col-span-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {message && <p role="status" className="sm:col-span-2 rounded-lg bg-green-50 p-3 text-sm text-green-800">{message}</p>}
        <button disabled={busy} className="rounded-lg bg-[#283106] px-4 py-3 text-sm font-semibold text-white hover:bg-[#3D4A2C] disabled:opacity-50 sm:col-span-2">{busy ? 'A criar conta…' : 'Criar conta e iniciar avaliação'}</button>
      </form>
      <p className="mt-5 text-center text-sm text-[#68705B]">Já tem conta? <Link className="font-semibold text-[#53692E] underline" href="/entrar">Entrar</Link></p>
    </div>
  </main>
}
