'use client'

import { FormEvent, ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Search, Store, Plus, PackageCheck, RefreshCw, MapPin, Heart, ShoppingBag,
  SlidersHorizontal, X, ChevronDown, Egg, Bird, Wheat, Pill, Wrench, Handshake, Box,
} from 'lucide-react'
import { Slider } from '@/components/ui/slider'

type Listing = { id:string; seller_user_id:string; title:string; description:string; category:string; listing_type:string; item_condition:string; quantity:number; unit:string; unit_price:number; currency:string; location:string|null; image_url:string|null; status:string; created_at:string; seller?:{name:string;location:string|null}|null }
type Order = { id:string; listing_id:string; listing_title:string; buyer_user_id:string; seller_user_id:string; quantity:number; unit:string; unit_price:number; total:number; currency:string; buyer_note:string|null; status:string; created_at:string }
type Sort = 'recent'|'price_asc'|'price_desc'|'name'

const categories = [
  ['eggs','Ovos'],['birds','Aves'],['feed','Ração'],['medicines','Medicamentos'],['equipment','Equipamentos'],['services','Serviços'],['other','Outros'],
] as const
const categoryIcon:Record<string,typeof Egg> = { eggs:Egg, birds:Bird, feed:Wheat, medicines:Pill, equipment:Wrench, services:Handshake, other:Box }
const conditions = [['new','Novo'],['used','Usado'],['not_applicable','Serviço']] as const
const availability = [['in_stock','Em stock'],['low','Poucas unidades']] as const
const sortOptions:[Sort,string][] = [['recent','Mais recentes'],['price_asc','Preço: menor primeiro'],['price_desc','Preço: maior primeiro'],['name','Nome (A–Z)']]
const orderStatus:Record<string,string> = {pending:'Pendente',accepted:'Aceite',rejected:'Recusado',cancelled:'Cancelado',completed:'Concluído'}
const LOW_STOCK = 5
const NEW_DAYS = 7
const FAV_KEY = 'hula-marketplace-favourites'

const categoryName = (value:string) => categories.find(([key])=>key===value)?.[1] ?? value
const money = (value:number,currency:string) => new Intl.NumberFormat('pt-MZ',{style:'currency',currency,maximumFractionDigits:0}).format(Number(value)||0)
const isRecent = (iso:string) => Date.now() - new Date(iso).getTime() < NEW_DAYS*86400000
const toggle = <T,>(list:T[],value:T) => list.includes(value) ? list.filter(v=>v!==value) : [...list,value]

export default function MarketplacePage() {
  const [tab,setTab] = useState<'browse'|'mine'|'orders'>('browse')
  const [listings,setListings] = useState<Listing[]>([])
  const [orders,setOrders] = useState<Order[]>([])
  const [userId,setUserId] = useState('')
  const [loading,setLoading] = useState(false)
  const [submitting,setSubmitting] = useState(false)
  const [error,setError] = useState('')
  const [notice,setNotice] = useState('')
  const [showCreate,setShowCreate] = useState(false)
  const [buyListing,setBuyListing] = useState<Listing|null>(null)

  // filtros (aplicados no cliente sobre os anúncios carregados)
  const [query,setQuery] = useState('')
  const [selCategories,setSelCategories] = useState<string[]>([])
  const [selConditions,setSelConditions] = useState<string[]>([])
  const [selAvailability,setSelAvailability] = useState<string[]>([])
  const [selLocations,setSelLocations] = useState<string[]>([])
  const [currency,setCurrency] = useState('')
  const [range,setRange] = useState<[number,number]|null>(null)
  const [sort,setSort] = useState<Sort>('recent')
  const [showFilters,setShowFilters] = useState(false)
  const [favourites,setFavourites] = useState<string[]>([])
  const [onlyFavourites,setOnlyFavourites] = useState(false)

  useEffect(()=>{ try { setFavourites(JSON.parse(localStorage.getItem(FAV_KEY)||'[]')) } catch {} },[])
  function toggleFavourite(id:string) {
    setFavourites(prev=>{ const next = toggle(prev,id); try { localStorage.setItem(FAV_KEY,JSON.stringify(next)) } catch {} return next })
  }

  const loadListings = useCallback(async () => {
    const params = new URLSearchParams()
    if (tab==='mine') params.set('scope','mine')
    const response = await fetch(`/api/marketplace/listings?${params}`,{cache:'no-store'})
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Não foi possível carregar os anúncios.')
    setListings(data.listings ?? [])
  },[tab])
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

  // ---- derivação dos filtros ----
  const currencies = useMemo(()=>[...new Set(listings.map(l=>l.currency))],[listings])
  const activeCurrency = currency || (currencies.length===1 ? currencies[0] : '')
  const locations = useMemo(()=>{
    const count = new Map<string,number>()
    listings.forEach(l=>{ if (l.location) count.set(l.location,(count.get(l.location)||0)+1) })
    return [...count.entries()].sort((a,b)=>b[1]-a[1]).slice(0,6).map(([name])=>name)
  },[listings])
  const bounds = useMemo<[number,number]|null>(()=>{
    if (!activeCurrency) return null
    const prices = listings.filter(l=>l.currency===activeCurrency).map(l=>Number(l.unit_price))
    if (!prices.length) return null
    const min = Math.floor(Math.min(...prices)), max = Math.ceil(Math.max(...prices))
    return min===max ? [min,max+1] : [min,max]
  },[listings,activeCurrency])
  const effectiveRange:[number,number]|null = bounds ? (range ? [Math.max(range[0],bounds[0]),Math.min(range[1],bounds[1])] : bounds) : null
  const quickPicks = useMemo(()=>{
    if (!bounds) return []
    const [min,max] = bounds, step = (max-min)/3
    const round = (v:number)=>Math.round(v/10)*10 || Math.round(v)
    const a = round(min+step), b = round(min+2*step)
    if (!(a>min && b>a && b<max)) return []
    return [
      { label:`Até ${money(a,activeCurrency)}`, value:[min,a] as [number,number] },
      { label:`${money(a,activeCurrency)}–${money(b,activeCurrency)}`, value:[a,b] as [number,number] },
      { label:`${money(b,activeCurrency)}+`, value:[b,max] as [number,number] },
    ]
  },[bounds,activeCurrency])

  const priceFiltered = !!(bounds && range && (range[0]>bounds[0] || range[1]<bounds[1]))
  const activeFilters = selCategories.length + selConditions.length + selAvailability.length + selLocations.length + (priceFiltered?1:0) + (onlyFavourites?1:0) + (query.trim()?1:0)
  function clearFilters() { setSelCategories([]); setSelConditions([]); setSelAvailability([]); setSelLocations([]); setRange(null); setOnlyFavourites(false); setQuery('') }

  const visible = useMemo(()=>{
    const q = query.trim().toLowerCase()
    const result = listings.filter(l=>{
      if (q && ![l.title,l.description,l.location,l.seller?.name].some(v=>v?.toLowerCase().includes(q))) return false
      if (selCategories.length && !selCategories.includes(l.category)) return false
      if (selConditions.length && !selConditions.includes(l.item_condition)) return false
      if (selLocations.length && !(l.location && selLocations.includes(l.location))) return false
      if (selAvailability.length) {
        const ok = selAvailability.some(a=>a==='in_stock' ? l.quantity>0 : l.quantity>0 && l.quantity<=LOW_STOCK)
        if (!ok) return false
      }
      if (activeCurrency && l.currency!==activeCurrency) return false
      if (priceFiltered && effectiveRange && (l.unit_price<effectiveRange[0] || l.unit_price>effectiveRange[1])) return false
      if (onlyFavourites && !favourites.includes(l.id)) return false
      return true
    })
    const sorted = [...result]
    if (sort==='price_asc') sorted.sort((a,b)=>a.unit_price-b.unit_price)
    else if (sort==='price_desc') sorted.sort((a,b)=>b.unit_price-a.unit_price)
    else if (sort==='name') sorted.sort((a,b)=>a.title.localeCompare(b.title,'pt'))
    else sorted.sort((a,b)=>new Date(b.created_at).getTime()-new Date(a.created_at).getTime())
    return sorted
  },[listings,query,selCategories,selConditions,selLocations,selAvailability,activeCurrency,priceFiltered,effectiveRange,onlyFavourites,favourites,sort])

  const tabs = useMemo(()=>[['browse','Comprar'],['mine','Os meus anúncios'],['orders','Pedidos']] as const,[])
  const field='w-full rounded-md border border-[#E5E5E5] bg-white px-3 py-2.5 text-sm text-[#111] outline-none focus:border-black'

  const filterPanel = <aside className="text-sm">
    <div className="flex items-center justify-between pb-4">
      <span className="text-xs text-[#8A8A8A]">Filtros</span>
      {activeFilters>0&&<button onClick={clearFilters} className="inline-flex items-center gap-1 text-xs font-semibold underline underline-offset-2"><X className="h-3 w-3"/>Limpar ({activeFilters})</button>}
    </div>
    <FilterGroup title="Categoria"><div className="flex flex-wrap gap-1.5">{categories.map(([key,label])=><Chip key={key} active={selCategories.includes(key)} onClick={()=>setSelCategories(s=>toggle(s,key))}>{label}</Chip>)}</div></FilterGroup>
    <FilterGroup title="Intervalo de preço">
      {currencies.length>1&&<div className="mb-3 flex flex-wrap gap-1.5">{currencies.map(c=><Chip key={c} active={activeCurrency===c} onClick={()=>{setCurrency(c);setRange(null)}}>{c}</Chip>)}</div>}
      {bounds&&effectiveRange?<>
        <p className="mb-3 text-[11px] font-medium">{money(effectiveRange[0],activeCurrency)} - {money(effectiveRange[1],activeCurrency)}</p>
        <Slider min={bounds[0]} max={bounds[1]} step={Math.max(1,Math.round((bounds[1]-bounds[0])/100))} value={effectiveRange} onValueChange={v=>setRange([v[0],v[1]])} aria-label="Intervalo de preço"
          className="[&_[data-slot=slider-track]]:bg-[#BDBDBD] [&_[data-slot=slider-range]]:bg-black [&_[data-slot=slider-thumb]]:size-3.5 [&_[data-slot=slider-thumb]]:border-black [&_[data-slot=slider-thumb]]:bg-black"/>
        {quickPicks.length>0&&<div className="mt-4"><p className="mb-1.5 text-xs text-[#8A8A8A]">Escolhas rápidas</p><div className="flex flex-wrap gap-1.5">{quickPicks.map(p=><Chip key={p.label} active={!!range&&range[0]===p.value[0]&&range[1]===p.value[1]} onClick={()=>setRange(p.value)}>{p.label}</Chip>)}</div></div>}
      </>:<p className="text-xs text-[#8A8A8A]">{currencies.length>1?'Escolha uma moeda para filtrar por preço.':'Sem preços para filtrar.'}</p>}
    </FilterGroup>
    <FilterGroup title="Estado"><div className="flex flex-wrap gap-1.5">{conditions.map(([key,label])=><Chip key={key} active={selConditions.includes(key)} onClick={()=>setSelConditions(s=>toggle(s,key))}>{label}</Chip>)}</div></FilterGroup>
    <FilterGroup title="Disponibilidade"><div className="flex flex-wrap gap-1.5">{availability.map(([key,label])=><Chip key={key} active={selAvailability.includes(key)} onClick={()=>setSelAvailability(s=>toggle(s,key))}>{label}</Chip>)}</div></FilterGroup>
    {locations.length>0&&<FilterGroup title="Localização"><div className="flex flex-wrap gap-1.5">{locations.map(name=><Chip key={name} active={selLocations.includes(name)} onClick={()=>setSelLocations(s=>toggle(s,name))}>{name}</Chip>)}</div></FilterGroup>}
  </aside>

  return <main className="h-full overflow-y-auto bg-white p-5 text-[#111] md:px-10 md:py-8">
    <nav className="flex flex-wrap items-center justify-between gap-3">
      <span className="text-xs font-semibold">HULA Agro</span>
      <div className="flex gap-5">{tabs.map(([key,label])=><button key={key} onClick={()=>setTab(key)} aria-current={tab===key} className={`text-[11px] ${tab===key?'font-bold underline underline-offset-8':'text-[#555] hover:text-black'}`}>{label}</button>)}</div>
      <button onClick={()=>{setError('');setShowCreate(true)}} className="inline-flex items-center gap-2 rounded-md bg-[#111] px-3.5 py-2 text-[11px] font-semibold text-white hover:bg-black"><Plus className="h-3.5 w-3.5"/>Publicar anúncio</button>
    </nav>

    <h1 className="mt-10 text-center text-6xl font-extrabold leading-none tracking-tighter md:text-8xl">Marketplace</h1>
    <p className="mx-auto mt-4 max-w-xl text-center text-xs text-[#8A8A8A]">Encontre artigos avícolas ou anuncie o que a sua exploração vende. Preço, pagamento e entrega são combinados entre comprador e vendedor.</p>

    {error&&<div role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error} {error.toLowerCase().includes('entre na sua conta')&&<Link href="/entrar" className="font-semibold underline">Entrar</Link>}</div>}
    {notice&&<div role="status" className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">{notice}</div>}

    {tab==='orders'?<section className="mt-5">
      <div className="flex items-center justify-between text-sm text-[#777]"><span>{orders.length} pedidos</span><RefreshButton loading={loading} onClick={()=>void refresh()}/></div>
      {loading?<p className="mt-3 rounded-xl bg-white p-8 text-center text-sm text-[#777]">A carregar…</p>:<div className="mt-3 space-y-3">
        {orders.map(order=>{const isSeller=order.seller_user_id===userId; return <article key={order.id} className="rounded-md bg-[#EBEBEB] p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-semibold">{order.listing_title}</h2><p className="mt-1 text-sm text-[#777]">{isSeller?'Pedido recebido':'Pedido enviado'} · {order.quantity} {order.unit} · {money(order.total,order.currency)}</p>{order.buyer_note&&<p className="mt-2 text-sm">Nota: {order.buyer_note}</p>}<p className="mt-2 text-xs text-[#777]">{new Date(order.created_at).toLocaleString('pt-PT')}</p></div><span className="rounded-md bg-[#777] px-2.5 py-1 text-[11px] font-semibold text-white">{orderStatus[order.status]||order.status}</span></div>
          <div className="mt-4 flex flex-wrap gap-2">
            {order.status==='pending'&&isSeller&&<><button onClick={()=>void updateOrder(order,'accepted')} className="rounded-md bg-[#111] px-3 py-2 text-xs font-semibold text-white">Aceitar pedido</button><button onClick={()=>void updateOrder(order,'rejected')} className="rounded-md border border-[#CFCFCF] px-3 py-2 text-xs font-semibold">Recusar</button></>}
            {order.status==='pending'&&!isSeller&&<button onClick={()=>void updateOrder(order,'cancelled')} className="rounded-md border border-[#CFCFCF] px-3 py-2 text-xs font-semibold">Cancelar pedido</button>}
            {order.status==='accepted'&&<button onClick={()=>void updateOrder(order,'completed')} className="rounded-md bg-[#111] px-3 py-2 text-xs font-semibold text-white">Marcar como concluído</button>}
          </div></article>})}
        {!orders.length&&<Empty text="Ainda não tem pedidos de compra ou venda."/>}
      </div>}
    </section>

    :<section className="mt-10 grid gap-10 lg:grid-cols-[230px_1fr]">
      {tab==='browse'&&<div className="hidden lg:block">{filterPanel}</div>}

      <div className={tab==='browse'?'':'lg:col-span-2'}>
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="mr-auto text-xl font-extrabold tracking-tight">{tab==='mine'?'Os meus anúncios':'Todos os artigos'}</h2>
          <span className="text-[11px] text-[#555]">{tab==='browse'?`A mostrar ${visible.length} de ${listings.length} resultados`:`${listings.length} anúncios`}</span>
          {tab==='browse'&&<label className="flex items-center gap-2 text-[11px] text-[#555]">Ordenar por:
            <select value={sort} onChange={e=>setSort(e.target.value as Sort)} className="rounded-md bg-[#777] px-2.5 py-1.5 text-[11px] font-medium text-white outline-none">{sortOptions.map(([key,label])=><option key={key} value={key}>{label}</option>)}</select>
          </label>}
          <RefreshButton loading={loading} onClick={()=>void refresh()}/>
        </div>

        {tab==='browse'&&<div className="mt-4 flex flex-wrap gap-2">
          <div className="relative min-w-[220px] flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A8A8A]"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Pesquisar artigos, vendedores ou localização" className={`${field} pl-9`}/></div>
          <button onClick={()=>setOnlyFavourites(v=>!v)} aria-pressed={onlyFavourites} className={`inline-flex items-center gap-2 rounded-md px-3.5 py-2 text-xs font-medium ${onlyFavourites?'bg-[#111] text-white':'bg-[#EFEFEF]'}`}><Heart className={`h-4 w-4 ${onlyFavourites?'fill-current':''}`}/>Favoritos{favourites.length>0&&` (${favourites.length})`}</button>
          <button onClick={()=>setShowFilters(v=>!v)} className="inline-flex items-center gap-2 rounded-md bg-[#EFEFEF] px-3.5 py-2 text-xs font-medium lg:hidden"><SlidersHorizontal className="h-4 w-4"/>Filtros{activeFilters>0&&` (${activeFilters})`}</button>
        </div>}
        {tab==='browse'&&showFilters&&<div className="mt-4 rounded-md border border-[#E5E5E5] p-4 lg:hidden">{filterPanel}</div>}

        {tab==='browse'&&activeFilters>0&&<div className="mt-3 flex flex-wrap items-center gap-1.5">
          {selCategories.map(k=><Removable key={k} onRemove={()=>setSelCategories(s=>s.filter(v=>v!==k))}>{categoryName(k)}</Removable>)}
          {selConditions.map(k=><Removable key={k} onRemove={()=>setSelConditions(s=>s.filter(v=>v!==k))}>{conditions.find(([c])=>c===k)?.[1]}</Removable>)}
          {selAvailability.map(k=><Removable key={k} onRemove={()=>setSelAvailability(s=>s.filter(v=>v!==k))}>{availability.find(([c])=>c===k)?.[1]}</Removable>)}
          {selLocations.map(k=><Removable key={k} onRemove={()=>setSelLocations(s=>s.filter(v=>v!==k))}>{k}</Removable>)}
          {priceFiltered&&effectiveRange&&<Removable onRemove={()=>setRange(null)}>{money(effectiveRange[0],activeCurrency)} – {money(effectiveRange[1],activeCurrency)}</Removable>}
        </div>}

        {loading?<div className="mt-5 grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(200px,240px))] justify-center lg:justify-start">{Array.from({length:6}).map((_,i)=><div key={i} className="aspect-[5/6] animate-pulse rounded-sm bg-[#EBEBEB]"/>)}</div>
        :<div className="mt-5 grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(200px,240px))] justify-center lg:justify-start">
          {visible.map(listing=><ProductCard key={listing.id} listing={listing} mine={tab==='mine'} favourite={favourites.includes(listing.id)}
            onFavourite={()=>toggleFavourite(listing.id)} onBuy={()=>{setBuyListing(listing);setError('')}}
            onToggleStatus={()=>void updateListing(listing,listing.status==='active'?'paused':'active')} onRemove={()=>void updateListing(listing,'removed')}/>)}
          {!visible.length&&<div className="col-span-full"><Empty text={tab==='mine'?'Ainda não publicou anúncios.':activeFilters>0?'Nenhum anúncio corresponde a estes filtros.':'Ainda não há anúncios disponíveis.'} action={tab==='browse'&&activeFilters>0?<button onClick={clearFilters} className="mt-3 rounded-md bg-[#111] px-4 py-2 text-sm font-medium text-white">Limpar filtros</button>:undefined}/></div>}
        </div>}
      </div>
    </section>}

    {showCreate&&<Modal title="Publicar anúncio" close={()=>setShowCreate(false)}><form onSubmit={createListing} className="grid gap-3 sm:grid-cols-2">
      <label className="text-sm font-medium sm:col-span-2">Título<input name="title" required minLength={4} maxLength={140} className={`${field} mt-1`}/></label>
      <label className="text-sm font-medium">Categoria<select name="category" required className={`${field} mt-1`}>{categories.map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label>
      <label className="text-sm font-medium">Tipo<select name="listing_type" className={`${field} mt-1`}><option value="product">Produto</option><option value="service">Serviço</option></select></label>
      <label className="text-sm font-medium sm:col-span-2">Descrição<textarea name="description" required minLength={10} maxLength={5000} rows={4} className={`${field} mt-1`}/></label>
      <label className="text-sm font-medium">Quantidade<input name="quantity" type="number" min="0.001" step="0.001" required className={`${field} mt-1`}/></label>
      <label className="text-sm font-medium">Unidade<input name="unit" required maxLength={30} defaultValue="unidade" className={`${field} mt-1`}/></label>
      <label className="text-sm font-medium">Preço por unidade<input name="unit_price" type="number" min="0" step="0.01" required className={`${field} mt-1`}/></label>
      <label className="text-sm font-medium">Moeda<select name="currency" className={`${field} mt-1`}><option>MZN</option><option>ZAR</option><option>USD</option></select></label>
      <label className="text-sm font-medium">Condição<select name="item_condition" className={`${field} mt-1`}><option value="new">Novo</option><option value="used">Usado</option><option value="not_applicable">Não aplicável</option></select></label>
      <label className="text-sm font-medium">Localização<input name="location" maxLength={160} className={`${field} mt-1`}/></label>
      <label className="text-sm font-medium sm:col-span-2">Imagem (URL opcional)<input name="image_url" type="url" placeholder="https://…" className={`${field} mt-1`}/></label>
      <button disabled={submitting} className="rounded-md bg-[#111] px-4 py-3 text-sm font-semibold text-white disabled:opacity-50 sm:col-span-2">{submitting?'A publicar…':'Publicar anúncio'}</button>
    </form></Modal>}

    {buyListing&&<Modal title="Pedir compra" close={()=>setBuyListing(null)}>
      <p className="text-sm text-[#777]">{buyListing.title} — {money(Number(buyListing.unit_price),buyListing.currency)} por {buyListing.unit}. O pedido reserva o stock; não cobra pagamento.</p>
      <form onSubmit={placeOrder} className="mt-4 space-y-3">
        <label className="block text-sm font-medium">Quantidade<input name="quantity" type="number" min="0.001" step="0.001" max={buyListing.quantity} required defaultValue="1" className={`${field} mt-1`}/></label>
        <label className="block text-sm font-medium">Mensagem ao vendedor<textarea name="buyer_note" maxLength={1000} rows={3} className={`${field} mt-1`}/></label>
        <button disabled={submitting} className="w-full rounded-md bg-[#111] px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">{submitting?'A enviar…':'Enviar pedido de compra'}</button>
      </form>
    </Modal>}
  </main>
}

function ProductCard({listing,mine,favourite,onFavourite,onBuy,onToggleStatus,onRemove}:{listing:Listing;mine:boolean;favourite:boolean;onFavourite:()=>void;onBuy:()=>void;onToggleStatus:()=>void;onRemove:()=>void}) {
  const Icon = categoryIcon[listing.category] ?? Box
  const soldOut = listing.quantity<=0
  const low = !soldOut && listing.quantity<=LOW_STOCK
  const statusLabel = listing.status==='active'?'Activo':listing.status==='paused'?'Pausado':listing.status==='sold'?'Sem stock':'Removido'
  const badge = mine ? {text:statusLabel,cls:'text-white'}
    : soldOut ? {text:'Esgotado',cls:'text-[#E0E0E0]'}
    : low ? {text:'Últimas unidades',cls:'text-[#F5E653]'}
    : isRecent(listing.created_at) ? {text:'Novo',cls:'text-[#A8E05A]'}
    : listing.item_condition==='used' ? {text:'Usado',cls:'text-white'}
    : null
  return <article className="group flex flex-col">
    <div className="relative flex aspect-[5/6] flex-col rounded-sm bg-[#EBEBEB] p-3">
      <div className="flex items-start justify-between">
        {badge?<span className={`rounded-md bg-[#777] px-2 py-1 text-[10px] font-semibold ${badge.cls}`}>{badge.text}</span>:<span/>}
        {!mine&&<div className="flex gap-1.5">
          <button onClick={onFavourite} aria-label={favourite?'Remover dos favoritos':'Adicionar aos favoritos'} aria-pressed={favourite} className="grid h-6 w-6 place-items-center rounded-full bg-[#777] text-white hover:bg-[#555]"><Heart className={`h-3.5 w-3.5 ${favourite?'fill-white':''}`}/></button>
          <button onClick={onBuy} disabled={soldOut} aria-label="Pedir compra" className="grid h-6 w-6 place-items-center rounded-full bg-[#777] text-white hover:bg-[#555] disabled:opacity-40"><ShoppingBag className="h-3.5 w-3.5"/></button>
        </div>}
      </div>
      <div className="flex flex-1 items-center justify-center overflow-hidden">
        {listing.image_url
          ? <img src={listing.image_url} alt={listing.title} loading="lazy" className="max-h-full max-w-[80%] object-contain mix-blend-multiply drop-shadow-xl transition-transform duration-300 group-hover:scale-[1.04]"/>
          : <div className="flex flex-col items-center gap-2 text-[#A0A0A0]"><Icon className="h-14 w-14" strokeWidth={1.25}/><span className="text-[11px]">{categoryName(listing.category)}</span></div>}
      </div>
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="line-clamp-1 text-xs font-medium">{listing.title}</h3>
        <span className="shrink-0 text-xs font-bold">{money(Number(listing.unit_price),listing.currency)}<span className="ml-0.5 text-[10px] font-normal text-[#777]">/{listing.unit}</span></span>
      </div>
    </div>
    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#777]">
      <span className="inline-flex items-center gap-1"><Store className="h-3 w-3"/>{listing.seller?.name||'Cliente HULA Agro'}</span>
      {listing.location&&<span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3"/>{listing.location}</span>}
      <span className="ml-auto">{soldOut?'Sem stock':`${listing.quantity} disponíveis`}</span>
    </div>
    {mine&&<div className="mt-2 flex gap-2">
      <button onClick={onToggleStatus} disabled={listing.status==='sold'||listing.status==='removed'} className="flex-1 rounded-md bg-[#EFEFEF] px-3 py-2 text-xs font-semibold disabled:opacity-40">{listing.status==='active'?'Pausar':'Activar'}</button>
      {listing.status!=='removed'&&<button onClick={onRemove} className="rounded-md border border-red-200 px-3 py-2 text-xs font-semibold text-red-700">Remover</button>}
    </div>}
  </article>
}

function FilterGroup({title,children}:{title:string;children:ReactNode}) {
  const [open,setOpen] = useState(true)
  return <div className="border-t border-[#D9D9D9] py-4">
    <button type="button" onClick={()=>setOpen(o=>!o)} aria-expanded={open} className="flex w-full items-center justify-between text-xs text-[#555]">{title}<ChevronDown className={`h-3 w-3 transition-transform ${open?'':'-rotate-90'}`}/></button>
    {open&&<div className="mt-3">{children}</div>}
  </div>
}
function Chip({active,onClick,children}:{active:boolean;onClick:()=>void;children:ReactNode}) { return <button type="button" onClick={onClick} aria-pressed={active} className={`rounded-md px-2.5 py-1.5 text-[11px] font-medium transition-colors ${active?'bg-[#111] text-white':'bg-[#EFEFEF] text-[#111] hover:bg-[#E3E3E3]'}`}>{children}</button> }
function Removable({onRemove,children}:{onRemove:()=>void;children:ReactNode}) { return <button onClick={onRemove} className="inline-flex items-center gap-1 rounded-md bg-[#EFEFEF] px-2.5 py-1 text-[11px] font-medium hover:bg-[#E3E3E3]">{children}<X className="h-3 w-3"/></button> }
function RefreshButton({loading,onClick}:{loading:boolean;onClick:()=>void}) { return <button onClick={onClick} disabled={loading} aria-label="Actualizar" className="rounded-md p-2 text-[#777] hover:bg-[#EFEFEF] disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${loading?'animate-spin':''}`}/></button> }
function Empty({text,action}:{text:string;action?:ReactNode}) { return <div className="rounded-sm bg-[#EBEBEB] p-10 text-center"><PackageCheck className="mx-auto h-8 w-8 text-[#777]"/><p className="mt-3 text-sm text-[#777]">{text}</p>{action}</div> }
function Modal({title,close,children}:{title:string;close:()=>void;children:ReactNode}) { return <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-3" onMouseDown={e=>{if(e.target===e.currentTarget)close()}}><section className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-md bg-white p-5 shadow-xl sm:p-7"><div className="mb-5 flex items-center justify-between"><h2 className="text-xl font-bold">{title}</h2><button onClick={close} className="rounded-md px-3 py-1 text-sm text-[#777] hover:bg-[#F9F9F9]">Fechar</button></div>{children}</section></div> }