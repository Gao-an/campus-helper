<template>
  <!-- 全局布局（包含返回按钮） -->
  <Layout />
</template>

<script setup lang="ts">
// 导入全局布局组件
import Layout from './views/Layout.vue';
</script>

<style>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: "微软雅黑", sans-serif;
  background-color: #f5f7fa;
}
</style>