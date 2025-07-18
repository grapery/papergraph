# AskPaper Frontend

## 环境配置

### Google OAuth2 配置

1. 在 Google Cloud Console 创建 OAuth2 客户端
2. 设置授权重定向 URI: `http://localhost:8080/auth/google/callback`
3. 创建 `.env` 文件并配置：

```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
VITE_API_BASE_URL=http://localhost:8080
```

## 开发

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
```
