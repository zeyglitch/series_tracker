<template>
  <Teleport to="body">
    <div v-if="uiStore.showConfirmModal" class="modal-backdrop" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ uiStore.confirmModalState.title }}</h2>
          <button @click="closeModal" class="btn-close">×</button>
        </div>
        
        <div class="modal-body">
          <p>{{ uiStore.confirmModalState.message }}</p>
        </div>
        
        <div class="modal-footer">
          <button @click="closeModal" class="btn btn-secondary">
            {{ uiStore.confirmModalState.cancelText }}
          </button>
          <button 
            @click="confirm"
            :class="['btn', uiStore.confirmModalState.type === 'danger' ? 'btn-danger' : 'btn-primary']"
          >
            {{ uiStore.confirmModalState.confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { useUIStore } from '../../stores/uiStore'

const uiStore = useUIStore()

const closeModal = () => {
  uiStore.closeConfirmModal()
}

const confirm = () => {
  if (uiStore.confirmModalState.action) {
    uiStore.confirmModalState.action()
  }
  closeModal()
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
  animation: fadeIn 0.2s ease-in-out;
}

.modal-content {
  background: var(--card-bg);
  border: 1px solid var(--border-accent);
  border-radius: 12px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  animation: slideInUp 0.3s ease-out;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-light);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.3rem;
}

.btn-close {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 2rem;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  transition: color var(--transition-fast);
}

.btn-close:hover {
  color: var(--accent-red);
}

.modal-body {
  padding: 1.5rem;
  color: var(--text-secondary);
  line-height: 1.6;
}

.modal-body p {
  margin: 0;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid var(--border-light);
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
  font-size: 1rem;
}

.btn-primary {
  background: var(--accent-red);
  color: white;
}

.btn-primary:hover {
  background: var(--accent-pink);
  transform: translateY(-2px);
}

.btn-secondary {
  background: var(--border-light);
  color: var(--text-secondary);
}

.btn-secondary:hover {
  background: var(--border-medium);
}

.btn-danger {
  background: #e94560;
  color: white;
}

.btn-danger:hover {
  background: #ff6b6b;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .modal-content {
    max-width: 100%;
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 1rem;
  }

  .modal-footer {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>
