import axios from 'axios'

// 创建 axios 实例
const api = axios.create({
  // 基础 URL，开发环境使用相对路径（会被 Vite 代理）
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 10000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器：添加认证 token
api.interceptors.request.use(
  (config) => {
    // 从 localStorage 获取 token
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器：统一处理响应和错误
api.interceptors.response.use(
  (response) => {
    // 直接返回响应数据
    return response
  },
  (error) => {
    // 处理错误响应
    if (error.response) {
      // 服务器返回错误状态码
      const { status, data } = error.response
      
      switch (status) {
        case 401:
          // 未授权，清除 token 并跳转到登录页
          localStorage.removeItem('auth_token')
          window.location.href = '/feed'
          break
        case 403:
          // 禁止访问
          console.error('访问被拒绝:', data)
          break
        case 404:
          // 资源不存在
          console.error('资源不存在:', data)
          break
        case 500:
          // 服务器内部错误
          console.error('服务器错误:', data)
          break
        default:
          console.error('请求失败:', data)
      }
    } else if (error.request) {
      // 请求已发出但没有收到响应
      console.error('网络错误，请检查网络连接')
    } else {
      // 请求配置错误
      console.error('请求配置错误:', error.message)
    }
    
    return Promise.reject(error)
  }
)

export default api 