const API = import.meta.env.VITE_API_URL ?? ""

export type Drain = {
  D_Id: string
  publicName: string
  privateName: string
  latitude: number
  longitude: number
  sentimentScore: number
  operatorEmail: string
}

export async function fetchDrains(): Promise<Drain[]> {
  const res = await fetch(`${API}/drains`)
  if (!res.ok) throw new Error("Failed to fetch drains")
  return res.json()
}
