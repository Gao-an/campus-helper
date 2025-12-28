<template>
  <div class="todoListPage">
    <!-- 顶部标题区域 -->
    <header class="page-header">
      <h1>✅ 校园待办事项</h1>
      <p>欢迎使用校园待办事项，高效管理你的校园任务</p>
    </header>

    <!-- 表单区域 -->
    <div class="formContainer">
      <form class="input-section">
        <input 
          type="text" 
          v-model="newTaskTitle" 
          placeholder="输入任务内容..." 
          required
        >
        <input 
          type="date" 
          v-model="newTaskDueDate"
        >
        <select v-model="newTaskPriority">
          <option value="low">低优先级</option>
          <option value="medium" selected>中优先级</option>
          <option value="high">高优先级</option>
        </select>
        <!-- 拆分按钮：添加/保存 -->
        <button 
          type="button" 
          @click="addTask"
          v-if="!editMode"
          class="primaryBtn"
        >
          添加任务
        </button>
        <button 
          type="button" 
          @click="saveEditTask"
          v-else
          class="primaryBtn"
        >
          保存修改
        </button>
        <!-- 取消编辑 -->
        <button v-if="editMode" type="button" @click="cancelEdit" class="cancelBtn">
          取消编辑
        </button>
      </form>

      <!-- 筛选区域 -->
      <div class="filter-section">
        <button 
          v-for="filter in filters" 
          :key="filter.value"
          class="filter-btn" 
          :class="{ active: currentFilter === filter.value }"
          @click="filterTasks(filter.value)"
        >
          {{ filter.label }}
        </button>
      </div>

      <!-- 任务列表区域 -->
      <div class="tasks-section">
        <div class="task-list">
          <!-- 核心：任务项 - 绑定完成状态类 -->
          <div 
            v-for="task in filteredTasks" 
            :key="task.id" 
            class="task-item"
            :class="{ 'task-completed': task.completed }"
          >
            <!-- 完成状态对勾 -->
            <div 
              class="task-checkbox" 
              :class="{ completed: task.completed }"
              @click="toggleTaskCompletion(task.id)"
            >
              <span v-if="task.completed" class="check-icon">✓</span>
            </div>
            <div class="task-content">
              <div 
                class="task-title" 
                :class="{ completed: task.completed }"
                @click="toggleTaskCompletion(task.id)"
              >
                {{ task.title }}
              </div>
              <div class="task-meta">
                <span>截止: {{ formatDate(task.dueDate) }}</span>
                <span class="task-priority">{{ getPriorityText(task.priority) }}优先级</span>
              </div>
            </div>
            <div class="task-actions">
              <button @click="editTask(task.id)" class="editBtn">编辑</button>
              <button @click="deleteTask(task.id)" class="deleteBtn">删除</button>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div class="empty-state" v-if="filteredTasks.length === 0">
          <p>暂无任务</p>
          <p>添加您的第一个任务开始管理您的时间</p>
          <button @click="resetForm" class="addButton">去添加任务</button>
        </div>
      </div>

      <!-- 统计区域 -->
      <div class="stats-section">
        <span>总任务: <span class="stat-value">{{ tasks.length }}</span></span>
        <span>已完成: <span class="stat-value completed-count">{{ completedTasksCount }}</span></span>
        <span>待完成: <span class="stat-value pending-count">{{ pendingTasksCount }}</span></span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TodoList',
  data() {
    return {
      newTaskTitle: '',
      newTaskDueDate: '',
      newTaskPriority: 'medium',
      currentFilter: 'all',
      filters: [
        { label: '全部', value: 'all' },
        { label: '未完成', value: 'active' },
        { label: '已完成', value: 'completed' },
        { label: '优先级', value: 'priority' }
      ],
      tasks: [],
      editMode: false,
      editingTaskId: null
    }
  },
  computed: {
    filteredTasks() {
      let filtered = [...this.tasks];
      switch (this.currentFilter) {
        case 'active':
          filtered = filtered.filter(task => !task.completed);
          break;
        case 'completed':
          filtered = filtered.filter(task => task.completed);
          break;
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          filtered.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
          break;
      }
      return filtered;
    },
    completedTasksCount() {
      return this.tasks.filter(task => task.completed).length;
    },
    pendingTasksCount() {
      return this.tasks.length - this.completedTasksCount;
    }
  },
  mounted() {
    this.setDefaultDate();
    this.loadTasksFromLocalStorage();
  },
  methods: {
    setDefaultDate() {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      this.newTaskDueDate = tomorrow.toISOString().split('T')[0];
    },
    // 本地存储 - 保存任务
    saveTasksToLocalStorage() {
      localStorage.setItem('campusHelperTasks', JSON.stringify(this.tasks));
    },
    // 本地存储 - 加载任务
    loadTasksFromLocalStorage() {
      const savedTasks = localStorage.getItem('campusHelperTasks');
      if (savedTasks) {
        this.tasks = JSON.parse(savedTasks);
      } else {
        // 初始默认任务
        this.tasks = [
          { id: 1, title: "完成数据结构作业", dueDate: "2025-12-05", priority: "high", completed: false },
          { id: 2, title: "准备英语六级考试", dueDate: "2025-12-01", priority: "medium", completed: true },
          { id: 3, title: "阅读课外书籍", dueDate: "2025-12-15", priority: "low", completed: false }
        ];
      }
    },
    // 添加新任务
    addTask() {
      if (!this.newTaskTitle.trim()) return;
      this.tasks.push({
        id: Date.now(),
        title: this.newTaskTitle.trim(),
        dueDate: this.newTaskDueDate,
        priority: this.newTaskPriority,
        completed: false // 新增任务默认未完成
      });
      this.resetForm();
    },
    // 删除任务
    deleteTask(id) {
      this.tasks = this.tasks.filter(task => task.id !== id);
    },
    // 核心：切换完成状态（实时更新边框颜色）
    toggleTaskCompletion(id) {
      this.tasks = this.tasks.map(task => {
        if (task.id === id) {
          return { ...task, completed: !task.completed };
        }
        return task;
      });
    },
    // 编辑任务
    editTask(id) {
      const task = this.tasks.find(task => task.id === id);
      if (!task) return;
      this.editMode = true;
      this.editingTaskId = id;
      this.newTaskTitle = task.title;
      this.newTaskDueDate = task.dueDate;
      this.newTaskPriority = task.priority;
    },
    // 保存编辑后的任务
    saveEditTask() {
      if (!this.newTaskTitle.trim() || !this.editingTaskId) return;
      this.tasks = this.tasks.map(task => {
        if (task.id === this.editingTaskId) {
          return {
            ...task,
            title: this.newTaskTitle.trim(),
            dueDate: this.newTaskDueDate,
            priority: this.newTaskPriority
          };
        }
        return task;
      });
      this.resetForm();
    },
    // 取消编辑/重置表单
    resetForm() {
      this.newTaskTitle = '';
      this.setDefaultDate();
      this.newTaskPriority = 'medium';
      this.editMode = false;
      this.editingTaskId = null;
    },
    // 筛选任务
    filterTasks(filter) {
      this.currentFilter = filter;
    },
    // 格式化日期显示
    formatDate(dateString) {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '未知日期';
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      if (date.toDateString() === today.toDateString()) return '今天';
      if (date.toDateString() === tomorrow.toDateString()) return '明天';
      return `${date.getMonth() + 1}月${date.getDate()}日`;
    },
    // 优先级文本转换
    getPriorityText(priority) {
      const map = { high: '高', medium: '中', low: '低' };
      return map[priority] || '中';
    }
  },
  // 监听任务变化，自动保存到本地存储
  watch: {
    tasks: {
      deep: true,
      handler() {
        this.saveTasksToLocalStorage();
      }
    }
  }
}
</script>

<style scoped>
/* 页面基础样式 */
.todoListPage {
  min-height: 100vh;
  background: radial-gradient(circle at center, rgb(222, 189, 241) 0%, rgba(245, 230, 255, 0) 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* 标题样式 */
.page-header {
  width: 100%;
  max-width: 500px;
  text-align: center;
  margin-bottom: 30px;
}
.page-header h1 {
  color: #2d3748;
  font-size: 28px;
  margin: 20px 0 10px;
}
.page-header p {
  font-size: 1.2em;
  color: #7f8c8d;
  margin-bottom: 0;
}

/* 主容器 */
.formContainer {
  background: white;
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
}

/* 输入区域 */
.input-section {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
}
.input-section input,
.input-section select {
  display: block;
  width: 100%;
  margin-bottom: 15px;
  padding: 12px 15px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background: white;
  color: #2d3748;
  font-size: 15px;
  transition: all 0.3s ease;
}
.input-section input:focus,
.input-section select:focus {
  outline: none;
  border-color: rgb(207, 157, 240);
  box-shadow: 0 0 0 3px rgba(207, 157, 240, 0.2);
}

/* 按钮样式 */
.primaryBtn {
  background: linear-gradient(135deg, rgb(149, 65, 205) 0%, rgb(207, 157, 240) 100%);
  color: white;
  border: none;
  padding: 12px 0;
  border-radius: 12px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  width: 100%;
  margin-bottom: 10px;
  transition: all 0.3s ease;
}
.primaryBtn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(149, 65, 205, 0.3);
}
.cancelBtn {
  background: #f8fafc;
  color: #718096;
  border: 2px solid #e2e8f0;
  padding: 12px 0;
  border-radius: 12px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  width: 100%;
  transition: all 0.3s ease;
}
.cancelBtn:hover {
  background: #f0f0f0;
  border-color: #d1d5db;
}

/* 筛选按钮 */
.filter-section {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
}
.filter-btn {
  padding: 8px 15px;
  border: 2px solid #e2e8f0;
  background: #f8fafc;
  color: #2d3748;
  cursor: pointer;
  border-radius: 12px;
  flex: 1;
  min-width: 80px;
  transition: all 0.3s ease;
}
.filter-btn.active {
  background: linear-gradient(135deg, rgb(149, 65, 205) 0%, rgb(207, 157, 240) 100%);
  color: white;
  border-color: rgb(207, 157, 240);
}
.filter-btn:hover:not(.active) {
  border-color: rgb(207, 157, 240);
  background: #f5f0fa;
}

/* 任务列表容器 */
.tasks-section {
  margin-bottom: 25px;
  min-height: 200px;
}
.task-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 25px;
}

/* 核心：任务项样式 - 边框颜色严格绑定完成状态 */
.task-item {
  padding: 15px;
  border-radius: 12px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: #f8fafc;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  /* 未完成状态：紫色边框（核心） */
  border-left: 4px solid rgb(207, 157, 240);
}
/* 完成状态：绿色边框（核心，覆盖未完成样式） */
.task-item.task-completed {
  border-left-color: #38b2ac !important;
}
.task-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

/* 完成状态复选框 */
.task-checkbox {
  width: 24px;
  height: 24px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  flex-shrink: 0;
  margin-top: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  transition: all 0.3s ease;
}
.task-checkbox.completed {
  background: #38b2ac;
  border-color: #38b2ac;
  color: white;
}
.check-icon {
  font-size: 16px;
  font-weight: bold;
}

/* 任务内容 */
.task-content {
  flex: 1;
}
.task-title {
  margin-bottom: 5px;
  font-weight: 600;
  cursor: pointer;
  font-size: 16px;
  color: #2d3748;
  transition: all 0.3s ease;
}
.task-title.completed {
  text-decoration: line-through;
  color: #718096;
  font-weight: normal;
}
.task-meta {
  font-size: 13px;
  color: #718096;
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}
.task-priority {
  padding: 2px 8px;
  border-radius: 8px;
  background: #f0f0f0;
  font-size: 12px;
}

/* 任务操作按钮 */
.task-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}
.editBtn {
  background: #f8fafc;
  color: rgb(149, 65, 205);
  border: 1px solid rgb(207, 157, 240);
  padding: 6px 10px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.3s ease;
}
.editBtn:hover {
  background: #f5f0fa;
}
.deleteBtn {
  background: linear-gradient(135deg, #f56565 0%, #e53e3e 100%);
  color: white;
  border: none;
  padding: 6px 10px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(245, 101, 101, 0.2);
}
.deleteBtn:hover {
  box-shadow: 0 4px 10px rgba(245, 101, 101, 0.3);
}

/* 空状态样式 */
.empty-state {
  text-align: center;
  padding: 40px 20px;
  background: #f8fafc;
  border-radius: 12px;
  box-shadow: none;
}
.empty-state p {
  font-size: 18px;
  color: #718096;
  margin-bottom: 10px;
}
.addButton {
  background: #45a049;
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 25px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s ease;
  margin-top: 10px;
  box-shadow: 0 6px 20px rgba(64, 138, 72, 0.4);
}
.addButton:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(42, 102, 47, 0.4);
}

/* 统计区域 */
.stats-section {
  display: flex;
  justify-content: space-between;
  padding: 15px;
  border-top: 1px solid #f0f0f0;
  margin-bottom: 20px;
  font-size: 14px;
  background: #f8fafc;
  border-radius: 12px;
}
.stats-section span {
  color: #2d3748;
}
.stat-value {
  font-weight: bold;
  margin-left: 5px;
}
.completed-count {
  color: #38b2ac;
}
.pending-count {
  color: #f56565;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .todoListPage {
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
  .task-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  .task-actions {
    width: 100%;
    justify-content: flex-end;
  }
  .stats-section {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }
}
</style>