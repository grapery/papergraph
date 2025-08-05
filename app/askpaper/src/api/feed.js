import api from './axios'

/**
 * 获取公开分析列表
 * @param {string} [orderBy] - 排序方式：like/suggest/默认时间
 * @returns {Promise<Array>} 公开分析列表
 */
export function getPublicFeed(orderBy = '') {
  const params = {}
  if (orderBy) {
    params.order_by = orderBy
  }
  
  return api.get('/public_feed', { params }).then(res => {
    if (res.data && res.data.code === 0) {
      return res.data.data || []
    } else {
      throw new Error(res.data && res.data.message ? res.data.message : '获取公开分析失败')
    }
  })
}

/**
 * 点赞分析任务
 * @param {number|string} taskId - 任务ID
 * @returns {Promise<Object>} 点赞结果
 */
export function likeTask(taskId) {
  const formData = new FormData()
  formData.append('task_id', taskId.toString())
  
  return api.post('/api/like', formData).then(res => {
    if (res.data && res.data.code === 0) {
      return res.data.data || {}
    } else {
      throw new Error(res.data && res.data.message ? res.data.message : '点赞失败')
    }
  })
}

/**
 * 取消点赞分析任务
 * @param {number|string} taskId - 任务ID
 * @returns {Promise<Object>} 取消点赞结果
 */
export function unlikeTask(taskId) {
  const formData = new FormData()
  formData.append('task_id', taskId.toString())
  
  return api.post('/api/unlike', formData).then(res => {
    if (res.data && res.data.code === 0) {
      return res.data.data || {}
    } else {
      throw new Error(res.data && res.data.message ? res.data.message : '取消点赞失败')
    }
  })
}

/**
 * 建议读原文（通过评论接口实现）
 * @param {number|string} taskId - 任务ID
 * @returns {Promise<Object>} 评论结果
 */
export function suggestRead(taskId) {
  const formData = new FormData()
  formData.append('task_id', taskId.toString())
  formData.append('content', '强烈建议读原文')
  
  return api.post('/api/comment', formData).then(res => {
    if (res.data && res.data.code === 0 && res.data.data) {
      return res.data.data
    } else {
      throw new Error(res.data && res.data.message ? res.data.message : '建议读原文失败')
    }
  })
} 