<template>
  <div class="addRecordPage">
    
    <header class="page-header">
      <h1>添加支出</h1>
    </header>
    
    <div class="formContainer">
      <form @submit.prevent="handleSubmit" class="record-form">
        <div class="formGroup">
          <label>内容:</label>
          <input type="text" v-model="formData.content" placeholder="请输入支出内容" required>
        </div>

        <div class="formGroup">
          <label>日期:</label>
          <input type="date" v-model="formData.date" required>
        </div>

        <div class="formGroup">
          <label>类型:</label>
          <select v-model="formData.Type" required>
            <option value="food">餐饮</option>
            <option value="transport">交通</option>
            <option value="shopping">购物</option>
            <option value="entertainment">娱乐</option>
            <option value="education">学习</option>
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

<script>
export default {
  name: 'AddRecord',  
  data() {
    return {
      formData: {
        content: '',
        date: new Date().toISOString().split('T')[0],
        Type: 'food',
        amount: ''
      }
    }
  },
  methods: {
    handleSubmit() {
        if (!this.formData.content || !this.formData.amount || !this.formData.Type) {
    alert('请填写完整信息')
    return
}
    if (this.formData.amount <= 0) {
        alert('金额无效！')
        return}
    const newRecord = {
        id: Date.now() + Math.random(), 
        content: this.formData.content,
        date: this.formData.date,
        Type: this.formData.Type,
        amount: parseFloat(this.formData.amount),
        type: 'expense',
        createdAt: new Date().toISOString()
    }
    this.saveToLocal(newRecord);
      // 处理表单提交
      console.log('添加支出记录:', this.formData)
      alert('支出记录添加成功！')
      this.reset();
    },
    //将数据保存 以便显示账单时调用
    saveToLocal(record) {
  const existingData = localStorage.getItem('expenseRecords')
  const records = existingData ? JSON.parse(existingData) : []
  records.unshift(record) // 新记录放在前面
  localStorage.setItem('expenseRecords', JSON.stringify(records))
  },
  reset() {
    this.formData = {//提交后重置
      content: '',
      date: new Date().toISOString().split('T')[0], 
      Type: 'food', 
      amount: ''
    }
  }  
    
  }
  
  
}
</script>

<style scoped>
.addRecordPage {
  min-height: 100vh;
  background: radial-gradient(circle at center, rgb(222, 189, 241) 0%, rgba(245, 230, 255, 0) 100%);
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
  box-shadow: 0 6px 20px rgba(42, 102, 47, 0.4); 
  transform: translateY(-50%) scale(1.05);
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