import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUIStore = defineStore('ui', () => {
  const activeTab = ref('manwha')
  const theme = ref('dark')
  const showCategoryModal = ref(false)
  const showSeriesModal = ref(false)
  const showConfirmModal = ref(false)
  const showSeriesDetailModal = ref(false)
  
  // État du modal de confirmation
  const confirmModalState = ref({
    title: '',
    message: '',
    confirmText: 'Confirmer',
    cancelText: 'Annuler',
    action: null,
    type: 'warning' // 'warning', 'danger', 'info'
  })

  // État du formulaire en cours
  const currentFormState = ref({
    type: 'add', // 'add' ou 'edit'
    seriesId: null,
    categoryId: null,
    mediaType: null,
    data: {}
  })

  // Série en cours de consultation
  const selectedSeries = ref(null)

  const applyTheme = (nextTheme) => {
    theme.value = nextTheme
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.theme = nextTheme

      const metaThemeColor = document.querySelector('meta[name="theme-color"]')
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', nextTheme === 'light' ? '#f3e8ff' : '#0f172a')
      }
    }

    try {
      localStorage.setItem('manwha_tracker_theme', nextTheme)
    } catch (error) {
      console.error('Erreur sauvegarde thème:', error)
    }
  }

  const initTheme = () => {
    let storedTheme = 'dark'

    try {
      const savedTheme = localStorage.getItem('manwha_tracker_theme')
      if (savedTheme === 'light' || savedTheme === 'dark') {
        storedTheme = savedTheme
      }
    } catch (error) {
      console.error('Erreur chargement thème:', error)
    }

    applyTheme(storedTheme)
  }

  const toggleTheme = () => {
    applyTheme(theme.value === 'dark' ? 'light' : 'dark')
  }

  const setActiveTab = (tab) => {
    activeTab.value = tab
  }

  const openCategoryModal = () => {
    showCategoryModal.value = true
  }

  const closeCategoryModal = () => {
    showCategoryModal.value = false
  }

  const openSeriesModal = (mediaType, categoryId, seriesData = null) => {
    currentFormState.value = {
      type: seriesData ? 'edit' : 'add',
      seriesId: seriesData?.id || null,
      categoryId: categoryId,
      mediaType: mediaType,
      data: seriesData ? { ...seriesData } : {}
    }
    showSeriesModal.value = true
  }

  const closeSeriesModal = () => {
    showSeriesModal.value = false
    currentFormState.value = {
      type: 'add',
      seriesId: null,
      categoryId: null,
      mediaType: null,
      data: {}
    }
  }

  const openConfirmModal = (title, message, action, type = 'warning') => {
    confirmModalState.value = {
      title,
      message,
      confirmText: type === 'danger' ? 'Supprimer' : 'Confirmer',
      cancelText: 'Annuler',
      action,
      type
    }
    showConfirmModal.value = true
  }

  const closeConfirmModal = () => {
    showConfirmModal.value = false
  }

  const openSeriesDetail = (series) => {
    selectedSeries.value = series
    showSeriesDetailModal.value = true
  }

  const closeSeriesDetail = () => {
    showSeriesDetailModal.value = false
    selectedSeries.value = null
  }

  return {
    activeTab,
    theme,
    showCategoryModal,
    showSeriesModal,
    showConfirmModal,
    showSeriesDetailModal,
    confirmModalState,
    currentFormState,
    selectedSeries,
    setActiveTab,
    openCategoryModal,
    closeCategoryModal,
    openSeriesModal,
    closeSeriesModal,
    openConfirmModal,
    closeConfirmModal,
    openSeriesDetail,
    closeSeriesDetail,
    initTheme,
    toggleTheme,
    applyTheme
  }
})
