import axios from 'axios'

// 上传PDF，返回 {paper, task}
export function uploadPaper(file) {
  const formData = new FormData()
  formData.append('file', file)
  // 按文档，响应结构为 { code, msg, data: { paper, task } }
  return axios.post('/api/upload', formData).then(res => {
    if (res.data && res.data.code === 0 && res.data.data) {
      return {
        paper: res.data.data.paper,
        task: res.data.data.task
      }
    } else {
      // 失败时抛出错误信息
      throw new Error(res.data && res.data.msg ? res.data.msg : '上传失败')
    }
  })
}

// 发起分析（保留原有实现，兼容后端）
export function startAnalysis(file) {
  // 假设分析需要先上传，拿到文件ID后再分析
  // 这里可根据后端实际接口调整
  return uploadPaper(file).then(({ paper, task }) => {
    // 如果上传已自动创建任务，则直接返回
    if (task) return task
    // 否则兼容老流程
    const fileId = paper && paper.ID
    if (fileId) {
      return axios.post('/api/start_analysis', { file_id: fileId })
    }
    throw new Error('未获取到文件ID')
  })
}

// 获取用户所有分析任务
export function getUserTasks() {
  // 返回任务列表
  return axios.get('/api/tasks').then(res => res.data)
}

// 获取用户活跃任务
export function getUserActiveTasks() {
  // 返回活跃任务列表
  return axios.get('/api/active_tasks').then(res => res.data)
}

// 获取任务详情
export function getTaskDetail(task_id) {
  // 传入任务ID，返回任务详情
  return axios.get('/api/task_detail', { params: { task_id } }).then(res => res.data)
}

// 获取分析结果
export function getAnalysisResult(task_id) {
  // 传入任务ID，返回分析结果
  return axios.get('/api/analysis_result', { params: { task_id } }).then(res => res.data)
}

// 设置任务公开状态
export function setTaskPublicStatus(task_id, is_public) {
  // 传入任务ID和公开状态
  return axios.post('/api/set_public', { task_id, is_public })
}

// 获取评论
export function getComments(task_id) {
  // 传入任务ID，返回评论列表
  return axios.get('/api/comments', { params: { task_id } }).then(res => res.data)
}

// 新增评论
export function addComment(task_id, content) {
  // 传入任务ID和评论内容
  return axios.post('/api/comment', { task_id, content })
} 