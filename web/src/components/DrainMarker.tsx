import { useState, useEffect } from "react"
import { MapMarker, MarkerContent } from "@/components/ui/map"
import { Droplets, Circle, XCircle } from "lucide-react"

type DrainStatusValue = "online" | "offline"

function DrainStatus({ drainId }: { drainId: string }) {
  const [status, setStatus] = useState<DrainStatusValue>("offline")

  useEffect(() => {
    const ws = new WebSocket(`wss://your-api/drains/${drainId}/status`)
    ws.onmessage = (e) => setStatus(JSON.parse(e.data).status)
    return () => ws.close()
  }, [drainId])

  return status === "online"
    ? <Circle className="absolute -top-1 -right-1 size-3.5 fill-green-500 text-green-500" />
    : <XCircle className="absolute -top-1 -right-1 size-3.5 fill-red-500 text-white" />
}

type DrainMarkerProps = {
  id: string
  name: string
  latitude: number
  longitude: number
  onClick: (drain: { id: string; name: string }) => void
}

export function DrainMarker({ id, name, latitude, longitude, onClick }: DrainMarkerProps) {
  return (
    <MapMarker longitude={longitude} latitude={latitude} onClick={() => onClick({ id, name })}>
      <MarkerContent>
        <div className="flex flex-col items-center gap-1">
          <div className="relative group flex items-center justify-center w-9 h-9 rounded-full bg-accent border-2 border-text shadow-lg hover:bg-alt-accent hover:border-white transition-colors cursor-pointer">
            <Droplets className="size-4 text-text group-hover:text-white transition-colors" />
            <DrainStatus drainId={id} />
          </div>
          <div className="bg-text text-white text-xs font-semibold px-2 py-0.5 rounded-md shadow-md whitespace-nowrap">{name}</div>
        </div>
      </MarkerContent>
    </MapMarker>
  )
}
