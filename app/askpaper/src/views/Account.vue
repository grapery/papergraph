<template>
  <div>
    <TopTabs />
    <div v-if="!user">
      <button @click="login">Google 登录</button>
    </div>
    <div v-else>
      <div>用户ID: {{ user.user_id }}</div>
      <div>邮箱: {{ user.gmail }}</div>
    </div>
  </div>
</template>
<script setup>
// 声明类型
import { ref, onMounted } from 'vue'
import TopTabs from '../components/TopTabs.vue'
import { getCurrentUser } from '../api/auth'

// 用户信息
const user = ref(null)

// 组件挂载时获取用户信息
onMounted(async () => {
  try {
    user.value = await getCurrentUser()
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
})

// Google 登录（跳转到 Google 授权页面）
function login() {
  // 构建 Google OAuth2 授权 URL
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID'
  const redirectUri = encodeURIComponent(`${window.location.origin}/auth/google/callback`)
  const scope = encodeURIComponent('openid email profile')
  const responseType = 'code'
  const state = generateRandomState()
  
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${clientId}&` +
    `redirect_uri=${redirectUri}&` +
    `scope=${scope}&` +
    `response_type=${responseType}&` +
    `state=${state}&` +
    `access_type=offline&` +
    `prompt=consent`
  
  window.location.href = authUrl
}

// 生成随机状态字符串，用于防止 CSRF 攻击
function generateRandomState() {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}
</script> 