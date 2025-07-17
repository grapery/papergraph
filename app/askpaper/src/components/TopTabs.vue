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
  gap: 32px;
  margin-bottom: 18px;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 2px;
}
.explore-tabs button {
  background: none;
  border: none;
  font-size: 1.08rem;
  color: #374151;
  cursor: pointer;
  padding: 0 0 8px 0;
  border-bottom: 2px solid transparent;
  transition: border 0.2s, color 0.2s;
}
.explore-tabs button.active {
  color: #2563eb;
  font-weight: bold;
  border-bottom: 2px solid #2563eb;
}
</style> 