# Gmail API 配置指南

## 1. 获取 Gmail API 凭据

### 1.1 在 Google Cloud Console 中设置项目

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 启用 Gmail API：
   - 在左侧菜单中选择 "APIs & Services" > "Library"
   - 搜索 "Gmail API"
   - 点击启用

### 1.2 创建 OAuth 2.0 凭据

1. 在左侧菜单中选择 "APIs & Services" > "Credentials"
2. 点击 "Create Credentials" > "OAuth client ID"
3. 选择应用程序类型为 "Web application"
4. 设置授权重定向 URI：
   ```
   http://localhost:8080/api/email/auth/callback
   ```
5. 下载 JSON 凭据文件

### 1.3 配置应用程序

在 `config/config.go` 文件中更新 Gmail 配置：

```go
// 全局Gmail配置
var GmailConf = GmailConfig{
    ClientID:     "your-client-id.googleusercontent.com",
    ClientSecret: "your-client-secret",
    RedirectURL:  "http://localhost:8080/api/email/auth/callback",
    Scopes: []string{
        "https://www.googleapis.com/auth/gmail.readonly",
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile",
    },
}
```

## 2. API 使用流程

### 2.1 Gmail OAuth 认证流程

1. **开始认证**：
   ```bash
   GET /api/email/auth/start
   ```
   返回认证URL，用户需要访问此URL进行授权

2. **处理回调**：
   用户授权后，Google会重定向到：
   ```
   GET /api/email/auth/callback?code=xxx&state=xxx
   ```

3. **获取访问令牌**：
   系统自动交换授权码获取访问令牌

### 2.2 邮件同步

```bash
POST /api/email/sync
Headers:
  Authorization: Bearer <user-jwt-token>
  Gmail-Token: <gmail-oauth-token-json>
```

### 2.3 邮件查询

```bash
GET /api/email/list?limit=20&offset=0&is_read=false
Headers:
  Authorization: Bearer <user-jwt-token>
```

## 3. 主要功能特性

### 3.1 邮件管理
- ✅ Gmail OAuth 2.0 认证
- ✅ 邮件同步和存储
- ✅ 邮件列表查询（支持过滤）
- ✅ 邮件详情查看
- ✅ 邮件状态更新（已读、重要等）

### 3.2 AI 分析
- ✅ 邮件内容分析
- ✅ 情感分析
- ✅ 关键词提取
- ✅ 智能分类

### 3.3 草稿生成
- ✅ AI 生成邮件回复
- ✅ 草稿管理
- ✅ 模板化回复

### 3.4 统计功能
- ✅ 邮件数量统计
- ✅ 分类统计
- ✅ 趋势分析

## 4. 数据模型

### 4.1 邮件模型 (Email)
- Gmail ID、线程ID
- 发件人、收件人信息
- 主题、正文内容
- 发送时间、标签
- 分析状态、分类信息

### 4.2 分析结果模型 (EmailAnalysis)
- 情感分析结果
- 语言检测
- 关键词提取
- 主题分类
- AI生成的回复建议

### 4.3 草稿模型 (EmailDraft)
- 草稿内容
- 生成提示
- 关联的原始邮件
- 发送状态

## 5. 安全考虑

### 5.1 Token 存储
- OAuth token 应该加密存储
- 实现 token 刷新机制
- 设置合适的过期时间

### 5.2 权限控制
- 用户只能访问自己的邮件
- API 需要用户认证
- Gmail 权限最小化（只读权限）

### 5.3 数据保护
- 邮件内容本地存储
- 定期清理过期数据
- 遵循数据保护法规

## 6. 扩展功能

### 6.1 高级过滤
- 自定义过滤规则
- 智能分类标签
- 自动归档处理

### 6.2 批量操作
- 批量标记已读
- 批量分类
- 批量删除

### 6.3 实时同步
- Webhook 支持
- 增量同步
- 实时通知

## 7. 性能优化

### 7.1 并发处理
- 异步邮件同步
- 批量数据库操作
- 连接池管理

### 7.2 缓存策略
- Redis 缓存热点数据
- 分页查询优化
- 索引优化

### 7.3 监控告警
- API 调用量监控
- 错误率统计
- 性能指标追踪
