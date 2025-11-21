import { describe, it, expect } from 'vitest'
import {
  generateId,
  getDefaultRows,
  getViewStart,
  getViewEnd,
  addViewUnits,
  getUnitsBetween,
  formatDate,
  getPixelsPerUnit,
  dateToPosition,
  positionToDate,
  DEFAULT_COLORS,
  getRandomColor,
} from './utils'

describe('generateId', () => {
  it('generates a 21 character string', () => {
    const id = generateId()
    expect(id).toHaveLength(21)
    expect(typeof id).toBe('string')
  })

  it('generates unique ids', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()))
    expect(ids.size).toBe(100)
  })
})

describe('getDefaultRows', () => {
  it('returns 4 rows', () => {
    const rows = getDefaultRows()
    expect(rows).toHaveLength(4)
  })

  it('rows have correct structure', () => {
    const rows = getDefaultRows()
    rows.forEach((row, index) => {
      expect(row.id).toHaveLength(21)
      expect(row.name).toBe(`Row ${index + 1}`)
      expect(row.order).toBe(index)
    })
  })

  it('generates unique row ids', () => {
    const rows = getDefaultRows()
    const ids = rows.map(r => r.id)
    expect(new Set(ids).size).toBe(4)
  })
})

describe('getViewStart', () => {
  const date = new Date(2024, 5, 15, 14, 30) // June 15, 2024 2:30 PM

  it('returns start of day for day view', () => {
    const start = getViewStart(date, 'day')
    expect(start.getHours()).toBe(0)
    expect(start.getMinutes()).toBe(0)
    expect(start.getDate()).toBe(15)
  })

  it('returns start of week for week view', () => {
    const start = getViewStart(date, 'week')
    expect(start.getDay()).toBe(0) // Sunday
  })

  it('returns start of month for month view', () => {
    const start = getViewStart(date, 'month')
    expect(start.getDate()).toBe(1)
    expect(start.getMonth()).toBe(5) // June
  })
})

describe('getViewEnd', () => {
  const date = new Date(2024, 5, 15, 14, 30) // June 15, 2024

  it('returns end of day for day view', () => {
    const end = getViewEnd(date, 'day')
    expect(end.getHours()).toBe(23)
    expect(end.getMinutes()).toBe(59)
  })

  it('returns end of week for week view', () => {
    const end = getViewEnd(date, 'week')
    expect(end.getDay()).toBe(6) // Saturday
  })

  it('returns end of month for month view', () => {
    const end = getViewEnd(date, 'month')
    expect(end.getDate()).toBe(30) // June has 30 days
  })
})

describe('addViewUnits', () => {
  const date = new Date(2024, 5, 15)

  it('adds days for day view', () => {
    const result = addViewUnits(date, 5, 'day')
    expect(result.getDate()).toBe(20)
  })

  it('adds weeks for week view', () => {
    const result = addViewUnits(date, 2, 'week')
    expect(result.getDate()).toBe(29)
  })

  it('adds months for month view', () => {
    const result = addViewUnits(date, 3, 'month')
    expect(result.getMonth()).toBe(8) // September
  })

  it('handles negative units', () => {
    const result = addViewUnits(date, -5, 'day')
    expect(result.getDate()).toBe(10)
  })
})

describe('getUnitsBetween', () => {
  it('calculates days between dates', () => {
    const start = new Date(2024, 5, 1)
    const end = new Date(2024, 5, 15)
    expect(getUnitsBetween(start, end, 'day')).toBe(14)
  })

  it('calculates weeks between dates', () => {
    const start = new Date(2024, 5, 1)
    const end = new Date(2024, 5, 29)
    expect(getUnitsBetween(start, end, 'week')).toBe(4)
  })

  it('calculates months between dates', () => {
    const start = new Date(2024, 0, 1)
    const end = new Date(2024, 5, 1)
    expect(getUnitsBetween(start, end, 'month')).toBe(5)
  })
})

describe('formatDate', () => {
  it('formats Date object with default format', () => {
    const date = new Date(2024, 5, 15)
    expect(formatDate(date)).toBe('Jun 15, 2024')
  })

  it('formats ISO string with default format', () => {
    expect(formatDate('2024-06-15')).toBe('Jun 15, 2024')
  })

  it('uses custom format string', () => {
    const date = new Date(2024, 5, 15)
    expect(formatDate(date, 'yyyy-MM-dd')).toBe('2024-06-15')
  })
})

describe('getPixelsPerUnit', () => {
  it('returns 60 for day view', () => {
    expect(getPixelsPerUnit('day')).toBe(60)
  })

  it('returns 120 for week view', () => {
    expect(getPixelsPerUnit('week')).toBe(120)
  })

  it('returns 150 for month view', () => {
    expect(getPixelsPerUnit('month')).toBe(150)
  })
})

describe('dateToPosition', () => {
  const baseDate = new Date(2024, 5, 1)

  it('calculates position for day view', () => {
    const date = new Date(2024, 5, 11) // 10 days later
    const position = dateToPosition(date, baseDate, 'day')
    expect(position).toBe(10 * 60) // 10 days * 60 pixels
  })

  it('accepts ISO string dates', () => {
    const position = dateToPosition('2024-06-11', baseDate, 'day')
    expect(position).toBe(10 * 60)
  })
})

describe('positionToDate', () => {
  const baseDate = new Date(2024, 5, 1)

  it('converts position to date for day view', () => {
    const date = positionToDate(600, baseDate, 'day') // 600px = 10 days
    expect(date.getDate()).toBe(11)
  })

  it('rounds to nearest unit', () => {
    const date = positionToDate(625, baseDate, 'day') // 625px ~ 10.4 days
    expect(date.getDate()).toBe(11)
  })
})

describe('DEFAULT_COLORS', () => {
  it('has 8 colors', () => {
    expect(DEFAULT_COLORS).toHaveLength(8)
  })

  it('all colors are valid hex codes', () => {
    DEFAULT_COLORS.forEach(color => {
      expect(color).toMatch(/^#[0-9A-F]{6}$/i)
    })
  })
})

describe('getRandomColor', () => {
  it('returns a color from DEFAULT_COLORS', () => {
    const color = getRandomColor()
    expect(DEFAULT_COLORS).toContain(color)
  })

  it('returns different colors over multiple calls', () => {
    const colors = new Set(Array.from({ length: 100 }, () => getRandomColor()))
    expect(colors.size).toBeGreaterThan(1)
  })
})
