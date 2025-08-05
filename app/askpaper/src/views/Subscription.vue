<template>
  <div class="subscription-page">
    <TopTabs />
    
    <div class="subscription-container">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1 class="page-title">订阅管理</h1>
        <p class="page-subtitle">选择适合您的订阅计划，享受更多高级功能</p>
      </div>

      <!-- 当前订阅状态 -->
      <div class="current-subscription">
        <div class="subscription-status" :class="currentSubscription.status">
          <div class="status-icon">{{ getStatusIcon(currentSubscription.status) }}</div>
          <div class="status-info">
            <h3>当前订阅</h3>
            <p>{{ currentSubscription.plan_name }} - {{ currentSubscription.status === 'active' ? '有效期至 ' + formatDate(currentSubscription.end_date) : '已过期' }}</p>
          </div>
        </div>
      </div>

      <!-- 订阅计划 -->
      <div class="plans-section">
        <h2 class="section-title">选择订阅计划</h2>
        <div class="plans-grid">
          <!-- 动态渲染产品计划 -->
          <div v-for="product in products" :key="product.id" 
               :class="['plan-card', getProductClass(product.name)]">
            <div v-if="product.name.includes('专业')" class="plan-badge">推荐</div>
            <div class="plan-header">
              <h3 class="plan-name">{{ product.name }}</h3>
              <div class="plan-price">¥{{ product.price }}<span class="plan-period">/月</span></div>
            </div>
            <div class="plan-features">
              <div v-for="feature in getProductFeatures(product.name)" :key="feature.text" class="feature-item">
                <span class="feature-icon">{{ feature.icon }}</span>
                <span>{{ feature.text }}</span>
              </div>
            </div>
            <button v-if="product.price === 0" class="plan-btn current-plan" disabled>当前计划</button>
            <button v-else class="plan-btn primary" @click="subscribe(product.name)">
              {{ currentSubscription.plan_type === product.name.toLowerCase().replace('版', '') ? '续费' : '立即订阅' }}
            </button>
          </div>
        </div>
      </div>

      <!-- 支付记录 -->
      <div class="payment-history">
        <h2 class="section-title">支付记录</h2>
        <div v-if="paymentHistory.length === 0" class="empty-history">
          暂无支付记录
        </div>
        <div v-else class="payment-list">
          <div v-for="payment in paymentHistory" :key="payment.id" class="payment-item">
            <div class="payment-info">
              <div class="payment-plan">{{ payment.plan_name }}</div>
              <div class="payment-date">{{ formatDate(payment.created_at) }}</div>
            </div>
            <div class="payment-amount">¥{{ payment.amount }}</div>
            <div class="payment-status" :class="payment.status">
              {{ getStatusText(payment.status) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 支付模态框 -->
    <div v-if="showPaymentModal" class="payment-modal">
      <div class="modal-overlay" @click="closePaymentModal"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h3>确认订阅</h3>
          <button class="close-btn" @click="closePaymentModal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="payment-summary">
            <div class="summary-item">
              <span>订阅计划：</span>
              <span>{{ selectedPlan.name }}</span>
            </div>
            <div class="summary-item">
              <span>价格：</span>
              <span>¥{{ selectedPlan.price }}/月</span>
            </div>
            <div class="summary-item">
              <span>支付方式：</span>
              <span>支付宝</span>
            </div>
          </div>
          
          <div class="payment-methods">
            <h4>选择支付方式</h4>
            <div class="method-options">
              <label class="method-option" :class="{ 'selected': selectedPaymentMethod === 'alipay' }">
                <input 
                  type="radio" 
                  name="payment_method" 
                  value="alipay" 
                  v-model="selectedPaymentMethod"
                  :disabled="isProcessing"
                >
                <span class="method-icon">💰</span>
                <span>支付宝</span>
                <span class="method-desc">安全快捷的支付方式</span>
              </label>
              <label class="method-option" :class="{ 'selected': selectedPaymentMethod === 'wechat' }">
                <input 
                  type="radio" 
                  name="payment_method" 
                  value="wechat" 
                  v-model="selectedPaymentMethod"
                  :disabled="isProcessing"
                >
                <span class="method-icon">💚</span>
                <span>微信支付</span>
                <span class="method-desc">微信内置支付</span>
              </label>
            </div>
            <div v-if="paymentMethodError" class="payment-method-error">
              {{ paymentMethodError }}
            </div>
          </div>
          
          <div class="payment-actions">
            <button class="cancel-btn" @click="closePaymentModal" :disabled="isProcessing">
              取消
            </button>
            <button 
              class="confirm-btn" 
              @click="processPayment" 
              :disabled="isProcessing || !selectedPaymentMethod"
              :title="!selectedPaymentMethod ? '请选择支付方式' : '确认支付'"
            >
              <span v-if="isProcessing" class="btn-spinner"></span>
              <span v-else>{{ isProcessing ? '处理中...' : '确认支付' }}</span>
            </button>
          </div>
          <div v-if="processingError" class="processing-error">
            {{ processingError }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import TopTabs from '../components/TopTabs.vue'
import { listProducts, buySubscription, getFreeTrialCount, listPaymentRecords, listUserSubscriptions } from '../api/subscription'

// 订阅状态
const currentSubscription = ref({
  status: 'free',
  plan_type: 'free',
  plan_name: '免费版',
  end_date: null
})

// 支付记录
const paymentHistory = ref([])

// 产品列表
const products = ref([])

// 支付模态框
const showPaymentModal = ref(false)
const selectedPlan = ref({})
const isProcessing = ref(false)
const selectedPaymentMethod = ref('alipay')
const paymentMethodError = ref('')
const processingError = ref('')

// 页面加载时获取数据
onMounted(async () => {
  await loadProducts()
  await loadSubscriptionInfo()
  await loadPaymentHistory()
})

// 加载产品列表
async function loadProducts() {
  try {
    products.value = await listProducts()
  } catch (error) {
    console.error('加载产品列表失败:', error)
  }
}

// 加载订阅信息
async function loadSubscriptionInfo() {
  try {
    const subscriptions = await listUserSubscriptions()
    if (subscriptions.length > 0) {
      const activeSubscription = subscriptions.find(sub => sub.status === 'active')
      if (activeSubscription) {
        const product = products.value.find(p => p.id === activeSubscription.product_id)
        if (product) {
          currentSubscription.value = {
            status: 'active',
            plan_type: product.name.toLowerCase().replace('版', ''),
            plan_name: product.name,
            end_date: activeSubscription.end_time
          }
        }
      }
    }
  } catch (error) {
    console.error('加载订阅信息失败:', error)
  }
}

// 加载支付记录
async function loadPaymentHistory() {
  try {
    paymentHistory.value = await listPaymentRecords()
  } catch (error) {
    console.error('加载支付记录失败:', error)
  }
}

// 订阅计划
function subscribe(planType) {
  const product = products.value.find(p => 
    p.name.toLowerCase().includes(planType.toLowerCase())
  )
  
  if (product) {
    selectedPlan.value = {
      id: product.id,
      name: product.name,
      price: product.price,
      type: planType
    }
    showPaymentModal.value = true
  }
}

// 关闭支付模态框
function closePaymentModal() {
  showPaymentModal.value = false
  selectedPlan.value = {}
  selectedPaymentMethod.value = 'alipay'
  paymentMethodError.value = ''
  processingError.value = ''
}

// 处理支付
async function processPayment() {
  if (isProcessing.value) return
  
  // 验证支付方式
  if (!validatePaymentMethod()) {
    return
  }
  
  isProcessing.value = true
  processingError.value = ''
  
  try {
    // 调用支付API
    await buySubscription(selectedPlan.value.id, selectedPaymentMethod.value)
    
    // 重新加载订阅信息和支付记录
    await loadSubscriptionInfo()
    await loadPaymentHistory()
    
    // 显示成功提示
    showPaymentSuccess()
    
    // 关闭模态框
    closePaymentModal()
  } catch (error) {
    console.error('支付处理失败:', error)
    processingError.value = '支付处理失败，请重试'
    showPaymentError()
  } finally {
    isProcessing.value = false
  }
}

// 验证支付方式
function validatePaymentMethod() {
  if (!selectedPaymentMethod.value) {
    paymentMethodError.value = '请选择支付方式'
    return false
  }
  
  paymentMethodError.value = ''
  return true
}

// 显示支付成功提示
function showPaymentSuccess() {
  const toast = document.createElement('div')
  toast.className = 'payment-toast success'
  toast.innerHTML = `
    <div class="toast-icon">✅</div>
    <div class="toast-content">
      <div class="toast-title">支付成功！</div>
      <div class="toast-message">订阅已激活，感谢您的支持</div>
    </div>
  `
  document.body.appendChild(toast)
  
  setTimeout(() => {
    toast.classList.add('show')
  }, 100)
  
  setTimeout(() => {
    toast.classList.remove('show')
    setTimeout(() => {
      toast.remove()
    }, 300)
  }, 3000)
}

// 显示支付失败提示
function showPaymentError() {
  const toast = document.createElement('div')
  toast.className = 'payment-toast error'
  toast.innerHTML = `
    <div class="toast-icon">❌</div>
    <div class="toast-content">
      <div class="toast-title">支付失败</div>
      <div class="toast-message">请检查支付信息后重试</div>
    </div>
  `
  document.body.appendChild(toast)
  
  setTimeout(() => {
    toast.classList.add('show')
  }, 100)
  
  setTimeout(() => {
    toast.classList.remove('show')
    setTimeout(() => {
      toast.remove()
    }, 300)
  }, 3000)
}

// 获取状态图标
function getStatusIcon(status) {
  const icons = {
    active: '✅',
    expired: '⏰',
    free: '🆓'
  }
  return icons[status] || '❓'
}

// 获取状态文本
function getStatusText(status) {
  const texts = {
    success: '支付成功',
    pending: '处理中',
    failed: '支付失败'
  }
  return texts[status] || status
}

// 获取产品特性
function getProductFeatures(productName) {
  const features = {
    '免费版': [
      { icon: '✓', text: '每月3次免费分析' },
      { icon: '✓', text: '基础AI分析功能' },
      { icon: '✓', text: '公开分析分享' },
      { icon: '✗', text: '高级AI模型' },
      { icon: '✗', text: '优先处理队列' }
    ],
    '专业版': [
      { icon: '✓', text: '每月50次分析' },
      { icon: '✓', text: '高级AI模型分析' },
      { icon: '✓', text: '优先处理队列' },
      { icon: '✓', text: '详细分析报告' },
      { icon: '✓', text: '专属奖章和徽章' }
    ],
    '企业版': [
      { icon: '✓', text: '无限次分析' },
      { icon: '✓', text: '所有AI模型' },
      { icon: '✓', text: '最高优先级处理' },
      { icon: '✓', text: 'API接口访问' },
      { icon: '✓', text: '专属客服支持' }
    ]
  }
  
  return features[productName] || []
}

// 获取产品样式类
function getProductClass(productName) {
  if (productName.includes('免费')) return 'free-plan'
  if (productName.includes('专业')) return 'pro-plan'
  if (productName.includes('企业')) return 'enterprise-plan'
  return ''
}

// 格式化日期
function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN')
}
</script>

<style scoped>
.subscription-page {
  min-height: 100vh;
  background: #f8fafc;
}

.subscription-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 48px;
}

.page-title {
  font-size: 2.5rem;
  font-weight: bold;
  color: #1e293b;
  margin-bottom: 8px;
}

.page-subtitle {
  font-size: 1.1rem;
  color: #64748b;
}

.current-subscription {
  margin-bottom: 48px;
}

.subscription-status {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  border-radius: 12px;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.subscription-status.active {
  border-left: 4px solid #10b981;
}

.subscription-status.expired {
  border-left: 4px solid #ef4444;
}

.subscription-status.free {
  border-left: 4px solid #6b7280;
}

.status-icon {
  font-size: 2rem;
}

.status-info h3 {
  margin: 0 0 4px 0;
  color: #1e293b;
}

.status-info p {
  margin: 0;
  color: #64748b;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 24px;
}

.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 48px;
}

.plan-card {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  position: relative;
  transition: transform 0.2s, box-shadow 0.2s;
}

.plan-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.plan-badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: #ef4444;
  color: white;
  padding: 4px 16px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.plan-header {
  text-align: center;
  margin-bottom: 24px;
}

.plan-name {
  font-size: 1.5rem;
  font-weight: bold;
  color: #1e293b;
  margin-bottom: 8px;
}

.plan-price {
  font-size: 2.5rem;
  font-weight: bold;
  color: #3b82f6;
}

.plan-period {
  font-size: 1rem;
  color: #64748b;
  font-weight: normal;
}

.plan-features {
  margin-bottom: 32px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  font-size: 0.9rem;
}

.feature-icon {
  font-weight: bold;
  color: #10b981;
}

.feature-item .feature-icon:last-child {
  color: #ef4444;
}

.plan-btn {
  width: 100%;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.plan-btn.primary {
  background: #3b82f6;
  color: white;
}

.plan-btn.primary:hover {
  background: #2563eb;
}

.plan-btn.current-plan {
  background: #f3f4f6;
  color: #6b7280;
  cursor: not-allowed;
}

.payment-history {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.empty-history {
  text-align: center;
  color: #64748b;
  padding: 40px 0;
}

.payment-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.payment-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border: 1px solid #f1f5f9;
  border-radius: 8px;
}

.payment-info {
  flex: 1;
}

.payment-plan {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
}

.payment-date {
  font-size: 0.9rem;
  color: #64748b;
}

.payment-amount {
  font-weight: 600;
  color: #1e293b;
  margin-right: 16px;
}

.payment-status {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.payment-status.success {
  background: #dcfce7;
  color: #166534;
}

.payment-status.pending {
  background: #fef3c7;
  color: #92400e;
}

.payment-status.failed {
  background: #fee2e2;
  color: #991b1b;
}

/* 支付模态框 */
.payment-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
}

.modal-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 0 24px;
  margin-bottom: 24px;
}

.modal-header h3 {
  margin: 0;
  color: #1e293b;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #64748b;
}

.modal-body {
  padding: 0 24px 24px 24px;
}

.payment-summary {
  margin-bottom: 24px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 0.9rem;
}

.summary-item span:first-child {
  color: #64748b;
}

.summary-item span:last-child {
  font-weight: 600;
  color: #1e293b;
}

.payment-methods {
  margin-bottom: 24px;
}

.payment-methods h4 {
  margin: 0 0 16px 0;
  color: #1e293b;
}

.method-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.method-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.2s;
}

.method-option:hover {
  border-color: #3b82f6;
}

.method-option input[type="radio"] {
  margin: 0;
}

.method-icon {
  font-size: 1.2rem;
}

.payment-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.cancel-btn {
  padding: 12px 24px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  color: #64748b;
  cursor: pointer;
  transition: border-color 0.2s;
}

.cancel-btn:hover {
  border-color: #cbd5e1;
}

.confirm-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  background: #3b82f6;
  color: white;
  cursor: pointer;
  transition: background 0.2s;
}

.confirm-btn:hover:not(:disabled) {
  background: #2563eb;
}

.confirm-btn:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
}

/* 支付提示 */
.payment-toast {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 12px 20px;
  border-radius: 8px;
  color: white;
  font-weight: 500;
  z-index: 1001;
  animation: slideIn 0.3s ease-out;
}

.payment-toast.success {
  background: #10b981;
}

.payment-toast.error {
  background: #ef4444;
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

/* 增强的表单验证和反馈样式 */
.method-option {
  position: relative;
  transition: all 0.3s ease;
}

.method-option::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 8px;
  padding: 2px;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: xor;
  -webkit-mask-composite: xor;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.method-option.selected::before {
  opacity: 1;
}

.method-option.selected {
  border-color: #3b82f6;
  background: linear-gradient(135deg, #eff6ff, #dbeafe);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.15);
}

.method-option input[type="radio"]:checked + .method-icon {
  animation: iconPulse 0.6s ease-in-out;
}

@keyframes iconPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

.payment-method-error {
  background: #fef2f2;
  color: #dc2626;
  padding: 12px 16px;
  border-radius: 8px;
  margin-top: 12px;
  font-size: 0.875rem;
  border-left: 4px solid #dc2626;
  animation: shakeIn 0.5s ease-out;
}

@keyframes shakeIn {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.processing-error {
  background: #fef2f2;
  color: #dc2626;
  padding: 12px 16px;
  border-radius: 8px;
  margin-top: 16px;
  font-size: 0.875rem;
  border-left: 4px solid #dc2626;
  animation: fadeInUp 0.3s ease-out;
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

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.confirm-btn {
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.confirm-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.confirm-btn:hover:not(:disabled)::before {
  left: 100%;
}

.confirm-btn:disabled {
  transform: none;
  box-shadow: none;
}

/* 表单字段验证样式 */
.url-input.error {
  border-color: #dc2626;
  background: #fef2f2;
  animation: fieldShake 0.5s ease-out;
}

@keyframes fieldShake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.url-error {
  color: #dc2626;
  font-size: 0.875rem;
  margin-top: 4px;
  padding: 4px 8px;
  background: #fef2f2;
  border-radius: 4px;
  border-left: 3px solid #dc2626;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .subscription-container {
    padding: 20px 16px;
  }
  
  .plans-grid {
    grid-template-columns: 1fr;
  }
  
  .payment-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .modal-content {
    width: 95%;
  }
}
</style>