import { useState } from "react"
import { Map, MapControls } from "@/components/ui/map"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"

function DrainMap() {
  const [theme, setTheme] = useState<"light" | "dark">("dark")

  return (
    <div className="w-full p-7">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-5xl font-bold tracking-tighter">Drain Map</h1>
          <p className="text-text/60 mt-1">View and report blocked roadside drains across Jamaica</p>
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
          <MapControls showCompass />
        </Map>
      </Card>
    </div>
  )
}

export default DrainMap
