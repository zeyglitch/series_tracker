import { comickService } from './comickService'
import { notificationService } from './notificationService'

const STORAGE_KEY = 'manwha_tracker_watch_state'

const loadState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch (error) {
    console.error('Erreur chargement watch state:', error)
    return {}
  }
}

const saveState = (state) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (error) {
    console.error('Erreur sauvegarde watch state:', error)
  }
}

export const chapterWatchService = {
  async checkSeries(series) {
    if (!comickService.isConfigured() || !series?.id) {
      return null
    }

    const chapters = await comickService.getLatestChapters(series.id)
    const state = loadState()
    const previousCount = state[series.id]?.lastChapterCount || 0
    const currentCount = chapters.length

    state[series.id] = {
      lastChapterCount: currentCount,
      lastCheckedAt: new Date().toISOString()
    }
    saveState(state)

    if (currentCount > previousCount && notificationService.getPermission() === 'granted') {
      await notificationService.sendTestNotification(
        series.name || 'Nouvelle série',
        `${currentCount - previousCount} nouveau(x) chapitre(s) disponible(s)`
      )
    }

    return {
      previousCount,
      currentCount,
      newChapters: chapters.slice(0, Math.max(0, currentCount - previousCount))
    }
  },

  async checkAll(seriesList = []) {
    const results = []

    for (const series of seriesList) {
      const result = await this.checkSeries(series)
      if (result) {
        results.push({ seriesId: series.id, ...result })
      }
    }

    return results
  }
}
