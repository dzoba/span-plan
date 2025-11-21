import { useState, useRef, useEffect } from 'react'
import { parseISO, differenceInDays, addDays, format, startOfWeek, startOfMonth, differenceInMonths } from 'date-fns'
import type { TimelineItem as TimelineItemType, ViewMode } from '../../types'

interface TimelineItemProps {
  item: TimelineItemType
  baseDate: Date
  viewMode: ViewMode
  pixelsPerUnit: number
  rowHeight: number
  rowIndex: number
  rowTop: number
  onUpdate: (itemId: string, updates: Partial<TimelineItemType>) => void
  onDelete: (itemId: string) => void
  onSelect: (item: TimelineItemType | null) => void
  isSelected: boolean
  allRowIds: string[]
}

export default function TimelineItem({
  item,
  baseDate,
  viewMode,
  pixelsPerUnit,
  rowHeight,
  rowIndex,
  rowTop,
  onUpdate,
  onDelete: _onDelete,
  onSelect,
  isSelected,
  allRowIds
}: TimelineItemProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [titleValue, setTitleValue] = useState(item.title)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState<'left' | 'right' | null>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const [hasDragged, setHasDragged] = useState(false)
  const itemRef = useRef<HTMLDivElement>(null)
  const dragStartRef = useRef({ x: 0, y: 0, startDate: '', endDate: '', rowIndex: 0 })

  // Parse dates safely (may be null for backlog items)
  const startDate = item.startDate ? parseISO(item.startDate) : null
  const endDate = item.endDate ? parseISO(item.endDate) : null

  const getPosition = () => {
    if (!startDate) return 0
    switch (viewMode) {
      case 'day':
        return differenceInDays(startDate, baseDate) * pixelsPerUnit
      case 'week': {
        // Calculate position relative to start of week containing baseDate
        const weekStart = startOfWeek(baseDate, { weekStartsOn: 0 })
        const daysDiff = differenceInDays(startDate, weekStart)
        return (daysDiff / 7) * pixelsPerUnit
      }
      case 'month': {
        // Calculate position relative to start of month containing baseDate
        const monthStart = startOfMonth(baseDate)
        const monthsDiff = differenceInMonths(startDate, monthStart)
        const dayOfMonth = startDate.getDate() - 1
        const daysInMonth = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0).getDate()
        return (monthsDiff + dayOfMonth / daysInMonth) * pixelsPerUnit
      }
    }
  }

  const getWidth = () => {
    if (!startDate || !endDate) return 0
    const duration = differenceInDays(endDate, startDate)
    switch (viewMode) {
      case 'day':
        return Math.max(duration * pixelsPerUnit, 30)
      case 'week':
        return Math.max((duration / 7) * pixelsPerUnit, 30)
      case 'month':
        return Math.max((duration / 30) * pixelsPerUnit, 30)
    }
  }

  const position = getPosition()
  const width = getWidth()

  const handleMouseDown = (e: React.MouseEvent, type: 'drag' | 'resize-left' | 'resize-right') => {
    e.stopPropagation()
    e.preventDefault()

    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startDate: item.startDate!,
      endDate: item.endDate!,
      rowIndex: rowIndex
    }

    setHasDragged(false)

    if (type === 'drag') {
      setIsDragging(true)
    } else if (type === 'resize-left') {
      setIsResizing('left')
    } else {
      setIsResizing('right')
    }
  }

  useEffect(() => {
    if (!isDragging && !isResizing) return

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragStartRef.current.x
      const deltaY = e.clientY - dragStartRef.current.y

      // Mark as dragged if moved more than 3 pixels
      if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
        setHasDragged(true)
      }

      let deltaDays: number

      switch (viewMode) {
        case 'day':
          deltaDays = Math.round(deltaX / pixelsPerUnit)
          break
        case 'week':
          deltaDays = Math.round((deltaX / pixelsPerUnit) * 7)
          break
        case 'month':
          deltaDays = Math.round((deltaX / pixelsPerUnit) * 30)
          break
      }

      const originalStart = parseISO(dragStartRef.current.startDate)
      const originalEnd = parseISO(dragStartRef.current.endDate)

      if (isDragging) {
        const newStart = addDays(originalStart, deltaDays)
        const newEnd = addDays(originalEnd, deltaDays)

        // Calculate row change based on Y movement
        const deltaY = e.clientY - dragStartRef.current.y
        const rowDelta = Math.round(deltaY / rowHeight)
        const newRowIndex = Math.max(0, Math.min(allRowIds.length - 1, dragStartRef.current.rowIndex + rowDelta))
        const newRowId = allRowIds[newRowIndex]

        onUpdate(item.id, {
          startDate: format(newStart, 'yyyy-MM-dd'),
          endDate: format(newEnd, 'yyyy-MM-dd'),
          rowId: newRowId
        })
      } else if (isResizing === 'left') {
        const newStart = addDays(originalStart, deltaDays)
        if (newStart < originalEnd) {
          onUpdate(item.id, {
            startDate: format(newStart, 'yyyy-MM-dd')
          })
        }
      } else if (isResizing === 'right') {
        const newEnd = addDays(originalEnd, deltaDays)
        if (newEnd > originalStart) {
          onUpdate(item.id, {
            endDate: format(newEnd, 'yyyy-MM-dd')
          })
        }
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      setIsResizing(null)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, isResizing, item.id, onUpdate, pixelsPerUnit, viewMode, rowHeight, allRowIds])

  // Guard against null dates (shouldn't happen for scheduled items, but TypeScript needs this)
  // This must come after all hooks to satisfy rules-of-hooks
  if (!item.startDate || !item.endDate) return null

  const handleTitleSubmit = () => {
    onUpdate(item.id, { title: titleValue || 'Untitled' })
    setIsEditingTitle(false)
  }

  return (
    <div
      ref={itemRef}
      style={{
        position: 'absolute',
        left: position + 150, // Add row label width offset
        width: width,
        top: rowTop + 4,
        height: rowHeight - 8,
        backgroundColor: item.color,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      className={`rounded-md shadow-sm flex items-center px-2 group ${
        isSelected ? 'ring-2 ring-blue-500 ring-offset-1 dark:ring-offset-gray-800' : ''
      }`}
      onClick={(e) => {
        e.stopPropagation()
        if (!hasDragged) {
          onSelect(item)
        }
      }}
      onDoubleClick={(e) => {
        e.stopPropagation()
      }}
      onMouseDown={(e) => handleMouseDown(e, 'drag')}
      onMouseEnter={(e) => {
        setIsHovered(true)
        setTooltipPosition({ x: e.clientX, y: e.clientY })
      }}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={(e) => {
        if (isHovered) {
          setTooltipPosition({ x: e.clientX, y: e.clientY })
        }
      }}
    >
      {/* Tooltip */}
      {isHovered && !isDragging && !isResizing && width < 100 && (
        <div
          style={{
            position: 'fixed',
            left: tooltipPosition.x + 10,
            top: tooltipPosition.y - 30,
            zIndex: 1000
          }}
          className="bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg pointer-events-none whitespace-nowrap"
        >
          <div className="font-medium">{item.title}</div>
          {item.subtitle && <div className="text-gray-300">{item.subtitle}</div>}
        </div>
      )}
      {/* Left resize handle */}
      <div
        className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-black/10 rounded-l-md"
        onMouseDown={(e) => handleMouseDown(e, 'resize-left')}
      />

      {/* Content */}
      <div className="flex-1 min-w-0 px-1 flex flex-col justify-center">
        {isEditingTitle ? (
          <input
            type="text"
            value={titleValue}
            onChange={(e) => setTitleValue(e.target.value)}
            onBlur={handleTitleSubmit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleTitleSubmit()
              if (e.key === 'Escape') {
                setTitleValue(item.title)
                setIsEditingTitle(false)
              }
            }}
            className="w-full bg-white/90 px-1 py-0.5 text-sm rounded focus:outline-none"
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <>
            <span
              className="text-sm font-semibold text-white truncate block cursor-text leading-tight"
              onClick={(e) => {
                e.stopPropagation()
                setTitleValue(item.title)
                setIsEditingTitle(true)
              }}
            >
              {item.title}
            </span>
            {item.subtitle && (
              <span className="text-xs text-white/70 truncate block leading-tight">
                {item.subtitle}
              </span>
            )}
          </>
        )}
      </div>

      {/* Details button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onSelect(item)
        }}
        className="opacity-0 group-hover:opacity-100 p-0.5 text-white/80 hover:text-white transition-opacity"
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>

      {/* Right resize handle */}
      <div
        className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-black/10 rounded-r-md"
        onMouseDown={(e) => handleMouseDown(e, 'resize-right')}
      />
    </div>
  )
}
