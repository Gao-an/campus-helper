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
        return
      }
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
      console.log('添加支出记录:', this.formData)
      alert('支出记录添加成功！')
      this.reset();
    },
    saveToLocal(record) {
      const existingData = localStorage.getItem('expenseRecords')
      const records = existingData ? JSON.parse(existingData) : []
      records.unshift(record)
      localStorage.setItem('expenseRecords', JSON.stringify(records))
    },
    reset() {
      this.formData = {
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
/* 全局容器 - 强制占满全屏，和备忘录完全一致 */
.addRecordPage {
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

/* 表单容器 - 移除max-width限制，强制占满屏幕（仅限制最小宽度避免过小） */
.formContainer {
  background: white;
  padding: 40px;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  width: 100%;
  min-width: 300px; /* 仅限制最小宽度，不限制最大宽度 */
  box-sizing: border-box;
  overflow: hidden;
  max-width: none; /* 彻底移除最大宽度限制 */
}

.record-form {
  display: flex;
  flex-direction: column;
  gap: 25px;
  width: 100%;
  max-width: 800px; /* 可选：表单内容最大宽度（避免超宽屏幕拉伸），容器仍占满全屏 */
  margin: 0 auto; /* 表单内容居中 */
}

.formGroup {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.formGroup label {
  color: #4a5568;
  font-weight: 600;
  font-size: 14px;
  letter-spacing: 0.5px;
  text-align: left;
}

.formGroup input,
.formGroup select {
  padding: 12px 15px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1em;
  transition: all 0.3s ease;
  background: #f8fafc;
  width: 100%;
  min-width: 0;
  -webkit-appearance: none;
  appearance: none;
  box-sizing: border-box;
}

/* 金额输入框原生样式重置 */
.formGroup input[type="number"] {
  -moz-appearance: textfield;
}
.formGroup input[type="number"]::-webkit-outer-spin-button,
.formGroup input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.formGroup input:focus,
.formGroup select:focus {
  outline: none;
  border-color: rgb(207, 157, 240);
  background: white;
  box-shadow: 0 0 0 3px rgba(207, 157, 241, 0.2);
}

.add {
  background: linear-gradient(135deg, #45a049 0%, #2ecc71 100%);
  color: white;
  border: none;
  padding: 15px 40px;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1em;
  font-weight: 600;
  transition: all 0.3s ease;
  margin-top: 20px;
  align-self: center;
  box-shadow: 0 6px 20px rgba(64, 138, 72, 0.4);
  width: 100%;
  max-width: 300px;
}

.add:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(42, 102, 47, 0.4);
}

.add:active {
  transform: translateY(0);
}

/* 768px以下 - 平板+大屏手机适配 */
@media (max-width: 768px) {
  .addRecordPage {
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

  .record-form {
    gap: 20px;
    max-width: none; /* 移动端表单占满 */
  }

  .formGroup input,
  .formGroup select {
    padding: 11px 12px;
    font-size: 0.95em;
    border-radius: 10px;
  }

  .add {
    padding: 14px 20px;
    font-size: 0.95em;
    margin-top: 15px;
    width: 100%;
    max-width: none;
  }
}

/* 420px以下 - 主流小屏手机适配 */
@media (max-width: 420px) {
  .addRecordPage {
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

  .formGroup label {
    font-size: 13px;
  }

  .formGroup input,
  .formGroup select {
    padding: 10px 10px;
    font-size: 0.9em;
    border-radius: 8px;
  }

  .add {
    padding: 12px 0;
    font-size: 0.9em;
    border-radius: 15px;
  }
}

/* 横屏适配 */
@media (orientation: landscape) {
  .addRecordPage {
    padding: 10px 15px;
  }

  .formContainer {
    padding: 20px 25px;
  }

  .record-form {
    gap: 15px;
  }

  .add {
    margin-top: 10px;
  }
}
</style>