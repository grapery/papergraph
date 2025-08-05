<template>
  <div class="evaluation-page">
    <NavBar />
    
    <div class="evaluation-container">
      <PaperEvaluationSystem />
    </div>
  </div>
</template>

<script setup>
import NavBar from '../components/NavBar.vue'
import PaperEvaluationSystem from '../components/PaperEvaluationSystem.vue'
</script>

<style scoped>
.evaluation-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}

.evaluation-container {
  padding-top: 80px;
  min-height: calc(100vh - 80px);
}
</style>