<template>
  <div class="my-analyses-page">
    <!-- Hero Section -->
    <div class="hero-section">
      <div class="hero-content">
        <div class="hero-badge">
          <span class="badge-icon">📊</span>
          <span class="badge-text">Your Research Dashboard</span>
        </div>
        <h1 class="hero-title">My Analyses</h1>
        <p class="hero-subtitle">Track your research journey and explore your analysis history</p>
      </div>
      
      <!-- Stats Overview -->
      <div class="stats-overview">
        <div class="stat-card">
          <div class="stat-icon">📄</div>
          <div class="stat-content">
            <div class="stat-number">{{ analyses.length }}</div>
            <div class="stat-label">Total Analyses</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📅</div>
          <div class="stat-content">
            <div class="stat-number">{{ thisMonthAnalyses }}</div>
            <div class="stat-label">This Month</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">⭐</div>
          <div class="stat-content">
            <div class="stat-number">{{ avgScore.toFixed(1) }}</div>
            <div class="stat-label">Avg Score</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🔥</div>
          <div class="stat-content">
            <div class="stat-number">{{ trendingAnalyses }}</div>
            <div class="stat-label">Trending</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <!-- Controls Section -->
      <div class="controls-section">
        <div class="search-and-filter">
          <div class="search-wrapper">
            <div class="search-input-wrapper">
              <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              <input 
                class="search-input" 
                type="text" 
                placeholder="Search by title, keyword..." 
                v-model="searchQuery"
                @input="handleSearch"
              />
              <button 
                v-if="searchQuery" 
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
          </div>
          
          <div class="filter-controls">
            <select v-model="sortBy" class="sort-select">
              <option value="date">Sort by Date</option>
              <option value="title">Sort by Title</option>
              <option value="score">Sort by Score</option>
            </select>
            
            <select v-model="filterBy" class="filter-select">
              <option value="all">All Analyses</option>
              <option value="recent">Recent (30 days)</option>
              <option value="high-score">High Score (8+)</option>
              <option value="trending">Trending</option>
            </select>
          </div>
        </div>
        
        <div class="action-buttons">
          <button class="btn-primary" @click="goToUpload">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            New Analysis
          </button>
          
          <button class="btn-secondary" @click="exportData">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Export
          </button>
        </div>
      </div>

      <!-- View Toggle -->
      <div class="view-toggle">
        <button 
          :class="['view-btn', { active: viewMode === 'grid' }]" 
          @click="viewMode = 'grid'"
          title="Grid view"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
        </button>
        <button 
          :class="['view-btn', { active: viewMode === 'list' }]" 
          @click="viewMode = 'list'"
          title="List view"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="8" y1="6" x2="21" y2="6"></line>
            <line x1="8" y1="12" x2="21" y2="12"></line>
            <line x1="8" y1="18" x2="21" y2="18"></line>
            <line x1="3" y1="6" x2="3.01" y2="6"></line>
            <line x1="3" y1="12" x2="3.01" y2="12"></line>
            <line x1="3" y1="18" x2="3.01" y2="18"></line>
          </svg>
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="loading-container">
        <div class="loading-cards">
          <div v-for="i in 3" :key="i" class="loading-card">
            <div class="loading-shimmer">
              <div class="shimmer-icon"></div>
              <div class="shimmer-content">
                <div class="shimmer-line shimmer-title"></div>
                <div class="shimmer-line shimmer-text"></div>
                <div class="shimmer-line shimmer-text"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredAnalyses.length === 0" class="empty-container">
        <div class="empty-card">
          <div class="empty-illustration">
            <div class="empty-icon">📊</div>
            <div class="empty-animation">
              <div class="floating-chart"></div>
              <div class="floating-chart"></div>
              <div class="floating-chart"></div>
            </div>
          </div>
          <div class="empty-content">
            <h3 class="empty-title">No Analyses Found</h3>
            <p class="empty-description">
              {{ searchQuery ? 'Try adjusting your search terms' : 'Start your research journey by creating your first analysis!' }}
            </p>
            <div class="empty-actions">
              <button v-if="searchQuery" class="btn-secondary" @click="clearSearch">
                Clear Search
              </button>
              <button v-else class="btn-primary" @click="goToUpload">
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

      <!-- Grid View -->
      <div v-else-if="viewMode === 'grid'" class="analyses-grid">
        <div 
          v-for="item in filteredAnalyses" 
          :key="item.id" 
          class="analysis-card"
          @click="viewDetails(item.id)"
        >
          <div class="card-header">
            <div class="card-icon" :style="{ background: iconBg(item.id) }">
              {{ iconEmoji(item.id) }}
            </div>
            <div class="card-info">
              <h3 class="card-title">{{ item.title }}</h3>
              <p class="card-date">{{ formatDate(item.date) }}</p>
            </div>
            <div class="card-score" v-if="item.score">
              <div class="score-badge" :class="getScoreClass(item.score)">
                {{ item.score }}
              </div>
            </div>
          </div>
          
          <div class="card-content">
            <p class="card-summary">{{ item.summary }}</p>
            
            <div class="card-stats">
              <div class="stat-item">
                <span class="stat-icon">👁️</span>
                <span class="stat-value">{{ item.views || 0 }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-icon">❤️</span>
                <span class="stat-value">{{ item.likes || 0 }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-icon">💬</span>
                <span class="stat-value">{{ item.comments || 0 }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-icon">📈</span>
                <span class="stat-value">{{ item.trending ? 'Trending' : 'Stable' }}</span>
              </div>
            </div>
          </div>
          
          <div class="card-actions">
            <button class="btn-view" @click.stop="viewDetails(item.id)">
              View Details
            </button>
            <button class="btn-share" @click.stop="shareAnalysis(item)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="18" cy="5" r="3"></circle>
                <circle cx="6" cy="12" r="3"></circle>
                <circle cx="18" cy="19" r="3"></circle>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
              </svg>
            </button>
            <button class="btn-download" @click.stop="downloadAnalysis(item)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- List View -->
      <div v-else class="analyses-list">
        <div class="list-container">
          <div 
            v-for="item in filteredAnalyses" 
            :key="item.id" 
            class="list-item"
            @click="viewDetails(item.id)"
          >
            <div class="item-icon" :style="{ background: iconBg(item.id) }">
              {{ iconEmoji(item.id) }}
            </div>
            
            <div class="item-content">
              <h3 class="item-title">{{ item.title }}</h3>
              <p class="item-summary">{{ item.summary }}</p>
              <div class="item-meta">
                <span class="meta-date">{{ formatDate(item.date) }}</span>
                <span class="meta-separator">•</span>
                <span class="meta-views">{{ item.views || 0 }} views</span>
                <span class="meta-separator">•</span>
                <span class="meta-likes">{{ item.likes || 0 }} likes</span>
              </div>
            </div>
            
            <div class="item-stats">
              <div class="score-badge" :class="getScoreClass(item.score)" v-if="item.score">
                {{ item.score }}
              </div>
              <div class="item-actions">
                <button class="btn-view" @click.stop="viewDetails(item.id)">
                  View
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
// 声明类型
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 响应式数据
const isLoading = ref(false)
const searchQuery = ref('')
const sortBy = ref('date')
const filterBy = ref('all')
const viewMode = ref('grid')

// 静态模拟数据，后续可替换为接口数据
const analyses = ref([
  {
    id: 1,
    title: 'Advancements in Natural Language Processing',
    date: '2024-01-15',
    summary: 'This paper explores recent breakthroughs in NLP, focusing on transformer models and their applications in text generation and sentiment analysis.',
    score: 8.5,
    views: 234,
    likes: 45,
    comments: 12,
    trending: true
  },
  {
    id: 2,
    title: 'A Novel Approach to Image Recognition',
    date: '2023-12-20',
    summary: 'This research introduces a new convolutional neural network architecture for image recognition, achieving state-of-the-art results on benchmark datasets.',
    score: 9.2,
    views: 567,
    likes: 89,
    comments: 23,
    trending: true
  },
  {
    id: 3,
    title: 'The Impact of Climate Change on Biodiversity',
    date: '2023-11-05',
    summary: 'This study examines the effects of climate change on various ecosystems, highlighting the importance of conservation efforts.',
    score: 7.8,
    views: 123,
    likes: 34,
    comments: 8,
    trending: false
  },
  {
    id: 4,
    title: 'Machine Learning for Financial Forecasting',
    date: '2023-10-12',
    summary: 'This paper investigates the use of machine learning algorithms for predicting stock market trends and financial risk assessment.',
    score: 8.1,
    views: 345,
    likes: 67,
    comments: 15,
    trending: false
  },
  {
    id: 5,
    title: 'Quantum Computing and its Potential Applications',
    date: '2023-09-28',
    summary: 'This review article provides an overview of quantum computing, discussing its potential to revolutionize fields like cryptography and drug discovery.',
    score: 8.9,
    views: 789,
    likes: 156,
    comments: 42,
    trending: true
  }
])

// 计算属性
const thisMonthAnalyses = computed(() => {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  
  return analyses.value.filter(analysis => {
    const analysisDate = new Date(analysis.date)
    return analysisDate.getMonth() === currentMonth && analysisDate.getFullYear() === currentYear
  }).length
})

const avgScore = computed(() => {
  const scores = analyses.value.map(a => a.score || 0)
  return scores.reduce((sum, score) => sum + score, 0) / scores.length
})

const trendingAnalyses = computed(() => {
  return analyses.value.filter(a => a.trending).length
})

const filteredAnalyses = computed(() => {
  let filtered = [...analyses.value]
  
  // 搜索过滤
  if (searchQuery.value.trim()) {
    const searchLower = searchQuery.value.toLowerCase()
    filtered = filtered.filter(item =>
      item.title.toLowerCase().includes(searchLower) ||
      item.summary.toLowerCase().includes(searchLower)
    )
  }
  
  // 时间过滤
  if (filterBy.value === 'recent') {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    filtered = filtered.filter(item => new Date(item.date) >= thirtyDaysAgo)
  } else if (filterBy.value === 'high-score') {
    filtered = filtered.filter(item => (item.score || 0) >= 8)
  } else if (filterBy.value === 'trending') {
    filtered = filtered.filter(item => item.trending)
  }
  
  // 排序
  if (sortBy.value === 'date') {
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date))
  } else if (sortBy.value === 'title') {
    filtered.sort((a, b) => a.title.localeCompare(b.title))
  } else if (sortBy.value === 'score') {
    filtered.sort((a, b) => (b.score || 0) - (a.score || 0))
  }
  
  return filtered
})

// 工具函数
function iconEmoji(id) {
  const icons = ['📄', '📕', '📗', '📘', '📑']
  return icons[(id - 1) % icons.length]
}

function iconBg(id) {
  const bgs = ['#e0ece6', '#ffe5db', '#dbeafe', '#e0e7ef', '#e7f5e6']
  return bgs[(id - 1) % bgs.length]
}

function getScoreClass(score) {
  if (score >= 9) return 'score-excellent'
  if (score >= 8) return 'score-good'
  if (score >= 7) return 'score-fair'
  return 'score-poor'
}

function formatDate(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
  return `${Math.floor(diffDays / 365)} years ago`
}

// 事件处理
function handleSearch() {
  // 搜索逻辑已在 computed 中处理
  console.log('Searching for:', searchQuery.value)
}

function clearSearch() {
  searchQuery.value = ''
}

function viewDetails(id) {
  router.push(`/paper-report/${id}`)
}

function goToUpload() {
  router.push('/upload-analysis')
}

function shareAnalysis(item) {
  // 模拟分享功能
  if (navigator.share) {
    navigator.share({
      title: item.title,
      text: item.summary,
      url: window.location.href + `/paper-report/${item.id}`
    })
  } else {
    // 回退到复制链接
    navigator.clipboard.writeText(window.location.href + `/paper-report/${item.id}`)
    alert('Link copied to clipboard!')
  }
}

function downloadAnalysis(item) {
  // 模拟下载功能
  const data = JSON.stringify(item, null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${item.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_analysis.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function exportData() {
  // 导出所有分析数据
  const data = JSON.stringify(analyses.value, null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'my_analyses_export.json'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// 生命周期
onMounted(async () => {
  // 模拟数据加载
  isLoading.value = true
  await new Promise(resolve => setTimeout(resolve, 1000))
  isLoading.value = false
})
</script>
<style scoped>
/* Modern Expo.dev-inspired styling */
.my-analyses-page {
  min-height: 100vh;
  background: var(--background-default);
}

/* Hero Section */
.hero-section {
  background: linear-gradient(135deg, var(--background-primary) 0%, var(--background-secondary) 100%);
  border-bottom: 1px solid var(--border-primary);
  padding: var(--spacing-3xl) 0 var(--spacing-2xl) 0;
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
  margin-bottom: var(--spacing-xl);
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
  margin: 0 0 var(--spacing-lg) 0;
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

/* Stats Overview */
.stats-overview {
  max-width: 1200px;
  margin: var(--spacing-2xl) auto 0;
  padding: 0 var(--spacing-xl);
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-xl);
}

.stat-card {
  background: var(--background-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  transition: all var(--transition-normal);
  box-shadow: var(--shadow-sm);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--border-secondary);
}

.stat-icon {
  font-size: var(--font-size-2xl);
  opacity: 0.8;
}

.stat-number {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  line-height: var(--line-height-tight);
}

.stat-label {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

/* Main Content */
.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-2xl) var(--spacing-xl);
}

/* Controls Section */
.controls-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
  gap: var(--spacing-lg);
  flex-wrap: wrap;
}

.search-and-filter {
  display: flex;
  gap: var(--spacing-md);
  align-items: center;
  flex: 1;
  flex-wrap: wrap;
}

.search-wrapper {
  position: relative;
  flex: 1;
  min-width: 300px;
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

.filter-controls {
  display: flex;
  gap: var(--spacing-sm);
}

.sort-select,
.filter-select {
  padding: var(--spacing-md) var(--spacing-lg);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  background: var(--background-primary);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.sort-select:hover,
.filter-select:hover {
  border-color: var(--border-secondary);
  background: var(--background-secondary);
}

.sort-select:focus,
.filter-select:focus {
  outline: none;
  border-color: var(--border-focus);
  box-shadow: var(--focus-ring);
}

.action-buttons {
  display: flex;
  gap: var(--spacing-sm);
}

.btn-primary,
.btn-secondary {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-normal);
  border: 1px solid transparent;
  text-decoration: none;
}

.btn-primary {
  background: var(--brand-primary);
  color: var(--text-inverse);
  border-color: var(--brand-primary);
}

.btn-primary:hover {
  background: var(--brand-hover);
  border-color: var(--brand-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.btn-secondary {
  background: var(--background-secondary);
  color: var(--text-primary);
  border-color: var(--border-primary);
}

.btn-secondary:hover {
  background: var(--background-tertiary);
  border-color: var(--border-secondary);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

/* View Toggle */
.view-toggle {
  display: flex;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-sm);
  background: var(--background-secondary);
  border-radius: var(--radius-lg);
  width: fit-content;
}

.view-btn {
  padding: var(--spacing-sm) var(--spacing-md);
  border: none;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-normal);
  display: flex;
  align-items: center;
  justify-content: center;
}

.view-btn:hover {
  background: var(--background-tertiary);
  color: var(--text-primary);
}

.view-btn.active {
  background: var(--background-primary);
  color: var(--brand-primary);
  box-shadow: var(--shadow-sm);
}

/* Loading Container */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.loading-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-xl);
  width: 100%;
}

.loading-card {
  background: var(--background-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-md);
}

.loading-shimmer {
  display: flex;
  gap: var(--spacing-lg);
}

.shimmer-icon {
  width: 50px;
  height: 50px;
  background: linear-gradient(90deg, var(--background-secondary) 25%, var(--background-tertiary) 50%, var(--background-secondary) 75%);
  background-size: 200% 100%;
  border-radius: var(--radius-full);
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

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
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

.floating-chart {
  width: 20px;
  height: 28px;
  background: var(--brand-primary);
  border-radius: var(--radius-sm);
  opacity: 0.7;
  animation: float 3s ease-in-out infinite;
}

.floating-chart:nth-child(1) {
  animation-delay: 0s;
  transform: translateY(0px) rotate(0deg);
}

.floating-chart:nth-child(2) {
  animation-delay: 1s;
  transform: translateY(-10px) rotate(15deg);
}

.floating-chart:nth-child(3) {
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

/* Grid View */
.analyses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: var(--spacing-xl);
  animation: fadeIn 0.5s ease-out;
}

.analysis-card {
  background: var(--background-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: all var(--transition-normal);
  animation: slideUp 0.4s ease-out;
  animation-fill-mode: both;
}

.analysis-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--border-secondary);
}

.analysis-card:nth-child(1) { animation-delay: 0.1s; }
.analysis-card:nth-child(2) { animation-delay: 0.2s; }
.analysis-card:nth-child(3) { animation-delay: 0.3s; }
.analysis-card:nth-child(4) { animation-delay: 0.4s; }
.analysis-card:nth-child(5) { animation-delay: 0.5s; }

.card-header {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
}

.card-icon {
  width: 50px;
  height: 50px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-xl);
  flex-shrink: 0;
}

.card-info {
  flex: 1;
}

.card-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-xs) 0;
  line-height: var(--line-height-tight);
}

.card-date {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.card-score {
  flex-shrink: 0;
}

.score-badge {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-inverse);
}

.score-excellent {
  background: var(--success-600);
}

.score-good {
  background: var(--brand-primary);
}

.score-fair {
  background: var(--warning-600);
}

.score-poor {
  background: var(--error-600);
}

.card-content {
  margin-bottom: var(--spacing-lg);
}

.card-summary {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-relaxed);
  margin: 0 0 var(--spacing-lg) 0;
}

.card-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-sm);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.stat-icon {
  font-size: var(--font-size-sm);
  opacity: 0.8;
}

.stat-value {
  color: var(--text-secondary);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.card-actions {
  display: flex;
  gap: var(--spacing-sm);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--border-primary);
}

.btn-view,
.btn-share,
.btn-download {
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  background: var(--background-secondary);
  color: var(--text-secondary);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-normal);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.btn-view:hover,
.btn-share:hover,
.btn-download:hover {
  background: var(--background-tertiary);
  border-color: var(--border-secondary);
  color: var(--text-primary);
  transform: translateY(-1px);
}

.btn-view {
  flex: 1;
  justify-content: center;
}

/* List View */
.analyses-list {
  animation: fadeIn 0.5s ease-out;
}

.list-container {
  background: var(--background-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.list-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-xl);
  border-bottom: 1px solid var(--border-primary);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.list-item:last-child {
  border-bottom: none;
}

.list-item:hover {
  background: var(--background-secondary);
}

.item-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-lg);
  flex-shrink: 0;
}

.item-content {
  flex: 1;
}

.item-title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-xs) 0;
  line-height: var(--line-height-tight);
}

.item-summary {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-relaxed);
  margin: 0 0 var(--spacing-sm) 0;
}

.item-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

.meta-separator {
  color: var(--border-secondary);
}

.item-stats {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.item-actions {
  display: flex;
  gap: var(--spacing-sm);
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
    padding: var(--spacing-2xl) 0 var(--spacing-xl) 0;
  }
  
  .hero-content {
    padding: 0 var(--spacing-lg);
  }
  
  .hero-badge {
    font-size: var(--font-size-xs);
    padding: var(--spacing-xs) var(--spacing-md);
  }
  
  .hero-title {
    font-size: var(--font-size-3xl);
  }
  
  .hero-subtitle {
    font-size: var(--font-size-base);
  }
  
  .stats-overview {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--spacing-lg);
    padding: 0 var(--spacing-lg);
  }
  
  .main-content {
    padding: var(--spacing-xl) var(--spacing-lg);
  }
  
  .controls-section {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-lg);
  }
  
  .search-and-filter {
    flex-direction: column;
    gap: var(--spacing-md);
  }
  
  .search-wrapper {
    min-width: auto;
  }
  
  .filter-controls {
    flex-wrap: wrap;
  }
  
  .action-buttons {
    justify-content: center;
  }
  
  .analyses-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-lg);
  }
  
  .card-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .loading-cards {
    grid-template-columns: 1fr;
  }
  
  .empty-card {
    padding: var(--spacing-xl);
  }
  
  .empty-icon {
    font-size: var(--font-size-2xl);
  }
  
  .empty-animation {
    height: 40px;
  }
  
  .floating-chart {
    width: 16px;
    height: 22px;
  }
  
  .list-item {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
    padding: var(--spacing-lg);
  }
  
  .item-stats {
    width: 100%;
    justify-content: space-between;
  }
}

@media (max-width: 480px) {
  .hero-section {
    padding: var(--spacing-xl) 0 var(--spacing-lg) 0;
  }
  
  .hero-content {
    padding: 0 var(--spacing-md);
  }
  
  .hero-title {
    font-size: var(--font-size-2xl);
  }
  
  .hero-subtitle {
    font-size: var(--font-size-sm);
  }
  
  .stats-overview {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-md);
    padding: 0 var(--spacing-md);
  }
  
  .stat-card {
    padding: var(--spacing-lg);
  }
  
  .main-content {
    padding: var(--spacing-lg) var(--spacing-md);
  }
  
  .card-stats {
    grid-template-columns: 1fr;
  }
  
  .card-actions {
    flex-direction: column;
  }
  
  .empty-card {
    padding: var(--spacing-lg);
  }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .hero-badge,
  .stat-card,
  .analysis-card,
  .loading-shimmer .shimmer-line,
  .floating-chart,
  .btn-primary,
  .btn-secondary,
  .btn-view,
  .btn-share,
  .btn-download {
    animation: none;
    transition: none;
  }
  
  .analyses-grid,
  .analyses-list {
    animation: none;
  }
}
</style> 