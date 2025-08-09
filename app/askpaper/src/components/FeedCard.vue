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
  background: var(--background-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  margin-bottom: var(--spacing-xl);
  padding: var(--spacing-lg);
  gap: var(--spacing-xl);
  min-height: 120px;
  transition: all var(--transition-normal);
  position: relative;
  overflow: hidden;
}

.feed-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--border-secondary), transparent);
  opacity: 0;
  transition: opacity var(--transition-normal);
}

.feed-card:hover {
  border-color: var(--border-secondary);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.feed-card:hover::before {
  opacity: 1;
}

.feed-card-img {
  flex-shrink: 0;
  width: 120px;
  height: 100px;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--background-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.feed-card-img::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--gradient-subtle);
  opacity: 0.1;
  transition: opacity var(--transition-normal);
}

.feed-card:hover .feed-card-img::before {
  opacity: 0.2;
}

.feed-card-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-normal);
}

.feed-card:hover .feed-card-img img {
  transform: scale(1.05);
}

.feed-card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.feed-card-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-sm);
  color: var(--text-primary);
  transition: color var(--transition-normal);
  line-height: var(--line-height-tight);
}

.feed-card:hover .feed-card-title {
  color: var(--brand-primary);
}

.feed-card-summary {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  margin-bottom: var(--spacing-md);
  line-height: var(--line-height-relaxed);
}

.view-btn {
  width: 120px;
  background: var(--brand-primary);
  color: var(--text-inverse);
  border: 1px solid var(--brand-primary);
  border-radius: var(--radius-md);
  padding: var(--spacing-sm) 0;
  font-size: var(--font-size-base);
  cursor: pointer;
  transition: all var(--transition-normal);
  font-weight: var(--font-weight-medium);
  box-shadow: var(--shadow-sm);
}

.view-btn:hover {
  background: var(--brand-hover);
  border-color: var(--brand-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.view-btn:active {
  transform: translateY(0);
  box-shadow: var(--shadow-sm);
}

@media (max-width: 768px) {
  .feed-card {
    flex-direction: column;
    padding: var(--spacing-md);
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-lg);
  }
  
  .feed-card-img {
    width: 100%;
    height: 160px;
  }
  
  .feed-card-content {
    width: 100%;
  }
  
  .feed-card-title {
    font-size: var(--font-size-base);
  }
  
  .feed-card-summary {
    font-size: var(--font-size-sm);
    margin-bottom: var(--spacing-sm);
  }
  
  .view-btn {
    width: 100%;
    padding: var(--spacing-sm) 0;
    font-size: var(--font-size-sm);
  }
}

@media (max-width: 480px) {
  .feed-card {
    padding: var(--spacing-sm);
    gap: var(--spacing-sm);
  }
  
  .feed-card-img {
    height: 140px;
  }
  
  .feed-card-title {
    font-size: var(--font-size-sm);
  }
  
  .feed-card-summary {
    font-size: var(--font-size-xs);
  }
}
</style> 