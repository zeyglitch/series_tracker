<template>
  <nav class="tabs">
    <button 
      v-for="tab in tabs"
      :key="tab"
      @click="selectTab(tab)"
      :class="['tab', { active: activeTab === tab }]"
    >
      {{ tabLabels[tab] }}
    </button>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useUIStore } from '../stores/uiStore'

const uiStore = useUIStore()

const tabs = ['manwha', 'manga', 'anime', 'novel']
const tabLabels = {
  manwha: '📕 Manwha',
  manga: '📗 Manga',
  anime: '📙 Anime',
  novel: '📚 Novel'
}

const activeTab = computed(() => uiStore.activeTab)

const selectTab = (tab) => {
  uiStore.setActiveTab(tab)
}
</script>

<style scoped>
.tabs {
  display: flex;
  gap: 0.5rem;
  border-top: 1px solid var(--border-light);
  padding-top: 0.75rem;
  overflow-x: auto;
  flex-wrap: wrap;
}

.tab {
  padding: 0.75rem 1.5rem;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-weight: 600;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: all var(--transition-base);
  white-space: nowrap;
  font-size: 0.95rem;
}

.tab:hover {
  color: var(--text-primary);
  border-bottom-color: var(--accent-red);
}

.tab.active {
  color: var(--text-primary);
  border-bottom-color: var(--accent-red);
}

@media (max-width: 768px) {
  .tabs {
    gap: 0.2rem;
    flex-wrap: nowrap;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .tab {
    padding: 0.55rem 0.85rem;
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .tabs {
    gap: 0.25rem;
    padding-top: 0.55rem;
  }

  .tab {
    padding: 0.5rem 0.75rem;
    font-size: 0.74rem;
  }
}
</style>
