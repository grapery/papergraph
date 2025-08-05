<template>
  <div class="explore-page container">
    <!-- 标题与副标题 -->
    <div class="explore-header">
      <h1 class="explore-title">Explore Analyses</h1>
      <p class="explore-desc">Discover insights from the community's paper analyses.</p>
    </div>
    
    <!-- 搜索框 -->
    <div class="search-bar">
      <div class="search-input-wrapper">
        <span class="search-icon">🔍</span>
        <input 
          class="search-input" 
          type="text" 
          placeholder="Search analyses by title, author, or keywords" 
          v-model="searchText"
          @input="handleSearchInput"
        />
        <button 
          v-if="searchText" 
          class="search-clear-btn" 
          @click="clearSearch"
          title="Clear search"
        >
          ✕
        </button>
      </div>
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
    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <p class="loading-text">正在加载分析...</p>
    </div>
    <div v-else-if="error" class="error-state">
      <div class="error-icon">❌</div>
      <h3 class="error-title">加载失败</h3>
      <p class="error-desc">{{ error }}</p>
      <button class="retry-btn" @click="retryLoad">重试</button>
    </div>
    <div v-else-if="feedList.length === 0" class="empty-state">
      <div class="empty-icon">📄</div>
      <h3 class="empty-title">暂无公开分析</h3>
      <p class="empty-desc">成为第一个分享分析的用户吧！</p>
    </div>
    <div v-else class="feed-list">
      <EnhancedFeedCard 
        v-for="item in feedList" 
        :key="item.id" 
        :item="item"
        @reaction-updated="handleReactionUpdated"
        class="fade-in"
      />
    </div>
  </div>
</template>
<script setup>
// 声明类型
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import EnhancedFeedCard from '../components/EnhancedFeedCard.vue'

const router = useRouter()

// 组件挂载时加载数据
onMounted(() => {
  loadData()
})

// Tab 配置
const tabs = [
  { key: 'latest', label: 'Latest', icon: '🕒' },
  { key: 'liked', label: 'Most Liked', icon: '👍' },
  { key: 'suggested', label: 'Most Suggested', icon: '💡' }
]
const activeTab = ref('latest')
const searchText = ref('')
const searchTimeout = ref(null)
const isLoading = ref(false)
const error = ref(null)
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
  let filteredFeeds = allFeeds
  
  // 搜索过滤
  if (searchText.value.trim()) {
    const searchLower = searchText.value.toLowerCase()
    filteredFeeds = filteredFeeds.filter(item =>
      item.title.toLowerCase().includes(searchLower) ||
      item.summary.toLowerCase().includes(searchLower) ||
      item.user_name.toLowerCase().includes(searchLower)
    )
  }
  
  // 根据 tab 排序
  switch (activeTab.value) {
    case 'liked':
      return [...filteredFeeds].sort((a, b) => (b.like_count || 0) - (a.like_count || 0))
    case 'suggested':
      return [...filteredFeeds].sort((a, b) => {
        const aScore = (a.reaction_counts?.agree || 0) - (a.reaction_counts?.disagree || 0)
        const bScore = (b.reaction_counts?.agree || 0) - (b.reaction_counts?.disagree || 0)
        return bScore - aScore
      })
    default:
      return filteredFeeds
  }
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

/**
 * 处理搜索输入（带防抖）
 */
function handleSearchInput() {
  // 防抖处理
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }
  
  searchTimeout.value = setTimeout(() => {
    // 搜索逻辑已在 computed feedList 中处理
    console.log('Searching for:', searchText.value)
  }, 300)
}

/**
 * 清除搜索
 */
function clearSearch() {
  searchText.value = ''
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }
}

/**
 * 模拟加载数据
 */
async function loadData() {
  isLoading.value = true
  error.value = null
  
  try {
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 这里可以替换为真实的API调用
    // const response = await fetch('/api/analyses')
    // const data = await response.json()
    
    // 目前使用静态数据，所以不需要额外处理
    console.log('Data loaded successfully')
  } catch (err) {
    error.value = '网络错误，请稍后重试'
    console.error('Failed to load data:', err)
  } finally {
    isLoading.value = false
  }
}

/**
 * 重试加载
 */
function retryLoad() {
  loadData()
}
</script>
<style scoped>
.explore-page {
  padding: 2rem 0;
  max-width: 1000px;
  margin: 0 auto;
}

.explore-header {
  text-align: center;
  margin-bottom: 2rem;
}

.explore-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.explore-desc {
  font-size: 1.125rem;
  color: #6b7280;
  max-width: 600px;
  margin: 0 auto;
}

.search-bar {
  margin-bottom: 2rem;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 1rem;
  color: #9ca3af;
  font-size: 1.1rem;
  z-index: 2;
}

.search-input {
  width: 100%;
  padding: 1rem 1.5rem 1rem 3rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  background: #fff;
  font-size: 1rem;
  color: #1f2937;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.search-clear-btn {
  position: absolute;
  right: 1rem;
  background: none;
  border: none;
  color: #9ca3af;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  z-index: 2;
}

.search-clear-btn:hover {
  background: #f3f4f6;
  color: #6b7280;
}

.explore-tabs {
  display: flex;
  gap: 2rem;
  align-items: center;
  margin-bottom: 0;
  padding-left: 0.5rem;
  border-bottom: 2px solid #f3f4f6;
}

.tab-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  color: #6b7280;
  font-weight: 500;
  cursor: pointer;
  padding: 0.75rem 0;
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.tab-item:hover {
  color: #374151;
}

.tab-item.active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
  font-weight: 600;
}

.tab-icon {
  font-size: 1.25rem;
}

.tab-divider {
  height: 1px;
  background: #e5e7eb;
  margin: 0 0 2rem 0;
}

.feed-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.empty-desc {
  font-size: 1rem;
  color: #6b7280;
}

.loading-state {
  text-align: center;
  padding: 4rem 2rem;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

.loading-text {
  color: #6b7280;
  font-size: 1rem;
  margin: 0;
}

.error-state {
  text-align: center;
  padding: 4rem 2rem;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.error-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #dc2626;
  margin-bottom: 0.5rem;
}

.error-desc {
  font-size: 1rem;
  color: #6b7280;
  margin-bottom: 1.5rem;
}

.retry-btn {
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.retry-btn:hover {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

@media (max-width: 768px) {
  .explore-page {
    padding: 1rem 0;
  }
  
  .explore-title {
    font-size: 2rem;
  }
  
  .explore-desc {
    font-size: 1rem;
  }
  
  .search-bar {
    margin-bottom: 1.5rem;
  }
  
  .search-input {
    padding: 0.75rem 1rem 0.75rem 2.5rem;
    font-size: 0.875rem;
  }
  
  .search-icon {
    left: 0.75rem;
    font-size: 1rem;
  }
  
  .search-clear-btn {
    right: 0.75rem;
    width: 24px;
    height: 24px;
    font-size: 1rem;
  }
  
  .explore-tabs {
    gap: 1rem;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    padding-bottom: 0.5rem;
  }
  
  .tab-item {
    font-size: 0.875rem;
    padding: 0.5rem 0;
  }
  
  .tab-icon {
    font-size: 1rem;
  }
  
  .feed-list {
    gap: 1rem;
  }
  
  .empty-state {
    padding: 3rem 1.5rem;
  }
  
  .empty-icon {
    font-size: 3rem;
  }
  
  .empty-title {
    font-size: 1.25rem;
  }
  
  .loading-state, .error-state {
    padding: 3rem 1.5rem;
  }
  
  .loading-spinner {
    width: 32px;
    height: 32px;
    border-width: 3px;
  }
  
  .loading-text, .error-desc {
    font-size: 0.875rem;
  }
  
  .error-title {
    font-size: 1.25rem;
  }
  
  .error-icon {
    font-size: 2.5rem;
  }
  
  .retry-btn {
    padding: 0.5rem 1rem;
    font-size: 0.75rem;
  }
}

@media (max-width: 480px) {
  .explore-header {
    margin-bottom: 1.5rem;
  }
  
  .explore-title {
    font-size: 1.75rem;
  }
  
  .explore-desc {
    font-size: 0.875rem;
  }
  
  .explore-tabs {
    gap: 0.75rem;
  }
  
  .tab-item {
    font-size: 0.8125rem;
    gap: 0.25rem;
  }
  
  .feed-list {
    gap: 0.75rem;
  }
}
</style> 