<template>
  <div class="evaluation-management">
    <div class="page-header">
      <h1>论文评价管理</h1>
      <p>创建和管理论文的多维度评价</p>
    </div>

    <!-- 评价表单 -->
    <div v-if="showForm" class="evaluation-form">
      <div class="form-header">
        <h2>{{ isEdit ? '编辑评价' : '创建新评价' }}</h2>
        <button class="close-btn" @click="closeForm">✕</button>
      </div>
      
      <form @submit.prevent="submitEvaluation">
        <!-- 基本信息 -->
        <div class="form-section">
          <h3>基本信息</h3>
          <div class="form-group">
            <label>选择论文</label>
            <select v-model="formData.paper_id" required>
              <option value="">请选择论文</option>
              <option v-for="paper in papers" :key="paper.id" :value="paper.id">
                {{ paper.file_name }}
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label>总体评分 (0-10)</label>
            <input 
              type="number" 
              v-model="formData.overall_score" 
              min="0" 
              max="10" 
              step="0.1" 
              required
              class="score-input"
            />
          </div>
          
          <div class="form-group">
            <label>总体评价摘要</label>
            <textarea 
              v-model="formData.summary" 
              rows="3" 
              placeholder="请输入总体评价摘要"
              required
            ></textarea>
          </div>
          
          <div class="form-group">
            <label>改进建议</label>
            <textarea 
              v-model="formData.recommendation" 
              rows="3" 
              placeholder="请输入改进建议"
              required
            ></textarea>
          </div>
        </div>

        <!-- 维度评分 -->
        <div class="form-section">
          <h3>维度评分</h3>
          <div class="dimensions-grid">
            <div class="dimension-item" v-for="dimension in dimensions" :key="dimension.key">
              <div class="dimension-header">
                <span class="dimension-icon">{{ dimension.icon }}</span>
                <span class="dimension-name">{{ dimension.name }}</span>
                <input 
                  type="number" 
                  v-model="formData[dimension.key + '_score']" 
                  min="0" 
                  max="10" 
                  step="0.1" 
                  required
                  class="dimension-score"
                />
              </div>
              <div class="dimension-description">
                {{ dimension.description }}
              </div>
            </div>
          </div>
        </div>

        <!-- 分类评分 -->
        <div class="form-section">
          <h3>分类评分</h3>
          <div class="categories-grid">
            <div class="category-item" v-for="category in categories" :key="category.key">
              <label>{{ category.name }}</label>
              <input 
                type="number" 
                v-model="formData[category.key + '_score']" 
                min="0" 
                max="10" 
                step="0.1" 
                required
                class="category-score"
              />
            </div>
          </div>
        </div>

        <!-- 详细维度信息 -->
        <div class="form-section">
          <h3>详细维度信息</h3>
          <div class="detail-dimensions">
            <div class="detail-dimension" v-for="dimension in dimensions" :key="dimension.key">
              <h4>{{ dimension.name }}</h4>
              <div class="dimension-info">
                <div class="form-group">
                  <label>维度描述</label>
                  <textarea 
                    v-model="formData.dimensions[dimension.key].description" 
                    rows="2" 
                    placeholder="请输入维度描述"
                  ></textarea>
                </div>
                <div class="form-group">
                  <label>支撑证据</label>
                  <textarea 
                    v-model="formData.dimensions[dimension.key].evidence" 
                    rows="3" 
                    placeholder="请输入支撑证据"
                  ></textarea>
                </div>
                
                <!-- 指标评分 -->
                <div class="metrics-section">
                  <h5>指标评分</h5>
                  <div class="metrics-grid">
                    <div class="metric-item" v-for="metric in dimension.metrics" :key="metric.key">
                      <div class="metric-header">
                        <span class="metric-name">{{ metric.name }}</span>
                        <input 
                          type="number" 
                          v-model="formData.dimensions[dimension.key].metrics[metric.key].score" 
                          min="0" 
                          max="10" 
                          step="0.1" 
                          class="metric-score"
                        />
                      </div>
                      <div class="metric-description">{{ metric.description }}</div>
                      <div class="form-group">
                        <label>指标证据</label>
                        <textarea 
                          v-model="formData.dimensions[dimension.key].metrics[metric.key].evidence" 
                          rows="2" 
                          placeholder="请输入指标证据"
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 设置选项 -->
        <div class="form-section">
          <h3>设置选项</h3>
          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="formData.is_public" />
              公开评价（其他用户可以查看）
            </label>
          </div>
        </div>

        <!-- 提交按钮 -->
        <div class="form-actions">
          <button type="button" class="btn-cancel" @click="closeForm">取消</button>
          <button type="submit" class="btn-submit" :disabled="isSubmitting">
            {{ isSubmitting ? '提交中...' : (isEdit ? '更新评价' : '创建评价') }}
          </button>
        </div>
      </form>
    </div>

    <!-- 评价列表 -->
    <div v-else class="evaluation-list">
      <div class="list-header">
        <div class="search-section">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="搜索评价..." 
            class="search-input"
            @input="handleSearch"
          />
          <button class="search-btn" @click="handleSearch">🔍</button>
        </div>
        <button class="btn-create" @click="openCreateForm">创建新评价</button>
      </div>

      <div v-if="loading" class="loading">
        <div class="loading-spinner"></div>
        <p>加载中...</p>
      </div>

      <div v-else-if="evaluations.length === 0" class="empty-state">
        <div class="empty-icon">📊</div>
        <h3>暂无评价</h3>
        <p>开始创建你的第一个论文评价吧！</p>
        <button class="btn-create" @click="openCreateForm">创建评价</button>
      </div>

      <div v-else class="evaluations-grid">
        <div 
          v-for="evaluation in evaluations" 
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
          
          <div class="card-stats">
            <div class="stat-item">
              <span class="stat-label">点赞</span>
              <span class="stat-value">{{ evaluation.like_count || 0 }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">评论</span>
              <span class="stat-value">{{ evaluation.comment_count || 0 }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">状态</span>
              <span class="stat-value" :class="{ 'public': evaluation.is_public, 'private': !evaluation.is_public }">
                {{ evaluation.is_public ? '公开' : '私有' }}
              </span>
            </div>
          </div>
          
          <div class="card-actions">
            <button class="btn-edit" @click.stop="editEvaluation(evaluation)">编辑</button>
            <button class="btn-delete" @click.stop="deleteEvaluation(evaluation)">删除</button>
            <button class="btn-like" @click.stop="likeEvaluation(evaluation)">
              ❤️ {{ evaluation.like_count || 0 }}
            </button>
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
import { ref, onMounted, computed } from 'vue'
import { evaluationApi, evaluationUtils } from '../api/evaluation'
import DetailedAnalysis from '../components/DetailedAnalysis.vue'

// 响应式数据
const evaluations = ref([])
const papers = ref([])
const loading = ref(false)
const showForm = ref(false)
const showDetail = ref(false)
const isEdit = ref(false)
const isSubmitting = ref(false)
const selectedEvaluation = ref(null)
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(12)
const total = ref(0)

// 维度定义
const dimensions = [
  {
    key: 'originality',
    name: '原创性',
    icon: '💡',
    description: '论文的独创性和新颖性',
    metrics: [
      { key: 'innovation', name: '创新点明确', description: '是否提出了新的观点、方法或发现' },
      { key: 'comparison', name: '文献对比', description: '与已有研究的对比分析' }
    ]
  },
  {
    key: 'depth',
    name: '深度洞察',
    icon: '🔍',
    description: '分析的深度和洞察力',
    metrics: [
      { key: 'analysis', name: '分析层次', description: '从现象到本质的分析深度' },
      { key: 'insight', name: '洞察力', description: '对问题的深刻理解和见解' }
    ]
  },
  {
    key: 'logic',
    name: '逻辑严谨',
    icon: '🧩',
    description: '论证的逻辑性和严密性',
    metrics: [
      { key: 'coherence', name: '逻辑连贯', description: '论证过程的逻辑链条' },
      { key: 'structure', name: '结构清晰', description: '文章结构的合理性' }
    ]
  },
  {
    key: 'evidence',
    name: '证据支撑',
    icon: '📊',
    description: '论据的充分性和可靠性',
    metrics: [
      { key: 'data', name: '数据支持', description: '数据的充分性和可靠性' },
      { key: 'citation', name: '文献支撑', description: '参考文献的质量和相关性' }
    ]
  },
  {
    key: 'language',
    name: '语言表达',
    icon: '✍️',
    description: '语言的质量和表达效果',
    metrics: [
      { key: 'clarity', name: '表达清晰', description: '语言表达的清晰度' },
      { key: 'accuracy', name: '用词准确', description: '术语使用的准确性' }
    ]
  },
  {
    key: 'value',
    name: '学术价值',
    icon: '🎯',
    description: '论文的学术贡献和应用价值',
    metrics: [
      { key: 'contribution', name: '学术贡献', description: '对学科发展的贡献' },
      { key: 'application', name: '应用价值', description: '实际应用的可能性' }
    ]
  }
]

// 分类定义
const categories = [
  { key: 'content', name: '内容质量' },
  { key: 'structure', name: '结构逻辑' },
  { key: 'language', name: '语言表达' },
  { key: 'method', name: '方法证据' },
  { key: 'value', name: '价值影响' }
]

// 表单数据
const formData = ref({
  paper_id: '',
  overall_score: 0,
  summary: '',
  recommendation: '',
  originality_score: 0,
  depth_score: 0,
  logic_score: 0,
  evidence_score: 0,
  language_score: 0,
  value_score: 0,
  content_score: 0,
  structure_score: 0,
  method_score: 0,
  is_public: true,
  dimensions: {}
})

// 计算属性
const totalPages = computed(() => Math.ceil(total.value / pageSize.value))

// 初始化
onMounted(async () => {
  await loadEvaluations()
  await loadPapers()
  initializeFormData()
})

// 初始化表单数据
function initializeFormData() {
  const dimensionsData = {}
  dimensions.forEach(dimension => {
    dimensionsData[dimension.key] = {
      description: '',
      evidence: '',
      metrics: {}
    }
    dimension.metrics.forEach(metric => {
      dimensionsData[dimension.key].metrics[metric.key] = {
        score: 0,
        evidence: ''
      }
    })
  })
  formData.value.dimensions = dimensionsData
}

// 加载评价列表
async function loadEvaluations() {
  loading.value = true
  try {
    const response = await evaluationApi.getMyEvaluations(currentPage.value, pageSize.value)
    evaluations.value = response.data.data.evaluations
    total.value = response.data.data.total
  } catch (error) {
    console.error('Failed to load evaluations:', error)
  } finally {
    loading.value = false
  }
}

// 加载论文列表
async function loadPapers() {
  try {
    // 这里需要调用获取用户论文的API
    // 暂时使用模拟数据
    papers.value = [
      { id: 1, file_name: '论文示例1.pdf' },
      { id: 2, file_name: '论文示例2.pdf' }
    ]
  } catch (error) {
    console.error('Failed to load papers:', error)
  }
}

// 打开创建表单
function openCreateForm() {
  isEdit.value = false
  resetForm()
  showForm.value = true
}

// 编辑评价
function editEvaluation(evaluation) {
  isEdit.value = true
  selectedEvaluation.value = evaluation
  
  // 填充表单数据
  formData.value = {
    ...evaluation,
    dimensions: {}
  }
  
  // 处理维度数据
  if (evaluation.dimensions) {
    evaluation.dimensions.forEach(dim => {
      formData.value.dimensions[dim.dimension_key] = {
        description: dim.description,
        evidence: dim.evidence,
        metrics: {}
      }
      
      if (dim.metrics) {
        dim.metrics.forEach(metric => {
          formData.value.dimensions[dim.dimension_key].metrics[metric.metric_key] = {
            score: metric.score,
            evidence: metric.evidence
          }
        })
      }
    })
  }
  
  showForm.value = true
}

// 删除评价
async function deleteEvaluation(evaluation) {
  if (!confirm('确定要删除这个评价吗？')) return
  
  try {
    await evaluationApi.deleteEvaluation(evaluation.id)
    await loadEvaluations()
    alert('评价删除成功')
  } catch (error) {
    console.error('Failed to delete evaluation:', error)
    alert('删除失败')
  }
}

// 点赞评价
async function likeEvaluation(evaluation) {
  try {
    await evaluationApi.likeEvaluation(evaluation.id)
    await loadEvaluations()
  } catch (error) {
    console.error('Failed to like evaluation:', error)
  }
}

// 查看评价详情
function viewEvaluation(evaluation) {
  selectedEvaluation.value = evaluation
  showDetail.value = true
}

// 提交评价
async function submitEvaluation() {
  isSubmitting.value = true
  
  try {
    // 构建提交数据
    const submitData = {
      ...formData.value,
      analysis_id: 1, // 需要根据实际情况获取
      user_id: getCurrentUserId(),
      paper_id: parseInt(formData.value.paper_id)
    }
    
    if (isEdit.value) {
      await evaluationApi.updateEvaluation(selectedEvaluation.value.id, submitData)
    } else {
      await evaluationApi.createEvaluation(submitData)
    }
    
    closeForm()
    await loadEvaluations()
    alert(isEdit.value ? '评价更新成功' : '评价创建成功')
  } catch (error) {
    console.error('Failed to submit evaluation:', error)
    alert('提交失败')
  } finally {
    isSubmitting.value = false
  }
}

// 重置表单
function resetForm() {
  formData.value = {
    paper_id: '',
    overall_score: 0,
    summary: '',
    recommendation: '',
    originality_score: 0,
    depth_score: 0,
    logic_score: 0,
    evidence_score: 0,
    language_score: 0,
    value_score: 0,
    content_score: 0,
    structure_score: 0,
    method_score: 0,
    is_public: true,
    dimensions: {}
  }
  initializeFormData()
}

// 关闭表单
function closeForm() {
  showForm.value = false
  resetForm()
}

// 关闭详情
function closeDetail() {
  showDetail.value = false
  selectedEvaluation.value = null
}

// 搜索处理
async function handleSearch() {
  if (searchQuery.value.trim()) {
    try {
      const response = await evaluationApi.searchEvaluations(searchQuery.value, currentPage.value, pageSize.value)
      evaluations.value = response.data.data.evaluations
      total.value = response.data.data.total
    } catch (error) {
      console.error('Failed to search evaluations:', error)
    }
  } else {
    await loadEvaluations()
  }
}

// 分页处理
async function changePage(page) {
  currentPage.value = page
  await loadEvaluations()
}

// 获取当前用户ID
function getCurrentUserId() {
  const mockUser = localStorage.getItem('mock_user')
  if (mockUser) {
    try {
      const user = JSON.parse(mockUser)
      return user.id
    } catch (error) {
      console.error('解析用户数据失败:', error)
    }
  }
  return 1
}

// 获取分数颜色
function getScoreColor(score) {
  return evaluationUtils.getScoreColor(score)
}
</script>

<style scoped>
.evaluation-management {
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

/* 评价表单样式 */
.evaluation-form {
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e2e8f0;
}

.form-header h2 {
  color: #1e293b;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #64748b;
  padding: 5px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #f1f5f9;
  color: #374151;
}

.form-section {
  margin-bottom: 30px;
}

.form-section h3 {
  color: #1e293b;
  margin-bottom: 20px;
  font-size: 1.3rem;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #374151;
  font-weight: 500;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s ease;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.score-input {
  max-width: 150px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

/* 维度评分样式 */
.dimensions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.dimension-item {
  background: #f8fafc;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.dimension-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.dimension-icon {
  font-size: 1.5rem;
}

.dimension-name {
  flex: 1;
  font-weight: 600;
  color: #1e293b;
}

.dimension-score {
  width: 80px;
  padding: 8px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  text-align: center;
}

.dimension-description {
  color: #64748b;
  font-size: 0.9rem;
  line-height: 1.5;
}

/* 分类评分样式 */
.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.category-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.category-score {
  padding: 8px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  text-align: center;
}

/* 详细维度信息样式 */
.detail-dimensions {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.detail-dimension h4 {
  color: #1e293b;
  margin-bottom: 15px;
  font-size: 1.2rem;
}

.metrics-section h5 {
  color: #374151;
  margin: 15px 0 10px 0;
  font-size: 1rem;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
}

.metric-item {
  background: #f8fafc;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.metric-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.metric-name {
  font-weight: 600;
  color: #1e293b;
}

.metric-score {
  width: 60px;
  padding: 6px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  text-align: center;
}

.metric-description {
  color: #64748b;
  font-size: 0.9rem;
  margin-bottom: 10px;
}

/* 表单操作样式 */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 2px solid #e2e8f0;
}

.btn-cancel,
.btn-submit {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel {
  background: #f3f4f6;
  color: #374151;
}

.btn-cancel:hover {
  background: #e5e7eb;
}

.btn-submit {
  background: #3b82f6;
  color: white;
}

.btn-submit:hover:not(:disabled) {
  background: #2563eb;
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 评价列表样式 */
.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.search-section {
  display: flex;
  gap: 10px;
}

.search-input {
  padding: 10px 15px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  width: 300px;
}

.search-btn {
  padding: 10px 15px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.search-btn:hover {
  background: #2563eb;
}

.btn-create {
  padding: 10px 20px;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease;
}

.btn-create:hover {
  background: #059669;
}

/* 加载状态 */
.loading {
  text-align: center;
  padding: 60px 0;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60px 0;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-state h3 {
  color: #1e293b;
  margin-bottom: 10px;
}

.empty-state p {
  color: #64748b;
  margin-bottom: 20px;
}

/* 评价卡片样式 */
.evaluations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.evaluation-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #e2e8f0;
}

.evaluation-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.card-header {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
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
  flex-shrink: 0;
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

.card-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  padding-top: 15px;
  border-top: 1px solid #e2e8f0;
}

.stat-item {
  text-align: center;
}

.stat-label {
  display: block;
  color: #64748b;
  font-size: 0.8rem;
  margin-bottom: 2px;
}

.stat-value {
  color: #1e293b;
  font-weight: 600;
  font-size: 0.9rem;
}

.stat-value.public {
  color: #10b981;
}

.stat-value.private {
  color: #f59e0b;
}

.card-actions {
  display: flex;
  gap: 8px;
}

.btn-edit,
.btn-delete,
.btn-like {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-edit {
  background: #3b82f6;
  color: white;
}

.btn-edit:hover {
  background: #2563eb;
}

.btn-delete {
  background: #ef4444;
  color: white;
}

.btn-delete:hover {
  background: #dc2626;
}

.btn-like {
  background: #f8fafc;
  color: #ef4444;
  border: 1px solid #e2e8f0;
}

.btn-like:hover {
  background: #fef2f2;
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
  .evaluation-management {
    padding: 15px;
  }
  
  .page-header h1 {
    font-size: 2rem;
  }
  
  .evaluation-form {
    padding: 20px;
  }
  
  .dimensions-grid,
  .categories-grid,
  .metrics-grid {
    grid-template-columns: 1fr;
  }
  
  .list-header {
    flex-direction: column;
    gap: 15px;
  }
  
  .search-input {
    width: 100%;
  }
  
  .evaluations-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-content {
    width: 95%;
    margin: 20px;
  }
}
</style>