<template>
  <div>
    <TopTabs />
    <div>
      <button @click="showDialog = true">分析文章</button>
      <div v-if="showDialog" class="dialog">
        <h3>上传PDF分析</h3>
        <input type="file" @change="onFileChange" accept=".pdf" />
        <div>
          <button @click="upload">上传</button>
          <button @click="analyze">分析</button>
          <button @click="showDialog = false">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import TopTabs from '../components/TopTabs.vue'
import { uploadPaper, startAnalysisById } from '../api/analysis'
const showDialog = ref(false)
const file = ref(null)
// 保存上传后返回的 paper 信息
const uploadedPaper = ref(null)

function onFileChange(e) { 
  file.value = e.target.files[0] 
  uploadedPaper.value = null // 选择新文件时清空已上传信息
}

// 上传文件，只保存 paper 信息
function upload() {
  if (!file.value) return alert('请选择文件')
  uploadPaper(file.value)
    .then(({ paper }) => {
      uploadedPaper.value = paper
      alert('上传成功')
    })
    .catch(err => alert(err.message))
}

// 只用已上传的 paper.ID 发起分析
function analyze() {
  if (!uploadedPaper.value || !uploadedPaper.value.ID) return alert('请先上传文件')
  startAnalysisById(uploadedPaper.value.ID)
    .then(() => alert('分析已发起'))
    .catch(err => alert(err.message))
}
</script>
<style scoped>
.dialog { border: 1px solid #ccc; padding: 24px; background: #fff; position: absolute; top: 100px; left: 50%; transform: translateX(-50%); }
</style> 