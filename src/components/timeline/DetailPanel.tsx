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
    <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white">Item Details</h3>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
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
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleSave}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Enter title..."
          />
        </div>

        {/* Subtitle */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Subtitle
          </label>
          <input
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            onBlur={handleSave}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Enter subtitle..."
          />
        </div>

        {/* Color */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                  color === c ? 'ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-gray-800' : ''
                }`}
              />
            ))}
          </div>
        </div>

        {/* Dates - only show for scheduled items */}
        {startDate && endDate ? (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Duration display */}
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Duration: {formatDate(startDate, 'MMM d')} - {formatDate(endDate, 'MMM d, yyyy')}
            </div>

            {/* Move to backlog button */}
            <button
              onClick={() => {
                onUpdate(item.id, {
                  rowId: null,
                  startDate: null,
                  endDate: null
                })
              }}
              className="w-full py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Move to Backlog
            </button>
          </>
        ) : (
          <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
            This item is in the backlog. Drag it to the timeline to schedule it.
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => {
            onDelete(item.id)
            onClose()
          }}
          className="w-full py-2 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors"
        >
          Delete Item
        </button>
      </div>
    </div>
  )
}
