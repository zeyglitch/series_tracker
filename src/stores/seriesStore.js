import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import Papa from 'papaparse'

const STORAGE_KEY = 'seriesTrackerData'

export const useSeriesStore = defineStore('series', () => {
  // ---- State ----
  const seriesData = ref({
    manwha: [],
    manga: [],
    anime: [],
    novel: []
  })
  const isLoading = ref(false)

  // ---- Persistence ----
  const save = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seriesData.value))
    } catch (e) {
      console.error('Erreur sauvegarde localStorage:', e)
    }
  }

  const load = () => {
    isLoading.value = true
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        // Ensure all 4 tabs exist
        seriesData.value = {
          manwha: parsed.manwha || [],
          manga: parsed.manga || [],
          anime: parsed.anime || [],
          novel: parsed.novel || []
        }

        // Migration: handle old format where categories were objects keyed by name
        for (const type of ['manwha', 'manga', 'anime', 'novel']) {
          if (!Array.isArray(seriesData.value[type])) {
            // Old format: { categoryName: [series...] }
            const oldObj = seriesData.value[type]
            const migrated = []
            for (const [catName, seriesList] of Object.entries(oldObj)) {
              const migratedSeries = (Array.isArray(seriesList) ? seriesList : []).map(s => ({
                id: String(s.id || Date.now() + Math.random()),
                name: s.name || 'Sans nom',
                counter1Type: s.counter1Type || 'chapters',
                counter1Value: s.counter1Value || 0,
                counter2Type: s.counter2Type || null,
                counter2Value: s.counter2Value ?? null,
                status: s.status || 'ongoing',
                tags: s.tags || [],
                notes: s.notes || '',
                lastUpdated: s.lastUpdated || new Date().toISOString(),
                createdAt: s.createdAt || new Date().toISOString()
              }))
              migrated.push({
                id: String(Date.now() + Math.random()),
                name: catName,
                series: migratedSeries
              })
            }
            seriesData.value[type] = migrated
          }
        }
        save() // Re-save after potential migration
      }
    } catch (e) {
      console.error('Erreur chargement localStorage:', e)
    } finally {
      isLoading.value = false
    }
  }

  // ---- Categories ----
  const getCategoriesByType = (type) => {
    return seriesData.value[type] || []
  }

  const addCategory = (type, categoryName) => {
    if (!seriesData.value[type]) seriesData.value[type] = []
    const exists = seriesData.value[type].find(c => c.name.toLowerCase() === categoryName.toLowerCase())
    if (exists) return false

    seriesData.value[type].push({
      id: Date.now().toString(),
      name: categoryName,
      series: []
    })
    save()
    return true
  }

  const deleteCategory = (type, categoryId) => {
    if (!seriesData.value[type]) return
    seriesData.value[type] = seriesData.value[type].filter(c => c.id !== categoryId)
    save()
  }

  // ---- Series CRUD ----
  const findSeries = (type, categoryId, seriesId) => {
    const cat = (seriesData.value[type] || []).find(c => c.id === categoryId)
    if (!cat) return null
    return cat.series.find(s => s.id === seriesId) || null
  }

  const addSeries = (type, categoryId, seriesObj) => {
    const cat = (seriesData.value[type] || []).find(c => c.id === categoryId)
    if (!cat) return false

    cat.series.push({
      id: Date.now().toString(),
      name: seriesObj.name,
      counter1Type: seriesObj.counter1Type || 'chapters',
      counter1Value: seriesObj.counter1Value || 0,
      counter2Type: seriesObj.counter2Type || null,
      counter2Value: seriesObj.counter2Value ?? null,
      status: seriesObj.status || 'ongoing',
      tags: seriesObj.tags || [],
      notes: seriesObj.notes || '',
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    })
    save()
    return true
  }

  const editSeries = (type, categoryId, seriesId, updates) => {
    const series = findSeries(type, categoryId, seriesId)
    if (!series) return false
    Object.assign(series, { ...updates, lastUpdated: new Date().toISOString() })
    save()
    return true
  }

  const deleteSeries = (type, categoryId, seriesId) => {
    const cat = (seriesData.value[type] || []).find(c => c.id === categoryId)
    if (!cat) return
    cat.series = cat.series.filter(s => s.id !== seriesId)
    save()
  }

  // ---- Counter helpers ----
  const incrementCounter = (type, categoryId, seriesId, counterName) => {
    const series = findSeries(type, categoryId, seriesId)
    if (!series) return
    series[counterName] = (series[counterName] || 0) + 1
    series.lastUpdated = new Date().toISOString()
    save()
  }

  const decrementCounter = (type, categoryId, seriesId, counterName) => {
    const series = findSeries(type, categoryId, seriesId)
    if (!series || (series[counterName] || 0) <= 0) return
    series[counterName]--
    series.lastUpdated = new Date().toISOString()
    save()
  }

  const setCounter = (type, categoryId, seriesId, counterName, value) => {
    const series = findSeries(type, categoryId, seriesId)
    if (!series) return
    series[counterName] = Math.max(0, Number(value) || 0)
    series.lastUpdated = new Date().toISOString()
    save()
  }

  // ---- Status ----
  const changeStatus = (type, categoryId, seriesId, newStatus) => {
    const series = findSeries(type, categoryId, seriesId)
    if (!series) return
    series.status = newStatus
    series.lastUpdated = new Date().toISOString()
    save()
  }

  const cycleStatus = (type, categoryId, seriesId) => {
    const series = findSeries(type, categoryId, seriesId)
    if (!series) return
    const order = ['ongoing', 'todo', 'finished', 'dropped']
    const idx = order.indexOf(series.status)
    series.status = order[(idx + 1) % order.length]
    series.lastUpdated = new Date().toISOString()
    save()
  }

  // ---- Tags ----
  const addTag = (type, categoryId, seriesId, tag) => {
    const series = findSeries(type, categoryId, seriesId)
    if (!series) return
    if (!series.tags) series.tags = []
    const trimmed = tag.trim()
    if (trimmed && !series.tags.includes(trimmed)) {
      series.tags.push(trimmed)
      series.lastUpdated = new Date().toISOString()
      save()
    }
  }

  const removeTag = (type, categoryId, seriesId, tag) => {
    const series = findSeries(type, categoryId, seriesId)
    if (!series || !series.tags) return
    series.tags = series.tags.filter(t => t !== tag)
    series.lastUpdated = new Date().toISOString()
    save()
  }

  // ---- Export / Import ----
  const exportData = () => {
    return JSON.stringify(seriesData.value, null, 2)
  }

  const importData = (jsonString) => {
    try {
      const data = JSON.parse(jsonString)
      seriesData.value = {
        manwha: data.manwha || [],
        manga: data.manga || [],
        anime: data.anime || [],
        novel: data.novel || []
      }
      save()
      return { success: true }
    } catch (e) {
      return { success: false, error: 'Format JSON invalide' }
    }
  }

  const importCsvData = (csvString) => {
    try {
      const results = Papa.parse(csvString, { header: true, skipEmptyLines: true })
      if (results.errors.length > 0 && results.data.length === 0) {
        return { success: false, error: 'Format CSV invalide ou vide.' }
      }

      // Clear existing data to match JSON import behavior
      seriesData.value = { manwha: [], manga: [], anime: [], novel: [] }

      let importedCount = 0
      for (const row of results.data) {
        const keys = Object.keys(row)
        const getVal = (possibleKeys) => {
          const key = keys.find(k => possibleKeys.includes(k.toLowerCase().trim()))
          return key ? String(row[key]) : ''
        }

        // Determine app type (manwha/manga/anime/novel)
        let appType = getVal(['origination', 'type', 'format']).toLowerCase().trim()
        if (appType === 'manhua') appType = 'manwha'
        if (!['manwha', 'manga', 'anime', 'novel'].includes(appType)) {
          appType = 'manwha' // Default to manwha if unknown
        }

        const name = getVal(['name', 'nom', 'titre', 'title']).trim()
        if (!name) continue // skip invalid row

        // Determine category and status from CSV's "type" if "category" is missing
        const csvTypeRaw = getVal(['type']).trim()
        const csvTypeLower = csvTypeRaw.toLowerCase()
        
        let categoryName = getVal(['category', 'categorie']).trim()
        if (!categoryName) {
          categoryName = csvTypeRaw || 'Import'
        }

        let statusStr = getVal(['status', 'statut']).toLowerCase()
        if (!statusStr) {
          if (csvTypeLower === 'reading') statusStr = 'ongoing'
          else if (csvTypeLower === 'completed') statusStr = 'finished'
          else if (csvTypeLower === 'dropped') statusStr = 'dropped'
          else statusStr = 'ongoing'
        }

        if (!seriesData.value[appType]) seriesData.value[appType] = []
        let cat = seriesData.value[appType].find(c => c.name.toLowerCase() === categoryName.toLowerCase())
        if (!cat) {
          cat = { id: Date.now().toString() + Math.random().toString(), name: categoryName, series: [] }
          seriesData.value[appType].push(cat)
        }

        const tagsRaw = getVal(['tags', 'etiquettes'])
        const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : []

        cat.series.push({
          id: Date.now().toString() + Math.random().toString(),
          name: name,
          counter1Type: getVal(['counter1type', 'compteur1type']) || 'chapters',
          counter1Value: Number(getVal(['read', 'counter1value', 'compteur1valeur', 'valeur1'])) || 0,
          counter2Type: getVal(['counter2type', 'compteur2type']) || null,
          counter2Value: getVal(['counter2value', 'compteur2valeur', 'valeur2']) ? Number(getVal(['counter2value', 'compteur2valeur', 'valeur2'])) : null,
          status: statusStr,
          tags: tags,
          notes: getVal(['notes', 'note']) || '',
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        })
        importedCount++
      }
      save()
      return { success: true, count: importedCount }
    } catch (e) {
      return { success: false, error: 'Erreur lors de la lecture du CSV: ' + e.message }
    }
  }

  // ---- Stats ----
  const totalCount = computed(() => {
    let count = 0
    for (const type of ['manwha', 'manga', 'anime', 'novel']) {
      for (const cat of seriesData.value[type] || []) {
        count += (cat.series || []).length
      }
    }
    return count
  })

  return {
    seriesData,
    isLoading,
    totalCount,
    load,
    save,
    getCategoriesByType,
    addCategory,
    deleteCategory,
    findSeries,
    addSeries,
    editSeries,
    deleteSeries,
    incrementCounter,
    decrementCounter,
    setCounter,
    changeStatus,
    cycleStatus,
    addTag,
    removeTag,
    exportData,
    importData,
    importCsvData
  }
})
