import axios from 'axios'

// 获取public_feed流
export function getPublicFeed() {
  return axios.get('/public_feed').then(res => res.data)
}

// 点赞
export function likeTask(task_id) {
  return axios.post('/api/like', { task_id })
}

// 点踩
export function unlikeTask(task_id) {
  return axios.post('/api/unlike', { task_id })
}

// 强烈建议读原文（用评论接口实现）
export function suggestRead(task_id) {
  return axios.post('/api/comment', { task_id, content: '强烈建议读原文' })
} 