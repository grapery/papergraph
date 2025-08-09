<template>
  <div class="enhanced-feed-card">
    <!-- 分析图片 -->
    <div class="feed-card-img" v-if="item.image">
      <img :src="item.image" alt="analysis cover" />
    </div>
    
    <!-- 分析内容 -->
    <div class="feed-card-content">
      <div class="feed-card-header">
        <h3 class="feed-card-title">{{ item.title }}</h3>
        <div class="feed-card-author">
          <span class="author-avatar">{{ getAuthorInitial(item.user_name) }}</span>
          <span class="author-name">{{ item.user_name }}</span>
        </div>
      </div>
      
      <p class="feed-card-summary">{{ item.summary }}</p>
      
      <!-- 评价按钮组 -->
      <div class="reaction-buttons">
        <button 
          class="reaction-btn" 
          :class="{ active: userReactions.like }"
          @click="toggleReaction('like')"
          title="点赞"
        >
          <span class="reaction-icon">❤️</span>
          <span class="reaction-count">{{ item.like_count || 0 }}</span>
        </button>
        
        <button 
          class="reaction-btn" 
          :class="{ active: userReactions.agree }"
          @click="toggleReaction('agree')"
          title="认同"
        >
          <span class="reaction-icon">👍</span>
          <span class="reaction-count">{{ getReactionCount('agree') }}</span>
        </button>
        
        <button 
          class="reaction-btn" 
          :class="{ active: userReactions.disagree }"
          @click="toggleReaction('disagree')"
          title="不认同"
        >
          <span class="reaction-icon">👎</span>
          <span class="reaction-count">{{ getReactionCount('disagree') }}</span>
        </button>
        
        <button 
          class="reaction-btn" 
          :class="{ active: userReactions.biased }"
          @click="toggleReaction('biased')"
          title="有偏差"
        >
          <span class="reaction-icon">⚠️</span>
          <span class="reaction-count">{{ getReactionCount('biased') }}</span>
        </button>
        
        <button 
          class="reaction-btn" 
          :class="{ active: userReactions.share }"
          @click="toggleReaction('share')"
          title="分享"
        >
          <span class="reaction-icon">📤</span>
          <span class="reaction-count">{{ getReactionCount('share') }}</span>
        </button>
        
        <button 
          class="reaction-btn comment-btn"
          @click="toggleComments"
          title="评论"
        >
          <span class="reaction-icon">💬</span>
          <span class="reaction-count">{{ item.comment_count || 0 }}</span>
        </button>
      </div>
      
      <!-- 评论区域 -->
      <div v-if="showComments" class="comments-section">
        <div class="comment-input">
          <textarea 
            v-model="newComment" 
            placeholder="写下你的评论..."
            rows="3"
            @keydown.ctrl.enter="submitComment"
          ></textarea>
          <button class="submit-comment-btn" @click="submitComment" :disabled="!newComment.trim()">
            发表评论
          </button>
        </div>
        
        <div v-if="comments.length > 0" class="comments-list">
          <div v-for="comment in comments" :key="comment.id" class="comment-item">
            <div class="comment-header">
              <span class="comment-author">{{ comment.user_name }}</span>
              <span class="comment-time">{{ formatTime(comment.created_at) }}</span>
            </div>
            <div class="comment-content">{{ comment.content }}</div>
          </div>
        </div>
        <div v-else class="no-comments">
          还没有评论，来发表第一个评论吧！
        </div>
      </div>
      
      <!-- 查看详情按钮 -->
      <button class="view-btn" @click="viewAnalysis">查看完整分析</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})

const router = useRouter()
const emit = defineEmits(['reaction-updated'])

// 反应状态
const userReactions = ref({
  like: false,
  agree: false,
  disagree: false,
  biased: false,
  share: false
})

// 评论相关
const showComments = ref(false)
const newComment = ref('')
const comments = ref([])

// 计算属性
const reactionCounts = computed(() => {
  return props.item.reaction_counts || {}
})

// 组件挂载时初始化
onMounted(() => {
  // 模拟用户反应状态
  if (props.item.id === 1) {
    userReactions.value.like = true
  }
  
  // 模拟评论数据
  if (props.item.id === 1) {
    comments.value = [
      {
        id: 1,
        user_name: '学术爱好者',
        content: '这个分析很全面，特别是对方法论的解读很到位！',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 2,
        user_name: '研究生小王',
        content: '对我正在做的研究很有帮助，感谢分享！',
        created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
      }
    ]
  }
})

// 切换反应
function toggleReaction(type) {
  userReactions.value[type] = !userReactions.value[type]
  
  // 更新计数
  if (props.item.reaction_counts) {
    props.item.reaction_counts[type] = (props.item.reaction_counts[type] || 0) + (userReactions.value[type] ? 1 : -1)
  } else {
    props.item.reaction_counts = { [type]: userReactions.value[type] ? 1 : 0 }
  }
  
  // 如果是点赞，也更新like_count
  if (type === 'like') {
    props.item.like_count = (props.item.like_count || 0) + (userReactions.value[type] ? 1 : -1)
  }
  
  // 发送事件
  emit('reaction-updated', {
    taskId: props.item.id,
    type: type,
    active: userReactions.value[type]
  })
  
  // 如果是分享，显示分享提示
  if (type === 'share' && userReactions.value[type]) {
    showShareSuccess()
  }
}

// 获取反应计数
function getReactionCount(type) {
  return reactionCounts.value[type] || 0
}

// 获取作者首字母
function getAuthorInitial(name) {
  return name ? name.charAt(0).toUpperCase() : 'A'
}

// 切换评论显示
function toggleComments() {
  showComments.value = !showComments.value
}

// 提交评论
function submitComment() {
  if (!newComment.value.trim()) return
  
  const comment = {
    id: Date.now(),
    user_name: '当前用户',
    content: newComment.value,
    created_at: new Date().toISOString()
  }
  
  comments.value.unshift(comment)
  props.item.comment_count = (props.item.comment_count || 0) + 1
  newComment.value = ''
  
  // 显示成功提示
  showCommentSuccess()
}

// 显示分享成功提示
function showShareSuccess() {
  // 创建临时提示元素
  const toast = document.createElement('div')
  toast.className = 'share-toast'
  toast.textContent = '分享链接已复制到剪贴板！'
  document.body.appendChild(toast)
  
  setTimeout(() => {
    toast.remove()
  }, 3000)
}

// 显示评论成功提示
function showCommentSuccess() {
  const toast = document.createElement('div')
  toast.className = 'comment-toast'
  toast.textContent = '评论发表成功！'
  document.body.appendChild(toast)
  
  setTimeout(() => {
    toast.remove()
  }, 2000)
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

// 查看分析详情
function viewAnalysis() {
  router.push(`/paper-report/${props.item.id}`)
}
</script>

<style scoped>
.enhanced-feed-card {
  display: flex;
  background: var(--background-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: all var(--transition-normal);
  position: relative;
}

.enhanced-feed-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--border-secondary), transparent);
  opacity: 0;
  transition: opacity var(--transition-normal);
}

.enhanced-feed-card:hover {
  border-color: var(--border-secondary);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.enhanced-feed-card:hover::before {
  opacity: 1;
}

.feed-card-img {
  flex-shrink: 0;
  width: 200px;
  height: 150px;
  overflow: hidden;
  background: var(--background-secondary);
  position: relative;
}

.feed-card-img::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--gradient-subtle);
  opacity: 0.1;
  transition: opacity var(--transition-normal);
}

.enhanced-feed-card:hover .feed-card-img::before {
  opacity: 0.2;
}

.feed-card-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-normal);
}

.enhanced-feed-card:hover .feed-card-img img {
  transform: scale(1.05);
}

.feed-card-content {
  flex: 1;
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  min-height: 150px;
}

.feed-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-md);
  gap: var(--spacing-md);
}

.feed-card-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0;
  flex: 1;
  line-height: var(--line-height-tight);
  transition: color var(--transition-normal);
}

.enhanced-feed-card:hover .feed-card-title {
  color: var(--brand-primary);
}

.feed-card-author {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-left: var(--spacing-sm);
  flex-shrink: 0;
}

.author-avatar {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  background: var(--gradient-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-inverse);
  border: 2px solid var(--background-primary);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-normal);
}

.feed-card-author:hover .author-avatar {
  transform: scale(1.05);
  box-shadow: var(--shadow-md);
}

.author-name {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
  white-space: nowrap;
  transition: color var(--transition-normal);
}

.feed-card-author:hover .author-name {
  color: var(--text-primary);
}

.feed-card-summary {
  color: var(--text-secondary);
  line-height: var(--line-height-relaxed);
  margin-bottom: var(--spacing-lg);
  flex: 1;
  font-size: var(--font-size-sm);
}

.reaction-buttons {
  display: flex;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-lg);
  flex-wrap: wrap;
}

.reaction-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  background: var(--background-primary);
  color: var(--text-tertiary);
  font-size: var(--font-size-xs);
  cursor: pointer;
  transition: all var(--transition-normal);
  font-weight: var(--font-weight-medium);
  position: relative;
  overflow: hidden;
}

.reaction-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.05), transparent);
  transition: left var(--transition-slow);
}

.reaction-btn:hover::before {
  left: 100%;
}

.reaction-btn:hover {
  border-color: var(--border-secondary);
  background: var(--background-secondary);
  color: var(--text-primary);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.reaction-btn.active {
  border-color: var(--brand-primary);
  background: var(--brand-primary);
  color: var(--text-inverse);
  box-shadow: var(--shadow-sm);
}

.reaction-icon {
  font-size: var(--font-size-sm);
}

.reaction-count {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
}

.comment-btn {
  margin-left: auto;
  background: var(--background-secondary);
  color: var(--text-primary);
  border-color: var(--border-secondary);
}

.comment-btn:hover {
  background: var(--background-tertiary);
  color: var(--text-primary);
}

.comments-section {
  margin-bottom: var(--spacing-lg);
  border-top: 1px solid var(--border-primary);
  padding-top: var(--spacing-lg);
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    max-height: 0;
  }
  to {
    opacity: 1;
    max-height: 500px;
  }
}

.comment-input {
  margin-bottom: var(--spacing-lg);
}

.comment-input textarea {
  width: 100%;
  padding: var(--spacing-md) var(--spacing-lg);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  resize: vertical;
  font-family: var(--font-family-sans);
  font-size: var(--font-size-sm);
  outline: none;
  transition: all var(--transition-normal);
  background: var(--background-primary);
  box-shadow: var(--shadow-xs);
  line-height: var(--line-height-normal);
}

.comment-input textarea:focus {
  border-color: var(--border-focus);
  background: var(--background-primary);
  box-shadow: var(--focus-ring);
}

.comment-input textarea::placeholder {
  color: var(--text-tertiary);
}

.submit-comment-btn {
  margin-top: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-lg);
  background: var(--brand-primary);
  color: var(--text-inverse);
  border: 1px solid var(--brand-primary);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--transition-normal);
  font-weight: var(--font-weight-medium);
  box-shadow: var(--shadow-sm);
}

.submit-comment-btn:hover:not(:disabled) {
  background: var(--brand-hover);
  border-color: var(--brand-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.submit-comment-btn:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: var(--shadow-sm);
}

.submit-comment-btn:disabled {
  background: var(--text-tertiary);
  border-color: var(--text-tertiary);
  cursor: not-allowed;
  opacity: 0.6;
  transform: none;
}

.comments-list {
  max-height: 300px;
  overflow-y: auto;
  margin-top: var(--spacing-lg);
}

.comment-item {
  padding: var(--spacing-md) 0;
  border-bottom: 1px solid var(--border-primary);
  animation: fadeIn 0.3s ease-in;
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xs);
}

.comment-author {
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
}

.comment-time {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

.comment-content {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-relaxed);
}

.no-comments {
  text-align: center;
  color: var(--text-tertiary);
  font-style: italic;
  padding: var(--spacing-xl) 0;
  font-size: var(--font-size-sm);
}

.view-btn {
  align-self: flex-start;
  padding: var(--spacing-sm) var(--spacing-lg);
  background: var(--brand-primary);
  color: var(--text-inverse);
  border: 1px solid var(--brand-primary);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-normal);
  box-shadow: var(--shadow-sm);
}

.view-btn:hover {
  background: var(--brand-hover);
  border-color: var(--brand-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.view-btn:active {
  transform: translateY(0);
  box-shadow: var(--shadow-sm);
}

/* Toast提示样式 */
.share-toast, .comment-toast {
  position: fixed;
  top: 80px;
  right: var(--spacing-lg);
  background: var(--success-600);
  color: var(--text-inverse);
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  z-index: var(--z-dropdown);
  animation: slideInRight 0.3s ease-out;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  backdrop-filter: blur(10px);
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .enhanced-feed-card {
    flex-direction: column;
  }
  
  .feed-card-img {
    width: 100%;
    height: 200px;
  }
  
  .feed-card-content {
    padding: var(--spacing-md);
    min-height: auto;
  }
  
  .feed-card-header {
    flex-direction: column;
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-md);
  }
  
  .feed-card-author {
    margin-left: 0;
    align-self: flex-start;
  }
  
  .feed-card-title {
    font-size: var(--font-size-lg);
  }
  
  .feed-card-summary {
    font-size: var(--font-size-sm);
    margin-bottom: var(--spacing-md);
  }
  
  .reaction-buttons {
    gap: var(--spacing-xs);
    margin-bottom: var(--spacing-md);
    justify-content: flex-start;
  }
  
  .reaction-btn {
    padding: var(--spacing-xs) var(--spacing-sm);
    font-size: var(--font-size-xs);
    gap: var(--spacing-xs);
    min-width: auto;
    flex-shrink: 0;
  }
  
  .reaction-icon {
    font-size: var(--font-size-sm);
  }
  
  .reaction-count {
    font-size: var(--font-size-xs);
  }
  
  .comment-btn {
    margin-left: 0;
    margin-top: var(--spacing-xs);
  }
  
  .view-btn {
    padding: var(--spacing-sm) var(--spacing-md);
    font-size: var(--font-size-sm);
    align-self: stretch;
  }
  
  .comments-section {
    margin-bottom: var(--spacing-md);
  }
  
  .comment-input textarea {
    font-size: var(--font-size-sm);
    padding: var(--spacing-sm) var(--spacing-md);
  }
  
  .submit-comment-btn {
    padding: var(--spacing-xs) var(--spacing-md);
    font-size: var(--font-size-sm);
  }
  
  .comments-list {
    max-height: 250px;
  }
  
  .share-toast, .comment-toast {
    top: 70px;
    right: var(--spacing-md);
    font-size: var(--font-size-xs);
    padding: var(--spacing-xs) var(--spacing-md);
  }
}

@media (max-width: 480px) {
  .feed-card-img {
    height: 160px;
  }
  
  .feed-card-content {
    padding: var(--spacing-sm);
  }
  
  .feed-card-title {
    font-size: var(--font-size-base);
  }
  
  .feed-card-summary {
    font-size: var(--font-size-xs);
  }
  
  .reaction-buttons {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    padding-bottom: var(--spacing-xs);
  }
}
</style>