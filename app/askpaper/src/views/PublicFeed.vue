<template>
  <div class="explore-page">
    <!-- 标题与副标题 -->
    <div class="explore-header">
      <h1 class="explore-title">Explore Analyses</h1>
      <div class="explore-desc">Discover insights from the community's paper analyses.</div>
    </div>
    <!-- 搜索框 -->
    <div class="search-bar">
      <input class="search-input" type="text" placeholder="Search analyses by title, author, or keywords" v-model="searchText" />
    </div>
    <!-- Tab 切换 -->
    <div class="explore-tabs">
      <div
        v-for="tab in tabs"
        :key="tab.key"
        :class="['tab-item', { active: activeTab === tab.key }]"
        @click="activeTab = tab.key"
      >
        <span class="tab-icon">{{ tab.icon }}</span>
        <span>{{ tab.label }}</span>
      </div>
    </div>
    <div class="tab-divider"></div>
    <!-- 分析卡片列表 -->
    <div v-if="feedList.length === 0" class="empty">暂无公开分析</div>
    <div v-else class="feed-list">
      <EnhancedFeedCard 
        v-for="item in feedList" 
        :key="item.id" 
        :item="item"
        @reaction-updated="handleReactionUpdated"
      />
    </div>
  </div>
</template>
<script setup>
// 声明类型
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import EnhancedFeedCard from '../components/EnhancedFeedCard.vue'

const router = useRouter()
// Tab 配置
const tabs = [
  { key: 'latest', label: 'Latest', icon: '🕒' },
  { key: 'liked', label: 'Most Liked', icon: '👍' },
  { key: 'suggested', label: 'Most Suggested', icon: '💡' }
]
const activeTab = ref('latest')
const searchText = ref('')
// 静态模拟数据，后续可替换为接口数据
const allFeeds = [
  {
    id: 1,
    title: 'Advancements in Quantum Computing',
    summary: 'This paper explores recent breakthroughs in quantum computing, focusing on new qubit designs and error correction techniques. The analysis highlights the potential impact on various fields, including cryptography and materials science.',
    image: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80',
    user_name: 'Dr. Alice Chen',
    like_count: 42,
    comment_count: 8,
    reaction_counts: {
      like: 42,
      agree: 15,
      disagree: 3,
      biased: 1,
      share: 12
    }
  },
  {
    id: 2,
    title: 'The Role of AI in Climate Change Mitigation',
    summary: 'An in-depth analysis of how artificial intelligence can be applied to address climate change, covering areas such as renewable energy optimization, carbon capture, and climate modeling.',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
    user_name: 'Prof. Bob Smith',
    like_count: 28,
    comment_count: 5,
    reaction_counts: {
      like: 28,
      agree: 18,
      disagree: 2,
      biased: 0,
      share: 8
    }
  },
  {
    id: 3,
    title: 'Exploring the Human Microbiome',
    summary: 'This analysis delves into a study on the human microbiome, examining its composition, functions, and influence on health and disease. Key findings and implications for personalized medicine are discussed.',
    image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80',
    user_name: 'Dr. Carol Johnson',
    like_count: 35,
    comment_count: 12,
    reaction_counts: {
      like: 35,
      agree: 22,
      disagree: 1,
      biased: 0,
      share: 15
    }
  },
  {
    id: 4,
    title: 'The Future of Space Exploration',
    summary: 'A comprehensive analysis of current and future space exploration missions, including advancements in propulsion systems, habitat design, and the search for extraterrestrial life.',
    image: 'https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=400&q=80',
    user_name: 'Dr. David Wilson',
    like_count: 51,
    comment_count: 6,
    reaction_counts: {
      like: 51,
      agree: 31,
      disagree: 4,
      biased: 2,
      share: 20
    }
  },
  {
    id: 5,
    title: 'Innovations in Sustainable Agriculture',
    summary: 'This paper analysis focuses on sustainable agriculture practices, exploring new technologies and methods for improving crop yields while minimizing environmental impact.',
    image: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=400&q=80',
    user_name: 'Dr. Emma Brown',
    like_count: 19,
    comment_count: 3,
    reaction_counts: {
      like: 19,
      agree: 12,
      disagree: 1,
      biased: 0,
      share: 5
    }
  }
]
// 根据 tab 和搜索过滤数据
const feedList = computed(() => {
  // 可根据 activeTab 返回不同排序/筛选，这里只做搜索过滤
  if (!searchText.value) return allFeeds
  return allFeeds.filter(item =>
    item.title.toLowerCase().includes(searchText.value.toLowerCase()) ||
    item.summary.toLowerCase().includes(searchText.value.toLowerCase())
  )
})

/**
 * 跳转到分析详情页
 * @param {number} taskId 任务ID
 */
function viewAnalysis(taskId) {
  router.push(`/paper-report/${taskId}`)
}

/**
 * 处理评价更新事件
 * @param {Object} data 评价数据
 */
function handleReactionUpdated(data) {
  console.log('Reaction updated:', data)
  // 这里可以添加实际的评价更新逻辑
}
</script>
<style scoped>
.explore-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 36px 0 0 0;
}
.explore-header {
  margin-bottom: 18px;
}
.explore-title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 6px;
  color: #222;
}
.explore-desc {
  color: #6b7280;
  font-size: 1.08rem;
  margin-bottom: 18px;
}
.search-bar {
  margin-bottom: 18px;
}
.search-input {
  width: 100%;
  padding: 14px 20px;
  border: none;
  border-radius: 16px;
  background: #e9eef6;
  font-size: 1.08rem;
  outline: none;
  color: #222;
  box-sizing: border-box;
}
.explore-tabs {
  display: flex;
  gap: 32px;
  align-items: center;
  margin-bottom: 0;
  padding-left: 2px;
}
.tab-item {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 1.08rem;
  color: #6b7280;
  font-weight: 500;
  cursor: pointer;
  padding: 0 2px 8px 2px;
  border-bottom: 2.5px solid transparent;
  transition: color 0.2s, border-color 0.2s;
}
.tab-item.active {
  color: #222;
  border-bottom: 2.5px solid #2563eb;
  font-weight: 700;
}
.tab-icon {
  font-size: 1.18rem;
}
.tab-divider {
  height: 1px;
  background: #e5e7eb;
  margin: 0 0 18px 0;
}
.feed-list {
  display: flex;
  flex-direction: column;
  gap: 28px;
}
.feed-card {
  display: flex;
  align-items: stretch;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 2px 8px 0 #f3f4f6;
  padding: 28px 32px;
  gap: 28px;
  min-height: 120px;
}
.feed-card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.feed-card-title {
  font-size: 1.13rem;
  font-weight: bold;
  margin-bottom: 8px;
  color: #222;
}
.feed-card-summary {
  color: #6b7280;
  font-size: 1.01rem;
  margin-bottom: 18px;
}
.view-btn {
  width: 140px;
  background: #f3f4f6;
  color: #222;
  border: none;
  border-radius: 8px;
  padding: 10px 0;
  font-size: 1rem;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
}
.view-btn:hover {
  background: #e5e7eb;
}
.feed-card-img {
  flex-shrink: 0;
  width: 120px;
  height: 100px;
  border-radius: 16px;
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
  border-radius: 16px;
}
.empty {
  color: #888;
  text-align: center;
  margin: 48px 0;
}
</style> 