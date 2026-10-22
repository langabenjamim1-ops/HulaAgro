'use client'

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Search, Store, Plus, PackageCheck, RefreshCw, MapPin, Tag, Handshake } from 'lucide-react'

type Listing = { id:string; seller_user_id:string; title:string; description:string; category:string; listing_type:string; item_condition:string; quantity:number; unit:string; unit_price:number; currency:string; location:string|null; image_url:string|null; status:string; created_at:string; seller?:{name:string;location:string|null}|null }
type Order = { id:string; listing_id:string; listing_title:string; buyer_user_id:string; seller_user_id:string; quantity:number; unit:string; unit_price:number; total:number; currency:string; buyer_note:string|null; status:string; created_at:string }

const categories = [
  ['eggs','Ovos'],['birds','Aves'],['feed','Ração'],['medicines','Medicamentos'],['equipment','Equipamentos'],['services','Serviços'],['other','Outros'],
]
const orderStatus:Record<string,string> = {pending:'Pendente',accepted:'Aceite',rejected:'Recusado',cancelled:'Cancelado',completed:'Concluído'}
const categoryName = (value:string) => categories.find(([key])=>key===value)?.[1] ?? value
const money = (value:number,currency:string) => new Intl.NumberFormat('pt-MZ',{style:'currency',currency}).format(Number(value)||0)

export default function MarketplacePage() {
  const [tab,setTab] = useState<'browse'|'mine'|'orders'>('browse')
  const [listings,setListings] = useState<Listing[]>([])
  const [orders,setOrders] = useState<Order[]>([])
  const [userId,setUserId] = useState('')
  const [query,setQuery] = useState('')
  const [category,setCategory] = useState('')
  const [loading,setLoading] = useState(false)
  const [submitting,setSubmitting] = useState(false)
  const [error,setError] = useState('')
  const [notice,setNotice] = useState('')
  const [showCreate,setShowCreate] = useState(false)
  const [buyListing,setBuyListing] = useState<Listing|null>(null)

  const loadListings = useCallback(async () => {
    const params = new URLSearchParams()
    if (tab==='mine') params.set('scope','mine')
    if (tab==='browse' && category) params.set('category',category)
    if (tab==='browse' && query.trim()) params.set('q',query.trim())
    const response = await fetch(`/api/marketplace/listings?${params}`,{cache:'no-store'})
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Não foi possível carregar os anúncios.')
    setListings(data.listings ?? [])
  },[tab,category,query])
  const loadOrders = useCallback(async () => {
    const response = await fetch('/api/marketplace/orders',{cache:'no-store'})
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Não foi possível carregar os pedidos.')
    setOrders(data.orders ?? []); setUserId(data.user_id ?? '')
  },[])
  const refresh = useCallback(async () => {
    setLoading(true); setError('')
    try { if (tab==='orders') await loadOrders(); else await loadListings() }
    catch(e) { setError(e instanceof Error?e.message:'Falha ao carregar o marketplace.') }
    finally { setLoading(false) }
  },[tab,loadListings,loadOrders])
  useEffect(()=>{void refresh()},[refresh])

  async function send(path:string,method:string,body?:unknown) {
    const response = await fetch(path,{method,headers:{'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})})
    const data = await response.json()
    if (!response.ok) throw new Error(data.error||'Não foi possível concluir a operação.')
    return data
  }
  async function createListing(event:FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSubmitting(true); setError(''); setNotice('')
    const form = new FormData(event.currentTarget)
    const body = Object.fromEntries(form.entries())
    try { await send('/api/marketplace/listings','POST',body); setShowCreate(false); setTab('mine'); setNotice('Anúncio publicado.'); await loadListings() }
    catch(e) { setError(e instanceof Error?e.message:'Não foi possível publicar.') }
    finally { setSubmitting(false) }
  }
  async function placeOrder(event:FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!buyListing) return
    setSubmitting(true); setError('')
    const form = new FormData(event.currentTarget)
    try { await send('/api/marketplace/orders','POST',{listing_id:buyListing.id,quantity:Number(form.get('quantity')),buyer_note:String(form.get('buyer_note')||'')}); setBuyListing(null); setTab('orders'); setNotice('Pedido enviado ao vendedor. O valor ainda não foi cobrado.'); await loadOrders() }
    catch(e) { setError(e instanceof Error?e.message:'Não foi possível enviar o pedido.') }
    finally { setSubmitting(false) }
  }
  async function updateListing(listing:Listing,status:string) {
    setError(''); setNotice('')
    try { await send(`/api/marketplace/listings/${listing.id}`,'PATCH',{status}); setNotice('Anúncio actualizado.'); await loadListings() }
    catch(e) { setError(e instanceof Error?e.message:'Não foi possível actualizar o anúncio.') }
  }
  async function updateOrder(order:Order,status:string) {
    setError(''); setNotice('')
    try { await send('/api/marketplace/orders','PATCH',{order_id:order.id,status}); setNotice('Pedido actualizado.'); await loadOrders() }
    catch(e) { setError(e instanceof Error?e.message:'Não foi possível actualizar o pedido.') }
  }

  const tabs = useMemo(()=>[['browse','Comprar'],['mine','Os meus anúncios'],['orders','Pedidos']] as const,[])
  const field='w-full rounded-lg border border-[#D6DCCB] bg-white px-3 py-2.5 text-sm text-[#283106] outline-none focus:border-[#718348]'

  return <main className="h-full overflow-y-auto bg-[#F5F6F1] p-5 text-[#283106] md:p-8">
    <header className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-bold tracking-widest text-[#718348]">HULA AGRO</p><h1 className="mt-1 text-2xl font-bold">Marketplace</h1><p className="mt-2 text-sm text-[#68705B]">Encontre artigos avícolas ou anuncie o que a sua exploração vende.</p></div><button onClick={()=>{setError('');setShowCreate(true)}} className="inline-flex items-center gap-2 rounded-lg bg-[#283106] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#3D4A2C]"><Plus className="h-4 w-4"/>Publicar anúncio</button></header>
    <p className="mt-4 text-xs text-[#68705B]">Pedidos reservam a quantidade; preço, pagamento e entrega são combinados entre comprador e vendedor.</p>
    <div className="mt-3 flex flex-wrap gap-2 border-b border-[#DDE2D4]">{tabs.map(([key,label])=><button key={key} onClick={()=>setTab(key)} className={`border-b-2 px-4 py-3 text-sm font-semibold ${tab===key?'border-[#53692E] text-[#283106]':'border-transparent text-[#78806B] hover:text-[#283106]'}`}>{label}</button>)}</div>
    {error&&<div role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error} {error.toLowerCase().includes('entre na sua conta')&&<Link href="/entrar" className="font-semibold underline">Entrar</Link>}</div>}
    {notice&&<div role="status" className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">{notice}</div>}
    {tab==='browse'&&<div className="mt-5 flex flex-wrap gap-2"><div className="relative min-w-[220px] flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#778066]"/><input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==='Enter'&&void refresh()} placeholder="Pesquisar artigos e serviços" className={`${field} pl-9`}/></div><select value={category} onChange={e=>setCategory(e.target.value)} className={`${field} w-auto min-w-40`}><option value="">Todas as categorias</option>{categories.map(([key,label])=><option key={key} value={key}>{label}</option>)}</select><button onClick={()=>void refresh()} className="rounded-lg border border-[#C8D0B8] bg-white px-4 py-2 text-sm font-medium">Pesquisar</button></div>}
    <div className="mt-5 flex items-center justify-between text-sm text-[#68705B]"><span>{tab==='orders'?`${orders.length} pedidos`:`${listings.length} anúncios`}</span><button onClick={()=>void refresh()} disabled={loading} aria-label="Actualizar" className="rounded-md p-2 hover:bg-white disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${loading?'animate-spin':''}`}/></button></div>
    {loading?<p className="mt-5 rounded-xl bg-white p-8 text-center text-sm text-[#68705B]">A carregar…</p>:tab==='orders'?<div className="mt-3 space-y-3">{orders.map(order=>{const isSeller=order.seller_user_id===userId; return <article key={order.id} className="rounded-xl border border-[#E0E5D8] bg-white p-4 sm:p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-semibold">{order.listing_title}</h2><p className="mt-1 text-sm text-[#68705B]">{isSeller?'Pedido recebido':'Pedido enviado'} · {order.quantity} {order.unit} · {money(order.total,order.currency)}</p>{order.buyer_note&&<p className="mt-2 text-sm">Nota: {order.buyer_note}</p>}<p className="mt-2 text-xs text-[#778066]">{new Date(order.created_at).toLocaleString('pt-PT')}</p></div><span className="rounded-full bg-[#EFF2E8] px-3 py-1 text-xs font-semibold">{orderStatus[order.status]||order.status}</span></div><div className="mt-4 flex flex-wrap gap-2">{order.status==='pending'&&isSeller&&<><button onClick={()=>void updateOrder(order,'accepted')} className="rounded-md bg-[#283106] px-3 py-2 text-xs font-semibold text-white">Aceitar pedido</button><button onClick={()=>void updateOrder(order,'rejected')} className="rounded-md border border-[#D6DCCB] px-3 py-2 text-xs font-semibold">Recusar</button></>}{order.status==='pending'&&!isSeller&&<button onClick={()=>void updateOrder(order,'cancelled')} className="rounded-md border border-[#D6DCCB] px-3 py-2 text-xs font-semibold">Cancelar pedido</button>}{order.status==='accepted'&&<button onClick={()=>void updateOrder(order,'completed')} className="rounded-md bg-[#283106] px-3 py-2 text-xs font-semibold text-white">Marcar como concluído</button>}</div></article>})}{!orders.length&&<Empty text="Ainda não tem pedidos de compra ou venda."/>}</div>:<div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{listings.map(listing=><article key={listing.id} className="flex flex-col overflow-hidden rounded-xl border border-[#E0E5D8] bg-white">{listing.image_url&&<img src={listing.image_url} alt="" className="h-40 w-full object-cover"/>}<div className="flex flex-1 flex-col p-4"><div className="flex items-start justify-between gap-2"><span className="rounded-full bg-[#EFF2E8] px-2.5 py-1 text-xs font-semibold">{categoryName(listing.category)}</span>{tab==='mine'&&<span className="text-xs text-[#68705B]">{listing.status==='active'?'Activo':listing.status==='paused'?'Pausado':listing.status==='sold'?'Sem stock':'Removido'}</span>}</div><h2 className="mt-3 text-lg font-bold">{listing.title}</h2><p className="mt-2 line-clamp-3 text-sm leading-5 text-[#68705B]">{listing.description}</p><div className="mt-4 flex items-center justify-between gap-3"><span className="text-lg font-bold">{money(Number(listing.unit_price),listing.currency)}<span className="ml-1 text-xs font-normal text-[#68705B]">/ {listing.unit}</span></span><span className="text-xs text-[#68705B]">{listing.quantity} disponíveis</span></div><div className="mt-3 flex flex-wrap gap-3 text-xs text-[#778066]"><span className="inline-flex items-center gap-1"><Store className="h-3.5 w-3.5"/>{listing.seller?.name||'Cliente HULA Agro'}</span>{listing.location&&<span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5"/>{listing.location}</span>}<span className="inline-flex items-center gap-1"><Tag className="h-3.5 w-3.5"/>{listing.item_condition==='new'?'Novo':listing.item_condition==='used'?'Usado':'Serviço'}</span></div><div className="mt-auto flex gap-2 pt-5">{tab==='browse'?<button onClick={()=>{setBuyListing(listing);setError('')}} disabled={listing.quantity<=0} className="flex-1 rounded-lg bg-[#283106] px-3 py-2.5 text-sm font-semibold text-white disabled:opacity-50"><Handshake className="mr-2 inline h-4 w-4"/>Pedir compra</button>:<><button onClick={()=>void updateListing(listing,listing.status==='active'?'paused':'active')} disabled={listing.status==='sold'||listing.status==='removed'} className="flex-1 rounded-lg border border-[#C8D0B8] px-3 py-2 text-xs font-semibold disabled:opacity-40">{listing.status==='active'?'Pausar':'Activar'}</button>{listing.status!=='removed'&&<button onClick={()=>void updateListing(listing,'removed')} className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700">Remover</button>}</>}</div></div></article>)}{!listings.length&&<div className="sm:col-span-2 xl:col-span-3"><Empty text={tab==='mine'?'Ainda não publicou anúncios.':'Não encontramos anúncios com estes filtros.'}/></div>}</div>}

    {showCreate&&<Modal title="Publicar anúncio" close={()=>setShowCreate(false)}><form onSubmit={createListing} className="grid gap-3 sm:grid-cols-2"><label className="text-sm font-medium sm:col-span-2">Título<input name="title" required minLength={4} maxLength={140} className={`${field} mt-1`}/></label><label className="text-sm font-medium">Categoria<select name="category" required className={`${field} mt-1`}>{categories.map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label><label className="text-sm font-medium">Tipo<select name="listing_type" className={`${field} mt-1`}><option value="product">Produto</option><option value="service">Serviço</option></select></label><label className="text-sm font-medium sm:col-span-2">Descrição<textarea name="description" required minLength={10} maxLength={5000} rows={4} className={`${field} mt-1`}/></label><label className="text-sm font-medium">Quantidade<input name="quantity" type="number" min="0.001" step="0.001" required className={`${field} mt-1`}/></label><label className="text-sm font-medium">Unidade<input name="unit" required maxLength={30} defaultValue="unidade" className={`${field} mt-1`}/></label><label className="text-sm font-medium">Preço por unidade<input name="unit_price" type="number" min="0" step="0.01" required className={`${field} mt-1`}/></label><label className="text-sm font-medium">Moeda<select name="currency" className={`${field} mt-1`}><option>MZN</option><option>ZAR</option><option>USD</option></select></label><label className="text-sm font-medium">Condição<select name="item_condition" className={`${field} mt-1`}><option value="new">Novo</option><option value="used">Usado</option><option value="not_applicable">Não aplicável</option></select></label><label className="text-sm font-medium">Localização<input name="location" maxLength={160} className={`${field} mt-1`}/></label><label className="text-sm font-medium sm:col-span-2">Imagem (URL opcional)<input name="image_url" type="url" placeholder="https://…" className={`${field} mt-1`}/></label><button disabled={submitting} className="rounded-lg bg-[#283106] px-4 py-3 text-sm font-semibold text-white disabled:opacity-50 sm:col-span-2">{submitting?'A publicar…':'Publicar anúncio'}</button></form></Modal>}
    {buyListing&&<Modal title="Pedir compra" close={()=>setBuyListing(null)}><p className="text-sm text-[#68705B]">{buyListing.title} — {money(Number(buyListing.unit_price),buyListing.currency)} por {buyListing.unit}. O pedido reserva o stock; não cobra pagamento.</p><form onSubmit={placeOrder} className="mt-4 space-y-3"><label className="block text-sm font-medium">Quantidade<input name="quantity" type="number" min="0.001" step="0.001" max={buyListing.quantity} required defaultValue="1" className={`${field} mt-1`}/></label><label className="block text-sm font-medium">Mensagem ao vendedor<textarea name="buyer_note" maxLength={1000} rows={3} className={`${field} mt-1`}/></label><button disabled={submitting} className="w-full rounded-lg bg-[#283106] px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">{submitting?'A enviar…':'Enviar pedido de compra'}</button></form></Modal>}
  </main>
}

function Empty({text}:{text:string}) { return <div className="rounded-xl border border-dashed border-[#CBD3BD] bg-white p-10 text-center"><PackageCheck className="mx-auto h-8 w-8 text-[#9AA785]"/><p className="mt-3 text-sm text-[#68705B]">{text}</p></div> }
function Modal({title,close,children}:{title:string;close:()=>void;children:React.ReactNode}) { return <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-3" onMouseDown={e=>{if(e.target===e.currentTarget)close()}}><section className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-5 shadow-xl sm:p-7"><div className="mb-5 flex items-center justify-between"><h2 className="text-xl font-bold">{title}</h2><button onClick={close} className="rounded-md px-3 py-1 text-sm text-[#68705B] hover:bg-[#F5F6F1]">Fechar</button></div>{children}</section></div> }
