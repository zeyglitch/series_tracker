<template>
  <div class="app" :data-theme="uiStore.theme">
    <header class="header">
      <div class="header-content">
        <div class="header-top">
          <h1>📖 Manwha Tracker</h1>
          <button @click="toggleTheme" class="btn btn-theme" :aria-label="themeButtonLabel">
            {{ themeButtonLabel }}
          </button>
        </div>
        <div class="search-container">
          <input
            v-model="searchTerm"
            type="text"
            placeholder="Chercher une série..."
            class="search-input"
          >
        </div>
        <TabNavigation />
      </div>
    </header>

    <main class="main-content">
      <div class="content-wrapper">
        <div class="filters-bar">
          <select v-model="selectedStatus" class="filter-select">
            <option value="all">Tous les statuts</option>
            <option value="ongoing">En cours</option>
            <option value="todo">À lire</option>
            <option value="finished">Terminé</option>
            <option value="dropped">Abandonné</option>
          </select>
          <select v-model="sortBy" class="filter-select">
            <option value="last-updated">Dernière modif</option>
            <option value="name">Nom (A-Z)</option>
          </select>
        </div>

        <CategorySection 
          v-for="category in filteredCategories" 
          :key="category.id"
          :category="category"
        />

        <div v-if="filteredCategories.length === 0" class="empty-state">
          <p>Aucune série trouvée</p>
        </div>
      </div>

      <div class="actions-bar">
        <button @click="showCategoryForm" class="btn btn-primary">
          ➕ Ajouter un thème
        </button>
        <button @click="showSeriesForm" class="btn btn-primary">
          ➕ Ajouter une série
        </button>
        <button @click="enableNotifications" class="btn btn-secondary">
          🔔 Notifications
        </button>
      </div>
    </main>

    <!-- Modals -->
    <SeriesFormModal />
    <CategoryFormModal />
    <ConfirmModal />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useSeriesStore } from './stores/seriesStore'
import { useUIStore } from './stores/uiStore'
import TabNavigation from './components/TabNavigation.vue'
import CategorySection from './components/CategorySection.vue'
import SeriesFormModal from './components/Modals/SeriesFormModal.vue'
import CategoryFormModal from './components/Modals/CategoryFormModal.vue'
import ConfirmModal from './components/Modals/ConfirmModal.vue'
import { notificationService } from './services/notificationService'

const seriesStore = useSeriesStore()
const uiStore = useUIStore()

const searchTerm = ref('')
const selectedStatus = ref('all')
const sortBy = ref('last-updated')

const themeButtonLabel = computed(() => uiStore.theme === 'dark' ? '☀️ Thème clair' : '🌙 Thème sombre')

const filteredCategories = computed(() => {
  let categories = seriesStore.getCategoriesByType(uiStore.activeTab)
  
  return categories.map(cat => {
    let series = cat.series || []
    
    // Appliquer filtre statut
    if (selectedStatus.value !== 'all') {
      series = series.filter(s => s.status === selectedStatus.value)
    }
    
    // Appliquer recherche
    if (searchTerm.value) {
      series = series.filter(s => 
        s.name.toLowerCase().includes(searchTerm.value.toLowerCase())
      )
    }
    
    // Appliquer tri
    series.sort((a, b) => {
      if (sortBy.value === 'name') {
        return a.name.localeCompare(b.name)
      } else {
        return (b.lastUpdated || 0) - (a.lastUpdated || 0)
      }
    })
    
    return { ...cat, series }
  }).filter(cat => cat.series.length > 0)
})

const showCategoryForm = () => {
  uiStore.showCategoryModal = true
}

const showSeriesForm = () => {
  uiStore.showSeriesModal = true
}

const toggleTheme = () => {
  uiStore.toggleTheme()
}

const enableNotifications = async () => {
  const permission = await notificationService.requestPermission()

  if (permission === 'granted') {
    await notificationService.sendTestNotification()
    alert('Notifications activées')
  } else if (permission === 'unsupported') {
    alert('Notifications non supportées sur ce navigateur')
  } else {
    alert('Notifications refusées')
  }
}

// Sync avec Firebase au démarrage
seriesStore.loadFromFirebase()
uiStore.initTheme()
</script>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(135deg, var(--primary-bg) 0%, var(--secondary-bg) 100%);
  color: var(--text-secondary);
  overflow-x: hidden;
}

.app[data-theme='dark'] {
  color-scheme: dark;
}

.app[data-theme='light'] {
  color-scheme: light;
}

.header {
  background: linear-gradient(135deg, var(--header-bg-start) 0%, var(--header-bg-end) 100%);
  padding: 1.5rem;
  border-bottom: 2px solid var(--border-accent);
  box-shadow: var(--shadow-md);
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

h1 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.8rem;
}

.search-container {
  margin-bottom: 1rem;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem;
  background: var(--input-bg);
  border: 1px solid var(--border-accent);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 1rem;
}

.search-input::placeholder {
  color: var(--text-placeholder);
}

.search-input:focus {
  outline: none;
  background: var(--input-bg-hover);
  box-shadow: 0 0 12px rgba(139, 92, 246, 0.25);
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.content-wrapper {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.filters-bar {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.filter-select {
  padding: 0.5rem 1rem;
  background: var(--surface-elevated);
  border: 1px solid var(--border-accent);
  border-radius: 6px;
  color: var(--text-secondary);
  font-size: 0.95rem;
  cursor: pointer;
  max-width: 100%;
}

.filter-select option {
  background: var(--card-bg);
  color: var(--text-primary);
}

.filter-select option:checked,
.filter-select option:hover,
.filter-select option:focus {
  background: var(--accent-red);
  color: #ffffff;
}

.filter-select:focus {
  outline: none;
  box-shadow: 0 0 8px rgba(139, 92, 246, 0.2);
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--text-tertiary);
}

.actions-bar {
  padding: 1.5rem;
  border-top: 1px solid var(--border-accent);
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  background: var(--actions-bg);
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.btn-primary {
  background: linear-gradient(135deg, var(--accent-red) 0%, var(--accent-pink) 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(233, 69, 96, 0.35);
}

.btn-secondary {
  background: var(--surface-elevated);
  color: var(--text-primary);
  border: 1px solid var(--border-medium);
}

.btn-secondary:hover {
  background: var(--surface-hover);
  transform: translateY(-2px);
}

.btn-theme {
  padding: 0.6rem 1rem;
  min-width: 140px;
}

/* Scrollbar personnalisée */
.content-wrapper::-webkit-scrollbar {
  width: 8px;
}

.content-wrapper::-webkit-scrollbar-track {
  background: var(--scrollbar-track);
}

.content-wrapper::-webkit-scrollbar-thumb {
  background: var(--accent-red);
  border-radius: 4px;
}

.content-wrapper::-webkit-scrollbar-thumb:hover {
  background: var(--accent-pink);
}

@media (max-width: 768px) {
  .header-top {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-content {
    width: 100%;
  }

  .header {
    padding: 0.9rem;
  }

  h1 {
    font-size: 1.25rem;
    line-height: 1.1;
  }

  .search-container {
    margin-bottom: 0.85rem;
  }

  .search-input {
    padding: 0.8rem 0.9rem;
    font-size: 0.98rem;
  }

  .content-wrapper {
    padding: 0.9rem;
  }

  .filters-bar {
    gap: 0.75rem;
    margin-bottom: 1rem;
    width: 100%;
    flex-direction: column;
  }

  .filter-select {
    width: 100%;
    padding: 0.75rem 0.9rem;
    font-size: 0.95rem;
    min-width: 0;
  }

  .actions-bar {
    flex-direction: column;
    padding: 0.9rem;
    gap: 0.7rem;
  }

  .btn-theme {
    width: 100%;
    min-width: 0;
  }

  .btn {
    width: 100%;
    min-height: 46px;
  }
}

@media (max-width: 480px) {
  .header {
    padding: 0.8rem;
  }

  h1 {
    font-size: 1.15rem;
  }

  .content-wrapper {
    padding: 0.75rem;
  }

  .filters-bar {
    gap: 0.65rem;
  }

  .btn {
    font-size: 0.95rem;
  }

  .empty-state {
    padding: 2rem 1rem;
  }
}
</style>
