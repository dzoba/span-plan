import { useRef, useState } from 'react'
import { addDays, startOfDay, format, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval } from 'date-fns'
import TimelineRow from './TimelineRow'
import type { Timeline, TimelineItem as TimelineItemType, ViewMode } from '../../types'
import { getPixelsPerUnit } from '../../lib/utils'

interface TimelineGridProps {
  timeline: Timeline
  viewMode: ViewMode
  onAddItem: (rowId: string, startDate: Date) => void
  onUpdateItem: (itemId: string, updates: Partial<TimelineItemType>) => void
  onDeleteItem: (itemId: string) => void
  onUpdateRow: (rowId: string, updates: { name: string }) => void
  onAddRow: () => void
  onDeleteRow: (rowId: string) => void
  onSelectItem: (item: TimelineItemType | null) => void
  selectedItemId: string | null
}

export default function TimelineGrid({
  timeline,
  viewMode,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onUpdateRow,
  onAddRow,
  onDeleteRow,
  onSelectItem,
  selectedItemId
}: TimelineGridProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [baseDate] = useState(() => startOfDay(new Date()))

  const pixelsPerUnit = getPixelsPerUnit(viewMode)
  const totalUnits = viewMode === 'month' ? 24 : viewMode === 'week' ? 52 : 365
  const totalWidth = totalUnits * pixelsPerUnit
  const rowHeight = 60

  const getTimeMarkers = () => {
    const endDate = addDays(baseDate, viewMode === 'month' ? 730 : viewMode === 'week' ? 364 : 365)

    switch (viewMode) {
      case 'day':
        return eachDayOfInterval({ start: baseDate, end: endDate })
      case 'week':
        return eachWeekOfInterval({ start: baseDate, end: endDate }, { weekStartsOn: 0 })
      case 'month':
        return eachMonthOfInterval({ start: baseDate, end: endDate })
    }
  }

  const formatMarker = (date: Date) => {
    switch (viewMode) {
      case 'day':
        return format(date, 'MMM d')
      case 'week':
        return format(date, 'MMM d')
      case 'month':
        return format(date, 'MMM yyyy')
    }
  }

  const markers = getTimeMarkers()

  const handleRowDoubleClick = (rowId: string, e: React.MouseEvent) => {
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const scrollLeft = containerRef.current.scrollLeft
    const x = e.clientX - rect.left + scrollLeft - 150 // Subtract row label width

    const units = Math.floor(x / pixelsPerUnit)
    let clickDate: Date

    switch (viewMode) {
      case 'day':
        clickDate = addDays(baseDate, units)
        break
      case 'week':
        clickDate = addDays(baseDate, units * 7)
        break
      case 'month':
        clickDate = new Date(baseDate.getFullYear(), baseDate.getMonth() + units, 1)
        break
    }

    onAddItem(rowId, clickDate)
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
      <div
        ref={containerRef}
        className="flex-1 overflow-auto"
      >
        <div style={{ width: totalWidth + 150 }} className="min-h-full">
          {/* Time markers header */}
          <div className="sticky top-0 z-20 flex bg-white border-b border-gray-200">
            <div className="w-[150px] flex-shrink-0 bg-white border-r border-gray-200 p-2 font-medium text-sm text-gray-600">
              Rows
            </div>
            <div className="flex">
              {markers.map((date, i) => (
                <div
                  key={i}
                  style={{ width: pixelsPerUnit }}
                  className="flex-shrink-0 p-2 text-xs text-gray-500 border-r border-gray-100"
                >
                  {formatMarker(date)}
                </div>
              ))}
            </div>
          </div>

          {/* Rows */}
          {timeline.rows.sort((a, b) => a.order - b.order).map((row) => (
            <TimelineRow
              key={row.id}
              row={row}
              items={timeline.items.filter(item => item.rowId === row.id)}
              rowHeight={rowHeight}
              totalWidth={totalWidth}
              baseDate={baseDate}
              viewMode={viewMode}
              onUpdateRow={onUpdateRow}
              onDeleteRow={onDeleteRow}
              onDoubleClick={(e) => handleRowDoubleClick(row.id, e)}
              onUpdateItem={onUpdateItem}
              onDeleteItem={onDeleteItem}
              onSelectItem={onSelectItem}
              selectedItemId={selectedItemId}
            />
          ))}

          {/* Add row button */}
          <div className="flex border-t border-gray-200">
            <div className="w-[150px] flex-shrink-0 p-2 bg-white border-r border-gray-200">
              <button
                onClick={onAddRow}
                className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded flex items-center justify-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Row
              </button>
            </div>
            <div style={{ width: totalWidth }} className="bg-gray-50" />
          </div>
        </div>
      </div>
    </div>
  )
}
