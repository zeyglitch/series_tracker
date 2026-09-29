<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="uiStore.showConfirmModal" class="modal-overlay" @click.self="cancel">
        <div class="modal-box">
          <div class="modal-header">
            <h2>{{ context?.title || 'Confirmer' }}</h2>
            <button class="close-btn" @click="cancel">×</button>
          </div>
          <p class="confirm-message">{{ context?.message || 'Êtes-vous sûr ?' }}</p>
          <div class="form-actions">
            <button class="btn-cancel" @click="cancel">Annuler</button>
            <button class="btn-danger" @click="confirm">
              <i class="fas fa-trash-alt"></i> Supprimer
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'
import { useUIStore } from '../../stores/uiStore'

const uiStore = useUIStore()
const context = computed(() => uiStore.confirmContext)

const cancel = () => { uiStore.closeConfirm() }
const confirm = () => {
  if (context.value?.onConfirm) context.value.onConfirm()
  uiStore.closeConfirm()
}
</script>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.55);
  backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center;
  z-index: 1100;
  padding: 16px;
}

.modal-box {
  background: var(--bg-elevated);
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-xl);
  padding: 24px; width: 100%; max-width: 400px;
  box-shadow: var(--shadow-lg);
  animation: scaleIn 0.25s ease;
}

.modal-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 16px;
}
.modal-header h2 { font-size: 1.1rem; font-weight: 700; color: var(--text-primary); }

.close-btn {
  width: 32px; height: 32px; border-radius: var(--radius-sm);
  border: none; background: transparent; font-size: 1.3rem;
  cursor: pointer; color: var(--text-tertiary); transition: all var(--transition-fast);
}
.close-btn:hover { background: var(--border-light); color: var(--text-primary); }

.confirm-message {
  color: var(--text-secondary);
  font-size: 0.95rem;
  margin-bottom: 20px;
  line-height: 1.5;
}

.form-actions { display: flex; gap: 10px; }

.btn-cancel {
  flex: 1; padding: 10px; border: 1px solid var(--border-medium);
  border-radius: var(--radius-md); background: transparent;
  color: var(--text-secondary); font-family: inherit; font-size: 0.95rem;
  font-weight: 600; cursor: pointer; transition: all var(--transition-fast);
}
.btn-cancel:hover { background: var(--border-light); }

.btn-danger {
  flex: 1; padding: 10px; border: none; border-radius: var(--radius-md);
  background: linear-gradient(135deg, var(--danger), #dc2626);
  color: white; font-family: inherit; font-size: 0.95rem; font-weight: 700;
  cursor: pointer; transition: all var(--transition-base);
  display: flex; align-items: center; justify-content: center; gap: 6px;
}
.btn-danger:hover { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(239,68,68,0.35); }

.modal-enter-active { transition: opacity 0.2s ease; }
.modal-leave-active { transition: opacity 0.15s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
