import { useEffect, useState, useCallback } from 'react'
import {
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { generateId, getDefaultRows, getRandomColor } from '../lib/utils'
import type { Timeline, TimelineItem, TimelineRow } from '../types'
import { addDays, format } from 'date-fns'

export function useTimeline(timelineId: string | undefined) {
  const [timeline, setTimeline] = useState<Timeline | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!timelineId) {
      setLoading(false)
      return
    }

    const unsubscribe = onSnapshot(
      doc(db, 'timelines', timelineId),
      (snapshot) => {
        if (snapshot.exists()) {
          setTimeline(snapshot.data() as Timeline)
        } else {
          setTimeline(null)
        }
        setLoading(false)
      },
      (err) => {
        setError(err.message)
        setLoading(false)
      }
    )

    return unsubscribe
  }, [timelineId])

  const createTimeline = useCallback(async (ownerId: string | null): Promise<string> => {
    const id = generateId()
    const newTimeline: Timeline = {
      id,
      ownerId,
      createdAt: new Date().toISOString(),
      rows: getDefaultRows(),
      items: []
    }

    await setDoc(doc(db, 'timelines', id), newTimeline)
    return id
  }, [])

  const updateTimeline = useCallback(async (updates: Partial<Timeline>) => {
    if (!timelineId) return
    await updateDoc(doc(db, 'timelines', timelineId), updates)
  }, [timelineId])

  const addItem = useCallback(async (rowId: string, startDate: Date) => {
    if (!timeline) return

    const newItem: TimelineItem = {
      id: generateId(),
      rowId,
      title: 'Untitled',
      subtitle: '',
      color: getRandomColor(),
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(addDays(startDate, 7), 'yyyy-MM-dd')
    }

    await updateTimeline({
      items: [...timeline.items, newItem]
    })
  }, [timeline, updateTimeline])

  const updateItem = useCallback(async (itemId: string, updates: Partial<TimelineItem>) => {
    if (!timeline) return

    const updatedItems = timeline.items.map(item =>
      item.id === itemId ? { ...item, ...updates } : item
    )

    await updateTimeline({ items: updatedItems })
  }, [timeline, updateTimeline])

  const deleteItem = useCallback(async (itemId: string) => {
    if (!timeline) return

    const updatedItems = timeline.items.filter(item => item.id !== itemId)
    await updateTimeline({ items: updatedItems })
  }, [timeline, updateTimeline])

  const addRow = useCallback(async () => {
    if (!timeline) return

    const newRow: TimelineRow = {
      id: generateId(),
      name: `Row ${timeline.rows.length + 1}`,
      order: timeline.rows.length
    }

    await updateTimeline({
      rows: [...timeline.rows, newRow]
    })
  }, [timeline, updateTimeline])

  const updateRow = useCallback(async (rowId: string, updates: Partial<TimelineRow>) => {
    if (!timeline) return

    const updatedRows = timeline.rows.map(row =>
      row.id === rowId ? { ...row, ...updates } : row
    )

    await updateTimeline({ rows: updatedRows })
  }, [timeline, updateTimeline])

  const deleteRow = useCallback(async (rowId: string) => {
    if (!timeline) return

    const updatedRows = timeline.rows.filter(row => row.id !== rowId)
    const updatedItems = timeline.items.filter(item => item.rowId !== rowId)

    await updateTimeline({
      rows: updatedRows,
      items: updatedItems
    })
  }, [timeline, updateTimeline])

  return {
    timeline,
    loading,
    error,
    createTimeline,
    addItem,
    updateItem,
    deleteItem,
    addRow,
    updateRow,
    deleteRow
  }
}

export function useUserTimelines(userId: string | null) {
  const [timelines, setTimelines] = useState<Timeline[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setTimelines([])
      setLoading(false)
      return
    }

    const fetchTimelines = async () => {
      const q = query(
        collection(db, 'timelines'),
        where('ownerId', '==', userId)
      )
      const snapshot = await getDocs(q)
      const results = snapshot.docs.map(doc => doc.data() as Timeline)
      setTimelines(results)
      setLoading(false)
    }

    fetchTimelines()
  }, [userId])

  return { timelines, loading }
}
