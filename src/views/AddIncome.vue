<template>
  <div class="addRecordPage">
    <header class="page-header">
      <button @click="$router.push('/')" class="backbutton">返回</button>
      <h1>添加收入</h1>
    </header>
    <div class="formContainer">
      <form @submit.prevent="handleSubmit" class="record-form">
        <div class="formGroup">
          <label>来源:</label>
          <input type="text" v-model="formData.content" placeholder="请输入收入来源" required>
        </div>
        <div class="formGroup">
          <label>日期:</label>
          <input type="date" v-model="formData.date" required>
        </div>
        <div class="formGroup">
          <label>类型:</label>
          <select v-model="formData.Type" required>
            <option value="salary">工资</option>
            <option value="bonus">奖金</option>
            <option value="investment">投资</option>
            <option value="freelance">兼职</option>
            <option value="gift">礼物</option>
            <option value="else">其他</option>
          </select>
        </div>
        <div class="formGroup">
          <label>金额:</label>
          <input type="number" v-model.number="formData.amount" placeholder="0.00" required min="0">
        </div>
        <button type="submit" class="add">添加</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
const formData = ref({
  content: '',
  date: new Date().toISOString().split('T')[0],
  Type: 'salary',
  amount: ''
})
const handleSubmit = () => {
  if (!formData.value.content || !formData.value.amount || !formData.value.Type) {
    alert('请填写完整信息')
    return
  }
  if (formData.value.amount <= 0) {
    alert('金额无效！')
    return
  }
  const newRecord = {
    id: Date.now() + Math.random(),
    content: formData.value.content,
    date: formData.value.date,
    Type: formData.value.Type,
    amount: parseFloat(formData.value.amount),
    type: 'income',
    createdAt: new Date().toISOString()
  }
  saveToLocal(newRecord)
  alert('收入记录添加成功！')
  reset()
}
const saveToLocal = (record) => {
  const existingData = localStorage.getItem('incomeRecords')
  const records = existingData ? JSON.parse(existingData) : []
  records.unshift(record)
  localStorage.setItem('incomeRecords', JSON.stringify(records))
}
const reset = () => {
  formData.value = {
    content: '',
    date: new Date().toISOString().split('T')[0],
    Type: 'salary',
    amount: ''
  }
}
</script>

<style scoped>
.addRecordPage {
  min-height: 100vh;
  background: radial-gradient(circle at center, rgb(222, 189, 241) 0%, rgba(245, 230, 255, 0) 100%);/*中间向四周渐变 */
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}
.page-header {
  width: 100%;
  max-width: 500px;
  text-align: center;
  margin-bottom: 30px;
  position: relative;
}
.backbutton {
  position: absolute;
  left: 0;
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
  transform: translateY(-50%) scale(1.05);
  box-shadow: 0 6px 20px rgba(42, 102, 47, 0.4);
}
h1 {
  color: #2d3748;
  font-size: 28px;
  margin: 20px 0;
}
.formContainer {
  background: white;
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
}
.record-form {
  display: flex;
  flex-direction: column;
  gap: 25px;
}
.formGroup {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.formGroup label {
  color: #4a5568;
  font-weight: 600;
  font-size: 14px;
  letter-spacing: 0.5px;
}
.formGroup input,
.formGroup select {
  padding: 12px 15px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.3s ease;
  background: #f8fafc;
}
.formGroup input:focus,
.formGroup select:focus {
  outline: none;
  border-color: rgb(207, 157, 240);
  box-shadow: 0 0 0 3px rgba(79, 209, 197, 0.1);
  background: white;
}
.add {
  background: #45a049;
  color: white;
  border: none;
  padding: 15px 40px;
  border-radius: 25px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s ease;
  margin-top: 20px;
  align-self: center;
  box-shadow: 0 6px 20px rgba(64, 138, 72, 0.4);
}
.add:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(42, 102, 47, 0.4); 
}
.add:active {
  transform: translateY(0);
}

@media (max-width: 768px) {
  .addRecordPage {
    padding: 15px;
  }
  .page-header {
    margin-bottom: 20px;
  }
  .backbutton {
    position: relative;
    left: 0;
    top: 0;
    transform: none;
    margin-bottom: 10px;
    display: inline-block;
  }
  h1 {
    font-size: 24px;
    margin: 10px 0;
  }
  .formContainer {
    padding: 25px 20px;
    margin: 0 10px;
    width: calc(100% - 20px);
    max-width: none;
  }
  .record-form {
    gap: 20px;
  }
  .formGroup input,
  .formGroup select {
    padding: 10px 12px;
    font-size: 15px;
  }
  .add {
    padding: 12px 30px;
    font-size: 15px;
    margin-top: 15px;
  }
}

</style>