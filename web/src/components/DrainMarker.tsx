import { MapMarker, MarkerContent } from "@/components/ui/map"
import { Droplets } from "lucide-react"

type DrainMarkerProps = {
  readonly id: string
  readonly name: string
  readonly latitude: number
  readonly longitude: number
  readonly online: boolean
  readonly onClick: (drain: { id: string; name: string }) => void
}

export function DrainMarker({ id, name, latitude, longitude, online, onClick }: DrainMarkerProps) {
  return (
    <MapMarker longitude={longitude} latitude={latitude} onClick={() => onClick({ id, name })}>
      <MarkerContent>
        <div className="flex flex-col items-center gap-1">
          <div className="relative group flex items-center justify-center w-9 h-9 rounded-full bg-accent border-2 border-text shadow-lg hover:bg-alt-accent hover:border-white transition-colors cursor-pointer">
            <Droplets className="size-4 text-text group-hover:text-white transition-colors" />
            <span className={`absolute -top-1 -right-1 size-3 rounded-full border-2 border-white ${online ? "bg-green-500" : "bg-red-500"}`} />
          </div>
          <div className="bg-text text-white text-xs font-semibold px-2 py-0.5 rounded-md shadow-md whitespace-nowrap">{name}</div>
        </div>
      </MarkerContent>
    </MapMarker>
  )
}
