import { 
  Article, 
  Tag, 
  ArticleTag, 
  ArticleAnalysis, 
  ArticleSearchFilters, 
  ArticleSearchResult,
  AuthorStats 
} from '@/types/article';

// Mock article database for development
export class MockArticleDatabase {
  private static instance: MockArticleDatabase;
  private articles: Map<number, Article> = new Map();
  private tags: Map<number, Tag> = new Map();
  private articleTags: ArticleTag[] = [];
  private analyses: Map<number, ArticleAnalysis> = new Map();
  private nextId = 1;
  private nextTagId = 1;

  static getInstance(): MockArticleDatabase {
    if (!MockArticleDatabase.instance) {
      MockArticleDatabase.instance = new MockArticleDatabase();
      MockArticleDatabase.instance.initializeDefaultTags();
    }
    return MockArticleDatabase.instance;
  }

  // Initialize default tags
  private initializeDefaultTags() {
    const defaultTags = [
      { name: '深度学习', description: '基于神经网络的学习方法', color: '#3B82F6', category: 'method' },
      { name: '自然语言处理', description: '文本理解和生成技术', color: '#10B981', category: 'domain' },
      { name: '计算机视觉', description: '图像和视频处理技术', color: '#F59E0B', category: 'domain' },
      { name: '强化学习', description: '基于奖励的学习方法', color: '#EF4444', category: 'method' },
      { name: 'Transformer', description: '注意力机制架构', color: '#8B5CF6', category: 'technique' },
      { name: 'BERT', description: '双向编码器表示', color: '#06B6D4', category: 'technique' },
      { name: 'GPT', description: '生成式预训练变换器', color: '#F97316', category: 'technique' },
      { name: '图像识别', description: '图像分类和识别', color: '#84CC16', category: 'application' },
      { name: '机器翻译', description: '自动语言翻译', color: '#EC4899', category: 'application' },
      { name: '推荐系统', description: '个性化推荐技术', color: '#6366F1', category: 'application' },
    ];

    defaultTags.forEach(tag => {
      this.createTag(tag);
    });
  }

  // Article operations
  createArticle(articleData: Omit<Article, 'id' | 'createdAt' | 'updatedAt' | 'stats'>): Article {
    const article: Article = {
      id: this.nextId++,
      ...articleData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stats: {
        views: 0,
        downloads: 0,
        shares: 0,
        citations: 0,
      }
    };
    
    this.articles.set(article.id, article);
    return article;
  }

  getArticle(id: number): Article | null {
    return this.articles.get(id) || null;
  }

  getArticleByUrl(url: string): Article | null {
    const articles = Array.from(this.articles.values());
    return articles.find(article => article.url === url) || null;
  }

  updateArticle(id: number, updates: Partial<Article>): Article | null {
    const article = this.articles.get(id);
    if (article) {
      const updatedArticle = {
        ...article,
        ...updates,
        updatedAt: new Date().toISOString()
      };
      this.articles.set(id, updatedArticle);
      return updatedArticle;
    }
    return null;
  }

  deleteArticle(id: number): boolean {
    return this.articles.delete(id);
  }

  getAllArticles(): Article[] {
    return Array.from(this.articles.values());
  }

  // Tag operations
  createTag(tagData: Omit<Tag, 'id' | 'usageCount' | 'createdAt'>): Tag {
    const tag: Tag = {
      id: this.nextTagId++,
      ...tagData,
      usageCount: 0,
      createdAt: new Date().toISOString()
    };
    
    this.tags.set(tag.id, tag);
    return tag;
  }

  getTag(id: number): Tag | null {
    return this.tags.get(id) || null;
  }

  getTagByName(name: string): Tag | null {
    const tags = Array.from(this.tags.values());
    return tags.find(tag => tag.name.toLowerCase() === name.toLowerCase()) || null;
  }

  getAllTags(): Tag[] {
    return Array.from(this.tags.values());
  }

  getTagsByCategory(category: string): Tag[] {
    const tags = Array.from(this.tags.values());
    return tags.filter(tag => tag.category === category);
  }

  updateTagUsage(tagId: number, increment: number = 1): Tag | null {
    const tag = this.tags.get(tagId);
    if (tag) {
      tag.usageCount = Math.max(0, tag.usageCount + increment);
      this.tags.set(tagId, tag);
      return tag;
    }
    return null;
  }

  deleteTag(tagId: number): boolean {
    // Remove all article-tag associations
    this.articleTags = this.articleTags.filter(at => at.tagId !== tagId);
    // Remove the tag
    return this.tags.delete(tagId);
  }

  // Article-Tag operations
  addTagToArticle(articleId: number, tagId: number, confidence: number = 1.0): ArticleTag | null {
    // Check if article and tag exist
    if (!this.articles.has(articleId) || !this.tags.has(tagId)) {
      return null;
    }

    // Check if tag already exists for article
    const existing = this.articleTags.find(at => at.articleId === articleId && at.tagId === tagId);
    if (existing) {
      return existing;
    }

    const articleTag: ArticleTag = {
      id: this.articleTags.length + 1,
      articleId,
      tagId,
      confidence,
      createdAt: new Date().toISOString()
    };

    this.articleTags.push(articleTag);
    
    // Update tag usage count
    this.updateTagUsage(tagId, 1);
    
    return articleTag;
  }

  removeTagFromArticle(articleId: number, tagId: number): boolean {
    const index = this.articleTags.findIndex(at => at.articleId === articleId && at.tagId === tagId);
    if (index >= 0) {
      this.articleTags.splice(index, 1);
      this.updateTagUsage(tagId, -1);
      return true;
    }
    return false;
  }

  getArticleTags(articleId: number): Tag[] {
    const tagIds = this.articleTags
      .filter(at => at.articleId === articleId)
      .map(at => at.tagId);
    
    return Array.from(this.tags.values())
      .filter(tag => tagIds.includes(tag.id));
  }

  // Search operations
  searchArticles(filters: ArticleSearchFilters): ArticleSearchResult {
    let articles = Array.from(this.articles.values());
    
    // Filter by author
    if (filters.author) {
      articles = articles.filter(article => 
        article.authors.some(author => 
          author.toLowerCase().includes(filters.author!.toLowerCase())
        ) || article.authorString.toLowerCase().includes(filters.author!.toLowerCase())
      );
    }

    // Filter by tags
    if (filters.tags && filters.tags.length > 0) {
      articles = articles.filter(article => {
        const articleTagIds = this.articleTags
          .filter(at => at.articleId === article.id)
          .map(at => at.tagId);
        
        const articleTags = Array.from(this.tags.values())
          .filter(tag => articleTagIds.includes(tag.id))
          .map(tag => tag.name);
        
        return filters.tags!.some(tag => 
          articleTags.some(articleTag => 
            articleTag.toLowerCase().includes(tag.toLowerCase())
          )
        );
      });
    }

    // Filter by category
    if (filters.category) {
      articles = articles.filter(article => 
        article.category === filters.category
      );
    }

    // Filter by year
    if (filters.year) {
      articles = articles.filter(article => {
        if (filters.year!.start && article.publishYear < filters.year!.start) {
          return false;
        }
        if (filters.year!.end && article.publishYear > filters.year!.end) {
          return false;
        }
        return true;
      });
    }

    // Filter by language
    if (filters.language) {
      articles = articles.filter(article => 
        article.language === filters.language
      );
    }

    // Sort
    const sortBy = filters.sortBy || 'date';
    const sortOrder = filters.sortOrder || 'desc';
    
    articles.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.publishDate).getTime();
          bValue = new Date(b.publishDate).getTime();
          break;
        case 'score':
          aValue = this.getArticleAverageScore(a.id) || 0;
          bValue = this.getArticleAverageScore(b.id) || 0;
          break;
        case 'citations':
          aValue = a.stats.citations;
          bValue = b.stats.citations;
          break;
        case 'views':
          aValue = a.stats.views;
          bValue = b.stats.views;
          break;
        default:
          aValue = a.id;
          bValue = b.id;
      }
      
      if (sortOrder === 'desc') {
        return bValue > aValue ? 1 : bValue < aValue ? -1 : 0;
      } else {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      }
    });

    // Pagination
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const total = articles.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    const paginatedArticles = articles.slice(startIndex, endIndex);

    return {
      articles: paginatedArticles,
      total,
      page,
      limit,
      totalPages,
      filters
    };
  }

  // Author statistics
  getAuthorStats(authorName: string): AuthorStats | null {
    const articles = Array.from(this.articles.values()).filter(article =>
      article.authors.some(author => 
        author.toLowerCase().includes(authorName.toLowerCase())
      )
    );

    if (articles.length === 0) {
      return null;
    }

    const totalCitations = articles.reduce((sum, article) => sum + article.stats.citations, 0);
    const averageScore = articles.reduce((sum, article) => {
      const score = this.getArticleAverageScore(article.id) || 0;
      return sum + score;
    }, 0) / articles.length;

    // Get top categories
    const categoryCount = new Map<string, number>();
    articles.forEach(article => {
      if (article.category) {
        categoryCount.set(article.category, (categoryCount.get(article.category) || 0) + 1);
      }
    });
    const topCategories = Array.from(categoryCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category]) => category);

    // Get top tags
    const tagCount = new Map<string, number>();
    articles.forEach(article => {
      const articleTags = this.getArticleTags(article.id);
      articleTags.forEach(tag => {
        tagCount.set(tag.name, (tagCount.get(tag.name) || 0) + 1);
      });
    });
    const topTags = Array.from(tagCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag]) => tag);

    const latestArticle = articles
      .sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime())[0];

    return {
      name: authorName,
      articleCount: articles.length,
      totalCitations,
      averageScore: Math.round(averageScore * 100) / 100,
      topCategories,
      topTags,
      latestArticle: latestArticle.title
    };
  }

  // Helper methods
  private getArticleAverageScore(articleId: number): number | null {
    const analysis = Array.from(this.analyses.values()).find(a => a.articleId === articleId);
    return analysis ? analysis.overallScore : null;
  }

  // Analysis operations
  createAnalysis(analysisData: Omit<ArticleAnalysis, 'id' | 'createdAt' | 'updatedAt'>): ArticleAnalysis {
    const analysis: ArticleAnalysis = {
      id: this.analyses.size + 1,
      ...analysisData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.analyses.set(analysis.id, analysis);
    return analysis;
  }

  getArticleAnalysis(articleId: number): ArticleAnalysis | null {
    const analysis = Array.from(this.analyses.values()).find(a => a.articleId === articleId);
    return analysis || null;
  }

  // Clear all data (for testing)
  clear() {
    this.articles.clear();
    this.tags.clear();
    this.articleTags = [];
    this.analyses.clear();
    this.nextId = 1;
    this.nextTagId = 1;
    this.initializeDefaultTags();
  }
}

export const mockArticleDb = MockArticleDatabase.getInstance();