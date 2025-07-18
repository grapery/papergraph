<template>
  <div class="feed-card">
    <!-- 分析图片 -->
    <div class="feed-card-img">
      <img :src="item.image" alt="analysis cover" />
    </div>
    <!-- 分析内容 -->
    <div class="feed-card-content">
      <h3 class="feed-card-title">{{ item.title }}</h3>
      <p class="feed-card-summary">{{ item.summary }}</p>
      <!-- 跳转按钮 -->
      <button class="view-btn" @click="viewAnalysis">View Analysis</button>
    </div>
  </div>
</template>
<script setup>
// 声明类型
import { useRouter } from 'vue-router'
const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})
const router = useRouter()
/**
 * 跳转到分析详情页，携带任务ID
 */
function viewAnalysis() {
  // 假设 item.id 为任务ID
  router.push({ path: `/paper-report/${props.item.id}` })
}
</script>
<style scoped>
.feed-card {
  display: flex;
  align-items: flex-start;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px 0 #f3f4f6;
  margin-bottom: 28px;
  padding: 18px 20px;
  gap: 28px;
  min-height: 120px;
}
.feed-card-img {
  flex-shrink: 0;
  width: 120px;
  height: 100px;
  border-radius: 10px;
  overflow: hidden;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
}
.feed-card-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.feed-card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.feed-card-title {
  font-size: 1.1rem;
  font-weight: bold;
  margin-bottom: 8px;
  color: #222;
}
.feed-card-summary {
  color: #6b7280;
  font-size: 0.98rem;
  margin-bottom: 16px;
}
.view-btn {
  width: 120px;
  background: #2563eb;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 8px 0;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}
.view-btn:hover {
  background: #1d4ed8;
}
</style> 