import { createActivity, EVENT_TYPES, TARGET_TYPES } from '@/lib/api';

/**
 * 用户活动事件记录hook
 * 用于在用户执行各种操作时自动记录活动事件
 */
export const useActivityTracker = () => {
  /**
   * 记录论文分析事件
   */
  const trackPaperAnalysis = async (paperId: number, paperTitle: string, analysisId?: number) => {
    try {
      await createActivity(
        EVENT_TYPES.PAPER_ANALYZED,
        TARGET_TYPES.PAPER,
        paperId,
        `分析了论文《${paperTitle}》`,
        `使用AI工具对论文《${paperTitle}》进行了多维度分析评价`,
        {
          analysis_id: analysisId,
          paper_title: paperTitle,
          analysis_method: 'ai_evaluation'
        }
      );
    } catch (error) {
      console.error('Failed to track paper analysis:', error);
    }
  };

  /**
   * 记录论文点赞事件
   */
  const trackPaperLike = async (paperId: number, paperTitle: string) => {
    try {
      await createActivity(
        EVENT_TYPES.PAPER_LIKED,
        TARGET_TYPES.PAPER,
        paperId,
        `点赞了论文《${paperTitle}》`,
        `认为论文《${paperTitle}》很有价值`,
        {
          paper_title: paperTitle,
          interaction_type: 'like'
        }
      );
    } catch (error) {
      console.error('Failed to track paper like:', error);
    }
  };

  /**
   * 记录论文推荐事件
   */
  const trackPaperRecommendation = async (paperId: number, paperTitle: string, reason?: string) => {
    try {
      await createActivity(
        EVENT_TYPES.PAPER_RECOMMENDED,
        TARGET_TYPES.PAPER,
        paperId,
        `推荐了论文《${paperTitle}》`,
        reason || `推荐阅读论文《${paperTitle}》，内容很有价值`,
        {
          paper_title: paperTitle,
          recommendation_reason: reason
        }
      );
    } catch (error) {
      console.error('Failed to track paper recommendation:', error);
    }
  };

  /**
   * 记录评价创建事件
   */
  const trackEvaluationCreation = async (evaluationId: number, paperId: number, paperTitle: string, overallScore: number) => {
    try {
      await createActivity(
        EVENT_TYPES.EVALUATION_CREATED,
        TARGET_TYPES.EVALUATION,
        evaluationId,
        `创建了论文评价`,
        `对论文《${paperTitle}》给出了${overallScore.toFixed(1)}分的综合评价`,
        {
          evaluation_id: evaluationId,
          paper_id: paperId,
          paper_title: paperTitle,
          overall_score: overallScore
        }
      );
    } catch (error) {
      console.error('Failed to track evaluation creation:', error);
    }
  };

  /**
   * 记录评价点赞事件
   */
  const trackEvaluationLike = async (evaluationId: number, paperTitle: string) => {
    try {
      await createActivity(
        EVENT_TYPES.EVALUATION_LIKED,
        TARGET_TYPES.EVALUATION,
        evaluationId,
        `点赞了论文评价`,
        `认同对论文《${paperTitle}》的评价`,
        {
          evaluation_id: evaluationId,
          paper_title: paperTitle,
          interaction_type: 'like'
        }
      );
    } catch (error) {
      console.error('Failed to track evaluation like:', error);
    }
  };

  /**
   * 记录评论发表事件
   */
  const trackCommentCreation = async (commentId: number, targetType: string, targetId: number, content: string) => {
    try {
      await createActivity(
        EVENT_TYPES.COMMENT_CREATED,
        TARGET_TYPES.COMMENT,
        commentId,
        `发表了评论`,
        content.length > 100 ? content.substring(0, 100) + '...' : content,
        {
          comment_id: commentId,
          target_type: targetType,
          target_id: targetId,
          comment_length: content.length
        }
      );
    } catch (error) {
      console.error('Failed to track comment creation:', error);
    }
  };

  /**
   * 记录分析完成事件
   */
  const trackAnalysisCompletion = async (analysisId: number, paperId: number, paperTitle: string, score: number) => {
    try {
      await createActivity(
        EVENT_TYPES.ANALYSIS_COMPLETED,
        TARGET_TYPES.ANALYSIS,
        analysisId,
        `完成了论文分析`,
        `完成了对论文《${paperTitle}》的AI分析，综合评分${score.toFixed(1)}分`,
        {
          analysis_id: analysisId,
          paper_id: paperId,
          paper_title: paperTitle,
          final_score: score
        }
      );
    } catch (error) {
      console.error('Failed to track analysis completion:', error);
    }
  };

  /**
   * 记录获得徽章事件
   */
  const trackBadgeEarned = async (badgeId: number, badgeName: string, badgeDescription: string) => {
    try {
      await createActivity(
        EVENT_TYPES.BADGE_EARNED,
        TARGET_TYPES.BADGE,
        badgeId,
        `获得了徽章《${badgeName}》`,
        badgeDescription,
        {
          badge_id: badgeId,
          badge_name: badgeName,
          badge_type: 'achievement'
        }
      );
    } catch (error) {
      console.error('Failed to track badge earned:', error);
    }
  };

  /**
   * 记录用户关注事件
   */
  const trackUserFollow = async (targetUserId: number, targetUserName: string) => {
    try {
      await createActivity(
        EVENT_TYPES.FOLLOW_USER,
        TARGET_TYPES.USER,
        targetUserId,
        `关注了用户${targetUserName}`,
        `开始关注用户${targetUserName}的动态`,
        {
          target_user_id: targetUserId,
          target_user_name: targetUserName,
          interaction_type: 'follow'
        }
      );
    } catch (error) {
      console.error('Failed to track user follow:', error);
    }
  };

  /**
   * 记录自定义事件
   */
  const trackCustomEvent = async (
    eventType: string,
    targetType: string,
    targetId: number,
    title?: string,
    content?: string,
    metadata?: Record<string, any>
  ) => {
    try {
      await createActivity(eventType, targetType, targetId, title, content, metadata);
    } catch (error) {
      console.error('Failed to track custom event:', error);
    }
  };

  return {
    trackPaperAnalysis,
    trackPaperLike,
    trackPaperRecommendation,
    trackEvaluationCreation,
    trackEvaluationLike,
    trackCommentCreation,
    trackAnalysisCompletion,
    trackBadgeEarned,
    trackUserFollow,
    trackCustomEvent,
  };
};