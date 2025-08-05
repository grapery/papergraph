<template>
  <div class="paper-report-page">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading">
      <div class="loading-text">加载分析结果中...</div>
    </div>
    
    <!-- 错误状态 -->
    <div v-else-if="error" class="error">
      <div class="error-text">{{ error }}</div>
      <button @click="loadAnalysisData" class="retry-btn">重试</button>
    </div>
    
    <!-- 分析结果内容 -->
    <div v-else-if="analysisData">
      <!-- 标题与上传信息 -->
      <h1 class="report-title">{{ analysisData.title || 'Paper Analysis' }}</h1>
      <div class="report-meta">
        Uploaded by <span class="uploader">{{ analysisData.uploader || 'Unknown User' }}</span> 
        on {{ formatDate(analysisData.uploadDate) }}
      </div>

      <!-- Tab 切换 -->
      <div class="report-tabs">
        <button :class="{active: tab==='overview'}" @click="tab='overview'">Overview</button>
        <button :class="{active: tab==='detail'}" @click="tab='detail'">Detailed Analysis</button>
        <button :class="{active: tab==='feedback'}" @click="tab='feedback'">Feedback</button>
      </div>

      <div v-if="tab==='overview'">
        <!-- 总体评价 -->
        <div class="section-title">Overall Evaluation</div>
        <div class="score-row">
          <div class="score-label">Overall Quality Score</div>
          <div class="score-value">{{ analysisData.overallScore || '7.5/10' }}</div>
        </div>
        <div class="progress-bar">
          <div class="progress" :style="{width: getScorePercent(analysisData.overallScore)}"></div>
        </div>
        <div class="score-desc" :class="getScoreLevel(analysisData.overallScore)">
          {{ getScoreLevelText(analysisData.overallScore) }}
        </div>
        <div class="section-desc">{{ analysisData.summary || 'This paper demonstrates a strong approach to natural language processing using transformer networks, showing notable improvements in accuracy and efficiency. Key strengths include a well-defined methodology and reproducible results. However, further validation on diverse datasets is recommended to enhance the robustness of the findings.' }}</div>

        <!-- 基本信息 -->
        <div class="section-title" style="margin-top:32px;">Basic Information</div>
        <table class="info-table">
          <tbody>
            <tr><td>Title</td><td>{{ analysisData.title || 'Paper Title' }}</td></tr>
            <tr><td>Author</td><td>{{ analysisData.author || 'Unknown Author' }}</td></tr>
            <tr><td>Publication Date</td><td>{{ formatDate(analysisData.publicationDate) }}</td></tr>
            <tr><td>Analysis Date</td><td>{{ formatDate(analysisData.analysisDate) }}</td></tr>
          </tbody>
        </table>

        <!-- 摘要 -->
        <div class="section-title" style="margin-top:32px;">Summary</div>
        <div class="section-desc">{{ analysisData.summary || 'This paper presents a novel approach to natural language processing using transformer networks. The results demonstrate significant improvements over existing methods in terms of accuracy and efficiency. The methodology is well-defined and reproducible, although further validation on diverse datasets is recommended.' }}</div>

        <!-- 内容质量 -->
        <div class="section-title" style="margin-top:32px;">Content Quality</div>
        <div v-for="item in analysisData.contentQuality || contentQuality" :key="item.key" class="quality-block">
          <div class="quality-title">{{ item.title }}</div>
          <div class="quality-desc">{{ item.desc }}</div>
          <div class="score-row">
            <div class="score-label">Rating</div>
            <div class="score-value">{{ item.score }}</div>
          </div>
          <div class="progress-bar"><div class="progress" :style="{width: item.percent}"></div></div>
          <div class="score-desc" :class="item.level">{{ item.levelText }}</div>
        </div>

        <!-- 视觉分析（占位） -->
        <div class="section-title" style="margin-top:32px;">Visual Analysis</div>
        <div class="section-desc">{{ analysisData.visualAnalysis || '(Visual analysis content placeholder)' }}</div>
      </div>
      
      <!-- 其他 tab 可后续补充 -->
    </div>
  </div>
</template>
<script setup>
// 声明类型
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { mockPublicFeeds } from '../utils/mockData'

const route = useRoute()
const tab = ref('overview')
const loading = ref(true)
const error = ref(null)
const analysisData = ref(null)

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
</script>
<style scoped>
.paper-report-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 0 60px 0;
}
.report-title {
  font-size: 2.1rem;
  font-weight: bold;
  margin-bottom: 6px;
  color: #222;
}
.report-meta {
  color: #5b7bb3;
  font-size: 1.01rem;
  margin-bottom: 32px;
}
.uploader {
  color: #2563eb;
}
.report-tabs {
  display: flex;
  gap: 36px;
  border-bottom: 2px solid #e5e7eb;
  margin-bottom: 32px;
}
.report-tabs button {
  background: none;
  border: none;
  font-size: 1.08rem;
  color: #374151;
  cursor: pointer;
  padding: 0 0 12px 0;
  border-bottom: 2px solid transparent;
  transition: border 0.2s, color 0.2s;
}
.report-tabs button.active {
  color: #2563eb;
  font-weight: bold;
  border-bottom: 2px solid #2563eb;
}
.section-title {
  font-size: 1.18rem;
  font-weight: 600;
  margin-bottom: 12px;
  color: #222;
}
.score-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 4px;
}
.score-label {
  color: #374151;
  font-size: 1.01rem;
}
.score-value {
  color: #2563eb;
  font-weight: 600;
  font-size: 1.01rem;
}
.progress-bar {
  width: 100%;
  height: 8px;
  background: #e5e7eb;
  border-radius: 6px;
  margin-bottom: 4px;
  overflow: hidden;
}
.progress {
  height: 100%;
  background: #2563eb;
  border-radius: 6px;
  transition: width 0.3s;
}
.score-desc {
  font-size: 0.98rem;
  margin-bottom: 8px;
}
.score-desc.good, .score-desc.high {
  color: #2563eb;
  font-weight: 500;
}
.score-desc.average {
  color: #6b7280;
}
.section-desc {
  color: #374151;
  font-size: 1.01rem;
  margin-bottom: 18px;
}
.info-table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  margin-bottom: 8px;
}
.info-table td {
  padding: 10px 18px 10px 0;
  color: #374151;
  font-size: 1.01rem;
  border-bottom: 1px solid #e5e7eb;
}
.info-table tr:last-child td {
  border-bottom: none;
}
.quality-block {
  margin-bottom: 32px;
}
.quality-title {
  font-size: 1.07rem;
  font-weight: 600;
  margin-bottom: 4px;
  color: #222;
}
.quality-desc {
  color: #374151;
  font-size: 1.01rem;
  margin-bottom: 6px;
}
.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  background-color: #f9fafb;
  border-radius: 8px;
  margin-bottom: 32px;
}
.loading-text {
  font-size: 1.1rem;
  color: #4b5563;
}
.error {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px;
  background-color: #fef3f2;
  border: 1px solid #fcd3c7;
  border-radius: 8px;
  margin-bottom: 32px;
}
.error-text {
  color: #991b1b;
  font-size: 1.05rem;
  text-align: center;
  margin-bottom: 16px;
}
.retry-btn {
  background-color: #2563eb;
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: background-color 0.2s;
}
.retry-btn:hover {
  background-color: #1d4ed8;
}
</style> 