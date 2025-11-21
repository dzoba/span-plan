import { useRef, useState } from 'react'
import type { TimelineItem } from '../../types'

interface BacklogPanelProps {
  items: TimelineItem[]
  onAddItem: (title: string) => void
  onSelectItem: (item: TimelineItem) => void
  onDragStart: (item: TimelineItem, e: React.DragEvent) => void
  selectedItemId: string | null
}

export default function BacklogPanel({
  items,
  onAddItem,
  onSelectItem,
  onDragStart,
  selectedItemId
}: BacklogPanelProps) {
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim()) {
      onAddItem(inputValue.trim())
      setInputValue('')
      // Keep focus on input for rapid entry
      inputRef.current?.focus()
    }
  }

  return (
    <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
      {/* Header with input */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">Backlog</h3>
        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Add item and press Enter"
            className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            autoFocus
          />
        </form>
      </div>

      {/* Items list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {items.length === 0 ? (
          <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
            No unscheduled items
          </div>
        ) : (
          items.map((item) => (
            <BacklogItem
              key={item.id}
              item={item}
              onSelect={() => onSelectItem(item)}
              onDragStart={(e) => onDragStart(item, e)}
              isSelected={item.id === selectedItemId}
            />
          ))
        )}
      </div>
    </div>
  )
}

interface BacklogItemProps {
  item: TimelineItem
  onSelect: () => void
  onDragStart: (e: React.DragEvent) => void
  isSelected: boolean
}

function BacklogItem({ item, onSelect, onDragStart, isSelected }: BacklogItemProps) {
  const itemRef = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={itemRef}
      draggable
      onDragStart={onDragStart}
      onClick={onSelect}
      style={{ backgroundColor: item.color }}
      className={`p-2 rounded-md cursor-grab active:cursor-grabbing shadow-sm ${
        isSelected ? 'ring-2 ring-blue-500 ring-offset-1 dark:ring-offset-gray-800' : ''
      }`}
    >
      <div className="text-sm font-semibold text-white truncate">
        {item.title}
      </div>
      {item.subtitle && (
        <div className="text-xs text-white/70 truncate">
          {item.subtitle}
        </div>
      )}
    </div>
  )
}
