<template>
  <div class="explore-page">
    <!-- 标题与副标题 -->
    <div class="explore-header">
      <h1 class="explore-title">Explore Analyses</h1>
      <div class="explore-desc">Discover insights from the community's paper analyses.</div>
    </div>
    <!-- Tab 切换 -->
    <ExploreTabs :activeTab="activeTab" @update:activeTab="activeTab = $event" />
    <!-- 分析卡片列表 -->
    <div v-if="feedList.length === 0" class="empty">暂无公开分析</div>
    <div v-else>
      <FeedCard v-for="item in feedList" :key="item.id" :item="item" />
    </div>
  </div>
</template>
<script setup>
// 声明类型
import { ref, computed } from 'vue'
import ExploreTabs from '../components/TopTabs.vue'
import FeedCard from '../components/FeedCard.vue'

// 静态模拟数据，后续可替换为接口数据
const allFeeds = [
  {
    id: 1,
    title: 'Advancements in Quantum Computing',
    summary: 'This paper explores recent breakthroughs in quantum computing, focusing on new qubit designs and error correction techniques. The analysis highlights the potential impact on various fields, including cryptography and materials science.',
    image: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 2,
    title: 'The Role of AI in Climate Change Mitigation',
    summary: 'An in-depth analysis of how artificial intelligence can be applied to address climate change, covering areas such as renewable energy optimization, carbon capture, and climate modeling.',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 3,
    title: 'Exploring the Human Microbiome',
    summary: 'This analysis delves into a study on the human microbiome, examining its composition, functions, and influence on health and disease. Key findings and implications for personalized medicine are discussed.',
    image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 4,
    title: 'The Future of Space Exploration',
    summary: 'A comprehensive analysis of current and future space exploration missions, including advancements in propulsion systems, habitat design, and the search for extraterrestrial life.',
    image: 'https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 5,
    title: 'Innovations in Sustainable Agriculture',
    summary: 'This paper analysis focuses on sustainable agriculture practices, exploring new technologies and methods for improving crop yields while minimizing environmental impact.',
    image: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=400&q=80'
  }
]
// Tab 状态
const activeTab = ref('latest')
// 根据 tab 过滤数据（此处全部返回静态数据，后续可扩展）
const feedList = computed(() => {
  // 可根据 activeTab 返回不同排序/筛选
  return allFeeds
})
</script>
<style scoped>
.explore-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 36px 0 0 0;
}
.explore-header {
  margin-bottom: 18px;
}
.explore-title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 6px;
  color: #222;
}
.explore-desc {
  color: #6b7280;
  font-size: 1.08rem;
  margin-bottom: 8px;
}
.empty {
  color: #888;
  text-align: center;
  margin: 48px 0;
}
</style> 