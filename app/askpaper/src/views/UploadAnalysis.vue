<template>
  <div class="upload-analysis-page">
    <TopTabs />
    
    <div class="main-content">
      <div class="page-header">
        <h1 class="page-title">论文分析</h1>
        <p class="page-subtitle">上传PDF文件或提供论文URL，然后开始智能分析</p>
      </div>

      <div class="upload-section">
        <!-- 第一步：上传文件或URL -->
        <div class="step-container">
          <div class="step-header">
            <div class="step-number">1</div>
            <div class="step-info">
              <h3 class="step-title">上传论文</h3>
              <p class="step-desc">选择PDF文件或输入论文URL</p>
            </div>
          </div>

          <div class="upload-methods">
            <!-- 文件上传 -->
            <div class="upload-method" :class="{ 'active': selectedFile }">
              <div class="method-header">
                <span class="method-icon">📄</span>
                <span class="method-title">上传PDF文件</span>
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
                  <div class="upload-text">点击选择文件或拖拽PDF到此处</div>
                  <div class="upload-hint">支持PDF格式，最大50MB</div>
                </div>
                <div v-else class="file-info">
                  <div class="file-icon">📄</div>
                  <div class="file-details">
                    <div class="file-name">{{ selectedFile.name }}</div>
                    <div class="file-size">{{ formatFileSize(selectedFile.size) }}</div>
                  </div>
                  <button 
                    class="remove-file" 
                    @click.stop="removeFile"
                    :disabled="isUploading"
                    title="移除文件"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>

            <!-- URL输入 -->
            <div class="upload-method" :class="{ 'active': paperUrl.trim() }">
              <div class="method-header">
                <span class="method-icon">🔗</span>
                <span class="method-title">输入论文URL</span>
              </div>
              <div class="url-input-container">
                <input 
                  v-model="paperUrl" 
                  type="url" 
                  placeholder="请输入论文的URL地址" 
                  class="url-input"
                  :class="{ 'error': urlError }"
                  @input="onUrlInput"
                  @blur="validateUrl"
                  :disabled="isFetching"
                />
                <div v-if="urlError" class="url-error">{{ urlError }}</div>
                <button 
                  class="fetch-btn" 
                  @click="fetchFromUrl"
                  :disabled="!paperUrl || isFetching"
                  :title="paperUrl ? '从URL获取论文' : '请输入URL'"
                >
                  <span v-if="isFetching" class="btn-spinner"></span>
                  <span v-else>{{ isFetching ? '获取中...' : '获取' }}</span>
                </button>
              </div>
            </div>
          </div>

          <!-- 上传按钮 -->
          <div class="upload-actions">
            <button 
              class="upload-btn primary" 
              @click="uploadFile"
              :disabled="!canUpload || isUploading"
              :title="canUpload ? '上传文件开始分析' : '请先选择文件或输入URL'"
            >
              <span v-if="isUploading" class="btn-spinner"></span>
              <span v-else>{{ isUploading ? '上传中...' : '上传文件' }}</span>
            </button>
          </div>

          <!-- 上传状态 -->
          <transition name="slide-fade">
            <div v-if="uploadStatus" class="upload-status" :class="uploadStatus.type">
              <span class="status-icon">{{ uploadStatus.icon }}</span>
              <span class="status-text">{{ uploadStatus.message }}</span>
              <button 
                v-if="uploadStatus.type === 'error'" 
                class="status-close" 
                @click="clearUploadStatus"
                title="关闭"
              >
                ✕
              </button>
            </div>
          </transition>
        </div>

        <!-- 第二步：开始分析 -->
        <div class="step-container">
          <div class="step-header">
            <div class="step-number">2</div>
            <div class="step-info">
              <h3 class="step-title">开始分析</h3>
              <p class="step-desc">对已上传的论文进行智能分析</p>
            </div>
          </div>

          <div class="analysis-info" v-if="uploadedPaper">
            <div class="paper-info">
              <div class="paper-icon">📄</div>
              <div class="paper-details">
                <div class="paper-title">{{ uploadedPaper.Title || '论文分析' }}</div>
                <div class="paper-meta">文件ID: {{ uploadedPaper.ID }}</div>
              </div>
            </div>
          </div>

          <div class="analysis-actions">
            <button 
              class="analyze-btn primary" 
              @click="startAnalysisTask"
              :disabled="!canAnalyze || isAnalyzing"
              :title="canAnalyze ? '开始分析论文' : '请先上传文件'"
            >
              <span v-if="isAnalyzing" class="btn-spinner"></span>
              <span v-else>{{ isAnalyzing ? '分析中...' : '开始分析' }}</span>
            </button>
          </div>

          <!-- 分析状态 -->
          <transition name="slide-fade">
            <div v-if="analysisStatus" class="analysis-status" :class="analysisStatus.type">
              <span class="status-icon">{{ analysisStatus.icon }}</span>
              <span class="status-text">{{ analysisStatus.message }}</span>
              <button 
                v-if="analysisStatus.type === 'error'" 
                class="status-close" 
                @click="clearAnalysisStatus"
                title="关闭"
              >
                ✕
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
.upload-analysis-page {
  min-height: 100vh;
  background: #f8fafc;
}

.main-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-title {
  font-size: 2.5rem;
  font-weight: bold;
  color: #1e293b;
  margin-bottom: 8px;
}

.page-subtitle {
  font-size: 1.1rem;
  color: #64748b;
}

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