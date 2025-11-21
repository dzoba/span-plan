import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTimeline } from '../hooks/useTimeline'
import { useAuth } from '../hooks/useAuth'
import TimelineGrid from '../components/timeline/TimelineGrid'
import DetailPanel from '../components/timeline/DetailPanel'
import type { TimelineItem, ViewMode } from '../types'

export default function TimelinePage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const {
    timeline,
    loading,
    error,
    addItem,
    updateItem,
    deleteItem,
    addRow,
    updateRow,
    deleteRow
  } = useTimeline(id)

  const [viewMode, setViewMode] = useState<ViewMode>('week')
  const [selectedItem, setSelectedItem] = useState<TimelineItem | null>(null)
  const [copied, setCopied] = useState(false)

  const handleCopyUrl = async () => {
    await navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading timeline...</div>
      </div>
    )
  }

  if (error || !timeline) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Timeline not found</h2>
          <p className="text-gray-500 mb-4">This timeline may have been deleted or doesn't exist.</p>
          <Link to="/" className="text-blue-600 hover:text-blue-700">
            Go back home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-xl font-bold text-gray-900">
              SpanPlan
            </Link>
            <span className="text-gray-300">|</span>
            <button
              onClick={handleCopyUrl}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
            >
              {copied ? (
                <>
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy Link
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-4">
            {/* View mode toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              {(['day', 'week', 'month'] as ViewMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    viewMode === mode
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>

            {/* User menu */}
            {user ? (
              <Link
                to="/account"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                {user.email}
              </Link>
            ) : (
              <Link
                to="/account"
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        <TimelineGrid
          timeline={timeline}
          viewMode={viewMode}
          onAddItem={addItem}
          onUpdateItem={updateItem}
          onDeleteItem={deleteItem}
          onUpdateRow={updateRow}
          onAddRow={addRow}
          onDeleteRow={deleteRow}
          onSelectItem={setSelectedItem}
          selectedItemId={selectedItem?.id || null}
        />

        {/* Detail panel */}
        {selectedItem && (
          <DetailPanel
            item={selectedItem}
            onUpdate={updateItem}
            onDelete={deleteItem}
            onClose={() => setSelectedItem(null)}
          />
        )}
      </div>
    </div>
  )
}
