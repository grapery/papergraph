<template>
  <div class="user-profile-page">
    <TopTabs />
    
    <div class="profile-container">
      <!-- 用户信息卡片 -->
      <div class="user-card">
        <div class="user-info">
          <div class="user-avatar">
            <span class="avatar-text">{{ userInfo.name ? userInfo.name.charAt(0).toUpperCase() : 'U' }}</span>
            <div class="avatar-ring"></div>
          </div>
          <div class="user-details">
            <h1 class="user-name">{{ userInfo.name }}</h1>
            <p class="user-email">{{ userInfo.email || userInfo.gmail }}</p>
            <div class="user-stats">
              <div class="stat-item" @click="showFollowers" title="查看粉丝">
                <span class="stat-number">{{ userStats.FollowerCount || 0 }}</span>
                <span class="stat-label">粉丝</span>
              </div>
              <div class="stat-item" @click="showFollowing" title="查看关注">
                <span class="stat-number">{{ userStats.FollowingCount || 0 }}</span>
                <span class="stat-label">关注</span>
              </div>
              <div class="stat-item" @click="showAnalyses" title="查看分析">
                <span class="stat-number">{{ userStats.AnalysisCount || 0 }}</span>
                <span class="stat-label">分析</span>
              </div>
              <div class="stat-item" @click="showLikes" title="查看获赞">
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
            :class="{ 'following': isFollowing, 'loading': isFollowLoading }"
            @click="toggleFollow"
            :disabled="isFollowLoading"
          >
            <span v-if="isFollowLoading" class="btn-spinner"></span>
            <span v-else class="follow-btn-content">
              <span class="follow-icon">{{ isFollowing ? '✓' : '+' }}</span>
              <span>{{ isFollowing ? '已关注' : '关注' }}</span>
            </span>
          </button>
          <button 
            class="message-btn"
            @click="sendMessage"
            title="发送私信"
          >
            <span class="message-icon">✉️</span>
            <span>私信</span>
          </button>
        </div>
      </div>

      <!-- 奖章展示 -->
      <div class="badges-section">
        <h2 class="section-title">我的奖章</h2>
        <div v-if="badges.length === 0" class="empty-badges">
          <div class="empty-icon">🏆</div>
          <p>暂无奖章，快去分析论文获得奖章吧！</p>
        </div>
        <div v-else class="badges-grid">
          <div 
            v-for="badge in badges" 
            :key="badge.id" 
            class="badge-item"
            @click="showBadgeDetail(badge)"
            :title="badge.description"
          >
            <div class="badge-icon">{{ getBadgeIcon(badge.badge_type) }}</div>
            <div class="badge-info">
              <div class="badge-name">{{ badge.name }}</div>
              <div class="badge-desc">{{ badge.description }}</div>
              <div class="badge-meta">
                <div class="badge-time">获得于 {{ formatTime(badge.created_at) }}</div>
                <div class="badge-rarity" :class="getBadgeRarityClass(badge.rarity)">
                  {{ getBadgeRarityText(badge.rarity) }}
                </div>
              </div>
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
          @click="switchFeedTab(tab.key)"
        >
          <span class="tab-icon">{{ getTabIcon(tab.key) }}</span>
          <span class="tab-label">{{ tab.label }}</span>
          <span class="tab-count">{{ getTabCount(tab.key) }}</span>
        </div>
      </div>

      <!-- 活动Feed流 -->
      <transition name="fade-slide" mode="out-in">
        <div v-if="activeFeedTab === 'activity'" class="feed-section">
          <div v-if="activities.length === 0" class="empty-feed">
            <div class="empty-icon">📝</div>
            <p>暂无活动记录</p>
          </div>
          <div v-else class="activity-list">
            <div 
              v-for="activity in activities" 
              :key="activity.id" 
              class="activity-item"
              @click="showActivityDetail(activity)"
            >
              <div class="activity-icon">{{ getActivityIcon(activity.activity_type) }}</div>
              <div class="activity-content">
                <div class="activity-text">{{ activity.content }}</div>
                <div class="activity-time">{{ formatTime(activity.created_at) }}</div>
              </div>
            </div>
          </div>
        </div>
      </transition>

      <!-- 分析Feed流 -->
      <transition name="fade-slide" mode="out-in">
        <div v-if="activeFeedTab === 'analysis'" class="feed-section">
          <div v-if="analyses.length === 0" class="empty-feed">
            <div class="empty-icon">📊</div>
            <p>暂无分析记录</p>
          </div>
          <div v-else class="analysis-list">
            <div 
              v-for="analysis in analyses" 
              :key="analysis.id" 
              class="analysis-item"
              @click="viewAnalysis(analysis)"
            >
              <div class="analysis-header">
                <h3 class="analysis-title">{{ analysis.paper?.file_name || '论文分析' }}</h3>
                <div class="analysis-status" :class="getStatusClass(analysis.status)">
                  {{ getStatusText(analysis.status) }}
                </div>
              </div>
              <div class="analysis-summary">
                {{ analysis.analysis_result?.content?.substring(0, 150) || '分析内容加载中...' }}
                {{ analysis.analysis_result?.content?.length > 150 ? '...' : '' }}
              </div>
              <div class="analysis-meta">
                <span class="analysis-time">{{ formatTime(analysis.created_at) }}</span>
                <div class="analysis-actions">
                  <span class="analysis-likes" @click.stop="likeAnalysis(analysis)">
                    <span class="like-icon">❤️</span>
                    <span class="like-count">{{ analysis.like_count || 0 }}</span>
                  </span>
                  <span class="analysis-comments" @click.stop="viewComments(analysis)">
                    <span class="comment-icon">💬</span>
                    <span class="comment-count">{{ analysis.comment_count || 0 }}</span>
                  </span>
                  <span class="analysis-shares" @click.stop="shareAnalysis(analysis)">
                    <span class="share-icon">📤</span>
                    <span class="share-count">{{ analysis.share_count || 0 }}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition>

      <!-- 成就Feed流 -->
      <transition name="fade-slide" mode="out-in">
        <div v-if="activeFeedTab === 'achievements'" class="feed-section">
          <div v-if="badges.length === 0" class="empty-feed">
            <div class="empty-icon">🏆</div>
            <p>暂无成就记录</p>
          </div>
          <div v-else class="achievements-grid">
            <div 
              v-for="badge in badges" 
              :key="badge.id" 
              class="achievement-item"
              @click="showBadgeDetail(badge)"
            >
              <div class="achievement-icon">{{ getBadgeIcon(badge.badge_type) }}</div>
              <div class="achievement-content">
                <h4 class="achievement-title">{{ badge.name }}</h4>
                <p class="achievement-desc">{{ badge.description }}</p>
                <div class="achievement-meta">
                  <span class="achievement-time">{{ formatTime(badge.created_at) }}</span>
                  <span class="achievement-rarity" :class="getBadgeRarityClass(badge.rarity)">
                    {{ getBadgeRarityText(badge.rarity) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
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
const isFollowLoading = ref(false)
const isOwnProfile = computed(() => {
  const currentUserId = getCurrentUserId()
  return currentUserId && currentUserId === parseInt(route.params.user_id)
})

// Feed流标签
const activeFeedTab = ref('activity')
const feedTabs = [
  { key: 'activity', label: '活动动态' },
  { key: 'analysis', label: '分析作品' },
  { key: 'achievements', label: '成就成就' }
]

// 移动端手势支持
const touchStartX = ref(0)
const touchEndX = ref(0)
const isMobile = ref(false)

// 页面加载时获取数据
onMounted(async () => {
  await loadUserData()
  await loadUserStats()
  await loadUserBadges()
  await loadFeeds()
  
  // 检查是否为移动端
  checkScreenSize()
  window.addEventListener('resize', checkScreenSize)
  
  // 添加触摸手势支持
  document.addEventListener('touchstart', handleTouchStart, { passive: true })
  document.addEventListener('touchend', handleTouchEnd, { passive: true })
  
  if (!isOwnProfile.value) {
    await checkUserFollowStatus()
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

// 组件卸载时清理事件监听
onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize)
  document.removeEventListener('touchstart', handleTouchStart)
  document.removeEventListener('touchend', handleTouchEnd)
})

// 检查屏幕尺寸
function checkScreenSize() {
  isMobile.value = window.innerWidth <= 768
}

// 处理触摸开始事件
function handleTouchStart(event) {
  if (!isMobile.value) return
  touchStartX.value = event.touches[0].clientX
}

// 处理触摸结束事件
function handleTouchEnd(event) {
  if (!isMobile.value) return
  touchEndX.value = event.changedTouches[0].clientX
  handleSwipeGesture()
}

// 处理滑动手势
function handleSwipeGesture() {
  const deltaX = touchEndX.value - touchStartX.value
  const minSwipeDistance = 50
  
  if (Math.abs(deltaX) > minSwipeDistance) {
    const currentIndex = feedTabs.findIndex(tab => tab.key === activeFeedTab.value)
    let newIndex
    
    if (deltaX > 0) {
      // 从左向右滑动 - 切换到上一个标签
      newIndex = currentIndex > 0 ? currentIndex - 1 : feedTabs.length - 1
    } else {
      // 从右向左滑动 - 切换到下一个标签
      newIndex = currentIndex < feedTabs.length - 1 ? currentIndex + 1 : 0
    }
    
    activeFeedTab.value = feedTabs[newIndex].key
  }
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
async function checkUserFollowStatus() {
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
  if (isFollowLoading.value) return
  
  isFollowLoading.value = true
  try {
    const userId = parseInt(route.params.user_id)
    if (isFollowing.value) {
      await unfollowUser(userId)
      isFollowing.value = false
      // 更新粉丝数
      if (userStats.value.FollowerCount > 0) {
        userStats.value.FollowerCount--
      }
      showNotification('已取消关注', 'info')
    } else {
      await followUser(userId)
      isFollowing.value = true
      // 更新粉丝数
      userStats.value.FollowerCount++
      showNotification('关注成功', 'success')
    }
  } catch (error) {
    console.error('关注操作失败:', error)
    showNotification('关注操作失败', 'error')
  } finally {
    isFollowLoading.value = false
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

// 切换Feed标签
function switchFeedTab(tabKey) {
  activeFeedTab.value = tabKey
}

// 获取标签图标
function getTabIcon(tabKey) {
  const icons = {
    activity: '📝',
    analysis: '📊',
    achievements: '🏆'
  }
  return icons[tabKey] || '📄'
}

// 获取标签计数
function getTabCount(tabKey) {
  if (tabKey === 'activity') {
    return activities.value.length
  } else if (tabKey === 'analysis') {
    return analyses.value.length
  } else if (tabKey === 'achievements') {
    return badges.value.length
  }
  return 0
}

// 显示粉丝列表
function showFollowers() {
  showNotification('查看粉丝功能开发中', 'info')
}

// 显示关注列表
function showFollowing() {
  showNotification('查看关注功能开发中', 'info')
}

// 显示分析列表
function showAnalyses() {
  activeFeedTab.value = 'analysis'
}

// 显示获赞列表
function showLikes() {
  showNotification('查看获赞功能开发中', 'info')
}

// 显示奖章详情
function showBadgeDetail(badge) {
  showNotification(`奖章详情：${badge.name}`, 'info')
}

// 显示活动详情
function showActivityDetail(activity) {
  showNotification(`活动详情：${activity.content}`, 'info')
}

// 查看分析
function viewAnalysis(analysis) {
  if (analysis.id) {
    // 这里可以跳转到分析详情页
    showNotification('查看分析详情功能开发中', 'info')
  }
}

// 点赞分析
function likeAnalysis(analysis) {
  showNotification('点赞功能开发中', 'info')
}

// 获取状态样式
function getStatusClass(status) {
  const statusClasses = {
    'completed': 'success',
    'processing': 'info',
    'failed': 'error',
    'pending': 'warning'
  }
  return statusClasses[status] || 'default'
}

// 获取状态文本
function getStatusText(status) {
  const statusTexts = {
    'completed': '已完成',
    'processing': '处理中',
    'failed': '失败',
    'pending': '待处理'
  }
  return statusTexts[status] || status
}

// 显示通知
function showNotification(message, type = 'info') {
  const notification = document.createElement('div')
  notification.className = `notification notification-${type}`
  notification.textContent = message
  document.body.appendChild(notification)
  
  setTimeout(() => {
    notification.classList.add('show')
  }, 100)
  
  setTimeout(() => {
    notification.classList.remove('show')
    setTimeout(() => {
      notification.remove()
    }, 300)
  }, 3000)
}

// 格式化时间
function formatTime(timeStr) {
  if (!timeStr) return '未知时间'
  
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

// 获取奖章稀有度样式
function getBadgeRarityClass(rarity) {
  const rarityClasses = {
    'common': 'common',
    'rare': 'rare',
    'epic': 'epic',
    'legendary': 'legendary'
  }
  return rarityClasses[rarity] || 'common'
}

// 获取奖章稀有度文本
function getBadgeRarityText(rarity) {
  const rarityTexts = {
    'common': '普通',
    'rare': '稀有',
    'epic': '史诗',
    'legendary': '传说'
  }
  return rarityTexts[rarity] || '普通'
}

// 发送私信
function sendMessage() {
  showNotification('私信功能开发中', 'info')
}

// 查看评论
function viewComments(analysis) {
  showNotification('查看评论功能开发中', 'info')
}

// 分享分析
function shareAnalysis(analysis) {
  showNotification('分享功能开发中', 'info')
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
  animation: fadeInUp 0.6s ease-out;
  position: relative;
  overflow: hidden;
}

.user-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea, #764ba2, #667eea);
  background-size: 200% 100%;
  animation: gradientShift 3s ease-in-out infinite;
}

@keyframes gradientShift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
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
  position: relative;
  animation: avatarPulse 2s ease-in-out infinite;
}

.avatar-text {
  position: relative;
  z-index: 2;
}

.avatar-ring {
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  border-radius: 50%;
  border: 2px solid transparent;
  background: linear-gradient(45deg, #667eea, #764ba2, #667eea);
  background-size: 400% 400%;
  animation: ringRotate 3s ease-in-out infinite;
  z-index: 1;
}

@keyframes avatarPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes ringRotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 8px 12px;
  border-radius: 8px;
  position: relative;
}

.stat-item:hover {
  background: #f8fafc;
  transform: translateY(-2px);
}

.stat-item:hover .stat-number {
  color: #3b82f6;
}

.stat-item:hover::after {
  content: attr(title);
  position: absolute;
  bottom: -30px;
  left: 50%;
  transform: translateX(-50%);
  background: #1e293b;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  white-space: nowrap;
  z-index: 10;
  opacity: 0;
  animation: fadeIn 0.3s ease-out forwards;
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
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  min-width: 100px;
}

.follow-btn:hover:not(:disabled) {
  background: #3b82f6;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.follow-btn.following {
  background: #3b82f6;
  color: white;
}

.follow-btn.following:hover:not(:disabled) {
  background: #2563eb;
  border-color: #2563eb;
}

.follow-btn.loading {
  pointer-events: none;
  opacity: 0.8;
}

.follow-btn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.btn-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid #ffffff;
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.message-btn {
  padding: 12px 24px;
  border: 1px solid #6b7280;
  border-radius: 8px;
  background: white;
  color: #6b7280;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: 12px;
}

.message-btn:hover {
  border-color: #374151;
  color: #374151;
  background: #f9fafb;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.message-icon {
  font-size: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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
  animation: fadeIn 0.5s ease-out;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-badges p {
  margin: 0;
  font-size: 1rem;
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
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  animation: fadeInUp 0.4s ease-out;
}

.badge-item:hover {
  border-color: #3b82f6;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
  background: #f8fafc;
}

.badge-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.1), transparent);
  transition: left 0.5s ease;
}

.badge-item:hover::before {
  left: 100%;
}

.badge-time {
  font-size: 0.75rem;
  color: #94a3b8;
  margin-top: 4px;
}

.badge-rarity {
  font-size: 0.75rem;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
  text-transform: uppercase;
}

.badge-rarity.common {
  background: #f3f4f6;
  color: #6b7280;
}

.badge-rarity.rare {
  background: #dbeafe;
  color: #1d4ed8;
}

.badge-rarity.epic {
  background: #e9d5ff;
  color: #7c3aed;
}

.badge-rarity.legendary {
  background: #fef3c7;
  color: #d97706;
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
  position: relative;
}

.feed-tab {
  padding: 12px 0;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
}

.feed-tab:hover {
  color: #374151;
}

.feed-tab.active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
}

.feed-tab.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background: #3b82f6;
  animation: tabSlideIn 0.3s ease-out;
}

.tab-icon {
  font-size: 1.2rem;
}

.tab-label {
  font-weight: 500;
}

.tab-count {
  background: #e2e8f0;
  color: #64748b;
  padding: 2px 6px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  min-width: 20px;
  text-align: center;
}

.feed-tab.active .tab-count {
  background: #3b82f6;
  color: white;
}

@keyframes tabSlideIn {
  from {
    transform: scaleX(0);
  }
  to {
    transform: scaleX(1);
  }
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
  animation: fadeIn 0.5s ease-out;
}

.empty-feed .empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-feed p {
  margin: 0;
  font-size: 1rem;
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
  transition: all 0.3s ease;
  cursor: pointer;
  animation: slideInLeft 0.4s ease-out;
}

.activity-item:hover {
  border-color: #e2e8f0;
  background: #f8fafc;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.activity-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
  animation: iconBounce 2s ease-in-out infinite;
}

@keyframes iconBounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-3px); }
  60% { transform: translateY(-1px); }
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
  transition: all 0.3s ease;
  cursor: pointer;
  animation: slideInLeft 0.4s ease-out;
}

.analysis-item:hover {
  border-color: #e2e8f0;
  background: #f8fafc;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.analysis-status {
  padding: 4px 12px;
  background: #dcfce7;
  color: #166534;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.analysis-status.success {
  background: #dcfce7;
  color: #166534;
}

.analysis-status.info {
  background: #dbeafe;
  color: #1d4ed8;
}

.analysis-status.error {
  background: #fef2f2;
  color: #dc2626;
}

.analysis-status.warning {
  background: #fef3c7;
  color: #d97706;
}

.analysis-likes {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 4px 8px;
  border-radius: 6px;
}

.analysis-likes:hover {
  background: #fef2f2;
  color: #dc2626;
  transform: scale(1.05);
}

.like-icon {
  transition: transform 0.2s ease;
}

.analysis-likes:hover .like-icon {
  transform: scale(1.2);
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

/* 通知样式 */
.notification {
  position: fixed;
  top: 80px;
  right: 20px;
  padding: 12px 16px;
  border-radius: 8px;
  color: white;
  font-weight: 500;
  z-index: 1000;
  transform: translateX(100%);
  transition: transform 0.3s ease;
  max-width: 300px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.notification.show {
  transform: translateX(0);
}

.notification-success {
  background: #10b981;
}

.notification-error {
  background: #ef4444;
}

.notification-info {
  background: #3b82f6;
}

/* 动画 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.fade-slide-enter-active {
  transition: all 0.3s ease;
}

.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

/* 成就Feed流相关样式 */
.achievements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.achievement-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px;
  border: 1px solid #f1f5f9;
  border-radius: 12px;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  animation: slideInUp 0.4s ease-out;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
}

.achievement-item:hover {
  border-color: #3b82f6;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.15);
  background: linear-gradient(135deg, #ffffff 0%, #eff6ff 100%);
}

.achievement-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.08), transparent);
  transition: left 0.6s ease;
}

.achievement-item:hover::before {
  left: 100%;
}

.achievement-icon {
  font-size: 2.5rem;
  flex-shrink: 0;
  animation: achievementGlow 2s ease-in-out infinite;
}

@keyframes achievementGlow {
  0%, 100% { 
    transform: scale(1);
    filter: brightness(1);
  }
  50% { 
    transform: scale(1.1);
    filter: brightness(1.2);
  }
}

.achievement-content {
  flex: 1;
  min-width: 0;
}

.achievement-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 6px 0;
  line-height: 1.3;
}

.achievement-desc {
  font-size: 0.9rem;
  color: #64748b;
  line-height: 1.5;
  margin: 0 0 12px 0;
}

.achievement-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.achievement-time {
  font-size: 0.75rem;
  color: #94a3b8;
  font-weight: 500;
}

.achievement-rarity {
  font-size: 0.75rem;
  padding: 3px 8px;
  border-radius: 6px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border: 1px solid;
}

.achievement-rarity.common {
  background: #f8fafc;
  color: #64748b;
  border-color: #e2e8f0;
}

.achievement-rarity.rare {
  background: #eff6ff;
  color: #1e40af;
  border-color: #bfdbfe;
}

.achievement-rarity.epic {
  background: #faf5ff;
  color: #6b21a8;
  border-color: #e9d5ff;
}

.achievement-rarity.legendary {
  background: #fffbeb;
  color: #92400e;
  border-color: #fef3c7;
  box-shadow: 0 0 10px rgba(245, 158, 11, 0.3);
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.follow-btn-content {
  display: flex;
  align-items: center;
  gap: 6px;
}

.follow-icon {
  font-size: 1rem;
  font-weight: bold;
}

.badge-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  flex-wrap: wrap;
  gap: 8px;
}

.badge-info {
  flex: 1;
  min-width: 0;
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
    gap: 16px;
  }
  
  .badges-grid {
    grid-template-columns: 1fr;
  }
  
  .feed-tabs {
    gap: 16px;
  }
  
  .achievements-grid {
    grid-template-columns: 1fr;
  }
  
  .achievement-item {
    padding: 16px;
    gap: 12px;
  }
  
  .achievement-icon {
    font-size: 2rem;
  }
  
  .achievement-title {
    font-size: 1rem;
  }
  
  .achievement-desc {
    font-size: 0.875rem;
  }
  
  .notification {
    top: 70px;
    right: 10px;
    left: 10px;
    max-width: none;
  }
}
</style>