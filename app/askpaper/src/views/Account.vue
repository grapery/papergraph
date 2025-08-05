<template>
  <div>
    <TopTabs />
    <div v-if="!user">
      <button @click="login">模拟登录</button>
    </div>
    <div v-else>
      <div>用户ID: {{ user.id }}</div>
      <div>用户名: {{ user.name }}</div>
      <div>邮箱: {{ user.gmail }}</div>
      <button @click="logout" style="margin-top: 16px;">登出</button>
    </div>
  </div>
</template>
<script setup>
// 声明类型
import { ref, onMounted } from 'vue'
import TopTabs from '../components/TopTabs.vue'

// 用户信息
const user = ref(null)

// 组件挂载时获取用户信息
onMounted(() => {
  checkLoginStatus()
})

/**
 * 检查登录状态
 */
function checkLoginStatus() {
  const token = localStorage.getItem('auth_token')
  const mockUser = localStorage.getItem('mock_user')
  
  if (token && mockUser) {
    try {
      user.value = JSON.parse(mockUser)
    } catch (error) {
      console.error('解析模拟用户数据失败:', error)
      user.value = null
    }
  } else {
    user.value = null
  }
}

// 模拟登录
function login() {
  // 模拟用户数据
  const mockUser = {
    id: 1,
    name: '测试用户',
    gmail: 'test@example.com'
  }
  
  // 模拟 token
  const mockToken = 'mock_token_' + Date.now()
  
  // 保存到 localStorage
  localStorage.setItem('auth_token', mockToken)
  localStorage.setItem('mock_user', JSON.stringify(mockUser))
  
  // 更新用户状态
  user.value = mockUser
  
  // 显示登录成功提示
  alert('模拟登录成功！')
}

// 登出
function logout() {
  localStorage.removeItem('auth_token')
  localStorage.removeItem('mock_user')
  user.value = null
  alert('已登出！')
}
</script> 