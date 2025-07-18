<template>
  <div class="my-tasks-page">
    <!-- 顶部右上角用户信息 -->
    <div class="user-info-bar">
      <template v-if="user">
        <span class="user-avatar">{{ user.gmail }}</span>
      </template>
    </div>
    <h1 class="title">My Tasks</h1>
    <div class="subtitle">You can have up to 2 tasks running at a time.</div>

    <div class="section-title">Current Tasks</div>
    <div v-if="tasks.length === 0" class="empty-tasks">No current tasks.</div>
    <div v-else class="task-list">
      <div v-for="task in tasks" :key="task.id" class="task-item">
        <div class="task-icon">
          <svg width="36" height="36" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="36" height="36" rx="8" fill="#F3F4F6"/><path d="M12 12h12v12H12z" fill="#E5E7EB"/><rect x="15" y="16" width="6" height="1.5" rx="0.75" fill="#9CA3AF"/><rect x="15" y="19" width="6" height="1.5" rx="0.75" fill="#9CA3AF"/></svg>
        </div>
        <div class="task-info">
          <div class="task-title">{{ task.title }}</div>
          <div class="task-status">{{ task.status }}</div>
          <div class="task-date">Uploaded {{ task.uploaded }}</div>
        </div>
      </div>
    </div>

    <div class="section-title" style="margin-top:36px;">Start a New Task</div>
    <div class="upload-box">
      <div class="upload-box-content">
        <div class="upload-title">Upload a paper to start a new task</div>
        <div class="upload-desc">You can upload a PDF or provide a URL to a paper.</div>
        <input ref="fileInput" type="file" accept="application/pdf" style="display:none" @change="onFileChange" />
        <button class="upload-btn" @click="triggerUpload">Upload Paper</button>
      </div>
    </div>
  </div>
</template>
<script setup>
// 声明类型
import { ref, onMounted } from 'vue'
import { getCurrentUser } from '../api/auth'
import { getUserActiveTasks, uploadPaper, startAnalysis } from '../api/analysis'

// 用户信息
const user = ref(null)
// 任务列表
const tasks = ref([])
// 文件选择ref
const fileInput = ref(null)

// 页面加载时获取用户信息和任务
onMounted(async () => {
  try {
    user.value = await getCurrentUser()
  } catch (error) {
    console.error('获取用户信息失败:', error)
    // 未登录，跳转到 Google 登录
    redirectToGoogleLogin()
    return
  }
  await refreshTasks()
})

// 跳转到 Google 登录
function redirectToGoogleLogin() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID'
  const redirectUri = encodeURIComponent(`${window.location.origin}/auth/google/callback`)
  const scope = encodeURIComponent('openid email profile')
  const responseType = 'code'
  const state = generateRandomState()
  
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${clientId}&` +
    `redirect_uri=${redirectUri}&` +
    `scope=${scope}&` +
    `response_type=${responseType}&` +
    `state=${state}&` +
    `access_type=offline&` +
    `prompt=consent`
  
  window.location.href = authUrl
}

// 生成随机状态字符串，用于防止 CSRF 攻击
function generateRandomState() {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

// 刷新活跃任务
async function refreshTasks() {
  try {
    const res = await getUserActiveTasks()
    // 适配后端返回格式 { code, msg, data: [ ... ] }
    if (Array.isArray(res.data)) {
      tasks.value = res.data.map(task => ({
        id: task.ID,
        title: task.Title,
        status: mapStatus(task.Status),
        uploaded: formatDate(task.CreatedAt)
      }))
    } else {
      tasks.value = []
    }
  } catch (error) {
    console.error('获取任务列表失败:', error)
    tasks.value = []
  }
}

// 状态映射
function mapStatus(status) {
  if (status === '进行中') return 'Processing'
  if (status === 'Analyzing') return 'Analyzing'
  return status || ''
}

// 时间格式化
function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d)) return ''
  // 返回"YYYY-MM-DD"格式
  return d.toISOString().slice(0, 10)
}

// 触发文件选择
function triggerUpload() {
  fileInput.value && fileInput.value.click()
}

// 文件选择后上传并发起分析
async function onFileChange(e) {
  const file = e.target.files[0]
  if (!file) return
  try {
    await startAnalysis(file)
    await refreshTasks()
    window.alert('任务已创建！')
  } catch (err) {
    console.error('上传或分析失败:', err)
    window.alert('上传或分析失败')
  }
  // 重置input
  e.target.value = ''
}
</script>
<style scoped>
.my-tasks-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 0 0 0;
  position: relative;
}
.user-info-bar {
  position: absolute;
  top: 18px;
  right: 32px;
  z-index: 2;
}
.user-avatar {
  background: #e5eaf3;
  color: #2563eb;
  border-radius: 16px;
  padding: 6px 18px;
  font-size: 1.01rem;
  font-weight: 500;
}
.title {
  font-size: 2.1rem;
  font-weight: bold;
  margin-bottom: 8px;
  color: #222;
}
.subtitle {
  color: #5b7bb3;
  font-size: 1.08rem;
  margin-bottom: 32px;
}
.section-title {
  font-size: 1.15rem;
  font-weight: 600;
  margin-bottom: 18px;
  color: #222;
}
.task-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.task-item {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 8px 0 #f3f4f6;
  padding: 18px 22px;
  gap: 18px;
}
.task-icon {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.task-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.task-title {
  font-size: 1.08rem;
  font-weight: 600;
  color: #222;
}
.task-status {
  color: #5b7bb3;
  font-size: 1.01rem;
}
.task-date {
  color: #6b7280;
  font-size: 0.97rem;
}
.upload-box {
  margin-top: 18px;
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  background: #f9fafb;
  min-height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.upload-box-content {
  text-align: center;
}
.upload-title {
  font-size: 1.13rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: #222;
}
.upload-desc {
  color: #6b7280;
  font-size: 1.01rem;
  margin-bottom: 18px;
}
.upload-btn {
  background: #e5eaf3;
  color: #222;
  border: none;
  border-radius: 8px;
  padding: 10px 28px;
  font-size: 1.05rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}
.upload-btn:hover {
  background: #d1d5db;
}
.empty-tasks {
  color: #888;
  margin-bottom: 18px;
}
</style> 