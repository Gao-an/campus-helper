// 纯JS写法，无TS类型约束，规避导出报错
import { createRouter, createWebHistory } from 'vue-router';

// 页面组件导入
import NavPage from '../views/NavPage.vue';
import Course from '../views/Course.vue';
import Todo from '../views/Todolist.vue';
import Memo from '../views/Memo.vue';
import AccountBookHome from '../views/AccountBook/Home.vue';
import AddExpenses from '../views/AccountBook/AddExpenses.vue';
import AddIncome from '../views/AccountBook/AddIncome.vue';
import RecordList from '../views/AccountBook/RecordList.vue';
import Statistics from '../views/AccountBook/Statistics.vue';

// 路由规则（纯JS对象，无TS类型）
const routes = [
  {
    path: '/',
    name: 'Nav',
    component: NavPage,
    meta: { showBackBtn: false } // 首页不显示返回按钮
  },
  {
    path: '/course',
    name: 'Course',
    component: Course,
    meta: { showBackBtn: true, backTo: '/' }
  },
  {
    path: '/todo',
    name: 'Todo',
    component: Todo,
    meta: { showBackBtn: true, backTo: '/' }
  },
  {
    path: '/memo',
    name: 'Memo',
    component: Memo,
    meta: { showBackBtn: true, backTo: '/' }
  },
  {
    path: '/account',
    name: 'AccountBook',
    component: AccountBookHome,
    meta: { showBackBtn: true, backTo: '/' }
  },
  {
    path: '/account/expenses',
    name: 'AddExpenses',
    component: AddExpenses,
    meta: { showBackBtn: true, backTo: '/account' }
  },
  {
    path: '/account/income',
    name: 'AddIncome',
    component: AddIncome,
    meta: { showBackBtn: true, backTo: '/account' }
  },
  {
    path: '/account/list',
    name: 'RecordList',
    component: RecordList,
    meta: { showBackBtn: true, backTo: '/account' }
  },
  {
    path: '/account/stats',
    name: 'Statistics',
    component: Statistics,
    meta: { showBackBtn: true, backTo: '/account' }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
];

// 创建路由实例（纯JS写法，无TS类型）
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL || '/'),
  routes
});

export default router;