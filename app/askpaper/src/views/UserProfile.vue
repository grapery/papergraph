<template>
  <div class="user-profile-page">
    <TopTabs />
    
    <div class="profile-container">
      <!-- 用户信息卡片 -->
      <div class="user-card">
        <div class="user-info">
          <div class="user-avatar">{{ userInfo.name ? userInfo.name.charAt(0).toUpperCase() : 'U' }}</div>
          <div class="user-details">
            <h1 class="user-name">{{ userInfo.name }}</h1>
            <p class="user-email">{{ userInfo.email || userInfo.gmail }}</p>
            <div class="user-stats">
              <div class="stat-item">
                <span class="stat-number">{{ userStats.FollowerCount || 0 }}</span>
                <span class="stat-label">粉丝</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">{{ userStats.FollowingCount || 0 }}</span>
                <span class="stat-label">关注</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">{{ userStats.AnalysisCount || 0 }}</span>
                <span class="stat-label">分析</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">{{ userStats.LikeCount || 0 }}</span>
                <span class="stat-label">获赞</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 关注按钮 -->
        <div v-if="!isOwnProfile" class="follow-section">
          <button 
            class="follow-btn" 
            :class="{ 'following': isFollowing }"
            @click="toggleFollow"
          >
            {{ isFollowing ? '已关注' : '关注' }}
          </button>
        </div>
      </div>

      <!-- 奖章展示 -->
      <div class="badges-section">
        <h2 class="section-title">我的奖章</h2>
        <div v-if="badges.length === 0" class="empty-badges">
          暂无奖章，快去分析论文获得奖章吧！
        </div>
        <div v-else class="badges-grid">
          <div v-for="badge in badges" :key="badge.id" class="badge-item">
            <div class="badge-icon">{{ getBadgeIcon(badge.badge_type) }}</div>
            <div class="badge-info">
              <div class="badge-name">{{ badge.name }}</div>
              <div class="badge-desc">{{ badge.description }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Feed流切换标签 -->
      <div class="feed-tabs">
        <div 
          v-for="tab in feedTabs" 
          :key="tab.key"
          :class="['feed-tab', { active: activeFeedTab === tab.key }]"
          @click="activeFeedTab = tab.key"
        >
          {{ tab.label }}
        </div>
      </div>

      <!-- 活动Feed流 -->
      <div v-if="activeFeedTab === 'activity'" class="feed-section">
        <div v-if="activities.length === 0" class="empty-feed">
          暂无活动记录
        </div>
        <div v-else class="activity-list">
          <div v-for="activity in activities" :key="activity.id" class="activity-item">
            <div class="activity-icon">{{ getActivityIcon(activity.activity_type) }}</div>
            <div class="activity-content">
              <div class="activity-text">{{ activity.content }}</div>
              <div class="activity-time">{{ formatTime(activity.created_at) }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 分析Feed流 -->
      <div v-if="activeFeedTab === 'analysis'" class="feed-section">
        <div v-if="analyses.length === 0" class="empty-feed">
          暂无分析记录
        </div>
        <div v-else class="analysis-list">
          <div v-for="analysis in analyses" :key="analysis.id" class="analysis-item">
            <div class="analysis-header">
              <h3 class="analysis-title">{{ analysis.paper?.file_name || '论文分析' }}</h3>
              <div class="analysis-status">{{ analysis.status }}</div>
            </div>
            <div class="analysis-summary">
              {{ analysis.analysis_result?.content?.substring(0, 150) || '分析内容加载中...' }}
              {{ analysis.analysis_result?.content?.length > 150 ? '...' : '' }}
            </div>
            <div class="analysis-meta">
              <span class="analysis-time">{{ formatTime(analysis.created_at) }}</span>
              <span class="analysis-likes">❤️ {{ analysis.like_count || 0 }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import TopTabs from '../components/TopTabs.vue'
import { 
  getUserInfo, 
  getUserStats, 
  getUserBadges, 
  getUserActivities, 
  getUserAnalyses,
  followUser,
  unfollowUser,
  checkFollowStatus
} from '../api/badge'

const route = useRoute()

// 用户信息
const userInfo = ref({})
const userStats = ref({})
const badges = ref([])
const activities = ref([])
const analyses = ref([])
const isFollowing = ref(false)
const isOwnProfile = computed(() => {
  const currentUserId = getCurrentUserId()
  return currentUserId && currentUserId === parseInt(route.params.user_id)
})

// Feed流标签
const activeFeedTab = ref('activity')
const feedTabs = [
  { key: 'activity', label: '活动动态' },
  { key: 'analysis', label: '分析作品' }
]

// 页面加载时获取数据
onMounted(async () => {
  await loadUserData()
  await loadUserStats()
  await loadUserBadges()
  await loadFeeds()
  
  if (!isOwnProfile.value) {
    await checkFollowStatus()
  }
})

// 获取当前用户ID
function getCurrentUserId() {
  const mockUser = localStorage.getItem('mock_user')
  if (mockUser) {
    try {
      const user = JSON.parse(mockUser)
      return user.id
    } catch (error) {
      console.error('解析用户数据失败:', error)
    }
  }
  return null
}

// 加载用户基本信息
async function loadUserData() {
  try {
    const userId = parseInt(route.params.user_id)
    const response = await getUserInfo(userId)
    userInfo.value = response.data
  } catch (error) {
    console.error('加载用户信息失败:', error)
  }
}

// 加载用户统计
async function loadUserStats() {
  try {
    const userId = parseInt(route.params.user_id)
    const response = await getUserStats(userId)
    userStats.value = response.data
  } catch (error) {
    console.error('加载用户统计失败:', error)
  }
}

// 加载用户奖章
async function loadUserBadges() {
  try {
    const userId = parseInt(route.params.user_id)
    const response = await getUserBadges(userId)
    badges.value = response.data
  } catch (error) {
    console.error('加载用户奖章失败:', error)
  }
}

// 加载活动Feed流
async function loadActivities() {
  try {
    const userId = parseInt(route.params.user_id)
    const response = await getUserActivities(userId)
    activities.value = response.data
  } catch (error) {
    console.error('加载活动Feed流失败:', error)
  }
}

// 加载分析Feed流
async function loadAnalyses() {
  try {
    const userId = parseInt(route.params.user_id)
    const response = await getUserAnalyses(userId)
    analyses.value = response.data
  } catch (error) {
    console.error('加载分析Feed流失败:', error)
  }
}

// 加载Feed流数据
async function loadFeeds() {
  await Promise.all([
    loadActivities(),
    loadAnalyses()
  ])
}

// 检查关注状态
async function checkFollowStatus() {
  try {
    const userId = parseInt(route.params.user_id)
    const response = await checkFollowStatus(userId)
    isFollowing.value = response.data.is_following
  } catch (error) {
    console.error('检查关注状态失败:', error)
  }
}

// 切换关注状态
async function toggleFollow() {
  try {
    const userId = parseInt(route.params.user_id)
    if (isFollowing.value) {
      await unfollowUser(userId)
      isFollowing.value = false
      // 更新粉丝数
      if (userStats.value.FollowerCount > 0) {
        userStats.value.FollowerCount--
      }
    } else {
      await followUser(userId)
      isFollowing.value = true
      // 更新粉丝数
      userStats.value.FollowerCount++
    }
  } catch (error) {
    console.error('关注操作失败:', error)
  }
}

// 获取活动图标
function getActivityIcon(type) {
  const icons = {
    analysis: '📊',
    like: '❤️',
    comment: '💬',
    share: '📤',
    follow: '👥',
    badge: '🏆'
  }
  return icons[type] || '📝'
}

// 获取奖章图标
function getBadgeIcon(type) {
  const icons = {
    first_analysis: '🎯',
    analysis_explorer: '🔍',
    analysis_master: '👑',
    knowledge_sharer: '📚',
    popular_analyst: '⭐',
    active_commentator: '💭',
    rising_star: '🌟',
    social_butterfly: '🦋',
    generous_sharer: '🎁'
  }
  return icons[type] || '🏆'
}

// 格式化时间
function formatTime(timeStr) {
  const date = new Date(timeStr)
  const now = new Date()
  const diffMs = now - date
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)
  
  if (diffDays > 0) {
    return `${diffDays}天前`
  } else if (diffHours > 0) {
    return `${diffHours}小时前`
  } else {
    return '刚刚'
  }
}
</script>

<style scoped>
.user-profile-page {
  min-height: 100vh;
  background: #f8fafc;
}

.profile-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
}

.user-card {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  margin-bottom: 32px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 24px;
}

.user-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
  color: white;
}

.user-details h1 {
  font-size: 1.8rem;
  font-weight: bold;
  color: #1e293b;
  margin-bottom: 4px;
}

.user-email {
  color: #64748b;
  margin-bottom: 16px;
}

.user-stats {
  display: flex;
  gap: 32px;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 1.5rem;
  font-weight: bold;
  color: #1e293b;
}

.stat-label {
  font-size: 0.9rem;
  color: #64748b;
}

.follow-section {
  text-align: center;
}

.follow-btn {
  padding: 12px 32px;
  border: 2px solid #3b82f6;
  border-radius: 8px;
  background: white;
  color: #3b82f6;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.follow-btn:hover {
  background: #3b82f6;
  color: white;
}

.follow-btn.following {
  background: #3b82f6;
  color: white;
}

.badges-section {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  margin-bottom: 32px;
}

.section-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 20px;
}

.empty-badges {
  text-align: center;
  color: #64748b;
  padding: 40px 0;
}

.badges-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
}

.badge-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  transition: border-color 0.2s;
}

.badge-item:hover {
  border-color: #3b82f6;
}

.badge-icon {
  font-size: 2rem;
}

.badge-name {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 2px;
}

.badge-desc {
  font-size: 0.9rem;
  color: #64748b;
}

.feed-tabs {
  display: flex;
  gap: 32px;
  margin-bottom: 24px;
  border-bottom: 2px solid #e2e8f0;
}

.feed-tab {
  padding: 12px 0;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  transition: color 0.2s, border-color 0.2s;
}

.feed-tab.active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
}

.feed-section {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.empty-feed {
  text-align: center;
  color: #64748b;
  padding: 60px 0;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border: 1px solid #f1f5f9;
  border-radius: 8px;
  transition: border-color 0.2s;
}

.activity-item:hover {
  border-color: #e2e8f0;
}

.activity-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.activity-content {
  flex: 1;
}

.activity-text {
  color: #1e293b;
  margin-bottom: 4px;
}

.activity-time {
  font-size: 0.8rem;
  color: #94a3b8;
}

.analysis-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.analysis-item {
  padding: 20px;
  border: 1px solid #f1f5f9;
  border-radius: 12px;
  transition: border-color 0.2s;
}

.analysis-item:hover {
  border-color: #e2e8f0;
}

.analysis-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.analysis-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
  flex: 1;
}

.analysis-status {
  padding: 4px 12px;
  background: #dcfce7;
  color: #166534;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.analysis-summary {
  color: #475569;
  line-height: 1.6;
  margin-bottom: 12px;
}

.analysis-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  color: #64748b;
}

@media (max-width: 768px) {
  .profile-container {
    padding: 20px 16px;
  }
  
  .user-info {
    flex-direction: column;
    text-align: center;
  }
  
  .user-stats {
    justify-content: center;
  }
  
  .badges-grid {
    grid-template-columns: 1fr;
  }
  
  .feed-tabs {
    gap: 16px;
  }
}
</style>