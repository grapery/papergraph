<template>
  <div class="paper-evaluation-system">
    <div class="evaluation-header">
      <h2 class="evaluation-title">多维度论文分析评估系统</h2>
      <p class="evaluation-subtitle">从14个核心维度系统性评估论文质量</p>
    </div>

    <!-- 文章类型选择 -->
    <div class="article-type-selector">
      <label class="selector-label">文章类型：</label>
      <div class="type-options">
        <button 
          v-for="type in articleTypes" 
          :key="type.value"
          :class="['type-btn', { active: selectedType === type.value }]"
          @click="selectArticleType(type.value)"
        >
          <span class="type-icon">{{ type.icon }}</span>
          <span class="type-name">{{ type.name }}</span>
        </button>
      </div>
    </div>

    <!-- 评估维度 -->
    <div class="evaluation-dimensions">
      <div v-for="dimension in dimensions" :key="dimension.id" class="dimension-card">
        <div class="dimension-header">
          <div class="dimension-info">
            <h3 class="dimension-title">
              <span class="dimension-icon">{{ dimension.icon }}</span>
              {{ dimension.name }}
            </h3>
            <p class="dimension-description">{{ dimension.description }}</p>
          </div>
          <div class="dimension-weight">
            <span class="weight-label">权重</span>
            <span class="weight-value">{{ dimension.weight }}%</span>
          </div>
        </div>

        <!-- 评分滑块 -->
        <div class="rating-section">
          <div class="rating-slider">
            <input 
              type="range" 
              min="1" 
              max="5" 
              step="0.1"
              v-model="scores[dimension.id]"
              @input="updateScore(dimension.id, $event.target.value)"
              class="score-slider"
            />
            <div class="slider-labels">
              <span class="slider-label">1分</span>
              <span class="slider-label">2分</span>
              <span class="slider-label">3分</span>
              <span class="slider-label">4分</span>
              <span class="slider-label">5分</span>
            </div>
          </div>
          
          <div class="score-display">
            <span class="current-score">{{ scores[dimension.id] }}</span>
            <span class="score-max">/5</span>
          </div>
        </div>

        <!-- 具体指标 -->
        <div class="indicators">
          <h4 class="indicators-title">📌 具体指标：</h4>
          <ul class="indicators-list">
            <li v-for="indicator in dimension.indicators" :key="indicator" class="indicator-item">
              {{ indicator }}
            </li>
          </ul>
        </div>

        <!-- 评语输入 -->
        <div class="comment-section">
          <textarea 
            v-model="comments[dimension.id]"
            :placeholder="`请输入对${dimension.name}的评价...`"
            class="comment-input"
            rows="3"
          ></textarea>
        </div>
      </div>
    </div>

    <!-- 评估结果 -->
    <div class="evaluation-results">
      <div class="result-card">
        <h3 class="result-title">📊 评估结果</h3>
        
        <div class="total-score">
          <div class="score-circle">
            <span class="score-number">{{ totalScore }}</span>
            <span class="score-max-total">/100</span>
          </div>
          <div class="score-grade">
            <span class="grade-text">{{ grade }}</span>
            <span class="grade-description">{{ gradeDescription }}</span>
          </div>
        </div>

        <div class="score-breakdown">
          <h4 class="breakdown-title">各维度得分</h4>
          <div class="breakdown-chart">
            <div v-for="dimension in dimensions" :key="dimension.id" class="breakdown-item">
              <div class="breakdown-label">
                <span class="dimension-short">{{ dimension.name }}</span>
                <span class="breakdown-score">{{ weightedScores[dimension.id] }}</span>
              </div>
              <div class="breakdown-bar">
                <div 
                  class="breakdown-fill"
                  :style="{ width: `${(weightedScores[dimension.id] / 5) * 100}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div class="result-actions">
          <button class="action-btn primary" @click="generateReport">
            📄 生成评估报告
          </button>
          <button class="action-btn secondary" @click="saveEvaluation">
            💾 保存评估
          </button>
          <button class="action-btn tertiary" @click="resetEvaluation">
            🔄 重新评估
          </button>
        </div>
      </div>
    </div>

    <!-- 评估报告弹窗 -->
    <div v-if="showReport" class="report-modal" @click="closeReport">
      <div class="report-content" @click.stop>
        <div class="report-header">
          <h3 class="report-title">论文评估报告</h3>
          <button class="close-btn" @click="closeReport">×</button>
        </div>
        
        <div class="report-body">
          <div class="report-summary">
            <h4>评估摘要</h4>
            <p><strong>总分：</strong>{{ totalScore }}/100 ({{ grade }})</p>
            <p><strong>文章类型：</strong>{{ getArticleTypeName(selectedType) }}</p>
            <p><strong>评估时间：</strong>{{ new Date().toLocaleString() }}</p>
          </div>

          <div class="report-details">
            <h4>详细评价</h4>
            <div v-for="dimension in dimensions" :key="dimension.id" class="report-dimension">
              <div class="report-dimension-header">
                <span class="report-dimension-name">{{ dimension.name }}</span>
                <span class="report-dimension-score">{{ scores[dimension.id] }}/5 (加权: {{ weightedScores[dimension.id] }})</span>
              </div>
              <p v-if="comments[dimension.id]" class="report-dimension-comment">
                {{ comments[dimension.id] }}
              </p>
            </div>
          </div>

          <div class="report-recommendations">
            <h4>改进建议</h4>
            <div class="recommendations-list">
              <div v-for="recommendation in recommendations" :key="recommendation" class="recommendation-item">
                {{ recommendation }}
              </div>
            </div>
          </div>
        </div>

        <div class="report-actions">
          <button class="action-btn primary" @click="exportReport">
            📥 导出报告
          </button>
          <button class="action-btn secondary" @click="closeReport">
            关闭
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

// 文章类型
const articleTypes = [
  { value: 'academic', name: '学术论文', icon: '🎓' },
  { value: 'review', name: '综述文章', icon: '📚' },
  { value: 'policy', name: '政策报告', icon: '📋' },
  { value: 'news', name: '新闻评论', icon: '📰' },
  { value: 'popular', name: '科普文章', icon: '🌟' }
]

const selectedType = ref('academic')

// 评估维度
const dimensions = [
  {
    id: 'originality',
    name: '原创性',
    icon: '💡',
    weight: 15,
    description: '是否提出了新观点、新方法、新发现？是否填补了现有研究的空白？',
    indicators: [
      '创新点明确',
      '与已有文献对比清晰',
      '提出假设或模型具有新颖性'
    ]
  },
  {
    id: 'depth',
    name: '深度与洞察力',
    icon: '🔍',
    weight: 15,
    description: '是否深入分析问题本质，而非停留在表面？是否有批判性思维和独立见解？',
    indicators: [
      '分析层次丰富（现象 → 原因 → 影响 → 启示）',
      '能够提炼出普适性结论',
      '对复杂问题有深刻理解'
    ]
  },
  {
    id: 'accuracy',
    name: '信息准确性',
    icon: '✅',
    weight: 10,
    description: '数据、事实、引用是否真实可靠？是否避免错误陈述或误导性表达？',
    indicators: [
      '引用权威来源',
      '数据可验证',
      '无事实性错误'
    ]
  },
  {
    id: 'logic',
    name: '逻辑严谨性',
    icon: '🧩',
    weight: 15,
    description: '论点是否有清晰的推理链条？是否存在逻辑漏洞或跳跃？',
    indicators: [
      '论点 → 论据 → 结论结构完整',
      '推理过程严密',
      '反驳对立观点合理'
    ]
  },
  {
    id: 'structure',
    name: '结构清晰度',
    icon: '📐',
    weight: 10,
    description: '是否有清晰的引言、主体、结论？段落之间过渡自然？',
    indicators: [
      '结构符合"总-分-总"模式',
      '章节安排合理',
      '层级分明（一级标题、二级标题等）'
    ]
  },
  {
    id: 'focus',
    name: '重点突出',
    icon: '🎯',
    weight: 5,
    description: '是否围绕核心主题展开？是否避免无关内容或冗余信息？',
    indicators: [
      '主题明确不跑题',
      '内容聚焦关键问题',
      '删除无关细节'
    ]
  },
  {
    id: 'language',
    name: '语言规范性',
    icon: '✍️',
    weight: 10,
    description: '语法、拼写、标点是否正确？用词是否准确、专业？',
    indicators: [
      '无语法错误',
      '术语使用恰当',
      '风格正式/得体（视文体而定）'
    ]
  },
  {
    id: 'clarity',
    name: '表达清晰度',
    icon: '💬',
    weight: 5,
    description: '是否容易理解？是否晦涩难懂？复杂概念是否解释清楚？',
    indicators: [
      '避免长难句堆砌',
      '关键概念定义明确',
      '表达通俗而不失专业'
    ]
  },
  {
    id: 'methodology',
    name: '方法科学性',
    icon: '🔬',
    weight: 10,
    description: '研究设计是否合理？数据收集与分析方法是否可靠？',
    indicators: [
      '方法描述详细可复现',
      '使用统计方法恰当',
      '控制变量合理'
    ]
  },
  {
    id: 'evidence',
    name: '证据充分性',
    icon: '📊',
    weight: 15,
    description: '论点是否有足够数据或文献支持？是否引用高质量参考文献？',
    indicators: [
      '引用数量适中且相关',
      '文献来源权威（如SCI、SSCI、核心期刊）',
      '数据支撑结论'
    ]
  },
  {
    id: 'practical',
    name: '实用价值',
    icon: '🛠️',
    weight: 10,
    description: '是否解决实际问题？是否对政策、实践、技术有指导意义？',
    indicators: [
      '提出可行建议',
      '可被其他研究或行业借鉴',
      '具有现实意义'
    ]
  },
  {
    id: 'academic',
    name: '学术贡献',
    icon: '🏆',
    weight: 15,
    description: '是否推动学科发展？是否可能被广泛引用？是否启发后续研究？',
    indicators: [
      '被顶级期刊接收',
      '获得同行正面评价',
      '开辟新研究方向'
    ]
  },
  {
    id: 'formatting',
    name: '格式规范性',
    icon: '📄',
    weight: 5,
    description: '是否符合投稿期刊或出版单位的格式要求？引用格式是否统一？',
    indicators: [
      '标题、摘要、关键词、参考文献格式正确',
      '图表编号与标注规范',
      '页眉页脚、行距、字体符合要求'
    ]
  },
  {
    id: 'readability',
    name: '可读性',
    icon: '👀',
    weight: 5,
    description: '排版是否整洁美观？图表是否清晰专业？',
    indicators: [
      '图文搭配合理',
      '表格数据清晰',
      '整体视觉舒适'
    ]
  }
]

// 评分数据
const scores = ref({})
const comments = ref({})

// 初始化评分
dimensions.forEach(dimension => {
  scores.value[dimension.id] = 3.0
  comments.value[dimension.id] = ''
})

// 计算属性
const weightedScores = computed(() => {
  const result = {}
  dimensions.forEach(dimension => {
    result[dimension.id] = (scores.value[dimension.id] * dimension.weight / 5).toFixed(1)
  })
  return result
})

const totalScore = computed(() => {
  return Object.values(weightedScores.value).reduce((sum, score) => sum + parseFloat(score), 0).toFixed(1)
})

const grade = computed(() => {
  const score = parseFloat(totalScore.value)
  if (score >= 90) return 'A'
  if (score >= 80) return 'B'
  if (score >= 70) return 'C'
  if (score >= 60) return 'D'
  return 'F'
})

const gradeDescription = computed(() => {
  const score = parseFloat(totalScore.value)
  if (score >= 90) return '优秀'
  if (score >= 80) return '良好'
  if (score >= 70) return '中等'
  if (score >= 60) return '及格'
  return '不及格'
})

const recommendations = computed(() => {
  const recs = []
  dimensions.forEach(dimension => {
    const score = scores.value[dimension.id]
    if (score < 3) {
      switch (dimension.id) {
        case 'originality':
          recs.push('增强原创性：建议重新审视研究问题，寻找新的研究角度或方法')
          break
        case 'depth':
          recs.push('深化分析：建议对问题进行更深层次的分析，揭示本质规律')
          break
        case 'logic':
          recs.push('加强逻辑性：建议检查论证过程，确保逻辑链条完整')
          break
        case 'evidence':
          recs.push('补充证据：建议增加更多高质量的数据和文献支持')
          break
        case 'language':
          recs.push('提升语言质量：建议仔细检查语法错误，使用更专业的术语')
          break
        default:
          recs.push(`改进${dimension.name}：建议重点关注该维度的具体指标`)
      }
    }
  })
  return recs
})

// 状态变量
const showReport = ref(false)

// 方法
function selectArticleType(type) {
  selectedType.value = type
  // 根据文章类型调整权重
  adjustWeightsByType(type)
}

function adjustWeightsByType(type) {
  const weightAdjustments = {
    academic: {
      originality: 20, methodology: 15, evidence: 20, academic: 20,
      depth: 10, logic: 10, language: 5, structure: 5, practical: 5,
      focus: 3, clarity: 3, accuracy: 5, formatting: 3, readability: 2
    },
    review: {
      evidence: 25, depth: 20, structure: 15, clarity: 15, originality: 10,
      language: 5, accuracy: 5, logic: 5, academic: 5, readability: 5,
      focus: 3, practical: 3, methodology: 2, formatting: 2
    },
    policy: {
      practical: 25, evidence: 20, clarity: 15, structure: 15, logic: 10,
      language: 5, accuracy: 5, focus: 5, readability: 5, originality: 5,
      depth: 3, academic: 2, methodology: 2, formatting: 3
    },
    news: {
      clarity: 25, language: 20, originality: 15, structure: 15, focus: 10,
      readability: 10, accuracy: 5, practical: 5, logic: 3, depth: 2,
      evidence: 2, academic: 1, methodology: 1, formatting: 2
    },
    popular: {
      clarity: 30, readability: 25, language: 15, structure: 10, accuracy: 10,
      originality: 5, focus: 5, practical: 3, depth: 2, logic: 2,
      evidence: 1, academic: 1, methodology: 1, formatting: 1
    }
  }

  const adjustments = weightAdjustments[type]
  if (adjustments) {
    dimensions.forEach(dimension => {
      dimension.weight = adjustments[dimension.id] || dimension.weight
    })
  }
}

function updateScore(dimensionId, value) {
  scores.value[dimensionId] = parseFloat(value)
}

function getArticleTypeName(type) {
  const typeObj = articleTypes.find(t => t.value === type)
  return typeObj ? typeObj.name : '未知类型'
}

function generateReport() {
  showReport.value = true
}

function closeReport() {
  showReport.value = false
}

function exportReport() {
  const reportData = {
    type: getArticleTypeName(selectedType.value),
    totalScore: totalScore.value,
    grade: grade.value,
    scores: scores.value,
    weightedScores: weightedScores.value,
    comments: comments.value,
    recommendations: recommendations.value,
    timestamp: new Date().toISOString()
  }
  
  const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `paper-evaluation-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function saveEvaluation() {
  const evaluationData = {
    type: selectedType.value,
    scores: scores.value,
    comments: comments.value,
    totalScore: totalScore.value,
    timestamp: new Date().toISOString()
  }
  
  localStorage.setItem('paper-evaluation', JSON.stringify(evaluationData))
  alert('评估已保存到本地存储')
}

function resetEvaluation() {
  if (confirm('确定要重置所有评分吗？')) {
    dimensions.forEach(dimension => {
      scores.value[dimension.id] = 3.0
      comments.value[dimension.id] = ''
    })
  }
}

// 监听文章类型变化
watch(selectedType, (newType) => {
  adjustWeightsByType(newType)
})
</script>

<style scoped>
.paper-evaluation-system {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  min-height: 100vh;
}

.evaluation-header {
  text-align: center;
  margin-bottom: 3rem;
}

.evaluation-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.evaluation-subtitle {
  font-size: 1.2rem;
  color: #64748b;
  font-weight: 500;
}

.article-type-selector {
  margin-bottom: 2rem;
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.selector-label {
  display: block;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.type-options {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.type-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.type-btn:hover {
  border-color: #3b82f6;
  background: #f8fafc;
  transform: translateY(-1px);
}

.type-btn.active {
  border-color: #3b82f6;
  background: #3b82f6;
  color: white;
}

.type-icon {
  font-size: 1.2rem;
}

.evaluation-dimensions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.dimension-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
}

.dimension-card:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.dimension-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.dimension-info {
  flex: 1;
}

.dimension-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.3rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.dimension-icon {
  font-size: 1.5rem;
}

.dimension-description {
  color: #64748b;
  font-size: 0.9rem;
  line-height: 1.5;
}

.dimension-weight {
  text-align: center;
  background: #f8fafc;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.weight-label {
  display: block;
  font-size: 0.8rem;
  color: #64748b;
  font-weight: 500;
}

.weight-value {
  display: block;
  font-size: 1.2rem;
  font-weight: 700;
  color: #3b82f6;
}

.rating-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.rating-slider {
  flex: 1;
}

.score-slider {
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background: #e5e7eb;
  outline: none;
  -webkit-appearance: none;
}

.score-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.score-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
}

.slider-label {
  font-size: 0.8rem;
  color: #64748b;
  font-weight: 500;
}

.score-display {
  text-align: center;
  min-width: 80px;
}

.current-score {
  font-size: 2rem;
  font-weight: 700;
  color: #3b82f6;
}

.score-max {
  font-size: 1rem;
  color: #64748b;
  font-weight: 500;
}

.indicators {
  margin-bottom: 1rem;
}

.indicators-title {
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.indicators-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.indicator-item {
  padding: 0.25rem 0;
  color: #64748b;
  font-size: 0.9rem;
  position: relative;
  padding-left: 1rem;
}

.indicator-item::before {
  content: '•';
  position: absolute;
  left: 0;
  color: #3b82f6;
}

.comment-section {
  margin-top: 1rem;
}

.comment-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  resize: vertical;
  font-family: inherit;
  font-size: 0.9rem;
  outline: none;
  transition: all 0.2s ease;
  background: #f9fafc;
}

.comment-input:focus {
  border-color: #3b82f6;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.evaluation-results {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.result-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 1.5rem;
  text-align: center;
}

.total-score {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 2rem;
}

.score-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
}

.score-number {
  font-size: 2.5rem;
  font-weight: 800;
}

.score-max-total {
  font-size: 1rem;
  opacity: 0.9;
}

.score-grade {
  text-align: center;
}

.grade-text {
  display: block;
  font-size: 3rem;
  font-weight: 800;
  color: #3b82f6;
  margin-bottom: 0.5rem;
}

.grade-description {
  font-size: 1.2rem;
  color: #64748b;
  font-weight: 500;
}

.score-breakdown {
  margin-bottom: 2rem;
}

.breakdown-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
}

.breakdown-chart {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.breakdown-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.breakdown-label {
  min-width: 120px;
  display: flex;
  justify-content: space-between;
  font-weight: 500;
  color: #374151;
}

.dimension-short {
  font-size: 0.9rem;
}

.breakdown-score {
  color: #3b82f6;
  font-weight: 600;
}

.breakdown-bar {
  flex: 1;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.breakdown-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.result-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.action-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.action-btn.primary {
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  color: white;
}

.action-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
}

.action-btn.secondary {
  background: #f8fafc;
  color: #374151;
  border: 1px solid #e5e7eb;
}

.action-btn.secondary:hover {
  background: #e5e7eb;
  transform: translateY(-1px);
}

.action-btn.tertiary {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.action-btn.tertiary:hover {
  background: #fecaca;
  transform: translateY(-1px);
}

.report-modal {
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

.report-content {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  max-width: 800px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.report-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #64748b;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.report-body {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.report-summary h4,
.report-details h4,
.report-recommendations h4 {
  font-size: 1.2rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
}

.report-summary p {
  margin-bottom: 0.5rem;
  color: #64748b;
}

.report-dimension {
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
}

.report-dimension-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.report-dimension-name {
  font-weight: 600;
  color: #374151;
}

.report-dimension-score {
  color: #3b82f6;
  font-weight: 600;
}

.report-dimension-comment {
  color: #64748b;
  font-style: italic;
  margin-top: 0.5rem;
}

.recommendations-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.recommendation-item {
  padding: 0.75rem;
  background: #fef3c7;
  border-radius: 8px;
  color: #92400e;
  border-left: 4px solid #f59e0b;
}

.report-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

@media (max-width: 768px) {
  .paper-evaluation-system {
    padding: 1rem;
  }
  
  .evaluation-title {
    font-size: 2rem;
  }
  
  .evaluation-dimensions {
    grid-template-columns: 1fr;
  }
  
  .type-options {
    flex-direction: column;
  }
  
  .dimension-card {
    padding: 1rem;
  }
  
  .total-score {
    flex-direction: column;
    gap: 1rem;
  }
  
  .result-actions {
    flex-direction: column;
  }
  
  .action-btn {
    width: 100%;
    justify-content: center;
  }
  
  .report-content {
    width: 95%;
    padding: 1.5rem;
  }
}

@media (max-width: 480px) {
  .evaluation-title {
    font-size: 1.5rem;
  }
  
  .dimension-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .rating-section {
    flex-direction: column;
    align-items: stretch;
  }
  
  .score-display {
    text-align: center;
  }
  
  .breakdown-label {
    min-width: 100px;
  }
  
  .dimension-short {
    font-size: 0.8rem;
  }
}
</style>