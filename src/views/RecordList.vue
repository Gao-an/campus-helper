<template>
  <div class="recordListPage">
    <header class="page-header">
      <button @click="$router.push('/')" class="backbutton">返回</button>
      <h1>账单记录</h1>
    </header>
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
      <button @click="$router.push('/')" class="addButton">去添加记录</button>
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
  return allType[type]
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
.recordListPage {
  min-height: 100vh;
  background: rgb(245, 236, 251);
  padding: 20px;
}
.page-header {
  text-align: center;
  margin-bottom: 40px;
  position: relative;
}
.backbutton {
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  background: #45a049;
  color: white;
  box-shadow: 0 6px 20px rgba(64, 138, 72, 0.4);
  border: none;
  padding: 10px 20px;
  border-radius: 25px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}
.backbutton:hover {
  background: #45a049;
  box-shadow: 0 6px 20px rgba(42, 102, 47, 0.4); 
  transform: translateY(-50%) scale(1.05);
}
h1 {
  color: #2d3748;
  font-size: 32px;
  margin: 20px 0;
}
.filterSection {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  margin-bottom: 30px;
}
.typeFilter {
  padding: 10px 20px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  background: #f8fafc;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}
.typeFilter:focus {
  outline: none;
  border-color:rgb(207, 157, 240);
}
.totalAmount {
  font-size: 22px;
  font-weight: bold;
  color: rgb(149, 65, 205);
}
.recordContainer {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 30px;
}
.recordItem {
  background: white;
  padding: 20px;
  border-radius: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border-left: 5px solid rgb(207, 157, 240);
}
.recordItem:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}
.incomeItem {
  border-left-color: #38b2ac;
}
.expenseItem {
  border-left-color: #f56565;
}
.recordLeft {
  flex: 1;
}
.recordContent {
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 8px;
}
.recordMeta {
  display: flex;
  gap: 20px;
  font-size: 14px;
  color: #718096;
}
.recordDate, .recordType {
  display: flex;
  align-items: center;
  gap: 5px;
}
.recordDate::before {
  content: "📅";
}
.recordType::before {
  content: "🏷️";
}
.recordRight {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
}
.incomeAmount {
  font-size: 20px;
  font-weight: bold;
  color:#38b2ac;
}
.expenseAmount {
  font-size: 20px;
  font-weight: bold;
  color: #f56565;
}
.deleteBtn {
  background: linear-gradient(135deg, #f56565 0%, #e53e3e 100%);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(245, 101, 101, 0.2);
  min-width: 70px;
}
.deleteBtn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(245, 101, 101, 0.3);
}
.deleteBtn:active {
  transform: translateY(0);
}
.emptyState {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
}
.emptyState p {
  font-size: 20px;
  color: #718096;
  margin-bottom: 30px;
}
.addButton {
  background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%);
  color: white;
  border: none;
  padding: 12px 40px;
  border-radius: 25px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(237, 137, 54, 0.3);
}
.addButton:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(237, 137, 54, 0.4);
}
@media (max-width: 768px) {
  .recordItem {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
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
}
</style>