<template>
  <div class="home">
    <h2>💰 个人记账本</h2>
    <p>欢迎使用个人记账本，请选择下方功能开始使用</p>
    
    <div class="function">
      <div class="function-item" @click="goToAddExpenses">
        <div class="function-img">➖</div>
        <h3>添加支出</h3>
        <p>记录新的支出</p>
      </div>
      <div class="function-item" @click="goToAddIncome">
        <div class="function-img">➕</div>
        <h3>添加收入</h3>
        <p>记录新的收入</p>
      </div>
      <div class="function-item" @click="goToRecordList">
        <div class="function-img">📋</div>
        <h3>查看账单</h3>
        <p>浏览所有记账记录</p>
      </div>
      <div class="function-item" @click="goToStatistics">
        <div class="function-img">📊</div>
        <h3>数据统计</h3>
        <p>查看消费分析图表</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
// 路径跳转（或继续用命名路由）
const goToAddExpenses = () => router.push('/account/expenses')
const goToAddIncome = () => router.push('/account/income')
const goToRecordList = () => router.push('/account/list')
const goToStatistics = () => router.push('/account/stats')
</script>

<style scoped>
/* 全局容器 - 全屏自适应核心 */
.home {
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column; 
  align-items: center;
  text-align: center;
  background: radial-gradient(circle at center, rgb(222, 189, 241) 0%, rgba(245, 230, 255, 0) 100%);
  padding: 20px 15px; /* 适配小屏的内边距 */
  box-sizing: border-box;
  margin: 0;
}

h2 {
  margin-bottom: 10px;
  font-size: 2.2em;
  color: #2c3e50;
  width: 100%;
}

.home > p {
  font-size: 1.2em;
  color: #7f8c8d;
  margin-bottom: 30px;
  width: 100%;
  padding: 0 10px;
  box-sizing: border-box;
}

/* 功能按钮区 - 响应式网格核心适配 */
.function {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); /* 自适应列数 */
  gap: 25px;
  width: 100%;
  max-width: 800px; /* 大屏最大宽度，避免按钮过宽 */
  flex: 1;
  align-content: center; /* 垂直居中，提升视觉体验 */
  padding: 10px 0;
  box-sizing: border-box;
}

.function-item {
  padding: 35px 20px;
  border: 1px solid #ddd;
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 180px; /* 保证按钮最小高度，触控更友好 */
  box-sizing: border-box;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

/* hover动效增强 */
.function-item:hover {
  background: linear-gradient(135deg, #f8f9fa 0%, #f0e6fa 100%);
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  border-color: rgb(207, 157, 241);
}

.function-img {
  font-size: 3em;
  margin-bottom: 15px;
  color: rgb(149, 65, 205);
}

.function-item h3 {
  font-size: 1.3em;
  color: #2c3e50;
  margin: 0 0 8px 0;
}

.function-item p {
  font-size: 1em;
  color: #7f8c8d;
  margin: 0;
  padding: 0 5px;
  box-sizing: border-box;
}

/* 平板端 768px以下 */
@media (max-width: 768px) {
  h2 {
    font-size: 1.8em;
  }
  
  .home > p {
    font-size: 1em;
    margin-bottom: 25px;
  }
  
  .function {
    gap: 20px;
    max-width: 100%;
    padding: 0 5px;
  }
  
  .function-item {
    padding: 30px 15px;
    min-height: 160px;
  }
  
  .function-img {
    font-size: 2.8em;
  }
  
  .function-item h3 {
    font-size: 1.2em;
  }
}

/* 手机端 */
@media (max-width: 420px) {
  .home {
    padding: 15px 8px;
  }
  
  h2 {
    font-size: 1.6em;
  }
  
  .home > p {
    font-size: 0.95em;
    margin-bottom: 20px;
  }
  
  .function {
    grid-template-columns: 1fr; /* 强制单列 */
    gap: 18px;
  }
  
  .function-item {
    padding: 30px 10px;
    min-height: 150px;
    width: 100%;
  }
  
  .function-img {
    font-size: 2.5em;
    margin-bottom: 10px;
  }
  
  .function-item h3 {
    font-size: 1.15em;
  }
  
  .function-item p {
    font-size: 0.9em;
  }
}

/* 小屏手机 375px以下 */
@media (max-width: 375px) {
  .function-item {
    min-height: 140px;
    padding: 25px 8px;
  }
  
  .function-img {
    font-size: 2.2em;
  }
}

/* 横屏适配 */
@media (orientation: landscape) and (max-width: 768px) {
  .home {
    padding: 10px 15px;
  }
  
  .function {
    grid-template-columns: repeat(2, 1fr); /* 横屏恢复双列 */
    gap: 15px;
  }
  
  .function-item {
    min-height: 120px;
    padding: 20px 10px;
  }
  
  .function-img {
    font-size: 2em;
    margin-bottom: 8px;
  }
}
</style>