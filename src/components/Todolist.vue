<template>
  <div class="container">
    <div class="header">
      <h1>待办事项</h1>
    </div>
    
    <form @submit.prevent="addTask" class="input-section">
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
      <button type="submit" id="addTaskBtn">添加任务</button>
    </form>
    
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
    
    <div class="tasks-section">
      <div class="task-list">
        <div 
          v-for="task in filteredTasks" 
          :key="task.id" 
          class="task-item"
        >
          <div 
            class="task-checkbox" 
            :class="{ completed: task.completed }"
            @click="toggleTaskCompletion(task.id)"
          ></div>
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
            <button @click="editTask(task.id)">编辑</button>
            <button @click="deleteTask(task.id)">删除</button>
          </div>
        </div>
      </div>
      
      <div class="empty-state" v-if="filteredTasks.length === 0">
        <p>暂无任务</p>
        <p>添加您的第一个任务开始管理您的时间</p>
      </div>
    </div>
    
    <div class="stats-section">
      <span>总任务: <span id="totalTasks">{{ tasks.length }}</span></span>
      <span>已完成: <span id="completedTasks">{{ completedTasksCount }}</span></span>
      <span>待完成: <span id="pendingTasks">{{ pendingTasksCount }}</span></span>
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
      tasks: [
        {
          id: 1,
          title: "完成数据结构作业",
          dueDate: "2025-12-05",
          priority: "high",
          completed: false
        },
        {
          id: 2,
          title: "准备英语六级考试",
          dueDate: "2025-12-01",
          priority: "medium",
          completed: true
        },
        {
          id: 3,
          title: "阅读课外书籍",
          dueDate: "2025-12-15",
          priority: "low",
          completed: false
        }
      ]
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
  },
  methods: {
    setDefaultDate() {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      this.newTaskDueDate = tomorrow.toISOString().split('T')[0];
    },
    addTask() {
      if (!this.newTaskTitle.trim()) return;
      
      const newTask = {
        id: Date.now(),
        title: this.newTaskTitle.trim(),
        dueDate: this.newTaskDueDate,
        priority: this.newTaskPriority,
        completed: false
      };
      
      this.tasks.push(newTask);
      this.newTaskTitle = '';
      this.setDefaultDate();
      this.newTaskPriority = 'medium';
    },
    deleteTask(id) {
      this.tasks = this.tasks.filter(task => task.id !== id);
    },
    toggleTaskCompletion(id) {
      this.tasks = this.tasks.map(task => 
        task.id === id ? { ...task, completed: !task.completed } : task
      );
    },
    editTask(id) {
      const task = this.tasks.find(task => task.id === id);
      if (!task) return;
      
      this.newTaskTitle = task.title;
      this.newTaskDueDate = task.dueDate;
      this.newTaskPriority = task.priority;
      this.deleteTask(id);
    },
    filterTasks(filter) {
      this.currentFilter = filter;
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      
      if (date.toDateString() === today.toDateString()) return '今天';
      if (date.toDateString() === tomorrow.toDateString()) return '明天';
      
      return `${date.getMonth() + 1}月${date.getDate()}日`;
    },
    getPriorityText(priority) {
      const map = { high: '高', medium: '中', low: '低' };
      return map[priority] || '中';
    }
  }
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: monospace, 'Courier New', monospace;
  font-size: 14px;
}
body {
  background-color: #ffffff;
  color: #000000;
  min-height: 100vh;
  padding: 20px;
  line-height: 1.5;
}
.container {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}
.header {
  margin-bottom: 20px;
  border-bottom: 1px solid #000000;
  padding-bottom: 10px;
}
.header h1 {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 5px;
}
.header p {
  color: #666666;
}
.input-section {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #cccccc;
}
.input-section input,
.input-section select,
.input-section button {
  display: block;
  width: 100%;
  margin-bottom: 10px;
  padding: 8px;
  border: 1px solid #000000;
  background: #ffffff;
  color: #000000;
  font-family: inherit;
}
.input-section input:focus,
.input-section select:focus {
  outline: none;
  border-color: #000000;
}
.input-section button {
  background: #000000;
  color: #ffffff;
  border: none;
  cursor: pointer;
  font-weight: bold;
}
.filter-section {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #cccccc;
}
.filter-btn {
  padding: 5px 10px;
  border: 1px solid #000000;
  background: #ffffff;
  color: #000000;
  cursor: pointer;
  font-family: inherit;
  flex: 1;
  min-width: 100px;
}
.filter-btn.active {
  background: #000000;
  color: #ffffff;
}
.tasks-section {
  margin-bottom: 20px;
  min-height: 200px;
}
.task-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.task-item {
  padding: 10px;
  border: 1px solid #cccccc;
  display: flex;
  align-items: flex-start;
  gap: 10px;
}
.task-checkbox {
  width: 16px;
  height: 16px;
  border: 1px solid #000000;
  cursor: pointer;
  flex-shrink: 0;
  margin-top: 2px;
}
.task-checkbox.completed {
  background: #000000;
}
.task-content {
  flex: 1;
}
.task-title {
  margin-bottom: 5px;
  font-weight: bold;
  cursor: pointer;
}
.task-title.completed {
  text-decoration: line-through;
  color: #666666;
  font-weight: normal;
}
.task-meta {
  font-size: 12px;
  color: #666666;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.task-priority {
  padding: 1px 5px;
  border: 1px solid #cccccc;
}
.task-actions {
  display: flex;
  gap: 5px;
  flex-shrink: 0;
}
.task-actions button {
  padding: 2px 5px;
  border: 1px solid #000000;
  background: #ffffff;
  color: #000000;
  cursor: pointer;
  font-family: inherit;
  font-size: 12px;
}
.task-actions button:hover {
  background: #f0f0f0;
}
.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #666666;
}
.empty-state p:first-child {
  font-weight: bold;
  margin-bottom: 5px;
}
.stats-section {
  display: flex;
  justify-content: space-between;
  padding: 15px 0;
  border-top: 1px solid #cccccc;
  margin-bottom: 20px;
  font-size: 12px;
}
.stats-section span {
  font-weight: bold;
}
.motivation {
  text-align: center;
  font-style: italic;
  color: #666666;
  font-size: 12px;
  padding: 10px;
  border-top: 1px solid #cccccc;
}
@media (max-width: 600px) {
  body {
    padding: 10px;
  }
  .filter-btn {
    min-width: 80px;
  }
  .task-item {
    flex-direction: column;
  }
  .task-actions {
    margin-top: 10px;
    justify-content: flex-end;
  }
  .stats-section {
    flex-direction: column;
    gap: 5px;
  }
}
</style>