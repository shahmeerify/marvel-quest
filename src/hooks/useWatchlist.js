import { useCallback } from 'react'
import { useApp } from '../context/AppContext'
import { MCU_TITLES } from '../data/mcu'
import { useAchievements } from './useAchievements'
import { useStreak } from './useStreak'

export function useWatchlist() {
  const { progress, watchedSet, updateTitle, addToast } = useApp()
  const { checkAll } = useAchievements()
  const { recordWatch } = useStreak()

  const toggleWatched = useCallback(async (titleId) => {
    const current = progress[titleId]?.watched ?? false
    const nowWatched = !current
    const now = new Date().toISOString()

    await updateTitle(titleId, {
      watched:   nowWatched,
      watchedAt: nowWatched ? now : null,
    })

    const title = MCU_TITLES.find((t) => t.id === titleId)
    if (nowWatched) {
      addToast({ type: 'success', message: `✓ ${title?.title ?? titleId} marked as watched` })
      recordWatch()
      // Defer achievement check so state has settled
      setTimeout(() => checkAll(), 100)
    } else {
      addToast({ type: 'info', message: `↺ ${title?.title ?? titleId} unmarked` })
    }
  }, [progress, updateTitle, addToast, checkAll, recordWatch])

  const saveRating = useCallback(async (titleId, rating) => {
    await updateTitle(titleId, { rating })
    setTimeout(() => checkAll(), 50)
  }, [updateTitle, checkAll])

  const saveNote = useCallback(async (titleId, note) => {
    await updateTitle(titleId, { note })
  }, [updateTitle])

  const markAllWatched = useCallback(async (titleIds, watched) => {
    const now = new Date().toISOString()
    for (const id of titleIds) {
      await updateTitle(id, {
        watched,
        watchedAt: watched ? now : null,
      })
    }
    addToast({ type: 'success', message: `✓ ${titleIds.length} titles ${watched ? 'marked watched' : 'unmarked'}` })
    if (watched) {
      recordWatch()
      setTimeout(() => checkAll(), 100)
    }
  }, [updateTitle, addToast, checkAll, recordWatch])

  // Build a filtered + sorted list from MCU_TITLES
  const getFilteredList = useCallback(({ filter = 'all', sort = 'chronological', search = '' } = {}) => {
    let list = [...MCU_TITLES]

    // Filter
    if (filter === 'movies')      list = list.filter((t) => t.type === 'movie')
    else if (filter === 'series') list = list.filter((t) => t.type === 'series')
    else if (filter === 'essentials') list = list.filter((t) => t.isEssential)
    else if (filter === 'spider-man') list = list.filter((t) => t.isSpiderManPath)
    else if (filter === 'watched')   list = list.filter((t) => watchedSet.has(t.id))
    else if (filter === 'unwatched') list = list.filter((t) => !watchedSet.has(t.id))

    // Search
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((t) =>
        t.title.toLowerCase().includes(q) ||
        t.characters.some((c) => c.toLowerCase().includes(q)) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q))
      )
    }

    // Sort
    if (sort === 'runtime-asc')  list.sort((a, b) => a.runtime - b.runtime)
    else if (sort === 'runtime-desc') list.sort((a, b) => b.runtime - a.runtime)
    else if (sort === 'title')   list.sort((a, b) => a.title.localeCompare(b.title))
    else if (sort === 'phase')   list.sort((a, b) => a.phase - b.phase || a.number - b.number)
    else                         list.sort((a, b) => a.number - b.number)

    return list
  }, [watchedSet])

  return { toggleWatched, saveRating, saveNote, markAllWatched, getFilteredList }
}
