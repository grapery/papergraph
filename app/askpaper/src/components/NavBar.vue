<template>
  <nav class="navbar">
    <!-- Logo 区域 -->
    <div class="navbar-left">
      <span class="logo">ScholarLens</span>
      <ul class="nav-menu">
        <li :class="{active: activeMenu==='feed'}" @click="go('/feed')">Public Feed</li>
        <li :class="{active: activeMenu==='myanalyses'}" @click="go('/my-analyses')">My Analyses</li>
        <li :class="{active: activeMenu==='myanalysestask'}" @click="go('/my-analyses-task')">My Analyses Task</li>
        <li :class="{active: activeMenu==='evaluation'}" @click="go('/evaluation')">Paper Evaluation</li>
        <li :class="{active: activeMenu==='evaluationmanagement'}" @click="go('/evaluation-management')">Evaluation Management</li>
        <li :class="{active: activeMenu==='evaluationstatistics'}" @click="go('/evaluation-statistics')">Evaluation Statistics</li>
      </ul>
    </div>
    <!-- 搜索框 -->
    <div class="navbar-center">
      <div class="search-wrapper">
        <span class="search-icon">🔍</span>
        <input class="search-input" type="text" placeholder="Search" v-model="search" />
      </div>
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
      <!-- 移动端菜单按钮 -->
      <button class="mobile-menu-btn" @click="toggleMobileMenu" v-if="isMobile">
        <span class="menu-icon" :class="{active: showMobileMenu}">☰</span>
      </button>
    </div>
  </nav>
  
  <!-- 移动端侧边栏菜单 -->
  <div v-if="showMobileMenu && isMobile" class="mobile-menu-overlay" @click="closeMobileMenu">
    <div class="mobile-menu" @click.stop>
      <div class="mobile-menu-header">
        <span class="mobile-logo">ScholarLens</span>
        <button class="close-menu-btn" @click="closeMobileMenu">✕</button>
      </div>
      <ul class="mobile-nav-menu">
        <li :class="{active: activeMenu==='feed'}" @click="go('/feed'); closeMobileMenu()">Public Feed</li>
        <li :class="{active: activeMenu==='myanalyses'}" @click="go('/my-analyses'); closeMobileMenu()">My Analyses</li>
        <li :class="{active: activeMenu==='myanalysestask'}" @click="go('/my-analyses-task'); closeMobileMenu()">My Analyses Task</li>
        <li :class="{active: activeMenu==='evaluation'}" @click="go('/evaluation'); closeMobileMenu()">Paper Evaluation</li>
        <li :class="{active: activeMenu==='evaluationmanagement'}" @click="go('/evaluation-management'); closeMobileMenu()">Evaluation Management</li>
        <li :class="{active: activeMenu==='evaluationstatistics'}" @click="go('/evaluation-statistics'); closeMobileMenu()">Evaluation Statistics</li>
      </ul>
    </div>
  </div>
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
  if (route.path.startsWith('/evaluation-statistics')) return 'evaluationstatistics'
  if (route.path.startsWith('/evaluation-management')) return 'evaluationmanagement'
  if (route.path.startsWith('/evaluation')) return 'evaluation'
  return ''
})

// 搜索框内容
const search = ref('')

// 用户信息（可根据实际登录逻辑替换）
const user = ref(null)
const defaultAvatar = 'https://api.dicebear.com/7.x/miniavs/svg?seed=1'

// 用户菜单状态
const showUserMenu = ref(false)

// 移动端菜单状态
const isMobile = ref(false)
const showMobileMenu = ref(false)
const touchStartX = ref(0)
const touchStartY = ref(0)
const touchEndX = ref(0)
const touchEndY = ref(0)

// 模拟获取用户信息
onMounted(() => {
  // 检查是否已登录
  checkLoginStatus()
  // 检查 URL 参数中是否有登录成功的 token
  handleLoginCallback()
  
  // 检查屏幕尺寸
  checkScreenSize()
  
  // 监听屏幕尺寸变化
  window.addEventListener('resize', checkScreenSize)
  
  // 点击外部关闭用户菜单
  document.addEventListener('click', handleClickOutside)
  
  // 添加触摸手势支持
  document.addEventListener('touchstart', handleTouchStart, { passive: true })
  document.addEventListener('touchend', handleTouchEnd, { passive: true })
})

// 组件卸载时移除事件监听
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('resize', checkScreenSize)
  document.removeEventListener('touchstart', handleTouchStart)
  document.removeEventListener('touchend', handleTouchEnd)
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
  localStorage.removeItem('mock_user') // 清除模拟用户数据
  user.value = null
  showUserMenu.value = false // 关闭用户菜单
  // 可选：跳转到首页
  router.push('/feed')
}

function login() {
  // 开发测试：使用模拟登录
  simulateLogin()
  
  // 生产环境：Google OAuth2 登录（已注释）
  /*
  const googleAuthUrl = buildGoogleAuthUrl()
  window.location.href = googleAuthUrl
  */
}

/**
 * 模拟登录功能（开发测试用）
 */
function simulateLogin() {
  // 模拟用户数据
  const mockUser = {
    id: 1,
    name: '测试用户',
    gmail: 'test@example.com',
    avatar: defaultAvatar
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

/**
 * 检查登录状态
 */
function checkLoginStatus() {
  const token = localStorage.getItem('auth_token')
  const mockUser = localStorage.getItem('mock_user')
  
  if (token && mockUser) {
    // 使用模拟用户数据
    try {
      user.value = JSON.parse(mockUser)
    } catch (e) {
      console.error('解析模拟用户数据失败:', e)
      user.value = { avatar: defaultAvatar }
    }
  } else {
    user.value = null
  }
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
/**
 * 检查屏幕尺寸
 */
function checkScreenSize() {
  isMobile.value = window.innerWidth <= 768
}

/**
 * 切换移动端菜单
 */
function toggleMobileMenu() {
  showMobileMenu.value = !showMobileMenu.value
}

/**
 * 关闭移动端菜单
 */
function closeMobileMenu() {
  showMobileMenu.value = false
}

/**
 * 处理触摸开始事件
 */
function handleTouchStart(event) {
  if (!isMobile.value) return
  
  touchStartX.value = event.touches[0].clientX
  touchStartY.value = event.touches[0].clientY
}

/**
 * 处理触摸结束事件
 */
function handleTouchEnd(event) {
  if (!isMobile.value) return
  
  touchEndX.value = event.changedTouches[0].clientX
  touchEndY.value = event.changedTouches[0].clientY
  
  handleSwipeGesture()
}

/**
 * 处理滑动手势
 */
function handleSwipeGesture() {
  const deltaX = touchEndX.value - touchStartX.value
  const deltaY = touchEndY.value - touchStartY.value
  const minSwipeDistance = 50
  const maxVerticalDistance = 100
  
  // 检查是否为水平滑动
  if (Math.abs(deltaX) > minSwipeDistance && Math.abs(deltaY) < maxVerticalDistance) {
    if (deltaX > 0) {
      // 从左向右滑动 - 打开菜单
      if (!showMobileMenu.value) {
        showMobileMenu.value = true
      }
    } else {
      // 从右向左滑动 - 关闭菜单
      if (showMobileMenu.value) {
        closeMobileMenu()
      }
    }
  }
}

function go(path) {
  router.push(path)
}
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  min-height: 60px;
  background: var(--color-bg-default);
  border-bottom: 1px solid var(--color-border-default);
  z-index: 1000;
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.logo {
  font-weight: var(--font-weight-bold);
  font-size: 20px;
  color: var(--color-fg-default);
  text-decoration: none;
  transition: color var(--transition-normal);
  white-space: nowrap;
}

.logo:hover {
  color: var(--color-brand);
}

.nav-menu {
  display: flex;
  gap: 8px;
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-menu li {
  cursor: pointer;
  color: var(--color-fg-muted);
  font-size: 14px;
  font-weight: var(--font-weight-medium);
  padding: 8px 12px;
  border-radius: var(--border-radius-medium);
  transition: all var(--transition-normal);
  white-space: nowrap;
}

.nav-menu li:hover {
  color: var(--color-fg-default);
  background-color: var(--color-bg-subtle);
}

.nav-menu li.active {
  color: var(--color-fg-default);
  background-color: var(--color-bg-subtle);
}

.navbar-center {
  flex: 1;
  display: flex;
  justify-content: center;
  max-width: 400px;
  margin: 0 16px;
}

.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.search-icon {
  position: absolute;
  left: 8px;
  color: var(--color-fg-subtle);
  font-size: 14px;
  z-index: 2;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 5px 12px 5px 32px;
  border: 1px solid var(--color-border-default);
  border-radius: var(--border-radius-medium);
  font-size: 14px;
  background: var(--color-bg-subtle);
  color: var(--color-fg-default);
  transition: all var(--transition-normal);
}

.search-input:focus {
  outline: none;
  border-color: var(--color-brand);
  background: var(--color-bg-overlay);
  box-shadow: var(--shadow-focus);
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid var(--color-border-default);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.avatar:hover {
  border-color: var(--color-brand);
}

.user-menu {
  position: relative;
}

.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: var(--color-bg-overlay);
  border: 1px solid var(--color-border-default);
  border-radius: var(--border-radius-medium);
  box-shadow: var(--shadow-medium);
  min-width: 200px;
  z-index: 1001;
  animation: dropdownSlide 0.2s ease-out;
}

@keyframes dropdownSlide {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.user-info {
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border-muted);
  color: var(--color-fg-default);
  font-size: 14px;
  font-weight: var(--font-weight-medium);
}

.logout-btn {
  width: 100%;
  padding: 8px 16px;
  background: none;
  border: none;
  color: var(--color-danger-fg);
  cursor: pointer;
  font-size: 14px;
  font-weight: var(--font-weight-medium);
  text-align: left;
  transition: all var(--transition-normal);
  border-radius: 0 0 var(--border-radius-medium) var(--border-radius-medium);
}

.logout-btn:hover {
  background: var(--color-danger-bg);
  color: var(--color-danger-emphasis);
}

.login-btn {
  background: var(--color-btn-primary-bg);
  color: var(--color-fg-on-emphasis);
  border: 1px solid var(--color-btn-primary-border);
  border-radius: var(--border-radius-medium);
  padding: 5px 16px;
  font-size: 14px;
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.login-btn:hover {
  background: var(--color-btn-primary-hover-bg);
  border-color: var(--color-btn-primary-hover-border);
}

.login-btn:active {
  background: var(--color-btn-primary-active-bg);
  border-color: var(--color-btn-primary-active-border);
}

.mobile-menu-btn {
  display: none;
  background: none;
  border: none;
  color: #374151;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.mobile-menu-btn:hover {
  background: #f3f4f6;
}

.menu-icon {
  display: block;
  transition: transform 0.2s ease;
}

.menu-icon.active {
  transform: rotate(90deg);
}

.mobile-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  animation: fadeIn 0.2s ease-out;
}

.mobile-menu {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 280px;
  background: #fff;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  animation: slideInLeft 0.3s ease-out;
}

@keyframes slideInLeft {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}

.mobile-menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.mobile-logo {
  font-weight: 700;
  font-size: 1.25rem;
  color: #2563eb;
}

.close-menu-btn {
  background: none;
  border: none;
  color: #6b7280;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.close-menu-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.mobile-nav-menu {
  list-style: none;
  padding: 0;
  margin: 0;
}

.mobile-nav-menu li {
  padding: 1rem 1.5rem;
  cursor: pointer;
  color: #374151;
  font-size: 1rem;
  font-weight: 500;
  border-bottom: 1px solid #f3f4f6;
  transition: all 0.2s ease;
}

.mobile-nav-menu li:hover {
  background: #f9fafb;
  color: #2563eb;
}

.mobile-nav-menu li.active {
  background: #eff6ff;
  color: #2563eb;
  border-left: 3px solid #2563eb;
}

@media (max-width: 768px) {
  .navbar {
    padding: 1rem;
  }
  
  .navbar-left {
    gap: 1rem;
  }
  
  .logo {
    font-size: 1.25rem;
  }
  
  .nav-menu {
    gap: 1rem;
  }
  
  .nav-menu li {
    font-size: 0.875rem;
    padding: 0.25rem 0;
  }
  
  .navbar-center {
    margin: 0 1rem;
    max-width: 200px;
  }
  
  .search-input {
    font-size: 0.75rem;
    padding: 0.5rem 0.75rem;
  }
  
  .avatar {
    width: 32px;
    height: 32px;
  }
  
  .user-dropdown {
    min-width: 160px;
  }
}

@media (max-width: 480px) {
  .navbar-left {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }
  
  .nav-menu {
    display: none;
  }
  
  .mobile-menu-btn {
    display: block;
  }
  
  .navbar-center {
    order: 3;
    width: 100%;
    margin: 0.5rem 0 0 0;
    max-width: none;
  }
  
  .navbar-right {
    margin-left: auto;
  }
}
</style> 