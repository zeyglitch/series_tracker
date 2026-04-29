<template>
  <Teleport to="body">
    <div v-if="uiStore.showSeriesModal" class="modal-backdrop" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ isEdit ? 'Éditer la série' : 'Ajouter une série' }}</h2>
          <button @click="closeModal" class="btn-close">×</button>
        </div>
        
        <form @submit.prevent="submitForm" class="form">
          <div class="form-group">
            <label for="series-type">Type:</label>
            <select v-model="formData.type" id="series-type" class="input" required>
              <option value="manwha">Manwha</option>
              <option value="manga">Manga</option>
              <option value="anime">Anime</option>
              <option value="novel">Novel</option>
            </select>
          </div>

          <div class="form-group">
            <label for="series-category">Catégorie:</label>
            <select v-model="formData.categoryId" id="series-category" class="input" required>
              <option value="">-- Sélectionner une catégorie --</option>
              <option v-for="cat in availableCategories" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="series-name">Nom de la série:</label>
            <input 
              v-model="formData.name"
              id="series-name"
              type="text"
              class="input"
              required
            >
          </div>

          <div class="comick-box">
            <div class="comick-header">
              <div>
                <label class="comick-label">Recherche Comick</label>
                <p class="comick-hint">Cherche une source, puis clique un résultat pour remplir le nom et le lien.</p>
              </div>
              <button
                type="button"
                class="btn btn-secondary btn-small"
                @click="searchComick"
                :disabled="isSearchingComick || !comickService.isConfigured()"
              >
                {{ isSearchingComick ? 'Recherche...' : 'Rechercher' }}
              </button>
            </div>

            <div class="comick-search-row">
              <input
                v-model="comickQuery"
                type="text"
                class="input"
                placeholder="Titre à chercher sur Comick"
                @keyup.enter="searchComick"
              >
            </div>

            <p v-if="comickSearchError" class="comick-error">{{ comickSearchError }}</p>
            <p v-else-if="!comickService.isConfigured()" class="comick-muted">
              Configure `VITE_COMICK_API_BASE_URL` pour activer la recherche automatique.
            </p>

            <div v-if="comickResults.length > 0" class="comick-results">
              <button
                v-for="result in comickResults"
                :key="result.key"
                type="button"
                class="comick-result"
                @click="applyComickResult(result)"
              >
                <div class="comick-result-main">
                  <strong>{{ result.title }}</strong>
                  <span v-if="result.description">{{ result.description }}</span>
                </div>
                <span class="comick-result-action">Utiliser</span>
              </button>
            </div>
          </div>

          <div class="form-group">
            <label for="series-status">Statut:</label>
            <select v-model="formData.status" id="series-status" class="input">
              <option value="ongoing">En cours</option>
              <option value="todo">À lire</option>
              <option value="finished">Terminé</option>
              <option value="dropped">Abandonné</option>
            </select>
          </div>

          <!-- Compteurs -->
          <div class="form-group">
            <label>Progression:</label>
            <div class="counters-section">
              <div class="counter-input-group">
                <label for="counter1-type">Type 1:</label>
                <select v-model="formData.counter1Type" id="counter1-type" class="input">
                  <option value="chapters">Chapitres</option>
                  <option value="seasons">Saisons</option>
                  <option value="volumes">Volumes</option>
                </select>
              </div>
              <div class="counter-input-group">
                <label for="counter1-value">Valeur:</label>
                <input 
                  v-model.number="formData.counter1Value"
                  id="counter1-value"
                  type="number"
                  min="0"
                  class="input"
                >
              </div>

              <div v-if="hasCounter2" class="counter-input-group">
                <label for="counter2-type">Type 2:</label>
                <select v-model="formData.counter2Type" id="counter2-type" class="input">
                  <option value="episodes">Épisodes</option>
                  <option value="chapters">Chapitres</option>
                </select>
              </div>
              <div v-if="hasCounter2" class="counter-input-group">
                <label for="counter2-value">Valeur 2:</label>
                <input 
                  v-model.number="formData.counter2Value"
                  id="counter2-value"
                  type="number"
                  min="0"
                  class="input"
                >
              </div>
            </div>
          </div>

          <!-- Lien source -->
          <div class="form-group">
            <label for="series-source">Lien source (optionnel):</label>
            <input 
              v-model="formData.sourceUrl"
              id="series-source"
              type="url"
              class="input"
              placeholder="https://..."
            >
          </div>

          <!-- Tags -->
          <div class="form-group">
            <label for="series-tags">Tags (séparés par des virgules):</label>
            <input 
              v-model="formData.tagsString"
              id="series-tags"
              type="text"
              class="input"
              placeholder="Ex: romantique, slice of life, fantasy"
            >
          </div>

          <!-- Notes -->
          <div class="form-group">
            <label for="series-notes">Notes:</label>
            <textarea 
              v-model="formData.notes"
              id="series-notes"
              class="input textarea"
              placeholder="Vos notes personnelles..."
              rows="3"
            ></textarea>
          </div>

          <div class="form-footer">
            <button type="button" @click="closeModal" class="btn btn-secondary">
              Annuler
            </button>
            <button type="submit" class="btn btn-primary">
              {{ isEdit ? 'Modifier' : 'Ajouter' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useSeriesStore } from '../../stores/seriesStore'
import { useUIStore } from '../../stores/uiStore'
import { comickService } from '../../services/comickService'

const seriesStore = useSeriesStore()
const uiStore = useUIStore()

const formData = ref({
  type: 'manwha',
  categoryId: '',
  name: '',
  status: 'ongoing',
  counter1Type: 'chapters',
  counter1Value: 0,
  counter2Type: 'episodes',
  counter2Value: 0,
  sourceUrl: '',
  tagsString: '',
  notes: ''
})

const comickQuery = ref('')
const comickResults = ref([])
const isSearchingComick = ref(false)
const comickSearchError = ref('')

const isEdit = computed(() => uiStore.currentFormState.type === 'edit')

const availableCategories = computed(() => {
  return seriesStore.getCategoriesByType(formData.value.type)
})

const hasCounter2 = computed(() => {
  return ['seasons', 'volumes'].includes(formData.value.counter1Type)
})

const normalizeComickResult = (result, index) => {
  const title = result?.title || result?.name || result?.original_title || result?.slug || 'Titre inconnu'
  const sourceUrl = result?.url || result?.link || result?.href || (result?.slug ? `https://comick.io/comic/${result.slug}` : '')
  const description = result?.description || result?.summary || result?.desc || ''

  return {
    key: result?.id || result?.slug || `${title}-${index}`,
    title,
    sourceUrl,
    description,
    raw: result
  }
}

const applyComickResult = (result) => {
  formData.value.name = result.title || formData.value.name
  formData.value.sourceUrl = result.sourceUrl || formData.value.sourceUrl

  const tags = result.raw?.genres || result.raw?.tags || []
  if (Array.isArray(tags) && tags.length > 0) {
    const cleanedTags = tags
      .map(tag => typeof tag === 'string' ? tag : tag?.name)
      .filter(Boolean)

    if (cleanedTags.length > 0) {
      formData.value.tagsString = cleanedTags.join(', ')
    }
  }

  if (!formData.value.notes && result.description) {
    formData.value.notes = result.description
  }

  comickSearchError.value = ''
}

const searchComick = async () => {
  const query = comickQuery.value.trim() || formData.value.name.trim()

  if (!query) {
    comickSearchError.value = 'Entre un titre avant de lancer la recherche.'
    return
  }

  if (!comickService.isConfigured()) {
    comickSearchError.value = 'Configure VITE_COMICK_API_BASE_URL pour activer cette recherche.'
    return
  }

  isSearchingComick.value = true
  comickSearchError.value = ''

  try {
    const results = await comickService.searchSeries(query)
    comickResults.value = results.slice(0, 8).map(normalizeComickResult)

    if (comickResults.value.length === 0) {
      comickSearchError.value = 'Aucun résultat Comick trouvé pour ce titre.'
    }
  } catch (error) {
    console.error('Erreur recherche Comick:', error)
    comickSearchError.value = 'La recherche Comick a échoué. Vérifie la configuration de l’API.'
    comickResults.value = []
  } finally {
    isSearchingComick.value = false
  }
}

// Mettre à jour le type par défaut quand on change le type
watch(() => uiStore.showSeriesModal, (newVal) => {
  if (newVal) {
    const currentState = uiStore.currentFormState
    comickResults.value = []
    comickSearchError.value = ''
    comickQuery.value = ''
    if (currentState.type === 'edit' && currentState.data) {
      // Mode édition
      formData.value = {
        type: currentState.mediaType,
        categoryId: currentState.categoryId,
        name: currentState.data.name,
        status: currentState.data.status || 'ongoing',
        counter1Type: currentState.data.counter1Type || 'chapters',
        counter1Value: currentState.data.counter1Value || 0,
        counter2Type: currentState.data.counter2Type || 'episodes',
        counter2Value: currentState.data.counter2Value || 0,
        sourceUrl: currentState.data.sourceUrl || '',
        tagsString: (currentState.data.tags || []).join(', '),
        notes: currentState.data.notes || ''
      }
      comickQuery.value = currentState.data.name || ''
    } else {
      // Mode ajout
      formData.value = {
        type: currentState.mediaType || 'manwha',
        categoryId: currentState.categoryId || '',
        name: '',
        status: 'ongoing',
        counter1Type: 'chapters',
        counter1Value: 0,
        counter2Type: 'episodes',
        counter2Value: 0,
        sourceUrl: '',
        tagsString: '',
        notes: ''
      }
      comickQuery.value = ''
    }
  }
})

// Ajuster le type de compteur secondaire
watch(() => formData.value.counter1Type, (newVal) => {
  if (newVal === 'seasons') {
    formData.value.counter2Type = 'episodes'
  } else if (newVal === 'volumes') {
    formData.value.counter2Type = 'chapters'
  }
})

const closeModal = () => {
  uiStore.closeSeriesModal()
}

const submitForm = () => {
  if (!formData.value.name.trim()) {
    alert('Veuillez entrer un nom pour la série')
    return
  }

  if (!formData.value.categoryId) {
    alert('Veuillez sélectionner une catégorie')
    return
  }

  const seriesData = {
    name: formData.value.name,
    status: formData.value.status,
    counter1Type: formData.value.counter1Type,
    counter1Value: formData.value.counter1Value,
    counter2Type: hasCounter2.value ? formData.value.counter2Type : null,
    counter2Value: hasCounter2.value ? formData.value.counter2Value : null,
    sourceUrl: formData.value.sourceUrl || null,
    tags: formData.value.tagsString
      .split(',')
      .map(t => t.trim())
      .filter(t => t),
    notes: formData.value.notes
  }

  if (isEdit.value) {
    seriesStore.editSeries(
      formData.value.type,
      formData.value.categoryId,
      uiStore.currentFormState.seriesId,
      seriesData
    )
  } else {
    seriesStore.addSeries(
      formData.value.type,
      formData.value.categoryId,
      seriesData
    )
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
  overflow-y: auto;
}

.modal-content {
  background: var(--card-bg);
  border: 1px solid var(--border-accent);
  border-radius: 12px;
  max-width: 600px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  animation: slideInUp 0.3s ease-out;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-light);
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  background: var(--card-bg);
  z-index: 1;
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
  font-family: inherit;
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

.textarea {
  resize: vertical;
  min-height: 80px;
}

.counters-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.counter-input-group {
  display: flex;
  flex-direction: column;
}

.counter-input-group label {
  margin-bottom: 0.4rem;
  font-size: 0.9rem;
}

.comick-box {
  margin-bottom: 1.5rem;
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid var(--border-light);
  background: var(--surface-elevated);
}

.comick-header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-start;
  margin-bottom: 0.85rem;
}

.comick-label {
  margin: 0;
  font-weight: 700;
  color: var(--text-primary);
}

.comick-hint {
  margin-top: 0.25rem;
  color: var(--text-tertiary);
  font-size: 0.88rem;
}

.comick-search-row {
  margin-bottom: 0.75rem;
}

.comick-results {
  display: grid;
  gap: 0.65rem;
  max-height: 260px;
  overflow-y: auto;
}

.comick-result {
  width: 100%;
  border: 1px solid var(--border-light);
  border-radius: 10px;
  background: var(--card-bg);
  color: var(--text-primary);
  padding: 0.85rem;
  cursor: pointer;
  text-align: left;
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  transition: all var(--transition-fast);
}

.comick-result:hover {
  border-color: var(--border-accent);
  transform: translateY(-1px);
}

.comick-result-main {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.comick-result-main span {
  color: var(--text-tertiary);
  font-size: 0.88rem;
  line-height: 1.4;
}

.comick-result-action {
  align-self: center;
  color: var(--accent-red);
  font-weight: 700;
  white-space: nowrap;
}

.comick-error {
  margin-bottom: 0.75rem;
  color: var(--accent-red);
  font-weight: 600;
}

.comick-muted {
  margin-bottom: 0.75rem;
  color: var(--text-tertiary);
}

.btn-small {
  padding: 0.6rem 1rem;
  font-size: 0.9rem;
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
  .modal-backdrop {
    padding: 0.5rem;
  }

  .modal-content {
    max-width: 100%;
    max-height: 100vh;
  }

  .form {
    padding: 1rem;
  }

  .counters-section {
    grid-template-columns: 1fr;
  }

  .form-footer {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }

  .comick-header {
    flex-direction: column;
  }

  .comick-result {
    flex-direction: column;
  }
}
</style>
