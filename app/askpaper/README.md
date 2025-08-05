# AskPaper Frontend

## 环境配置

### 开发模式（模拟登录）

当前使用模拟登录进行开发测试，无需配置 Google OAuth2：

1. 点击"使用gmail登录"按钮会自动进行模拟登录
2. 模拟用户数据：测试用户 (test@example.com)
3. 登录状态保存在 localStorage 中

### 生产模式（Google OAuth2）

如需使用真实的 Google OAuth2 登录：

1. 在 Google Cloud Console 创建 OAuth2 客户端
2. 设置授权重定向 URI: `http://localhost:8080/auth/google/callback`
3. 创建 `.env` 文件并配置：

```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
VITE_API_BASE_URL=
```

4. 在 `NavBar.vue` 中取消注释 Google 登录代码

## 前后端对接

### 开发环境

1. **启动后端服务**（端口 8080）：
   ```bash
   # 在项目根目录
   go run main.go
   ```

2. **启动前端开发服务器**（端口 3000）：
   ```bash
   # 在 app/askpaper 目录
   npm install
   npm run dev
   ```

3. **代理配置**：
   - 前端开发服务器会自动将 `/api` 和 `/auth` 请求代理到后端 8080 端口
   - 无需额外配置，Vite 已配置好代理

### 生产环境

1. **构建前端**：
   ```bash
   npm run build
   ```

2. **部署**：
   - 将 `dist` 目录部署到 Web 服务器
   - 配置 Web 服务器将 API 请求代理到后端

## 开发

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
```

## API 配置

- 所有 API 请求都会自动添加认证 token
- 401 错误会自动清除 token 并跳转到登录页
- 支持请求超时和错误处理

## 模拟数据

开发测试使用模拟数据，位于 `src/utils/mockData.js`：

- 模拟用户：测试用户
- 模拟任务：3个示例任务
- 模拟分析：5个示例分析
- 模拟公开分析：5个示例公开分析
