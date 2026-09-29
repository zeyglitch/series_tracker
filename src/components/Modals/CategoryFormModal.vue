<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="uiStore.showCategoryModal" class="modal-overlay" @click.self="close">
        <div class="modal-box">
          <div class="modal-header">
            <h2>Ajouter un thème</h2>
            <button class="close-btn" @click="close">×</button>
          </div>
          <form @submit.prevent="submit">
            <div class="form-group">
              <label for="cat-type">Type</label>
              <select id="cat-type" v-model="formType" class="form-control">
                <option value="manwha">Manwha</option>
                <option value="manga">Manga</option>
                <option value="anime">Anime</option>
                <option value="novel">Novel</option>
              </select>
            </div>
            <div class="form-group">
              <label for="cat-name">Nom du thème</label>
              <input id="cat-name" v-model.trim="formName" type="text" class="form-control"
                placeholder="Ex: Romance, Action, Murim..." required ref="nameInput" />
            </div>
            <button type="submit" class="btn-submit" :disabled="!formName">
              <i class="fas fa-plus"></i> Ajouter
            </button>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useSeriesStore } from '../../stores/seriesStore'
import { useUIStore } from '../../stores/uiStore'

const seriesStore = useSeriesStore()
const uiStore = useUIStore()

const formType = ref('manwha')
const formName = ref('')
const nameInput = ref(null)

watch(() => uiStore.showCategoryModal, (val) => {
  if (val) {
    formType.value = uiStore.activeTab
    formName.value = ''
    setTimeout(() => nameInput.value?.focus(), 100)
  }
})

const close = () => { uiStore.showCategoryModal = false }

const submit = () => {
  if (!formName.value) return
  const ok = seriesStore.addCategory(formType.value, formName.value)
  if (ok) {
    uiStore.showToast(`Thème "${formName.value}" ajouté`)
    close()
  } else {
    uiStore.showToast('Ce thème existe déjà !')
  }
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
  padding: 24px;
  width: 100%;
  max-width: 440px;
  box-shadow: var(--shadow-lg);
  animation: scaleIn 0.25s ease;
}

.modal-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-light);
}

.modal-header h2 {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-primary);
}

.close-btn {
  width: 32px; height: 32px;
  border-radius: var(--radius-sm);
  border: none; background: transparent;
  font-size: 1.3rem; cursor: pointer;
  color: var(--text-tertiary);
  transition: all var(--transition-fast);
}
.close-btn:hover { background: var(--border-light); color: var(--text-primary); }

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 6px;
}

.form-control {
  width: 100%;
  padding: 10px 12px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-medium);
  background: var(--bg-input);
  color: var(--text-primary);
  font-family: inherit;
  font-size: 0.95rem;
  transition: all var(--transition-fast);
}

.form-control:focus {
  outline: none;
  border-color: var(--primary);
  background: var(--bg-input-focus);
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.15);
}

.btn-submit {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: var(--radius-md);
  background: linear-gradient(135deg, var(--primary), var(--accent));
  color: white;
  font-family: inherit;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all var(--transition-base);
  display: flex; align-items: center; justify-content: center; gap: 8px;
}

.btn-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(124, 58, 237, 0.35); }
.btn-submit:disabled { opacity: 0.5; cursor: default; }

/* Transitions */
.modal-enter-active { transition: opacity 0.2s ease; }
.modal-leave-active { transition: opacity 0.15s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
