import { defineStore } from 'pinia'
import { ref } from 'vue'

const THEME_KEY = 'seriesTrackerTheme'

export const useUIStore = defineStore('ui', () => {
  const activeTab = ref('manwha')
  const theme = ref('dark')

  // Modal states
  const showCategoryModal = ref(false)
  const showSeriesModal = ref(false)
  const showEditSeriesModal = ref(false)
  const showConfirmModal = ref(false)
  const showBackupModal = ref(false)

  // Edit context
  const editContext = ref(null)
  const confirmContext = ref(null)

  // Toast
  const toastMessage = ref('')
  const toastVisible = ref(false)
  let toastTimer = null

  const tabs = [
    { id: 'manwha', label: 'Manwha', icon: 'fa-book-open' },
    { id: 'manga', label: 'Manga', icon: 'fa-book' },
    { id: 'anime', label: 'Anime', icon: 'fa-tv' },
    { id: 'novel', label: 'Novel', icon: 'fa-feather' }
  ]

  const setTab = (tabId) => {
    activeTab.value = tabId
  }

  const initTheme = () => {
    const saved = localStorage.getItem(THEME_KEY)
    if (saved) {
      theme.value = saved
    } else {
      // Prefer dark
      theme.value = 'dark'
    }
    applyTheme()
  }

  const toggleTheme = () => {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
    localStorage.setItem(THEME_KEY, theme.value)
    applyTheme()
  }

  const applyTheme = () => {
    document.documentElement.setAttribute('data-theme', theme.value)
  }

  const showToast = (message, duration = 2500) => {
    toastMessage.value = message
    toastVisible.value = true
    if (toastTimer) clearTimeout(toastTimer)
    toastTimer = setTimeout(() => {
      toastVisible.value = false
    }, duration)
  }

  const openConfirm = (title, message, onConfirm) => {
    confirmContext.value = { title, message, onConfirm }
    showConfirmModal.value = true
  }

  const closeConfirm = () => {
    showConfirmModal.value = false
    confirmContext.value = null
  }

  return {
    activeTab,
    theme,
    tabs,
    showCategoryModal,
    showSeriesModal,
    showEditSeriesModal,
    showConfirmModal,
    showBackupModal,
    editContext,
    confirmContext,
    toastMessage,
    toastVisible,
    setTab,
    initTheme,
    toggleTheme,
    showToast,
    openConfirm,
    closeConfirm
  }
})
