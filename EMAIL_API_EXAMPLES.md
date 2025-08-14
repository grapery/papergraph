# Gmail API 使用示例

## 1. 认证流程示例

### 1.1 开始 Gmail 认证
```bash
curl -X GET http://localhost:8080/api/email/auth/start
```

响应：
```json
{
  "auth_url": "https://accounts.google.com/o/oauth2/auth?client_id=xxx&redirect_uri=xxx&response_type=code&scope=xxx&state=xxx",
  "state": "random-state-string"
}
```

### 1.2 用户授权后的回调处理
用户访问 `auth_url` 完成授权后，会自动重定向到：
```
http://localhost:8080/api/email/auth/callback?code=xxx&state=xxx
```

响应：
```json
{
  "message": "Gmail认证成功",
  "user_id": 1,
  "token": "{\"access_token\":\"xxx\",\"token_type\":\"Bearer\",\"refresh_token\":\"xxx\",\"expiry\":\"2024-01-01T00:00:00Z\"}",
  "expires": "2024-01-01T00:00:00Z"
}
```

## 2. 邮件同步示例

### 2.1 同步最新邮件
```bash
curl -X POST http://localhost:8080/api/email/sync \
  -H "Authorization: Bearer <用户JWT>" \
  -H "Gmail-Token: <Gmail OAuth Token JSON>" \
  -H "Content-Type: application/json"
```

响应：
```json
{
  "message": "邮件同步成功",
  "count": 25,
  "synced_at": "2024-01-01T12:00:00Z",
  "emails": [
    {
      "id": "gmail-message-id-1",
      "subject": "重要邮件",
      "from": "sender@example.com",
      "date": "2024-01-01T10:00:00Z",
      "snippet": "这是邮件摘要...",
      "body": "邮件正文内容..."
    }
  ]
}
```

### 2.2 带过滤条件的同步
```bash
curl -X POST "http://localhost:8080/api/email/sync?filter=is:unread&max_results=10" \
  -H "Authorization: Bearer <用户JWT>" \
  -H "Gmail-Token: <Gmail OAuth Token JSON>"
```

## 3. 邮件查询示例

### 3.1 获取邮件列表
```bash
curl -X GET "http://localhost:8080/api/email/list?limit=20&offset=0" \
  -H "Authorization: Bearer <用户JWT>"
```

响应：
```json
{
  "emails": [
    {
      "id": 1,
      "gmail_id": "gmail-message-id-1",
      "subject": "重要邮件",
      "from_email": "sender@example.com",
      "from_name": "发件人姓名",
      "date_sent": "2024-01-01T10:00:00Z",
      "snippet": "邮件摘要",
      "is_read": false,
      "is_important": false,
      "category": "work",
      "word_count": 250
    }
  ],
  "count": 20,
  "filter": {
    "limit": 20,
    "offset": 0
  }
}
```

### 3.2 过滤未读邮件
```bash
curl -X GET "http://localhost:8080/api/email/list?is_read=false&limit=10" \
  -H "Authorization: Bearer <用户JWT>"
```

### 3.3 按发件人过滤
```bash
curl -X GET "http://localhost:8080/api/email/list?from_email=boss@company.com" \
  -H "Authorization: Bearer <用户JWT>"
```

### 3.4 按日期范围过滤
```bash
curl -X GET "http://localhost:8080/api/email/list?date_from=2024-01-01&date_to=2024-01-31" \
  -H "Authorization: Bearer <用户JWT>"
```

## 4. 邮件详情示例

### 4.1 获取邮件详情
```bash
curl -X GET http://localhost:8080/api/email/123 \
  -H "Authorization: Bearer <用户JWT>"
```

响应：
```json
{
  "email": {
    "id": 123,
    "gmail_id": "gmail-message-id-123",
    "subject": "项目进度报告",
    "from_email": "manager@company.com",
    "from_name": "项目经理",
    "to_email": "user@company.com",
    "date_sent": "2024-01-01T14:30:00Z",
    "body": "详细的邮件正文内容...",
    "body_html": "<html>HTML格式的邮件内容...</html>",
    "snippet": "项目进度更新摘要",
    "size_estimate": 1024,
    "label_ids": "[\"INBOX\", \"IMPORTANT\"]",
    "is_read": true,
    "is_important": true,
    "category": "work",
    "priority": "high",
    "word_count": 450,
    "attachment_count": 2
  }
}
```

## 5. 邮件状态更新示例

### 5.1 标记邮件为已读
```bash
curl -X PATCH http://localhost:8080/api/email/123/status \
  -H "Authorization: Bearer <用户JWT>" \
  -H "Content-Type: application/json" \
  -d '{"is_read": true}'
```

### 5.2 标记邮件为重要
```bash
curl -X PATCH http://localhost:8080/api/email/123/status \
  -H "Authorization: Bearer <用户JWT>" \
  -H "Content-Type: application/json" \
  -d '{"is_important": true, "category": "urgent"}'
```

响应：
```json
{
  "message": "邮件状态更新成功",
  "updates": {
    "is_important": true,
    "category": "urgent"
  }
}
```

## 6. 邮件分析示例

### 6.1 分析邮件内容
```bash
curl -X POST http://localhost:8080/api/email/123/analyze \
  -H "Authorization: Bearer <用户JWT>"
```

响应：
```json
{
  "message": "邮件分析完成",
  "analysis": {
    "id": 45,
    "email_id": 123,
    "sentiment": "positive",
    "sentiment_score": 0.8,
    "language": "zh",
    "keywords": "[\"项目\", \"进度\", \"完成\", \"deadline\"]",
    "summary": "这是一封关于项目进度的积极更新邮件",
    "topics": "[\"工作\", \"项目管理\"]",
    "confidence": 0.85,
    "quality": 8,
    "created_at": "2024-01-01T15:00:00Z"
  }
}
```

## 7. 邮件草稿示例

### 7.1 创建回复草稿
```bash
curl -X POST http://localhost:8080/api/email/draft \
  -H "Authorization: Bearer <用户JWT>" \
  -H "Content-Type: application/json" \
  -d '{
    "original_email_id": 123,
    "to_email": "manager@company.com",
    "subject": "Re: 项目进度报告",
    "prompt": "感谢项目更新，确认收到。询问下一步计划。"
  }'
```

响应：
```json
{
  "message": "草稿创建成功",
  "draft": {
    "id": 67,
    "user_id": 1,
    "original_email_id": 123,
    "to_email": "manager@company.com",
    "subject": "Re: 项目进度报告",
    "body": "基于提示'感谢项目更新，确认收到。询问下一步计划。'生成的邮件草稿:\n\n尊敬的项目经理，\n\n感谢您的项目进度报告。我已收到并仔细阅读了更新内容。\n\n请问下一阶段的具体计划是什么？有什么需要我协助的地方吗？\n\n此致\n敬礼",
    "prompt": "感谢项目更新，确认收到。询问下一步计划。",
    "ai_model": "gpt-3.5-turbo",
    "status": "draft",
    "created_at": "2024-01-01T15:30:00Z"
  }
}
```

### 7.2 获取草稿列表
```bash
curl -X GET http://localhost:8080/api/email/drafts \
  -H "Authorization: Bearer <用户JWT>"
```

响应：
```json
{
  "drafts": [
    {
      "id": 67,
      "to_email": "manager@company.com",
      "subject": "Re: 项目进度报告",
      "body": "草稿内容...",
      "status": "draft",
      "created_at": "2024-01-01T15:30:00Z",
      "original_email": {
        "id": 123,
        "subject": "项目进度报告"
      }
    }
  ],
  "count": 1
}
```

## 8. 邮件统计示例

### 8.1 获取邮件统计信息
```bash
curl -X GET http://localhost:8080/api/email/stats \
  -H "Authorization: Bearer <用户JWT>"
```

响应：
```json
{
  "stats": {
    "total_emails": 1250,
    "unread_emails": 45,
    "important_emails": 23,
    "analyzed_emails": 890,
    "draft_count": 5,
    "today_emails": 12
  }
}
```

## 9. 错误处理示例

### 9.1 认证失败
```json
{
  "code": 401,
  "message": "用户未登录",
  "data": null
}
```

### 9.2 Gmail Token 无效
```json
{
  "error": "Gmail认证失败: oauth2: token expired"
}
```

### 9.3 邮件不存在
```json
{
  "error": "邮件不存在"
}
```

### 9.4 参数错误
```json
{
  "error": "无效的邮件ID"
}
```

## 10. 批量操作示例

### 10.1 批量标记已读
```bash
curl -X PATCH http://localhost:8080/api/email/batch/status \
  -H "Authorization: Bearer <用户JWT>" \
  -H "Content-Type: application/json" \
  -d '{
    "email_ids": [123, 124, 125],
    "updates": {"is_read": true}
  }'
```

### 10.2 批量分类
```bash
curl -X PATCH http://localhost:8080/api/email/batch/status \
  -H "Authorization: Bearer <用户JWT>" \
  -H "Content-Type: application/json" \
  -d '{
    "email_ids": [126, 127, 128],
    "updates": {"category": "newsletter", "is_important": false}
  }'
```

## 11. 高级查询示例

### 11.1 复合条件查询
```bash
curl -X GET "http://localhost:8080/api/email/list?category=work&is_important=true&date_from=2024-01-01&limit=50" \
  -H "Authorization: Bearer <用户JWT>"
```

### 11.2 关键词搜索
```bash
curl -X GET "http://localhost:8080/api/email/search?q=项目+deadline&limit=20" \
  -H "Authorization: Bearer <用户JWT>"
```

### 11.3 发件人统计
```bash
curl -X GET http://localhost:8080/api/email/senders/stats \
  -H "Authorization: Bearer <用户JWT>"
```

响应：
```json
{
  "senders": [
    {
      "email": "manager@company.com",
      "name": "项目经理",
      "count": 45,
      "last_email": "2024-01-01T14:30:00Z"
    },
    {
      "email": "hr@company.com", 
      "name": "人事部",
      "count": 23,
      "last_email": "2024-01-01T09:15:00Z"
    }
  ]
}
```
