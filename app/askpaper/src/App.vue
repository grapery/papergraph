<script setup>
// 引入全局导航栏组件
import NavBar from './components/NavBar.vue'
</script>

<template>
  <!-- 全局导航栏 -->
  <NavBar />
  <!-- 路由页面内容 -->
  <main class="main-content">
    <router-view />
  </main>
</template>

<style scoped>
.main-content {
  min-height: calc(100vh - 70px);
  padding-top: 70px;
}
</style>
