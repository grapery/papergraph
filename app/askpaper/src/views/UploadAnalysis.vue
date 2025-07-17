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
import { uploadPaper, startAnalysis } from '../api/analysis'
const showDialog = ref(false)
const file = ref(null)
function onFileChange(e) { file.value = e.target.files[0] }
function upload() {
  if (!file.value) return alert('请选择文件')
  uploadPaper(file.value).then(() => alert('上传成功'))
}
function analyze() {
  if (!file.value) return alert('请选择文件')
  startAnalysis(file.value).then(() => alert('分析已发起'))
}
</script>
<style scoped>
.dialog { border: 1px solid #ccc; padding: 24px; background: #fff; position: absolute; top: 100px; left: 50%; transform: translateX(-50%); }
</style> 