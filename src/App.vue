<template>
  <div class="app">
    <!-- Header -->
    <header class="header">
      <div class="header-inner">
        <div class="header-top">
          <h1 class="logo">
            <span class="logo-icon">📖</span>
            <span class="logo-text">My Series Tracker</span>
          </h1>
          <button class="theme-toggle" @click="uiStore.toggleTheme" :title="themeLabel">
            <i :class="['fas', uiStore.theme === 'dark' ? 'fa-sun' : 'fa-moon']"></i>
          </button>
        </div>

        <!-- Search -->
        <div class="search-wrapper">
          <i class="fas fa-search search-icon"></i>
          <input
            v-model="searchTerm"
            type="text"
            class="search-input"
            placeholder="Rechercher une série..."
          />
          <button v-if="searchTerm" class="search-clear" @click="searchTerm = ''">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- Tabs -->
        <TabNavigation />
      </div>
    </header>

    <!-- Main content -->
    <main class="main">
      <div class="content-area">
        <!-- Filters -->
        <div class="filters-bar">
          <div class="filter-item">
            <select v-model="statusFilter" class="filter-select">
              <option value="all">Tous les statuts</option>
              <option value="ongoing">En cours</option>
              <option value="todo">À lire</option>
              <option value="finished">Terminé</option>
              <option value="dropped">Abandonné</option>
            </select>
          </div>
          <div class="filter-item">
            <select v-model="sortBy" class="filter-select">
              <option value="last-updated">Dernière modif</option>
              <option value="name">Nom (A-Z)</option>
            </select>
          </div>
        </div>

        <!-- Categories -->
        <CategorySection
          v-for="cat in filteredCategories"
          :key="cat.id"
          :category="cat"
        />

        <!-- Empty state -->
        <div v-if="filteredCategories.length === 0" class="empty-state">
          <div class="empty-icon">🔍</div>
          <p v-if="searchTerm">Aucune série ne correspond à "<strong>{{ searchTerm }}</strong>"</p>
          <p v-else-if="statusFilter !== 'all'">Aucune série avec ce statut</p>
          <p v-else>Aucune série pour le moment.<br/>Commencez par ajouter un thème puis une série !</p>
        </div>
      </div>
    </main>

    <!-- Bottom action bar -->
    <footer class="action-bar">
      <button class="action-btn primary" @click="uiStore.showCategoryModal = true">
        <i class="fas fa-folder-plus"></i>
        <span>Thème</span>
      </button>
      <button class="action-btn primary" @click="uiStore.showSeriesModal = true">
        <i class="fas fa-plus"></i>
        <span>Série</span>
      </button>
      <button class="action-btn secondary" @click="uiStore.showBackupModal = true">
        <i class="fas fa-database"></i>
        <span>Backup</span>
      </button>
    </footer>

    <!-- Modals -->
    <CategoryFormModal />
    <SeriesFormModal />
    <EditSeriesModal />
    <ConfirmModal />
    <BackupModal />

    <!-- Toast -->
    <Transition name="toast">
      <div v-if="uiStore.toastVisible" class="toast">
        <i class="fas fa-check-circle"></i>
        {{ uiStore.toastMessage }}
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useSeriesStore } from './stores/seriesStore'
import { useUIStore } from './stores/uiStore'
import TabNavigation from './components/TabNavigation.vue'
import CategorySection from './components/CategorySection.vue'
import CategoryFormModal from './components/Modals/CategoryFormModal.vue'
import SeriesFormModal from './components/Modals/SeriesFormModal.vue'
import EditSeriesModal from './components/Modals/EditSeriesModal.vue'
import ConfirmModal from './components/Modals/ConfirmModal.vue'
import BackupModal from './components/Modals/BackupModal.vue'

const seriesStore = useSeriesStore()
const uiStore = useUIStore()

// Init
uiStore.initTheme()
seriesStore.load()

// Local state
const searchTerm = ref('')
const statusFilter = ref('all')
const sortBy = ref('last-updated')

const themeLabel = computed(() => uiStore.theme === 'dark' ? 'Thème clair' : 'Thème sombre')

// Status sort order
const statusOrder = { ongoing: 0, todo: 1, finished: 2, dropped: 3 }

const filteredCategories = computed(() => {
  const categories = seriesStore.getCategoriesByType(uiStore.activeTab)

  return categories.map(cat => {
    let series = [...(cat.series || [])]

    // Status filter
    if (statusFilter.value !== 'all') {
      series = series.filter(s => s.status === statusFilter.value)
    }

    // Search filter
    if (searchTerm.value) {
      const term = searchTerm.value.toLowerCase()
      series = series.filter(s =>
        s.name.toLowerCase().includes(term) ||
        (s.tags || []).some(t => t.toLowerCase().includes(term)) ||
        (s.notes || '').toLowerCase().includes(term)
      )
    }

    // Sort
    series.sort((a, b) => {
      // Primary sort by status order when showing all
      if (statusFilter.value === 'all') {
        const orderDiff = (statusOrder[a.status] || 0) - (statusOrder[b.status] || 0)
        if (orderDiff !== 0) return orderDiff
      }

      if (sortBy.value === 'name') {
        return a.name.localeCompare(b.name)
      } else {
        // last-updated: newest first
        const aDate = a.lastUpdated ? new Date(a.lastUpdated).getTime() : 0
        const bDate = b.lastUpdated ? new Date(b.lastUpdated).getTime() : 0
        return bDate - aDate
      }
    })

    return { ...cat, series }
  }).filter(cat => cat.series.length > 0 || (!searchTerm.value && statusFilter.value === 'all'))
})
</script>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  max-height: 100vh;
}

/* ---- Header ---- */
.header {
  background: var(--bg-header);
  padding: 16px 16px 0;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: var(--shadow-md);
}

.header-inner {
  max-width: 900px;
  margin: 0 auto;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  color: white;
  font-size: 1.4rem;
  font-weight: 800;
}

.logo-icon { font-size: 1.5rem; }

.theme-toggle {
  width: 38px;
  height: 38px;
  border-radius: var(--radius-md);
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.1);
  color: white;
  cursor: pointer;
  font-size: 1rem;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
}

.theme-toggle:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: rotate(15deg);
}

/* Search */
.search-wrapper {
  position: relative;
  margin-bottom: 12px;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.85rem;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 10px 38px 10px 38px;
  border-radius: var(--radius-full);
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-family: inherit;
  font-size: 0.95rem;
  transition: all var(--transition-fast);
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.search-input:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.18);
  border-color: rgba(255, 255, 255, 0.3);
  box-shadow: 0 0 16px rgba(124, 58, 237, 0.25);
}

.search-clear {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  cursor: pointer;
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.search-clear:hover {
  background: rgba(255, 255, 255, 0.35);
}

/* ---- Main ---- */
.main {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.content-area {
  max-width: 900px;
  margin: 0 auto;
}

/* Filters */
.filters-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.filter-select {
  padding: 8px 12px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-medium);
  background: var(--bg-surface);
  color: var(--text-primary);
  font-family: inherit;
  font-size: 0.88rem;
  cursor: pointer;
  transition: all var(--transition-fast);
  min-width: 0;
  flex: 1;
}

.filter-select:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.12);
}

.filter-select option {
  background: var(--bg-surface);
  color: var(--text-primary);
}

/* Empty state */
.empty-state {
  text-align: center;
  padding: 48px 20px;
  color: var(--text-tertiary);
  animation: fadeIn 0.4s ease;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 12px;
}

.empty-state p {
  font-size: 0.95rem;
  line-height: 1.6;
}

/* ---- Action bar ---- */
.action-bar {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid var(--border-light);
  background: var(--bg-glass-strong);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  justify-content: center;
  flex-shrink: 0;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 18px;
  border-radius: var(--radius-md);
  border: none;
  font-family: inherit;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  transition: all var(--transition-base);
  flex: 1;
  max-width: 200px;
}

.action-btn.primary {
  background: linear-gradient(135deg, var(--primary), var(--accent));
  color: white;
}

.action-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(124, 58, 237, 0.35);
}

.action-btn.secondary {
  background: var(--bg-surface);
  color: var(--text-primary);
  border: 1px solid var(--border-medium);
}

.action-btn.secondary:hover {
  background: var(--border-light);
  transform: translateY(-1px);
}

/* ---- Toast ---- */
.toast {
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--bg-elevated);
  color: var(--status-finished);
  padding: 10px 20px;
  border-radius: var(--radius-full);
  border: 1px solid var(--status-finished-bg);
  box-shadow: var(--shadow-lg);
  font-size: 0.88rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 2000;
  white-space: nowrap;
}

.toast-enter-active { animation: toast-in 0.3s ease; }
.toast-leave-active { animation: toast-out 0.25s ease; }

/* ---- Responsive ---- */
@media (max-width: 600px) {
  .header { padding: 12px 12px 0; }
  .logo { font-size: 1.15rem; }
  .logo-icon { font-size: 1.3rem; }
  .main { padding: 12px; }

  .filters-bar {
    flex-direction: column;
    gap: 8px;
  }

  .filter-select {
    width: 100%;
  }

  .action-bar { padding: 10px 12px; gap: 6px; }
  .action-btn {
    padding: 10px 12px;
    font-size: 0.82rem;
    max-width: none;
  }

  .action-btn span { display: none; }
  .action-btn i { font-size: 1.1rem; }

  .toast { bottom: 70px; font-size: 0.82rem; padding: 8px 16px; }
}
</style>
