<template>
  <div class="category-section">
    <div class="category-header">
      <h2 class="category-title">{{ category.name }}</h2>
      <button @click="deleteCategory" class="btn-delete" title="Supprimer la catégorie">
        🗑️
      </button>
    </div>
    
    <div class="series-container">
      <SeriesCard 
        v-for="series in category.series"
        :key="series.id"
        :series="series"
        :category="category"
      />
    </div>
  </div>
</template>

<script setup>
import { useSeriesStore } from '../stores/seriesStore'
import { useUIStore } from '../stores/uiStore'
import SeriesCard from './SeriesCard.vue'

const props = defineProps({
  category: {
    type: Object,
    required: true
  }
})

const seriesStore = useSeriesStore()
const uiStore = useUIStore()

const deleteCategory = () => {
  uiStore.openConfirmModal(
    'Supprimer la catégorie',
    `Êtes-vous sûr de vouloir supprimer "${props.category.name}" ? Toutes les séries seront supprimées.`,
    () => {
      seriesStore.deleteCategory(uiStore.activeTab, props.category.id)
    },
    'danger'
  )
}
</script>

<style scoped>
.category-section {
  background: var(--card-bg);
  border: 1px solid var(--border-light);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: var(--shadow-md);
  animation: fadeIn 0.3s ease-in-out;
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid var(--border-light);
}

.category-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--accent-red);
  margin: 0;
}

.btn-delete {
  background: transparent;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: all var(--transition-fast);
}

.btn-delete:hover {
  background: rgba(233, 69, 96, 0.1);
  transform: scale(1.1);
}

.series-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

@media (max-width: 768px) {
  .category-section {
    padding: 0.9rem;
    margin-bottom: 1rem;
  }

  .category-header {
    margin-bottom: 1rem;
    padding-bottom: 0.8rem;
  }

  .category-title {
    font-size: 1.1rem;
  }

  .series-container {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}

@media (max-width: 480px) {
  .category-section {
    padding: 0.8rem;
  }

  .btn-delete {
    padding: 0.4rem;
    font-size: 1rem;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
