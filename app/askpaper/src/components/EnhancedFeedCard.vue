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
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
  overflow: hidden;
  transition: box-shadow 0.2s;
}

.enhanced-feed-card:hover {
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.15);
}

.feed-card-img {
  flex-shrink: 0;
  width: 200px;
  height: 150px;
  overflow: hidden;
}

.feed-card-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.feed-card-content {
  flex: 1;
  padding: 24px;
  display: flex;
  flex-direction: column;
}

.feed-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.feed-card-title {
  font-size: 1.2rem;
  font-weight: bold;
  color: #1e293b;
  margin: 0;
  flex: 1;
}

.feed-card-author {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 16px;
}

.author-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  font-weight: bold;
  color: white;
}

.author-name {
  font-size: 0.9rem;
  color: #64748b;
}

.feed-card-summary {
  color: #475569;
  line-height: 1.6;
  margin-bottom: 16px;
  flex: 1;
}

.reaction-buttons {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.reaction-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  background: white;
  color: #64748b;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.reaction-btn:hover {
  border-color: #cbd5e1;
  background: #f8fafc;
}

.reaction-btn.active {
  border-color: #3b82f6;
  background: #eff6ff;
  color: #3b82f6;
}

.reaction-icon {
  font-size: 1rem;
}

.reaction-count {
  font-size: 0.8rem;
  font-weight: 500;
}

.comment-btn {
  margin-left: auto;
}

.comments-section {
  margin-bottom: 16px;
  border-top: 1px solid #e2e8f0;
  padding-top: 16px;
}

.comment-input {
  margin-bottom: 16px;
}

.comment-input textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  resize: vertical;
  font-family: inherit;
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.2s;
}

.comment-input textarea:focus {
  border-color: #3b82f6;
}

.submit-comment-btn {
  margin-top: 8px;
  padding: 8px 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.2s;
}

.submit-comment-btn:hover:not(:disabled) {
  background: #2563eb;
}

.submit-comment-btn:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
}

.comments-list {
  max-height: 300px;
  overflow-y: auto;
}

.comment-item {
  padding: 12px 0;
  border-bottom: 1px solid #f1f5f9;
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.comment-author {
  font-weight: 600;
  color: #1e293b;
  font-size: 0.9rem;
}

.comment-time {
  font-size: 0.8rem;
  color: #94a3b8;
}

.comment-content {
  color: #475569;
  font-size: 0.9rem;
  line-height: 1.5;
}

.no-comments {
  text-align: center;
  color: #94a3b8;
  font-style: italic;
  padding: 20px 0;
}

.view-btn {
  align-self: flex-start;
  padding: 10px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.2s;
}

.view-btn:hover {
  transform: translateY(-1px);
}

/* Toast提示样式 */
.share-toast, .comment-toast {
  position: fixed;
  top: 20px;
  right: 20px;
  background: #10b981;
  color: white;
  padding: 12px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
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
  
  .feed-card-header {
    flex-direction: column;
    gap: 8px;
  }
  
  .feed-card-author {
    margin-left: 0;
  }
  
  .reaction-buttons {
    gap: 4px;
  }
  
  .reaction-btn {
    padding: 6px 10px;
    font-size: 0.8rem;
  }
}
</style>