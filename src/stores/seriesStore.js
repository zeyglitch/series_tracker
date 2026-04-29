import { defineStore } from 'pinia'
import { ref } from 'vue'
import { firebaseService } from '../services/firebaseService'

export const useSeriesStore = defineStore('series', () => {
  const seriesData = ref({
    manwha: [],
    manga: [],
    anime: [],
    novel: []
  })

  const isLoading = ref(false)
  const error = ref(null)

  const saveToLocalStorage = () => {
    try {
      localStorage.setItem('manwha_tracker_data', JSON.stringify(seriesData.value))
    } catch (e) {
      console.error('Erreur localStorage:', e)
    }
  }

  const loadFromLocalStorage = () => {
    try {
      const stored = localStorage.getItem('manwha_tracker_data') || localStorage.getItem('seriesTrackerData')
      if (stored) {
        seriesData.value = JSON.parse(stored)
        localStorage.setItem('manwha_tracker_data', JSON.stringify(seriesData.value))
      }
    } catch (e) {
      console.error('Erreur chargement localStorage:', e)
    }
  }

  const loadFromFirebase = async () => {
    isLoading.value = true
    error.value = null
    try {
      const data = await firebaseService.loadUserData()
      if (data) {
        seriesData.value = data
      } else {
        loadFromLocalStorage()
      }
    } catch (e) {
      error.value = e.message
      console.error('Erreur chargement Firebase:', e)
      loadFromLocalStorage()
    } finally {
      isLoading.value = false
    }
  }

  const saveToFirebase = async () => {
    try {
      await firebaseService.saveUserData(seriesData.value)
    } catch (e) {
      error.value = e.message
      console.error('Erreur sauvegarde Firebase:', e)
    } finally {
      saveToLocalStorage()
    }
  }

  const addCategory = (type, categoryName) => {
    if (!seriesData.value[type]) {
      seriesData.value[type] = []
    }

    if (!seriesData.value[type].find(c => c.name === categoryName)) {
      seriesData.value[type].push({
        id: Date.now().toString(),
        name: categoryName,
        series: []
      })
      saveToFirebase()
      return true
    }

    return false
  }

  const deleteCategory = (type, categoryId) => {
    if (seriesData.value[type]) {
      seriesData.value[type] = seriesData.value[type].filter(c => c.id !== categoryId)
      saveToFirebase()
    }
  }

  const addSeries = (type, categoryId, series) => {
    if (seriesData.value[type]) {
      const category = seriesData.value[type].find(c => c.id === categoryId)
      if (category) {
        category.series.push({
          id: Date.now().toString(),
          ...series,
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
          tags: series.tags || [],
          sourceUrl: series.sourceUrl || null,
          notes: series.notes || ''
        })
        saveToFirebase()
        return true
      }
    }

    return false
  }

  const editSeries = (type, categoryId, seriesId, updates) => {
    if (seriesData.value[type]) {
      const category = seriesData.value[type].find(c => c.id === categoryId)
      if (category) {
        const series = category.series.find(s => s.id === seriesId)
        if (series) {
          Object.assign(series, {
            ...updates,
            lastUpdated: new Date().toISOString()
          })
          saveToFirebase()
          return true
        }
      }
    }

    return false
  }

  const deleteSeries = (type, categoryId, seriesId) => {
    if (seriesData.value[type]) {
      const category = seriesData.value[type].find(c => c.id === categoryId)
      if (category) {
        category.series = category.series.filter(s => s.id !== seriesId)
        saveToFirebase()
      }
    }
  }

  const getCategoriesByType = (type) => {
    return seriesData.value[type] || []
  }

  const getSeries = (type, categoryId, seriesId) => {
    if (seriesData.value[type]) {
      const category = seriesData.value[type].find(c => c.id === categoryId)
      if (category) {
        return category.series.find(s => s.id === seriesId)
      }
    }

    return null
  }

  const incrementCounter = (type, categoryId, seriesId, counterName) => {
    const series = getSeries(type, categoryId, seriesId)
    if (series) {
      series[counterName] = (series[counterName] || 0) + 1
      series.lastUpdated = new Date().toISOString()
      saveToFirebase()
    }
  }

  const decrementCounter = (type, categoryId, seriesId, counterName) => {
    const series = getSeries(type, categoryId, seriesId)
    if (series && series[counterName] > 0) {
      series[counterName]--
      series.lastUpdated = new Date().toISOString()
      saveToFirebase()
    }
  }

  const changeStatus = (type, categoryId, seriesId, newStatus) => {
    const series = getSeries(type, categoryId, seriesId)
    if (series) {
      series.status = newStatus
      series.lastUpdated = new Date().toISOString()
      saveToFirebase()
    }
  }

  const addTag = (type, categoryId, seriesId, tag) => {
    const series = getSeries(type, categoryId, seriesId)
    if (series && !series.tags.includes(tag)) {
      series.tags.push(tag)
      series.lastUpdated = new Date().toISOString()
      saveToFirebase()
    }
  }

  const removeTag = (type, categoryId, seriesId, tag) => {
    const series = getSeries(type, categoryId, seriesId)
    if (series) {
      series.tags = series.tags.filter(t => t !== tag)
      series.lastUpdated = new Date().toISOString()
      saveToFirebase()
    }
  }

  const exportData = () => {
    return JSON.stringify(seriesData.value, null, 2)
  }

  const importData = (jsonData) => {
    try {
      const data = JSON.parse(jsonData)
      seriesData.value = data
      saveToFirebase()
      return true
    } catch (e) {
      error.value = 'Format JSON invalide'
      return false
    }
  }

  return {
    seriesData,
    isLoading,
    error,
    loadFromFirebase,
    saveToFirebase,
    saveToLocalStorage,
    loadFromLocalStorage,
    addCategory,
    deleteCategory,
    addSeries,
    editSeries,
    deleteSeries,
    getCategoriesByType,
    getSeries,
    incrementCounter,
    decrementCounter,
    changeStatus,
    addTag,
    removeTag,
    exportData,
    importData
  }
})
