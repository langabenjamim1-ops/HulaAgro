export type WialonSensor = {
  id: number
  name: string
  type: string
  unit: string
  parameter: string
  value: number | string | null
  formattedValue: string | null
}

export type WialonUnit = {
  id: number
  name: string
  position: {
    latitude: number
    longitude: number
    altitude: number
    speed: number
    course: number
    satellites: number
    timestamp: number
  } | null
  connected: boolean
  lastMessageTimestamp: number
  mileage: string | null
  engineHours: string | null
  sensors: WialonSensor[]
}
