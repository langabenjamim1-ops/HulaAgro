'use client'

import { useEffect, useRef, useState } from 'react'
import { Activity, AlertTriangle, Camera, ImagePlus, LoaderCircle, ShieldCheck, Upload, X } from 'lucide-react'

export default function DiseaseDetectionPage() {
  const [cameraActive, setCameraActive] = useState(false)
  const [image, setImage] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => () => streamRef.current?.getTracks().forEach((track) => track.stop()), [])
  useEffect(() => {
    if (cameraActive && videoRef.current && streamRef.current) videoRef.current.srcObject = streamRef.current
  }, [cameraActive])

  async function startCamera() {
    setError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      streamRef.current = stream
      setCameraActive(true)
    } catch {
      setError('Não foi possível abrir a câmara. Autoriza o acesso ou escolhe uma fotografia do dispositivo.')
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    setCameraActive(false)
  }

  async function analyze(dataUrl: string) {
    setImage(dataUrl)
    setAnalysis('')
    setError('')
    setBusy(true)
    try {
      const response = await fetch('/api/ai/disease-screening', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ image: dataUrl }) })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Falha na análise da imagem.')
      setAnalysis(payload.analysis)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível analisar esta imagem.')
    } finally {
      setBusy(false)
    }
  }

  function capture() {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || video.videoWidth === 0) return
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d')?.drawImage(video, 0, 0)
    const photo = canvas.toDataURL('image/jpeg', 0.82)
    stopCamera()
    void analyze(photo)
  }

  function upload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Usa uma imagem JPG, PNG ou WebP.')
      return
    }
    if (file.size > 3_500_000) {
      setError('A imagem deve ter no máximo 3,5 MB.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => typeof reader.result === 'string' && void analyze(reader.result)
    reader.onerror = () => setError('Não foi possível ler a imagem selecionada.')
    reader.readAsDataURL(file)
  }

  return <div className="space-y-6 pb-8">
    <section className="rounded-2xl bg-[#283106] p-6 text-white sm:p-8">
      <div className="flex items-center gap-3"><span className="rounded-xl bg-white/10 p-3"><Activity className="h-6 w-6" /></span><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#D1D8BD]">Triagem assistida por IA</p><h1 className="mt-1 text-2xl font-bold sm:text-3xl">Observação visual de aves</h1></div></div>
      <p className="mt-4 max-w-3xl text-sm leading-6 text-[#E0E4D5]">Envia uma fotografia para obter observações visuais e recomendações de acompanhamento. A análise é indicativa e não substitui uma avaliação veterinária.</p>
    </section>

    <div className="grid gap-5 xl:grid-cols-2">
      <section className="rounded-xl border border-[#E2E5D9] bg-white p-5 shadow-sm">
        <div className="mb-4"><h2 className="font-bold text-[#283106]">Imagem para análise</h2><p className="mt-1 text-sm text-[#727964]">Usa uma fotografia nítida, com boa iluminação.</p></div>
        {cameraActive ? <div className="overflow-hidden rounded-xl bg-[#1D2410]"><video ref={videoRef} autoPlay playsInline className="aspect-video w-full object-cover" /><canvas ref={canvasRef} className="hidden" /></div> : image ? <div className="relative overflow-hidden rounded-xl bg-[#F6F7F3]"><img src={image} alt="Fotografia selecionada para triagem" className="max-h-[420px] w-full object-contain" /><button onClick={() => { setImage(null); setAnalysis(''); setError('') }} aria-label="Remover imagem" className="absolute right-3 top-3 rounded-full bg-white p-2 text-[#283106] shadow"><X className="h-4 w-4" /></button></div> : <div className="flex aspect-video flex-col items-center justify-center rounded-xl border border-dashed border-[#CDD2BD] bg-[#FAFBF7] text-center"><ImagePlus className="h-9 w-9 text-[#82905A]" /><p className="mt-3 text-sm font-semibold text-[#3D4A2C]">Ainda não foi selecionada uma imagem</p><p className="mt-1 text-xs text-[#7A8067]">JPG, PNG ou WebP até 3,5 MB</p></div>}
        <div className="mt-4 flex flex-wrap gap-2">
          {cameraActive ? <button onClick={capture} className="inline-flex items-center gap-2 rounded-lg bg-[#52642B] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#3D4A2C]"><Camera className="h-4 w-4" />Capturar e analisar</button> : <button onClick={() => void startCamera()} className="inline-flex items-center gap-2 rounded-lg bg-[#52642B] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#3D4A2C]"><Camera className="h-4 w-4" />Abrir câmara</button>}
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[#DDE1D2] bg-white px-4 py-2.5 text-sm font-semibold text-[#3D4A2C] hover:bg-[#F6F7F3]"><Upload className="h-4 w-4" />Escolher fotografia<input type="file" accept="image/jpeg,image/png,image/webp" onChange={upload} className="sr-only" /></label>
          {cameraActive && <button onClick={stopCamera} className="rounded-lg px-3 py-2 text-sm text-[#727964] hover:bg-[#F6F7F3]">Fechar câmara</button>}
        </div>
      </section>

      <section className="rounded-xl border border-[#E2E5D9] bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-[#687B2A]" /><h2 className="font-bold text-[#283106]">Resultado da triagem</h2></div>
        {busy ? <div className="flex min-h-56 flex-col items-center justify-center text-center"><LoaderCircle className="h-8 w-8 animate-spin text-[#687B2A]" /><p className="mt-3 text-sm font-medium text-[#53602E]">A analisar a imagem…</p><p className="mt-1 text-xs text-[#7A8067]">O serviço pode demorar alguns segundos.</p></div> : analysis ? <div className="mt-4 whitespace-pre-wrap rounded-lg bg-[#F6F7F3] p-4 text-sm leading-6 text-[#384126]">{analysis}<div className="mt-4 border-t border-[#E2E5D9] pt-3 text-xs text-[#727964]">A IA pode falhar. Confirma as observações com um profissional de saúde animal.</div></div> : <div className="mt-4 flex min-h-56 flex-col items-center justify-center rounded-lg bg-[#FAFBF7] px-6 text-center"><Activity className="h-8 w-8 text-[#A0AA82]" /><p className="mt-3 text-sm text-[#727964]">O resultado aparecerá aqui após o envio de uma fotografia.</p></div>}
        {error && <div role="alert" className="mt-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />{error}</div>}
      </section>
    </div>
  </div>
}
