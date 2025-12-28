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
// 纯导航页面，无需额外逻辑（router-link 直接跳转）
</script>

<style scoped>
/* 完全复刻记账本主页的容器样式 - 仅修改背景为待办页面同款渐变灰色 */
.nav-container {
  min-height:100vh;
  display: flex;
  flex-direction: column; 
  align-items: center;
  text-align: center;
  /* 替换背景：使用待办事项页面同款渐变灰色背景 */
  background: radial-gradient(circle at center, rgb(222, 189, 241) 0%, rgba(245, 230, 255, 0) 100%);
  padding:40px;
}

/* 标题样式：复刻记账本 h2 */
h2 {
  margin-bottom: 15px;
  font-size: 2.2em;
  color: #2c3e50;
}

/* 副标题样式：复刻记账本 p */
p {
  font-size: 1.2em;
  color: #7f8c8d;
  margin-bottom: 40px;
}

/* 按钮布局：完全复刻记账本 function 容器 */
.function {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 40px;
  margin-top: 0;
}

/* 按钮样式：1:1 复刻记账本 function-item */
.function-item {
  padding: 30px 35px;
  border: 1px solid #ddd;
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
  text-decoration: none; /* 去除 router-link 下划线 */
  color: inherit; /* 继承文字颜色 */
}

/* 悬停效果：完全复刻记账本 hover */
.function-item:hover {
  background-color: #f5f5f5;
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
}

/* 图标样式：复刻记账本 function-img */
.function-img {
  font-size: 3em;
  margin-bottom: 15px;
}

/* 按钮内标题：复刻记账本 h3 */
.function-item h3 {
  font-size: 1.3em;
  margin: 0;
}

/* 按钮内描述：复刻记账本 p */
.function p {
  font-size:1em;
  margin-bottom: 0;
  margin-top: 5px;
}

/* 移动端适配：完全复刻记账本的响应式 */
@media (max-width: 768px) {
  .nav-container {
    padding: 20px;
  }

  h2 {
    font-size: 1.8em;
  }

  p {
    font-size: 1em;
    margin-bottom: 30px;
  }

  .function {
    grid-template-columns: 1fr;
    gap: 20px;
    margin-top: 0;
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