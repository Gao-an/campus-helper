<template>
  <div class="layout-container">
    <!-- 返回按钮：仅非首页且配置显示时展示 -->
    <button
      v-if="showBackBtn"
      class="back-btn"
      @click="handleBack"
    >
      ← {{ route.meta.backTo === '/account' ? '返回记账本' : '返回首页' }}
    </button>

    <!-- 页面内容 -->
    <router-view />
  </div>
</template>

<!-- 去掉 lang="ts"，改用纯JS -->
<script setup>
import { useRoute, useRouter } from 'vue-router';
import { ref, watch } from 'vue';

// 初始化路由（纯JS，无TS类型）
const route = useRoute();
const router = useRouter();
const showBackBtn = ref(false);

// 核心：固定路径跳转，彻底解决历史记录循环
const handleBack = () => {
  // 优先用路由配置的返回路径，兜底返回首页
  const targetPath = route.meta.backTo || '/';
  router.push(targetPath);
};

// 监听路由变化，更新按钮显隐
watch(
  () => [route.path, route.meta],
  ([path, meta]) => {
    // 首页不显示，其他页面按配置显示
    showBackBtn.value = path !== '/' && meta.showBackBtn !== false;
  },
  { immediate: true } // 初始执行
);
</script>

<style scoped>
.layout-container {
  min-height: 100vh;
  padding-top: 70px; /* 给返回按钮留空间 */
}

.back-btn {
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 9999;
  padding: 8px 16px;
  background-color: #409eff;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.back-btn:hover {
  background-color: #337ecc;
  transform: translateX(-2px);
}

/* 移动端适配 */
@media (max-width: 768px) {
  .back-btn {
    top: 15px;
    left: 15px;
    padding: 10px 18px;
    font-size: 16px;
  }
}
</style>