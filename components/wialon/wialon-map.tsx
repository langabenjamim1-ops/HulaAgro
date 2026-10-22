'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  useMap,
  ZoomControl,
} from 'react-leaflet'
import type { LatLngExpression } from 'leaflet'
import type { WialonUnit } from '@/lib/wialon-types'

type Props = {
  units: WialonUnit[]
  selectedUnitId: number | null
  onSelectUnit: (id: number) => void
}

function FitUnits({ units }: { units: WialonUnit[] }) {
  const map = useMap()

  useEffect(() => {
    const points = units
      .filter((unit) => unit.position)
      .map((unit) => [unit.position!.latitude, unit.position!.longitude] as LatLngExpression)

    if (!points.length) return

    if (points.length === 1) {
      map.setView(points[0], 15)
      return
    }

    const bounds = points as [number, number][]
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 })
  }, [map, units])

  return null
}

function SelectUnit({ unit }: { unit: WialonUnit | undefined }) {
  const map = useMap()

  useEffect(() => {
    if (!unit?.position) return
    map.flyTo(
      [unit.position.latitude, unit.position.longitude],
      Math.max(map.getZoom(), 15),
      { duration: 0.6 }
    )
  }, [map, unit])

  return null
}

export default function WialonMap({
  units,
  selectedUnitId,
  onSelectUnit,
}: Props) {
  const validUnits = useMemo(
    () =>
      units.filter(
        (unit) =>
          unit.position &&
          Number.isFinite(unit.position.latitude) &&
          Number.isFinite(unit.position.longitude)
      ),
    [units]
  )

  const center: LatLngExpression =
    validUnits.length > 0
      ? [validUnits[0].position!.latitude, validUnits[0].position!.longitude]
      : [-25.9692, 32.5732] // Maputo fallback

  const selected = units.find((unit) => unit.id === selectedUnitId)

  return (
    <MapContainer
      center={center}
      zoom={12}
      zoomControl={false}
      className="h-full w-full rounded-[inherit]"
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ZoomControl position="bottomright" />
      <FitUnits units={validUnits} />
      <SelectUnit unit={selected} />

      {validUnits.map((unit) => {
        const position = unit.position!
        const isSelected = unit.id === selectedUnitId

        return (
          <CircleMarker
            key={unit.id}
            center={[position.latitude, position.longitude]}
            radius={isSelected ? 10 : 8}
            pathOptions={{
              color: isSelected ? '#283106' : '#ffffff',
              weight: isSelected ? 4 : 2,
              fillColor: unit.connected ? '#65a30d' : '#dc2626',
              fillOpacity: 0.95,
            }}
            eventHandlers={{
              click: () => onSelectUnit(unit.id),
            }}
          >
            <Popup>
              <div className="min-w-[190px] text-sm">
                <div className="font-bold text-slate-900">{unit.name}</div>
                <div className="mt-1 text-slate-600">
                  {unit.connected ? '● Online' : '● Offline'}
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <span>Velocidade</span>
                  <strong>{position.speed.toFixed(0)} km/h</strong>
                  <span>Satélites</span>
                  <strong>{position.satellites}</strong>
                  <span>Altitude</span>
                  <strong>{position.altitude.toFixed(0)} m</strong>
                </div>
                {unit.sensors.length > 0 && (
                  <div className="mt-3 border-t pt-2">
                    <div className="mb-1 font-semibold">Sensores</div>
                    {unit.sensors.slice(0, 5).map((sensor) => (
                      <div key={sensor.id} className="flex justify-between gap-3">
                        <span className="truncate">{sensor.name}</span>
                        <strong>{sensor.formattedValue ?? '—'}</strong>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Popup>
          </CircleMarker>
        )
      })}
    </MapContainer>
  )
}
