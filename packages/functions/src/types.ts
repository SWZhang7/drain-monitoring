export type DrainItem = {
  D_Id: string
  publicName: string
  privateName: string
  latitude: number
  longitude: number
  sentimentScore: number // 0-10, aggregated from reports
  operatorEmail: string  // SES recipient for volunteer notifications
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
