<template>
  <div class="series-card" :class="'border-' + series.status">
    <!-- Header row: name + actions -->
    <div class="card-header">
      <div class="series-name" @click="$emit('edit', series)" :title="series.name">
        {{ series.name }}
      </div>
      <div class="card-actions">
        <button
          class="status-badge"
          :class="'status-' + series.status"
          @click="$emit('cycle-status', series)"
          :title="'Cliquer pour changer le statut'"
        >
          {{ statusLabel }}
        </button>
        <button class="icon-btn edit-btn" @click="$emit('edit', series)" title="Modifier">
          <i class="fas fa-pen"></i>
        </button>
        <button class="icon-btn delete-btn" @click="$emit('delete', series)" title="Supprimer">
          <i class="fas fa-trash-alt"></i>
        </button>
      </div>
    </div>

    <!-- Counters -->
    <div class="counters-row">
      <div class="counter-group">
        <span class="counter-label">{{ counterShort(series.counter1Type) }}</span>
        <div class="counter-controls">
          <button class="counter-btn minus" @click="vibrate(); $emit('decrement', series, 'counter1Value')">−</button>
          <span class="counter-value" @click="$emit('edit-counter', series, 1)" title="Cliquer pour modifier">
            {{ series.counter1Value }}
          </span>
          <button class="counter-btn plus" @click="vibrate(); $emit('increment', series, 'counter1Value')">+</button>
        </div>
      </div>

      <div v-if="series.counter2Type && series.counter2Value !== null" class="counter-group">
        <span class="counter-label">{{ counterShort(series.counter2Type) }}</span>
        <div class="counter-controls">
          <button class="counter-btn minus" @click="vibrate(); $emit('decrement', series, 'counter2Value')">−</button>
          <span class="counter-value" @click="$emit('edit-counter', series, 2)" title="Cliquer pour modifier">
            {{ series.counter2Value }}
          </span>
          <button class="counter-btn plus" @click="vibrate(); $emit('increment', series, 'counter2Value')">+</button>
        </div>
      </div>
    </div>

    <!-- Tags -->
    <div v-if="series.tags && series.tags.length" class="tags-row">
      <span v-for="tag in series.tags" :key="tag" class="tag">
        {{ tag }}
        <button class="tag-remove" @click="$emit('remove-tag', series, tag)">×</button>
      </span>
    </div>

    <!-- Notes preview -->
    <div v-if="series.notes" class="notes-preview" :title="series.notes">
      <i class="fas fa-sticky-note"></i> {{ series.notes }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  series: { type: Object, required: true }
})

defineEmits(['edit', 'delete', 'increment', 'decrement', 'cycle-status', 'edit-counter', 'remove-tag'])

const vibrate = () => {
  if (navigator.vibrate) {
    navigator.vibrate(15) // Short vibration for haptic feedback
  }
}

const statusLabel = computed(() => {
  const map = { ongoing: 'En cours', finished: 'Terminé', todo: 'À lire', dropped: 'Abandonné' }
  return map[props.series.status] || props.series.status
})

const counterShort = (type) => {
  const map = { chapters: 'Ch', seasons: 'S', volumes: 'V', episodes: 'Ep' }
  return map[type] || type
}
</script>

<style scoped>
.series-card {
  background: var(--bg-surface);
  border-radius: var(--radius-md);
  padding: 12px 14px;
  margin-bottom: 8px;
  border-left: 4px solid var(--border-medium);
  transition: all var(--transition-base);
  animation: fadeIn 0.25s ease;
}

.series-card:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.border-ongoing { border-left-color: var(--status-ongoing); }
.border-finished { border-left-color: var(--status-finished); }
.border-todo { border-left-color: var(--status-todo); }
.border-dropped { border-left-color: var(--status-dropped); }

/* Header */
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
}

.series-name {
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--text-primary);
  cursor: pointer;
  overflow-x: auto;
  white-space: nowrap;
  min-width: 0;
  flex: 1;
  padding: 2px 4px;
  border-radius: var(--radius-sm);
  transition: background var(--transition-fast);
  scrollbar-width: none;
}

.series-name::-webkit-scrollbar {
  display: none;
}

.series-name:hover {
  background: var(--border-light);
}

.card-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

/* Status badge */
.status-badge {
  font-size: 0.72rem;
  font-weight: 700;
  font-family: inherit;
  padding: 3px 10px;
  border-radius: var(--radius-full);
  border: none;
  cursor: pointer;
  white-space: nowrap;
  transition: all var(--transition-fast);
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.status-ongoing {
  background: var(--status-ongoing-bg);
  color: var(--status-ongoing);
}
.status-finished {
  background: var(--status-finished-bg);
  color: var(--status-finished);
}
.status-todo {
  background: var(--status-todo-bg);
  color: var(--status-todo);
}
.status-dropped {
  background: var(--status-dropped-bg);
  color: var(--status-dropped);
}

.status-badge:hover {
  transform: scale(1.05);
  filter: brightness(1.1);
}

/* Icon buttons */
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

.edit-btn:hover {
  background: var(--status-todo-bg);
  color: var(--status-todo);
}

.delete-btn:hover {
  background: var(--status-dropped-bg);
  color: var(--status-dropped);
}

/* Counters */
.counters-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 6px;
}

.counter-group {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--bg-input);
  padding: 4px 8px;
  border-radius: var(--radius-full);
}

.counter-label {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-tertiary);
  min-width: 20px;
}

.counter-controls {
  display: flex;
  align-items: center;
  gap: 2px;
}

.counter-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
  font-family: inherit;
  -webkit-tap-highlight-color: transparent;
}

.counter-btn.minus {
  background: var(--border-light);
  color: var(--text-secondary);
}

.counter-btn.plus {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  color: white;
}

.counter-btn:hover {
  transform: scale(1.12);
}

.counter-btn:active {
  transform: scale(0.95);
}

.counter-value {
  min-width: 28px;
  text-align: center;
  font-weight: 700;
  font-size: 0.88rem;
  color: var(--text-primary);
  cursor: pointer;
  padding: 2px 4px;
  border-radius: var(--radius-sm);
  transition: background var(--transition-fast);
}

.counter-value:hover {
  background: var(--border-light);
}

/* Tags */
.tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 4px;
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, rgba(124, 58, 237, 0.12), rgba(236, 72, 153, 0.12));
  color: var(--primary-light);
}

.tag-remove {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  font-size: 0.85rem;
  line-height: 1;
  padding: 0;
  opacity: 0.6;
  transition: opacity var(--transition-fast);
}

.tag-remove:hover {
  opacity: 1;
}

/* Notes */
.notes-preview {
  font-size: 0.78rem;
  color: var(--text-tertiary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.notes-preview i {
  margin-right: 4px;
  font-size: 0.7rem;
}

/* Mobile */
@media (max-width: 600px) {
  .series-card {
    padding: 10px 12px;
  }

  .card-header {
    flex-wrap: wrap;
  }

  .series-name {
    flex: 1 1 100%;
    margin-bottom: 6px;
    font-size: 0.93rem;
  }

  .card-actions {
    width: 100%;
    justify-content: flex-end;
    gap: 2px;
  }

  .icon-btn {
    width: 38px;
    height: 38px;
    font-size: 0.9rem;
  }

  .status-badge {
    padding: 5px 12px;
    font-size: 0.74rem;
  }

  .counter-btn {
    width: 36px;
    height: 36px;
    font-size: 1.1rem;
  }

  .counter-value {
    min-width: 32px;
    font-size: 0.92rem;
    padding: 4px 6px;
  }

  .counter-group {
    padding: 5px 10px;
  }

  .counters-row {
    gap: 6px;
  }
}
</style>
