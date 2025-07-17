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
import { ref, onMounted } from 'vue'
import TopTabs from '../components/TopTabs.vue'
import { getMe, googleLogin } from '../api/auth'
const user = ref(null)
onMounted(async () => {
  try { user.value = await getMe() } catch {}
})
function login() { googleLogin() }
</script> 