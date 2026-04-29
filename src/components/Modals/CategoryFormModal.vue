<template>
  <Teleport to="body">
    <div v-if="uiStore.showCategoryModal" class="modal-backdrop" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Ajouter un thème</h2>
          <button @click="closeModal" class="btn-close">×</button>
        </div>
        
        <form @submit.prevent="submitForm" class="form">
          <div class="form-group">
            <label for="category-type">Type:</label>
            <select v-model="formData.type" id="category-type" class="input" required>
              <option value="manwha">Manwha</option>
              <option value="manga">Manga</option>
              <option value="anime">Anime</option>
              <option value="novel">Novel</option>
            </select>
          </div>

          <div class="form-group">
            <label for="category-name">Nom du thème:</label>
            <input 
              v-model="formData.name" 
              id="category-name"
              type="text"
              class="input"
              placeholder="Ex: Romance, Action, Mystère"
              required
            >
          </div>

          <div class="form-footer">
            <button type="button" @click="closeModal" class="btn btn-secondary">
              Annuler
            </button>
            <button type="submit" class="btn btn-primary">
              Ajouter
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'
import { useSeriesStore } from '../../stores/seriesStore'
import { useUIStore } from '../../stores/uiStore'

const seriesStore = useSeriesStore()
const uiStore = useUIStore()

const formData = ref({
  type: 'manwha',
  name: ''
})

const closeModal = () => {
  formData.value = { type: 'manwha', name: '' }
  uiStore.closeCategoryModal()
}

const submitForm = () => {
  if (!formData.value.name.trim()) {
    alert('Veuillez entrer un nom pour la catégorie')
    return
  }

  const success = seriesStore.addCategory(formData.value.type, formData.value.name)
  
  if (success) {
    closeModal()
  } else {
    alert('Cette catégorie existe déjà')
  }
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

.form {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.95rem;
}

.input {
  width: 100%;
  padding: 0.75rem;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid var(--border-light);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 1rem;
  transition: border-color var(--transition-fast);
}

.input:focus {
  outline: none;
  border-color: var(--accent-red);
  box-shadow: 0 0 8px rgba(233, 69, 96, 0.2);
}

.input::placeholder {
  color: var(--text-tertiary);
}

.form-footer {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-light);
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

  .form {
    padding: 1rem;
  }

  .form-footer {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>
