import { createApp } from 'vue';
import App from './App.vue';
import router from './router/index.js'; // 导入JS版路由

// 挂载路由
createApp(App).use(router).mount('#app');