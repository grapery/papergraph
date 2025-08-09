<template>
  <div class="explore-page">
    <!-- Hero Section -->
    <div class="hero-section">
      <div class="hero-content">
        <div class="hero-badge">
          <span class="badge-icon">🔬</span>
          <span class="badge-text">Community Insights</span>
        </div>
        <h1 class="hero-title">Explore Analyses</h1>
        <p class="hero-subtitle">Discover cutting-edge research insights from our global community of academic experts</p>
      </div>
      
      <!-- Enhanced Search -->
      <div class="search-container">
        <div class="search-wrapper">
          <div class="search-input-wrapper">
            <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <input 
              class="search-input" 
              type="text" 
              placeholder="Search by title, author, keywords..." 
              v-model="searchText"
              @input="handleSearchInput"
            />
            <button 
              v-if="searchText" 
              class="search-clear-btn" 
              @click="clearSearch"
              title="Clear search"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div class="search-suggestions" v-if="searchSuggestions.length > 0 && searchText">
            <div 
              v-for="suggestion in searchSuggestions" 
              :key="suggestion"
              class="suggestion-item"
              @click="applySuggestion(suggestion)"
            >
              {{ suggestion }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <!-- Tab Navigation -->
      <TopTabs 
        :activeTab="activeTab" 
        @update:activeTab="activeTab = $event"
      />
      
      <!-- Content Area -->
      <div class="content-area">
        <!-- Loading State -->
        <div v-if="isLoading" class="loading-container">
          <div class="loading-card">
            <div class="loading-shimmer">
              <div class="shimmer-image"></div>
              <div class="shimmer-content">
                <div class="shimmer-line shimmer-title"></div>
                <div class="shimmer-line shimmer-text"></div>
                <div class="shimmer-line shimmer-text"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="error-container">
          <div class="error-card">
            <div class="error-illustration">
              <div class="error-icon">⚠️</div>
            </div>
            <div class="error-content">
              <h3 class="error-title">Unable to Load Analyses</h3>
              <p class="error-description">{{ error }}</p>
              <div class="error-actions">
                <button class="retry-btn" @click="retryLoad">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="23 4 23 10 17 10"></polyline>
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                  </svg>
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="feedList.length === 0" class="empty-container">
          <div class="empty-card">
            <div class="empty-illustration">
              <div class="empty-icon">📚</div>
              <div class="empty-animation">
                <div class="floating-paper"></div>
                <div class="floating-paper"></div>
                <div class="floating-paper"></div>
              </div>
            </div>
            <div class="empty-content">
              <h3 class="empty-title">No Analyses Found</h3>
              <p class="empty-description">
                {{ searchText ? 'Try adjusting your search terms' : 'Be the first to share an analysis with the community!' }}
              </p>
              <div class="empty-actions">
                <button v-if="searchText" class="clear-search-btn" @click="clearSearch">
                  Clear Search
                </button>
                <button v-else class="create-analysis-btn" @click="goToUpload">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  Create Analysis
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Feed List -->
        <div v-else class="feed-grid">
          <EnhancedFeedCard 
            v-for="item in feedList" 
            :key="item.id" 
            :item="item"
            @reaction-updated="handleReactionUpdated"
            class="feed-item"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
// 声明类型
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import EnhancedFeedCard from '../components/EnhancedFeedCard.vue'
import TopTabs from '../components/TopTabs.vue'

const router = useRouter()

// 组件挂载时加载数据
onMounted(() => {
  loadData()
})

// Tab 配置 (现在使用 TopTabs 组件)
const tabs = [
  { name: 'latest', label: 'Latest' },
  { name: 'liked', label: 'Most Liked' },
  { name: 'suggested', label: 'Most Suggested' }
]

// 搜索建议
const searchSuggestions = computed(() => {
  if (!searchText.value.trim()) return []
  
  const searchLower = searchText.value.toLowerCase()
  const suggestions = new Set()
  
  allFeeds.forEach(item => {
    // 添加标题建议
    if (item.title.toLowerCase().includes(searchLower)) {
      suggestions.add(item.title)
    }
    
    // 添加作者建议
    if (item.user_name.toLowerCase().includes(searchLower)) {
      suggestions.add(`by ${item.user_name}`)
    }
    
    // 添加关键词建议
    const keywords = ['quantum computing', 'AI', 'climate change', 'machine learning', 'biotechnology', 'space exploration']
    keywords.forEach(keyword => {
      if (keyword.toLowerCase().includes(searchLower)) {
        suggestions.add(keyword)
      }
    })
  })
  
  return Array.from(suggestions).slice(0, 5)
})
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

/**
 * 应用搜索建议
 */
function applySuggestion(suggestion) {
  searchText.value = suggestion
  // 触发搜索
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }
  console.log('Applied suggestion:', suggestion)
}

/**
 * 跳转到上传页面
 */
function goToUpload() {
  router.push('/upload-analysis')
}
</script>
<style scoped>
/* Modern Expo.dev-inspired styling */
.explore-page {
  min-height: 100vh;
  background: var(--background-default);
}

/* Hero Section */
.hero-section {
  background: linear-gradient(135deg, var(--background-primary) 0%, var(--background-secondary) 100%);
  border-bottom: 1px solid var(--border-primary);
  padding: var(--spacing-2xl) 0 var(--spacing-xl) 0;
  position: relative;
  overflow: hidden;
}

.hero-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--border-secondary), transparent);
  opacity: 0.5;
}

.hero-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-xl);
  text-align: center;
  position: relative;
  z-index: 1;
}

@media (max-width: 768px) {
  .hero-content {
    padding: 0 var(--spacing-lg);
  }
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-lg);
  background: var(--brand-primary);
  color: var(--text-inverse);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  margin-bottom: var(--spacing-lg);
  box-shadow: var(--shadow-md);
  transition: all var(--transition-normal);
}

.hero-badge:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.badge-icon {
  font-size: var(--font-size-base);
}

.hero-title {
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-md) 0;
  line-height: var(--line-height-tight);
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: var(--font-size-lg);
  color: var(--text-secondary);
  margin: 0 auto;
  max-width: 600px;
  line-height: var(--line-height-relaxed);
}

/* Enhanced Search */
.search-container {
  max-width: 600px;
  margin: var(--spacing-xl) auto 0;
  padding: 0 var(--spacing-xl);
  position: relative;
  z-index: 2;
}

.search-wrapper {
  position: relative;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: var(--background-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  transition: all var(--transition-normal);
  box-shadow: var(--shadow-sm);
}

.search-input-wrapper:hover {
  border-color: var(--border-secondary);
  box-shadow: var(--shadow-md);
}

.search-input-wrapper:focus-within {
  border-color: var(--border-focus);
  box-shadow: var(--focus-ring);
  background: var(--background-primary);
}

.search-icon {
  position: absolute;
  left: var(--spacing-lg);
  color: var(--text-tertiary);
  z-index: 2;
  pointer-events: none;
  transition: color var(--transition-normal);
}

.search-input-wrapper:focus-within .search-icon {
  color: var(--brand-primary);
}

.search-input {
  width: 100%;
  padding: var(--spacing-md) var(--spacing-lg) var(--spacing-md) calc(var(--spacing-lg) + var(--spacing-xl) + var(--spacing-md));
  border: none;
  background: transparent;
  font-size: var(--font-size-base);
  color: var(--text-primary);
  outline: none;
  font-weight: var(--font-weight-normal);
}

.search-input::placeholder {
  color: var(--text-tertiary);
}

.search-clear-btn {
  position: absolute;
  right: var(--spacing-md);
  background: var(--background-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  color: var(--text-tertiary);
  cursor: pointer;
  padding: var(--spacing-xs);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-normal);
  z-index: 2;
}

.search-clear-btn:hover {
  background: var(--background-tertiary);
  border-color: var(--border-secondary);
  color: var(--text-secondary);
  transform: scale(1.05);
}

/* Search Suggestions */
.search-suggestions {
  position: absolute;
  top: calc(100% + var(--spacing-xs));
  left: 0;
  right: 0;
  background: var(--background-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  z-index: var(--z-dropdown);
  max-height: 200px;
  overflow-y: auto;
  animation: slideDown 0.2s ease-out;
}

.suggestion-item {
  padding: var(--spacing-md) var(--spacing-lg);
  cursor: pointer;
  transition: all var(--transition-normal);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  border-bottom: 1px solid var(--border-primary);
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-item:hover {
  background: var(--background-secondary);
  color: var(--text-primary);
}

/* Main Content */
.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-xl) var(--spacing-xl);
}

.content-area {
  min-height: 400px;
}

/* Feed Grid */
.feed-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: var(--spacing-lg);
  animation: fadeIn 0.5s ease-out;
}

.feed-item {
  animation: slideUp 0.4s ease-out;
  animation-fill-mode: both;
}

.feed-item:nth-child(1) { animation-delay: 0.1s; }
.feed-item:nth-child(2) { animation-delay: 0.2s; }
.feed-item:nth-child(3) { animation-delay: 0.3s; }
.feed-item:nth-child(4) { animation-delay: 0.4s; }
.feed-item:nth-child(5) { animation-delay: 0.5s; }

/* Loading Container */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.loading-card {
  background: var(--background-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-xl);
  padding: var(--spacing-2xl);
  box-shadow: var(--shadow-md);
  width: 100%;
  max-width: 500px;
}

.loading-shimmer {
  display: flex;
  gap: var(--spacing-lg);
}

.shimmer-image {
  width: 120px;
  height: 100px;
  background: linear-gradient(90deg, var(--background-secondary) 25%, var(--background-tertiary) 50%, var(--background-secondary) 75%);
  background-size: 200% 100%;
  border-radius: var(--radius-md);
  animation: shimmer 1.5s infinite;
}

.shimmer-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.shimmer-line {
  height: 16px;
  background: linear-gradient(90deg, var(--background-secondary) 25%, var(--background-tertiary) 50%, var(--background-secondary) 75%);
  background-size: 200% 100%;
  border-radius: var(--radius-sm);
  animation: shimmer 1.5s infinite;
}

.shimmer-title {
  width: 80%;
}

.shimmer-text {
  width: 100%;
}

.shimmer-text:last-child {
  width: 60%;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

/* Error Container */
.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.error-card {
  background: var(--background-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-xl);
  padding: var(--spacing-2xl);
  box-shadow: var(--shadow-md);
  width: 100%;
  max-width: 500px;
  text-align: center;
  border-left: 4px solid var(--error-600);
}

.error-illustration {
  margin-bottom: var(--spacing-xl);
}

.error-icon {
  font-size: var(--font-size-3xl);
  margin-bottom: var(--spacing-md);
}

.error-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-md) 0;
}

.error-description {
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xl);
  line-height: var(--line-height-relaxed);
}

.error-actions {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
}

.retry-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--brand-primary);
  color: var(--text-inverse);
  border: 1px solid var(--brand-primary);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-normal);
  box-shadow: var(--shadow-sm);
}

.retry-btn:hover {
  background: var(--brand-hover);
  border-color: var(--brand-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

/* Empty Container */
.empty-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.empty-card {
  background: var(--background-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-xl);
  padding: var(--spacing-2xl);
  box-shadow: var(--shadow-md);
  width: 100%;
  max-width: 500px;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.empty-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--border-secondary), transparent);
  opacity: 0.5;
}

.empty-illustration {
  margin-bottom: var(--spacing-xl);
  position: relative;
}

.empty-icon {
  font-size: var(--font-size-4xl);
  margin-bottom: var(--spacing-lg);
}

.empty-animation {
  position: relative;
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-md);
}

.floating-paper {
  width: 20px;
  height: 28px;
  background: var(--brand-primary);
  border-radius: var(--radius-sm);
  opacity: 0.7;
  animation: float 3s ease-in-out infinite;
}

.floating-paper:nth-child(1) {
  animation-delay: 0s;
  transform: translateY(0px) rotate(0deg);
}

.floating-paper:nth-child(2) {
  animation-delay: 1s;
  transform: translateY(-10px) rotate(15deg);
}

.floating-paper:nth-child(3) {
  animation-delay: 2s;
  transform: translateY(-5px) rotate(-15deg);
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-15px) rotate(10deg); }
}

.empty-content {
  position: relative;
  z-index: 1;
}

.empty-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-md) 0;
}

.empty-description {
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xl);
  line-height: var(--line-height-relaxed);
}

.empty-actions {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

.clear-search-btn,
.create-analysis-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-normal);
  box-shadow: var(--shadow-sm);
}

.clear-search-btn {
  background: var(--background-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-primary);
}

.clear-search-btn:hover {
  background: var(--background-tertiary);
  border-color: var(--border-secondary);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.create-analysis-btn {
  background: var(--brand-primary);
  color: var(--text-inverse);
  border: 1px solid var(--brand-primary);
}

.create-analysis-btn:hover {
  background: var(--brand-hover);
  border-color: var(--brand-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-section {
    padding: var(--spacing-xl) 0 var(--spacing-lg) 0;
  }
  
  .hero-content {
    padding: 0 var(--spacing-lg);
  }
  
  .hero-badge {
    font-size: var(--font-size-xs);
    padding: var(--spacing-xs) var(--spacing-md);
    margin-bottom: var(--spacing-md);
  }
  
  .hero-title {
    font-size: var(--font-size-3xl);
    margin-bottom: var(--spacing-sm);
  }
  
  .hero-subtitle {
    font-size: var(--font-size-base);
  }
  
  .search-container {
    padding: 0 var(--spacing-lg);
    margin-top: var(--spacing-lg);
  }
  
  .search-input-wrapper {
    padding: var(--spacing-md);
  }
  
  .search-icon {
    left: var(--spacing-md);
  }
  
  .search-input {
    padding: var(--spacing-sm) var(--spacing-md) var(--spacing-sm) calc(var(--spacing-md) + var(--spacing-lg) + var(--spacing-sm));
    font-size: var(--font-size-sm);
  }
  
  .search-clear-btn {
    right: var(--spacing-sm);
    padding: var(--spacing-xs);
  }
  
  .main-content {
    padding: var(--spacing-lg) var(--spacing-lg);
  }
  
  .feed-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }
  
  .loading-card,
  .error-card,
  .empty-card {
    max-width: 100%;
    padding: var(--spacing-xl);
  }
  
  .loading-shimmer {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .shimmer-image {
    width: 100%;
    max-width: 300px;
    height: 200px;
  }
  
  .shimmer-content {
    width: 100%;
    margin-top: var(--spacing-md);
  }
  
  .error-actions,
  .empty-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .clear-search-btn,
  .create-analysis-btn,
  .retry-btn {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .hero-section {
    padding: var(--spacing-lg) 0 var(--spacing-md) 0;
  }
  
  .hero-content {
    padding: 0 var(--spacing-md);
  }
  
  .hero-badge {
    margin-bottom: var(--spacing-sm);
  }
  
  .hero-title {
    font-size: var(--font-size-2xl);
    margin-bottom: var(--spacing-sm);
  }
  
  .hero-subtitle {
    font-size: var(--font-size-sm);
  }
  
  .search-container {
    padding: 0 var(--spacing-md);
    margin-top: var(--spacing-md);
  }
  
  .search-input-wrapper {
    padding: var(--spacing-sm);
  }
  
  .search-icon {
    left: var(--spacing-sm);
  }
  
  .search-input {
    padding: var(--spacing-xs) var(--spacing-sm) var(--spacing-xs) calc(var(--spacing-sm) + var(--spacing-lg) + var(--spacing-xs));
    font-size: var(--font-size-xs);
  }
  
  .main-content {
    padding: var(--spacing-md) var(--spacing-md);
  }
  
  .feed-grid {
    gap: var(--spacing-sm);
  }
  
  .loading-card,
  .error-card,
  .empty-card {
    padding: var(--spacing-lg);
  }
  
  .empty-icon {
    font-size: var(--font-size-2xl);
  }
  
  .empty-animation {
    height: 40px;
  }
  
  .floating-paper {
    width: 16px;
    height: 22px;
  }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .hero-badge,
  .search-input-wrapper,
  .feed-item,
  .loading-shimmer .shimmer-line,
  .floating-paper,
  .clear-search-btn,
  .create-analysis-btn,
  .retry-btn {
    animation: none;
    transition: none;
  }
  
  .feed-grid,
  .search-suggestions {
    animation: none;
  }
}
</style> 