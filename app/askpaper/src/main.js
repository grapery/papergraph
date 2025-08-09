import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'
// 全局样式（提供 CSS 变量与基础布局样式）
import './style.css'

axios.defaults.withCredentials = true // 支持cookie/session
const app = createApp(App)
app.use(router)
app.mount('#app')
