<template>
  <div class="my-analyses-page">
    <h1 class="title">My Analyses</h1>
    <div class="table-container">
      <table class="analyses-table">
        <thead>
          <tr>
            <th></th>
            <th>Paper Title</th>
            <th>Upload Date</th>
            <th>Analysis Summary</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in analyses" :key="item.id">
            <!-- 图标列，可用 emoji 或 SVG 占位 -->
            <td class="icon-cell">
              <span class="icon" :style="{ background: iconBg(item.id) }">{{ iconEmoji(item.id) }}</span>
            </td>
            <td>{{ item.title }}</td>
            <td class="date">{{ item.date }}</td>
            <td class="summary">{{ item.summary }}</td>
            <td class="actions">
              <a class="details-link" @click.prevent="viewDetails(item.id)">View Details</a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<script setup>
// 声明类型
import { ref } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
// 静态模拟数据，后续可替换为接口数据
const analyses = ref([
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
  },
  {
    id: 4,
    title: 'Machine Learning for Financial Forecasting',
    date: '2023-10-12',
    summary: 'This paper investigates the use of machine learning algorithms for predicting stock market trends and financial risk assessment.'
  },
  {
    id: 5,
    title: 'Quantum Computing and its Potential Applications',
    date: '2023-09-28',
    summary: 'This review article provides an overview of quantum computing, discussing its potential to revolutionize fields like cryptography and drug discovery.'
  }
])
// 图标 emoji 占位，后续可替换 SVG
function iconEmoji(id) {
  const icons = ['📄', '📕', '📗', '📘', '📑']
  return icons[(id - 1) % icons.length]
}
// 图标背景色
function iconBg(id) {
  const bgs = ['#e0ece6', '#ffe5db', '#dbeafe', '#e0e7ef', '#e7f5e6']
  return bgs[(id - 1) % bgs.length]
}
// 跳转到分析详情页
function viewDetails(id) {
  router.push(`/paper-report/${id}`)
}
</script>
<style scoped>
.my-analyses-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 0 0 0;
}
.title {
  font-size: 2.1rem;
  font-weight: bold;
  margin-bottom: 28px;
  color: #222;
}
.table-container {
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 2px 8px 0 #f3f4f6;
  padding: 0;
  overflow-x: auto;
}
.analyses-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 1.04rem;
}
.analyses-table th, .analyses-table td {
  padding: 18px 18px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
  vertical-align: top;
}
.analyses-table th {
  background: #f9fafb;
  color: #6b7280;
  font-weight: 600;
  font-size: 1.01rem;
}
.analyses-table tr:last-child td {
  border-bottom: none;
}
.icon-cell {
  width: 56px;
  text-align: center;
}
.icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  font-size: 1.5rem;
  background: #e0ece6;
  margin-right: 0;
}
.date {
  color: #2563eb;
  font-weight: 500;
  white-space: nowrap;
}
.summary {
  color: #374151;
  font-size: 0.98rem;
}
.actions {
  text-align: center;
}
.details-link {
  color: #2563eb;
  font-weight: bold;
  text-decoration: none;
  cursor: pointer;
  transition: color 0.2s;
}
.details-link:hover {
  color: #1d4ed8;
  text-decoration: underline;
}
</style> 