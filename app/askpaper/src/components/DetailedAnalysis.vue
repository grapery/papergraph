<template>
  <div class="detailed-analysis">
    <div class="analysis-header">
      <div class="analysis-title">
        <h2>多维度论文分析</h2>
        <p>系统性评估论文质量的专业分析工具</p>
      </div>
      <div class="analysis-actions">
        <button class="refresh-btn" @click="refreshAnalysis" :disabled="isRefreshing">
          <span v-if="isRefreshing" class="btn-spinner"></span>
          <span v-else>🔄</span>
          刷新分析
        </button>
      </div>
    </div>

    <!-- 总体评分卡片 -->
    <div class="overall-score-card">
      <div class="score-visual">
        <div class="circular-progress">
          <svg class="progress-ring" width="120" height="120">
            <circle
              class="progress-ring-circle"
              stroke="#e5e7eb"
              stroke-width="8"
              fill="transparent"
              r="52"
              cx="60"
              cy="60"
            />
            <circle
              class="progress-ring-circle progress-ring-fill"
              :stroke="getScoreColor(overallScore)"
              stroke-width="8"
              fill="transparent"
              r="52"
              cx="60"
              cy="60"
              :stroke-dasharray="circumference"
              :stroke-dashoffset="dashOffset"
              transform="rotate(-90 60 60)"
            />
          </svg>
          <div class="score-text">
            <div class="score-number">{{ overallScore }}</div>
            <div class="score-label">总分</div>
          </div>
        </div>
      </div>
      <div class="score-details">
        <div class="score-summary">
          <h3>综合评价</h3>
          <p class="score-description">{{ getScoreDescription(overallScore) }}</p>
          <div class="score-recommendation">
            <span class="recommendation-label">建议：</span>
            <span class="recommendation-text">{{ getRecommendation(overallScore) }}</span>
          </div>
        </div>
        <div class="score-distribution">
          <div class="distribution-item" v-for="category in categories" :key="category.key">
            <div class="distribution-label">{{ category.name }}</div>
            <div class="distribution-bar">
              <div 
                class="distribution-fill" 
                :style="{ 
                  width: `${category.score * 10}%`, 
                  backgroundColor: getScoreColor(category.score) 
                }"
              ></div>
            </div>
            <div class="distribution-value">{{ category.score }}/10</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 详细维度分析 -->
    <div class="detailed-dimensions">
      <h3>详细维度分析</h3>
      <div class="dimensions-grid">
        <div 
          v-for="dimension in dimensions" 
          :key="dimension.key"
          class="dimension-card"
          :class="{ 'expanded': expandedDimension === dimension.key }"
          @click="toggleDimension(dimension.key)"
        >
          <div class="dimension-header">
            <div class="dimension-icon">{{ dimension.icon }}</div>
            <div class="dimension-info">
              <h4>{{ dimension.name }}</h4>
              <p>{{ dimension.description }}</p>
            </div>
            <div class="dimension-score">
              <div class="score-circle" :style="{ backgroundColor: getScoreColor(dimension.score) }">
                {{ dimension.score }}
              </div>
            </div>
          </div>
          
          <div v-if="expandedDimension === dimension.key" class="dimension-details">
            <div class="metrics-list">
              <div 
                v-for="metric in dimension.metrics" 
                :key="metric.key"
                class="metric-item"
              >
                <div class="metric-header">
                  <div class="metric-title">{{ metric.name }}</div>
                  <div class="metric-score">
                    <div class="score-bar">
                      <div 
                        class="score-fill" 
                        :style="{ 
                          width: `${metric.score * 10}%`, 
                          backgroundColor: getScoreColor(metric.score) 
                        }"
                      ></div>
                    </div>
                    <span class="score-value">{{ metric.score }}/10</span>
                  </div>
                </div>
                <div class="metric-description">{{ metric.description }}</div>
                <div class="metric-evidence">
                  <div class="evidence-item" v-for="evidence in metric.evidence" :key="evidence">
                    <span class="evidence-bullet">•</span>
                    <span class="evidence-text">{{ evidence }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 分析建议 -->
    <div class="analysis-recommendations">
      <h3>改进建议</h3>
      <div class="recommendations-grid">
        <div class="recommendation-card priority-high">
          <div class="recommendation-header">
            <span class="priority-badge">高优先级</span>
            <h4>重点改进</h4>
          </div>
          <div class="recommendation-content">
            <div v-for="item in highPriorityRecommendations" :key="item" class="recommendation-item">
              {{ item }}
            </div>
          </div>
        </div>
        
        <div class="recommendation-card priority-medium">
          <div class="recommendation-header">
            <span class="priority-badge">中优先级</span>
            <h4>优化建议</h4>
          </div>
          <div class="recommendation-content">
            <div v-for="item in mediumPriorityRecommendations" :key="item" class="recommendation-item">
              {{ item }}
            </div>
          </div>
        </div>
        
        <div class="recommendation-card priority-low">
          <div class="recommendation-header">
            <span class="priority-badge">低优先级</span>
            <h4>完善细节</h4>
          </div>
          <div class="recommendation-content">
            <div v-for="item in lowPriorityRecommendations" :key="item" class="recommendation-item">
              {{ item }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 对比分析 -->
    <div class="comparative-analysis">
      <h3>对比分析</h3>
      <div class="comparison-chart">
        <div class="chart-container">
          <canvas ref="radarChart"></canvas>
        </div>
        <div class="comparison-legend">
          <div class="legend-item">
            <div class="legend-color" style="backgroundColor: #3b82f6"></div>
            <span>当前论文</span>
          </div>
          <div class="legend-item">
            <div class="legend-color" style="backgroundColor: #10b981"></div>
            <span>领域平均</span>
          </div>
          <div class="legend-item">
            <div class="legend-color" style="backgroundColor: #f59e0b"></div>
            <span>优秀论文</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import Chart from 'chart.js/auto'

const props = defineProps({
  analysisResult: {
    type: Object,
    required: true
  },
  evaluationData: {
    type: Object,
    default: null
  }
})

const expandedDimension = ref(null)
const isRefreshing = ref(false)
const radarChart = ref(null)

// 移动端手势支持
const touchStartY = ref(0)
const touchEndY = ref(0)
const isMobile = ref(false)

// 总体评分
const overallScore = computed(() => {
  if (props.evaluationData && props.evaluationData.overall_score) {
    return props.evaluationData.overall_score
  }
  const scores = dimensions.value.map(d => d.score)
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length * 10) / 10
})

// 分类评分
const categories = computed(() => {
  if (props.evaluationData) {
    return [
      { key: 'content', name: '内容质量', score: props.evaluationData.content_score || 0 },
      { key: 'structure', name: '结构逻辑', score: props.evaluationData.structure_score || 0 },
      { key: 'language', name: '语言表达', score: props.evaluationData.language_score || 0 },
      { key: 'method', name: '方法证据', score: props.evaluationData.method_score || 0 },
      { key: 'value', name: '价值影响', score: props.evaluationData.value_score || 0 }
    ]
  }
  
  return [
    { key: 'content', name: '内容质量', score: getContentScore() },
    { key: 'structure', name: '结构逻辑', score: getStructureScore() },
    { key: 'language', name: '语言表达', score: getLanguageScore() },
    { key: 'method', name: '方法证据', score: getMethodScore() },
    { key: 'value', name: '价值影响', score: getValueScore() }
  ]
})

// 详细维度数据
const dimensions = computed(() => {
  if (props.evaluationData && props.evaluationData.dimensions) {
    return props.evaluationData.dimensions.map(dim => ({
      key: dim.dimension_key,
      name: dim.dimension_name,
      icon: getDimensionIcon(dim.dimension_key),
      description: dim.description,
      score: dim.score,
      metrics: dim.metrics?.map(metric => ({
        key: metric.metric_key,
        name: metric.metric_name,
        description: metric.description,
        score: metric.score,
        evidence: metric.evidence ? metric.evidence.split('\n').filter(e => e.trim()) : []
      })) || []
    }))
  }
  
  // 默认数据
  return [
    {
      key: 'originality',
      name: '原创性',
      icon: '💡',
      description: '论文的独创性和新颖性',
      score: 8,
      metrics: [
        {
          key: 'innovation',
          name: '创新点明确',
          description: '是否提出了新的观点、方法或发现',
          score: 8,
          evidence: ['提出了新的分析框架', '填补了现有研究空白', '具有理论创新性']
        },
        {
          key: 'comparison',
          name: '文献对比',
          description: '与已有研究的对比分析',
          score: 7,
          evidence: ['文献综述全面', '对比分析清晰', '定位准确']
        }
      ]
    },
    {
      key: 'depth',
      name: '深度洞察',
      icon: '🔍',
      description: '分析的深度和洞察力',
      score: 7,
      metrics: [
        {
          key: 'analysis',
          name: '分析层次',
          description: '从现象到本质的分析深度',
          score: 7,
          evidence: ['多层次分析', '机制解释清晰', '见解独到']
        },
        {
          key: 'insight',
          name: '洞察力',
          description: '对问题的深刻理解和见解',
          score: 7,
          evidence: ['提炼出规律', '具有启发性', '视角独特']
        }
      ]
    },
    {
      key: 'logic',
      name: '逻辑严谨',
      icon: '🧩',
      description: '论证的逻辑性和严密性',
      score: 8,
      metrics: [
        {
          key: 'coherence',
          name: '逻辑连贯',
          description: '论证过程的逻辑链条',
          score: 8,
          evidence: ['论证结构完整', '推理过程严密', '无逻辑漏洞']
        },
        {
          key: 'structure',
          name: '结构清晰',
          description: '文章结构的合理性',
          score: 8,
          evidence: ['层次分明', '过渡自然', '重点突出']
        }
      ]
    },
    {
      key: 'evidence',
      name: '证据支撑',
      icon: '📊',
      description: '论据的充分性和可靠性',
      score: 6,
      metrics: [
        {
          key: 'data',
          name: '数据支持',
          description: '数据的充分性和可靠性',
          score: 6,
          evidence: ['数据量适中', '来源可靠', '分析方法恰当']
        },
        {
          key: 'citation',
          name: '文献支撑',
          description: '参考文献的质量和相关性',
          score: 6,
          evidence: ['文献权威', '引用适中', '支撑有力']
        }
      ]
    },
    {
      key: 'language',
      name: '语言表达',
      icon: '✍️',
      description: '语言的质量和表达效果',
      score: 7,
      metrics: [
        {
          key: 'clarity',
          name: '表达清晰',
          description: '语言表达的清晰度',
          score: 7,
          evidence: ['表达简洁', '逻辑清晰', '易于理解']
        },
        {
          key: 'accuracy',
          name: '用词准确',
          description: '术语使用的准确性',
          score: 7,
          evidence: ['术语规范', '用词准确', '风格统一']
        }
      ]
    },
    {
      key: 'value',
      name: '学术价值',
      icon: '🎯',
      description: '论文的学术贡献和应用价值',
      score: 7,
      metrics: [
        {
          key: 'contribution',
          name: '学术贡献',
          description: '对学科发展的贡献',
          score: 7,
          evidence: ['理论贡献', '方法创新', '推动发展']
        },
        {
          key: 'application',
          name: '应用价值',
          description: '实际应用的可能性',
          score: 7,
          evidence: ['实践指导', '应用前景', '社会价值']
        }
      ]
    }
  ]
})

// 计算各类别得分
function getContentScore() {
  return Math.round((dimensions.value[0].score + dimensions.value[1].score) / 2 * 10) / 10
}

function getStructureScore() {
  return dimensions.value[2].score
}

function getLanguageScore() {
  return dimensions.value[4].score
}

function getMethodScore() {
  return dimensions.value[3].score
}

function getValueScore() {
  return dimensions.value[5].score
}

// 圆形进度条
const circumference = 2 * Math.PI * 52
const dashOffset = computed(() => {
  return circumference - (overallScore.value / 10) * circumference
})

// 分数颜色
function getScoreColor(score) {
  if (score >= 8) return '#10b981'
  if (score >= 6) return '#f59e0b'
  if (score >= 4) return '#ef4444'
  return '#6b7280'
}

// 获取维度图标
function getDimensionIcon(key) {
  const icons = {
    originality: '💡',
    depth: '🔍',
    logic: '🧩',
    evidence: '📊',
    language: '✍️',
    value: '🎯'
  }
  return icons[key] || '📄'
}

// 分数描述
function getScoreDescription(score) {
  if (props.evaluationData && props.evaluationData.summary) {
    return props.evaluationData.summary
  }
  if (score >= 8) return '优秀论文，具有较高的学术价值和创新性'
  if (score >= 6) return '良好论文，具备基本学术要求，有改进空间'
  if (score >= 4) return '一般论文，需要大幅改进才能达到发表标准'
  return '有待改进，建议重新审视研究方向和方法'
}

// 改进建议
function getRecommendation(score) {
  if (props.evaluationData && props.evaluationData.recommendation) {
    return props.evaluationData.recommendation
  }
  if (score >= 8) return '可以考虑投稿到高水平期刊，建议进一步完善细节'
  if (score >= 6) return '适合投稿到一般期刊，建议重点改进薄弱环节'
  if (score >= 4) return '需要大幅改进，建议补充数据和分析'
  return '建议重新构思论文框架和研究方法'
}

// 改进建议列表
const highPriorityRecommendations = computed(() => {
  const recommendations = []
  dimensions.value.forEach(dimension => {
    if (dimension.score < 6) {
      recommendations.push(`加强${dimension.name}方面的论述和证据`)
    }
  })
  return recommendations
})

const mediumPriorityRecommendations = computed(() => [
  '优化语言表达，提高可读性',
  '完善文献综述部分',
  '增加实际应用案例'
])

const lowPriorityRecommendations = computed(() => [
  '检查格式规范',
  '优化图表展示',
  '补充参考文献'
])

// 切换维度展开
function toggleDimension(key) {
  if (expandedDimension.value === key) {
    expandedDimension.value = null
  } else {
    expandedDimension.value = key
  }
}

// 刷新分析
async function refreshAnalysis() {
  isRefreshing.value = true
  // 模拟刷新过程
  await new Promise(resolve => setTimeout(resolve, 2000))
  isRefreshing.value = false
}

// 初始化雷达图
onMounted(async () => {
  await nextTick()
  initRadarChart()
  
  // 检查是否为移动端
  checkScreenSize()
  window.addEventListener('resize', checkScreenSize)
  
  // 添加触摸手势支持
  document.addEventListener('touchstart', handleTouchStart, { passive: true })
  document.addEventListener('touchend', handleTouchEnd, { passive: true })
})

// 组件卸载时清理事件监听
onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize)
  document.removeEventListener('touchstart', handleTouchStart)
  document.removeEventListener('touchend', handleTouchEnd)
})

// 检查屏幕尺寸
function checkScreenSize() {
  isMobile.value = window.innerWidth <= 768
}

// 处理触摸开始事件
function handleTouchStart(event) {
  if (!isMobile.value) return
  touchStartY.value = event.touches[0].clientY
}

// 处理触摸结束事件
function handleTouchEnd(event) {
  if (!isMobile.value) return
  touchEndY.value = event.changedTouches[0].clientY
  handleVerticalSwipe()
}

// 处理垂直滑动手势
function handleVerticalSwipe() {
  const deltaY = touchEndY.value - touchStartY.value
  const minSwipeDistance = 100
  
  if (Math.abs(deltaY) > minSwipeDistance) {
    if (deltaY < 0) {
      // 向上滑动 - 展开第一个维度
      if (!expandedDimension.value && dimensions.value.length > 0) {
        expandedDimension.value = dimensions.value[0].key
      }
    } else {
      // 向下滑动 - 收起所有维度
      if (expandedDimension.value) {
        expandedDimension.value = null
      }
    }
  }
}

function initRadarChart() {
  const ctx = radarChart.value.getContext('2d')
  
  // 获取当前论文的雷达图数据
  const currentPaperData = props.evaluationData ? [
    props.evaluationData.originality_score || 0,
    props.evaluationData.depth_score || 0,
    props.evaluationData.logic_score || 0,
    props.evaluationData.evidence_score || 0,
    props.evaluationData.language_score || 0,
    props.evaluationData.value_score || 0
  ] : dimensions.value.map(d => d.score)
  
  new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ['原创性', '深度洞察', '逻辑严谨', '证据支撑', '语言表达', '学术价值'],
      datasets: [{
        label: '当前论文',
        data: currentPaperData,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#3b82f6'
      }, {
        label: '领域平均',
        data: [6, 6, 6, 6, 6, 6],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        pointBackgroundColor: '#10b981',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#10b981'
      }, {
        label: '优秀论文',
        data: [9, 9, 9, 8, 8, 9],
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        pointBackgroundColor: '#f59e0b',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#f59e0b'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          beginAtZero: true,
          max: 10,
          ticks: {
            stepSize: 2
          }
        }
      },
      plugins: {
        legend: {
          display: false
        }
      }
    }
  })
}
</script>

<style scoped>
.detailed-analysis {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.analysis-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.analysis-title h2 {
  font-size: 2rem;
  font-weight: bold;
  color: #1e293b;
  margin: 0 0 8px 0;
}

.analysis-title p {
  color: #64748b;
  margin: 0;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.refresh-btn:hover:not(:disabled) {
  background: #e2e8f0;
  transform: translateY(-1px);
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #64748b;
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 总体评分卡片 */
.overall-score-card {
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
  display: flex;
  gap: 30px;
}

.score-visual {
  flex-shrink: 0;
}

.circular-progress {
  position: relative;
  width: 120px;
  height: 120px;
}

.progress-ring-circle {
  transition: stroke-dashoffset 0.35s;
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
  font-size: 2rem;
  font-weight: bold;
  color: #1e293b;
}

.score-label {
  font-size: 0.875rem;
  color: #64748b;
}

.score-details {
  flex: 1;
}

.score-summary h3 {
  font-size: 1.5rem;
  color: #1e293b;
  margin: 0 0 12px 0;
}

.score-description {
  color: #475569;
  margin-bottom: 16px;
  line-height: 1.6;
}

.score-recommendation {
  background: #f8fafc;
  padding: 12px 16px;
  border-radius: 8px;
  border-left: 4px solid #3b82f6;
}

.recommendation-label {
  font-weight: 600;
  color: #1e293b;
}

.recommendation-text {
  color: #475569;
}

.score-distribution {
  margin-top: 20px;
}

.distribution-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.distribution-label {
  min-width: 80px;
  font-size: 0.9rem;
  color: #475569;
}

.distribution-bar {
  flex: 1;
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
}

.distribution-fill {
  height: 100%;
  transition: width 0.6s ease;
}

.distribution-value {
  min-width: 40px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #1e293b;
}

/* 详细维度分析 */
.detailed-dimensions h3 {
  font-size: 1.5rem;
  color: #1e293b;
  margin-bottom: 20px;
}

.dimensions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.dimension-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.dimension-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.dimension-card.expanded {
  border-color: #3b82f6;
}

.dimension-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.dimension-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.dimension-info {
  flex: 1;
}

.dimension-info h4 {
  font-size: 1.2rem;
  color: #1e293b;
  margin: 0 0 4px 0;
}

.dimension-info p {
  color: #64748b;
  margin: 0;
  font-size: 0.9rem;
}

.score-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 0.9rem;
}

.dimension-details {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
}

.metrics-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.metric-item {
  background: #f8fafc;
  padding: 16px;
  border-radius: 8px;
}

.metric-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.metric-title {
  flex: 1;
  font-weight: 600;
  color: #1e293b;
}

.metric-score {
  display: flex;
  align-items: center;
  gap: 8px;
}

.score-bar {
  width: 60px;
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
}

.score-fill {
  height: 100%;
  transition: width 0.6s ease;
}

.score-value {
  font-size: 0.8rem;
  font-weight: 600;
  color: #1e293b;
}

.metric-description {
  color: #64748b;
  font-size: 0.9rem;
  margin-bottom: 8px;
}

.metric-evidence {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.evidence-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 0.8rem;
  color: #475569;
}

.evidence-bullet {
  color: #10b981;
  margin-top: 2px;
}

/* 分析建议 */
.analysis-recommendations h3 {
  font-size: 1.5rem;
  color: #1e293b;
  margin-bottom: 20px;
}

.recommendations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.recommendation-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.recommendation-card.priority-high {
  border-left: 4px solid #ef4444;
}

.recommendation-card.priority-medium {
  border-left: 4px solid #f59e0b;
}

.recommendation-card.priority-low {
  border-left: 4px solid #10b981;
}

.recommendation-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.priority-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  color: white;
}

.priority-high .priority-badge {
  background: #ef4444;
}

.priority-medium .priority-badge {
  background: #f59e0b;
}

.priority-low .priority-badge {
  background: #10b981;
}

.recommendation-header h4 {
  margin: 0;
  color: #1e293b;
}

.recommendation-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.recommendation-item {
  padding: 8px 0;
  color: #475569;
  font-size: 0.9rem;
  border-bottom: 1px solid #f1f5f9;
}

.recommendation-item:last-child {
  border-bottom: none;
}

/* 对比分析 */
.comparative-analysis h3 {
  font-size: 1.5rem;
  color: #1e293b;
  margin-bottom: 20px;
}

.comparison-chart {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.chart-container {
  height: 400px;
  margin-bottom: 20px;
}

.comparison-legend {
  display: flex;
  justify-content: center;
  gap: 24px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: #475569;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
}

@media (max-width: 768px) {
  .detailed-analysis {
    padding: 15px;
  }
  
  .analysis-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }
  
  .overall-score-card {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .dimensions-grid {
    grid-template-columns: 1fr;
  }
  
  .recommendations-grid {
    grid-template-columns: 1fr;
  }
}
</style>