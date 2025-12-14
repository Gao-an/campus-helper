import { createRouter, createWebHistory } from 'vue-router'

// 导入页面组件
const Home = () => import('../views/Home.vue')
const AddExpenses = () => import('../views/AddExpenses.vue')
const RecordList = () => import('../views/RecordList.vue')
const Statistics = () => import('../views/Statistics.vue')
const AddIncome = () => import('../views/AddIncome.vue')

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/expenses',
    name: 'AddExpenses',
    component: AddExpenses
  },
  {
    path: '/list',
    name: 'RecordList',
    component: RecordList
  },
  {
    path: '/stats',
    name: 'Statistics',
    component: Statistics
  },
  {
    path: '/income',
    name: 'AddIncome',
    component: AddIncome
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router