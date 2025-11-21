export interface TimelineItem {
  id: string
  rowId: string | null // null for backlog items
  title: string
  subtitle: string
  color: string
  startDate: string | null // null for backlog items
  endDate: string | null // null for backlog items
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
