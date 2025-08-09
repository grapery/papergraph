<template>
  <div class="paper-report-page">
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-card">
        <div class="loading-illustration">
          <div class="loading-icon">📊</div>
          <div class="loading-animation">
            <div class="floating-chart"></div>
            <div class="floating-chart"></div>
            <div class="floating-chart"></div>
          </div>
        </div>
        <div class="loading-content">
          <h3 class="loading-title">Analyzing Paper</h3>
          <p class="loading-description">Our AI is thoroughly evaluating your paper across multiple dimensions...</p>
          <div class="loading-progress">
            <div class="progress-bar">
              <div class="progress-fill"></div>
            </div>
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
          <h3 class="error-title">Analysis Failed</h3>
          <p class="error-description">{{ error }}</p>
          <div class="error-actions">
            <button class="retry-btn" @click="loadAnalysisData">
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
    
    <!-- Analysis Results -->
    <div v-else-if="analysisData" class="analysis-results">
      <!-- Hero Section -->
      <div class="hero-section">
        <div class="hero-content">
          <div class="hero-badge">
            <span class="badge-icon">📄</span>
            <span class="badge-text">Paper Analysis Report</span>
          </div>
          <h1 class="hero-title">{{ analysisData.title || 'Paper Analysis' }}</h1>
          <div class="hero-meta">
            <div class="meta-item">
              <span class="meta-icon">👤</span>
              <span class="meta-text">Uploaded by <span class="uploader">{{ analysisData.uploader || 'Unknown User' }}</span></span>
            </div>
            <div class="meta-item">
              <span class="meta-icon">📅</span>
              <span class="meta-text">Analyzed on {{ formatDate(analysisData.analysisDate) }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-icon">⏱️</span>
              <span class="meta-text">Published {{ formatDate(analysisData.publicationDate) }}</span>
            </div>
          </div>
        </div>
        
        <!-- Score Summary Card -->
        <div class="score-summary-card">
          <div class="score-visual">
            <div class="circular-progress">
              <svg class="progress-ring" width="140" height="140">
                <circle
                  class="progress-ring-circle"
                  stroke="var(--border-primary)"
                  stroke-width="12"
                  fill="transparent"
                  r="64"
                  cx="70"
                  cy="70"
                />
                <circle
                  class="progress-ring-circle progress-ring-fill"
                  :stroke="getScoreColor(analysisData.overallScore)"
                  stroke-width="12"
                  fill="transparent"
                  r="64"
                  cx="70"
                  cy="70"
                  :stroke-dasharray="circumference"
                  :stroke-dashoffset="dashOffset"
                  transform="rotate(-90 70 70)"
                />
              </svg>
              <div class="score-text">
                <div class="score-number">{{ getScoreNumber(analysisData.overallScore) }}</div>
                <div class="score-label">Overall Score</div>
              </div>
            </div>
          </div>
          <div class="score-details">
            <div class="score-assessment">
              <h3 class="assessment-title">{{ getScoreLevelText(analysisData.overallScore) }}</h3>
              <p class="assessment-description">{{ analysisData.summary || 'This paper demonstrates a strong approach to natural language processing using transformer networks, showing notable improvements in accuracy and efficiency.' }}</p>
            </div>
            <div class="quick-actions">
              <button class="action-btn primary" @click="tab = 'detail'">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 11H3v10h6V11zm4-7H7v17h6V4zm4 3h-6v14h6V7zm4 7h-6v7h6v-7z"/>
                </svg>
                Detailed Analysis
              </button>
              <button class="action-btn secondary" @click="exportReport">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Export Report
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="main-content">
        <!-- Tab Navigation -->
        <div class="tab-navigation">
          <div class="tab-container">
            <button 
              v-for="tabItem in tabs" 
              :key="tabItem.key"
              :class="['tab-btn', { active: tab === tabItem.key }]"
              @click="tab = tabItem.key"
            >
              <span class="tab-icon">{{ tabItem.icon }}</span>
              <span class="tab-label">{{ tabItem.label }}</span>
              <span v-if="tabItem.count" class="tab-count">{{ tabItem.count }}</span>
            </button>
          </div>
        </div>

        <!-- Tab Content -->
        <div class="tab-content">
          <!-- Overview Tab -->
          <div v-if="tab === 'overview'" class="tab-panel">
            <!-- Basic Information -->
            <div class="info-section">
              <h2 class="section-title">
                <span class="section-icon">📋</span>
                Basic Information
              </h2>
              <div class="info-grid">
                <div class="info-item">
                  <div class="info-label">Title</div>
                  <div class="info-value">{{ analysisData.title || 'Paper Title' }}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Author</div>
                  <div class="info-value">{{ analysisData.author || 'Unknown Author' }}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Publication Date</div>
                  <div class="info-value">{{ formatDate(analysisData.publicationDate) }}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Analysis Date</div>
                  <div class="info-value">{{ formatDate(analysisData.analysisDate) }}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Overall Score</div>
                  <div class="info-value">
                    <span class="score-badge" :class="getScoreLevel(analysisData.overallScore)">
                      {{ analysisData.overallScore || '7.5/10' }}
                    </span>
                  </div>
                </div>
                <div class="info-item">
                  <div class="info-label">Quality Level</div>
                  <div class="info-value">{{ getScoreLevelText(analysisData.overallScore) }}</div>
                </div>
              </div>
            </div>

            <!-- Executive Summary -->
            <div class="summary-section">
              <h2 class="section-title">
                <span class="section-icon">📝</span>
                Executive Summary
              </h2>
              <div class="summary-content">
                <p class="summary-text">{{ analysisData.summary || 'This paper presents a novel approach to natural language processing using transformer networks. The results demonstrate significant improvements over existing methods in terms of accuracy and efficiency. The methodology is well-defined and reproducible, although further validation on diverse datasets is recommended.' }}</p>
              </div>
            </div>

            <!-- Key Metrics -->
            <div class="metrics-section">
              <h2 class="section-title">
                <span class="section-icon">📊</span>
                Key Quality Metrics
              </h2>
              <div class="metrics-grid">
                <div v-for="item in analysisData.contentQuality || contentQuality" :key="item.key" class="metric-card">
                  <div class="metric-header">
                    <div class="metric-title">{{ item.title }}</div>
                    <div class="metric-score" :class="getScoreLevel(item.score)">
                      {{ item.score }}
                    </div>
                  </div>
                  <div class="metric-description">{{ item.desc }}</div>
                  <div class="metric-progress">
                    <div class="progress-bar">
                      <div class="progress-fill" :style="{ width: item.percent, backgroundColor: getProgressColor(item.score) }"></div>
                    </div>
                  </div>
                  <div class="metric-status">{{ item.levelText }}</div>
                </div>
              </div>
            </div>

            <!-- Quick Insights -->
            <div class="insights-section">
              <h2 class="section-title">
                <span class="section-icon">💡</span>
                Quick Insights
              </h2>
              <div class="insights-grid">
                <div class="insight-card positive">
                  <div class="insight-icon">✅</div>
                  <div class="insight-content">
                    <h4>Strengths</h4>
                    <p>Strong methodology with well-defined research questions and comprehensive analysis.</p>
                  </div>
                </div>
                <div class="insight-card warning">
                  <div class="insight-icon">⚠️</div>
                  <div class="insight-content">
                    <h4>Areas for Improvement</h4>
                    <p>Consider expanding the dataset diversity and including more real-world validation.</p>
                  </div>
                </div>
                <div class="insight-card info">
                  <div class="insight-icon">ℹ️</div>
                  <div class="insight-content">
                    <h4>Recommendation</h4>
                    <p>This paper shows promise for publication in reputable journals with minor revisions.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Detailed Analysis Tab -->
          <div v-else-if="tab === 'detail'" class="tab-panel">
            <DetailedAnalysis 
              :analysisResult="{}" 
              :evaluationData="evaluationData"
            />
          </div>

          <!-- Feedback Tab -->
          <div v-else-if="tab === 'feedback'" class="tab-panel">
            <div class="feedback-section">
              <h2 class="section-title">
                <span class="section-icon">💬</span>
                Feedback & Comments
              </h2>
              <div class="feedback-content">
                <div class="feedback-placeholder">
                  <div class="feedback-icon">🗨️</div>
                  <h3>Share Your Thoughts</h3>
                  <p>This section will allow users to provide feedback and discuss the analysis results.</p>
                  <button class="feedback-btn">Add Comment</button>
                </div>
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
import { useRoute } from 'vue-router'
import { mockPublicFeeds } from '../utils/mockData'
import DetailedAnalysis from '../components/DetailedAnalysis.vue'

const route = useRoute()
const tab = ref('overview')
const loading = ref(true)
const error = ref(null)
const analysisData = ref(null)
const evaluationData = ref(null)

// Tab configuration
const tabs = [
  { key: 'overview', label: 'Overview', icon: '📊' },
  { key: 'detail', label: 'Detailed Analysis', icon: '🔍' },
  { key: 'feedback', label: 'Feedback', icon: '💬' }
]

// 内容质量静态数据（默认）
const contentQuality = [
  {
    key: 'rq',
    title: 'Research Question Importance',
    desc: 'The research question addresses a critical gap in the field of natural language processing, focusing on improving the efficiency and accuracy of transformer networks.',
    score: '4/5',
    percent: '80%',
    level: 'high',
    levelText: 'High'
  },
  {
    key: 'innovation',
    title: 'Innovation',
    desc: 'The paper introduces a novel architecture for transformer networks, incorporating attention mechanisms that enhance performance while reducing computational complexity.',
    score: '4.5/5',
    percent: '90%',
    level: 'high',
    levelText: 'High'
  },
  {
    key: 'rigor',
    title: 'Methodology Rigor',
    desc: 'The methodology is clearly articulated and employs rigorous experimental design, including appropriate controls and statistical analysis.',
    score: '3.5/5',
    percent: '70%',
    level: 'average',
    levelText: 'Average'
  },
  {
    key: 'repro',
    title: 'Results Validity Reproducibility',
    desc: 'The results are presented clearly and supported by empirical evidence. The authors provide sufficient detail for reproducibility, including code and datasets used.',
    score: '4/5',
    percent: '80%',
    level: 'high',
    levelText: 'High'
  },
  {
    key: 'depth',
    title: 'Data Analysis Depth Breadth',
    desc: 'The data analysis is comprehensive, covering a wide range of performance metrics and comparing the proposed method against several baselines.',
    score: '4.5/5',
    percent: '90%',
    level: 'high',
    levelText: 'High'
  },
  {
    key: 'practical',
    title: 'Practical Application Value',
    desc: 'The proposed method has significant practical applications in various NLP tasks, such as machine translation and text summarization, due to its improved efficiency and accuracy.',
    score: '3/5',
    percent: '60%',
    level: 'average',
    levelText: 'Average'
  },
  {
    key: 'future',
    title: 'Future Research Inspiration',
    desc: 'The paper suggests several avenues for future research, including exploring the application of the proposed method to other domains and investigating further optimizations.',
    score: '4/5',
    percent: '80%',
    level: 'high',
    levelText: 'High'
  }
]

// 组件挂载时加载数据
onMounted(() => {
  loadAnalysisData()
})

/**
 * 加载分析数据
 */
async function loadAnalysisData() {
  const taskId = route.params.taskId
  if (!taskId) {
    error.value = '缺少任务ID参数'
    loading.value = false
    return
  }

  loading.value = true
  error.value = null

  // 开发测试：直接使用模拟数据，避免 API 调用导致的 401 重定向
  try {
    // 使用模拟数据
    const mockData = mockPublicFeeds.find(item => item.id == taskId)
    if (mockData) {
      analysisData.value = {
        title: mockData.title,
        uploader: mockData.uploader || '测试用户',
        uploadDate: mockData.uploadDate,
        publicationDate: mockData.publicationDate,
        analysisDate: mockData.uploadDate,
        author: mockData.author || 'Unknown Author',
        overallScore: mockData.overallScore || '8.2/10',
        summary: mockData.summary,
        contentQuality: contentQuality,
        visualAnalysis: '基于模拟数据的视觉分析结果，包含图表和关键发现的可视化展示。'
      }
      
      // Initialize evaluation data for detailed analysis
      evaluationData.value = {
        overall_score: getScoreNumber(mockData.overallScore),
        summary: mockData.summary,
        recommendation: 'This paper demonstrates strong potential for publication with minor revisions.',
        content_score: 8.0,
        structure_score: 8.2,
        language_score: 7.8,
        method_score: 7.5,
        value_score: 8.1,
        originality_score: 8.0,
        depth_score: 7.8,
        logic_score: 8.2,
        evidence_score: 7.5,
        language_score: 7.8,
        value_score: 8.1
      }
    } else {
      error.value = '未找到对应的分析数据'
    }
  } catch (error) {
    console.error('加载分析数据失败:', error)
    error.value = '加载分析数据失败，请重试'
  } finally {
    loading.value = false
  }

  // 生产环境：使用真实 API 调用（已注释）
  /*
  try {
    // 尝试从 API 获取数据
    const [taskDetail, analysisResult] = await Promise.all([
      getTaskDetail(taskId),
      getAnalysisResult(taskId)
    ])

    // 合并数据
    analysisData.value = {
      title: taskDetail.Title || 'Paper Analysis',
      uploader: taskDetail.Uploader || 'Unknown User',
      uploadDate: taskDetail.CreatedAt,
      publicationDate: taskDetail.PublicationDate,
      analysisDate: taskDetail.CreatedAt,
      author: taskDetail.Author || 'Unknown Author',
      overallScore: analysisResult.overallScore || '7.5/10',
      summary: analysisResult.summary || taskDetail.Summary,
      contentQuality: analysisResult.contentQuality,
      visualAnalysis: analysisResult.visualAnalysis
    }
  } catch (apiError) {
    console.error('API 获取失败，使用模拟数据:', apiError)
    
    // 使用模拟数据作为备选
    const mockData = mockPublicFeeds.find(item => item.id == taskId)
    if (mockData) {
      analysisData.value = {
        title: mockData.title,
        uploader: mockData.uploader || '测试用户',
        uploadDate: mockData.uploadDate,
        publicationDate: mockData.publicationDate,
        analysisDate: mockData.uploadDate,
        author: mockData.author || 'Unknown Author',
        overallScore: mockData.overallScore || '8.2/10',
        summary: mockData.summary,
        contentQuality: contentQuality,
        visualAnalysis: '基于模拟数据的视觉分析结果，包含图表和关键发现的可视化展示。'
      }
    } else {
      error.value = '未找到对应的分析数据'
    }
  } finally {
    loading.value = false
  }
  */
}

/**
 * 格式化日期
 */
function formatDate(dateStr) {
  if (!dateStr) return 'Unknown'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return 'Unknown'
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

/**
 * 获取分数百分比
 */
function getScorePercent(score) {
  if (!score) return '75%'
  const match = score.match(/(\d+(?:\.\d+)?)/)
  if (match) {
    const num = parseFloat(match[1])
    return Math.min(100, Math.max(0, (num / 10) * 100)) + '%'
  }
  return '75%'
}

/**
 * 获取分数等级
 */
function getScoreLevel(score) {
  if (!score) return 'good'
  const match = score.match(/(\d+(?:\.\d+)?)/)
  if (match) {
    const num = parseFloat(match[1])
    if (num >= 8) return 'high'
    if (num >= 6) return 'good'
    return 'average'
  }
  return 'good'
}

/**
 * 获取分数等级文本
 */
function getScoreLevelText(score) {
  if (!score) return 'Good'
  const match = score.match(/(\d+(?:\.\d+)?)/)
  if (match) {
    const num = parseFloat(match[1])
    if (num >= 8) return 'Excellent'
    if (num >= 6) return 'Good'
    return 'Average'
  }
  return 'Good'
}

/**
 * 获取分数数字
 */
function getScoreNumber(score) {
  if (!score) return 7.5
  const match = score.match(/(\d+(?:\.\d+)?)/)
  if (match) {
    return parseFloat(match[1])
  }
  return 7.5
}

/**
 * 获取进度条颜色
 */
function getProgressColor(score) {
  if (!score) return 'var(--brand-primary)'
  const num = getScoreNumber(score)
  if (num >= 8) return 'var(--success-600)'
  if (num >= 6) return 'var(--brand-primary)'
  if (num >= 4) return 'var(--warning-600)'
  return 'var(--error-600)'
}

/**
 * 导出报告
 */
function exportReport() {
  // 导出功能实现
  const data = {
    title: analysisData.value.title,
    overallScore: analysisData.value.overallScore,
    summary: analysisData.value.summary,
    contentQuality: analysisData.value.contentQuality,
    exportDate: new Date().toISOString()
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${analysisData.value.title?.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_analysis_report.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
</script>
<style scoped>
/* Modern Expo.dev-inspired styling */
.paper-report-page {
  min-height: 100vh;
  background: var(--background-default);
}

/* Loading Container */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: var(--spacing-xl);
}

.loading-card {
  background: var(--background-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-xl);
  padding: var(--spacing-2xl);
  box-shadow: var(--shadow-md);
  width: 100%;
  max-width: 500px;
  text-align: center;
}

.loading-illustration {
  margin-bottom: var(--spacing-xl);
  position: relative;
}

.loading-icon {
  font-size: var(--font-size-4xl);
  margin-bottom: var(--spacing-lg);
}

.loading-animation {
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

.loading-content {
  position: relative;
  z-index: 1;
}

.loading-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-md) 0;
}

.loading-description {
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xl);
  line-height: var(--line-height-relaxed);
}

.loading-progress {
  width: 100%;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: var(--background-tertiary);
  border-radius: var(--radius-full);
  overflow: hidden;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: var(--brand-primary);
  border-radius: var(--radius-full);
  animation: progress-pulse 2s ease-in-out infinite;
}

@keyframes progress-pulse {
  0%, 100% { width: 45%; }
  50% { width: 75%; }
}

/* Error Container */
.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: var(--spacing-xl);
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

/* Analysis Results */
.analysis-results {
  min-height: 100vh;
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
  margin: 0 0 var(--spacing-xl) 0;
  line-height: var(--line-height-tight);
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-meta {
  display: flex;
  justify-content: center;
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-2xl);
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

.meta-icon {
  font-size: var(--font-size-base);
}

.uploader {
  color: var(--brand-primary);
  font-weight: var(--font-weight-medium);
}

/* Score Summary Card */
.score-summary-card {
  max-width: 1000px;
  margin: var(--spacing-2xl) auto 0;
  padding: 0 var(--spacing-xl);
  display: flex;
  gap: var(--spacing-2xl);
  align-items: center;
  background: var(--background-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-xl);
  padding: var(--spacing-2xl);
  box-shadow: var(--shadow-md);
  position: relative;
  overflow: hidden;
}

.score-summary-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--border-secondary), transparent);
  opacity: 0.5;
  transition: opacity var(--transition-normal);
}

.score-summary-card:hover::before {
  opacity: 1;
}

.score-visual {
  flex-shrink: 0;
}

.circular-progress {
  position: relative;
  width: 140px;
  height: 140px;
}

.progress-ring-circle {
  transition: stroke-dashoffset var(--transition-normal);
  transform: rotate(-90deg);
  transform-origin: 50% 50%;
}

.score-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.score-number {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
}

.score-label {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
}

.score-details {
  flex: 1;
}

.score-assessment h3 {
  font-size: var(--font-size-2xl);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-md) 0;
}

.assessment-description {
  color: var(--text-secondary);
  margin-bottom: var(--spacing-lg);
  line-height: var(--line-height-relaxed);
}

.quick-actions {
  display: flex;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

.action-btn {
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

.action-btn.primary {
  background: var(--brand-primary);
  color: var(--text-inverse);
  border-color: var(--brand-primary);
}

.action-btn.primary:hover {
  background: var(--brand-hover);
  border-color: var(--brand-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.action-btn.secondary {
  background: var(--background-secondary);
  color: var(--text-primary);
  border-color: var(--border-primary);
}

.action-btn.secondary:hover {
  background: var(--background-tertiary);
  border-color: var(--border-secondary);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

/* Main Content */
.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-2xl) var(--spacing-xl);
}

/* Tab Navigation */
.tab-navigation {
  margin-bottom: var(--spacing-2xl);
}

.tab-container {
  display: flex;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm);
  background: var(--background-secondary);
  border-radius: var(--radius-lg);
  width: fit-content;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  border: none;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-normal);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.tab-btn:hover {
  background: var(--background-tertiary);
  color: var(--text-primary);
}

.tab-btn.active {
  background: var(--background-primary);
  color: var(--brand-primary);
  box-shadow: var(--shadow-sm);
}

.tab-icon {
  font-size: var(--font-size-base);
}

.tab-count {
  background: var(--brand-primary);
  color: var(--text-inverse);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
}

/* Tab Content */
.tab-content {
  min-height: 400px;
}

.tab-panel {
  animation: fadeIn 0.5s ease-out;
}

/* Info Section */
.info-section {
  margin-bottom: var(--spacing-2xl);
}

.section-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-lg) 0;
}

.section-icon {
  font-size: var(--font-size-lg);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-lg);
}

.info-item {
  background: var(--background-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  transition: all var(--transition-normal);
}

.info-item:hover {
  border-color: var(--border-secondary);
  box-shadow: var(--shadow-sm);
}

.info-label {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
  margin-bottom: var(--spacing-xs);
  font-weight: var(--font-weight-medium);
}

.info-value {
  font-size: var(--font-size-base);
  color: var(--text-primary);
  font-weight: var(--font-weight-semibold);
}

.score-badge {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-inverse);
}

.score-badge.high {
  background: var(--success-600);
}

.score-badge.good {
  background: var(--brand-primary);
}

.score-badge.average {
  background: var(--warning-600);
}

/* Summary Section */
.summary-section {
  margin-bottom: var(--spacing-2xl);
}

.summary-content {
  background: var(--background-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-sm);
}

.summary-text {
  color: var(--text-secondary);
  line-height: var(--line-height-relaxed);
  margin: 0;
}

/* Metrics Section */
.metrics-section {
  margin-bottom: var(--spacing-2xl);
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: var(--spacing-xl);
}

.metric-card {
  background: var(--background-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-normal);
}

.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--border-secondary);
}

.metric-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-md);
}

.metric-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0;
  flex: 1;
}

.metric-score {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-full);
  color: var(--text-inverse);
}

.metric-score.high {
  background: var(--success-600);
}

.metric-score.good {
  background: var(--brand-primary);
}

.metric-score.average {
  background: var(--warning-600);
}

.metric-description {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-relaxed);
  margin-bottom: var(--spacing-md);
}

.metric-progress {
  margin-bottom: var(--spacing-sm);
}

.metric-status {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-tertiary);
}

/* Insights Section */
.insights-section {
  margin-bottom: var(--spacing-2xl);
}

.insights-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-lg);
}

.insight-card {
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  transition: all var(--transition-normal);
  border: 1px solid var(--border-primary);
}

.insight-card.positive {
  background: var(--success-50);
  border-color: var(--success-200);
}

.insight-card.warning {
  background: var(--warning-50);
  border-color: var(--warning-200);
}

.insight-card.info {
  background: var(--info-50);
  border-color: var(--info-200);
}

.insight-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.insight-icon {
  font-size: var(--font-size-2xl);
  margin-bottom: var(--spacing-md);
}

.insight-card.positive .insight-icon {
  color: var(--success-600);
}

.insight-card.warning .insight-icon {
  color: var(--warning-600);
}

.insight-card.info .insight-icon {
  color: var(--info-600);
}

.insight-content h4 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-sm) 0;
}

.insight-content p {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-relaxed);
  margin: 0;
}

/* Feedback Section */
.feedback-section {
  margin-bottom: var(--spacing-2xl);
}

.feedback-content {
  background: var(--background-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-2xl);
  box-shadow: var(--shadow-sm);
  text-align: center;
}

.feedback-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-lg);
}

.feedback-icon {
  font-size: var(--font-size-4xl);
  opacity: 0.5;
}

.feedback-placeholder h3 {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0;
}

.feedback-placeholder p {
  color: var(--text-secondary);
  margin: 0;
}

.feedback-btn {
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
}

.feedback-btn:hover {
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

/* Responsive Design */
@media (max-width: 768px) {
  .hero-section {
    padding: var(--spacing-2xl) 0 var(--spacing-xl) 0;
  }
  
  .hero-content {
    padding: 0 var(--spacing-lg);
  }
  
  .hero-title {
    font-size: var(--font-size-3xl);
  }
  
  .hero-meta {
    flex-direction: column;
    gap: var(--spacing-sm);
  }
  
  .score-summary-card {
    flex-direction: column;
    text-align: center;
    padding: var(--spacing-xl);
  }
  
  .main-content {
    padding: var(--spacing-xl) var(--spacing-lg);
  }
  
  .tab-container {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .info-grid,
  .metrics-grid,
  .insights-grid {
    grid-template-columns: 1fr;
  }
  
  .quick-actions {
    justify-content: center;
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
  
  .score-summary-card {
    padding: var(--spacing-lg);
  }
  
  .circular-progress {
    width: 120px;
    height: 120px;
  }
  
  .score-number {
    font-size: var(--font-size-2xl);
  }
  
  .main-content {
    padding: var(--spacing-lg) var(--spacing-md);
  }
  
  .section-title {
    font-size: var(--font-size-lg);
  }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .hero-badge,
  .score-summary-card,
  .metric-card,
  .insight-card,
  .action-btn,
  .tab-btn,
  .floating-chart,
  .progress-fill {
    animation: none;
    transition: none;
  }
  
  .tab-panel {
    animation: none;
  }
}
</style> 