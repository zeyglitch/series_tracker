<template>
  <nav class="tab-nav">
    <button
      v-for="tab in uiStore.tabs"
      :key="tab.id"
      :class="['tab-btn', { active: uiStore.activeTab === tab.id }]"
      @click="uiStore.setTab(tab.id)"
    >
      <i :class="['fas', tab.icon]"></i>
      <span>{{ tab.label }}</span>
    </button>
  </nav>
</template>

<script setup>
import { useUIStore } from '../stores/uiStore'
const uiStore = useUIStore()
</script>

<style scoped>
.tab-nav {
  display: flex;
  gap: 2px;
  background: var(--border-light);
  border-radius: var(--radius-md);
  padding: 3px;
  overflow-x: auto;
}

.tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 16px;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text-tertiary);
  font-family: inherit;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-base);
  white-space: nowrap;
  min-width: 0;
}

.tab-btn:hover {
  color: var(--text-secondary);
  background: var(--border-light);
}

.tab-btn.active {
  color: var(--text-on-primary);
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  box-shadow: 0 2px 8px rgba(124, 58, 237, 0.3);
}

.tab-btn i {
  font-size: 0.85rem;
}

@media (max-width: 480px) {
  .tab-btn {
    padding: 8px 10px;
    font-size: 0.82rem;
    gap: 4px;
  }

  .tab-btn i {
    font-size: 0.78rem;
  }
}
</style>
