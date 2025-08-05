<template>
  <div class="evaluation-statistics">
    <div class="page-header">
      <h1>评价统计与对比</h1>
      <p>查看论文评价的统计数据和对比分析</p>
    </div>

    <!-- 统计概览 -->
    <div class="stats-overview">
      <div class="stats-card">
        <div class="stats-icon">📊</div>
        <div class="stats-content">
          <div class="stats-number">{{ statistics.total_evaluations || 0 }}</div>
          <div class="stats-label">总评价数</div>
        </div>
      </div>
      
      <div class="stats-card">
        <div class="stats-icon">⭐</div>
        <div class="stats-content">
          <div class="stats-number">{{ (statistics.avg_overall_score || 0).toFixed(1) }}</div>
          <div class="stats-label">平均评分</div>
        </div>
      </div>
      
      <div class="stats-card">
        <div class="stats-icon">🏆</div>
        <div class="stats-content">
          <div class="stats-number">{{ getScoreDistribution('excellent') }}</div>
          <div class="stats-label">优秀评价</div>
        </div>
      </div>
      
      <div class="stats-card">
        <div class="stats-icon">📈</div>
        <div class="stats-content">
          <div class="stats-number">{{ getScoreDistribution('good') }}</div>
          <div class="stats-label">良好评价</div>
        </div>
      </div>
    </div>

    <!-- 论文选择和对比 -->
    <div class="comparison-section">
      <div class="section-header">
        <h2>论文对比分析</h2>
        <button class="btn-compare" @click="comparePapers" :disabled="selectedPapers.length < 2">
          对比选中论文 ({{ selectedPapers.length }}/2)
        </button>
      </div>

      <div class="paper-selection">
        <div class="selection-controls">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="搜索论文..." 
            class="search-input"
            @input="handleSearch"
          />
          <select v-model="sortBy" class="sort-select">
            <option value="score">按评分排序</option>
            <option value="date">按时间排序</option>
            <option value="title">按标题排序</option>
          </select>
        </div>

        <div class="papers-grid">
          <div 
            v-for="paper in papers" 
            :key="paper.id" 
            class="paper-card"
            :class="{ 'selected': isSelected(paper.id) }"
            @click="togglePaperSelection(paper)"
          >
            <div class="paper-checkbox">
              <input 
                type="checkbox" 
                :checked="isSelected(paper.id)"
                @change="togglePaperSelection(paper)"
              />
            </div>
            <div class="paper-info">
              <h3>{{ paper.file_name }}</h3>
              <div class="paper-stats">
                <span class="stat">评分: {{ paper.avg_score?.toFixed(1) || 'N/A' }}</span>
                <span class="stat">评价数: {{ paper.evaluation_count || 0 }}</span>
                <span class="stat">上传时间: {{ formatDate(paper.created_at) }}</span>
              </div>
            </div>
            <div class="paper-score" v-if="paper.avg_score">
              <div class="score-circle" :style="{ backgroundColor: getScoreColor(paper.avg_score) }">
                {{ paper.avg_score.toFixed(1) }}
              </div>
            </div>
          </div>
        </div>

        <!-- 分页 -->
        <div v-if="totalPages > 1" class="pagination">
          <button 
            class="page-btn" 
            :disabled="currentPage === 1" 
            @click="changePage(currentPage - 1)"
          >
            上一页
          </button>
          <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
          <button 
            class="page-btn" 
            :disabled="currentPage === totalPages" 
            @click="changePage(currentPage + 1)"
          >
            下一页
          </button>
        </div>
      </div>
    </div>

    <!-- 对比结果 -->
    <div v-if="showComparison" class="comparison-results">
      <div class="section-header">
        <h2>对比结果</h2>
        <button class="btn-close" @click="closeComparison">✕</button>
      </div>

      <!-- 总体评分对比 -->
      <div class="comparison-chart">
        <h3>总体评分对比</h3>
        <div class="chart-container">
          <canvas ref="overallChart"></canvas>
        </div>
      </div>

      <!-- 维度评分对比 -->
      <div class="comparison-chart">
        <h3>维度评分对比</h3>
        <div class="chart-container">
          <canvas ref="dimensionsChart"></canvas>
        </div>
      </div>

      <!-- 详细对比表格 -->
      <div class="comparison-table">
        <h3>详细对比数据</h3>
        <table>
          <thead>
            <tr>
              <th>论文</th>
              <th>总体评分</th>
              <th>原创性</th>
              <th>深度洞察</th>
              <th>逻辑严谨</th>
              <th>证据支撑</th>
              <th>语言表达</th>
              <th>学术价值</th>
              <th>评价数</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="paper in comparisonData" :key="paper.id">
              <td class="paper-name">{{ paper.file_name }}</td>
              <td class="score-cell">{{ paper.avg_score?.toFixed(1) || 'N/A' }}</td>
              <td class="score-cell">{{ paper.originality_score?.toFixed(1) || 'N/A' }}</td>
              <td class="score-cell">{{ paper.depth_score?.toFixed(1) || 'N/A' }}</td>
              <td class="score-cell">{{ paper.logic_score?.toFixed(1) || 'N/A' }}</td>
              <td class="score-cell">{{ paper.evidence_score?.toFixed(1) || 'N/A' }}</td>
              <td class="score-cell">{{ paper.language_score?.toFixed(1) || 'N/A' }}</td>
              <td class="score-cell">{{ paper.value_score?.toFixed(1) || 'N/A' }}</td>
              <td>{{ paper.evaluation_count || 0 }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 高分评价展示 -->
    <div class="top-evaluations">
      <div class="section-header">
        <h2>高分评价展示</h2>
        <button class="btn-refresh" @click="loadTopEvaluations">🔄 刷新</button>
      </div>

      <div v-if="topEvaluations.length === 0" class="empty-state">
        <div class="empty-icon">🏆</div>
        <p>暂无高分评价</p>
      </div>

      <div v-else class="evaluations-grid">
        <div 
          v-for="evaluation in topEvaluations" 
          :key="evaluation.id" 
          class="evaluation-card"
          @click="viewEvaluation(evaluation)"
        >
          <div class="card-header">
            <div class="score-circle" :style="{ backgroundColor: getScoreColor(evaluation.overall_score) }">
              {{ evaluation.overall_score }}
            </div>
            <div class="card-info">
              <h3>{{ evaluation.paper?.file_name || '未知论文' }}</h3>
              <p>{{ evaluation.summary?.substring(0, 100) || '暂无摘要' }}{{ evaluation.summary?.length > 100 ? '...' : '' }}</p>
            </div>
          </div>
          
          <div class="card-footer">
            <div class="evaluator-info">
              <img :src="evaluation.user?.avatar || defaultAvatar" class="evaluator-avatar" />
              <span>{{ evaluation.user?.name || '匿名用户' }}</span>
            </div>
            <div class="evaluation-stats">
              <span class="likes">❤️ {{ evaluation.like_count || 0 }}</span>
              <span class="date">{{ formatDate(evaluation.created_at) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 评价详情模态框 -->
    <div v-if="showDetail" class="modal-overlay" @click="closeDetail">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>评价详情</h2>
          <button class="close-btn" @click="closeDetail">✕</button>
        </div>
        <div class="modal-body">
          <DetailedAnalysis 
            :analysisResult="{}" 
            :evaluationData="selectedEvaluation" 
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { evaluationApi, evaluationUtils } from '../api/evaluation'
import DetailedAnalysis from '../components/DetailedAnalysis.vue'
import Chart from 'chart.js/auto'

// 响应式数据
const statistics = ref({})
const papers = ref([])
const topEvaluations = ref([])
const selectedPapers = ref([])
const showComparison = ref(false)
const showDetail = ref(false)
const selectedEvaluation = ref(null)
const comparisonData = ref([])
const searchQuery = ref('')
const sortBy = ref('score')
const currentPage = ref(1)
const pageSize = ref(12)
const total = ref(0)
const loading = ref(false)

// 图表引用
const overallChart = ref(null)
const dimensionsChart = ref(null)

// 默认头像
const defaultAvatar = 'https://api.dicebear.com/7.x/miniavs/svg?seed=1'

// 计算属性
const totalPages = computed(() => Math.ceil(total.value / pageSize.value))

// 初始化
onMounted(async () => {
  await loadStatistics()
  await loadPapers()
  await loadTopEvaluations()
})

// 加载统计数据
async function loadStatistics() {
  try {
    // 这里需要传入论文ID，暂时使用示例数据
    const response = await evaluationApi.getEvaluationStatistics(1)
    statistics.value = response.data.data
  } catch (error) {
    console.error('Failed to load statistics:', error)
  }
}

// 加载论文列表
async function loadPapers() {
  loading.value = true
  try {
    // 这里需要调用获取论文列表的API
    // 暂时使用模拟数据
    papers.value = [
      {
        id: 1,
        file_name: '深度学习在自然语言处理中的应用.pdf',
        avg_score: 7.5,
        evaluation_count: 3,
        created_at: '2024-01-15T10:30:00Z',
        originality_score: 8.0,
        depth_score: 7.5,
        logic_score: 8.0,
        evidence_score: 6.5,
        language_score: 7.0,
        value_score: 7.5
      },
      {
        id: 2,
        file_name: '基于图神经网络的社交网络分析研究.pdf',
        avg_score: 8.2,
        evaluation_count: 2,
        created_at: '2024-01-10T14:20:00Z',
        originality_score: 8.5,
        depth_score: 8.0,
        logic_score: 8.5,
        evidence_score: 7.5,
        language_score: 8.0,
        value_score: 8.5
      }
    ]
    total.value = papers.value.length
  } catch (error) {
    console.error('Failed to load papers:', error)
  } finally {
    loading.value = false
  }
}

// 加载高分评价
async function loadTopEvaluations() {
  try {
    const response = await evaluationApi.getTopEvaluations(10)
    topEvaluations.value = response.data.data
  } catch (error) {
    console.error('Failed to load top evaluations:', error)
  }
}

// 获取分数分布
function getScoreDistribution(level) {
  const distribution = statistics.value.score_distribution || {}
  return distribution[level] || 0
}

// 切换论文选择
function togglePaperSelection(paper) {
  const index = selectedPapers.value.findIndex(p => p.id === paper.id)
  if (index > -1) {
    selectedPapers.value.splice(index, 1)
  } else {
    if (selectedPapers.value.length < 2) {
      selectedPapers.value.push(paper)
    }
  }
}

// 检查是否选中
function isSelected(paperId) {
  return selectedPapers.value.some(p => p.id === paperId)
}

// 对比论文
function comparePapers() {
  if (selectedPapers.value.length < 2) {
    alert('请选择至少两篇论文进行对比')
    return
  }
  
  comparisonData.value = selectedPapers.value
  showComparison.value = true
  
  // 等待DOM更新后初始化图表
  nextTick(() => {
    initComparisonCharts()
  })
}

// 关闭对比
function closeComparison() {
  showComparison.value = false
  selectedPapers.value = []
  comparisonData.value = []
  
  // 销毁图表
  if (overallChart.value) {
    overallChart.value.destroy()
  }
  if (dimensionsChart.value) {
    dimensionsChart.value.destroy()
  }
}

// 初始化对比图表
function initComparisonCharts() {
  initOverallChart()
  initDimensionsChart()
}

// 初始化总体评分对比图表
function initOverallChart() {
  const ctx = overallChart.value.getContext('2d')
  
  overallChart.value = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: comparisonData.value.map(p => p.file_name.substring(0, 20) + '...'),
      datasets: [{
        label: '总体评分',
        data: comparisonData.value.map(p => p.avg_score || 0),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)'
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)'
        ],
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          max: 10,
          ticks: {
            stepSize: 1
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

// 初始化维度评分对比图表
function initDimensionsChart() {
  const ctx = dimensionsChart.value.getContext('2d')
  
  const dimensions = ['原创性', '深度洞察', '逻辑严谨', '证据支撑', '语言表达', '学术价值']
  const datasets = comparisonData.value.map((paper, index) => ({
    label: paper.file_name.substring(0, 15) + '...',
    data: [
      paper.originality_score || 0,
      paper.depth_score || 0,
      paper.logic_score || 0,
      paper.evidence_score || 0,
      paper.language_score || 0,
      paper.value_score || 0
    ],
    backgroundColor: index === 0 ? 'rgba(59, 130, 246, 0.2)' : 'rgba(16, 185, 129, 0.2)',
    borderColor: index === 0 ? 'rgba(59, 130, 246, 1)' : 'rgba(16, 185, 129, 1)',
    borderWidth: 2,
    pointBackgroundColor: index === 0 ? 'rgba(59, 130, 246, 1)' : 'rgba(16, 185, 129, 1)',
    pointBorderColor: '#fff',
    pointHoverBackgroundColor: '#fff',
    pointHoverBorderColor: index === 0 ? 'rgba(59, 130, 246, 1)' : 'rgba(16, 185, 129, 1)'
  }))
  
  dimensionsChart.value = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: dimensions,
      datasets: datasets
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
          position: 'bottom'
        }
      }
    }
  })
}

// 搜索处理
function handleSearch() {
  // 实现搜索逻辑
  console.log('Searching for:', searchQuery.value)
}

// 分页处理
function changePage(page) {
  currentPage.value = page
  loadPapers()
}

// 查看评价详情
function viewEvaluation(evaluation) {
  selectedEvaluation.value = evaluation
  showDetail.value = true
}

// 关闭详情
function closeDetail() {
  showDetail.value = false
  selectedEvaluation.value = null
}

// 格式化日期
function formatDate(dateString) {
  if (!dateString) return '未知时间'
  
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays > 0) {
    return `${diffDays}天前`
  } else {
    return '今天'
  }
}

// 获取分数颜色
function getScoreColor(score) {
  return evaluationUtils.getScoreColor(score)
}
</script>

<style scoped>
.evaluation-statistics {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-header h1 {
  font-size: 2.5rem;
  color: #1e293b;
  margin-bottom: 10px;
}

.page-header p {
  color: #64748b;
  font-size: 1.1rem;
}

/* 统计概览样式 */
.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.stats-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 16px;
  transition: transform 0.2s ease;
}

.stats-card:hover {
  transform: translateY(-2px);
}

.stats-icon {
  font-size: 2.5rem;
  opacity: 0.8;
}

.stats-number {
  font-size: 2rem;
  font-weight: bold;
  color: #1e293b;
}

.stats-label {
  color: #64748b;
  font-size: 0.9rem;
}

/* 对比分析样式 */
.comparison-section {
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 40px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e2e8f0;
}

.section-header h2 {
  color: #1e293b;
  margin: 0;
}

.btn-compare,
.btn-close,
.btn-refresh {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-compare {
  background: #3b82f6;
  color: white;
}

.btn-compare:hover:not(:disabled) {
  background: #2563eb;
}

.btn-compare:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.btn-close {
  background: #ef4444;
  color: white;
}

.btn-close:hover {
  background: #dc2626;
}

.btn-refresh {
  background: #f3f4f6;
  color: #374151;
}

.btn-refresh:hover {
  background: #e5e7eb;
}

/* 论文选择样式 */
.selection-controls {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.search-input,
.sort-select {
  padding: 10px 15px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
}

.search-input {
  flex: 1;
  max-width: 400px;
}

.sort-select {
  min-width: 150px;
}

.papers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.paper-card {
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 15px;
}

.paper-card:hover {
  border-color: #3b82f6;
  background: #eff6ff;
}

.paper-card.selected {
  border-color: #3b82f6;
  background: #eff6ff;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.paper-checkbox input {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.paper-info {
  flex: 1;
}

.paper-info h3 {
  color: #1e293b;
  margin: 0 0 10px 0;
  font-size: 1.1rem;
}

.paper-stats {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.stat {
  color: #64748b;
  font-size: 0.9rem;
}

.score-circle {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 1.2rem;
}

/* 对比结果样式 */
.comparison-results {
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 40px;
}

.comparison-chart {
  margin-bottom: 40px;
}

.comparison-chart h3 {
  color: #1e293b;
  margin-bottom: 20px;
}

.chart-container {
  height: 400px;
  position: relative;
}

.comparison-table {
  margin-top: 40px;
}

.comparison-table h3 {
  color: #1e293b;
  margin-bottom: 20px;
}

.comparison-table table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.comparison-table th,
.comparison-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

.comparison-table th {
  background: #f8fafc;
  color: #374151;
  font-weight: 600;
}

.comparison-table .paper-name {
  font-weight: 500;
  color: #1e293b;
}

.comparison-table .score-cell {
  font-weight: 600;
  color: #1e293b;
}

/* 高分评价样式 */
.top-evaluations {
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.evaluations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.evaluation-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.evaluation-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-color: #3b82f6;
}

.card-header {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
}

.card-info {
  flex: 1;
}

.card-info h3 {
  color: #1e293b;
  margin: 0 0 5px 0;
  font-size: 1.1rem;
}

.card-info p {
  color: #64748b;
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.4;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #e2e8f0;
}

.evaluator-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.evaluator-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
}

.evaluation-stats {
  display: flex;
  gap: 15px;
  font-size: 0.9rem;
}

.evaluation-stats .likes {
  color: #ef4444;
}

.evaluation-stats .date {
  color: #64748b;
}

/* 空状态样式 */
.empty-state {
  text-align: center;
  padding: 60px 0;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-state p {
  color: #64748b;
  margin: 0;
}

/* 分页样式 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 30px;
}

.page-btn {
  padding: 8px 16px;
  background: #f3f4f6;
  color: #374151;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.page-btn:hover:not(:disabled) {
  background: #e5e7eb;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  color: #64748b;
  font-weight: 500;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 1000px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h2 {
  color: #1e293b;
  margin: 0;
}

.modal-body {
  padding: 30px;
}

@media (max-width: 768px) {
  .evaluation-statistics {
    padding: 15px;
  }
  
  .page-header h1 {
    font-size: 2rem;
  }
  
  .stats-overview {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
  }
  
  .comparison-section,
  .top-evaluations {
    padding: 20px;
  }
  
  .papers-grid,
  .evaluations-grid {
    grid-template-columns: 1fr;
  }
  
  .selection-controls {
    flex-direction: column;
    gap: 10px;
  }
  
  .search-input {
    max-width: none;
  }
  
  .section-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }
  
  .chart-container {
    height: 300px;
  }
  
  .modal-content {
    width: 95%;
    margin: 20px;
  }
}
</style>