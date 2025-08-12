# Next.js API Routes

This directory contains all the API routes for the Next.js application, migrated from the Vue.js application.

## 📁 API Structure

```
src/app/api/
├── auth/
│   └── google/route.ts          # Google OAuth login
├── evaluations/
│   └── route.ts                 # Evaluation CRUD operations
├── papers/
│   ├── [id]/route.ts            # Get paper details
│   ├── popular/route.ts         # Get popular papers
│   ├── recent/route.ts          # Get recent papers
│   └── search/route.ts          # Search papers
├── feed/
│   └── public/route.ts          # Public feed analysis
├── analysis/
│   ├── analysis_result/route.ts # Get analysis results
│   ├── task_detail/route.ts     # Get task details
│   ├── tasks/route.ts           # Get user tasks
│   ├── active_tasks/route.ts    # Get active tasks
│   └── start_analysis/route.ts  # Start analysis task
├── like/route.ts                # Like/unlike operations
├── unlike/route.ts              # Unlike operation
├── comment/route.ts             # Comment operations
├── set_public/route.ts          # Set public/private status
├── upload/route.ts              # File upload
└── me/route.ts                  # Get current user info
```

## 🔐 Authentication

### Google OAuth
- **GET** `/api/auth/google` - Initiate Google OAuth login

### User Info
- **GET** `/api/me` - Get current user information

## 📄 Papers

### Paper Operations
- **GET** `/api/papers/[id]` - Get paper details by ID
- **GET** `/api/papers/search` - Search papers
- **GET** `/api/papers/popular` - Get popular papers
- **GET** `/api/papers/recent` - Get recent papers

### Paper Evaluations
- **GET** `/api/papers/[id]/evaluations` - Get paper evaluations
- **GET** `/api/papers/[id]/evaluations/statistics` - Get evaluation statistics

## 📊 Analysis

### Analysis Operations
- **POST** `/api/upload` - Upload PDF file for analysis
- **POST** `/api/start_analysis` - Start analysis task
- **GET** `/api/tasks` - Get user tasks
- **GET** `/api/active_tasks` - Get active tasks
- **GET** `/api/task_detail` - Get task details
- **GET** `/api/analysis_result` - Get analysis results
- **POST** `/api/set_public` - Set task public/private status

## 📈 Feed

### Public Feed
- **GET** `/api/feed/public` - Get public analysis feed

### Interactions
- **POST** `/api/like` - Like a task
- **POST** `/api/unlike` - Unlike a task
- **POST** `/api/comment` - Comment on a task

## 📝 Evaluations

### Evaluation Management
- **GET** `/api/evaluations` - Get evaluations list
- **POST** `/api/evaluations` - Create new evaluation
- **GET** `/api/evaluations/[id]` - Get evaluation details
- **PUT** `/api/evaluations/[id]` - Update evaluation
- **DELETE** `/api/evaluations/[id]` - Delete evaluation
- **POST** `/api/evaluations/[id]/like` - Like evaluation
- **GET** `/api/evaluations/my` - Get my evaluations
- **GET** `/evaluations/top` - Get top evaluations
- **GET** `/evaluations/search` - Search evaluations

## 📋 Response Format

All API responses follow this format:

```typescript
{
  code: number;     // 0 for success, non-zero for error
  message: string;  // Response message
  data?: any;       // Response data (for successful requests)
}
```

## 🔒 Error Handling

All routes include proper error handling with appropriate HTTP status codes:

- `400` - Bad Request (missing/invalid parameters)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

## 🚀 Features

### ✅ Implemented Features
- **User Authentication**: Google OAuth integration
- **File Upload**: PDF upload with validation
- **Paper Management**: CRUD operations for papers
- **Analysis System**: Complete analysis workflow
- **Evaluation System**: Multi-dimensional paper evaluation
- **Feed System**: Public feed with sorting options
- **Interaction System**: Likes, comments, shares
- **Search Functionality**: Paper and evaluation search
- **Statistics**: Comprehensive analytics and metrics

### 🔄 Migration Status
- All Vue.js API endpoints have been migrated to Next.js API routes
- Response formats are consistent with the original Vue.js application
- Mock data is provided for development and testing
- Proper error handling and validation implemented
- TypeScript types for all request/response data

### 🛠️ Development Notes
- All routes use TypeScript for type safety
- Mock data is provided for development purposes
- In production, these routes would connect to a real database
- File upload functionality includes proper validation
- Authentication middleware would be added in production

## 📝 Usage Examples

### Get Current User
```javascript
const response = await fetch('/api/me');
const data = await response.json();
```

### Upload Paper
```javascript
const formData = new FormData();
formData.append('file', pdfFile);
const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData
});
```

### Search Papers
```javascript
const response = await fetch('/api/papers/search?q=machine+learning&page=1&pageSize=10');
const data = await response.json();
```

### Get Analysis Result
```javascript
const response = await fetch('/api/analysis_result?task_id=123');
const data = await response.json();
```

## 🔄 Next Steps

1. **Database Integration**: Replace mock data with real database connections
2. **Authentication Middleware**: Add proper authentication checks
3. **File Storage**: Implement real file storage (AWS S3, local storage, etc.)
4. **Background Jobs**: Implement async analysis processing
5. **Rate Limiting**: Add API rate limiting
6. **Caching**: Implement response caching
7. **Monitoring**: Add API monitoring and logging