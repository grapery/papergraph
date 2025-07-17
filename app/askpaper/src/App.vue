<script setup>
// 引入全局导航栏组件
import NavBar from './components/NavBar.vue'
</script>

<template>
  <!-- 全局导航栏 -->
  <NavBar />
  <!-- 路由页面内容 -->
  <router-view />
</template>

<style scoped>
/* 保持原有样式 */
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
