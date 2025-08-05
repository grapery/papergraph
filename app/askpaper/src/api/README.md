# API 接口文档

本文档描述了前端与后端API的对接规范。

## 响应格式

所有API响应都遵循以下格式：

```javascript
{
  "code": 0,        // 0表示成功，非0表示失败
  "message": "success", // 响应消息
  "data": {}        // 响应数据（可选）
}
```

## 认证

所有需要认证的API都会自动在请求头中添加 `Authorization: Bearer <token>`。

## API 分类

### 1. 认证相关 (`auth.js`)

#### `getCurrentUser()`
获取当前用户信息
- **方法**: GET
- **路径**: `/api/me`
- **返回**: 用户信息对象

#### `googleLogin()`
跳转到Google登录页面
- **方法**: 页面跳转
- **路径**: `/login/google`

### 2. 分析相关 (`analysis.js`)

#### `uploadPaper(file)`
上传PDF文件
- **方法**: POST
- **路径**: `/api/upload`
- **参数**: `file` - File对象
- **返回**: `{paper: Object, task: Object}`

#### `startAnalysis(taskId)`
发起分析任务
- **方法**: POST
- **路径**: `/api/start_analysis`
- **参数**: `taskId` - 任务ID
- **返回**: 分析任务结果

#### `getUserTasks()`
获取用户所有分析任务
- **方法**: GET
- **路径**: `/api/tasks`
- **返回**: 任务列表数组

#### `getUserActiveTasks()`
获取用户活跃任务
- **方法**: GET
- **路径**: `/api/active_tasks`
- **返回**: 活跃任务列表数组

#### `getTaskDetail(taskId)`
获取任务详情
- **方法**: GET
- **路径**: `/api/task_detail`
- **参数**: `taskId` - 任务ID
- **返回**: 任务详情对象

#### `getAnalysisResult(taskId)`
获取分析结果
- **方法**: GET
- **路径**: `/api/analysis_result`
- **参数**: `taskId` - 任务ID
- **返回**: 分析结果对象

#### `setTaskPublicStatus(taskId, isPublic)`
设置任务公开/私有状态
- **方法**: POST
- **路径**: `/api/set_public`
- **参数**: 
  - `taskId` - 任务ID
  - `isPublic` - 是否公开（boolean）
- **返回**: 设置结果

#### `getComments(taskId)`
获取评论列表
- **方法**: GET
- **路径**: `/api/comments`
- **参数**: `taskId` - 任务ID
- **返回**: 评论列表数组

#### `addComment(taskId, content, parentId?)`
添加评论
- **方法**: POST
- **路径**: `/api/comment`
- **参数**: 
  - `taskId` - 任务ID
  - `content` - 评论内容
  - `parentId` - 父评论ID（可选，用于回复）
- **返回**: 评论对象

### 3. 公开Feed相关 (`feed.js`)

#### `getPublicFeed(orderBy?)`
获取公开分析列表
- **方法**: GET
- **路径**: `/public_feed`
- **参数**: `orderBy` - 排序方式（可选：like/suggest/默认时间）
- **返回**: 公开分析列表数组

#### `likeTask(taskId)`
点赞分析任务
- **方法**: POST
- **路径**: `/api/like`
- **参数**: `taskId` - 任务ID
- **返回**: 点赞结果

#### `unlikeTask(taskId)`
取消点赞分析任务
- **方法**: POST
- **路径**: `/api/unlike`
- **参数**: `taskId` - 任务ID
- **返回**: 取消点赞结果

#### `suggestRead(taskId)`
建议读原文（通过评论接口实现）
- **方法**: POST
- **路径**: `/api/comment`
- **参数**: `taskId` - 任务ID
- **返回**: 评论结果

### 4. 订阅相关 (`subscription.js`)

#### `listProducts()`
获取所有订阅产品
- **方法**: GET
- **路径**: `/api/subscription/products`
- **返回**: 产品列表数组

#### `buySubscription(productId, payMethod)`
购买订阅
- **方法**: POST
- **路径**: `/api/subscription/buy`
- **参数**: 
  - `productId` - 产品ID
  - `payMethod` - 支付方式（stripe/alipay）
- **返回**: 购买结果

#### `getFreeTrialCount()`
获取用户剩余免费试用次数
- **方法**: GET
- **路径**: `/api/subscription/free_trial_count`
- **返回**: `{free_trial_count: number}`

#### `decrementFreeTrial()`
扣减用户免费试用次数
- **方法**: POST
- **路径**: `/api/subscription/decrement_trial`
- **返回**: 扣减结果

#### `listPaymentRecords()`
获取用户支付记录
- **方法**: GET
- **路径**: `/api/subscription/payment_records`
- **返回**: 支付记录列表数组

#### `listUserSubscriptions()`
获取用户订阅记录
- **方法**: GET
- **路径**: `/api/subscription/user_subscriptions`
- **返回**: 订阅记录列表数组

## 使用示例

```javascript
import { uploadPaper, startAnalysis, getCurrentUser } from '../api'

// 上传文件
const file = document.getElementById('file').files[0]
const { paper, task } = await uploadPaper(file)

// 发起分析
await startAnalysis(task.ID)

// 获取用户信息
const user = await getCurrentUser()
```

## 错误处理

所有API函数都会在失败时抛出Error，包含错误信息：

```javascript
try {
  const result = await someApiFunction()
} catch (error) {
  console.error('API调用失败:', error.message)
  // 显示错误信息给用户
}
```

## 开发模式

在开发模式下，401错误不会自动重定向，避免影响测试。生产环境会自动跳转到登录页面。 