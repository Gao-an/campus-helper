<template>
  <div class="memo-container">
    <!-- 标题区域 -->
    <h2>📝 备忘录</h2>
    <p>欢迎使用备忘录，随手记录你的重要事项</p>

    <!-- 搜索栏 -->
    <div class="memo-header">
      <input
        v-model="searchText"
        class="memo-search"
        placeholder="搜索…"
        @keypress.enter="handleSearch"
      />
      <button class="memo-search-btn" @click="handleSearch">🔍</button>
    </div>

    <!-- 列表 -->
    <div class="memo-list" :class="{ 'search-animate': searchAnimate }">
      <div
        class="memo-item"
        v-for="m in currentMemos"
        :key="m.id"
      >
        <div
          class="memo-item-title"
          :title="m.title || '(无标题)'"
        >
          {{ m.title || '(无标题)' }}
        </div>
        <!-- 展开按钮 -->
        <button 
          class="memo-expand-btn"
          @click="openDetail(m.id)"
        >展开</button>
        <div
          v-if="selectMode"
          class="memo-select-box"
          :class="{ selected: m.selected }"
          @click="toggleSelect(m)"
        >
          <span v-if="m.selected" class="select-icon">✓</span>
        </div>
      </div>
    </div>

    <!-- 底部按钮 -->
    <div class="memo-footer">
      <button
        class="memo-btn back-btn"
        v-show="selectMode"
        @click="exitSelect"
      >返回</button>
      <button
        class="memo-btn select-btn"
        v-show="!selectMode"
        @click="enterSelectMode"
      >选择</button>
      <button
        class="memo-btn new-btn"
        v-show="!selectMode"
        @click="openDetail(null)"
      >新建</button>
      <button
        class="memo-btn delete-btn"
        v-show="selectMode"
        @click="deleteSelectedMemos"
      >删除</button>
    </div>

    <!-- 详情界面 -->
    <div
      class="memo-detail"
      v-show="detailVisible"
    >
      <div class="memo-detail-header">
        <button
          class="memo-close-btn"
          @click="handleDetailCancel"
        >✖</button>
      </div>

      <input
        v-model="currentMemo.title"
        class="memo-title"
        placeholder="标题…"
        @input="clearWarning"
      />
      <div
        class="memo-warning"
        v-show="warningVisible"
      >{{ warningMsg }}</div>
      <textarea
        v-model="currentMemo.content"
        class="memo-content"
        placeholder="正文…"
        @input="clearWarning"
      ></textarea>

      <div class="memo-tags">
        <span
          class="memo-tag"
          v-for="tag in currentMemo.tags"
          :key="tag"
          :data-tag="tag"
        >
          <span>{{ tag }}</span>
          <button
            class="memo-tag-delete"
            @click.stop="removeTag(tag)"
          >✖</button>
        </span>

        <div
          class="memo-tag-add"
          v-if="currentMemo.tags.length < 3"
          @click="showTagInput = true"
        >+</div>

        <div
          class="memo-tag-input-box"
          v-if="showTagInput"
        >
          <input
            v-model="newTagText"
            class="memo-tag-input"
            placeholder="新标签（≤4字）"
            maxlength="12"
            @input="checkTagLength"
          />
          <!-- 标签确认/取消按钮 -->
          <button class="memo-tag-btn confirm" @click="addNewTag">✓</button>
          <button class="memo-tag-btn cancel" @click="showTagInput = false">✖</button>
          <div
            class="memo-tag-error"
            v-show="tagErrorVisible"
          >{{ tagErrorMsg }}</div>
        </div>
      </div>

      <!-- 新增：确认保存按钮 -->
      <div class="memo-detail-footer">
        <button 
          class="memo-confirm-btn"
          @click="handleDetailConfirm"
        >确认</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MemoModule',
  data() {
    return {
      // 备忘录数据（从本地存储加载）
      memos: [],
      // 选择模式
      selectMode: false,
      // 编辑中的ID
      editingId: null,
      // 搜索文本
      searchText: '',
      // 实际展示的备忘录（搜索后）
      currentMemos: [],
      // 搜索动画标识
      searchAnimate: false,
      // 详情页显隐
      detailVisible: false,
      // 当前编辑的备忘录
      currentMemo: {
        title: '',
        content: '',
        tags: []
      },
      // 备份原始数据（用于取消时恢复）
      originalMemo: null,
      // 警告相关
      warningVisible: false,
      warningMsg: '',
      // 标签相关
      showTagInput: false,
      newTagText: '',
      tagErrorVisible: false,
      tagErrorMsg: ''
    };
  },
  mounted() {
    // 初始化：从本地存储加载数据
    this.loadMemosFromLocalStorage();
    // 初始化显示所有备忘录
    this.currentMemos = [...this.memos];
  },
  methods: {
    // 从本地存储加载备忘录
    loadMemosFromLocalStorage() {
      const savedMemos = localStorage.getItem('campusMemos');
      if (savedMemos) {
        try {
          this.memos = JSON.parse(savedMemos);
        } catch (e) {
          // 解析失败时使用默认数据
          this.memos = [
            { id: 1, title: "买菜清单", content: "鸡蛋 牛奶 西红柿", tags: ["生活"] },
            { id: 2, title: "学习计划", content: "写JS 项目优化", tags: ["重要","学习"] },
            { id: 3, title: "约见朋友", content: "周五下午 3 点", tags: [] }
          ];
          // 保存默认数据到本地存储
          this.saveMemosToLocalStorage();
        }
      } else {
        // 无本地数据时使用默认数据
        this.memos = [
          { id: 1, title: "买菜清单", content: "鸡蛋 牛奶 西红柿", tags: ["生活"] },
          { id: 2, title: "学习计划", content: "写JS 项目优化", tags: ["重要","学习"] },
          { id: 3, title: "约见朋友", content: "周五下午 3 点", tags: [] }
        ];
        // 保存默认数据到本地存储
        this.saveMemosToLocalStorage();
      }
    },
    // 保存备忘录到本地存储
    saveMemosToLocalStorage() {
      localStorage.setItem('campusMemos', JSON.stringify(this.memos));
      // 同步更新展示数据（确保搜索状态下也能同步）
      this.currentMemos = [...this.memos];
    },
    // 处理搜索（点击按钮/回车触发）
    handleSearch() {
      const filter = this.searchText.trim();
      // 过滤数据
      this.currentMemos = this.memos.filter(m => 
        m.title.includes(filter) ||
        m.content.includes(filter) ||
        m.tags.some(t => t.includes(filter))
      );
      // 触发搜索动画
      this.searchAnimate = true;
      setTimeout(() => {
        this.searchAnimate = false;
      }, 500);
    },
    // 进入选择模式
    enterSelectMode() {
      this.selectMode = true;
      // 初始化选中状态
      this.currentMemos.forEach(m => m.selected = false);
    },
    // 退出选择模式
    exitSelect() {
      this.selectMode = false;
      this.currentMemos.forEach(m => delete m.selected);
    },
    // 切换选中状态
    toggleSelect(memo) {
      memo.selected = !memo.selected;
    },
    // 删除选中的备忘录
    deleteSelectedMemos() {
      // 同步更新原始数据
      this.memos = this.memos.filter(m => !m.selected);
      // 同步更新展示数据
      this.currentMemos = this.currentMemos.filter(m => !m.selected);
      // 保存到本地存储
      this.saveMemosToLocalStorage();
      this.exitSelect();
    },
    // 打开详情页
    openDetail(id) {
      this.detailVisible = true;
      this.clearWarning();
      this.editingId = id;

      if (id === null) {
        // 新建
        this.currentMemo = { title: '', content: '', tags: [] };
        this.originalMemo = null; // 新建无原始数据
      } else {
        // 编辑：备份原始数据
        const memo = this.memos.find(x => x.id === id);
        this.currentMemo = { ...memo };
        this.originalMemo = { ...memo }; // 深拷贝备份
      }

      // 重置标签输入状态
      this.showTagInput = false;
      this.newTagText = '';
      this.tagErrorVisible = false;
      this.tagErrorMsg = '';
    },
    // 处理详情页取消（叉号按钮，不保存）
    handleDetailCancel() {
      // 编辑状态：恢复原始数据
      if (this.originalMemo) {
        const index = this.memos.findIndex(x => x.id === this.editingId);
        if (index !== -1) {
          this.memos[index] = { ...this.originalMemo };
          this.saveMemosToLocalStorage();
        }
      }
      // 关闭详情页
      this.detailVisible = false;
      this.clearWarning();
      // 刷新展示数据
      this.currentMemos = [...this.memos];
    },
    // 处理详情页确认（对勾按钮，保存）
    handleDetailConfirm() {
      const title = this.currentMemo.title.trim();
      const content = this.currentMemo.content.trim();
      const tags = [...this.currentMemo.tags];

      // 有内容但无标题的警告
      if (title === "" && (tags.length > 0 || content !== "")) {
        this.showWarning("有正文或标签但没有标题，请填写标题或删除正文/标签。");
        return;
      }

      // 新建且为空 → 不保存直接关闭
      if (this.editingId === null) {
        if (title === "" && content === "") {
          this.detailVisible = false;
          return;
        }
        // 新建保存
        const newMemo = {
          id: Date.now(), // 用时间戳作为唯一ID
          title,
          content,
          tags
        };
        this.memos.push(newMemo);
        // 保存到本地存储
        this.saveMemosToLocalStorage();
        this.detailVisible = false;
        return;
      }

      // 编辑且为空 → 删除
      if (title === "" && content === "") {
        this.memos = this.memos.filter(m => m.id !== this.editingId);
        // 保存到本地存储
        this.saveMemosToLocalStorage();
        this.detailVisible = false;
        return;
      }

      // 普通编辑保存
      const index = this.memos.findIndex(x => x.id === this.editingId);
      if (index !== -1) {
        this.memos[index] = {
          ...this.memos[index],
          title,
          content,
          tags
        };
        // 保存到本地存储
        this.saveMemosToLocalStorage();
      }

      // 关闭详情页
      this.detailVisible = false;
      this.clearWarning();
      // 刷新展示数据
      this.currentMemos = [...this.memos];
    },
    // 处理原叉号按钮的保存逻辑（兼容旧逻辑，实际已改为取消）
    handleDetailClose() {
      this.handleDetailCancel();
    },
    // 显示警告
    showWarning(msg) {
      this.warningVisible = true;
      this.warningMsg = msg;
    },
    // 清除警告
    clearWarning() {
      this.warningVisible = false;
      this.warningMsg = '';
    },
    // 移除标签
    removeTag(tag) {
      this.currentMemo.tags = this.currentMemo.tags.filter(x => x !== tag);
    },
    // 检查标签长度
    checkTagLength() {
      if (this.newTagText.trim().length > 4) {
        this.tagErrorVisible = true;
        this.tagErrorMsg = '不能超过4字';
      } else {
        this.tagErrorVisible = false;
        this.tagErrorMsg = '';
      }
    },
    // 添加新标签
    addNewTag() {
      const nt = this.newTagText.trim();
      if (!nt) {
        this.showTagInput = false;
        return;
      }
      if (nt.length > 4) {
        this.tagErrorVisible = true;
        this.tagErrorMsg = '不能超过4字';
        return;
      }
      this.currentMemo.tags.push(nt);
      this.newTagText = '';
      this.showTagInput = false;
      this.tagErrorVisible = false;
    }
  }
};
</script>

<style scoped>
/* 全局容器 - 统一渐变背景（覆盖整个页面） */
.memo-container {
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  /* 与导航页完全一致的渐变背景 */
  background: radial-gradient(circle at center, rgb(222, 189, 241) 0%, rgba(245, 230, 255, 0) 100%);
  padding: 40px 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  max-width: 500px;
  margin: 0 auto;
  box-sizing: border-box;
}

/* 标题样式 - 与账本统一 */
h2 {
  margin-bottom: 15px;
  font-size: 2.2em;
  color: #2c3e50;
}

/* 副标题样式 - 与账本统一 */
p {
  font-size: 1.2em;
  color: #7f8c8d;
  margin-bottom: 40px;
}

/* 顶部搜索区 */
.memo-header {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  width: 100%;
  max-width: 360px;
}

.memo-search {
  flex: 1;
  padding: 12px 15px;
  border-radius: 15px;
  border: 1px solid #ddd;
  font-size: 1em;
  transition: all 0.3s ease;
}

.memo-search:focus {
  outline: none;
  border-color: rgb(207, 157, 241);
  box-shadow: 0 0 0 3px rgba(207, 157, 241, 0.2);
}

.memo-search-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  background: white;
  border: 1px solid #ddd;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1.2em;
}

.memo-search-btn:hover {
  background-color: #f5f5f5;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

/* 列表区 + 搜索动画 */
.memo-list {
  border: 1px solid #ddd;
  border-radius: 15px;
  height: 330px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 15px;
  width: 100%;
  max-width: 360px;
  background: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  margin-bottom: 20px;
  transition: all 0.5s ease;
}

/* 搜索浮出来动画 */
.memo-list.search-animate {
  transform: translateY(-10px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  opacity: 0.95;
}

.memo-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 8px;
  border-bottom: 1px solid #eee;
  border-radius: 8px;
  margin-bottom: 8px;
  transition: all 0.2s ease;
  gap: 8px;
}

.memo-item:hover {
  background-color: #f8f8f8;
}

.memo-item-title {
  cursor: default; /* 取消点击提示 */
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 1.1em;
  color: #2c3e50;
  text-align: left;
}

/* 展开按钮样式 */
.memo-expand-btn {
  padding: 4px 10px;
  border-radius: 8px;
  border: 1px solid rgb(207, 157, 241);
  background: white;
  color: rgb(149, 65, 205);
  cursor: pointer;
  font-size: 0.85em;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.memo-expand-btn:hover {
  background: linear-gradient(135deg, rgb(149, 65, 205) 0%, rgb(207, 157, 241) 100%);
  color: white;
}

/* 选择框 - 红色对勾样式 */
.memo-select-box {
  width: 24px;
  height: 24px;
  border: 2px solid #ddd;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.memo-select-box.selected {
  background-color: #e74c3c;
  border-color: #e74c3c;
}

.select-icon {
  color: white;
  font-size: 16px;
  font-weight: bold;
}

/* 底部按钮 */
.memo-footer {
  display: flex;
  justify-content: space-between;
  width: 100%;
  max-width: 360px;
  gap: 10px;
  margin-top: auto; /* 固定在内容下方，不遮挡背景 */
  padding-bottom: 20px;
}

.memo-btn {
  padding: 12px 0;
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  font-size: 1em;
  font-weight: 600;
  flex: 1;
}

.select-btn, .new-btn {
  background: linear-gradient(135deg, rgb(149, 65, 205) 0%, rgb(207, 157, 241) 100%);
  color: white;
}

.back-btn {
  background: #f8f9fa;
  color: #7f8c8d;
  border: 1px solid #ddd;
}

.delete-btn {
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  color: white;
}

.memo-btn:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
}

/* 详情（新建/编辑）界面 */
.memo-detail {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  max-width: 400px;
  background: white;
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  z-index: 999;
  box-sizing: border-box;
  overflow-y: auto;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

/* 详情标题栏 */
.memo-detail-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 15px;
}

.memo-close-btn {
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

.memo-close-btn:hover {
  background: #e74c3c;
  color: white;
  border-color: #e74c3c;
}

/* 标题输入框 */
.memo-title {
  font-size: 1.5em;
  font-weight: bold;
  width: 100%;
  margin: 10px 0;
  box-sizing: border-box;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 10px;
  transition: all 0.3s ease;
}

.memo-title:focus {
  outline: none;
  border-color: rgb(207, 157, 241);
  box-shadow: 0 0 0 3px rgba(207, 157, 241, 0.2);
}

/* 警告提示 */
.memo-warning {
  color: #b00;
  background: #fee;
  padding: 10px;
  border-radius: 10px;
  margin-bottom: 15px;
  text-align: left;
  font-size: 0.9em;
}

/* 正文 */
.memo-content {
  width: 100%;
  height: 200px;
  box-sizing: border-box;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 10px;
  font-family: inherit;
  font-size: 1em;
  resize: vertical;
  transition: all 0.3s ease;
  margin-bottom: 15px;
}

.memo-content:focus {
  outline: none;
  border-color: rgb(207, 157, 241);
  box-shadow: 0 0 0 3px rgba(207, 157, 241, 0.2);
}

/* 标签容器 */
.memo-tags {
  margin-top: 15px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-content: flex-start;
  text-align: left;
  margin-bottom: 20px;
}

/* 标签 */
.memo-tag {
  display: inline-flex;
  align-items: center;
  background: #f5f5f5;
  padding: 6px 12px;
  border-radius: 20px;
  margin-right: 5px;
  margin-bottom: 5px;
  position: relative;
  font-size: 0.9em;
}

/* 标签删除按钮 */
.memo-tag-delete {
  display: none;
  position: absolute;
  top: -8px;
  right: -8px;
  width: 20px;
  height: 20px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 12px;
  line-height: 20px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.memo-tag:hover .memo-tag-delete {
  display: flex;
}

/* 加号按钮样式（加粗+hover动效） */
.memo-tag-add {
  width: 36px;
  height: 36px;
  border: 1px solid #ddd;
  border-radius: 50%;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  font-size: 24px; /* 加粗变大 */
  font-weight: 900; /* 极致加粗 */
  background: white;
  transition: all 0.3s ease;
  color: #666;
}

.memo-tag-add:hover {
  background: #2ecc71; /* 绿色背景 */
  color: white; /* 白色加号 */
  border-color: #2ecc71;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(46, 204, 113, 0.3);
}

.memo-tag-input-box {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.memo-tag-input {
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid #ccc;
  font-size: 0.9em;
  width: 120px;
}

/* 标签确认/取消按钮样式 */
.memo-tag-btn {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.memo-tag-btn.confirm {
  background: #2ecc71;
  color: white;
}

.memo-tag-btn.confirm:hover {
  box-shadow: 0 5px 15px rgba(46, 204, 113, 0.3);
  transform: translateY(-2px);
}

.memo-tag-btn.cancel {
  background: #e74c3c;
  color: white;
}

.memo-tag-btn.cancel:hover {
  box-shadow: 0 5px 15px rgba(231, 76, 60, 0.3);
  transform: translateY(-2px);
}

.memo-tag-error {
  color: #e74c3c;
  font-size: 0.8em;
  margin-left: 5px;
  width: 100%;
}

/* 新增：详情页底部确认按钮 */
.memo-detail-footer {
  margin-top: auto;
  display: flex;
  justify-content: flex-end;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.memo-confirm-btn {
  padding: 10px 20px;
  border-radius: 10px;
  border: none;
  background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
  color: white;
  font-size: 1em;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.memo-confirm-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(46, 204, 113, 0.3);
}

/* 响应式：手机端优化 */
@media (max-width: 420px) {
  .memo-container {
    padding: 20px 10px;
    min-height: 100vh;
    width: 100%;
  }

  h2 {
    font-size: 1.8em;
  }

  p {
    font-size: 1em;
    margin-bottom: 30px;
  }

  .memo-header {
    max-width: 100%;
  }

  .memo-search {
    padding: 10px 12px;
    font-size: 16px;
  }

  .memo-search-btn {
    width: 44px;
    height: 44px;
  }

  .memo-list {
    max-width: 100%;
    height: 260px;
    padding: 10px;
  }

  .memo-item {
    padding: 10px 6px;
  }

  .memo-expand-btn {
    padding: 3px 8px;
    font-size: 0.8em;
  }

  .memo-select-box {
    width: 22px;
    height: 22px;
  }

  .memo-footer {
    max-width: 100%;
    flex-direction: column;
    gap: 8px;
    margin-top: auto;
    padding-bottom: 15px;
  }

  .memo-btn {
    padding: 10px 0;
    font-size: 0.9em;
  }

  .memo-detail {
    width: 95%;
    padding: 15px;
  }

  .memo-title {
    font-size: 1.3em;
    padding: 8px;
  }

  .memo-content {
    height: 180px;
    padding: 8px;
  }

  .memo-tag-add {
    width: 32px;
    height: 32px;
    font-size: 20px;
  }

  .memo-confirm-btn {
    padding: 8px 16px;
    font-size: 0.9em;
  }
}
</style>