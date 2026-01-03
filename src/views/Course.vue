<template>
  <div id="course-table-container">
    <div id="course-table-wrapper">
      <!-- 标题区域（和备忘录完全一致） -->
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

    <!-- 添加课程弹窗（和备忘录弹窗样式一致） -->
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
      courses: [],
      rows: 12,
      cols: 7,
      selecting: false,
      selectedCells: [],
      disableSelect: false,
      modalVisible: false,
      warningVisible: false,
      warningMsg: '',
      formData: {
        name: '',
        code: '',
        teacher: '',
        weeks: '',
        room: '',
        color: '#a8c6ff'
      },
      editingCourseIndex: null,
      activeCourseCell: null,
      isTouchDevice: false,
      lastTapTime: 0,
      lastTapCell: null,
      TAP_TIMEOUT: 350,
      colorSwatches: [
        '#a8c6ff',
        '#ffd7a8',
        '#b8f2d8',
        '#f8b8d8',
        '#e8a8ff',
        '#ffc8a8'
      ]
    };
  },
  mounted() {
    // 设备检测（和备忘录一致）
    this.isTouchDevice = matchMedia('(pointer: coarse)').matches;
    const pointerQuery = matchMedia('(pointer: coarse)');
    pointerQuery.addEventListener('change', (e) => {
      this.isTouchDevice = e.matches;
      this.$forceUpdate();
    });
    // 加载本地存储数据
    this.loadCoursesFromLocalStorage();
  },
  methods: {
    // 本地存储方法（和备忘录、记账本完全一致）
    loadCoursesFromLocalStorage() {
      const savedCourses = localStorage.getItem('campusCourses');
      if (savedCourses) {
        try {
          this.courses = JSON.parse(savedCourses);
        } catch (e) {
          this.courses = [];
        }
      } else {
        this.courses = [];
      }
    },
    saveCoursesToLocalStorage() {
      localStorage.setItem('campusCourses', JSON.stringify(this.courses));
    },

    // 颜色对比方法（保留）
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
    
    // 警告控制（保留）
    showCourseWarning(msg) {
      this.warningVisible = true;
      this.warningMsg = msg;
    },
    clearCourseWarning() {
      this.warningVisible = false;
      this.warningMsg = '';
    },
    
    // 选择逻辑（保留原有，不新增复杂功能）
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
        this.editingCourseIndex = null;
        this.formData = {
          name: '',
          code: '',
          teacher: '',
          weeks: '',
          room: '',
          color: '#a8c6ff'
        };
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
    
    // 触摸处理（保留原有）
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
    
    // 弹窗控制（保留）
    openCourseForm() {
      this.modalVisible = true;
      this.clearCourseWarning();
    },
    closeModal() {
      this.modalVisible = false;
      this.clearSelection();
      this.editingCourseIndex = null;
    },
    
    // 课程操作（保留）
    saveCourse() {
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
        this.courses[this.editingCourseIndex] = courseData;
      } else {
        this.courses.push(courseData);
      }
      this.saveCoursesToLocalStorage();
      
      this.clearSelection();
      this.closeModal();
      this.editingCourseIndex = null;
      this.activeCourseCell = null;
    },
    deleteCourse(course) {
      this.courses = this.courses.filter(c => c !== course);
      this.saveCoursesToLocalStorage();
    },
    clearAllCourses() {
      this.courses = [];
      this.saveCoursesToLocalStorage();
    },
    
    // 单元格辅助方法（保留）
    getCourseForCell(row, col) {
      return this.courses.find(course => {
        const minR = Math.min(...course.cells.map(c => c.row));
        const maxR = Math.max(...course.cells.map(c => c.row));
        const courseCol = course.cells[0].col;
        
        return col === courseCol && row === minR;
      });
    },
    isCellHidden(row, col) {
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
      const course = this.getCourseForCell(row, col);
      if (course) {
        const rows = course.cells.map(c => c.row);
        return Math.max(...rows) - Math.min(...rows) + 1;
      }
      return 1;
    },
    isDeleteBtnVisible(row, col) {
      if (!this.isTouchDevice) return false;
      const course = this.getCourseForCell(row, col);
      return this.activeCourseCell === course;
    },
    
    // 触屏双击处理（保留）
    handleCourseItemTap(row, col, e) {
      if (!this.isTouchDevice) return;
      
      const now = Date.now();
      const tappedCell = { row, col };
      const course = this.getCourseForCell(row, col);
      const tappedDelete = e.target.closest && e.target.closest('.delete-btn');
      
      const isSecondTap = 
        this.lastTapCell && 
        this.lastTapCell.row === row && 
        this.lastTapCell.col === col && 
        !tappedDelete && 
        (now - this.lastTapTime <= this.TAP_TIMEOUT);
      
      if (isSecondTap) {
        this.editingCourseIndex = this.courses.indexOf(course);
        this.selectedCells = course.cells.map(c => ({ row: c.row, col: c.col }));
        this.formData = { ...course };
        this.openCourseForm();
        this.lastTapTime = 0;
        this.lastTapCell = null;
        this.activeCourseCell = null;
      } else {
        this.activeCourseCell = course;
        this.lastTapTime = now;
        this.lastTapCell = tappedCell;
        this.$forceUpdate();
      }
    }
  }
};
</script>

<style scoped>
/* 全局容器 - 完全复刻备忘录的全屏自适应 */
#course-table-container {
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  background: radial-gradient(circle at center, rgb(222, 189, 241) 0%, rgba(245, 230, 255, 0) 100%);
  padding: 20px 15px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, '微软雅黑', sans-serif;
  box-sizing: border-box;
  margin: 0 auto;
}

/* 标题样式 - 和备忘录完全一致 */
.course-header {
  margin-bottom: 10px;
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

/* 表格包裹器 - 核心：移动端横向滚动（和备忘录列表滚动一致） */
#course-table-wrapper {
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch; /* 移动端弹性滚动 */
  border-radius: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  margin-bottom: 20px;
  -ms-overflow-style: none;
  scrollbar-width: none;
}
#course-table-wrapper::-webkit-scrollbar {
  display: none;
}

/* 表格样式 - 适配核心 */
#course-table {
  width: 100%;
  min-width: 600px; /* 保证表格最小宽度，小屏横向滚动 */
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
  word-wrap: break-word;
  word-break: break-all;
}

/* 表头样式 的渐变和粘性定位 */
#course-table th {
  background: linear-gradient(135deg, rgb(207, 157, 241) 0%, rgb(149, 65, 205) 100%);
  color: white;
  font-weight: 600;
  position: sticky;
  top: 0;
  z-index: 10;
}
#course-table th:first-child,
#course-table td:first-child {
  position: sticky;
  left: 0;
  background: white;
  z-index: 20;
  font-weight: 600;
}
#course-table th:first-child {
  background: linear-gradient(135deg, rgb(149, 65, 205) 0%, rgb(207, 157, 241) 100%);
  color: white;
}

/* 控制按钮 按钮样式 */
.controls {
  margin: 10px 0;
  text-align: right;
  width: 100%;
  padding: 0 5px;
  box-sizing: border-box;
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

/* 课程卡片 的卡片样式 */
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
  overflow: hidden;
}
.course-item strong {
  font-size: 14px;
  font-weight: 600;
}

/* 删除按钮 - 和备忘录删除按钮样式一致 */
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

/* 弹窗样式 - 完全复刻备忘录弹窗 */
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
  padding: 15px;
  box-sizing: border-box;
}
.modal-content {
  background: white;
  padding: 25px;
  width: 100%;
  max-width: 460px;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  position: relative;
  box-sizing: border-box;
  max-height: 92vh;
  overflow-y: auto;
}
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

/* 输入框 输入框 */
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

/* 警告提示  */
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

/* 颜色选择器  */
.color-choices {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
}
.color-swatch {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
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
  border: none;
  border-radius: 8px;
}

/* 弹窗按钮  */
.modal-buttons {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 15px;
  width: 100%;
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

/* 平板端 768px以下 */
@media (max-width: 768px) {
  #course-table-container {
    padding: 15px 8px;
  }
  .course-header h2 {
    font-size: 1.8em;
  }
  .course-header p {
    font-size: 1em;
    margin-bottom: 15px;
  }
  #course-table th, #course-table td {
    height: 70px;
    font-size: 0.9em;
    padding: 3px;
  }
  .course-item {
    font-size: 12px;
    padding: 5px;
  }
  .course-item strong {
    font-size: 13px;
  }
}

/* 手机端 420px以下 */
@media (max-width: 420px) {
  #course-table-container {
    padding: 10px 5px;
  }
  .course-header h2 {
    font-size: 1.6em;
  }
  .course-header p {
    font-size: 0.95em;
    margin-bottom: 10px;
  }
  #course-table th, #course-table td {
    height: 80px;
    font-size: 0.85em;
  }
  .controls {
    text-align: center;
  }
  .controls button {
    width: 100%;
    padding: 10px 0;
    margin-bottom: 8px;
  }
  .modal-content {
    width: 98%;
    padding: 20px 15px;
    max-height: 95vh;
  }
  .modal-buttons {
    flex-direction: column;
    gap: 8px;
  }
  .modal-buttons button {
    width: 100%;
    justify-content: center;
  }
  .delete-btn {
    opacity: 1;
    width: 22px;
    height: 22px;
    line-height: 20px;
    font-size: 14px;
  }
}

/* 小屏手机 375px以下 */
@media (max-width: 375px) {
  #course-table th, #course-table td {
    height: 70px;
  }
  .course-item {
    padding: 3px;
    font-size: 11px;
  }
  .delete-btn {
    width: 20px;
    height: 20px;
    line-height: 18px;
    font-size: 12px;
  }
}

/* 横屏适配 */
@media (orientation: landscape) and (max-width: 768px) {
  #course-table-container {
    padding: 10px 5px;
  }
  #course-table th, #course-table td {
    height: 50px;
  }
  .modal-content {
    max-height: 98vh;
    width: 85%;
  }
}
</style>