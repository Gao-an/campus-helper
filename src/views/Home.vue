<template>
  <div class="home">
    <h2>💰 个人记账本</h2>
    <p>欢迎使用个人记账本，请选择下方功能开始使用</p>
    <div class="function">
      <!-- 添加支出 -->
      <div class="function-item" @click="goToAddExpenses">
        <div class="function-img">➖</div>
        <h3>添加支出</h3>
        <p>记录新的支出</p>
      </div>

      <!-- 添加收入 -->
      <div class="function-item" @click="goToAddIncome">
        <div class="function-img">➕</div>
        <h3>添加收入</h3>
        <p>记录新的收入</p>
      </div>

      <!-- 查看账单 -->
      <div class="function-item" @click="goToRecordList">
        <div class="function-img">📋</div>
        <h3>查看账单</h3>
        <p>浏览所有记账记录</p>
      </div>

      <!-- 数据统计 -->
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

const goToAddExpenses = () => router.push('/expenses')
const goToRecordList = () => router.push('/list')
const goToStatistics = () => router.push('/stats')
const goToAddIncome = () => router.push('/income')
</script>

<style scoped>
.home {
  min-height:100vh;
  display: flex;
  flex-direction: column; 
  align-items: center;
  text-align: center;
  background-color: #f8f9fa;
  padding:40px;
}
h2 {
  margin-bottom: 15px;
  font-size: 2.2em;
  color: #2c3e50;
}

p {
  font-size: 1.2em;
  color: #7f8c8d;
  margin-bottom:10px;
}
.function {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 40px;
  margin-top: 40px;
}

.function-item {
  padding: 30px 35px;
  border: 1px solid #ddd;
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
  
}

.function-item:hover {
  background-color: #f5f5f5;
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
}

.function-img {
  font-size: 3em;
  margin-bottom: 15px;
}

.function-item h3 {

  font-size: 1.3em;
}
.function p{

    font-size:1em;
}

@media (max-width: 768px) {
  .home {
    padding: 20px;
  }
  h2 {
    font-size: 1.8em;
  }
  p {
    font-size: 1em;
  }
  .function {
    grid-template-columns: 1fr;
    gap: 20px;
    margin-top: 30px;
    width: 100%;
    max-width: 300px;
  }
  .function-item {
    padding: 25px 20px;
  }
  .function-img {
    font-size: 2.5em;
  }
}
</style>