import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    // 开发服务器配置
    port: 3000, // 前端开发服务器端口
    proxy: {
      // API 请求代理到后端
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false
      },
      // Google OAuth2 回调代理到后端
      '/auth': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
