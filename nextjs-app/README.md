# Papergraph - Next.js Migration

## 项目概述
这是一个将 Vue.js 应用迁移到 Next.js 的项目。原项目是一个基于多维度评价体系的学术论文排名和分享平台。

## 🛠️ 技术栈

### 原技术栈 (Vue.js)
- **Vue 3**: 现代化的前端框架
- **Vite**: 快速的构建工具
- **Vue Router**: 单页面应用路由管理
- **Chart.js**: 数据可视化图表库
- **CSS Variables**: 主题定制和样式管理

### 新技术栈 (Next.js)
- **Next.js 14**: React 全栈框架
- **React 18**: 用户界面构建库
- **TypeScript**: 类型安全的 JavaScript
- **Tailwind CSS**: 实用优先的 CSS 框架
- **Zustand**: 轻量级状态管理
- **Chart.js + React Chart.js 2**: 数据可视化
- **Lucide React**: 图标库

## 📁 项目结构

```
nextjs-app/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── auth/              # 认证页面
│   │   ├── dashboard/         # 分析仪表板
│   │   ├── feed/              # 论文探索
│   │   ├── home/              # 首页
│   │   ├── profile/           # 用户资料
│   │   ├── layout.tsx         # 根布局
│   │   └── globals.css        # 全局样式
│   ├── components/            # React 组件
│   │   ├── NavBar.tsx        # 导航栏
│   │   └── AnalysisDashboard.tsx # 分析仪表板
│   ├── hooks/                 # React Hooks
│   │   ├── useAuth.ts         # 认证相关
│   │   └── useData.ts         # 数据获取
│   ├── lib/                   # 工具库
│   │   ├── api.ts            # API 配置
│   │   └── utils.ts          # 工具函数
│   ├── store/                 # 状态管理
│   │   └── index.ts          # Zustand store
│   └── types/                 # TypeScript 类型
│       └── index.ts          # 类型定义
├── public/                    # 静态资源
├── package.json              # 项目配置
├── next.config.ts           # Next.js 配置
├── tailwind.config.ts       # Tailwind 配置
└── tsconfig.json            # TypeScript 配置
```

## 🚀 主要功能

### ✅ 已完成功能

1. **项目架构搭建**
   - Next.js 14 项目结构
   - TypeScript 配置
   - Tailwind CSS 集成
   - 状态管理 (Zustand)

2. **核心组件迁移**
   - 导航栏 (NavBar)
   - 首页 (Homepage)
   - 认证页面 (Auth)
   - 用户资料页 (UserProfile)
   - 论文探索页 (Feed)
   - 分析仪表板 (AnalysisDashboard)

3. **功能特性**
   - 用户认证系统
   - 多维度论文评价
   - 数据可视化 (Chart.js)
   - 响应式设计
   - 主题系统

4. **样式系统**
   - CSS 变量迁移到 Tailwind
   - 响应式设计
   - 深色模式支持
   - 动画效果

### 🔄 迁移对比

| 功能 | Vue.js | Next.js | 状态 |
|------|--------|---------|------|
| 路由系统 | Vue Router | Next.js App Router | ✅ |
| 状态管理 | Vue Reactivity | Zustand | ✅ |
| 样式系统 | CSS Variables | Tailwind CSS | ✅ |
| 图表库 | Chart.js | React Chart.js 2 | ✅ |
| 认证系统 | 自定义 | 自定义 | ✅ |
| API 调用 | Axios | Axios | ✅ |
| 响应式 | CSS Media | Tailwind | ✅ |

## 📦 安装和运行

### 环境要求
- Node.js >= 18.0.0
- npm >= 8.0.0

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd nextjs-app
```

2. **安装依赖**
```bash
npm install
```

3. **启动开发服务器**
```bash
npm run dev
```

4. **访问应用**
打开浏览器访问 `http://localhost:3000`

### 可用命令

```bash
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm run start        # 启动生产服务器
npm run lint         # ESLint 检查
```

## 🎯 页面路由

- `/` -> 重定向到 `/home`
- `/home` -> 首页
- `/auth` -> 认证页面
- `/feed` -> 论文探索
- `/dashboard` -> 分析仪表板
- `/profile/[user_id]` -> 用户资料

## 🔧 开发说明

### 状态管理
使用 Zustand 进行全局状态管理，包括：
- 用户认证状态
- 应用配置
- 数据缓存

### API 调用
使用 Axios 进行 API 调用，包含：
- 请求拦截器 (添加认证头)
- 响应拦截器 (错误处理)
- TypeScript 类型支持

### 组件开发
- 使用 React 函数组件
- TypeScript 类型安全
- Tailwind CSS 样式
- 自定义 Hooks 复用逻辑

### 样式系统
- 基于 Tailwind CSS
- 自定义 CSS 变量
- 响应式设计
- 深色模式支持

## 📝 待完成功能

### 🔧 API 路由
- [ ] 创建 Next.js API 路由
- [ ] 实现后端 API 接口
- [ ] 数据库集成

### 🎨 UI/UX 优化
- [ ] 更多组件动画
- [ ] 加载状态优化
- [ ] 错误边界处理

### 🚀 功能扩展
- [ ] 实时通知
- [ ] 评论系统
- [ ] 文件上传
- [ ] 搜索功能

## 📊 性能优化

### 已实现
- 代码分割
- 图片优化
- 字体优化
- 缓存策略

### 计划中
- 服务端渲染 (SSR)
- 静态站点生成 (SSG)
- 边缘缓存
- 性能监控

## 🔒 安全考虑

### 已实现
- CSRF 保护
- XSS 防护
- 认证状态管理

### 计划中
- 输入验证
- 输出编码
- HTTPS 配置
- 安全头设置

## 🤝 贡献指南

1. Fork 项目
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证。

## 🙏 致谢

感谢原 Vue.js 项目的开发团队，为本次迁移提供了良好的基础。