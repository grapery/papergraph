import { createRouter, createWebHistory } from 'vue-router'
import PublicFeed from '../views/PublicFeed.vue'
import UploadAnalysis from '../views/UploadAnalysis.vue'
import History from '../views/History.vue'
import ActiveTasks from '../views/ActiveTasks.vue'
import Account from '../views/Account.vue'
import MyAnalyses from '../views/MyAnalyses.vue'
import MyAnalysesTask from '../views/MyAnalysesTask.vue'

const routes = [
  { path: '/', redirect: '/feed' },
  { path: '/feed', component: PublicFeed },
  { path: '/upload', component: UploadAnalysis },
  { path: '/history', component: History },
  { path: '/active', component: ActiveTasks },
  { path: '/account', component: Account },
  { path: '/my-analyses', component: MyAnalyses },
  { path: '/my-analyses-task', component: MyAnalysesTask }
]

export default createRouter({
  history: createWebHistory(),
  routes
}) 