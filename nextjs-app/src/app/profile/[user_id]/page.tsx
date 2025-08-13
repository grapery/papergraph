'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@/hooks/useAuth';
import { useAuth } from '@/hooks/useAuth';
import { useAppStore } from '@/store';
import { activityApi } from '@/lib/api';
import ActivityFeed from '@/components/ActivityFeed';
import { 
  formatDate, 
  formatTime, 
  getUserTitle, 
  getFieldLabel, 
  getBadgeIcon, 
  getRarityLabel, 
  getActivityIcon 
} from '@/lib/utils';
import { 
  Edit, 
  Mail, 
  Send, 
  Share2, 
  FileText, 
  Users, 
  Heart, 
  BookOpen, 
  Trophy,
  Plus,
  Settings,
  MessageCircle,
  User as UserIcon
} from 'lucide-react';

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user: currentUser } = useAuth();
  const { user, stats, badges, activities, loading } = useUser(Number(params.user_id));
  const { setLoading, setError } = useAppStore();
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    institution: '',
    position: '',
    field: '',
    bio: '',
  });
  const [activityStats, setActivityStats] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const isOwnProfile = currentUser?.id === Number(params.user_id);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    if (user) {
      loadActivityStats();
    }
    
    // Check URL params for tab
    const tab = searchParams.get('tab');
    if (tab && ['overview', 'activities', 'badges'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [user, searchParams]);

  const loadActivityStats = async () => {
    try {
      const stats = await activityApi.getUserStats(Number(params.user_id));
      setActivityStats(stats);
    } catch (error) {
      console.error('Failed to load activity stats:', error);
    }
  };

  const positions = [
    { value: 'undergraduate', label: '本科生' },
    { value: 'master', label: '硕士研究生' },
    { value: 'phd', label: '博士研究生' },
    { value: 'postdoc', label: '博士后' },
    { value: 'assistant_professor', label: '助理教授' },
    { value: 'associate_professor', label: '副教授' },
    { value: 'professor', label: '教授' },
    { value: 'researcher', label: '研究员' },
    { value: 'other', label: '其他' },
  ];

  const fields = [
    { value: 'cs-ai', label: '人工智能' },
    { value: 'cs-system', label: '计算机系统' },
    { value: 'bio-med', label: '生物医学' },
    { value: 'physics', label: '物理学' },
    { value: 'chemistry', label: '化学' },
    { value: 'math', label: '数学' },
    { value: 'economics', label: '经济学' },
    { value: 'env-science', label: '环境科学' },
    { value: 'other', label: '其他' },
  ];

  const handleEditProfile = () => {
    if (user) {
      setEditForm({
        name: user.name || '',
        email: user.email || user.gmail || '',
        institution: user.institution || '',
        position: user.position || '',
        field: user.field || '',
        bio: user.bio || '',
      });
      setShowEditModal(true);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      // Mock save operation
      setShowEditModal(false);
      // In real app, this would call an API
    } catch (error) {
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">用户不存在</h1>
          <button
            onClick={() => router.push('/home')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Profile Header */}
      <div className="relative h-96 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        <div className="relative max-w-6xl mx-auto px-4 h-full flex items-end pb-8">
          <div className="flex items-end gap-8">
            <div className="relative">
              <div className="w-32 h-32 bg-white rounded-full border-4 border-white shadow-lg">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center text-3xl font-bold text-gray-600">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              {isOwnProfile && (
                <button
                  onClick={handleEditProfile}
                  className="absolute bottom-0 right-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center border-4 border-white shadow-lg hover:bg-blue-700"
                >
                  <Edit className="w-5 h-5 text-white" />
                </button>
              )}
            </div>
            
            <div className="flex-1 text-white">
              <h1 className="text-4xl font-bold mb-2">{user.name || '未设置姓名'}</h1>
              <p className="text-lg opacity-90 mb-4">{getUserTitle(user.position)}</p>
              
              <div className="flex flex-wrap gap-4 text-sm opacity-80">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>{user.email || user.gmail || '未设置邮箱'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4" />
                  <span>{user.institution || '未设置机构'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>{getFieldLabel(user.field)}</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              {isOwnProfile ? (
                <button
                  onClick={handleEditProfile}
                  className="bg-white text-blue-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                  编辑资料
                </button>
              ) : (
                <>
                  <button
                    onClick={handleFollow}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                      isFollowing
                        ? 'bg-white text-blue-600 hover:bg-gray-100'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {isFollowing ? '已关注' : '关注'}
                  </button>
                  <button className="bg-white/20 text-white px-6 py-2 rounded-lg font-medium hover:bg-white/30 transition-colors backdrop-blur-sm">
                    <Send className="w-4 h-4 inline mr-2" />
                    私信
                  </button>
                </>
              )}
              <button className="bg-white/20 text-white px-6 py-2 rounded-lg font-medium hover:bg-white/30 transition-colors backdrop-blur-sm">
                <Share2 className="w-4 h-4 inline mr-2" />
                分享
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-lg p-6 text-center shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <FileText className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{stats?.analyses || 0}</div>
            <div className="text-sm text-gray-600">分析数量</div>
          </div>
          
          <div className="bg-white rounded-lg p-6 text-center shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{stats?.followers || 0}</div>
            <div className="text-sm text-gray-600">粉丝</div>
          </div>
          
          <div className="bg-white rounded-lg p-6 text-center shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{stats?.following || 0}</div>
            <div className="text-sm text-gray-600">关注</div>
          </div>
          
          <div className="bg-white rounded-lg p-6 text-center shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <Heart className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{stats?.likes || 0}</div>
            <div className="text-sm text-gray-600">获赞</div>
          </div>
          
          <div className="bg-white rounded-lg p-6 text-center shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <BookOpen className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{stats?.citations || 0}</div>
            <div className="text-sm text-gray-600">引用数</div>
          </div>
          
          <div className="bg-white rounded-lg p-6 text-center shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <Trophy className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{stats?.badges || 0}</div>
            <div className="text-sm text-gray-600">奖章</div>
          </div>
        </div>

        {/* Activity Stats */}
        {activityStats && (
          <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">活动统计</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{activityStats.total || 0}</p>
                <p className="text-sm text-gray-600">总活动数</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{activityStats.recent_7_days || 0}</p>
                <p className="text-sm text-gray-600">近7天</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{activityStats.paper_analyzed || 0}</p>
                <p className="text-sm text-gray-600">分析论文</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">{activityStats.evaluation_created || 0}</p>
                <p className="text-sm text-gray-600">创建评价</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                概览
              </button>
              <button
                onClick={() => setActiveTab('activities')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'activities'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                动态
              </button>
              <button
                onClick={() => setActiveTab('badges')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'badges'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                徽章 ({badges.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
            {/* Bio Section */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">个人简介</h2>
              {user.bio ? (
                <p className="text-gray-700 leading-relaxed">{user.bio}</p>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-4">这个人很懒，什么都没有写...</div>
                  {isOwnProfile && (
                    <button
                      onClick={handleEditProfile}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                      添加简介
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Research Interests */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">研究兴趣</h2>
              {user.interests && user.interests.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {user.interests.map((interest, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-4">暂无研究兴趣标签</div>
                  {isOwnProfile && (
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                      <Plus className="w-4 h-4 inline mr-2" />
                      添加兴趣
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">最近活动</h2>
              {activities.length > 0 ? (
                <div className="space-y-4">
                  {activities.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg">
                      <div className="text-2xl">{getActivityIcon(activity.type)}</div>
                      <div className="flex-1">
                        <p className="text-gray-900">{activity.content}</p>
                        <p className="text-sm text-gray-500 mt-1">{formatTime(activity.created_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-4">暂无活动记录</div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Achievements */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">成就奖章</h2>
              {badges.length > 0 ? (
                <div className="space-y-4">
                  {badges.map((badge) => (
                    <div key={badge.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg">
                      <div className="text-2xl">{getBadgeIcon(badge.type)}</div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{badge.name}</h3>
                        <p className="text-sm text-gray-600">{badge.description}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-gray-500">{formatDate(badge.created_at)}</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            badge.rarity === 'common' ? 'bg-gray-100 text-gray-600' :
                            badge.rarity === 'rare' ? 'bg-blue-100 text-blue-600' :
                            badge.rarity === 'epic' ? 'bg-purple-100 text-purple-600' :
                            'bg-yellow-100 text-yellow-600'
                          }`}>
                            {getRarityLabel(badge.rarity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🏆</div>
                  <div className="text-gray-400 mb-4">暂无成就奖章</div>
                  {isOwnProfile && (
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                      开始分析获得奖章
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        )}

        {/* Activities Tab */}
        {activeTab === 'activities' && (
          <ActivityFeed userId={Number(params.user_id)} showFilters={true} />
        )}

        {/* Badges Tab */}
        {activeTab === 'badges' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">获得的徽章</h2>
            {badges.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {badges.map((badge) => (
                  <div key={badge.id} className="bg-gray-50 rounded-lg p-6 text-center hover:shadow-md transition-shadow">
                    <div className="text-4xl mb-3">{getBadgeIcon(badge.type)}</div>
                    <h3 className="font-semibold text-gray-900 mb-2">{badge.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{badge.description}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">{formatDate(badge.created_at)}</span>
                      <span className={`px-2 py-1 rounded-full ${
                        badge.rarity === 'common' ? 'bg-gray-100 text-gray-600' :
                        badge.rarity === 'rare' ? 'bg-blue-100 text-blue-600' :
                        badge.rarity === 'epic' ? 'bg-purple-100 text-purple-600' :
                        'bg-yellow-100 text-yellow-600'
                      }`}>
                        {getRarityLabel(badge.rarity)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🏆</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">还没有获得任何徽章</h3>
                <p className="text-gray-600 mb-4">开始分析论文来获得你的第一个徽章吧</p>
                {isOwnProfile && (
                  <button 
                    onClick={() => router.push('/dashboard')}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    开始分析
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold">编辑个人资料</h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">任职机构</label>
                <input
                  type="text"
                  value={editForm.institution}
                  onChange={(e) => setEditForm(prev => ({ ...prev, institution: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">职位</label>
                  <select
                    value={editForm.position}
                    onChange={(e) => setEditForm(prev => ({ ...prev, position: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">请选择职位</option>
                    {positions.map((pos) => (
                      <option key={pos.value} value={pos.value}>{pos.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">研究领域</label>
                  <select
                    value={editForm.field}
                    onChange={(e) => setEditForm(prev => ({ ...prev, field: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">请选择领域</option>
                    {fields.map((field) => (
                      <option key={field.value} value={field.value}>{field.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">个人简介</label>
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                取消
              </button>
              <button
                onClick={handleSaveProfile}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}