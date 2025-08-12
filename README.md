# Papergraph - 学术论文排行榜平台

> 一个基于多维度评价体系的学术论文排名和分享平台，让优质研究获得应有的关注。

## 🚀 项目概述

Papergraph 是一个创新的学术论文分享和评价平台，采用类似 Product Hunt 的设计理念，为学术研究者提供一个发现、分享和评价优质论文的社区。

### 核心特色

- **🎯 多维度评价体系**: 基于创新性、方法论、影响力等六个维度的综合评价
- **📊 实时排名系统**: 热门趋势、本周最佳、历史经典等多种排名方式
- **🏛️ 行业分类**: 8大学科领域，精细化分类管理
- **👥 学术社交**: 关注、私信、建立学术联系
- **📈 数据可视化**: 丰富的图表和分析报告
- **🏆 成就系统**: 勋章和激励机制

## 🏗️ 技术架构

### 前端技术栈

- **Vue 3**: 现代化的前端框架
- **Vite**: 快速的构建工具
- **Vue Router**: 单页面应用路由管理
- **Chart.js**: 数据可视化图表库
- **CSS Variables**: 主题定制和样式管理

### 后端技术栈

- **Go**: 高性能的后端语言
- **Gin**: Web框架
- **MySQL**: 关系型数据库
- **WebSocket**: 实时消息推送
- **JWT**: 用户认证

### 项目结构

```
papergraph/
├── app/askpaper/                    # 前端应用
│   ├── src/
│   │   ├── components/              # 组件库
│   │   ├── views/                  # 页面视图
│   │   ├── router/                 # 路由配置
│   │   ├── api/                    # API接口
│   │   ├── data/                   # 静态数据
│   │   └── assets/                 # 静态资源
│   ├── public/                     # 公共资源
│   └── package.json               # 依赖配置
├── server/                         # 后端服务
│   ├── main.go                     # 主程序
│   ├── api/                       # API路由
│   ├── models/                    # 数据模型
│   ├── services/                  # 业务逻辑
│   └── config/                    # 配置文件
└── docs/                          # 文档
```

## 📁 核心功能模块

### 1. 用户认证系统 (`/auth`)

- **邮箱注册/登录**: 支持邮箱密码认证
- **Google OAuth**: 第三方登录集成
- **学术信息**: 机构、职位、研究领域等
- **个人资料**: 头像、简介、研究兴趣

### 2. 首页排行榜 (`/home`)

- **分类导航**: 8大学科领域快速切换
- **排名筛选**: 热门趋势、本周最佳、历史经典
- **评价维度**: 可自定义评价维度权重
- **视图模式**: 网格视图和列表视图

### 3. 论文详情页 (`/paper/:id`)

- **基本信息**: 标题、作者、摘要、发表时间
- **综合评分**: 多维度评分和排名
- **分析报告**: 详细的评价和建议
- **互动功能**: 点赞、评论、分享、收藏

### 4. 分析仪表板 (`/dashboard`)

- **数据可视化**: 雷达图、柱状图、趋势图
- **详细分析**: 优势、不足、改进建议
- **导出功能**: PDF、Excel、JSON格式
- **分享功能**: 生成分享链接

### 5. 用户主页 (`/profile/:id`)

- **个人资料**: 学术背景和成就
- **统计数据**: 分析数量、粉丝、引用等
- **活动记录**: 最近的互动和贡献
- **成就奖章**: 获得的荣誉和徽章

## 🎨 设计系统

### 颜色主题

```css
:root {
  --brand-primary: #3B82F6;
  --brand-hover: #2563EB;
  --background-primary: #FFFFFF;
  --background-secondary: #F8FAFC;
  --text-primary: #1E293B;
  --text-secondary: #64748B;
  --border-primary: #E2E8F0;
  --border-secondary: #CBD5E1;
}
```

### 组件库

- **响应式设计**: 适配移动端和桌面端
- **动画效果**: 流畅的交互动画
- **主题切换**: 支持深色模式
- **无障碍访问**: 符合WCAG标准

## 📊 数据模型

### 用户模型

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  avatar: string;
  institution: string;
  position: string;
  field: string;
  bio: string;
  interests: string[];
  stats: UserStats;
}
```

### 论文模型

```typescript
interface Paper {
  id: number;
  title: string;
  authors: string[];
  abstract: string;
  category: string;
  subcategory: string;
  publishDate: string;
  evaluation: Evaluation;
  stats: PaperStats;
}
```

### 评价模型

```typescript
interface Evaluation {
  innovation: number;      // 创新性
  methodology: number;     // 方法论
  impact: number;          // 影响力
  clarity: number;         // 清晰度
  reproducibility: number; // 可复现性
  significance: number;    // 重要性
  overall: number;        // 综合评分
}
```

## 🚀 快速开始

### 环境要求

- Node.js >= 16.0.0
- Go >= 1.19.0
- MySQL >= 8.0
- npm >= 8.0.0

### 安装步骤

1. **克隆项目**
```bash
git clone https://github.com/yourusername/papergraph.git
cd papergraph
```

2. **安装前端依赖**
```bash
cd app/askpaper
npm install
```

3. **安装后端依赖**
```bash
cd server
go mod tidy
```

4. **配置数据库**
```bash
# 创建数据库
mysql -u root -p -e "CREATE DATABASE papergraph CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 导入表结构
mysql -u root -p papergraph < server/schema.sql
```

5. **启动后端服务**
```bash
cd server
go run main.go
```

6. **启动前端服务**
```bash
cd app/askpaper
npm run dev
```

7. **访问应用**
打开浏览器访问 `http://localhost:3000`

### 开发命令

```bash
# 前端开发
cd app/askpaper
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm run preview      # 预览生产版本

# 后端开发
cd server
go run main.go       # 启动开发服务器
go build            # 构建可执行文件
go test             # 运行测试

# 代码检查
npm run lint         # ESLint检查
npm run format       # Prettier格式化
```

## 📱 移动端适配

### 响应式断点

- **移动端**: < 768px
- **平板端**: 768px - 1024px
- **桌面端**: > 1024px

### 移动端特性

- **触摸手势**: 滑动切换、下拉刷新
- **自适应布局**: Flexbox和Grid布局
- **性能优化**: 懒加载、虚拟滚动
- **PWA支持**: 可安装到桌面

## 🔧 部署说明

### 前端部署

```bash
# 构建生产版本
cd app/askpaper
npm run build

# 部署到静态服务器
# 将 dist/ 目录内容部署到 Web 服务器
```

### 后端部署

```bash
# 构建可执行文件
cd server
go build -o papergraph main.go

# 运行服务
./papergraph
```

### Docker部署

```bash
# 构建镜像
docker build -t papergraph .

# 运行容器
docker run -p 8080:8080 papergraph
```

## 📈 性能优化

### 前端优化

- **代码分割**: 路由级别的代码分割
- **懒加载**: 组件和图片懒加载
- **缓存策略**: 浏览器缓存和CDN
- **压缩优化**: Gzip压缩和图片优化

### 后端优化

- **数据库索引**: 优化查询性能
- **缓存机制**: Redis缓存热点数据
- **连接池**: 数据库连接池
- **异步处理**: 消息队列处理耗时任务

## 🔒 安全考虑

### 认证授权

- **JWT Token**: 无状态认证
- **密码加密**: bcrypt加密存储
- **CORS配置**: 跨域请求控制
- **CSRF保护**: 跨站请求伪造防护

### 数据安全

- **SQL注入**: 参数化查询
- **XSS防护**: 输入验证和输出编码
- **HTTPS**: 全站HTTPS加密
- **数据备份**: 定期备份和恢复

## 🤝 贡献指南

### 开发流程

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

### 代码规范

- 使用 ESLint 和 Prettier
- 遵循 Vue 3 组合式API风格
- 编写清晰的注释和文档
- 确保代码通过所有测试

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者和研究者。

## 📞 联系我们

- **项目地址**: [GitHub Repository](https://github.com/yourusername/papergraph)
- **问题反馈**: [Issues](https://github.com/yourusername/papergraph/issues)
- **邮件联系**: [papergraph@example.com](mailto:papergraph@example.com)

---

© 2024 Papergraph. All rights reserved.