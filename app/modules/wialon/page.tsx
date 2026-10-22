import WialonMapPanel from '@/components/wialon/wialon-map-panel'
import WialonManagementPanel from '@/components/wialon/wialon-management-panel'
import Link from 'next/link'

export default function WialonMonitoringPage() {
  return (
    <div className="min-h-screen bg-[#DFE0DC] p-4 md:p-6">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-5">
          <Link href="/dashboard" className="mb-3 inline-flex text-xs font-semibold text-[#53602E] hover:underline">← Voltar ao dashboard</Link>
          <h1 className="font-montserrat text-xl font-bold text-[#283106]">
            Monitorização Wialon
          </h1>
          <p className="mt-1 text-xs text-[#777E5C]">
            Dispositivos, localização e sensores da operação.
          </p>
        </div>
        <WialonMapPanel endpoint="/api/wialon/units?full=1" />
        <WialonManagementPanel />
      </div>
    </div>
  )
}
