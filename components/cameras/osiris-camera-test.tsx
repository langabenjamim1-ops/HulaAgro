'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Camera, ExternalLink, MapPin, RefreshCw, Search, Video, WifiOff } from 'lucide-react'

type OsirisCamera = {
  id: string
  lat: number
  lng: number
  name: string
  city?: string
  country?: string
  feed_url?: string
  stream_url?: string
  stream_type?: 'jpg' | 'hls' | 'iframe' | 'mjpeg' | 'mp4'
  external_url?: string
  source?: string
}

const REGIONS = [
  { id: 'florida', label: 'Flórida, EUA' },
  { id: 'africa-live', label: 'África' },
  { id: 'middle-east', label: 'Médio Oriente' },
  { id: 'asia', label: 'Ásia' },
]

export default function OsirisCameraTest() {
  const [region, setRegion] = useState('florida')
  const [cameras, setCameras] = useState<OsirisCamera[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatedAt, setUpdatedAt] = useState('')
  const [imageVersion, setImageVersion] = useState(0)
  const [manualInput, setManualInput] = useState('')
  const [manualFeedUrl, setManualFeedUrl] = useState('')
  const [manualFeedType, setManualFeedType] = useState<'image' | 'video'>('image')
  const [manualError, setManualError] = useState('')

  const loadCameras = useCallback(async (nextRegion = region) => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`/api/osiris/cctv?region=${encodeURIComponent(nextRegion)}`, { cache: 'no-store' })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Falha ao carregar as câmaras do Osiris.')
      const list = Array.isArray(payload.cameras) ? payload.cameras as OsirisCamera[] : []
      setCameras(list)
      setSelectedId((current) => list.some((camera) => camera.id === current) ? current : list[0]?.id || '')
      setUpdatedAt(payload.updatedAt || new Date().toISOString())
      setImageVersion((version) => version + 1)
    } catch (cause) {
      setCameras([])
      setSelectedId('')
      setError(cause instanceof Error ? cause.message : 'Falha ao carregar as câmaras do Osiris.')
    } finally {
      setLoading(false)
    }
  }, [region])

  useEffect(() => { void loadCameras(region) }, [region, loadCameras])

  const filteredCameras = useMemo(() => {
    const term = search.trim().toLocaleLowerCase()
    return cameras.filter((camera) => !term || `${camera.name} ${camera.city || ''} ${camera.country || ''} ${camera.source || ''}`.toLocaleLowerCase().includes(term))
  }, [cameras, search])
  const selectedCamera = cameras.find((camera) => camera.id === selectedId)

  useEffect(() => {
    if (!selectedCamera?.feed_url && !(manualFeedUrl && manualFeedType === 'image')) return
    const timer = window.setInterval(() => setImageVersion((version) => version + 1), 30000)
    return () => window.clearInterval(timer)
  }, [selectedCamera?.id, selectedCamera?.feed_url, manualFeedUrl, manualFeedType])

  function snapshotUrl(url: string) {
    try {
      const parsed = new URL(url)
      parsed.searchParams.set('_hulaagro_refresh', String(imageVersion))
      return parsed.toString()
    } catch { return url }
  }

  return (
    <div className="space-y-5 pb-8">
      <section className="flex flex-col justify-between gap-4 rounded-2xl bg-[#283106] p-6 text-white sm:flex-row sm:items-center sm:p-8">
        <div className="flex items-start gap-3">
          <span className="rounded-xl bg-white/10 p-3"><Camera className="h-6 w-6" /></span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#D1D8BD]">Integração de teste</p>
            <h1 className="mt-1 text-2xl font-bold sm:text-3xl">Câmaras públicas OSIRIS</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#E0E4D5]">Seleciona uma câmara pública do catálogo Osiris para testar a visualização de feeds no Hulaagro.</p>
          </div>
        </div>
        <a href="https://osirisai.live/?layers=cctv,cctv_previews" target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#D7E6A3] px-4 py-2.5 text-sm font-bold text-[#283106] hover:bg-white">Abrir OSIRIS <ExternalLink className="h-4 w-4" /></a>
      </section>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
        Estes são feeds públicos de locais externos, como estradas e cidades. Servem para testar a ligação e o ecrã de câmara; não são câmaras dos galpões nem devem ser usados para avaliar aves.
      </div>

      <form onSubmit={(event) => {
        event.preventDefault()
        setManualError('')
        try {
          const url = new URL(manualInput.trim())
          if (!['https:', 'http:'].includes(url.protocol)) throw new Error('Usa um endereço HTTP ou HTTPS.')
          setManualFeedUrl(url.toString())
        } catch (cause) {
          setManualError(cause instanceof Error ? cause.message : 'Endereço de feed inválido.')
        }
      }} className="rounded-xl border border-[#E2E5D9] bg-white p-4 shadow-sm">
        <h2 className="font-bold text-[#283106]">Testar uma câmara escolhida no OSIRIS</h2>
        <p className="mt-1 text-xs leading-5 text-[#727964]">No OSIRIS, abre uma câmara e usa <b>RAW FEED</b>. Copia o endereço do feed e cola-o aqui.</p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input value={manualInput} onChange={(event) => setManualInput(event.target.value)} placeholder="https://… endereço RAW FEED" className="min-w-0 flex-1 rounded-lg border border-[#DDE1D2] px-3 py-2 text-sm outline-none focus:border-[#82905A]" />
          <select value={manualFeedType} onChange={(event) => setManualFeedType(event.target.value as 'image' | 'video')} className="rounded-lg border border-[#DDE1D2] bg-white px-3 py-2 text-sm text-[#283106]"><option value="image">Imagem JPG / MJPEG</option><option value="video">Vídeo MP4 / HLS</option></select>
          <button type="submit" className="rounded-lg bg-[#52642B] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3D4A2C]">Abrir feed</button>
          {manualFeedUrl && <button type="button" onClick={() => { setManualFeedUrl(''); setManualError('') }} className="rounded-lg border border-[#DDE1D2] px-3 py-2 text-sm font-semibold text-[#53602E] hover:bg-[#F6F7F3]">Limpar</button>}
        </div>
        {manualError && <p role="alert" className="mt-2 text-xs text-red-700">{manualError}</p>}
        {manualFeedUrl && <p className="mt-2 break-all text-[11px] text-[#727964]">Feed manual: {manualFeedUrl}</p>}
      </form>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="overflow-hidden rounded-xl border border-[#E2E5D9] bg-white shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-[#EEF0E9] px-4 py-3">
            <div className="min-w-0">
              <h2 className="truncate font-bold text-[#283106]">{selectedCamera?.name || 'Pré-visualização da câmara'}</h2>
              <p className="mt-1 flex items-center gap-1 text-xs text-[#727964]"><MapPin className="h-3 w-3" />{selectedCamera ? [selectedCamera.city, selectedCamera.country].filter(Boolean).join(', ') : 'Seleciona uma câmara na lista'}</p>
            </div>
            {selectedCamera?.external_url && <a href={selectedCamera.external_url} target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-[#DDE1D2] px-3 py-2 text-xs font-semibold text-[#53602E] hover:bg-[#F6F7F3]">Origem <ExternalLink className="h-3 w-3" /></a>}
          </div>
          <div className="flex aspect-video min-h-[280px] items-center justify-center bg-[#151910]">
            {manualFeedUrl ? manualFeedType === 'image' ? <img key={`${manualFeedUrl}-${imageVersion}`} src={snapshotUrl(manualFeedUrl)} alt="Feed de câmara OSIRIS" className="h-full w-full object-contain" onError={() => setManualError('O feed não carregou. Confirma se o endereço RAW FEED é público e se escolheste o tipo correto.')} /> : <video key={manualFeedUrl} src={manualFeedUrl} controls autoPlay muted playsInline className="h-full w-full" onError={() => setManualError('O navegador não conseguiu abrir o vídeo. HLS pode exigir suporte adicional no navegador.')} />
              : loading && cameras.length === 0 ? <p className="text-sm text-white/70">A carregar feeds do Osiris…</p>
              : selectedCamera?.feed_url ? <img key={`${selectedCamera.id}-${imageVersion}`} src={snapshotUrl(selectedCamera.feed_url)} alt={`Feed de ${selectedCamera.name}`} className="h-full w-full object-contain" />
              : selectedCamera?.stream_url && selectedCamera.stream_type === 'iframe' ? <iframe title={`Transmissão de ${selectedCamera.name}`} src={selectedCamera.stream_url} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen className="h-full w-full border-0" />
              : selectedCamera?.stream_url ? <video key={selectedCamera.id} src={selectedCamera.stream_url} controls autoPlay muted playsInline className="h-full w-full" />
              : selectedCamera?.external_url ? <div className="px-6 text-center text-white"><Video className="mx-auto h-8 w-8 text-[#D7E6A3]" /><p className="mt-3 text-sm">Esta entrada abre a transmissão no site do operador.</p><a href={selectedCamera.external_url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[#D7E6A3] px-4 py-2 text-sm font-bold text-[#283106]">Abrir transmissão <ExternalLink className="h-4 w-4" /></a></div>
              : error ? <div className="px-6 text-center text-sm text-red-200"><WifiOff className="mx-auto mb-2 h-7 w-7" />{error}</div>
              : <p className="px-6 text-center text-sm text-white/70">Esta câmara não tem feed incorporável disponível.</p>}
          </div>
          {(selectedCamera || manualFeedUrl) && <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#EEF0E9] px-4 py-3 text-xs text-[#727964]"><span>Fonte: {manualFeedUrl ? 'OSIRIS · feed manual' : `${selectedCamera?.source || 'OSIRIS'} · ${selectedCamera?.stream_type || (selectedCamera?.feed_url ? 'imagem' : 'externa')}`}</span>{(manualFeedType === 'image' || !manualFeedUrl) && <button onClick={() => setImageVersion((version) => version + 1)} className="inline-flex items-center gap-1 rounded-md px-2 py-1 font-semibold text-[#53602E] hover:bg-[#F6F7F3]"><RefreshCw className="h-3.5 w-3.5" />Atualizar imagem</button>}</div>}
        </div>

        <aside className="overflow-hidden rounded-xl border border-[#E2E5D9] bg-white shadow-sm">
          <div className="space-y-3 border-b border-[#EEF0E9] p-4">
            <div className="flex gap-2">
              <select value={region} onChange={(event) => setRegion(event.target.value)} className="min-w-0 flex-1 rounded-lg border border-[#DDE1D2] bg-white px-3 py-2 text-sm text-[#283106]">
                {REGIONS.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
              </select>
              <button onClick={() => void loadCameras(region)} disabled={loading} aria-label="Atualizar câmaras" className="rounded-lg border border-[#DDE1D2] p-2 text-[#53602E] hover:bg-[#F6F7F3] disabled:opacity-50"><RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} /></button>
            </div>
            <label className="flex items-center gap-2 rounded-lg border border-[#DDE1D2] px-3 py-2"><Search className="h-4 w-4 text-[#777E5C]" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Pesquisar câmara ou cidade" className="min-w-0 flex-1 text-sm outline-none" /></label>
            <p className="text-xs text-[#727964]">{loading ? 'A carregar…' : `${filteredCameras.length} de ${cameras.length} câmaras`}{updatedAt && ` · atualizado ${new Date(updatedAt).toLocaleTimeString('pt-MZ')}`}</p>
          </div>
          {error && <p role="alert" className="m-4 rounded-lg bg-amber-50 p-3 text-xs text-amber-900">{error}</p>}
          <div className="max-h-[560px] divide-y divide-[#EEF0E9] overflow-y-auto">
            {filteredCameras.map((camera) => <button key={camera.id} onClick={() => { setSelectedId(camera.id); setImageVersion((version) => version + 1) }} className={`w-full px-4 py-3 text-left transition ${selectedId === camera.id ? 'bg-[#EFF1E8]' : 'hover:bg-[#FAFBF7]'}`}>
              <span className="block truncate text-sm font-semibold text-[#283106]">{camera.name || 'Câmara sem nome'}</span>
              <span className="mt-1 block truncate text-xs text-[#727964]">{[camera.city, camera.country, camera.source].filter(Boolean).join(' · ') || 'OSIRIS'}</span>
            </button>)}
            {!loading && !error && filteredCameras.length === 0 && <p className="p-6 text-center text-sm text-[#727964]">Não há câmaras nesta região ou correspondências para a pesquisa.</p>}
          </div>
        </aside>
      </section>
    </div>
  )
}
