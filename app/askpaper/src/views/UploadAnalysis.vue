<template>
  <div class="upload-analysis-page">
    <!-- Hero Section -->
    <div class="hero-section">
      <div class="hero-content">
        <div class="hero-badge">
          <span class="badge-icon">🧠</span>
          <span class="badge-text">AI-Powered Analysis</span>
        </div>
        <h1 class="hero-title">Upload & Analyze Papers</h1>
        <p class="hero-subtitle">Transform your research papers into actionable insights with our advanced AI analysis</p>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <!-- Progress Indicator -->
      <div class="progress-indicator">
        <div class="progress-steps">
          <div class="step" :class="{ active: currentStep >= 1, completed: currentStep > 1 }">
            <div class="step-icon">📄</div>
            <div class="step-label">Upload Paper</div>
          </div>
          <div class="step-connector"></div>
          <div class="step" :class="{ active: currentStep >= 2, completed: currentStep > 2 }">
            <div class="step-icon">🔬</div>
            <div class="step-label">Start Analysis</div>
          </div>
          <div class="step-connector"></div>
          <div class="step" :class="{ active: currentStep >= 3, completed: currentStep > 3 }">
            <div class="step-icon">📊</div>
            <div class="step-label">View Results</div>
          </div>
        </div>
      </div>

      <!-- Upload Section -->
      <div class="upload-section">
        <!-- Step 1: Upload Methods -->
        <div class="step-container">
          <div class="step-header">
            <div class="step-number">
              <span class="step-icon">📄</span>
              <span class="step-text">1</span>
            </div>
            <div class="step-info">
              <h3 class="step-title">Upload Your Paper</h3>
              <p class="step-desc">Choose a PDF file or provide a URL to get started</p>
            </div>
          </div>

          <div class="upload-methods">
            <!-- File Upload Method -->
            <div class="upload-method" :class="{ active: selectedFile }">
              <div class="method-header">
                <div class="method-icon-container">
                  <span class="method-icon">📄</span>
                </div>
                <div class="method-info">
                  <h4 class="method-title">Upload PDF File</h4>
                  <p class="method-desc">Drag & drop or click to select</p>
                </div>
                <div class="method-status" v-if="selectedFile">
                  <span class="status-badge success">Selected</span>
                </div>
              </div>
              
              <div 
                class="file-upload-area" 
                :class="{ 
                  'drag-over': isDragOver, 
                  'has-file': selectedFile,
                  'uploading': isUploading
                }" 
                @click="triggerFileSelect" 
                @drop="onFileDrop" 
                @dragover.prevent="onDragOver"
                @dragleave.prevent="onDragLeave"
              >
                <input 
                  ref="fileInput" 
                  type="file" 
                  accept=".pdf" 
                  @change="onFileChange" 
                  style="display: none;"
                  :disabled="isUploading"
                />
                
                <div v-if="!selectedFile" class="upload-placeholder">
                  <div class="upload-icon">📁</div>
                  <div class="upload-text">Drop your PDF here or click to browse</div>
                  <div class="upload-requirements">
                    <span class="requirement-item">PDF format</span>
                    <span class="requirement-dot">•</span>
                    <span class="requirement-item">Max 50MB</span>
                    <span class="requirement-dot">•</span>
                    <span class="requirement-item">High quality</span>
                  </div>
                </div>
                
                <div v-else class="file-info">
                  <div class="file-preview">
                    <div class="file-thumbnail">
                      <span class="file-icon-large">📄</span>
                    </div>
                    <div class="file-details">
                      <div class="file-name">{{ selectedFile.name }}</div>
                      <div class="file-meta">
                        <span class="file-size">{{ formatFileSize(selectedFile.size) }}</span>
                        <span class="file-type">PDF</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    class="remove-file" 
                    @click.stop="removeFile"
                    :disabled="isUploading"
                    title="Remove file"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- URL Upload Method -->
            <div class="upload-method" :class="{ active: paperUrl.trim() }">
              <div class="method-header">
                <div class="method-icon-container">
                  <span class="method-icon">🔗</span>
                </div>
                <div class="method-info">
                  <h4 class="method-title">Enter Paper URL</h4>
                  <p class="method-desc">Provide a direct link to the paper</p>
                </div>
                <div class="method-status" v-if="paperUrl.trim()">
                  <span class="status-badge success">Ready</span>
                </div>
              </div>
              
              <div class="url-input-container">
                <div class="url-input-wrapper">
                  <svg class="url-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                  </svg>
                  <input 
                    v-model="paperUrl" 
                    type="url" 
                    placeholder="https://example.com/paper.pdf" 
                    class="url-input"
                    :class="{ 'error': urlError }"
                    @input="onUrlInput"
                    @blur="validateUrl"
                    :disabled="isFetching"
                  />
                </div>
                <div v-if="urlError" class="url-error">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  {{ urlError }}
                </div>
                <button 
                  class="fetch-btn" 
                  @click="fetchFromUrl"
                  :disabled="!paperUrl || isFetching"
                  :title="paperUrl ? 'Fetch from URL' : 'Enter URL first'"
                >
                  <span v-if="isFetching" class="btn-spinner"></span>
                  <span v-else>{{ isFetching ? 'Fetching...' : 'Fetch Paper' }}</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Upload Action -->
          <div class="upload-actions">
            <button 
              class="upload-btn" 
              @click="uploadFile"
              :disabled="!canUpload || isUploading"
              :title="canUpload ? 'Upload file to start analysis' : 'Please select a file or enter URL first'"
            >
              <span class="btn-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
              </span>
              <span v-if="isUploading" class="btn-spinner"></span>
              <span v-else>{{ isUploading ? 'Uploading...' : 'Upload Paper' }}</span>
            </button>
          </div>

          <!-- Upload Status -->
          <transition name="slide-fade">
            <div v-if="uploadStatus" class="status-message" :class="uploadStatus.type">
              <div class="status-icon">{{ uploadStatus.icon }}</div>
              <div class="status-content">
                <div class="status-text">{{ uploadStatus.message }}</div>
                <div class="status-details" v-if="uploadStatus.details">{{ uploadStatus.details }}</div>
              </div>
              <button 
                v-if="uploadStatus.type === 'error'" 
                class="status-close" 
                @click="clearUploadStatus"
                title="Dismiss"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </transition>
        </div>

        <!-- Step 2: Analysis -->
        <div class="step-container" :class="{ disabled: !uploadedPaper }">
          <div class="step-header">
            <div class="step-number">
              <span class="step-icon">🔬</span>
              <span class="step-text">2</span>
            </div>
            <div class="step-info">
              <h3 class="step-title">Start Analysis</h3>
              <p class="step-desc">Begin AI-powered analysis of your uploaded paper</p>
            </div>
          </div>

          <div class="analysis-preview" v-if="uploadedPaper">
            <div class="paper-card">
              <div class="paper-thumbnail">
                <span class="paper-icon">📄</span>
              </div>
              <div class="paper-info">
                <h4 class="paper-title">{{ uploadedPaper.Title || 'Uploaded Paper' }}</h4>
                <div class="paper-meta">
                  <span class="paper-id">ID: {{ uploadedPaper.ID }}</span>
                  <span class="paper-separator">•</span>
                  <span class="paper-status">Ready for analysis</span>
                </div>
              </div>
              <div class="paper-actions">
                <button 
                  class="analyze-btn" 
                  @click="startAnalysisTask"
                  :disabled="!canAnalyze || isAnalyzing"
                  :title="canAnalyze ? 'Start AI analysis' : 'Upload a paper first'"
                >
                  <span class="btn-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="22 12 18 12 15 21 9 12 6 12 2 12"></polyline>
                      <path d="M14 12H2"></path>
                    </svg>
                  </span>
                  <span v-if="isAnalyzing" class="btn-spinner"></span>
                  <span v-else>{{ isAnalyzing ? 'Analyzing...' : 'Start Analysis' }}</span>
                </button>
              </div>
            </div>
          </div>

          <div v-else class="analysis-placeholder">
            <div class="placeholder-icon">📋</div>
            <div class="placeholder-text">Upload a paper first to enable analysis</div>
          </div>

          <!-- Analysis Status -->
          <transition name="slide-fade">
            <div v-if="analysisStatus" class="status-message" :class="analysisStatus.type">
              <div class="status-icon">{{ analysisStatus.icon }}</div>
              <div class="status-content">
                <div class="status-text">{{ analysisStatus.message }}</div>
                <div class="status-details" v-if="analysisStatus.details">{{ analysisStatus.details }}</div>
              </div>
              <button 
                v-if="analysisStatus.type === 'error'" 
                class="status-close" 
                @click="clearAnalysisStatus"
                title="Dismiss"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import TopTabs from '../components/TopTabs.vue'
import { uploadPaper, startAnalysis } from '../api/analysis'

const router = useRouter()

// 文件相关状态
const fileInput = ref(null)
const selectedFile = ref(null)
const paperUrl = ref('')
const isFetching = ref(false)
const isDragOver = ref(false)
const urlError = ref('')

// 上传相关状态
const isUploading = ref(false)
const uploadedPaper = ref(null)
const uploadStatus = ref(null)

// 分析相关状态
const isAnalyzing = ref(false)
const analysisStatus = ref(null)

// 计算属性
const currentStep = computed(() => {
  if (uploadedPaper.value) return 2
  if (selectedFile.value || paperUrl.value.trim()) return 1
  return 1
})

const canUpload = computed(() => {
  return selectedFile.value || (paperUrl.value && paperUrl.value.trim() !== '')
})

const canAnalyze = computed(() => {
  return uploadedPaper.value && uploadedPaper.value.ID
})

// 文件选择相关方法
function triggerFileSelect() {
  fileInput.value?.click()
}

function onFileChange(e) {
  const file = e.target.files[0]
  if (file) {
    if (file.size > 50 * 1024 * 1024) {
      showUploadStatus('error', '❌', '文件大小超过50MB限制')
      return
    }
    selectedFile.value = file
    paperUrl.value = '' // 清空URL输入
    clearUploadStatus()
    showUploadStatus('success', '✅', '文件选择成功')
  }
}

function onFileDrop(e) {
  e.preventDefault()
  isDragOver.value = false
  const files = e.dataTransfer.files
  if (files.length > 0) {
    const file = files[0]
    if (file.type === 'application/pdf') {
      if (file.size > 50 * 1024 * 1024) {
        showUploadStatus('error', '❌', '文件大小超过50MB限制')
        return
      }
      selectedFile.value = file
      paperUrl.value = '' // 清空URL输入
      clearUploadStatus()
      showUploadStatus('success', '✅', '文件选择成功')
    } else {
      showUploadStatus('error', '❌', '请选择PDF文件')
    }
  }
}

function onDragOver(e) {
  e.preventDefault()
  isDragOver.value = true
}

function onDragLeave(e) {
  e.preventDefault()
  isDragOver.value = false
}

function removeFile() {
  selectedFile.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
  clearUploadStatus()
}

// URL相关方法
function onUrlInput() {
  clearUploadStatus()
  if (urlError.value) {
    validateUrl()
  }
}

function validateUrl() {
  if (!paperUrl.value.trim()) {
    urlError.value = ''
    return true
  }
  
  try {
    new URL(paperUrl.value)
    urlError.value = ''
    return true
  } catch {
    urlError.value = '请输入有效的URL地址'
    return false
  }
}

async function fetchFromUrl() {
  if (!paperUrl.value.trim() || !validateUrl()) return
  
  isFetching.value = true
  clearUploadStatus()
  
  try {
    showUploadStatus('info', '⏳', '正在从URL获取文件...')
    
    // 这里应该调用后端API来下载文件
    // 暂时模拟下载过程
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 模拟下载成功，创建一个虚拟文件对象
    selectedFile.value = {
      name: 'downloaded_paper.pdf',
      size: 1024 * 1024, // 1MB
      type: 'application/pdf'
    }
    
    showUploadStatus('success', '✅', '文件下载成功')
  } catch (error) {
    showUploadStatus('error', '❌', '文件下载失败：' + error.message)
  } finally {
    isFetching.value = false
  }
}

// 上传方法
async function uploadFile() {
  if (!canUpload.value) return
  
  isUploading.value = true
  clearUploadStatus()
  
  try {
    let fileToUpload = selectedFile.value
    
    // 如果是URL下载的文件，需要先获取实际文件
    if (paperUrl.value && !selectedFile.value) {
      showUploadStatus('info', '⏳', '正在从URL获取文件...')
      // 这里应该调用后端API来处理URL
      await fetchFromUrl()
      fileToUpload = selectedFile.value
    }
    
    if (!fileToUpload) {
      throw new Error('没有可上传的文件')
    }
    
    showUploadStatus('info', '⏳', '正在上传文件...')
    
    const result = await uploadPaper(fileToUpload)
    uploadedPaper.value = result.paper
    
    showUploadStatus('success', '✅', '文件上传成功！')
    
    // 添加成功动画效果
    setTimeout(() => {
      const successElement = document.querySelector('.upload-status.success')
      if (successElement) {
        successElement.classList.add('pulse')
      }
    }, 100)
    
    // 清空选择状态
    selectedFile.value = null
    paperUrl.value = ''
    urlError.value = ''
    if (fileInput.value) {
      fileInput.value.value = ''
    }
    
  } catch (error) {
    showUploadStatus('error', '❌', '上传失败：' + error.message)
  } finally {
    isUploading.value = false
  }
}

// 分析方法
async function startAnalysisTask() {
  if (!canAnalyze.value) return
  
  isAnalyzing.value = true
  clearAnalysisStatus()
  
  try {
    showAnalysisStatus('info', '⏳', '正在发起分析任务...')
    
    await startAnalysis(uploadedPaper.value.ID)
    
    showAnalysisStatus('success', '✅', '分析任务已发起！')
    
    // 添加成功动画效果
    setTimeout(() => {
      const successElement = document.querySelector('.analysis-status.success')
      if (successElement) {
        successElement.classList.add('pulse')
      }
    }, 100)
    
    // 跳转到任务列表页面
    setTimeout(() => {
      router.push('/my-analyses')
    }, 1500)
    
  } catch (error) {
    showAnalysisStatus('error', '❌', '分析失败：' + error.message)
  } finally {
    isAnalyzing.value = false
  }
}

// 状态管理方法
function showUploadStatus(type, icon, message) {
  uploadStatus.value = { type, icon, message }
}

function clearUploadStatus() {
  uploadStatus.value = null
}

function showAnalysisStatus(type, icon, message) {
  analysisStatus.value = { type, icon, message }
}

function clearAnalysisStatus() {
  analysisStatus.value = null
}

// 工具方法
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>

<style scoped>
/* Modern Expo.dev-inspired styling */
.upload-analysis-page {
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

/* Main Content */
.main-content {
  max-width: 800px;
  margin: 0 auto;
  padding: var(--spacing-2xl) var(--spacing-xl);
}

/* Progress Indicator */
.progress-indicator {
  margin-bottom: var(--spacing-2xl);
}

.progress-steps {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  border-radius: var(--radius-lg);
  transition: all var(--transition-normal);
  position: relative;
  min-width: 120px;
}

.step.active {
  background: var(--background-secondary);
  border: 1px solid var(--border-secondary);
}

.step.completed {
  background: var(--success-50);
  border: 1px solid var(--success-200);
}

.step-icon {
  font-size: var(--font-size-xl);
  margin-bottom: var(--spacing-xs);
}

.step-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
  text-align: center;
}

.step.active .step-label {
  color: var(--brand-primary);
}

.step.completed .step-label {
  color: var(--success-700);
}

.step-connector {
  width: 40px;
  height: 2px;
  background: var(--border-primary);
  flex-shrink: 0;
}

/* Upload Section */
.upload-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2xl);
}

.step-container {
  background: var(--background-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-xl);
  padding: var(--spacing-2xl);
  box-shadow: var(--shadow-md);
  transition: all var(--transition-normal);
  position: relative;
  overflow: hidden;
}

.step-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--border-secondary), transparent);
  opacity: 0;
  transition: opacity var(--transition-normal);
}

.step-container:hover::before {
  opacity: 1;
}

.step-container.disabled {
  opacity: 0.6;
  pointer-events: none;
}

.step-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.step-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: var(--brand-primary);
  color: var(--text-inverse);
  border-radius: var(--radius-full);
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-lg);
  box-shadow: var(--shadow-md);
  position: relative;
}

.step-icon {
  position: absolute;
  top: -2px;
  right: -2px;
  font-size: var(--font-size-sm);
}

.step-text {
  font-size: var(--font-size-xl);
}

.step-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-xs) 0;
}

.step-desc {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  margin: 0;
}

/* Upload Methods */
.upload-methods {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.upload-method {
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  transition: all var(--transition-normal);
  position: relative;
  overflow: hidden;
}

.upload-method:hover {
  border-color: var(--border-secondary);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.upload-method.active {
  border-color: var(--brand-primary);
  background: var(--brand-50);
}

.upload-method::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.03), transparent);
  transition: left var(--transition-slow);
}

.upload-method:hover::before {
  left: 100%;
}

.method-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-lg);
}

.method-icon-container {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.method-icon {
  font-size: var(--font-size-xl);
}

.method-info {
  flex: 1;
}

.method-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-xs) 0;
}

.method-desc {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  margin: 0;
}

.method-status {
  flex-shrink: 0;
}

.status-badge {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.success {
  background: var(--success-100);
  color: var(--success-700);
}

/* File Upload Area */
.file-upload-area {
  border: 2px dashed var(--border-primary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-2xl);
  text-align: center;
  cursor: pointer;
  transition: all var(--transition-normal);
  position: relative;
  background: var(--background-secondary);
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.file-upload-area:hover {
  border-color: var(--brand-primary);
  background: var(--background-tertiary);
  transform: scale(1.01);
}

.file-upload-area.drag-over {
  border-color: var(--brand-primary);
  background: var(--brand-50);
  border-style: solid;
  transform: scale(1.02);
}

.file-upload-area.has-file {
  border-color: var(--success-500);
  background: var(--success-50);
  border-style: solid;
}

.file-upload-area.uploading {
  opacity: 0.7;
  pointer-events: none;
}

.file-upload-area.uploading::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--brand-primary), var(--success-500));
  animation: uploadProgress 2s ease-in-out infinite;
}

@keyframes uploadProgress {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  animation: fadeInUp 0.5s ease-out;
}

.upload-icon {
  font-size: var(--font-size-3xl);
  color: var(--text-tertiary);
  animation: bounce 2s ease-in-out infinite;
}

.upload-text {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.upload-requirements {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.requirement-item {
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--background-primary);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-primary);
}

.requirement-dot {
  color: var(--text-tertiary);
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-10px); }
  60% { transform: translateY(-5px); }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.file-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-lg);
  animation: slideInLeft 0.4s ease-out;
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.file-preview {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex: 1;
}

.file-thumbnail {
  width: 48px;
  height: 48px;
  background: var(--brand-primary);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-inverse);
  font-size: var(--font-size-lg);
}

.file-icon-large {
  font-size: var(--font-size-xl);
}

.file-details {
  flex: 1;
  text-align: left;
}

.file-name {
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
  word-break: break-word;
}

.file-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.file-size, .file-type {
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--background-secondary);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-primary);
}

.remove-file {
  background: var(--error-500);
  color: var(--text-inverse);
  border: none;
  border-radius: var(--radius-md);
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-normal);
  flex-shrink: 0;
}

.remove-file:hover:not(:disabled) {
  background: var(--error-600);
  transform: scale(1.1);
}

.remove-file:disabled {
  background: var(--text-tertiary);
  cursor: not-allowed;
}

/* URL Input */
.url-input-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.url-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: var(--background-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  transition: all var(--transition-normal);
}

.url-input-wrapper:hover {
  border-color: var(--border-secondary);
  box-shadow: var(--shadow-sm);
}

.url-input-wrapper:focus-within {
  border-color: var(--border-focus);
  box-shadow: var(--focus-ring);
}

.url-icon {
  position: absolute;
  left: var(--spacing-lg);
  color: var(--text-tertiary);
  z-index: 2;
  pointer-events: none;
  transition: color var(--transition-normal);
}

.url-input-wrapper:focus-within .url-icon {
  color: var(--brand-primary);
}

.url-input {
  width: 100%;
  padding: var(--spacing-md) var(--spacing-lg) var(--spacing-md) calc(var(--spacing-lg) + var(--spacing-xl) + var(--spacing-md));
  border: none;
  background: transparent;
  font-size: var(--font-size-base);
  color: var(--text-primary);
  outline: none;
  font-weight: var(--font-weight-normal);
}

.url-input::placeholder {
  color: var(--text-tertiary);
}

.url-input.error {
  border-color: var(--error-500);
  background: var(--error-50);
}

.url-error {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: var(--error-600);
  font-size: var(--font-size-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--error-50);
  border: 1px solid var(--error-200);
  border-radius: var(--radius-md);
  animation: fadeIn 0.3s ease-out;
}

.fetch-btn {
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--brand-primary);
  color: var(--text-inverse);
  border: 1px solid var(--brand-primary);
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-normal);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  min-width: 120px;
}

.fetch-btn:hover:not(:disabled) {
  background: var(--brand-hover);
  border-color: var(--brand-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.fetch-btn:active:not(:disabled) {
  transform: translateY(0);
}

.fetch-btn:disabled {
  background: var(--text-tertiary);
  border-color: var(--text-tertiary);
  cursor: not-allowed;
  transform: none;
}

/* Actions */
.upload-actions, .analysis-actions {
  display: flex;
  justify-content: center;
  margin-bottom: var(--spacing-lg);
}

.upload-btn, .analyze-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-lg) var(--spacing-2xl);
  background: var(--brand-primary);
  color: var(--text-inverse);
  border: 1px solid var(--brand-primary);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all var(--transition-normal);
  position: relative;
  overflow: hidden;
  box-shadow: var(--shadow-md);
}

.upload-btn:hover:not(:disabled), .analyze-btn:hover:not(:disabled) {
  background: var(--brand-hover);
  border-color: var(--brand-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.upload-btn:active:not(:disabled), .analyze-btn:active:not(:disabled) {
  transform: translateY(0);
}

.upload-btn:disabled, .analyze-btn:disabled {
  background: var(--text-tertiary);
  border-color: var(--text-tertiary);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid var(--text-inverse);
  border-top: 2px solid transparent;
  border-radius: var(--radius-full);
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Status Messages */
.status-message {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  font-weight: var(--font-weight-medium);
  position: relative;
  animation: slideInRight 0.4s ease-out;
  border-left: 4px solid;
}

.status-message.success {
  background: var(--success-50);
  color: var(--success-700);
  border-left-color: var(--success-500);
}

.status-message.error {
  background: var(--error-50);
  color: var(--error-700);
  border-left-color: var(--error-500);
}

.status-message.info {
  background: var(--info-50);
  color: var(--info-700);
  border-left-color: var(--info-500);
}

.status-icon {
  font-size: var(--font-size-lg);
  flex-shrink: 0;
}

.status-content {
  flex: 1;
}

.status-text {
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-xs);
}

.status-details {
  font-size: var(--font-size-sm);
  opacity: 0.8;
}

.status-close {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: var(--spacing-xs);
  border-radius: var(--radius-sm);
  transition: all var(--transition-normal);
  flex-shrink: 0;
}

.status-close:hover {
  background: rgba(0, 0, 0, 0.1);
  transform: scale(1.1);
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Analysis Preview */
.analysis-preview {
  margin-bottom: var(--spacing-lg);
  animation: fadeInUp 0.5s ease-out;
}

.paper-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
  background: var(--background-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  transition: all var(--transition-normal);
}

.paper-card:hover {
  border-color: var(--border-secondary);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.paper-thumbnail {
  width: 48px;
  height: 48px;
  background: var(--brand-primary);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-inverse);
  font-size: var(--font-size-lg);
  flex-shrink: 0;
}

.paper-info {
  flex: 1;
}

.paper-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.paper-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.paper-id, .paper-status {
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--background-primary);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-primary);
}

.paper-separator {
  color: var(--text-tertiary);
}

.paper-actions {
  flex-shrink: 0;
}

.analyze-btn {
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--brand-primary);
  color: var(--text-inverse);
  border: 1px solid var(--brand-primary);
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-normal);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.analyze-btn:hover:not(:disabled) {
  background: var(--brand-hover);
  border-color: var(--brand-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.analyze-btn:disabled {
  background: var(--text-tertiary);
  border-color: var(--text-tertiary);
  cursor: not-allowed;
  transform: none;
}

/* Analysis Placeholder */
.analysis-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-2xl);
  text-align: center;
  background: var(--background-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  margin-bottom: var(--spacing-lg);
}

.placeholder-icon {
  font-size: var(--font-size-3xl);
  color: var(--text-tertiary);
}

.placeholder-text {
  color: var(--text-secondary);
  font-size: var(--font-size-base);
}

/* Transitions */
.slide-fade-enter-active {
  transition: all var(--transition-normal);
}

.slide-fade-leave-active {
  transition: all var(--transition-normal);
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-20px);
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
  
  .main-content {
    padding: var(--spacing-xl) var(--spacing-lg);
  }
  
  .progress-steps {
    flex-direction: column;
    gap: var(--spacing-sm);
  }
  
  .step {
    flex-direction: row;
    min-width: auto;
    padding: var(--spacing-sm);
  }
  
  .step-connector {
    width: 2px;
    height: 20px;
  }
  
  .step-container {
    padding: var(--spacing-xl);
  }
  
  .step-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
  }
  
  .method-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
  }
  
  .file-upload-area {
    padding: var(--spacing-lg);
    min-height: 100px;
  }
  
  .upload-placeholder {
    gap: var(--spacing-sm);
  }
  
  .upload-icon {
    font-size: var(--font-size-2xl);
  }
  
  .upload-text {
    font-size: var(--font-size-base);
  }
  
  .upload-requirements {
    flex-direction: column;
    gap: var(--spacing-xs);
  }
  
  .file-info {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
  }
  
  .file-preview {
    width: 100%;
  }
  
  .paper-card {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
  }
  
  .paper-actions {
    width: 100%;
  }
  
  .analyze-btn {
    width: 100%;
    justify-content: center;
  }
  
  .upload-btn,
  .analyze-btn {
    padding: var(--spacing-md) var(--spacing-lg);
    font-size: var(--font-size-base);
  }
  
  .status-message {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
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
  
  .main-content {
    padding: var(--spacing-lg) var(--spacing-md);
  }
  
  .step-container {
    padding: var(--spacing-lg);
  }
  
  .step-header {
    margin-bottom: var(--spacing-lg);
  }
  
  .step-number {
    width: 40px;
    height: 40px;
  }
  
  .step-icon {
    font-size: var(--font-size-base);
  }
  
  .step-text {
    font-size: var(--font-size-lg);
  }
  
  .upload-methods {
    gap: var(--spacing-md);
  }
  
  .upload-method {
    padding: var(--spacing-md);
  }
  
  .file-upload-area {
    padding: var(--spacing-md);
  }
  
  .upload-icon {
    font-size: var(--font-size-xl);
  }
  
  .upload-text {
    font-size: var(--font-size-sm);
  }
  
  .upload-requirements {
    font-size: var(--font-size-xs);
  }
  
  .file-thumbnail {
    width: 40px;
    height: 40px;
  }
  
  .placeholder-icon {
    font-size: var(--font-size-2xl);
  }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .hero-badge,
  .file-upload-area,
  .upload-method,
  .upload-btn,
  .analyze-btn,
  .fetch-btn,
  .remove-file,
  .status-message,
  .paper-card,
  .upload-icon,
  .file-upload-area.uploading::after {
    animation: none;
    transition: none;
  }
  
  .progress-steps,
  .status-message {
    animation: none;
  }
}
</style>

.upload-section {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.step-container {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.step-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.step-number {
  width: 40px;
  height: 40px;
  background: #3b82f6;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2rem;
}

.step-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
}

.step-desc {
  color: #64748b;
  font-size: 1rem;
}

.upload-methods {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 24px;
}

.upload-method {
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.upload-method:hover {
  border-color: #3b82f6;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.15);
}

.upload-method.active {
  border-color: #3b82f6;
  background: #f8fafc;
}

.upload-method::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.1), transparent);
  transition: left 0.5s ease;
}

.upload-method:hover::before {
  left: 100%;
}

.method-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.method-icon {
  font-size: 1.2rem;
}

.method-title {
  font-weight: 600;
  color: #1e293b;
}

.file-upload-area {
  border: 2px dashed #cbd5e1;
  border-radius: 8px;
  padding: 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  background: #fafbfc;
}

.file-upload-area:hover {
  border-color: #3b82f6;
  background-color: #f8fafc;
  transform: scale(1.02);
}

.file-upload-area.drag-over {
  border-color: #3b82f6;
  background-color: #eff6ff;
  border-style: solid;
  transform: scale(1.05);
}

.file-upload-area.has-file {
  border-color: #10b981;
  background-color: #f0fdf4;
  border-style: solid;
}

.file-upload-area.uploading {
  opacity: 0.7;
  pointer-events: none;
}

.file-upload-area.uploading::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #3b82f6, #10b981);
  animation: uploadProgress 2s ease-in-out infinite;
}

@keyframes uploadProgress {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  animation: fadeInUp 0.5s ease-out;
}

.upload-icon {
  font-size: 2rem;
  color: #94a3b8;
  animation: bounce 2s ease-in-out infinite;
}

.upload-text {
  font-weight: 500;
  color: #475569;
}

.upload-hint {
  font-size: 0.9rem;
  color: #94a3b8;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-10px); }
  60% { transform: translateY(-5px); }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.file-info {
  display: flex;
  align-items: center;
  gap: 12px;
  animation: slideInLeft 0.4s ease-out;
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.file-icon {
  font-size: 1.5rem;
}

.file-details {
  flex: 1;
  text-align: left;
}

.file-name {
  font-weight: 500;
  color: #1e293b;
  margin-bottom: 2px;
}

.file-size {
  font-size: 0.9rem;
  color: #64748b;
}

.remove-file {
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.remove-file:hover:not(:disabled) {
  background: #dc2626;
  transform: scale(1.1);
}

.remove-file:disabled {
  background: #94a3b8;
  cursor: not-allowed;
}

.url-input-container {
  display: flex;
  gap: 12px;
}

.url-input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  transition: all 0.3s ease;
  background: #fff;
}

.url-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  transform: translateY(-1px);
}

.url-input.error {
  border-color: #ef4444;
  background: #fef2f2;
}

.url-input.error:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.url-error {
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 4px;
  animation: fadeIn 0.3s ease-out;
}

.fetch-btn {
  padding: 12px 20px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  min-width: 80px;
}

.fetch-btn:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.fetch-btn:active:not(:disabled) {
  transform: translateY(0);
}

.fetch-btn:disabled {
  background: #94a3b8;
  cursor: not-allowed;
  transform: none;
}

.btn-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid #ffffff;
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.upload-actions, .analysis-actions {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

.upload-btn, .analyze-btn {
  padding: 14px 32px;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  min-width: 120px;
}

.upload-btn.primary, .analyze-btn.primary {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.upload-btn.primary:hover:not(:disabled), .analyze-btn.primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(37, 99, 235, 0.4);
}

.upload-btn.primary:active:not(:disabled), .analyze-btn.primary:active:not(:disabled) {
  transform: translateY(0);
}

.upload-btn:disabled, .analyze-btn:disabled {
  background: #94a3b8;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.upload-btn::before, .analyze-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.upload-btn:hover:not(:disabled)::before, .analyze-btn:hover:not(:disabled)::before {
  left: 100%;
}

.upload-status, .analysis-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 8px;
  font-weight: 500;
  position: relative;
  animation: slideInRight 0.4s ease-out;
}

.upload-status.pulse, .analysis-status.pulse {
  animation: slideInRight 0.4s ease-out, pulse 0.6s ease-in-out 0.4s;
}

.status-close {
  margin-left: auto;
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 2px;
  border-radius: 4px;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.status-close:hover {
  background: rgba(0, 0, 0, 0.1);
  transform: scale(1.1);
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.slide-fade-enter-active {
  transition: all 0.3s ease;
}

.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.upload-status.success, .analysis-status.success {
  background: #dcfce7;
  color: #166534;
}

.upload-status.error, .analysis-status.error {
  background: #fef2f2;
  color: #dc2626;
}

.upload-status.info, .analysis-status.info {
  background: #dbeafe;
  color: #1d4ed8;
}

.status-icon {
  font-size: 1.1rem;
}

.analysis-info {
  margin-bottom: 24px;
  animation: fadeInUp 0.5s ease-out;
}

.paper-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.paper-info:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.paper-icon {
  font-size: 1.5rem;
}

.paper-title {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 2px;
}

.paper-meta {
  font-size: 0.9rem;
  color: #64748b;
}

@media (max-width: 768px) {
  .main-content {
    padding: 20px 16px;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .step-container {
    padding: 24px 20px;
  }
  
  .url-input-container {
    flex-direction: column;
  }
  
  .fetch-btn {
    width: 100%;
  }
}
</style> 