<template>
  <nav class="navbar">
    <!-- Logo and Navigation -->
    <div class="navbar-left">
      <div class="logo-container" @click="go('/feed')">
        <div class="logo">
          <span class="logo-text">Papergraph</span>
        </div>
      </div>
      
      <!-- Desktop Navigation -->
      <nav class="nav-menu" v-if="!isMobile">
        <router-link 
          v-for="item in navigationItems" 
          :key="item.path"
          :to="item.path"
          class="nav-item"
          :class="{ active: isActive(item.path) }"
        >
          <span class="nav-text">{{ item.name }}</span>
          <div class="nav-indicator"></div>
        </router-link>
      </nav>
    </div>

    <!-- Center Search -->
    <div class="navbar-center">
      <div class="search-container">
        <div class="search-wrapper">
          <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input 
            class="search-input" 
            type="text" 
            placeholder="Search papers, analysis..." 
            v-model="search"
            @keyup.enter="handleSearch"
          />
        </div>
      </div>
    </div>

    <!-- Right side actions -->
    <div class="navbar-right">
      <!-- User area -->
      <div v-if="user" class="user-area">
        <div class="user-menu" @click="toggleUserMenu">
          <div class="avatar-container">
            <img 
              :src="user.avatar || defaultAvatar" 
              class="user-avatar" 
              alt="User avatar"
            />
            <div class="avatar-indicator"></div>
          </div>
          <span class="user-name">{{ user.name || user.gmail || 'User' }}</span>
          <svg class="dropdown-icon" width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        
        <!-- User Dropdown -->
        <div v-if="showUserMenu" class="user-dropdown">
          <div class="dropdown-header">
            <div class="dropdown-user-info">
              <div class="dropdown-avatar">
                <img :src="user.avatar || defaultAvatar" alt="User avatar" />
              </div>
              <div class="dropdown-user-details">
                <div class="dropdown-user-name">{{ user.name || user.gmail || 'User' }}</div>
                <div class="dropdown-user-email">{{ user.gmail || 'user@example.com' }}</div>
              </div>
            </div>
          </div>
          <div class="dropdown-menu-items">
            <router-link to="/profile" class="dropdown-item" @click="closeUserMenu">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              Profile
            </router-link>
            <router-link to="/settings" class="dropdown-item" @click="closeUserMenu">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M12 1v6m0 6v6m-9-9h6m6 0h6"></path>
              </svg>
              Settings
            </router-link>
            <div class="dropdown-divider"></div>
            <button class="dropdown-item dropdown-item-danger" @click="logout">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              Sign out
            </button>
          </div>
        </div>
      </div>

      <!-- Login button -->
      <button v-else class="login-btn" @click="login">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
          <polyline points="10 17 15 12 10 7"></polyline>
          <line x1="15" y1="12" x2="3" y2="12"></line>
        </svg>
        Sign in with Google
      </button>

      <!-- Mobile menu button -->
      <button class="mobile-menu-btn" @click="toggleMobileMenu" v-if="isMobile">
        <div class="hamburger" :class="{ active: showMobileMenu }">
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
        </div>
      </button>
    </div>
  </nav>

  <!-- Mobile menu overlay -->
  <div v-if="showMobileMenu && isMobile" class="mobile-menu-overlay" @click="closeMobileMenu">
    <div class="mobile-menu" @click.stop>
      <div class="mobile-menu-header">
        <div class="mobile-logo">
          <span class="logo-text">Papergraph</span>
        </div>
        <button class="close-menu-btn" @click="closeMobileMenu">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      
      <div class="mobile-search">
        <div class="search-wrapper">
          <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input 
            class="search-input" 
            type="text" 
            placeholder="Search papers, analysis..." 
            v-model="search"
            @keyup.enter="handleSearch"
          />
        </div>
      </div>

      <nav class="mobile-nav-menu">
        <router-link 
          v-for="item in navigationItems" 
          :key="item.path"
          :to="item.path"
          class="mobile-nav-item"
          :class="{ active: isActive(item.path) }"
          @click="closeMobileMenu"
        >
          <span class="mobile-nav-text">{{ item.name }}</span>
          <svg class="mobile-nav-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </router-link>
      </nav>

      <div class="mobile-menu-footer">
        <div v-if="user" class="mobile-user-info">
          <div class="mobile-user-avatar">
            <img :src="user.avatar || defaultAvatar" alt="User avatar" />
          </div>
          <div class="mobile-user-details">
            <div class="mobile-user-name">{{ user.name || user.gmail || 'User' }}</div>
            <div class="mobile-user-email">{{ user.gmail || 'user@example.com' }}</div>
          </div>
        </div>
        <button v-if="user" class="mobile-logout-btn" @click="logout">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          Sign out
        </button>
        <button v-else class="mobile-login-btn" @click="login">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
            <polyline points="10 17 15 12 10 7"></polyline>
            <line x1="15" y1="12" x2="3" y2="12"></line>
          </svg>
          Sign in with Google
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// Navigation items
const navigationItems = [
  { name: 'Public Feed', path: '/feed' },
  { name: 'My Analyses', path: '/my-analyses' },
  { name: 'Analysis Tasks', path: '/my-analyses-task' },
  { name: 'Paper Evaluation', path: '/evaluation' },
  { name: 'Evaluation Mgmt', path: '/evaluation-management' },
  { name: 'Statistics', path: '/evaluation-statistics' }
]

// Search functionality
const search = ref('')

// User state
const user = ref(null)
const defaultAvatar = 'https://api.dicebear.com/7.x/miniavs/svg?seed=1'

// Menu states
const showUserMenu = ref(false)
const isMobile = ref(false)
const showMobileMenu = ref(false)

// Touch gesture support
const touchStartX = ref(0)
const touchStartY = ref(0)
const touchEndX = ref(0)
const touchEndY = ref(0)

// Check if path is active
const isActive = (path) => {
  return route.path.startsWith(path)
}

// Handle search
const handleSearch = () => {
  if (search.value.trim()) {
    // Implement search functionality
    console.log('Searching for:', search.value)
    // router.push(`/search?q=${encodeURIComponent(search.value)}`)
  }
}

// Close user menu
const closeUserMenu = () => {
  showUserMenu.value = false
}

// Toggle user menu
const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

// Toggle mobile menu
const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
}

// Close mobile menu
const closeMobileMenu = () => {
  showMobileMenu.value = false
}

// Check login status
const checkLoginStatus = () => {
  const token = localStorage.getItem('auth_token')
  const mockUser = localStorage.getItem('mock_user')
  
  if (token && mockUser) {
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

// Handle login callback
const handleLoginCallback = () => {
  const urlParams = new URLSearchParams(window.location.search)
  const token = urlParams.get('token')
  const loginSuccess = urlParams.get('login_success')
  const error = urlParams.get('error')
  
  if (error) {
    alert(`登录失败: ${error}`)
    const newUrl = window.location.pathname
    window.history.replaceState({}, document.title, newUrl)
    return
  }
  
  if (token && loginSuccess === 'true') {
    localStorage.setItem('auth_token', token)
    user.value = { avatar: defaultAvatar }
    
    const newUrl = window.location.pathname
    window.history.replaceState({}, document.title, newUrl)
    
    alert('登录成功！')
  }
}

// Handle click outside
const handleClickOutside = (event) => {
  const userMenu = document.querySelector('.user-area')
  if (userMenu && !userMenu.contains(event.target)) {
    showUserMenu.value = false
  }
}

// Handle touch start
const handleTouchStart = (event) => {
  if (!isMobile.value) return
  touchStartX.value = event.touches[0].clientX
  touchStartY.value = event.touches[0].clientY
}

// Handle touch end
const handleTouchEnd = (event) => {
  if (!isMobile.value) return
  touchEndX.value = event.changedTouches[0].clientX
  touchEndY.value = event.changedTouches[0].clientY
  handleSwipeGesture()
}

// Handle swipe gesture
const handleSwipeGesture = () => {
  const deltaX = touchEndX.value - touchStartX.value
  const deltaY = touchEndY.value - touchStartY.value
  const minSwipeDistance = 50
  const maxVerticalDistance = 100
  
  if (Math.abs(deltaX) > minSwipeDistance && Math.abs(deltaY) < maxVerticalDistance) {
    if (deltaX > 0) {
      if (!showMobileMenu.value) {
        showMobileMenu.value = true
      }
    } else {
      if (showMobileMenu.value) {
        closeMobileMenu()
      }
    }
  }
}

// Check screen size
const checkScreenSize = () => {
  isMobile.value = window.innerWidth <= 768
}

// Login functionality
const login = () => {
  simulateLogin()
}

// Simulate login
const simulateLogin = () => {
  const mockUser = {
    id: 1,
    name: 'Test User',
    gmail: 'test@example.com',
    avatar: defaultAvatar
  }
  
  const mockToken = 'mock_token_' + Date.now()
  
  localStorage.setItem('auth_token', mockToken)
  localStorage.setItem('mock_user', JSON.stringify(mockUser))
  
  user.value = mockUser
  
  alert('模拟登录成功！')
}

// Logout functionality
const logout = () => {
  localStorage.removeItem('auth_token')
  localStorage.removeItem('mock_user')
  user.value = null
  showUserMenu.value = false
  showMobileMenu.value = false
  router.push('/feed')
}

// Navigation
const go = (path) => {
  router.push(path)
}

// Lifecycle hooks
onMounted(() => {
  checkLoginStatus()
  handleLoginCallback()
  checkScreenSize()
  
  window.addEventListener('resize', checkScreenSize)
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('touchstart', handleTouchStart, { passive: true })
  document.addEventListener('touchend', handleTouchEnd, { passive: true })
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('resize', checkScreenSize)
  document.removeEventListener('touchstart', handleTouchStart)
  document.removeEventListener('touchend', handleTouchEnd)
})

</script>

<style scoped>
/* Modern navbar styling */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--spacing-xl);
  min-height: 64px;
  background: var(--background-primary);
  border-bottom: 1px solid var(--border-primary);
  backdrop-filter: blur(12px);
  z-index: var(--z-fixed);
  transition: all var(--transition-normal);
}

.navbar:hover {
  border-bottom-color: var(--border-secondary);
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-xl);
}

/* Logo styling */
.logo-container {
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all var(--transition-normal);
  padding: var(--spacing-sm);
  border-radius: var(--radius-md);
}

.logo-container:hover {
  background: var(--background-secondary);
  transform: translateY(-1px);
}

.logo {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.logo-text {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--brand-primary);
  letter-spacing: var(--letter-spacing-tight);
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Navigation menu */
.nav-menu {
  display: flex;
  gap: var(--spacing-md);
  align-items: center;
}

.nav-item {
  position: relative;
  padding: var(--spacing-sm) var(--spacing-md);
  color: var(--text-secondary);
  text-decoration: none;
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-sm);
  border-radius: var(--radius-md);
  transition: all var(--transition-normal);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.nav-item:hover {
  color: var(--text-primary);
  background: var(--background-secondary);
  transform: translateY(-1px);
}

.nav-item.active {
  color: var(--brand-primary);
  background: var(--background-secondary);
}

.nav-item.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 4px;
  background: var(--brand-primary);
  border-radius: var(--radius-full);
}

.nav-indicator {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--brand-primary);
  border-radius: var(--radius-full);
  transform: scaleX(0);
  transition: transform var(--transition-normal);
}

.nav-item.active .nav-indicator {
  transform: scaleX(1);
}

/* Search container */
.navbar-center {
  flex: 1;
  display: flex;
  justify-content: center;
  max-width: 400px;
  margin: 0 var(--spacing-xl);
}

.search-container {
  width: 100%;
  position: relative;
}

.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: var(--background-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-sm) var(--spacing-md);
  transition: all var(--transition-normal);
}

.search-wrapper:hover {
  border-color: var(--border-secondary);
  box-shadow: var(--shadow-sm);
}

.search-wrapper:focus-within {
  border-color: var(--border-focus);
  box-shadow: var(--focus-ring);
  background: var(--background-primary);
}

.search-icon {
  position: absolute;
  left: var(--spacing-md);
  color: var(--text-tertiary);
  z-index: 2;
  pointer-events: none;
  transition: color var(--transition-normal);
}

.search-wrapper:focus-within .search-icon {
  color: var(--brand-primary);
}

.search-input {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md) var(--spacing-sm) calc(var(--spacing-md) + var(--spacing-lg) + var(--spacing-sm));
  border: none;
  background: transparent;
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-normal);
  outline: none;
  transition: all var(--transition-normal);
}

.search-input::placeholder {
  color: var(--text-tertiary);
}

/* User area */
.navbar-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.user-area {
  position: relative;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-normal);
  border: 1px solid transparent;
}

.user-menu:hover {
  background: var(--background-secondary);
  border-color: var(--border-secondary);
  transform: translateY(-1px);
}

.avatar-container {
  position: relative;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  object-fit: cover;
  border: 2px solid var(--border-primary);
  transition: all var(--transition-normal);
}

.user-menu:hover .user-avatar {
  border-color: var(--brand-primary);
  box-shadow: var(--shadow-sm);
}

.avatar-indicator {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 8px;
  height: 8px;
  background: var(--success-600);
  border: 2px solid var(--background-primary);
  border-radius: var(--radius-full);
}

.user-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-icon {
  transition: transform var(--transition-normal);
  color: var(--text-tertiary);
}

.user-menu:hover .dropdown-icon {
  transform: rotate(180deg);
  color: var(--text-primary);
}

/* User dropdown */
.user-dropdown {
  position: absolute;
  top: calc(100% + var(--spacing-sm));
  right: 0;
  min-width: 280px;
  background: var(--background-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  z-index: var(--z-dropdown);
  animation: dropdownSlide 0.3s ease-out;
  overflow: hidden;
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

.dropdown-header {
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--border-primary);
  background: var(--background-secondary);
}

.dropdown-user-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.dropdown-avatar {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
  overflow: hidden;
  border: 2px solid var(--border-primary);
}

.dropdown-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.dropdown-user-details {
  flex: 1;
}

.dropdown-user-name {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.dropdown-user-email {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
}

.dropdown-menu-items {
  padding: var(--spacing-sm) 0;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  color: var(--text-primary);
  text-decoration: none;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-normal);
  transition: all var(--transition-normal);
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
}

.dropdown-item:hover {
  background: var(--background-secondary);
  color: var(--brand-primary);
  transform: translateX(2px);
}

.dropdown-item svg {
  width: 16px;
  height: 16px;
  color: var(--text-tertiary);
  transition: color var(--transition-normal);
}

.dropdown-item:hover svg {
  color: var(--brand-primary);
}

.dropdown-item-danger {
  color: var(--error-600);
}

.dropdown-item-danger:hover {
  background: var(--error-50);
  color: var(--error-700);
}

.dropdown-item-danger:hover svg {
  color: var(--error-600);
}

.dropdown-divider {
  height: 1px;
  background: var(--border-primary);
  margin: var(--spacing-sm) 0;
}

/* Login button */
.login-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-lg);
  background: var(--brand-primary);
  color: var(--text-inverse);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-normal);
  box-shadow: var(--shadow-sm);
}

.login-btn:hover {
  background: var(--brand-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.login-btn:active {
  transform: translateY(0);
  box-shadow: var(--shadow-sm);
}

.login-btn svg {
  width: 16px;
  height: 16px;
}

/* Mobile menu button */
.mobile-menu-btn {
  display: none;
  background: none;
  border: none;
  padding: var(--spacing-sm);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-normal);
  color: var(--text-primary);
}

.mobile-menu-btn:hover {
  background: var(--background-secondary);
}

.hamburger {
  display: flex;
  flex-direction: column;
  gap: 2px;
  width: 20px;
  height: 16px;
  justify-content: center;
}

.hamburger-line {
  width: 100%;
  height: 2px;
  background: var(--text-primary);
  border-radius: 1px;
  transition: all var(--transition-normal);
}

.hamburger.active .hamburger-line:nth-child(1) {
  transform: rotate(45deg) translate(5px, 5px);
}

.hamburger.active .hamburger-line:nth-child(2) {
  opacity: 0;
}

.hamburger.active .hamburger-line:nth-child(3) {
  transform: rotate(-45deg) translate(7px, -6px);
}

/* Mobile menu overlay */
.mobile-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: var(--z-modal);
  backdrop-filter: blur(4px);
  animation: fadeIn 0.2s ease-out;
}

.mobile-menu {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 320px;
  background: var(--background-primary);
  box-shadow: var(--shadow-2xl);
  z-index: var(--z-modal);
  animation: slideInLeft 0.3s ease-out;
  display: flex;
  flex-direction: column;
}

.mobile-menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--border-primary);
  background: var(--background-secondary);
}

.mobile-logo {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--brand-primary);
}

.close-menu-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  border: none;
  background: none;
  color: var(--text-tertiary);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.close-menu-btn:hover {
  background: var(--background-tertiary);
  color: var(--text-primary);
}

/* Mobile search */
.mobile-search {
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--border-primary);
}

.mobile-search .search-wrapper {
  background: var(--background-secondary);
}

/* Mobile navigation */
.mobile-nav-menu {
  flex: 1;
  padding: var(--spacing-md) 0;
  overflow-y: auto;
}

.mobile-nav-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-lg);
  color: var(--text-primary);
  text-decoration: none;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-normal);
  transition: all var(--transition-normal);
  border-left: 3px solid transparent;
}

.mobile-nav-item:hover {
  background: var(--background-secondary);
  color: var(--brand-primary);
  border-left-color: var(--brand-primary);
  transform: translateX(4px);
}

.mobile-nav-item.active {
  background: var(--background-secondary);
  color: var(--brand-primary);
  border-left-color: var(--brand-primary);
  font-weight: var(--font-weight-medium);
}

.mobile-nav-text {
  flex: 1;
}

.mobile-nav-arrow {
  color: var(--text-tertiary);
  transition: all var(--transition-normal);
}

.mobile-nav-item:hover .mobile-nav-arrow {
  color: var(--brand-primary);
  transform: translateX(4px);
}

/* Mobile menu footer */
.mobile-menu-footer {
  padding: var(--spacing-lg);
  border-top: 1px solid var(--border-primary);
  background: var(--background-secondary);
}

.mobile-user-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.mobile-user-avatar {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
  overflow: hidden;
  border: 2px solid var(--border-primary);
}

.mobile-user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.mobile-user-details {
  flex: 1;
}

.mobile-user-name {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.mobile-user-email {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
}

.mobile-logout-btn,
.mobile-login-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background: var(--brand-primary);
  color: var(--text-inverse);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.mobile-logout-btn:hover,
.mobile-login-btn:hover {
  background: var(--brand-hover);
  transform: translateY(-1px);
}

.mobile-logout-btn svg,
.mobile-login-btn svg {
  width: 16px;
  height: 16px;
}

/* Responsive design */
@media (max-width: 768px) {
  .navbar {
    padding: 0 var(--spacing-lg);
    min-height: 56px;
  }
  
  .navbar-left {
    gap: var(--spacing-lg);
  }
  
  .logo-text {
    font-size: var(--font-size-lg);
  }
  
  .nav-menu {
    display: none;
  }
  
  .navbar-center {
    display: none;
  }
  
  .user-name {
    display: none;
  }
  
  .mobile-menu-btn {
    display: block;
  }
  
  .user-menu {
    padding: var(--spacing-xs);
  }
  
  .user-avatar {
    width: 28px;
    height: 28px;
  }
  
  .avatar-indicator {
    width: 6px;
    height: 6px;
  }
}

@media (max-width: 480px) {
  .navbar {
    padding: 0 var(--spacing-md);
  }
  
  .navbar-left {
    gap: var(--spacing-md);
  }
  
  .logo-text {
    font-size: var(--font-size-base);
  }
  
  .mobile-menu {
    width: 280px;
  }
  
  .mobile-menu-header,
  .mobile-search,
  .mobile-menu-footer {
    padding: var(--spacing-md);
  }
  
  .mobile-nav-item {
    padding: var(--spacing-md);
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .navbar {
    background: rgba(26, 26, 26, 0.8);
    border-bottom-color: var(--border-primary);
  }
  
  .user-dropdown {
    background: var(--background-primary);
    border-color: var(--border-primary);
  }
  
  .dropdown-header {
    background: var(--background-secondary);
    border-color: var(--border-primary);
  }
  
  .mobile-menu {
    background: var(--background-primary);
  }
  
  .mobile-menu-header {
    background: var(--background-secondary);
    border-color: var(--border-primary);
  }
  
  .mobile-menu-footer {
    background: var(--background-secondary);
    border-color: var(--border-primary);
  }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .navbar,
  .nav-item,
  .user-menu,
  .search-wrapper,
  .login-btn,
  .mobile-menu-btn,
  .hamburger-line,
  .mobile-nav-item,
  .mobile-logout-btn,
  .mobile-login-btn {
    transition: none;
  }
  
  .user-dropdown,
  .mobile-menu-overlay,
  .mobile-menu {
    animation: none;
  }
}
</style> 