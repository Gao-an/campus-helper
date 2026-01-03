<template>
  <div class="recordListPage">
    <header class="page-header">
      <h1>账单记录</h1>
    </header>
    <div class="formContainer">
      <div class="filterSection">
        <select v-model="filterType" @change="loadRecords" class="typeFilter">
          <option value="all">全部类型</option>
          <option value="expense">支出</option>
          <option value="income">收入</option>
        </select>
        <span class="totalAmount">总额: ¥{{ totalAmount }}</span>
      </div>    

      <div class="recordContainer" v-if="records.length > 0">
        <div v-for="record in records" :key="record.id" 
             :class="['recordItem', record.type === 'income' ? 'incomeItem' : 'expenseItem']">
          <div class="recordLeft">
            <div class="recordContent">{{ record.content }}</div>
            <div class="recordMeta">
              <span class="recordDate">{{ formatDate(record.date) }}</span>
              <span class="recordType">{{ getTypeText(record.Type) }}</span>
            </div>
          </div>
          <div class="recordRight">
            <span :class="record.type === 'income' ? 'incomeAmount' : 'expenseAmount'">
              {{ record.type === 'income' ? '+' : '-' }}¥{{ record.amount.toFixed(2) }}
            </span>
            <button @click.stop="Delete(record)" class="deleteBtn">删除</button>
          </div>
        </div>
      </div>
      
      <div class="emptyState" v-else>
        <p>暂无记录</p>
        <button @click="$router.push('/account')" class="addButton">去添加记录</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
const filterType = ref('all')
const expenseRecords = ref([])
const incomeRecords = ref([])

const loadRecords = () => {//加载初始化
  const expenseData = localStorage.getItem('expenseRecords')
  const incomeData = localStorage.getItem('incomeRecords')
  expenseRecords.value = expenseData ? JSON.parse(expenseData) : []
  incomeRecords.value = incomeData ? JSON.parse(incomeData) : []
}

const records = computed(() => {//所有记录
  let allRecords = [];
  for (let i = 0; i < expenseRecords.value.length; i++) {
    let newRecord = { ...expenseRecords.value[i], type: 'expense' };
    allRecords.push(newRecord);
  }
  for (let i = 0; i < incomeRecords.value.length; i++) {
    let newRecord = { ...incomeRecords.value[i], type: 'income' };
    allRecords.push(newRecord);
  }
  allRecords.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))//按时间从新到旧排序
  if (filterType.value === 'all') return allRecords
  return allRecords.filter(r => r.type === filterType.value)
})

const totalAmount = computed(() => {//所有金额
  let incomeTotal = 0,expenseTotal = 0
  for (let i = 0; i < incomeRecords.value.length; i++) {
    incomeTotal += incomeRecords.value[i].amount;
  }
  for (let i = 0; i < expenseRecords.value.length; i++) {
    expenseTotal += expenseRecords.value[i].amount;
  }
  return (incomeTotal - expenseTotal).toFixed(2)
})

const formatDate = (dateStr) => {//格式化日期
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}-${date.getDate()}`//注意月份从0开始
}

const getTypeText = (type) => {//转换为汉语
  const allType = {
    'food': '餐饮',
    'transport': '交通',
    'shopping': '购物',
    'entertainment': '娱乐',
    'education': '学习',
    'else': '其他',
    'salary': '工资',
    'bonus': '奖金',
    'investment': '投资',
    'freelance': '兼职',
    'gift': '礼物'
  }
  return allType[type] || type
}

const Delete = (record) => {//删除
  if (confirm(`确定要删除"${record.content}"这条记录吗？`)) {
    if (record.type === 'expense') {
      const index = expenseRecords.value.findIndex(r => r.id === record.id)
      if (index !== -1) {
        expenseRecords.value.splice(index, 1)
        localStorage.setItem('expenseRecords', JSON.stringify(expenseRecords.value))
        alert('支出记录已删除')
      }
    } else {
      const index = incomeRecords.value.findIndex(r => r.id === record.id)
      if (index !== -1) {
        incomeRecords.value.splice(index, 1)
        localStorage.setItem('incomeRecords', JSON.stringify(incomeRecords.value))
        alert('收入记录已删除')
      }
    }
  }
}

onMounted(() => {
  loadRecords()
})
</script>

<style scoped>
/* 全局容器 - 强制占满全屏 */
.recordListPage {
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: radial-gradient(circle at center, rgb(222, 189, 241) 0%, rgba(245, 230, 255, 0) 100%);
  padding: 20px 15px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  box-sizing: border-box;
  margin: 0;
}

/* 页面标题 */
.page-header {
  width: 100%;
  text-align: center;
  margin-bottom: 30px;
  position: relative;
}

h1 {
  color: #2d3748;
  font-size: 2.2em;
  margin: 20px 0;
  line-height: 1.2;
}

/* 表单容器 - 移除max-width限制，占满全屏 */
.formContainer {
  background: white;
  padding: 40px;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  width: 100%;
  min-width: 300px;
  box-sizing: border-box;
  overflow: hidden;
  max-width: none; /* 彻底移除最大宽度限制 */
}

/* 筛选栏 + 记录列表 - 限制内容最大宽度（可选），居中显示 */
.filterSection, .recordContainer, .emptyState {
  width: 100%;
  max-width: 1200px; /* 宽屏时内容最大宽度，避免拉伸 */
  margin: 0 auto;
}

/* 筛选栏样式 */
.filterSection {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8fafc;
  padding: 12px 15px;
  border-radius: 12px;
  box-shadow: none;
  margin-bottom: 25px;
  box-sizing: border-box;
}

.typeFilter {
  padding: 8px 12px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background: white;
  font-size: 1em;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 120px;
  -webkit-appearance: none;
  appearance: none;
}

.typeFilter:focus {
  outline: none;
  border-color: rgb(207, 157, 240);
  background: white;
  box-shadow: 0 0 0 3px rgba(207, 157, 241, 0.2);
}

.totalAmount {
  font-size: 1.1em;
  font-weight: bold;
  color: rgb(149, 65, 205);
}

/* 记录列表样式 */
.recordContainer {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 25px;
}

.recordItem {
  background: #f8fafc;
  padding: 15px;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border-left: 4px solid rgb(207, 157, 240);
  width: 100%;
  box-sizing: border-box;
}

.recordItem:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.incomeItem {
  border-left-color: #38b2ac;
}

.expenseItem {
  border-left-color: #f56565;
}

.recordLeft {
  flex: 1;
  min-width: 0;
}

.recordContent {
  font-size: 1em;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.recordMeta {
  display: flex;
  gap: 15px;
  font-size: 0.85em;
  color: #718096;
}

.recordRight {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  flex-shrink: 0;
}

.incomeAmount {
  font-size: 1.1em;
  font-weight: bold;
  color:#38b2ac;
}

.expenseAmount {
  font-size: 1.1em;
  font-weight: bold;
  color: #f56565;
}

.deleteBtn {
  background: linear-gradient(135deg, #f56565 0%, #e53e3e 100%);
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.85em;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(245, 101, 101, 0.2);
  min-width: 60px;
}

.deleteBtn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(245, 101, 101, 0.3);
}

/* 空状态样式 */
.emptyState {
  text-align: center;
  padding: 40px 20px;
  background: #f8fafc;
  border-radius: 12px;
  box-shadow: none;
  width: 100%;
  box-sizing: border-box;
}

.emptyState p {
  font-size: 1.1em;
  color: #718096;
  margin-bottom: 20px;
}

.addButton {
  background: linear-gradient(135deg, #45a049 0%, #2ecc71 100%);
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1em;
  font-weight: 600;
  transition: all 0.3s ease;
  margin-top: 10px;
  align-self: center;
  box-shadow: 0 6px 20px rgba(64, 138, 72, 0.4);
  width: 100%;
  max-width: 200px;
}

.addButton:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(42, 102, 47, 0.4);
}

/* 768px以下 - 平板+大屏手机适配 */
@media (max-width: 768px) {
  .recordListPage {
    padding: 15px 8px;
  }

  .page-header {
    margin-bottom: 20px;
  }

  h1 {
    font-size: 1.8em;
    margin: 10px 0;
  }

  .formContainer {
    padding: 25px 15px;
    border-radius: 15px;
  }

  .filterSection {
    flex-direction: column;
    gap: 10px;
    padding: 10px;
    max-width: none; /* 移动端筛选栏占满 */
  }

  .typeFilter {
    width: 100%;
    min-width: unset;
  }

  .recordItem {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .recordRight {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  } 

  .deleteBtn {
    min-width: 60px;
  }

  .filterSection, .recordContainer, .emptyState {
    max-width: none; /* 移动端内容占满 */
  }
}

/* 420px以下 - 主流小屏手机适配 */
@media (max-width: 420px) {
  .recordListPage {
    padding: 15px 8px;
  }

  .page-header {
    margin-bottom: 15px;
  }

  h1 {
    font-size: 1.6em;
  }

  .formContainer {
    padding: 20px 10px;
    border-radius: 10px;
  }

  .filterSection {
    margin-bottom: 20px;
  }

  .totalAmount {
    font-size: 1em;
  }

  .recordItem {
    padding: 12px 10px;
    border-radius: 10px;
  }

  .recordContent {
    font-size: 0.95em;
  }

  .recordMeta {
    font-size: 0.8em;
    gap: 10px;
  }

  .incomeAmount, .expenseAmount {
    font-size: 1em;
  }

  .deleteBtn {
    padding: 5px 10px;
    font-size: 0.8em;
    min-width: 50px;
  }

  .emptyState {
    padding: 30px 15px;
  }

  .emptyState p {
    font-size: 1em;
  }

  .addButton {
    padding: 10px 20px;
    font-size: 0.95em;
    max-width: none;
    width: 100%;
  }
}

/* 横屏适配 */
@media (orientation: landscape) {
  .recordListPage {
    padding: 10px 15px;
  }

  .formContainer {
    padding: 20px 25px;
  }

  .recordContainer {
    gap: 10px;
  }

  .recordItem {
    padding: 12px 15px;
  }
}
</style>