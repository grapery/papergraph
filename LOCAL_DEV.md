# 本地开发调试指南

## 环境状态
✅ **数据库**: MySQL 8.0 运行在端口 3306  
✅ **后端**: Go 服务运行在端口 8080  
✅ **前端**: Vue 3 + Vite 服务运行在端口 3000  
✅ **API**: 后端API正常响应  
✅ **数据库**: 所有表已创建，初始化数据已插入  

## 服务访问地址

- **前端应用**: http://localhost:3000
- **后端API**: http://localhost:8080
- **数据库**: localhost:3306

## 主要功能测试

### 1. 订阅系统API测试
```bash
# 获取产品列表
curl http://localhost:8080/api/subscription/products

# 获取用户免费试用次数 (需要用户ID)
curl http://localhost:8080/api/subscription/free_trial_count
```

### 2. 奖章系统API测试
```bash
# 获取用户奖章 (需要用户ID)
curl http://localhost:8080/api/user/1/badges

# 获取用户统计 (需要用户ID)
curl http://localhost:8080/api/user/1/stats
```

### 3. 任务评价API测试
```bash
# 对任务进行评价 (需要任务ID和评价类型)
curl -X POST http://localhost:8080/api/task/react \
  -H "Content-Type: application/json" \
  -d '{"task_id": 1, "reaction_type": "like"}'
```

## 开发调试技巧

### 1. 后端调试
- 使用 `go run main.go` 启动后端服务
- 查看控制台日志了解API请求情况
- 使用 Postman 或 curl 测试API

### 2. 前端调试
- 使用 `npm run dev` 启动前端开发服务器
- 打开浏览器开发者工具 (F12)
- Vue DevTools 插件调试 Vue 组件
- Network 面板查看 API 请求

### 3. 数据库调试
```bash
# 连接数据库
mysql -u root -p'123456789' -h localhost

# 查看数据库
use papergraph;
show tables;

# 查看用户表
select * from users limit 5;

# 查看奖章模板
select * from badge_templates;
```

## 已实现功能

### ✅ 完成的功能
1. **用户认证系统**: Google OAuth2 登录
2. **论文分析系统**: 上传论文、开始分析、查看结果
3. **订阅系统**: 产品列表、购买订阅、免费试用
4. **奖章系统**: 奖章模板、用户奖章、自动颁发
5. **社交系统**: 用户关注、活动Feed流、任务评价
6. **评论系统**: 添加评论、查看评论
7. **个人主页**: 用户信息、奖章展示、双Feed流

### 🔄 数据库表结构
- `users` - 用户基本信息
- `badge_templates` - 奖章模板
- `user_badges` - 用户奖章
- `user_stats` - 用户统计
- `user_activities` - 用户活动
- `user_follows` - 用户关注关系
- `task_reactions` - 任务评价
- `products` - 订阅产品
- `user_subscriptions` - 用户订阅
- `payment_records` - 支付记录
- `papers` - 论文信息
- `analysis_tasks` - 分析任务
- `analysis_results` - 分析结果
- `comments` - 评论

## 常见问题解决

### 1. 端口冲突
- 检查端口占用: `lsof -i :端口号`
- 杀掉进程: `kill -9 进程ID`

### 2. 数据库连接失败
- 检查MySQL是否运行: `lsof -i :3306`
- 检查用户名密码是否正确

### 3. API请求失败
- 检查后端服务是否运行: `lsof -i :8080`
- 查看后端日志了解错误详情

### 4. 前端页面空白
- 检查前端服务是否运行: `lsof -i :3000`
- 查看浏览器控制台错误

## 下一步开发建议

1. **完善用户主页**: 添加更多用户信息和互动功能
2. **优化UI/UX**: 改进页面设计和用户体验
3. **添加更多评价类型**: 扩展任务评价功能
4. **实现实时通知**: 添加WebSocket实时消息推送
5. **性能优化**: 添加缓存和数据库索引优化

## 开发命令总结

```bash
# 启动后端服务
cd /Users/grapestree/Desktop/work/papergraph
go run main.go

# 启动前端服务
cd /Users/grapestree/Desktop/work/papergraph/app/askpaper
npm run dev

# 查看服务状态
lsof -i :8080  # 后端
lsof -i :3000  # 前端
lsof -i :3306  # 数据库

# 测试API
curl http://localhost:8080/api/subscription/products
```

---

🎉 **本地开发环境已成功搭建！**  
现在你可以在浏览器中访问 http://localhost:3000 开始使用和调试应用了。