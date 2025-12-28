<template>
  <div class="statisticsPage">
    <header class="page-header">
      <h1>数据统计</h1>
    </header>
    <div class="formContainer"> <!-- 复用支出页的容器样式 -->
      <div class="dateFilter">
        <div class="filterGroup">
          <label>开始日期:</label>
          <input type="date" v-model="startDate">
        </div>
        <div class="filterGroup">
          <label>结束日期:</label>
          <input type="date" v-model="endDate">
        </div>
        <button @click="applyFilter" class="filterButton">筛选</button>
      </div>
      <div class="overviewCards">
        <div class="overviewCard expenseCard">
          <h3>总支出</h3>
          <p class="amount">¥{{ statistics.expenseTotal.toFixed(2) }}</p>
        </div>
        <div class="overviewCard incomeCard">
          <h3>总收入</h3>
          <p class="amount">¥{{ statistics.incomeTotal.toFixed(2) }}</p>
        </div>
        <div class="overviewCard balanceCard">
          <h3>结余</h3>
          <p class="amount">¥{{ statistics.balance.toFixed(2) }}</p>
        </div>
      </div>
      <div class="chartsSection">
        <div class="chartContainer">
          <h3>支出类型分布</h3>
          <div class="chart">
            <div v-for="item in expenseByType" :key="item.type" class="chartItem">
              <div class="chartLabel">
                <span class="typeName">{{ item.type }}</span>
                <span class="typeAmount">¥{{ item.amount.toFixed(2) }}</span>
              </div>
              <div class="chartBarContainer">
                <div class="chartBar" :style="{ width: item.percentage + '%' }"></div>
              </div>
              <span class="percentage">{{ item.percentage }}%</span>
            </div>
          </div>
        </div>
        <div class="chartContainer">
          <h3>收入类型分布</h3>
          <div class="chart">
            <div v-for="item in incomeByType" :key="item.type" class="chartItem">
              <div class="chartLabel">
                <span class="typeName">{{ item.type }}</span>
                <span class="typeAmount">¥{{ item.amount.toFixed(2) }}</span>
              </div>
              <div class="chartBarContainer">
                <div class="chartBar" :style="{ width: item.percentage + '%' }"></div>
              </div>
              <span class="percentage">{{ item.percentage }}%</span>
            </div>
          </div>
        </div>
      </div>
      <div class="topRecords">
        <div class="topSection">
          <h3>最高支出</h3>
          <div v-for="record in topExpenses" :key="record.id" class="topRecordItem">
            <span class="recordTitle">{{ record.content }}</span>
            <span class="recordAmount">-¥{{ record.amount.toFixed(2) }}</span>
          </div>
        </div>
        <div class="topSection">
          <h3>最高收入</h3>
          <div v-for="record in topIncomes" :key="record.id" class="topRecordItem">
            <span class="recordTitle">{{ record.content }}</span>
            <span class="recordAmount">+¥{{ record.amount.toFixed(2) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
const startDate = ref('')
const endDate = ref('')
const allExpenses = ref([])
const allIncomes = ref([])
const loadData = () => {//加载初始化
  const expenseData = localStorage.getItem('expenseRecords')
  const incomeData = localStorage.getItem('incomeRecords')
  allExpenses.value = expenseData ? JSON.parse(expenseData) : []
  allIncomes.value = incomeData ? JSON.parse(incomeData) : []
}
const filteredExpenses = computed(() => {//筛选支出
  let expenses = allExpenses.value 
  if (startDate.value) {
    expenses = expenses.filter(e => new Date(e.date) >= new Date(startDate.value))
  }
  if (endDate.value) {
    expenses = expenses.filter(e => new Date(e.date) <= new Date(endDate.value))
  }
  return expenses
})
const filteredIncomes = computed(() => {//筛选收入
  let incomes = allIncomes.value
  if (startDate.value) {
    incomes = incomes.filter(i => new Date(i.date) >= new Date(startDate.value))
  }
  if (endDate.value) {
    incomes = incomes.filter(i => new Date(i.date) <= new Date(endDate.value))
  }
  return incomes
})
const statistics = computed(() => {//计算总数据
  let incomeTotal = 0,expenseTotal = 0
  for (let i = 0; i < filteredIncomes.value.length; i++) {
    incomeTotal += filteredIncomes.value[i].amount;
  }
  for (let i = 0; i < filteredExpenses.value.length; i++) {
    expenseTotal += filteredExpenses.value[i].amount;
  }
  const balance = incomeTotal - expenseTotal
  return {
    incomeTotal,
    expenseTotal,
    balance
  }
})
const expenseByType = computed(() => {//筛选后支出
  const grouped = {}
  filteredExpenses.value.forEach(expense => {
    if (!grouped[expense.Type]) {
      grouped[expense.Type] = 0
    }
    grouped[expense.Type] += expense.amount
  })
  let total = 0
  for(let i=0;i<filteredExpenses.value.length;i++){
      total += filteredExpenses.value[i].amount;
    }
  let result = [];
  for (let type in grouped) {
    if (grouped.hasOwnProperty(type)) {
      let amount = grouped[type];
      let percentage = total > 0? ((amount / total) * 100).toFixed(1) : 0;
      result.push({
        type: getTypeText(type),
        amount,
        percentage
      });
    }
  }
  result.sort((a, b) => b.amount - a.amount);
  return result;
})
const incomeByType = computed(() => {//筛选后收入
  const grouped = {} 
  filteredIncomes.value.forEach(income => {
    if (!grouped[income.Type]) {
      grouped[income.Type] = 0
    }
    grouped[income.Type] += income.amount
  })
  let total = 0;
  for (let i = 0; i < filteredIncomes.value.length; i++) {
    total += filteredIncomes.value[i].amount;
  }
  let result = [];
  for (let type in grouped) {
    if (grouped.hasOwnProperty(type)) {
      let amount = grouped[type];
      let percentage = total > 0? ((amount / total) * 100).toFixed(1) : 0;
      result.push({
        type: getTypeText(type),
        amount,
        percentage
      });
    }
  }
  result.sort((a, b) => b.amount - a.amount);
  return result;
})
const topExpenses = computed(() => {
  return [...filteredExpenses.value]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5) // 显示前5个最高支出
})
const topIncomes = computed(() => {
  return [...filteredIncomes.value]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5) // 显示前5个最高收入
})
const getTypeText = (type) => {
  const typeMap = {
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
  return typeMap[type] 
}
const applyFilter = () => {
  // 数据会自动通过computed属性更新
}
onMounted(() => {
  loadData()
  // 设置默认日期为最近一个月
  const today = new Date()
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate())
  startDate.value = lastMonth.toISOString().split('T')[0]
  endDate.value = today.toISOString().split('T')[0]
})
</script>

<style scoped>
/* 核心：复用支出页的容器布局，限制最大宽度 */
.statisticsPage {
  min-height: 100vh;
  background: rgb(245, 236, 251);
  display: flex;
  flex-direction: column;
  align-items: center; /* 整体居中 */
  padding: 20px;
}
.page-header {
  width: 100%;
  max-width: 500px; /* 和支出页一致 */
  text-align: center;
  margin-bottom: 30px;
  position: relative;
}
.backbutton {
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  background: #9f7aea;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 25px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(159, 122, 234, 0.2);
}
.backbutton:hover {
  background: #805ad5;
  transform: translateY(-50%) scale(1.05);
  box-shadow: 0 6px 8px rgba(159, 122, 234, 0.3);
}
h1 {
  color: #2d3748;
  font-size: 28px; /* 和支出页一致 */
  margin: 20px 0;
}
/* 核心：新增容器，和支出页formContainer样式完全一致 */
.formContainer {
  background: white;
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px; /* 和支出页一致，限制最大宽度 */
}
.dateFilter {
  background: transparent; /* 去掉原有背景，复用容器背景 */
  padding: 0 0 25px 0; /* 仅保留底部间距 */
  border-radius: 0;
  box-shadow: none;
  margin-bottom: 25px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  align-items: end;
}
.filterGroup {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.filterGroup label {
  color: #4a5568;
  font-weight: 600;
  font-size: 14px;
}
.filterGroup input {
  padding: 12px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.3s ease;
  background: #f8fafc; /* 和支出页输入框一致 */
}
.filterGroup input:focus {
  outline: none;
  border-color: #9f7aea;
  box-shadow: 0 0 0 3px rgba(159, 122, 234, 0.1);
  background: white; /* 聚焦时和支出页一致 */
}
.filterButton {
  background: #9f7aea;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 12px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s ease;
}
.filterButton:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(159, 122, 234, 0.3);
}
.overviewCards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px; /* 缩小间距，适配窄容器 */
  margin-bottom: 30px;
}
.overviewCard {
  padding: 20px 15px; /* 缩小内边距 */
  border-radius: 20px;
  color: white;
  text-align: center;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}
.incomeCard {
  background: #4fd1c5;
}
.expenseCard {
  background: #f56565;
}
.balanceCard {
  background: #9f7aea;
}
.overviewCard h3 {
  margin: 0 0 10px 0;
  font-size: 14px; /* 缩小字体 */
  opacity: 0.9;
  font-weight: 500;
}
.overviewCard .amount {
  margin: 0;
  font-size: 22px; /* 缩小字体 */
  font-weight: bold;
}
.chartsSection {
  display: grid;
  grid-template-columns: 1fr; /* 改为单列，适配窄容器 */
  gap: 25px;
  margin-bottom: 30px;
}
.chartContainer {
  background: transparent; /* 去掉背景，复用容器背景 */
  padding: 0 0 25px 0; /* 仅保留底部间距 */
  border-radius: 0;
  box-shadow: none;
}
.chartContainer h3 {
  margin: 0 0 20px 0;
  text-align: center;
  color: #2d3748;
  font-size: 16px; /* 缩小字体 */
}
.chart {
  display: flex;
  flex-direction: column;
  gap: 15px; /* 缩小间距 */
}
.chartItem {
  display: flex;
  align-items: center;
  gap: 10px; /* 缩小间距 */
}
.chartLabel {
  flex: 1;
  display: flex;
  justify-content: space-between;
  min-width: 100px; /* 缩小最小宽度 */
  font-size: 13px; /* 缩小字体 */
}
.typeName {
  color: #2d3748;
  font-weight: 500;
}
.typeAmount {
  color: #718096;
  font-weight: 600;
}
.chartBarContainer {
  flex: 2;
  height: 20px;
  background: #f0f0f0;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
}
.chartBar {
  height: 100%;
  background: linear-gradient(90deg, #f56565, #e53e3e);
  transition: width 0.5s ease;
  border-radius: 10px;
  min-width: 3px;
  display: block !important;
}
.chartContainer:last-child .chartBar {
  background: linear-gradient(90deg, #4fd1c5, #319795);
  min-width: 3px;
  display: block !important;
}
.chartBar:not([style*="width:"]) {
  width: 10% !important;
}
.percentage {
  min-width: 40px; /* 缩小最小宽度 */
  text-align: right;
  font-size: 13px; /* 缩小字体 */
  font-weight: 600;
  color: #2d3748;
}
.topRecords {
  display: grid;
  grid-template-columns: 1fr; /* 改为单列，适配窄容器 */
  gap: 25px;
}
.topSection {
  background: transparent; /* 去掉背景，复用容器背景 */
  padding: 0;
  border-radius: 0;
  box-shadow: none;
}
.topSection h3 {
  margin: 0 0 15px 0;
  text-align: center;
  color: #2d3748;
  font-size: 16px; /* 缩小字体 */
}
.topRecordItem {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0; /* 缩小内边距 */
  border-bottom: 1px solid #f0f0f0;
}
.topRecordItem:last-child {
  border-bottom: none;
}
.recordTitle {
  font-size: 14px; /* 缩小字体 */
  color: #4a5568;
  max-width: 70%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.recordAmount {
  font-weight: bold;
  font-size: 15px; /* 缩小字体 */
}
.topSection:first-child .recordAmount {
  color:#f56565;
}
.topSection:last-child .recordAmount {
  color:#4fd1c5;
}

/* 移动端适配（复用支出页逻辑） */
@media (max-width: 768px) {
  .statisticsPage {
    padding: 15px;
  }
  .page-header {
    margin-bottom: 20px;
    max-width: calc(100% - 20px);
  }
  .formContainer {
    padding: 25px 20px;
    margin: 0 10px;
    width: calc(100% - 20px);
    max-width: none;
  }
  .dateFilter {
    grid-template-columns: 1fr;
    gap: 15px;
    padding-bottom: 20px;
  }
  .overviewCards {
    grid-template-columns: 1fr;
    gap: 15px;
    margin-bottom: 25px;
  }
  .chartsSection {
    gap: 20px;
    margin-bottom: 25px;
  }
  .chartItem {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  .chartBarContainer {
    width: 100%;
    flex: none;
  }
  .percentage {
    align-self: flex-end;
  }
  .topRecords {
    gap: 20px;
  }
}
</style>