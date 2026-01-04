<template>
  <div class="nav-container">
    <h2>🏫 校园助手</h2>
    <p>一站式管理你的学习与生活</p>
    
    <div class="function">
      <router-link to="/course" class="function-item">
        <div class="function-img">📅</div>
        <h3>课程表</h3>
        <p>管理你的上课时间</p>
      </router-link>

      <router-link to="/account" class="function-item">
        <div class="function-img">💰</div>
        <h3>记账本</h3>
        <p>记录收支明细</p>
      </router-link>

      <router-link to="/memo" class="function-item">
        <div class="function-img">📝</div>
        <h3>备忘录</h3>
        <p>随手记录重要事项</p>
      </router-link>

      <router-link to="/todo" class="function-item">
        <div class="function-img">✅</div>
        <h3>待办清单</h3>
        <p>规划你的待办事项</p>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'

// 强制滚动条默认置顶
onMounted(() => {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: 'instant' // 无动画，立即置顶
  })
})
</script>

<!-- 全局样式：解决滚动条+背景覆盖核心 -->
<style>
/* 全局重置+背景铺满+滚动条置顶基础 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
html, body {
  height: 100%;
  width: 100%;
  /* 恢复你最初的渐变背景 */
  background: radial-gradient(circle at center, rgb(222, 189, 241) 0%, rgba(245, 230, 255, 0) 100%);
  /* 保留纵向滚动条，隐藏横向 */
  overflow-x: hidden;
  overflow-y: auto;
  /* 强制滚动条宽度稳定 */
  scrollbar-gutter: stable;
}
#app {
  height: 100%;
  width: 100%;
  background: transparent !important;
  margin: 0 !important;
  padding: 0 !important;
}
</style>

<style scoped>
/* 容器：仅排版，透明背景，全屏高度 */
.nav-container {
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column; 
  align-items: center;
  text-align: center;
  /* 透明背景，显示底层html/body的渐变 */
  background: transparent;
  /* 仅保留内容内边距，无顶部/底部外边距 */
  padding: 20px 15px;
  margin: 0 !important;
}

/* 标题：无顶部间距，仅底部间距 */
h2 {
  margin: 0 0 10px 0;
  font-size: 2.2em;
  color: #2c3e50;
  width: 100%;
}

/* 副标题：无顶部间距，仅底部间距 */
.nav-container > p {
  font-size: 1.2em;
  color: #7f8c8d;
  margin: 0 0 30px 0;
  width: 100%;
  padding: 0 10px;
}

/* 功能按钮区：保留你原有响应式 */
.function {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 25px;
  width: 100%;
  max-width: 800px;
  flex: 1;
  align-content: center;
  padding: 10px 0;
}

/* 按钮样式：保留你原有效果 */
.function-item {
  padding: 35px 20px;
  border: 1px solid #ddd;
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
  text-decoration: none;
  color: inherit;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 180px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

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
}

/* 平板端适配：保留你原有逻辑 */
@media (max-width: 768px) {
  h2 {
    font-size: 1.8em;
  }
  
  .nav-container > p {
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

/* 手机端适配：保留你原有逻辑 */
@media (max-width: 420px) {
  .nav-container {
    padding: 15px 8px;
  }
  
  h2 {
    font-size: 1.6em;
  }
  
  .nav-container > p {
    font-size: 0.95em;
    margin-bottom: 20px;
  }
  
  .function {
    grid-template-columns: 1fr;
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

/* 小屏手机适配：保留你原有逻辑 */
@media (max-width: 375px) {
  .function-item {
    min-height: 140px;
    padding: 25px 8px;
  }
  
  .function-img {
    font-size: 2.2em;
  }
}

/* 横屏适配：保留你原有逻辑 */
@media (orientation: landscape) and (max-width: 768px) {
  .nav-container {
    padding: 10px 15px;
  }
  
  .function {
    grid-template-columns: repeat(2, 1fr);
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