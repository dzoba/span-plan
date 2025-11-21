import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useTimeline } from '../hooks/useTimeline'
import { useTheme } from '../hooks/useTheme'

export default function HomePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { createTimeline } = useTimeline(undefined)
  const { theme, toggleTheme } = useTheme()
  const [isCreating, setIsCreating] = useState(false)

  const handleCreate = async () => {
    setIsCreating(true)
    try {
      const id = await createTimeline(user?.uid || null)
      navigate(`/timeline/${id}`)
    } catch (error) {
      console.error('Failed to create timeline:', error)
      setIsCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">SpanPlan</h1>
          <nav className="flex items-center gap-4">
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
            {user ? (
              <Link
                to="/account"
                className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
              >
                My Plans
              </Link>
            ) : (
              <Link
                to="/account"
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Sign in
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Collaborative Timeline Planning
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto">
            Create beautiful timelines for projects, events, or roadmaps.
            Share with anyone using a simple link. No account required.
          </p>
          <button
            onClick={handleCreate}
            disabled={isCreating}
            className="px-8 py-4 bg-blue-600 text-white text-lg font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isCreating ? 'Creating...' : 'Create New Timeline'}
          </button>
        </div>

        {/* Features */}
        <div className="max-w-5xl mx-auto mt-24 grid md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Drag & Drop
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Easily move and resize items on your timeline. Click to edit titles instantly.
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Real-time Collaboration
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Share a link and collaborate in real-time. Everyone sees changes instantly.
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Multiple Views
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Switch between day, week, and month views. Perfect for any planning scale.
            </p>
          </div>
        </div>

        {/* How it works */}
        <div className="max-w-3xl mx-auto mt-24">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-10">
            How it works
          </h3>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-medium">
                1
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Create a timeline</h4>
                <p className="text-gray-600 dark:text-gray-400">Click the button above to create a new timeline. No sign-up required.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-medium">
                2
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Add items to rows</h4>
                <p className="text-gray-600 dark:text-gray-400">Double-click on any row to add an item. Drag to move, resize edges to adjust duration.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-medium">
                3
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Share the link</h4>
                <p className="text-gray-600 dark:text-gray-400">Copy the URL and share it with your team. They can view and edit in real-time.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-8 mt-20 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto text-center text-sm text-gray-500 dark:text-gray-400">
          SpanPlan - Simple collaborative timeline planning
        </div>
      </footer>
    </div>
  )
}
