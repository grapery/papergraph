import api from './axios'

/**
 * 获取当前用户信息
 * @returns {Promise<Object>} 用户信息对象
 */
export function getCurrentUser() {
  return api.get('/api/me').then(res => {
    if (res.data && res.data.code === 0) {
      return res.data.data || {}
    } else {
      throw new Error(res.data && res.data.message ? res.data.message : '获取用户信息失败')
    }
  })
}

/**
 * 跳转Google登录
 */
export function googleLogin() {
  window.location.href = '/login/google'
} 