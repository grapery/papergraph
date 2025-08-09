<template>
  <div class="explore-tabs">
    <button
      v-for="tab in tabs"
      :key="tab.name"
      :class="{ active: tab.name === activeTab }"
      @click="$emit('update:activeTab', tab.name)"
    >{{ tab.label }}</button>
  </div>
</template>
<script setup>
// 声明类型
import { defineProps, defineEmits } from 'vue'
const props = defineProps({
  activeTab: {
    type: String,
    required: true
  }
})
const emit = defineEmits(['update:activeTab'])
// Tab 配置
const tabs = [
  { name: 'latest', label: 'Latest' },
  { name: 'liked', label: 'Most Liked' },
  { name: 'suggested', label: 'Most Suggested' }
]
</script>
<style scoped>
.explore-tabs {
  display: flex;
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-lg);
  border-bottom: 1px solid var(--border-primary);
  padding-bottom: var(--spacing-xs);
  position: relative;
  align-items: center;
}

.explore-tabs::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--border-secondary), transparent);
  opacity: 0;
  transition: opacity var(--transition-normal);
}

.explore-tabs:hover::before {
  opacity: 1;
}

.explore-tabs button {
  background: none;
  border: none;
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  cursor: pointer;
  padding: var(--spacing-md) 0 var(--spacing-sm) 0;
  border-bottom: 2px solid transparent;
  transition: all var(--transition-normal);
  font-weight: var(--font-weight-normal);
  position: relative;
  outline: none;
  white-space: nowrap;
}

.explore-tabs button:hover {
  color: var(--text-primary);
}

.explore-tabs button.active {
  color: var(--brand-primary);
  font-weight: var(--font-weight-medium);
  border-bottom: 2px solid var(--brand-primary);
}

.explore-tabs button:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
  border-radius: var(--radius-sm);
}

@media (max-width: 768px) {
  .explore-tabs {
    gap: var(--spacing-lg);
    margin-bottom: var(--spacing-md);
    padding-bottom: var(--spacing-xs);
  }
  
  .explore-tabs button {
    font-size: var(--font-size-sm);
    padding: var(--spacing-sm) 0 var(--spacing-xs) 0;
  }
}

@media (max-width: 480px) {
  .explore-tabs {
    gap: var(--spacing-md);
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    padding-bottom: var(--spacing-xs);
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  
  .explore-tabs::-webkit-scrollbar {
    display: none;
  }
  
  .explore-tabs button {
    font-size: var(--font-size-sm);
    white-space: nowrap;
    padding: var(--spacing-xs) var(--spacing-sm);
  }
}
</style> 