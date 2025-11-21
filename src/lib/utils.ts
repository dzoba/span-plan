import { nanoid } from 'nanoid'
import {
  startOfDay,
  startOfWeek,
  startOfMonth,
  endOfDay,
  endOfWeek,
  endOfMonth,
  addDays,
  addWeeks,
  addMonths,
  differenceInDays,
  differenceInWeeks,
  differenceInMonths,
  format,
  parseISO
} from 'date-fns'
import type { ViewMode } from '../types'

export function generateId(): string {
  return nanoid(21)
}

export function getDefaultRows() {
  return [
    { id: generateId(), name: 'Row 1', order: 0 },
    { id: generateId(), name: 'Row 2', order: 1 },
    { id: generateId(), name: 'Row 3', order: 2 },
    { id: generateId(), name: 'Row 4', order: 3 },
  ]
}

export function getViewStart(date: Date, viewMode: ViewMode): Date {
  switch (viewMode) {
    case 'day':
      return startOfDay(date)
    case 'week':
      return startOfWeek(date, { weekStartsOn: 0 })
    case 'month':
      return startOfMonth(date)
  }
}

export function getViewEnd(date: Date, viewMode: ViewMode): Date {
  switch (viewMode) {
    case 'day':
      return endOfDay(date)
    case 'week':
      return endOfWeek(date, { weekStartsOn: 0 })
    case 'month':
      return endOfMonth(date)
  }
}

export function addViewUnits(date: Date, units: number, viewMode: ViewMode): Date {
  switch (viewMode) {
    case 'day':
      return addDays(date, units)
    case 'week':
      return addWeeks(date, units)
    case 'month':
      return addMonths(date, units)
  }
}

export function getUnitsBetween(start: Date, end: Date, viewMode: ViewMode): number {
  switch (viewMode) {
    case 'day':
      return differenceInDays(end, start)
    case 'week':
      return differenceInWeeks(end, start)
    case 'month':
      return differenceInMonths(end, start)
  }
}

export function formatDate(date: Date | string, formatStr: string = 'MMM d, yyyy'): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, formatStr)
}

export function getPixelsPerUnit(viewMode: ViewMode): number {
  switch (viewMode) {
    case 'day':
      return 60
    case 'week':
      return 120
    case 'month':
      return 150
  }
}

export function dateToPosition(date: Date | string, baseDate: Date, viewMode: ViewMode): number {
  const d = typeof date === 'string' ? parseISO(date) : date
  const units = getUnitsBetween(baseDate, d, viewMode)
  return units * getPixelsPerUnit(viewMode)
}

export function positionToDate(position: number, baseDate: Date, viewMode: ViewMode): Date {
  const pixelsPerUnit = getPixelsPerUnit(viewMode)
  const units = Math.round(position / pixelsPerUnit)
  return addViewUnits(baseDate, units, viewMode)
}

export const DEFAULT_COLORS = [
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#F97316', // orange
]

export function getRandomColor(): string {
  return DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)]
}
