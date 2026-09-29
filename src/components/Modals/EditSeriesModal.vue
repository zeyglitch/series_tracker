<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="uiStore.showEditSeriesModal" class="modal-overlay" @click.self="close">
        <div class="modal-box">
          <div class="modal-header">
            <h2>Modifier la série</h2>
            <button class="close-btn" @click="close">×</button>
          </div>
          <form @submit.prevent="submit">
            <!-- Name -->
            <div class="form-group">
              <label>Nom de la série</label>
              <input v-model.trim="form.name" type="text" class="form-control" required ref="nameInput" />
            </div>

            <!-- Counters -->
            <div class="form-row">
              <div class="form-group flex-1">
                <label>Compteur principal</label>
                <select v-model="form.counter1Type" class="form-control" @change="onCounter1TypeChange">
                  <option value="chapters">Chapitres</option>
                  <option value="seasons">Saisons</option>
                  <option value="volumes">Volumes</option>
                </select>
              </div>
              <div class="form-group flex-1">
                <label>Valeur</label>
                <input v-model.number="form.counter1Value" type="number" min="0" class="form-control"
                  ref="counter1Input" />
              </div>
            </div>

            <div v-if="showCounter2" class="form-row">
              <div class="form-group flex-1">
                <label>Compteur secondaire</label>
                <select v-model="form.counter2Type" class="form-control">
                  <option value="episodes">Épisodes</option>
                  <option value="chapters">Chapitres</option>
                </select>
              </div>
              <div class="form-group flex-1">
                <label>Valeur</label>
                <input v-model.number="form.counter2Value" type="number" min="0" class="form-control"
                  ref="counter2Input" />
              </div>
            </div>

            <!-- Status -->
            <div class="form-group">
              <label>Statut</label>
              <select v-model="form.status" class="form-control">
                <option value="ongoing">En cours</option>
                <option value="todo">À lire</option>
                <option value="finished">Terminé</option>
                <option value="dropped">Abandonné</option>
              </select>
            </div>

            <!-- Notes -->
            <div class="form-group">
              <label>Notes <span class="optional">(optionnel)</span></label>
              <textarea v-model.trim="form.notes" class="form-control textarea" rows="2"
                placeholder="Remarques personnelles..."></textarea>
            </div>

            <!-- Tags -->
            <div class="form-group">
              <label>Tags</label>
              <div class="tags-input-row">
                <input v-model.trim="tagInput" type="text" class="form-control"
                  placeholder="Ajouter un tag..." @keydown.enter.prevent="addTag" />
                <button type="button" class="tag-add-btn" @click="addTag" :disabled="!tagInput">+</button>
              </div>
              <div class="tags-preview" v-if="form.tags.length">
                <span v-for="(t, i) in form.tags" :key="i" class="tag-chip">
                  {{ t }}
                  <button type="button" class="tag-chip-remove" @click="form.tags.splice(i, 1)">×</button>
                </span>
              </div>
            </div>

            <div class="form-actions">
              <button type="button" class="btn-cancel" @click="close">Annuler</button>
              <button type="submit" class="btn-submit" :disabled="!form.name">
                <i class="fas fa-save"></i> Enregistrer
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useSeriesStore } from '../../stores/seriesStore'
import { useUIStore } from '../../stores/uiStore'

const seriesStore = useSeriesStore()
const uiStore = useUIStore()

const nameInput = ref(null)
const counter1Input = ref(null)
const counter2Input = ref(null)
const tagInput = ref('')

const form = ref({
  name: '',
  counter1Type: 'chapters',
  counter1Value: 0,
  counter2Type: 'episodes',
  counter2Value: 0,
  status: 'ongoing',
  notes: '',
  tags: []
})

const showCounter2 = computed(() => {
  return form.value.counter1Type === 'seasons' || form.value.counter1Type === 'volumes'
})

watch(() => uiStore.showEditSeriesModal, (val) => {
  if (val && uiStore.editContext) {
    const s = uiStore.editContext.series
    form.value = {
      name: s.name || '',
      counter1Type: s.counter1Type || 'chapters',
      counter1Value: s.counter1Value || 0,
      counter2Type: s.counter2Type || 'episodes',
      counter2Value: s.counter2Value || 0,
      status: s.status || 'ongoing',
      notes: s.notes || '',
      tags: [...(s.tags || [])]
    }
    tagInput.value = ''

    // Focus based on context
    setTimeout(() => {
      const fc = uiStore.editContext.focusCounter
      if (fc === 1 && counter1Input.value) counter1Input.value.focus()
      else if (fc === 2 && counter2Input.value) counter2Input.value.focus()
      else if (nameInput.value) nameInput.value.focus()
    }, 100)
  }
})

const onCounter1TypeChange = () => {
  if (form.value.counter1Type === 'seasons') {
    form.value.counter2Type = 'episodes'
  } else if (form.value.counter1Type === 'volumes') {
    form.value.counter2Type = 'chapters'
  }
  if (!showCounter2.value) {
    form.value.counter2Type = null
    form.value.counter2Value = null
  }
}

const addTag = () => {
  const t = tagInput.value.trim()
  if (t && !form.value.tags.includes(t)) {
    form.value.tags.push(t)
  }
  tagInput.value = ''
}

const close = () => {
  uiStore.showEditSeriesModal = false
  uiStore.editContext = null
}

const submit = () => {
  if (!form.value.name || !uiStore.editContext) return

  const ctx = uiStore.editContext
  seriesStore.editSeries(ctx.type, ctx.categoryId, ctx.series.id, {
    name: form.value.name,
    counter1Type: form.value.counter1Type,
    counter1Value: form.value.counter1Value,
    counter2Type: showCounter2.value ? form.value.counter2Type : null,
    counter2Value: showCounter2.value ? form.value.counter2Value : null,
    status: form.value.status,
    notes: form.value.notes,
    tags: [...form.value.tags]
  })
  uiStore.showToast(`"${form.value.name}" modifiée`)
  close()
}
</script>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.55);
  backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.modal-box {
  background: var(--bg-elevated);
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-xl);
  padding: 24px; width: 100%; max-width: 500px;
  max-height: 90vh; overflow-y: auto;
  box-shadow: var(--shadow-lg);
  animation: scaleIn 0.25s ease;
}

.modal-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 20px; padding-bottom: 12px;
  border-bottom: 1px solid var(--border-light);
}
.modal-header h2 { font-size: 1.15rem; font-weight: 700; color: var(--text-primary); }

.close-btn {
  width: 32px; height: 32px; border-radius: var(--radius-sm);
  border: none; background: transparent; font-size: 1.3rem;
  cursor: pointer; color: var(--text-tertiary); transition: all var(--transition-fast);
}
.close-btn:hover { background: var(--border-light); color: var(--text-primary); }

.form-group { margin-bottom: 14px; }
.form-group label { display: block; font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 5px; }
.optional { font-weight: 400; color: var(--text-tertiary); font-size: 0.8rem; }

.form-control {
  width: 100%; padding: 10px 12px; border-radius: var(--radius-md);
  border: 1px solid var(--border-medium); background: var(--bg-input);
  color: var(--text-primary); font-family: inherit; font-size: 0.95rem;
  transition: all var(--transition-fast);
}
.form-control:focus { outline: none; border-color: var(--primary); background: var(--bg-input-focus); box-shadow: 0 0 0 3px rgba(124,58,237,0.15); }

.textarea { resize: vertical; min-height: 50px; }

.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

.tags-input-row { display: flex; gap: 6px; }
.tags-input-row .form-control { flex: 1; }
.tag-add-btn {
  width: 40px; border: none; border-radius: var(--radius-md);
  background: var(--primary); color: white; font-size: 1.2rem;
  cursor: pointer; transition: all var(--transition-fast);
}
.tag-add-btn:hover:not(:disabled) { background: var(--primary-dark); }
.tag-add-btn:disabled { opacity: 0.4; cursor: default; }

.tags-preview { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 8px; }
.tag-chip {
  display: inline-flex; align-items: center; gap: 3px;
  font-size: 0.78rem; font-weight: 600; padding: 3px 10px;
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, rgba(124,58,237,0.12), rgba(236,72,153,0.12));
  color: var(--primary-light);
}
.tag-chip-remove { background: none; border: none; color: inherit; cursor: pointer; font-size: 0.85rem; padding: 0; opacity: 0.6; }
.tag-chip-remove:hover { opacity: 1; }

.form-actions {
  display: flex; gap: 10px; margin-top: 8px;
}

.btn-cancel {
  flex: 1; padding: 12px; border: 1px solid var(--border-medium);
  border-radius: var(--radius-md); background: transparent;
  color: var(--text-secondary); font-family: inherit; font-size: 0.95rem;
  font-weight: 600; cursor: pointer; transition: all var(--transition-fast);
}
.btn-cancel:hover { background: var(--border-light); }

.btn-submit {
  flex: 1; padding: 12px; border: none; border-radius: var(--radius-md);
  background: linear-gradient(135deg, var(--primary), var(--accent));
  color: white; font-family: inherit; font-size: 0.95rem; font-weight: 700;
  cursor: pointer; transition: all var(--transition-base);
  display: flex; align-items: center; justify-content: center; gap: 8px;
}
.btn-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(124,58,237,0.35); }
.btn-submit:disabled { opacity: 0.5; cursor: default; }

.modal-enter-active { transition: opacity 0.2s ease; }
.modal-leave-active { transition: opacity 0.15s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }

@media (max-width: 600px) {
  .modal-box {
    padding: 18px;
    border-radius: var(--radius-lg);
    max-height: 95vh;
  }

  .form-row { grid-template-columns: 1fr; }
  .form-actions { flex-direction: column; }

  .form-control {
    padding: 12px 14px;
    font-size: 1rem;
  }

  .btn-submit, .btn-cancel {
    padding: 14px;
    min-height: 48px;
  }

  .tag-add-btn {
    width: 48px;
    min-height: 44px;
  }
}
</style>
