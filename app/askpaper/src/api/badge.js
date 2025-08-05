import axios from './axios'

// 获取用户奖章列表
export function getUserBadges(userId) {
  return axios.get(`/api/user/${userId}/badges`)
}

// 获取用户统计信息
export function getUserStats(userId) {
  return axios.get(`/api/user/${userId}/stats`)
}

// 获取用户基本信息
export function getUserInfo(userId) {
  return axios.get(`/api/user/${userId}/info`)
}

// 获取用户活动Feed流
export function getUserActivities(userId, page = 1, limit = 20) {
  return axios.get(`/api/user/${userId}/activities`, {
    params: { page, limit }
  })
}

// 获取用户分析Feed流
export function getUserAnalyses(userId, page = 1, limit = 20) {
  return axios.get(`/api/user/${userId}/analyses`, {
    params: { page, limit }
  })
}

// 关注用户
export function followUser(userId) {
  return axios.post(`/api/user/${userId}/follow`)
}

// 取消关注用户
export function unfollowUser(userId) {
  return axios.delete(`/api/user/${userId}/follow`)
}

// 检查关注状态
export function checkFollowStatus(userId) {
  return axios.get(`/api/user/${userId}/follow/status`)
}

// 对任务进行评价
export function reactToTask(taskId, reactionType) {
  return axios.post('/api/task/react', {
    task_id: taskId,
    reaction_type: reactionType
  })
}