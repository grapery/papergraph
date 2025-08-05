/**
 * 模拟数据配置（开发测试用）
 */

// 模拟用户数据
export const mockUser = {
  id: 1,
  name: '测试用户',
  gmail: 'test@example.com',
  avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=1'
}

// 模拟任务数据
export const mockTasks = [
  {
    ID: 1,
    Title: 'Advancements in Natural Language Processing',
    Status: 'Analyzing',
    CreatedAt: '2024-01-15T10:30:00Z'
  },
  {
    ID: 2,
    Title: 'A Novel Approach to Image Recognition',
    Status: 'Processing',
    CreatedAt: '2024-01-14T15:20:00Z'
  },
  {
    ID: 3,
    Title: 'The Impact of Climate Change on Biodiversity',
    Status: 'Completed',
    CreatedAt: '2024-01-13T09:45:00Z'
  }
]

// 模拟分析数据
export const mockAnalyses = [
  {
    id: 1,
    title: 'Advancements in Natural Language Processing',
    date: '2024-01-15',
    summary: 'This paper explores recent breakthroughs in NLP, focusing on transformer models and their applications in text generation and sentiment analysis.'
  },
  {
    id: 2,
    title: 'A Novel Approach to Image Recognition',
    date: '2023-12-20',
    summary: 'This research introduces a new convolutional neural network architecture for image recognition, achieving state-of-the-art results on benchmark datasets.'
  },
  {
    id: 3,
    title: 'The Impact of Climate Change on Biodiversity',
    date: '2023-11-05',
    summary: 'This study examines the effects of climate change on various ecosystems, highlighting the importance of conservation efforts.'
  }
]

// 模拟公开分析数据
export const mockPublicFeeds = [
  {
    id: 1,
    title: 'Advancements in Quantum Computing',
    summary: 'This paper explores recent breakthroughs in quantum computing, focusing on new qubit designs and error correction techniques. The analysis highlights the potential impact on various fields, including cryptography and materials science.',
    image: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80',
    uploader: 'Dr. Sarah Chen',
    uploadDate: '2024-01-15T10:30:00Z',
    publicationDate: '2024-01-10T00:00:00Z',
    author: 'Dr. Michael Johnson',
    overallScore: '8.5/10'
  },
  {
    id: 2,
    title: 'The Role of AI in Climate Change Mitigation',
    summary: 'An in-depth analysis of how artificial intelligence can be applied to address climate change, covering areas such as renewable energy optimization, carbon capture, and climate modeling.',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
    uploader: 'Prof. David Wilson',
    uploadDate: '2024-01-14T15:20:00Z',
    publicationDate: '2024-01-08T00:00:00Z',
    author: 'Dr. Emily Rodriguez',
    overallScore: '7.8/10'
  },
  {
    id: 3,
    title: 'Exploring the Human Microbiome',
    summary: 'This analysis delves into a study on the human microbiome, examining its composition, functions, and influence on health and disease. Key findings and implications for personalized medicine are discussed.',
    image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80',
    uploader: 'Dr. Lisa Thompson',
    uploadDate: '2024-01-13T09:45:00Z',
    publicationDate: '2024-01-05T00:00:00Z',
    author: 'Prof. James Anderson',
    overallScore: '8.2/10'
  },
  {
    id: 4,
    title: 'The Future of Space Exploration',
    summary: 'A comprehensive analysis of current and future space exploration missions, including advancements in propulsion systems, habitat design, and the search for extraterrestrial life.',
    image: 'https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=400&q=80',
    uploader: 'Dr. Robert Kim',
    uploadDate: '2024-01-12T14:15:00Z',
    publicationDate: '2024-01-03T00:00:00Z',
    author: 'Dr. Maria Garcia',
    overallScore: '7.9/10'
  },
  {
    id: 5,
    title: 'Innovations in Sustainable Agriculture',
    summary: 'This paper analysis focuses on sustainable agriculture practices, exploring new technologies and methods for improving crop yields while minimizing environmental impact.',
    image: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=400&q=80',
    uploader: 'Prof. Amanda Lee',
    uploadDate: '2024-01-11T11:30:00Z',
    publicationDate: '2024-01-01T00:00:00Z',
    author: 'Dr. Thomas Brown',
    overallScore: '8.1/10'
  }
]

// 模拟登录功能
export function simulateLogin() {
  const mockToken = 'mock_token_' + Date.now()
  
  // 保存到 localStorage
  localStorage.setItem('auth_token', mockToken)
  localStorage.setItem('mock_user', JSON.stringify(mockUser))
  
  return { token: mockToken, user: mockUser }
}

// 检查模拟登录状态
export function checkMockLoginStatus() {
  const token = localStorage.getItem('auth_token')
  const mockUserData = localStorage.getItem('mock_user')
  
  if (token && mockUserData) {
    try {
      return JSON.parse(mockUserData)
    } catch (error) {
      console.error('解析模拟用户数据失败:', error)
      return null
    }
  }
  return null
}

// 模拟登出功能
export function simulateLogout() {
  localStorage.removeItem('auth_token')
  localStorage.removeItem('mock_user')
} 