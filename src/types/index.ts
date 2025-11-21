export interface TimelineItem {
  id: string
  rowId: string
  title: string
  subtitle: string
  color: string
  startDate: string // ISO date string
  endDate: string // ISO date string
}

export interface TimelineRow {
  id: string
  name: string
  order: number
}

export interface Timeline {
  id: string
  ownerId: string | null
  createdAt: string
  rows: TimelineRow[]
  items: TimelineItem[]
}

export type ViewMode = 'day' | 'week' | 'month'

export interface User {
  uid: string
  email: string | null
  displayName: string | null
}
