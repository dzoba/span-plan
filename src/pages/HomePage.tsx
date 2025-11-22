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
      <main className="px-6 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Timeline Planning That Just Works
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-4 max-w-2xl mx-auto">
            No accounts. No invites. No waiting.
          </p>
          <p className="text-lg text-gray-500 dark:text-gray-400 mb-10 max-w-2xl mx-auto">
            Create a timeline, share the URL, and start collaborating instantly.
            Changes sync in real-time for everyone.
          </p>
          <button
            onClick={handleCreate}
            disabled={isCreating}
            className="px-8 py-4 bg-blue-600 text-white text-lg font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-lg hover:shadow-xl"
          >
            {isCreating ? 'Creating...' : 'Create Timeline - It\'s Free'}
          </button>
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            No sign-up required. Your timeline is ready in seconds.
          </p>
        </div>

        {/* Core Features */}
        <div className="max-w-5xl mx-auto mt-24 grid md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Instant Collaboration
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Share a link and your team can edit immediately. No accounts, invites, or setup required.
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Drag & Drop Everything
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Move items across rows, resize durations, and organize your timeline with intuitive controls.
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Backlog Management
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Keep unscheduled items in a backlog. Drag them onto the timeline when you're ready to commit.
            </p>
          </div>
        </div>

      </main>

        {/* Keyboard Shortcuts - White background */}
        <section className="bg-white dark:bg-gray-800 py-20 px-6">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-4">
              Built for Power Users
            </h3>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
              Keyboard shortcuts for everything you need
            </p>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-200 dark:divide-gray-700">
                <div className="p-6 text-center">
                  <div className="flex items-center justify-center gap-1 mb-3">
                    <kbd className="px-2 py-1 text-sm font-sans bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded">
                      {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}
                    </kbd>
                    <kbd className="px-2 py-1 text-sm font-sans bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded">
                      K
                    </kbd>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Search & jump to any item</p>
                </div>
                <div className="p-6 text-center">
                  <div className="flex items-center justify-center gap-1 mb-3">
                    <kbd className="px-2 py-1 text-sm font-sans bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded">
                      {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}
                    </kbd>
                    <kbd className="px-2 py-1 text-sm font-sans bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded">
                      B
                    </kbd>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Toggle backlog panel</p>
                </div>
                <div className="p-6 text-center">
                  <div className="flex items-center justify-center gap-1 mb-3">
                    <kbd className="px-2 py-1 text-sm font-sans bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded">
                      Esc
                    </kbd>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Close panels</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases - Light gray background */}
        <section className="bg-gray-50 dark:bg-gray-900 py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-10">
              Perfect For
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Project Roadmaps</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Plan sprints, milestones, and deliverables. Keep your team aligned on what's coming next.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Event Planning</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Coordinate schedules, track deadlines, and manage multiple workstreams for launches and events.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Team Coordination</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Visualize who's working on what and when. Spot conflicts and dependencies at a glance.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Quick Brainstorms</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Sketch out ideas with your team in real-time. No setup means you can start planning immediately.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How it works - White background */}
        <section className="bg-white dark:bg-gray-800 py-20 px-6">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-10">
              Get Started in Seconds
            </h3>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-medium">
                  1
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Create a timeline</h4>
                  <p className="text-gray-600 dark:text-gray-400">Click the button above. Your timeline is ready instantly.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-medium">
                  2
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Add your items</h4>
                  <p className="text-gray-600 dark:text-gray-400">Double-click to add items. Drag to move them. Resize edges to adjust duration.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-medium">
                  3
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Share the link</h4>
                  <p className="text-gray-600 dark:text-gray-400">Copy the URL. Anyone with the link can view and edit in real-time.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA - Blue background */}
        <section className="bg-blue-600 dark:bg-blue-700 py-20 px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-2xl font-bold text-white mb-4">
              Ready to plan?
            </h3>
            <p className="text-blue-100 mb-6">
              Create your first timeline and see why teams love SpanPlan.
            </p>
            <button
              onClick={handleCreate}
              disabled={isCreating}
              className="px-8 py-4 bg-white text-blue-600 text-lg font-medium rounded-lg hover:bg-gray-100 disabled:opacity-50 transition-colors shadow-lg hover:shadow-xl"
            >
              {isCreating ? 'Creating...' : 'Create Timeline'}
            </button>
            <p className="mt-4 text-sm text-blue-200">
              100% free. No sign-up required.
            </p>
          </div>
        </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto text-center text-sm text-gray-500 dark:text-gray-400">
          <p>SpanPlan - Collaborative timeline planning that just works</p>
          <p className="mt-2">
            <a href="https://span-plan.com" className="hover:text-gray-700 dark:hover:text-gray-300">span-plan.com</a>
          </p>
        </div>
      </footer>
    </div>
  )
}
