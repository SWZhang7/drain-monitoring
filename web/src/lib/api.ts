const API = import.meta.env.VITE_API_URL ?? ""

export type Drain = {
  D_Id: string
  publicName: string
  latitude: number
  longitude: number
  height: number
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

export type DrainPrivate = {
  D_Id: string
  publicName: string
  privateName: string | null
  latitude: number
  longitude: number
  height: number | null
  operatorEmail: string | null
  sentimentScore: number | null
  reportCount: number
  lastSeen: number | null
  alertSince: number | null
  alreadyAlerted: boolean
  fillPercent: number | null
  co2Ppm: number | null
}

export async function fetchAdminDrains(token: string): Promise<DrainPrivate[]> {
  const res = await fetch(`${API}/admin/drains`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error("Failed to fetch admin drains")
  return res.json()
}

export type DrainMessage = {
  Event_Key: string
  eventType: string
  message: string
  name: string
  createdAt: string
  sentiment: string | null
}

export async function fetchDrainMessages(token: string, drainId: string): Promise<DrainMessage[]> {
  const res = await fetch(`${API}/admin/drains/${drainId}/messages`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error("Failed to fetch messages")
  return res.json()
}

export type Operator = {
  username: string
  attributes: {
    email?: string
    name?: string
    "custom:description"?: string
    email_verified?: string
  }
  status: string
}

export async function fetchOperators(token: string): Promise<Operator[]> {
  const res = await fetch(`${API}/admin/operators`, { headers: { Authorization: `Bearer ${token}` } })
  if (!res.ok) throw new Error("Failed to fetch operators")
  const json = await res.json()
  return json.data
}

export async function createOperator(token: string, data: { email: string; name: string; description: string }): Promise<void> {
  const res = await fetch(`${API}/admin/operators`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const json = await res.json().catch(() => ({}))
    throw new Error(json.error ?? "Failed to create operator")
  }
}

export async function updateOperator(token: string, email: string, data: { name: string; description: string }): Promise<void> {
  const res = await fetch(`${API}/admin/operators/${encodeURIComponent(email)}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Failed to update operator")
}

export async function deleteOperator(token: string, email: string): Promise<void> {
  const res = await fetch(`${API}/admin/operators/${encodeURIComponent(email)}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error("Failed to delete operator")
}

export async function assignOperatorToDrain(token: string, drainId: string, operatorEmail: string | null): Promise<void> {
  const res = await fetch(`${API}/admin/drains/${drainId}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ operatorEmail }),
  })
  if (!res.ok) throw new Error("Failed to assign operator")
}

export async function resetDrainSentiment(token: string, drainId: string): Promise<void> {
  const res = await fetch(`${API}/admin/drains/${drainId}/reset-sentiment`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error("Failed to reset sentiment")
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
