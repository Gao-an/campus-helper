<template>
  <div id="course-table-container">
    <div id="course-table-wrapper">
      <!-- 标题区域（统一风格） -->
      <div class="course-header">
        <h2>📚 课程表</h2>
        <p>轻松管理你的课程安排</p>
      </div>

      <div class="controls">
        <button id="clear-all" @click="clearAllCourses">删除全部课程</button>
      </div>

      <table id="course-table">
        <thead>
          <tr>
            <th>节次/星期</th>
            <th>周一</th>
            <th>周二</th>
            <th>周三</th>
            <th>周四</th>
            <th>周五</th>
            <th>周六</th>
            <th>周日</th>
          </tr>
        </thead>
        <tbody id="course-body">
          <tr v-for="r in rows" :key="r">
            <td>第 {{ r }} 节</td>
            <td
              v-for="c in cols"
              :key="c"
              :data-row="r - 1"
              :data-col="c - 1"
              :class="{ selected: isCellSelected(r - 1, c - 1) }"
              @mousedown="startSelect(r - 1, c - 1)"
              @mouseover="moveSelect(r - 1, c - 1)"
              @mouseup="endSelect"
              @touchstart.prevent="startSelect(r - 1, c - 1)"
              @touchmove.prevent="handleTouchMove"
              @touchend.prevent="endSelect"
              :style="{ display: isCellHidden(r - 1, c - 1) ? 'none' : '' }"
              :rowspan="getCellRowSpan(r - 1, c - 1)"
            >
              <div
                v-if="getCourseForCell(r - 1, c - 1)"
                class="course-item"
                :style="{
                  background: getCourseForCell(r - 1, c - 1).color,
                  color: getContrastColor(getCourseForCell(r - 1, c - 1).color)
                }"
                @touchstart.stop
                @touchend.stop="handleCourseItemTap(r - 1, c - 1, $event)"
              >
                <strong>
                  {{ getCourseForCell(r - 1, c - 1).name }}
                  <span v-if="getCourseForCell(r - 1, c - 1).code">
                    （{{ getCourseForCell(r - 1, c - 1).code }}）
                  </span>
                </strong><br>
                {{ getCourseForCell(r - 1, c - 1).teacher }}<br>
                {{ getCourseForCell(r - 1, c - 1).weeks }}<br>
                {{ getCourseForCell(r - 1, c - 1).room }}
                <button
                  class="delete-btn"
                  :class="{
                    hidden: isTouchDevice && !isDeleteBtnVisible(r - 1, c - 1),
                    visible: isTouchDevice && isDeleteBtnVisible(r - 1, c - 1)
                  }"
                  :data-device-type="isTouchDevice ? 'touch' : 'desktop'"
                  @mousedown.stop
                  @touchstart.stop
                  @click.stop="deleteCourse(getCourseForCell(r - 1, c - 1))"
                  @touchend.stop.prevent="deleteCourse(getCourseForCell(r - 1, c - 1))"
                >×</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 添加课程弹窗（修复显示+统一风格） -->
    <div id="course-modal" class="modal" v-show="modalVisible">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ editingCourseIndex !== null ? '编辑课程' : '添加课程' }}</h3>
          <button class="modal-close-btn" @click="closeModal">✖</button>
        </div>

        <label>课程名称</label>
        <input
          id="course-name"
          class="input"
          v-model="formData.name"
          @input="clearCourseWarning"
        >

        <label>课程编号（可选）</label>
        <input
          id="course-code"
          class="input"
          v-model="formData.code"
          @input="clearCourseWarning"
        >

        <label>教师</label>
        <input
          id="course-teacher"
          class="input"
          v-model="formData.teacher"
          @input="clearCourseWarning"
        >

        <label>周数（如 1-18）</label>
        <input
          id="course-weeks"
          class="input"
          v-model="formData.weeks"
          @input="clearCourseWarning"
        >

        <label>教室</label>
        <input
          id="course-room"
          class="input"
          v-model="formData.room"
          @input="clearCourseWarning"
        >

        <label>课程颜色</label>
        <div id="course-colors" class="color-choices">
          <button
            v-for="swatch in colorSwatches"
            :key="swatch"
            type="button"
            class="color-swatch"
            :data-color="swatch"
            :style="{ background: swatch }"
            :class="{ selected: formData.color === swatch }"
            @click="selectColor(swatch)"
            aria-label="color"
          ></button>
          <input
            id="course-color-picker"
            class="color-picker"
            type="color"
            v-model="formData.color"
            @input="selectColor(formData.color)"
            title="自定义颜色"
          >
        </div>

        <div class="modal-buttons">
          <div
            id="course-warning"
            class="modal-warning"
            v-show="warningVisible"
          >{{ warningMsg }}</div>
          <button id="save-course" @click="saveCourse">✓ 保存</button>
          <button id="cancel-course" @click="closeModal">✖ 取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CourseTable',
  data() {
    return {
      // 核心数据
      courses: [],
      rows: 12, // 节次数量
      cols: 7,  // 星期列数（周一到周日）
      
      // 选择状态
      selecting: false,
      selectedCells: [], // 格式: [{ row: number, col: number }]
      disableSelect: false,
      
      // 弹窗状态
      modalVisible: false,
      warningVisible: false,
      warningMsg: '',
      
      // 表单数据
      formData: {
        name: '',
        code: '',
        teacher: '',
        weeks: '',
        room: '',
        color: '#a8c6ff'
      },
      
      // 编辑状态
      editingCourseIndex: null,
      activeCourseCell: null,
      isTouchDevice: false,
      
      // 触屏双击状态
      lastTapTime: 0,
      lastTapCell: null,
      TAP_TIMEOUT: 350,
      
      // 颜色预设（统一风格配色）
      colorSwatches: [
        '#a8c6ff',
        '#ffd7a8',
        '#b8f2d8',
        '#f8b8d8',
        '#e8a8ff', // 新增紫色系（与备忘录统一）
        '#ffc8a8'
      ]
    };
  },
  mounted() {
    // 初始化设备检测
    this.isTouchDevice = matchMedia('(pointer: coarse)').matches;
    const pointerQuery = matchMedia('(pointer: coarse)');
    pointerQuery.addEventListener('change', (e) => {
      this.isTouchDevice = e.matches;
      this.$forceUpdate(); // 强制更新视图
    });
    // ==========核心新增：初始化加载本地存储的课程数据==========
    this.loadCoursesFromLocalStorage();
  },
  methods: {
    // ==========【核心新增】本地存储 方法（和备忘录/账本完全一致）==========
    // 从本地缓存加载课程表数据
    loadCoursesFromLocalStorage() {
      const savedCourses = localStorage.getItem('campusCourses');
      if (savedCourses) {
        try {
          this.courses = JSON.parse(savedCourses);
        } catch (e) {
          // 解析失败用空数组
          this.courses = [];
        }
      } else {
        // 无缓存数据时为空
        this.courses = [];
      }
    },
    // 保存课程表数据到本地缓存
    saveCoursesToLocalStorage() {
      localStorage.setItem('campusCourses', JSON.stringify(this.courses));
    },

    // 颜色工具方法
    hexToLuma(hex) {
      const c = hex.replace('#', '');
      const r = parseInt(c.substring(0, 2), 16) / 255;
      const g = parseInt(c.substring(2, 4), 16) / 255;
      const b = parseInt(c.substring(4, 6), 16) / 255;
      const a = [r, g, b].map(v => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
      return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
    },
    getContrastColor(hex) {
      const l = this.hexToLuma(hex);
      return l > 0.5 ? '#002b59' : '#ffffff';
    },
    selectColor(hex) {
      this.formData.color = hex;
    },
    
    // 警告控制
    showCourseWarning(msg) {
      this.warningVisible = true;
      this.warningMsg = msg;
    },
    clearCourseWarning() {
      this.warningVisible = false;
      this.warningMsg = '';
    },
    
    // 选择逻辑
    startSelect(row, col) {
      if (this.disableSelect) return;
      this.selecting = true;
      this.selectedCells = [];
      this.selectCell(row, col);
    },
    moveSelect(row, col) {
      if (this.disableSelect || !this.selecting) return;
      this.selectCell(row, col);
    },
    endSelect() {
      if (this.disableSelect) return;
      this.selecting = false;
      
      if (this.selectedCells.length > 0) {
        // 重置编辑状态
        this.editingCourseIndex = null;
        // 清空表单
        this.formData = {
          name: '',
          code: '',
          teacher: '',
          weeks: '',
          room: '',
          color: '#a8c6ff'
        };
        // 打开弹窗
        this.openCourseForm();
      }
    },
    selectCell(row, col) {
      const cell = { row, col };
      const isSelected = this.selectedCells.some(c => c.row === row && c.col === col);
      if (!isSelected) {
        this.selectedCells.push(cell);
      }
    },
    isCellSelected(row, col) {
      return this.selectedCells.some(c => c.row === row && c.col === col);
    },
    clearSelection() {
      this.selectedCells = [];
    },
    
    // 触摸处理
    handleTouchMove(e) {
      const t = e.touches[0];
      if (!t) return;
      const el = document.elementFromPoint(t.clientX, t.clientY);
      if (el && el.tagName === 'TD' && el.dataset) {
        const row = parseInt(el.dataset.row);
        const col = parseInt(el.dataset.col);
        this.selectCell(row, col);
      }
    },
    
    // 弹窗控制
    openCourseForm() {
      this.modalVisible = true;
      this.clearCourseWarning();
    },
    closeModal() {
      this.modalVisible = false;
      this.clearSelection();
      this.editingCourseIndex = null;
    },
    
    // 课程操作
    saveCourse() {
      // 验证表单
      const { name, code, teacher, weeks, room } = this.formData;
      if (!name && !code && !teacher && !weeks && !room) {
        this.showCourseWarning('请填写至少一项课程信息（例如：课程名称、教师或教室），以便区分课程。');
        return;
      }
      
      const courseData = {
        ...this.formData,
        cells: [...this.selectedCells]
      };
      
      if (this.editingCourseIndex !== null) {
        // 编辑现有课程
        this.courses[this.editingCourseIndex] = courseData;
      } else {
        // 新增课程
        this.courses.push(courseData);
      }
      // ==========核心新增：保存后同步到本地缓存==========
      this.saveCoursesToLocalStorage();
      
      // 重置状态
      this.clearSelection();
      this.closeModal();
      this.editingCourseIndex = null;
      this.activeCourseCell = null;
    },
    deleteCourse(course) {
      this.courses = this.courses.filter(c => c !== course);
      // ==========核心新增：删除后同步到本地缓存==========
      this.saveCoursesToLocalStorage();
    },
    clearAllCourses() {
      this.courses = [];
      // ==========核心新增：清空后同步到本地缓存==========
      this.saveCoursesToLocalStorage();
    },
    
    // 单元格辅助方法
    getCourseForCell(row, col) {
      // 找到包含该单元格的课程（主单元格）
      return this.courses.find(course => {
        const minR = Math.min(...course.cells.map(c => c.row));
        const maxR = Math.max(...course.cells.map(c => c.row));
        const courseCol = course.cells[0].col;
        
        return col === courseCol && row === minR;
      });
    },
    isCellHidden(row, col) {
      // 检查单元格是否被合并隐藏
      for (const course of this.courses) {
        const minR = Math.min(...course.cells.map(c => c.row));
        const maxR = Math.max(...course.cells.map(c => c.row));
        const courseCol = course.cells[0].col;
        
        if (col === courseCol && row > minR && row <= maxR) {
          return true;
        }
      }
      return false;
    },
    getCellRowSpan(row, col) {
      // 获取单元格的rowspan值
      const course = this.getCourseForCell(row, col);
      if (course) {
        const rows = course.cells.map(c => c.row);
        return Math.max(...rows) - Math.min(...rows) + 1;
      }
      return 1;
    },
    isDeleteBtnVisible(row, col) {
      // 控制删除按钮显示状态
      if (!this.isTouchDevice) return false;
      const course = this.getCourseForCell(row, col);
      return this.activeCourseCell === course;
    },
    
    // 触屏双击处理
    handleCourseItemTap(row, col, e) {
      if (!this.isTouchDevice) return;
      
      const now = Date.now();
      const tappedCell = { row, col };
      const course = this.getCourseForCell(row, col);
      const tappedDelete = e.target.closest && e.target.closest('.delete-btn');
      
      // 检查是否是双击
      const isSecondTap = 
        this.lastTapCell && 
        this.lastTapCell.row === row && 
        this.lastTapCell.col === col && 
        !tappedDelete && 
        (now - this.lastTapTime <= this.TAP_TIMEOUT);
      
      if (isSecondTap) {
        // 进入编辑模式
        this.editingCourseIndex = this.courses.indexOf(course);
        
        // 选中课程对应的单元格
        this.selectedCells = course.cells.map(c => ({ row: c.row, col: c.col }));
        
        // 填充表单
        this.formData = { ...course };
        
        // 打开弹窗
        this.openCourseForm();
        
        // 重置双击状态
        this.lastTapTime = 0;
        this.lastTapCell = null;
        this.activeCourseCell = null;
      } else {
        // 第一次点击：显示删除按钮
        this.activeCourseCell = course;
        this.lastTapTime = now;
        this.lastTapCell = tappedCell;
        
        // 隐藏其他删除按钮
        this.$forceUpdate();
      }
    }
  }
};
</script>

<style scoped>
/* 全局容器 - 统一渐变背景 */
#course-table-container {
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  background: radial-gradient(circle at center, rgb(222, 189, 241) 0%, rgba(245, 230, 255, 0) 100%);
  padding: 40px 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, '微软雅黑', sans-serif;
  max-width: 800px;
  margin: 0 auto;
  box-sizing: border-box;
}

/* 标题区域（统一风格） */
.course-header {
  margin-bottom: 20px;
  width: 100%;
}

.course-header h2 {
  margin-bottom: 10px;
  font-size: 2.2em;
  color: #2c3e50;
}

.course-header p {
  font-size: 1.2em;
  color: #7f8c8d;
  margin-bottom: 20px;
}

/* 包裹器，允许在小屏横向滚动表格 */
#course-table-wrapper {
  width: 100%;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
  border-radius: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  margin-bottom: 20px;
}

#course-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  background: white;
}

#course-table th, #course-table td {
  border: 1px solid #ddd;
  height: 60px;
  text-align: center;
  position: relative;
	padding: 5px;
  box-sizing: border-box;
}

/* 表头样式统一 */
#course-table th {
  background: linear-gradient(135deg, rgb(207, 157, 241) 0%, rgb(149, 65, 205) 100%);
  color: white;
  font-weight: 600;
}

.controls {
  margin: 10px 15px;
  text-align: right;
}

.controls button {
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  color: white;
  border: none;
  padding: 10px 18px;
	border-radius: 15px;
  transition: all 0.3s ease;
  font-size: 1em;
  font-weight: 600;
  cursor: pointer;
}

.controls button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

/* 选中单元格样式 */
.selected {
  background: rgba(207, 157, 241, 0.2);
}

/* 课程卡片样式（统一风格） */
.course-item {
  height: 100%;
  width: 100%;
  position: relative;
  padding: 8px;
  box-sizing: border-box;
  border-radius: 10px;
  font-size: 13px;
  line-height: 1.5;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}

.course-item strong {
  font-size: 14px;
  font-weight: 600;
}

/* 删除按钮样式统一 */
.delete-btn {
  position: absolute;
  top: 3px;
  right: 3px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  line-height: 16px;
  font-size: 12px;
  opacity: 0;
  cursor: pointer;
  transition: all 0.3s ease;
}

.course-item:hover .delete-btn {
  opacity: 1;
}

.delete-btn.hidden {
  opacity: 0 !important;
}

.delete-btn.visible {
  opacity: 1 !important;
}

/* 弹窗样式（完全统一） */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal-content {
  background: white;
  padding: 25px;
  width: 90%;
  max-width: 400px;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  position: relative;
  box-sizing: border-box;
}

/* 弹窗头部 */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.5em;
  color: #2c3e50;
}

.modal-close-btn {
	border: 1px solid #888;
  background: #eee;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.modal-close-btn:hover {
  background: #e74c3c;
  color: white;
  border-color: #e74c3c;
}

/* 输入框样式统一 */
.input {
  width: 100%;
  padding: 12px 15px;
  margin-bottom: 15px;
  border: 1px solid #ddd;
  border-radius: 10px;
  font-size: 1em;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.input:focus {
  outline: none;
  border-color: rgb(207, 157, 241);
  box-shadow: 0 0 0 3px rgba(207, 157, 241, 0.2);
}

/* 警告提示样式统一 */
.modal-warning {
  color: #b00;
  background: linear-gradient(180deg,#fff6f7,#ffecec);
  border: 1px solid #f2c6c9;
  padding: 12px 15px;
  border-radius: 10px;
  font-size: 0.9em;
  margin-bottom: 15px;
  box-shadow: 0 2px 6px rgba(200,90,100,0.08);
  text-align: left;
}

/* 颜色选择区域 */
.color-choices {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 20px;
}

.color-swatch {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 2px solid transparent;
  cursor: pointer;
  padding: 0;
  transition: all 0.3s ease;
}

.color-swatch.selected {
  border-color: rgb(149, 65, 205);
  box-shadow: 0 0 0 3px rgba(207, 157, 241, 0.2);
  transform: translateY(-2px);
}

.color-picker {
  width: 38px;
  height: 38px;
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: 8px;
}

/* 弹窗按钮区域 */
.modal-buttons {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 15px;
}

.modal-buttons button {
  padding: 12px 20px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  font-size: 1em;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

#save-course {
  background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
  color: white;
}

#cancel-course {
  background: #f8f9fa;
  color: #7f8c8d;
  border: 1px solid #ddd;
}

.modal-buttons button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

/* 响应式适配（统一风格） */
@media (max-width: 768px) {
  #course-table-container {
    padding: 20px 10px;
    max-width: 100%;
  }
  
  #course-table th, #course-table td {
    height: 80px;
    font-size: 0.9em;
  }
  
  .course-header h2 {
    font-size: 1.8em;
  }
  
  .course-header p {
    font-size: 1em;
  }
}

@media (max-width: 420px) {
  .modal-content {
    width: 95%;
    padding: 20px 15px;
    max-height: 90vh;
    overflow-y: auto;
  }
  
  .modal-buttons {
    flex-direction: column;
    gap: 8px;
  }
  
  .modal-buttons button {
    width: 100%;
    justify-content: center;
    padding: 10px 0;
  }
  
  .color-swatch {
    width: 36px;
    height: 36px;
  }
  
  .color-picker {
    width: 42px;
    height: 42px;
  }
  
  .delete-btn {
    opacity: 1;
    width: 28px;
    height: 28px;
    line-height: 26px;
    font-size: 18px;
    top: 2px;
    right: 2px;
  }
  
  .controls button {
    width: 100%;
    margin-bottom: 10px;
  }
}
</style>