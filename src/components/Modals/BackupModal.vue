<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="uiStore.showBackupModal" class="modal-overlay" @click.self="close">
        <div class="modal-box">
          <div class="modal-header">
            <h2><i class="fas fa-database"></i> Sauvegarde</h2>
            <button class="close-btn" @click="close">×</button>
          </div>

          <div class="stats-row">
            <div class="stat">
              <span class="stat-value">{{ seriesStore.totalCount }}</span>
              <span class="stat-label">séries au total</span>
            </div>
          </div>

          <div class="backup-actions">
            <button v-if="canShare" class="backup-btn share" @click="shareData">
              <i class="fas fa-share-nodes"></i> Partager la sauvegarde
            </button>
            <button class="backup-btn export" @click="exportData">
              <i class="fas fa-download"></i> Télécharger (JSON)
            </button>
            <button class="backup-btn import" @click="triggerImport">
              <i class="fas fa-upload"></i> Importer (JSON / CSV)
            </button>
            <input type="file" ref="fileInput" accept=".json,.csv" @change="handleImport" style="display:none" />
          </div>

          <p v-if="statusMsg" class="status-msg" :class="statusType">{{ statusMsg }}</p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'
import { useSeriesStore } from '../../stores/seriesStore'
import { useUIStore } from '../../stores/uiStore'

const seriesStore = useSeriesStore()
const uiStore = useUIStore()

const fileInput = ref(null)
const statusMsg = ref('')
const statusType = ref('success')

const canShare = !!navigator.share

const close = () => { uiStore.showBackupModal = false; statusMsg.value = '' }

const shareData = async () => {
  const data = seriesStore.exportData()
  // Utiliser .txt car iOS/Android bloquent souvent le partage de fichiers .json pour des raisons de sécurité
  const file = new File([data], `series-tracker-${new Date().toISOString().slice(0, 10)}.txt`, { type: 'text/plain' })
  
  if (navigator.share) {
    try {
      const sharePayload = {
        title: 'Sauvegarde Series Tracker',
        files: [file]
      }

      // Vérifier si le navigateur autorise spécifiquement le partage de ce fichier
      if (navigator.canShare && !navigator.canShare(sharePayload)) {
        statusMsg.value = 'Partage de fichier non supporté par ce navigateur.'
        statusType.value = 'error'
        return
      }

      await navigator.share(sharePayload)
      statusMsg.value = 'Partage réussi !'
      statusType.value = 'success'
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error(err)
        statusMsg.value = `Erreur du téléphone: ${err.message || 'partage bloqué'}`
        statusType.value = 'error'
      }
    }
  }
}

const exportData = () => {
  const data = seriesStore.exportData()
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `series-tracker-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
  statusMsg.value = 'Données exportées avec succès !'
  statusType.value = 'success'
}

const triggerImport = () => {
  fileInput.value?.click()
}

const handleImport = (e) => {
  const file = e.target.files?.[0]
  if (!file) return

  const isCsv = file.name.toLowerCase().endsWith('.csv')

  const reader = new FileReader()
  reader.onload = (ev) => {
    if (!confirm('Voulez-vous vraiment importer ces données ? Cela écrasera vos données actuelles.')) {
      e.target.value = ''
      return
    }
    
    const result = isCsv 
      ? seriesStore.importCsvData(ev.target.result) 
      : seriesStore.importData(ev.target.result)

    if (result.success) {
      statusMsg.value = isCsv 
        ? `Données importées avec succès (${result.count} séries) !` 
        : 'Données importées avec succès !'
      statusType.value = 'success'
      uiStore.showToast('Données importées !')
    } else {
      statusMsg.value = `Erreur: ${result.error}`
      statusType.value = 'error'
    }
  }
  reader.readAsText(file)
  // Reset so same file can be imported again
  e.target.value = ''
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
  padding: 24px; width: 100%; max-width: 420px;
  box-shadow: var(--shadow-lg);
  animation: scaleIn 0.25s ease;
}

.modal-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 20px; padding-bottom: 12px;
  border-bottom: 1px solid var(--border-light);
}
.modal-header h2 {
  font-size: 1.15rem; font-weight: 700; color: var(--text-primary);
  display: flex; align-items: center; gap: 8px;
}

.close-btn {
  width: 32px; height: 32px; border-radius: var(--radius-sm);
  border: none; background: transparent; font-size: 1.3rem;
  cursor: pointer; color: var(--text-tertiary); transition: all var(--transition-fast);
}
.close-btn:hover { background: var(--border-light); color: var(--text-primary); }

.stats-row {
  display: flex; justify-content: center; margin-bottom: 20px;
}

.stat {
  text-align: center; padding: 12px 24px;
  background: var(--bg-input); border-radius: var(--radius-md);
}
.stat-value {
  display: block; font-size: 1.8rem; font-weight: 800;
  background: linear-gradient(135deg, var(--primary), var(--accent));
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text;
}
.stat-label { font-size: 0.82rem; color: var(--text-tertiary); }

.backup-actions {
  display: flex; flex-direction: column; gap: 10px;
}

.backup-btn {
  width: 100%; padding: 12px; border: none; border-radius: var(--radius-md);
  font-family: inherit; font-size: 0.95rem; font-weight: 700;
  cursor: pointer; transition: all var(--transition-base);
  display: flex; align-items: center; justify-content: center; gap: 8px;
}

.backup-btn.export {
  background: linear-gradient(135deg, var(--primary), var(--accent));
  color: white;
}
.backup-btn.export:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(124,58,237,0.35); }

.backup-btn.share {
  background: var(--bg-surface);
  color: var(--primary-light);
  border: 1px solid var(--primary);
}
.backup-btn.share:hover { background: rgba(124,58,237,0.1); transform: translateY(-1px); }

.backup-btn.import {
  background: var(--bg-input);
  color: var(--text-primary);
  border: 1px solid var(--border-medium);
}
.backup-btn.import:hover { background: var(--border-light); transform: translateY(-1px); }

.status-msg {
  margin-top: 14px; padding: 10px; border-radius: var(--radius-md);
  font-size: 0.88rem; font-weight: 600; text-align: center;
}
.status-msg.success { background: var(--status-finished-bg); color: var(--status-finished); }
.status-msg.error { background: var(--status-dropped-bg); color: var(--status-dropped); }

.modal-enter-active { transition: opacity 0.2s ease; }
.modal-leave-active { transition: opacity 0.15s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
