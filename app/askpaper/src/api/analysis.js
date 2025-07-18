import api from './axios'

// 上传PDF，返回 {paper, task}
export function uploadPaper(file) {
  const formData = new FormData()
  formData.append('file', file)
  // 按文档，响应结构为 { code, msg, data: { paper, task } }
  return api.post('/api/upload', formData).then(res => {
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
      return api.post('/api/start_analysis', { file_id: fileId })
    }
    throw new Error('未获取到文件ID')
  })
}

/**
 * 只用文件ID发起分析任务
 * @param {number|string} fileId 文件ID
 * @returns {Promise<any>} 分析任务结果
 */
export function startAnalysisById(fileId) {
  return api.post('/api/start_analysis', { file_id: fileId }).then(res => {
    if (res.data && res.data.code === 0 && res.data.data) {
      return res.data.data
    } else {
      throw new Error(res.data && res.data.msg ? res.data.msg : '分析发起失败')
    }
  })
}

// 获取用户所有分析任务
export function getUserTasks() {
  // 返回任务列表
  return api.get('/api/tasks').then(res => res.data)
}

// 获取用户活跃任务
export function getUserActiveTasks() {
  // 返回活跃任务列表
  return api.get('/api/active_tasks').then(res => res.data)
}

/**
 * @typedef {Object} TaskDetail
 * @property {number} ID - 任务ID
 * @property {string} Title - 任务标题
 * @property {string} Status - 任务状态
 * @property {string} CreatedAt - 创建时间（ISO字符串）
 * // ... 其他后端返回字段
 */

/**
 * 获取任务详情
 * @param {number} task_id 任务ID
 * @returns {Promise<TaskDetail>} 任务详情对象
 */
export function getTaskDetail(task_id) {
  return api.get('/api/task_detail', { params: { task_id } }).then(res => {
    if (res.data && res.data.code === 0 && res.data.data) {
      return res.data.data
    } else {
      throw new Error(res.data && res.data.msg ? res.data.msg : '获取任务详情失败')
    }
  })
}

/**
 * @typedef {Object} AnalysisResult
 * @property {number} ID - 分析结果ID
 * @property {number} TaskID - 任务ID
 * @property {Object} Result - 具体分析结果内容（结构视后端定义）
 * @property {number} [score] - 评分（可选，示例字段）
 * @property {string} [summary] - 摘要（可选，示例字段）
 * @property {Object} [details] - 详细内容（可选，示例字段）
 */

/**
 * 获取分析结果
 * @param {number} task_id 任务ID
 * @returns {Promise<AnalysisResult>} 分析结果对象
 */
export function getAnalysisResult(task_id) {
  return api.get('/api/analysis_result', { params: { task_id } }).then(res => {
    if (res.data && res.data.code === 0 && res.data.data) {
      return res.data.data
    } else {
      throw new Error(res.data && res.data.msg ? res.data.msg : '获取分析结果失败')
    }
  })
}

/**
 * @typedef {Object} SetTaskPublicStatusResult
 * @property {string} message - 设置结果信息（如"设置成功"）
 */

/**
 * 设置任务公开/私有状态
 * @param {number} task_id 任务ID
 * @param {string|number|boolean} is_public 是否公开（"1"/"true"/1/true 为公开，其它为私有）
 * @returns {Promise<SetTaskPublicStatusResult>} 结果对象
 */
export function setTaskPublicStatus(task_id, is_public) {
  // 传入任务ID和公开状态
  return api.post('/api/set_public', { task_id, is_public }).then(res => {
    if (res.data && res.data.code === 0 && res.data.data && res.data.data.message) {
      return res.data.data
    } else {
      throw new Error(res.data && res.data.msg ? res.data.msg : '设置公开状态失败')
    }
  })
}

// 获取评论
export function getComments(task_id) {
  // 传入任务ID，返回评论列表
  return api.get('/api/comments', { params: { task_id } }).then(res => res.data)
}

// 新增评论
export function addComment(task_id, content) {
  // 传入任务ID和评论内容
  return api.post('/api/comment', { task_id, content })
} 