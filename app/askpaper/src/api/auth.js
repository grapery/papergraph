import axios from 'axios'

// 获取当前用户信息
export function getMe() {
  return axios.get('/api/me').then(res => res.data)
}

// 跳转Google登录
export function googleLogin() {
  window.location.href = '/login/google'
} 