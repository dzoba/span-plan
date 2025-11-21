import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import { useTimeline } from '../hooks/useTimeline'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'
import TimelineGrid, { TimelineGridHandle } from '../components/timeline/TimelineGrid'
import DetailPanel from '../components/timeline/DetailPanel'
import BacklogPanel from '../components/timeline/BacklogPanel'
import CommandPalette from '../components/timeline/CommandPalette'
import type { TimelineItem, ViewMode } from '../types'

export default function TimelinePage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [searchParams, setSearchParams] = useSearchParams()
  const {
    timeline,
    loading,
    error,
    addItem,
    addBacklogItem,
    updateItem,
    deleteItem,
    addRow,
    updateRow,
    deleteRow
  } = useTimeline(id)

  const isBacklogOpen = searchParams.get('backlog') === 'open'

  const toggleBacklog = useCallback(() => {
    const newParams = new URLSearchParams(searchParams)
    if (isBacklogOpen) {
      newParams.delete('backlog')
    } else {
      newParams.set('backlog', 'open')
    }
    setSearchParams(newParams)
  }, [isBacklogOpen, searchParams, setSearchParams])

  const backlogItems = timeline?.items.filter(item => item.startDate === null) || []

  const [draggedBacklogItem, setDraggedBacklogItem] = useState<TimelineItem | null>(null)

  const handleBacklogDragStart = (item: TimelineItem, e: React.DragEvent) => {
    setDraggedBacklogItem(item)
    e.dataTransfer.effectAllowed = 'move'
  }

  const [viewMode, setViewMode] = useState<ViewMode>('week')
  const [selectedItem, setSelectedItem] = useState<TimelineItem | null>(null)
  const [copied, setCopied] = useState(false)
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)
  const timelineGridRef = useRef<TimelineGridHandle>(null)

  const handleCommandPaletteSelect = (item: TimelineItem) => {
    setSelectedItem(item)
    // Scroll to item if it's scheduled (has dates)
    if (item.startDate) {
      timelineGridRef.current?.scrollToItem(item.id)
    }
  }

  const handleCopyUrl = async () => {
    await navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + B to toggle backlog (works even in inputs)
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault()
        toggleBacklog()
        return
      }

      // Cmd/Ctrl + K to open command palette (works even in inputs)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsCommandPaletteOpen(true)
        return
      }

      // Don't handle other shortcuts when typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        // Still allow Escape to work in inputs
        if (e.key === 'Escape') {
          (e.target as HTMLElement).blur()
        }
        return
      }

      if (e.key === 'Escape') {
        if (selectedItem) {
          setSelectedItem(null)
        } else if (isBacklogOpen) {
          toggleBacklog()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [selectedItem, isBacklogOpen, toggleBacklog])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-gray-500 dark:text-gray-400">Loading timeline...</div>
      </div>
    )
  }

  if (error || !timeline) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Timeline not found</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4">This timeline may have been deleted or doesn't exist.</p>
          <Link to="/" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
            Go back home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-xl font-bold text-gray-900 dark:text-white">
              SpanPlan
            </Link>
            <span className="text-gray-300 dark:text-gray-600">|</span>
            <button
              onClick={handleCopyUrl}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
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
            {/* Backlog toggle */}
            <button
              onClick={toggleBacklog}
              className={`flex items-center gap-1.5 px-3 py-1 text-sm rounded-md transition-colors ${
                isBacklogOpen
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Backlog
              {backlogItems.length > 0 && (
                <span className="px-1.5 py-0.5 text-xs bg-gray-200 dark:bg-gray-600 rounded-full">
                  {backlogItems.length}
                </span>
              )}
              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-xs font-sans bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded">
                {navigator.platform.includes('Mac') ? (
                  <span className="text-xs">⌘</span>
                ) : (
                  <span>Ctrl</span>
                )}
                <span>B</span>
              </kbd>
            </button>

            {/* View mode toggle */}
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              {(['day', 'week', 'month'] as ViewMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    viewMode === mode
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </button>

            {/* User menu */}
            {user ? (
              <Link
                to="/account"
                className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {user.email}
              </Link>
            ) : (
              <Link
                to="/account"
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Backlog panel */}
        {isBacklogOpen && (
          <BacklogPanel
            items={backlogItems}
            onAddItem={addBacklogItem}
            onSelectItem={setSelectedItem}
            onDragStart={handleBacklogDragStart}
            selectedItemId={selectedItem?.id || null}
          />
        )}

        <TimelineGrid
          ref={timelineGridRef}
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
          draggedBacklogItem={draggedBacklogItem}
          onBacklogItemDrop={() => setDraggedBacklogItem(null)}
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

      {/* Command palette */}
      <CommandPalette
        items={timeline.items}
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectItem={handleCommandPaletteSelect}
      />
    </div>
  )
}
