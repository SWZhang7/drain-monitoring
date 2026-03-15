export type DrainPublic = {
  D_Id: string
  publicName: string
  latitude: number
  longitude: number
}

export type DrainItem = DrainPublic & {
  privateName: string
  sentimentScore: number
  reportCount: number
  operatorEmail: string
}

export type DrainEventItem = {
  D_Id: string
  createdAt: string
  // REPORT fields
  message?: string
  name?: string
  sentiment?: string
  sentimentScore?: Record<string, number>
  // VOLUNTEER fields
  contact?: string
  availability?: string
}
