import { useState } from 'react'
import type { TimelineRow as TimelineRowType } from '../../types'

interface TimelineRowProps {
  row: TimelineRowType
  rowHeight: number
  totalWidth: number
  onUpdateRow: (rowId: string, updates: { name: string }) => void
  onDeleteRow: (rowId: string) => void
  onDoubleClick: (e: React.MouseEvent) => void
  hasItems: boolean
  onDrop?: (e: React.DragEvent) => void
  onDragOver?: (e: React.DragEvent) => void
  isDragTarget?: boolean
}

export default function TimelineRow({
  row,
  rowHeight,
  totalWidth,
  onUpdateRow,
  onDeleteRow,
  onDoubleClick,
  hasItems,
  onDrop,
  onDragOver,
  isDragTarget
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
    <div className="flex border-b border-gray-200 dark:border-gray-700 group">
      {/* Row label */}
      <div className="w-[150px] flex-shrink-0 p-2 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex items-center justify-between">
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
            className="w-full px-1 py-0.5 text-sm border border-blue-500 rounded focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            autoFocus
          />
        ) : (
          <>
            <span
              onClick={() => setIsEditing(true)}
              className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 truncate"
            >
              {row.name}
            </span>
            <button
              onClick={() => onDeleteRow(row.id)}
              className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-opacity"
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
        className={`relative bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer ${
          isDragTarget ? 'ring-2 ring-inset ring-blue-300 dark:ring-blue-600' : ''
        }`}
        onDoubleClick={onDoubleClick}
        onDrop={onDrop}
        onDragOver={onDragOver}
        title="Double-click to add item"
      >
        {!hasItems && (
          <div className="absolute inset-0 flex items-center pointer-events-none pl-4">
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-sm text-gray-400 dark:text-gray-500">
                {isDragTarget ? 'Drop here to schedule' : 'Double-click to add item'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
