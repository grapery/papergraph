import api from './axios'

/**
 * 上传PDF文件
 * @param {File} file - PDF文件对象
 * @returns {Promise<{paper: Object, task: Object}>} 返回论文和任务信息
 */
export function uploadPaper(file) {
  const formData = new FormData()
  formData.append('file', file)
  
  return api.post('/api/upload', formData).then(res => {
    if (res.data && res.data.code === 0 && res.data.data) {
      return {
        paper: res.data.data.paper,
        task: res.data.data.task
      }
    } else {
      throw new Error(res.data && res.data.message ? res.data.message : '上传失败')
    }
  })
}

/**
 * 发起分析任务（使用文件ID）
 * @param {number|string} taskId - 任务ID
 * @returns {Promise<Object>} 分析任务结果
 */
export function startAnalysis(taskId) {
  return api.post('/api/start_analysis', null, { 
    params: { task_id: taskId } 
  }).then(res => {
    if (res.data && res.data.code === 0 && res.data.data) {
      return res.data.data
    } else {
      throw new Error(res.data && res.data.message ? res.data.message : '分析发起失败')
    }
  })
}

/**
 * 获取用户所有分析任务
 * @returns {Promise<Array>} 任务列表
 */
export function getUserTasks() {
  return api.get('/api/tasks').then(res => {
    if (res.data && res.data.code === 0) {
      return res.data.data || []
    } else {
      throw new Error(res.data && res.data.message ? res.data.message : '获取任务列表失败')
    }
  })
}

/**
 * 获取用户活跃任务
 * @returns {Promise<Array>} 活跃任务列表
 */
export function getUserActiveTasks() {
  return api.get('/api/active_tasks').then(res => {
    if (res.data && res.data.code === 0) {
      return res.data.data || []
    } else {
      throw new Error(res.data && res.data.message ? res.data.message : '获取活跃任务失败')
    }
  })
}

/**
 * 获取任务详情
 * @param {number|string} taskId - 任务ID
 * @returns {Promise<Object>} 任务详情对象
 */
export function getTaskDetail(taskId) {
  return api.get('/api/task_detail', { 
    params: { task_id: taskId } 
  }).then(res => {
    if (res.data && res.data.code === 0 && res.data.data) {
      return res.data.data
    } else {
      throw new Error(res.data && res.data.message ? res.data.message : '获取任务详情失败')
    }
  })
}

/**
 * 获取分析结果
 * @param {number|string} taskId - 任务ID
 * @returns {Promise<Object>} 分析结果对象
 */
export function getAnalysisResult(taskId) {
  return api.get('/api/analysis_result', { 
    params: { task_id: taskId } 
  }).then(res => {
    if (res.data && res.data.code === 0 && res.data.data) {
      return res.data.data
    } else {
      throw new Error(res.data && res.data.message ? res.data.message : '获取分析结果失败')
    }
  })
}

/**
 * 设置任务公开/私有状态
 * @param {number|string} taskId - 任务ID
 * @param {string|number|boolean} isPublic - 是否公开
 * @returns {Promise<Object>} 结果对象
 */
export function setTaskPublicStatus(taskId, isPublic) {
  const formData = new FormData()
  formData.append('task_id', taskId.toString())
  formData.append('is_public', isPublic ? '1' : '0')
  
  return api.post('/api/set_public', formData).then(res => {
    if (res.data && res.data.code === 0 && res.data.data) {
      return res.data.data
    } else {
      throw new Error(res.data && res.data.message ? res.data.message : '设置公开状态失败')
    }
  })
}

/**
 * 获取评论列表
 * @param {number|string} taskId - 任务ID
 * @returns {Promise<Array>} 评论列表
 */
export function getComments(taskId) {
  return api.get('/api/comments', { 
    params: { task_id: taskId } 
  }).then(res => {
    if (res.data && res.data.code === 0) {
      return res.data.data || []
    } else {
      throw new Error(res.data && res.data.message ? res.data.message : '获取评论失败')
    }
  })
}

/**
 * 添加评论
 * @param {number|string} taskId - 任务ID
 * @param {string} content - 评论内容
 * @param {number|string} [parentId] - 父评论ID（可选，用于回复）
 * @returns {Promise<Object>} 评论对象
 */
export function addComment(taskId, content, parentId = null) {
  const formData = new FormData()
  formData.append('task_id', taskId.toString())
  formData.append('content', content)
  if (parentId) {
    formData.append('parent_id', parentId.toString())
  }
  
  return api.post('/api/comment', formData).then(res => {
    if (res.data && res.data.code === 0 && res.data.data) {
      return res.data.data
    } else {
      throw new Error(res.data && res.data.message ? res.data.message : '添加评论失败')
    }
  })
} 