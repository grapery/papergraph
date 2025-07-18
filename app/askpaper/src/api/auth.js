import api from './axios'

// 获取当前用户信息
export function getCurrentUser() {
  return api.get('/api/me').then(res => res.data)
}

// 跳转Google登录
export function googleLogin() {
  window.location.href = '/login/google'
} 