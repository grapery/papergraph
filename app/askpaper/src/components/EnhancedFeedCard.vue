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
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid #f3f4f6;
}

.enhanced-feed-card:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.feed-card-img {
  flex-shrink: 0;
  width: 240px;
  height: 180px;
  overflow: hidden;
  background: #f3f4f6;
}

.feed-card-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.enhanced-feed-card:hover .feed-card-img img {
  transform: scale(1.05);
}

.feed-card-content {
  flex: 1;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  min-height: 180px;
}

.feed-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  gap: 1rem;
}

.feed-card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  flex: 1;
  line-height: 1.4;
  transition: color 0.2s ease;
}

.enhanced-feed-card:hover .feed-card-title {
  color: #3b82f6;
}

.feed-card-author {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: 1rem;
  flex-shrink: 0;
}

.author-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 600;
  color: white;
  border: 2px solid #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.author-name {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
  white-space: nowrap;
}

.feed-card-summary {
  color: #4b5563;
  line-height: 1.6;
  margin-bottom: 1rem;
  flex: 1;
  font-size: 0.95rem;
}

.reaction-buttons {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.reaction-btn {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  background: #fff;
  color: #6b7280;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
}

.reaction-btn:hover {
  border-color: #d1d5db;
  background: #f9fafb;
  color: #374151;
  transform: translateY(-1px);
}

.reaction-btn.active {
  border-color: #3b82f6;
  background: #eff6ff;
  color: #3b82f6;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
}

.reaction-icon {
  font-size: 1rem;
}

.reaction-count {
  font-size: 0.75rem;
  font-weight: 600;
}

.comment-btn {
  margin-left: auto;
  background: #f3f4f6;
  color: #374151;
}

.comment-btn:hover {
  background: #e5e7eb;
  color: #1f2937;
}

.comments-section {
  margin-bottom: 1rem;
  border-top: 1px solid #f3f4f6;
  padding-top: 1rem;
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
  margin-bottom: 1rem;
}

.comment-input textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  resize: vertical;
  font-family: inherit;
  font-size: 0.875rem;
  outline: none;
  transition: all 0.2s ease;
  background: #f9fafb;
}

.comment-input textarea:focus {
  border-color: #3b82f6;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.submit-comment-btn {
  margin-top: 0.5rem;
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
}

.submit-comment-btn:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(37, 99, 235, 0.3);
}

.submit-comment-btn:disabled {
  background: #d1d5db;
  cursor: not-allowed;
  transform: none;
}

.comments-list {
  max-height: 300px;
  overflow-y: auto;
  margin-top: 1rem;
}

.comment-item {
  padding: 0.75rem 0;
  border-bottom: 1px solid #f3f4f6;
  animation: fadeIn 0.3s ease-in;
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
}

.comment-author {
  font-weight: 600;
  color: #1f2937;
  font-size: 0.875rem;
}

.comment-time {
  font-size: 0.75rem;
  color: #9ca3af;
}

.comment-content {
  color: #4b5563;
  font-size: 0.875rem;
  line-height: 1.5;
}

.no-comments {
  text-align: center;
  color: #9ca3af;
  font-style: italic;
  padding: 1.5rem 0;
  font-size: 0.875rem;
}

.view-btn {
  align-self: flex-start;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(102, 126, 234, 0.3);
}

.view-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.view-btn:active {
  transform: translateY(0);
}

/* Toast提示样式 */
.share-toast, .comment-toast {
  position: fixed;
  top: 80px;
  right: 20px;
  background: #10b981;
  color: white;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  animation: slideInRight 0.3s ease-out;
  font-size: 0.875rem;
  font-weight: 500;
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
    padding: 1rem;
    min-height: auto;
  }
  
  .feed-card-header {
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 0.75rem;
  }
  
  .feed-card-author {
    margin-left: 0;
    align-self: flex-start;
  }
  
  .feed-card-title {
    font-size: 1.1rem;
  }
  
  .feed-card-summary {
    font-size: 0.875rem;
    margin-bottom: 0.75rem;
  }
  
  .reaction-buttons {
    gap: 0.25rem;
    margin-bottom: 0.75rem;
    justify-content: flex-start;
  }
  
  .reaction-btn {
    padding: 0.375rem 0.5rem;
    font-size: 0.75rem;
    gap: 0.125rem;
    min-width: auto;
    flex-shrink: 0;
  }
  
  .reaction-icon {
    font-size: 0.875rem;
  }
  
  .reaction-count {
    font-size: 0.625rem;
  }
  
  .comment-btn {
    margin-left: 0;
    margin-top: 0.25rem;
  }
  
  .view-btn {
    padding: 0.5rem 1rem;
    font-size: 0.75rem;
    align-self: stretch;
  }
  
  .comments-section {
    margin-bottom: 0.75rem;
  }
  
  .comment-input textarea {
    font-size: 0.8125rem;
    padding: 0.5rem;
  }
  
  .submit-comment-btn {
    padding: 0.375rem 0.75rem;
    font-size: 0.75rem;
  }
  
  .comments-list {
    max-height: 250px;
  }
  
  .share-toast, .comment-toast {
    top: 70px;
    right: 10px;
    font-size: 0.75rem;
    padding: 0.5rem 0.75rem;
  }
}

@media (max-width: 480px) {
  .feed-card-img {
    height: 160px;
  }
  
  .feed-card-content {
    padding: 0.75rem;
  }
  
  .feed-card-title {
    font-size: 1rem;
  }
  
  .feed-card-summary {
    font-size: 0.8125rem;
  }
  
  .reaction-buttons {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    padding-bottom: 0.25rem;
  }
}
</style>