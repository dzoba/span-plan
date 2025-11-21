import { useState, useEffect } from 'react'
import type { TimelineItem } from '../../types'
import { DEFAULT_COLORS, formatDate } from '../../lib/utils'

interface DetailPanelProps {
  item: TimelineItem
  onUpdate: (itemId: string, updates: Partial<TimelineItem>) => void
  onDelete: (itemId: string) => void
  onClose: () => void
}

export default function DetailPanel({ item, onUpdate, onDelete, onClose }: DetailPanelProps) {
  const [title, setTitle] = useState(item.title)
  const [subtitle, setSubtitle] = useState(item.subtitle)
  const [color, setColor] = useState(item.color)
  const [startDate, setStartDate] = useState(item.startDate)
  const [endDate, setEndDate] = useState(item.endDate)

  useEffect(() => {
    setTitle(item.title)
    setSubtitle(item.subtitle)
    setColor(item.color)
    setStartDate(item.startDate)
    setEndDate(item.endDate)
  }, [item])

  const handleSave = () => {
    onUpdate(item.id, {
      title: title || 'Untitled',
      subtitle,
      color,
      startDate,
      endDate
    })
  }

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">Item Details</h3>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gray-600"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleSave}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter title..."
          />
        </div>

        {/* Subtitle */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Subtitle
          </label>
          <input
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            onBlur={handleSave}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter subtitle..."
          />
        </div>

        {/* Color */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Color
          </label>
          <div className="flex flex-wrap gap-2">
            {DEFAULT_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => {
                  setColor(c)
                  onUpdate(item.id, { color: c })
                }}
                style={{ backgroundColor: c }}
                className={`w-8 h-8 rounded-full ${
                  color === c ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                }`}
              />
            ))}
          </div>
        </div>

        {/* Dates */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value)
              if (e.target.value <= endDate) {
                onUpdate(item.id, { startDate: e.target.value })
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value)
              if (e.target.value >= startDate) {
                onUpdate(item.id, { endDate: e.target.value })
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Duration display */}
        <div className="text-sm text-gray-500">
          Duration: {formatDate(startDate, 'MMM d')} - {formatDate(endDate, 'MMM d, yyyy')}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={() => {
            onDelete(item.id)
            onClose()
          }}
          className="w-full py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
        >
          Delete Item
        </button>
      </div>
    </div>
  )
}
