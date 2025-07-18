<template>
  <nav class="navbar">
    <!-- Logo 区域 -->
    <div class="navbar-left">
      <span class="logo">ScholarLens</span>
      <ul class="nav-menu">
        <li :class="{active: activeMenu==='feed'}" @click="go('/feed')">Public Feed</li>
        <li :class="{active: activeMenu==='myanalyses'}" @click="go('/my-analyses')">My Analyses</li>
        <li :class="{active: activeMenu==='myanalysestask'}" @click="go('/my-analyses-task')">My Analyses Task</li>
      </ul>
    </div>
    <!-- 搜索框 -->
    <div class="navbar-center">
      <input class="search-input" type="text" placeholder="Search" v-model="search" />
    </div>
    <!-- 用户头像或登录按钮 -->
    <div class="navbar-right">
      <template v-if="user">
        <div class="user-menu">
          <img :src="user.avatar || defaultAvatar" class="avatar" alt="avatar" @click="toggleUserMenu" />
          <div v-if="showUserMenu" class="user-dropdown">
            <div class="user-info">
              <span>{{ user.name || user.gmail || '用户' }}</span>
            </div>
            <button class="logout-btn" @click="logout">登出</button>
          </div>
        </div>
      </template>
      <template v-else>
        <button class="login-btn" @click="login">使用gmail登录</button>
      </template>
    </div>
  </nav>
</template>

<script setup>
// 声明类型
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
const router = useRouter()
const route = useRoute()

// 当前激活菜单
const activeMenu = computed(() => {
  if (route.path.startsWith('/feed')) return 'feed'
  if (route.path.startsWith('/my-analyses-task')) return 'myanalysestask'
  if (route.path.startsWith('/my-analyses')) return 'myanalyses'
  return ''
})

// 搜索框内容
const search = ref('')

// 用户信息（可根据实际登录逻辑替换）
const user = ref(null)
const defaultAvatar = 'https://api.dicebear.com/7.x/miniavs/svg?seed=1'

// 用户菜单状态
const showUserMenu = ref(false)

// 模拟获取用户信息
onMounted(() => {
  // 检查是否已登录
  checkLoginStatus()
  // 检查 URL 参数中是否有登录成功的 token
  handleLoginCallback()
  
  // 点击外部关闭用户菜单
  document.addEventListener('click', handleClickOutside)
})

// 组件卸载时移除事件监听
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

/**
 * 处理点击外部关闭用户菜单
 */
function handleClickOutside(event) {
  const userMenu = document.querySelector('.user-menu')
  if (userMenu && !userMenu.contains(event.target)) {
    showUserMenu.value = false
  }
}

/**
 * 切换用户菜单显示状态
 */
function toggleUserMenu() {
  showUserMenu.value = !showUserMenu.value
}

/**
 * 检查登录状态
 */
function checkLoginStatus() {
  const token = localStorage.getItem('auth_token')
  if (token) {
    // TODO: 验证 token 有效性，获取用户信息
    user.value = { avatar: defaultAvatar }
  } else {
    user.value = null
  }
}

/**
 * 处理登录回调
 */
function handleLoginCallback() {
  const urlParams = new URLSearchParams(window.location.search)
  const token = urlParams.get('token')
  const loginSuccess = urlParams.get('login_success')
  const error = urlParams.get('error')
  
  if (error) {
    // 处理登录错误
    alert(`登录失败: ${error}`)
    // 清除 URL 参数
    const newUrl = window.location.pathname
    window.history.replaceState({}, document.title, newUrl)
    return
  }
  
  if (token && loginSuccess === 'true') {
    // 保存 token 到 localStorage
    localStorage.setItem('auth_token', token)
    
    // 更新用户状态（这里简化处理，实际项目中应该调用 API 获取用户信息）
    user.value = { avatar: defaultAvatar }
    
    // 清除 URL 参数
    const newUrl = window.location.pathname
    window.history.replaceState({}, document.title, newUrl)
    
    // 显示登录成功提示
    alert('登录成功！')
  }
}

/**
 * 登出功能
 */
function logout() {
  localStorage.removeItem('auth_token')
  user.value = null
  // 可选：跳转到首页
  router.push('/feed')
}

function login() {
  // Google OAuth2 登录
  const googleAuthUrl = buildGoogleAuthUrl()
  // 跳转到 Google 授权页面
  window.location.href = googleAuthUrl
}

/**
 * 构建 Google OAuth2 授权 URL
 * @returns {string} Google 授权 URL
 */
function buildGoogleAuthUrl() {
  // Google OAuth2 配置参数
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID' // 从环境变量获取
  const redirectUri = encodeURIComponent(`${window.location.origin}/auth/google/callback`) // 后端回调地址
  const scope = encodeURIComponent('openid email profile') // 请求的权限范围
  const responseType = 'code' // 授权码模式
  const state = generateRandomState() // 防止 CSRF 攻击的随机状态
  
  // 构建授权 URL
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${clientId}&` +
    `redirect_uri=${redirectUri}&` +
    `scope=${scope}&` +
    `response_type=${responseType}&` +
    `state=${state}&` +
    `access_type=offline&` +
    `prompt=consent`
  
  return authUrl
}

/**
 * 生成随机状态字符串，用于防止 CSRF 攻击
 * @returns {string} 随机状态字符串
 */
function generateRandomState() {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}
function go(path) {
  router.push(path)
}
</script>

<style scoped>
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 32px;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 2px 8px 0 #f3f4f6;
}
.navbar-left {
  display: flex;
  align-items: center;
}
.logo {
  font-weight: bold;
  font-size: 1.4rem;
  margin-right: 32px;
}
.nav-menu {
  display: flex;
  gap: 24px;
  list-style: none;
  padding: 0;
  margin: 0;
}
.nav-menu li {
  cursor: pointer;
  color: #374151;
  font-size: 1rem;
  padding-bottom: 4px;
  transition: border 0.2s;
}
.nav-menu li.active {
  font-weight: bold;
  border-bottom: 2px solid #2563eb;
}
.navbar-center {
  flex: 1;
  display: flex;
  justify-content: center;
}
.search-input {
  width: 260px;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
}
.navbar-right {
  display: flex;
  align-items: center;
}
.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #e5e7eb;
  cursor: pointer;
  transition: transform 0.2s;
}
.avatar:hover {
  transform: scale(1.05);
}
.user-menu {
  position: relative;
}
.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 1px solid #e5e7eb;
  min-width: 160px;
  z-index: 1000;
}
.user-info {
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
  color: #374151;
  font-size: 0.9rem;
}
.logout-btn {
  width: 100%;
  padding: 8px 16px;
  background: none;
  border: none;
  color: #dc2626;
  cursor: pointer;
  font-size: 0.9rem;
  text-align: left;
  transition: background 0.2s;
}
.logout-btn:hover {
  background: #fef2f2;
}
.login-btn {
  background: #2563eb;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 8px 18px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}
.login-btn:hover {
  background: #1d4ed8;
}
</style> 