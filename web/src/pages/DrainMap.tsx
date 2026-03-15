import { useState, useEffect } from "react"
import { Map, MapControls, MapMarker, MarkerContent, useMap } from "@/components/ui/map"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DrainDialog } from "@/components/DrainDialog"
import { Moon, Sun, Loader2, Droplets, Flag } from "lucide-react"

const JAMAICA = { center: [-77.3, 18.15] as [number, number], zoom: 8.6 }

function CenterJamaica() {
  const { map } = useMap()
  return (
    <button
      onClick={() => map?.flyTo({ center: JAMAICA.center, zoom: JAMAICA.zoom, duration: 1000 })}
      aria-label="Center on Jamaica"
      className="absolute top-2 left-2 z-10 flex items-center justify-center size-8 rounded-md border border-white/20 bg-[#1a1a1a] text-white shadow-sm hover:bg-accent hover:text-text hover:border-transparent transition-colors"
    >
      <Flag className="size-4" />
    </button>
  )
}

function MapLoader() {
  const { isLoaded } = useMap()
  if (isLoaded) return null
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
      <Loader2 className="size-6 animate-spin text-text/60" />
    </div>
  )
}

type DrainStatusValue = "online" | "offline"

function DrainStatus({ drainId }: { drainId: string }) {
  const [status, setStatus] = useState<DrainStatusValue>("offline")

  useEffect(() => {
    const ws = new WebSocket(`wss://your-api/drains/${drainId}/status`)
    ws.onmessage = (e) => setStatus(JSON.parse(e.data).status)
    return () => ws.close()
  }, [drainId])

  return (
    <span className={`absolute -top-1 -right-1 size-3 rounded-full border-2 border-white ${status === "online" ? "bg-green-500" : "bg-red-500"}`} />
  )
}

function DrainMap() {
  const [theme, setTheme] = useState<"light" | "dark">("dark")
  const [selectedDrain, setSelectedDrain] = useState<string | null>(null)

  return (
    <div className="w-full p-7">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-5xl font-bold tracking-tighter">Drain Map</h1>
          <p className="text-text/60 mt-1">Click a marker to report a blocked drain or volunteer to fix it.</p>
        </div>
        <Button
          size="icon"
          variant="outline"
          className="rounded-full"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle map theme"
        >
          {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </Button>
      </div>
      <Card className="w-full h-[600px] p-0 overflow-hidden">
        <Map theme={theme} center={[-77.3, 18.15]} zoom={8.6}>
          <MapLoader />
          <CenterJamaica />
          <MapMarker longitude={-77.3664} latitude={18.3919} onClick={() => setSelectedDrain("Brown's Town")}>
            <MarkerContent>
              <div className="flex flex-col items-center gap-1">
                <div className="relative group flex items-center justify-center w-9 h-9 rounded-full bg-accent border-2 border-text shadow-lg hover:bg-alt-accent hover:border-white transition-colors cursor-pointer">
                  <Droplets className="size-4 text-text group-hover:text-white transition-colors" />
                  <DrainStatus drainId="browns-town-01" />
                </div>
                <div className="bg-text text-white text-xs font-semibold px-2 py-0.5 rounded-md shadow-md whitespace-nowrap">Brown's Town</div>
              </div>
            </MarkerContent>
          </MapMarker>
          <MapControls showCompass />
        </Map>
      </Card>
      <DrainDialog
        open={!!selectedDrain}
        onClose={() => setSelectedDrain(null)}
        drainName={selectedDrain ?? ""}
      />
    </div>
  )
}

export default DrainMap
