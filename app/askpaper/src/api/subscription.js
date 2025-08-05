import api from './axios'

/**
 * 获取所有订阅产品
 * @returns {Promise<Array>} 产品列表
 */
export function listProducts() {
  return api.get('/api/subscription/products').then(res => {
    if (res.data && res.data.code === 0) {
      return res.data.data || []
    } else {
      throw new Error(res.data && res.data.message ? res.data.message : '获取产品列表失败')
    }
  })
}

/**
 * 购买订阅
 * @param {number} productId - 产品ID
 * @param {string} payMethod - 支付方式：stripe/alipay
 * @returns {Promise<Object>} 购买结果
 */
export function buySubscription(productId, payMethod) {
  return api.post('/api/subscription/buy', {
    product_id: productId,
    pay_method: payMethod
  }).then(res => {
    if (res.data && res.data.code === 0) {
      return res.data.data || {}
    } else {
      throw new Error(res.data && res.data.message ? res.data.message : '购买失败')
    }
  })
}

/**
 * 获取用户剩余免费试用次数
 * @returns {Promise<Object>} 包含免费试用次数的对象
 */
export function getFreeTrialCount() {
  return api.get('/api/subscription/free_trial_count').then(res => {
    if (res.data && res.data.code === 0) {
      return res.data.data || { free_trial_count: 0 }
    } else {
      throw new Error(res.data && res.data.message ? res.data.message : '获取免费试用次数失败')
    }
  })
}

/**
 * 扣减用户免费试用次数
 * @returns {Promise<Object>} 扣减结果
 */
export function decrementFreeTrial() {
  return api.post('/api/subscription/decrement_trial').then(res => {
    if (res.data && res.data.code === 0) {
      return res.data.data || {}
    } else {
      throw new Error(res.data && res.data.message ? res.data.message : '扣减免费试用次数失败')
    }
  })
}

/**
 * 获取用户支付记录
 * @returns {Promise<Array>} 支付记录列表
 */
export function listPaymentRecords() {
  return api.get('/api/subscription/payment_records').then(res => {
    if (res.data && res.data.code === 0) {
      return res.data.data || []
    } else {
      throw new Error(res.data && res.data.message ? res.data.message : '获取支付记录失败')
    }
  })
}

/**
 * 获取用户订阅记录
 * @returns {Promise<Array>} 订阅记录列表
 */
export function listUserSubscriptions() {
  return api.get('/api/subscription/user_subscriptions').then(res => {
    if (res.data && res.data.code === 0) {
      return res.data.data || []
    } else {
      throw new Error(res.data && res.data.message ? res.data.message : '获取订阅记录失败')
    }
  })
} 