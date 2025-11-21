import { useRef, useState, forwardRef, useImperativeHandle } from 'react'
import { addDays, startOfDay, startOfWeek, format, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval, parseISO, differenceInDays, differenceInMonths, startOfMonth } from 'date-fns'
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
  draggedBacklogItem?: TimelineItemType | null
  onBacklogItemDrop?: () => void
}

export interface TimelineGridHandle {
  scrollToItem: (itemId: string) => void
}

const TimelineGrid = forwardRef<TimelineGridHandle, TimelineGridProps>(({
  timeline,
  viewMode,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onUpdateRow,
  onAddRow,
  onDeleteRow,
  onSelectItem,
  selectedItemId,
  draggedBacklogItem,
  onBacklogItemDrop
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [baseDate] = useState(() => startOfDay(new Date()))
  const [zoomScale, setZoomScale] = useState(1)

  const basePixelsPerUnit = getPixelsPerUnit(viewMode)
  const pixelsPerUnit = basePixelsPerUnit * zoomScale

  // Expose scrollToItem method via ref
  useImperativeHandle(ref, () => ({
    scrollToItem: (itemId: string) => {
      const item = timeline.items.find(i => i.id === itemId)
      if (!item || !item.startDate || !containerRef.current) return

      const startDate = parseISO(item.startDate)
      let position: number

      switch (viewMode) {
        case 'day':
          position = differenceInDays(startDate, baseDate) * pixelsPerUnit
          break
        case 'week': {
          const weekStart = startOfWeek(baseDate, { weekStartsOn: 0 })
          const daysDiff = differenceInDays(startDate, weekStart)
          position = (daysDiff / 7) * pixelsPerUnit
          break
        }
        case 'month': {
          const monthStart = startOfMonth(baseDate)
          const monthsDiff = differenceInMonths(startDate, monthStart)
          const dayOfMonth = startDate.getDate() - 1
          const daysInMonth = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0).getDate()
          position = (monthsDiff + dayOfMonth / daysInMonth) * pixelsPerUnit
          break
        }
      }

      // Scroll to position with some padding (50px from left edge, after row labels)
      containerRef.current.scrollTo({
        left: Math.max(0, position - 50),
        behavior: 'smooth'
      })
    }
  }), [timeline.items, viewMode, baseDate, pixelsPerUnit])
  // 3 years worth of units
  const totalUnits = viewMode === 'month' ? 36 : viewMode === 'week' ? 156 : 1095
  const totalWidth = totalUnits * pixelsPerUnit
  const rowHeight = 60

  const handleWheel = (e: React.WheelEvent) => {
    // Only zoom on vertical scroll (deltaY), let horizontal scroll work normally
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      e.preventDefault()
      const zoomFactor = e.deltaY > 0 ? 0.99 : 1.01
      setZoomScale(prev => Math.max(0.2, Math.min(5, prev * zoomFactor)))
    }
  }

  const getTimeMarkers = () => {
    // 3 years worth of markers
    const endDate = addDays(baseDate, viewMode === 'month' ? 1095 : viewMode === 'week' ? 1092 : 1095)

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
      case 'week': {
        // Week markers start from beginning of week containing baseDate
        const weekStart = startOfWeek(baseDate, { weekStartsOn: 0 })
        clickDate = addDays(weekStart, units * 7)
        break
      }
      case 'month':
        clickDate = new Date(baseDate.getFullYear(), baseDate.getMonth() + units, 1)
        break
    }

    onAddItem(rowId, clickDate)
  }

  const handleDrop = (rowId: string, e: React.DragEvent) => {
    e.preventDefault()
    if (!draggedBacklogItem || !containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const scrollLeft = containerRef.current.scrollLeft
    const x = e.clientX - rect.left + scrollLeft - 150

    const units = Math.floor(x / pixelsPerUnit)
    let dropDate: Date

    switch (viewMode) {
      case 'day':
        dropDate = addDays(baseDate, units)
        break
      case 'week': {
        // Week markers start from beginning of week containing baseDate
        const weekStart = startOfWeek(baseDate, { weekStartsOn: 0 })
        dropDate = addDays(weekStart, units * 7)
        break
      }
      case 'month':
        dropDate = new Date(baseDate.getFullYear(), baseDate.getMonth() + units, 1)
        break
    }

    const endDate = addDays(dropDate, 7)

    onUpdateItem(draggedBacklogItem.id, {
      rowId,
      startDate: format(dropDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd')
    })

    onBacklogItemDrop?.()
  }

  const handleDragOver = (e: React.DragEvent) => {
    if (draggedBacklogItem) {
      e.preventDefault()
    }
  }

  // Filter out backlog items (items without dates)
  const scheduledItems = timeline.items.filter(item => item.startDate !== null)

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-900">
      <div
        ref={containerRef}
        className="flex-1 overflow-auto overscroll-x-contain"
        onWheel={handleWheel}
      >
        <div style={{ width: totalWidth + 150 }} className="min-h-full">
          {/* Time markers header */}
          <div className="sticky top-0 z-20 flex bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="w-[150px] flex-shrink-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-2 font-medium text-sm text-gray-600 dark:text-gray-300">
              Rows
            </div>
            <div className="flex">
              {markers.map((date, i) => (
                <div
                  key={i}
                  style={{ width: pixelsPerUnit }}
                  className="flex-shrink-0 p-2 text-xs text-gray-500 dark:text-gray-400 border-r border-gray-100 dark:border-gray-700"
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
                hasItems={scheduledItems.some(item => item.rowId === row.id)}
                onDrop={(e) => handleDrop(row.id, e)}
                onDragOver={handleDragOver}
                isDragTarget={!!draggedBacklogItem}
              />
            ))}

            {/* Items rendered at grid level for smooth cross-row dragging */}
            {scheduledItems.map((item) => {
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
          <div className="flex border-t border-gray-200 dark:border-gray-700">
            <div className="w-[150px] flex-shrink-0 p-2 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
              <button
                onClick={onAddRow}
                className="w-full py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center justify-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Row
              </button>
            </div>
            <div style={{ width: totalWidth }} className="bg-gray-50 dark:bg-gray-900" />
          </div>
        </div>
      </div>
    </div>
  )
})

export default TimelineGrid
