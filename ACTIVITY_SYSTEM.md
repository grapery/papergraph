# 用户活动事件系统

这个系统用于记录和展示用户在Papergraph平台上的各种活动事件，包括论文分析、点赞、评价、评论等。

## 功能特性

### 1. 活动事件类型
- **论文相关**: 分析论文、点赞论文、推荐论文、分享论文
- **分析相关**: 创建分析、更新分析、完成分析
- **评价相关**: 创建评价、更新评价、点赞评价
- **评论相关**: 发表评论、点赞评论、回复评论
- **系统事件**: 获得徽章、等级提升、关注用户

### 2. 数据库设计
- **user_activities**: 存储所有用户活动事件
- **索引优化**: 支持按用户、事件类型、时间等维度快速查询
- **软删除**: 支持活动事件的删除和恢复

### 3. API接口
- `POST /api/activities` - 创建活动事件
- `GET /api/activities` - 获取活动事件列表
- `GET /api/users/:user_id/activities` - 获取指定用户的活动
- `GET /api/feed` - 获取公开的活动流
- `GET /api/users/:user_id/activities/stats` - 获取用户活动统计

### 4. 前端组件
- **ActivityFeed**: 活动流展示组件
- **UserProfile**: 用户个人主页（包含活动展示）
- **useActivityTracker**: 活动追踪hook

## 使用方法

### 1. 记录活动事件

```typescript
import { useActivityTracker } from '@/hooks/useActivityTracker';

const { trackPaperAnalysis, trackPaperLike, trackEvaluationCreation } = useActivityTracker();

// 记录论文分析
await trackPaperAnalysis(paperId, paperTitle, analysisId);

// 记录论文点赞
await trackPaperLike(paperId, paperTitle);

// 记录评价创建
await trackEvaluationCreation(evaluationId, paperId, paperTitle, overallScore);
```

### 2. 直接使用API

```typescript
import { createActivity, EVENT_TYPES, TARGET_TYPES } from '@/lib/api';

// 创建自定义活动事件
await createActivity(
  EVENT_TYPES.PAPER_ANALYZED,
  TARGET_TYPES.PAPER,
  paperId,
  '分析了论文',
  '详细描述...',
  { metadata: 'additional data' }
);
```

### 3. 在组件中使用ActivityFeed

```typescript
import ActivityFeed from '@/components/ActivityFeed';

// 显示指定用户的活动
<ActivityFeed userId={123} showFilters={true} />

// 显示当前用户的活动
<ActivityFeed />

// 显示公开活动流
<ActivityFeed userId={undefined} />
```

## 集成示例

### 在论文分析完成时记录活动

```typescript
// 在分析完成后的回调中
const handleAnalysisComplete = async (analysisResult) => {
  // 保存分析结果
  await saveAnalysisResult(analysisResult);
  
  // 记录活动事件
  await trackAnalysisCompletion(
    analysisResult.id,
    analysisResult.paperId,
    analysisResult.paperTitle,
    analysisResult.overallScore
  );
};
```

### 在用户点赞时记录活动

```typescript
const handleLikePaper = async (paperId) => {
  // 执行点赞操作
  await likePaper(paperId);
  
  // 记录活动事件
  await trackPaperLike(paperId, paperTitle);
};
```

### 在发表评论时记录活动

```typescript
const handleCommentSubmit = async (commentData) => {
  // 保存评论
  const comment = await saveComment(commentData);
  
  // 记录活动事件
  await trackCommentCreation(
    comment.id,
    comment.targetType,
    comment.targetId,
    comment.content
  );
};
```

## 数据结构

### UserActivity接口
```typescript
interface UserActivity {
  id: number;
  user_id: number;
  user: User;
  event_type: string;
  target_type: string;
  target_id: number;
  title?: string;
  content?: string;
  metadata?: Record<string, any>;
  visibility: 'public' | 'private' | 'friends';
  like_count: number;
  comment_count: number;
  created_at: string;
  updated_at: string;
}
```

## 注意事项

1. **权限控制**: 用户只能创建自己的活动事件
2. **数据验证**: 所有活动事件都会进行数据验证
3. **性能优化**: 使用索引和分页来提高查询性能
4. **隐私设置**: 支持公开、私有、好友可见三种隐私设置

## 扩展功能

1. **实时通知**: 活动事件可以触发实时通知
2. **数据导出**: 支持导出用户活动数据
3. **活动分析**: 提供用户活动行为分析
4. **社交功能**: 基于活动事件的推荐系统