'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useAppStore } from '@/store';
import { cn } from '@/lib/utils';
import { 
  Mail, 
  Lock, 
  User, 
  Building, 
  GraduationCap, 
  Eye,
  EyeOff,
  Chrome,
  Github
} from 'lucide-react';

type AuthMode = 'login' | 'register';

export default function AuthPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { setLoading, setError } = useAppStore();
  
  const [mode, setMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    institution: '',
    position: '',
    field: '',
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const endpoint = '/api/auth';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          action: mode === 'login' ? 'login' : 'register'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        login(data.data.user, data.data.token);
        router.push('/home');
      } else {
        setError(data.error || `${mode === 'login' ? '登录' : '注册'}失败，请稍后重试`);
      }
    } catch (error) {
      console.error('Auth error:', error);
      setError('服务器错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Redirect to Google OAuth
    window.location.href = '/api/auth/google';
  };

  const handleGithubLogin = () => {
    // Redirect to GitHub OAuth
    window.location.href = '/api/auth/github';
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl w-full">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Left Side - Form */}
            <div className="p-8 md:p-12">
              <div className="max-w-md mx-auto">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    {mode === 'login' ? '登录账户' : '注册账户'}
                  </h2>
                  <p className="text-gray-600">
                    {mode === 'login' 
                      ? '欢迎回来！请输入您的登录信息'
                      : '创建新账户，开始您的学术之旅'
                    }
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {mode === 'register' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        姓名
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => updateFormData('name', e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="请输入您的姓名"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      邮箱地址
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => updateFormData('email', e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="请输入您的邮箱"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      密码
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={formData.password}
                        onChange={(e) => updateFormData('password', e.target.value)}
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="请输入您的密码"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {mode === 'register' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          任职机构
                        </label>
                        <div className="relative">
                          <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="text"
                            value={formData.institution}
                            onChange={(e) => updateFormData('institution', e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="请输入您的学校或机构名称"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            职位
                          </label>
                          <div className="relative">
                            <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <select
                              value={formData.position}
                              onChange={(e) => updateFormData('position', e.target.value)}
                              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                            >
                              <option value="">请选择职位</option>
                              {positions.map((pos) => (
                                <option key={pos.value} value={pos.value}>
                                  {pos.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            研究领域
                          </label>
                          <div className="relative">
                            <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <select
                              value={formData.field}
                              onChange={(e) => updateFormData('field', e.target.value)}
                              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                            >
                              <option value="">请选择领域</option>
                              {fields.map((field) => (
                                <option key={field.value} value={field.value}>
                                  {field.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    {mode === 'login' ? '登录' : '注册'}
                  </button>
                </form>

                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">或</span>
                    </div>
                  </div>

                  <button
                    onClick={handleGoogleLogin}
                    className="w-full mt-4 bg-white border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center gap-2"
                  >
                    <Chrome className="w-5 h-5" />
                    使用 Google 账户登录
                  </button>

                  <button
                    onClick={handleGithubLogin}
                    className="w-full mt-3 bg-white border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center gap-2"
                  >
                    <Github className="w-5 h-5" />
                    使用 GitHub 账户登录
                  </button>
                </div>

                <div className="mt-6 text-center space-y-2">
                  {mode === 'login' && (
                    <Link
                      href="/forgot-password"
                      className="block text-sm text-blue-600 hover:text-blue-700"
                    >
                      忘记密码？
                    </Link>
                  )}
                  
                  <button
                    onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {mode === 'login' 
                      ? '还没有账户？立即注册'
                      : '已有账户？立即登录'
                    }
                  </button>
                </div>
              </div>
            </div>

            {/* Right Side - Hero */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-8 md:p-12 text-white flex flex-col justify-center">
              <div className="max-w-md mx-auto">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="w-8 h-8 bg-white rounded"></div>
                  </div>
                  <h1 className="text-3xl font-bold mb-4">Papergraph</h1>
                  <p className="text-lg opacity-90">
                    学术论文排行榜平台
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">多维度评价</h3>
                      <p className="text-sm opacity-80">
                        基于创新性、方法论、影响力等六个维度的综合评价体系
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">实时排名</h3>
                      <p className="text-sm opacity-80">
                        热门趋势、本周最佳、历史经典等多种排名方式
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">学术社区</h3>
                      <p className="text-sm opacity-80">
                        与同行交流，分享见解，建立学术联系
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}