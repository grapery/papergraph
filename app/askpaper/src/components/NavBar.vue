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
        <img :src="user.avatar || defaultAvatar" class="avatar" alt="avatar" />
      </template>
      <template v-else>
        <button class="login-btn" @click="login">登录</button>
      </template>
    </div>
  </nav>
</template>

<script setup>
// 声明类型
import { ref, computed, onMounted } from 'vue'
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

// 模拟获取用户信息
onMounted(() => {
  // TODO: 替换为实际登录状态检测
  user.value = null // 未登录
  // user.value = { avatar: defaultAvatar } // 已登录
})

function login() {
  // TODO: 替换为实际登录逻辑
  alert('登录功能待接入')
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