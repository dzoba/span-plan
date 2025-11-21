import { useRef, useState } from 'react'
import { addDays, startOfDay, format, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval } from 'date-fns'
import TimelineRow from './TimelineRow'
import TimelineItem from './TimelineItem'
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
  const [zoomScale, setZoomScale] = useState(1)

  const basePixelsPerUnit = getPixelsPerUnit(viewMode)
  const pixelsPerUnit = basePixelsPerUnit * zoomScale
  const totalUnits = viewMode === 'month' ? 24 : viewMode === 'week' ? 52 : 365
  const totalWidth = totalUnits * pixelsPerUnit
  const rowHeight = 60

  const handleWheel = (e: React.WheelEvent) => {
    // Only zoom on vertical scroll (deltaY), let horizontal scroll work normally
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      e.preventDefault()
      const zoomFactor = e.deltaY > 0 ? 0.98 : 1.02
      setZoomScale(prev => Math.max(0.2, Math.min(5, prev * zoomFactor)))
    }
  }

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
        className="flex-1 overflow-auto overscroll-x-contain"
        onWheel={handleWheel}
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

          {/* Rows and Items container */}
          <div className="relative">
            {/* Rows */}
            {timeline.rows.sort((a, b) => a.order - b.order).map((row) => (
              <TimelineRow
                key={row.id}
                row={row}
                rowHeight={rowHeight}
                totalWidth={totalWidth}
                onUpdateRow={onUpdateRow}
                onDeleteRow={onDeleteRow}
                onDoubleClick={(e) => handleRowDoubleClick(row.id, e)}
                hasItems={timeline.items.some(item => item.rowId === row.id)}
              />
            ))}

            {/* Items rendered at grid level for smooth cross-row dragging */}
            {timeline.items.map((item) => {
              const sortedRows = timeline.rows.sort((a, b) => a.order - b.order)
              const rowIndex = sortedRows.findIndex(r => r.id === item.rowId)
              return (
                <TimelineItem
                  key={item.id}
                  item={item}
                  baseDate={baseDate}
                  viewMode={viewMode}
                  pixelsPerUnit={pixelsPerUnit}
                  rowHeight={rowHeight}
                  rowIndex={rowIndex}
                  rowTop={rowIndex * rowHeight}
                  onUpdate={onUpdateItem}
                  onDelete={onDeleteItem}
                  onSelect={onSelectItem}
                  isSelected={selectedItemId === item.id}
                  allRowIds={sortedRows.map(r => r.id)}
                />
              )
            })}
          </div>

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
