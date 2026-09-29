<template>
  <div class="category-section">
    <div class="category-header">
      <h3 class="category-title">
        <span class="category-icon">📂</span>
        {{ category.name }}
        <span class="count-badge">{{ category.series.length }}</span>
      </h3>
      <button class="icon-btn delete-cat-btn" @click="handleDeleteCategory" title="Supprimer le thème">
        <i class="fas fa-trash-alt"></i>
      </button>
    </div>

    <div class="series-list">
      <SeriesCard
        v-for="s in category.series"
        :key="s.id"
        :series="s"
        @edit="handleEdit"
        @delete="handleDelete"
        @increment="handleIncrement"
        @decrement="handleDecrement"
        @cycle-status="handleCycleStatus"
        @edit-counter="handleEditCounter"
        @remove-tag="handleRemoveTag"
      />
      <div v-if="category.series.length === 0" class="empty-cat">
        Aucune série dans ce thème
      </div>
    </div>
  </div>
</template>

<script setup>
import { useSeriesStore } from '../stores/seriesStore'
import { useUIStore } from '../stores/uiStore'
import SeriesCard from './SeriesCard.vue'

const props = defineProps({
  category: { type: Object, required: true }
})

const seriesStore = useSeriesStore()
const uiStore = useUIStore()

const handleEdit = (series) => {
  uiStore.editContext = {
    type: uiStore.activeTab,
    categoryId: props.category.id,
    series: { ...series }
  }
  uiStore.showEditSeriesModal = true
}

const handleDelete = (series) => {
  uiStore.openConfirm(
    'Supprimer la série',
    `Êtes-vous sûr de vouloir supprimer "${series.name}" ?`,
    () => {
      seriesStore.deleteSeries(uiStore.activeTab, props.category.id, series.id)
      uiStore.showToast(`"${series.name}" supprimée`)
    }
  )
}

const handleDeleteCategory = () => {
  uiStore.openConfirm(
    'Supprimer le thème',
    `Êtes-vous sûr de vouloir supprimer "${props.category.name}" et toutes ses séries ?`,
    () => {
      seriesStore.deleteCategory(uiStore.activeTab, props.category.id)
      uiStore.showToast(`Thème "${props.category.name}" supprimé`)
    }
  )
}

const handleIncrement = (series, counterName) => {
  seriesStore.incrementCounter(uiStore.activeTab, props.category.id, series.id, counterName)
}

const handleDecrement = (series, counterName) => {
  seriesStore.decrementCounter(uiStore.activeTab, props.category.id, series.id, counterName)
}

const handleCycleStatus = (series) => {
  seriesStore.cycleStatus(uiStore.activeTab, props.category.id, series.id)
}

const handleEditCounter = (series, counterNumber) => {
  // Open edit modal focused on counters
  uiStore.editContext = {
    type: uiStore.activeTab,
    categoryId: props.category.id,
    series: { ...series },
    focusCounter: counterNumber
  }
  uiStore.showEditSeriesModal = true
}

const handleRemoveTag = (series, tag) => {
  seriesStore.removeTag(uiStore.activeTab, props.category.id, series.id, tag)
}
</script>

<style scoped>
.category-section {
  background: var(--bg-glass);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: 16px;
  margin-bottom: 16px;
  animation: slideUp 0.3s ease;
}

.category-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border-light);
}

.category-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.category-icon {
  font-size: 1.1rem;
}

.count-badge {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, var(--primary), var(--accent));
  color: white;
  min-width: 22px;
  text-align: center;
}

.icon-btn {
  width: 34px;
  height: 34px;
  border-radius: var(--radius-sm);
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
  color: var(--text-tertiary);
  font-size: 0.85rem;
  -webkit-tap-highlight-color: transparent;
}

.delete-cat-btn:hover {
  background: var(--status-dropped-bg);
  color: var(--status-dropped);
}

.series-list {
  max-height: 420px;
  overflow-y: auto;
  padding-right: 4px;
}

.empty-cat {
  text-align: center;
  padding: 20px;
  color: var(--text-tertiary);
  font-size: 0.88rem;
  font-style: italic;
}

@media (max-width: 600px) {
  .category-section {
    padding: 12px;
    margin-bottom: 12px;
    border-radius: var(--radius-md);
  }

  .category-title {
    font-size: 0.98rem;
  }

  .icon-btn {
    width: 38px;
    height: 38px;
  }

  .series-list {
    max-height: none;
  }
}
</style>
