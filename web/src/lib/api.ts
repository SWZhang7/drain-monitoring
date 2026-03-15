const API = import.meta.env.VITE_API_URL ?? ""

export type DrainStatus = "normal" | "elevated" | "critical"

export type Drain = {
  D_Id: string
  publicName: string
  latitude: number
  longitude: number
  online: boolean
  fillPercent: number | null
  drainStatus: DrainStatus
}

export async function fetchDrains(): Promise<Drain[]> {
  const res = await fetch(`${API}/drains`)
  if (!res.ok) throw new Error("Failed to fetch drains")
  return res.json()
}

export async function submitReport(data: { D_Id: string; description: string; name?: string }) {
  const res = await fetch(`${API}/reports`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Failed to submit report")
  return res.json()
}

export async function submitVolunteer(data: { D_Id: string; name: string; contact: string; availability?: string }) {
  const res = await fetch(`${API}/volunteers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Failed to sign up")
  return res.json()
}
