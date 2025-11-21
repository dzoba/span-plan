import { useState } from 'react'
import TimelineItem from './TimelineItem'
import type { TimelineRow as TimelineRowType, TimelineItem as TimelineItemType, ViewMode } from '../../types'

interface TimelineRowProps {
  row: TimelineRowType
  items: TimelineItemType[]
  rowHeight: number
  totalWidth: number
  baseDate: Date
  viewMode: ViewMode
  onUpdateRow: (rowId: string, updates: { name: string }) => void
  onDeleteRow: (rowId: string) => void
  onDoubleClick: (e: React.MouseEvent) => void
  onUpdateItem: (itemId: string, updates: Partial<TimelineItemType>) => void
  onDeleteItem: (itemId: string) => void
  onSelectItem: (item: TimelineItemType | null) => void
  selectedItemId: string | null
}

export default function TimelineRow({
  row,
  items,
  rowHeight,
  totalWidth,
  baseDate,
  viewMode,
  onUpdateRow,
  onDeleteRow,
  onDoubleClick,
  onUpdateItem,
  onDeleteItem,
  onSelectItem,
  selectedItemId
}: TimelineRowProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(row.name)

  const handleNameSubmit = () => {
    if (editValue.trim()) {
      onUpdateRow(row.id, { name: editValue.trim() })
    } else {
      setEditValue(row.name)
    }
    setIsEditing(false)
  }

  return (
    <div className="flex border-b border-gray-200 group">
      {/* Row label */}
      <div className="w-[150px] flex-shrink-0 p-2 bg-white border-r border-gray-200 flex items-center justify-between">
        {isEditing ? (
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleNameSubmit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleNameSubmit()
              if (e.key === 'Escape') {
                setEditValue(row.name)
                setIsEditing(false)
              }
            }}
            className="w-full px-1 py-0.5 text-sm border border-blue-500 rounded focus:outline-none"
            autoFocus
          />
        ) : (
          <>
            <span
              onClick={() => setIsEditing(true)}
              className="text-sm font-medium text-gray-700 cursor-pointer hover:text-blue-600 truncate"
            >
              {row.name}
            </span>
            <button
              onClick={() => onDeleteRow(row.id)}
              className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-opacity"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Timeline area */}
      <div
        style={{ width: totalWidth, height: rowHeight }}
        className="relative bg-white hover:bg-gray-50 transition-colors"
        onDoubleClick={onDoubleClick}
      >
        {items.map((item) => (
          <TimelineItem
            key={item.id}
            item={item}
            baseDate={baseDate}
            viewMode={viewMode}
            rowHeight={rowHeight}
            onUpdate={onUpdateItem}
            onDelete={onDeleteItem}
            onSelect={onSelectItem}
            isSelected={selectedItemId === item.id}
          />
        ))}
      </div>
    </div>
  )
}
