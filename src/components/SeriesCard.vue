<template>
  <div class="series-card" :class="`status-${series.status}`">
    <div class="series-header">
      <h3 class="series-name" @click="openDetail">{{ series.name }}</h3>
      <div class="series-actions">
        <button @click="editSeries" class="btn-action" title="Éditer">✏️</button>
        <button @click="deleteSeries" class="btn-action btn-danger" title="Supprimer">🗑️</button>
      </div>
    </div>

    <!-- Statut -->
    <button @click="toggleStatus" :class="['status-badge', `status-${series.status}`]">
      {{ statusLabel }}
    </button>

    <!-- Compteurs -->
    <div class="counters">
      <div class="counter-group">
        <label class="counter-label">{{ counterNames.counter1 }}</label>
        <div class="counter-controls">
          <button @click="decrementCounter1" class="btn-counter">-</button>
          <span class="counter-value">{{ series.counter1Value || 0 }}</span>
          <button @click="incrementCounter1" class="btn-counter">+</button>
        </div>
      </div>

      <div v-if="hasCounter2" class="counter-group">
        <label class="counter-label">{{ counterNames.counter2 }}</label>
        <div class="counter-controls">
          <button @click="decrementCounter2" class="btn-counter">-</button>
          <span class="counter-value">{{ series.counter2Value || 0 }}</span>
          <button @click="incrementCounter2" class="btn-counter">+</button>
        </div>
      </div>
    </div>

    <!-- Tags -->
    <div v-if="series.tags && series.tags.length > 0" class="tags">
      <span v-for="tag in series.tags" :key="tag" class="tag">
        {{ tag }}
        <button @click="removeTag(tag)" class="tag-close">×</button>
      </span>
    </div>

    <!-- Lien source -->
    <div v-if="series.sourceUrl" class="source-link">
      <a :href="series.sourceUrl" target="_blank" rel="noopener noreferrer" class="link">
        🔗 Voir en ligne
      </a>
    </div>

    <!-- Notes -->
    <div v-if="series.notes" class="notes">{{ series.notes }}</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useSeriesStore } from '../stores/seriesStore'
import { useUIStore } from '../stores/uiStore'

const props = defineProps({
  series: {
    type: Object,
    required: true
  },
  category: {
    type: Object,
    required: true
  }
})

const seriesStore = useSeriesStore()
const uiStore = useUIStore()

const statusLabels = {
  ongoing: '📖 En cours',
  todo: '📋 À lire',
  finished: '✅ Terminé',
  dropped: '⛔ Abandonné'
}

const statusLabel = computed(() => statusLabels[props.series.status])

const counterNames = computed(() => {
  const names = {
    counter1: 'Ch.',
    counter2: 'Ep.'
  }
  
  if (props.series.counter1Type === 'seasons') {
    names.counter1 = 'Saisons'
    names.counter2 = props.series.counter2Type === 'episodes' ? 'Épisodes' : 'Chapitres'
  } else if (props.series.counter1Type === 'volumes') {
    names.counter1 = 'Volumes'
    names.counter2 = 'Chapitres'
  } else if (props.series.counter1Type === 'chapters') {
    names.counter1 = 'Chapitres'
  }
  
  return names
})

const hasCounter2 = computed(() => {
  return props.series.counter2Type && props.series.counter2Value !== undefined
})

const incrementCounter1 = () => {
  seriesStore.incrementCounter(
    uiStore.activeTab,
    props.category.id,
    props.series.id,
    'counter1Value'
  )
}

const decrementCounter1 = () => {
  seriesStore.decrementCounter(
    uiStore.activeTab,
    props.category.id,
    props.series.id,
    'counter1Value'
  )
}

const incrementCounter2 = () => {
  seriesStore.incrementCounter(
    uiStore.activeTab,
    props.category.id,
    props.series.id,
    'counter2Value'
  )
}

const decrementCounter2 = () => {
  seriesStore.decrementCounter(
    uiStore.activeTab,
    props.category.id,
    props.series.id,
    'counter2Value'
  )
}

const toggleStatus = () => {
  const statuses = ['ongoing', 'todo', 'finished', 'dropped']
  const currentIndex = statuses.indexOf(props.series.status)
  const nextStatus = statuses[(currentIndex + 1) % statuses.length]
  
  seriesStore.changeStatus(
    uiStore.activeTab,
    props.category.id,
    props.series.id,
    nextStatus
  )
}

const editSeries = () => {
  uiStore.openSeriesModal(uiStore.activeTab, props.category.id, props.series)
}

const deleteSeries = () => {
  uiStore.openConfirmModal(
    'Supprimer la série',
    `Êtes-vous sûr de vouloir supprimer "${props.series.name}" ?`,
    () => {
      seriesStore.deleteSeries(
        uiStore.activeTab,
        props.category.id,
        props.series.id
      )
    },
    'danger'
  )
}

const removeTag = (tag) => {
  seriesStore.removeTag(
    uiStore.activeTab,
    props.category.id,
    props.series.id,
    tag
  )
}

const openDetail = () => {
  uiStore.openSeriesDetail(props.series)
}
</script>

<style scoped>
.series-card {
  background: rgba(31, 41, 55, 0.6);
  border: 1px solid var(--border-light);
  border-left: 4px solid var(--status-ongoing);
  border-radius: 10px;
  padding: 1.25rem;
  transition: all var(--transition-base);
  cursor: default;
}

.series-card:hover {
  background: rgba(31, 41, 55, 0.8);
  box-shadow: 0 0 12px rgba(233, 69, 96, 0.2);
  transform: translateY(-2px);
}

.series-card.status-finished {
  border-left-color: var(--status-finished);
}

.series-card.status-todo {
  border-left-color: var(--status-todo);
}

.series-card.status-dropped {
  border-left-color: var(--status-dropped);
}

.series-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  gap: 0.5rem;
}

.series-name {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  cursor: pointer;
  transition: color var(--transition-fast);
  flex: 1;
  word-break: break-word;
}

.series-name:hover {
  color: var(--accent-red);
}

.series-actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.btn-action {
  background: transparent;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  padding: 0.4rem;
  border-radius: 6px;
  transition: all var(--transition-fast);
}

.btn-action:hover {
  background: rgba(233, 69, 96, 0.2);
  transform: scale(1.1);
}

.btn-action.btn-danger:hover {
  background: rgba(233, 69, 96, 0.3);
}

.status-badge {
  display: inline-block;
  padding: 0.4rem 0.8rem;
  border: none;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
  margin-bottom: 1rem;
  color: white;
}

.status-badge.status-ongoing {
  background: var(--status-ongoing);
}

.status-badge.status-todo {
  background: var(--status-todo);
}

.status-badge.status-finished {
  background: var(--status-finished);
}

.status-badge.status-dropped {
  background: var(--status-dropped);
}

.status-badge:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.counters {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.counter-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(0, 0, 0, 0.2);
  padding: 0.75rem;
  border-radius: 8px;
}

.counter-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-secondary);
  min-width: 70px;
}

.counter-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.btn-counter {
  background: var(--accent-red);
  border: none;
  color: white;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
  font-weight: bold;
  transition: all var(--transition-fast);
  font-size: 1rem;
}

.btn-counter:hover {
  background: var(--accent-pink);
  transform: scale(1.1);
}

.counter-value {
  font-weight: 700;
  color: var(--text-primary);
  min-width: 25px;
  text-align: center;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.tag {
  background: rgba(233, 69, 96, 0.2);
  color: var(--accent-red);
  padding: 0.3rem 0.7rem;
  border-radius: 20px;
  font-size: 0.85rem;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.tag-close {
  background: none;
  border: none;
  color: var(--accent-red);
  cursor: pointer;
  font-size: 1rem;
  padding: 0;
  line-height: 1;
}

.tag-close:hover {
  opacity: 0.7;
}

.source-link {
  margin-bottom: 0.75rem;
}

.link {
  color: var(--accent-blue);
  text-decoration: none;
  font-size: 0.9rem;
  transition: color var(--transition-fast);
}

.link:hover {
  color: var(--accent-pink);
  text-decoration: underline;
}

.notes {
  font-size: 0.85rem;
  color: var(--text-tertiary);
  font-style: italic;
  padding: 0.75rem;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 6px;
  border-left: 2px solid var(--accent-red);
}

@media (max-width: 768px) {
  .series-card {
    padding: 0.9rem;
  }

  .series-header {
    flex-direction: column;
    gap: 0.65rem;
    margin-bottom: 0.85rem;
  }

  .series-actions {
    width: 100%;
    justify-content: flex-start;
  }

  .series-name {
    font-size: 1rem;
  }

  .status-badge {
    width: fit-content;
    margin-bottom: 0.85rem;
  }

  .counter-group {
    padding: 0.65rem;
  }

  .counter-label {
    min-width: auto;
  }

  .counter-controls {
    gap: 0.55rem;
  }

  .btn-counter {
    width: 34px;
    height: 34px;
  }

  .tags {
    gap: 0.4rem;
  }

  .tag {
    font-size: 0.8rem;
  }

  .notes {
    font-size: 0.8rem;
    padding: 0.65rem;
  }
}

@media (max-width: 480px) {
  .series-card {
    padding: 0.8rem;
  }

  .counter-group {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.55rem;
  }

  .counter-controls {
    width: 100%;
    justify-content: space-between;
  }

  .btn-action {
    padding: 0.55rem;
  }
}
</style>
