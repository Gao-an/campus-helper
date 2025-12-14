let selecting = false;
let startCell = null;
let selectedCells = [];
let courses = [];
let disableSelect = false;
let activeCourseCell = null; // 记录当前激活的课程卡
let editingCourseIndex = null; // 编辑中的课程索引（如果有）
// 设备类型动态检测：可在开发工具中切换 PC/Phone 不刷新立即生效
let isTouchDevice = matchMedia('(pointer: coarse)').matches;

const pointerQuery = matchMedia('(pointer: coarse)');
pointerQuery.addEventListener('change', (e) => {
    isTouchDevice = e.matches;
    renderCourses(); // 强制重新绘制，确保按钮逻辑切换正确
});


// 弹窗内联提示控制
function showCourseWarning(msg) {
    const w = document.getElementById('course-warning');
    if (!w) return;
    w.textContent = msg;
    w.style.display = 'block';
}

function clearCourseWarning() {
    const w = document.getElementById('course-warning');
    if (!w) return;
    w.textContent = '';
    w.style.display = 'none';
}

const rows = 12; // 节次数量，可改
const cols = 7;  // 周一到周日

// 渲染空表格
(function initTable() {
    const tbody = document.getElementById("course-body");

    for (let r = 0; r < rows; r++) {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td>第 ${r+1} 节</td>`;

        for (let c = 0; c < cols; c++) {
            const td = document.createElement("td");
            td.dataset.row = r;
            td.dataset.col = c;

            // 鼠标事件（保留原有行为）
            td.onmousedown = startSelect;
            td.onmouseover = moveSelect;
            td.onmouseup = endSelect;

            // 触摸支持：将 touch 坐标映射到表格单元格，复用选择逻辑
            td.addEventListener('touchstart', function (ev) {
                // 阻止默认以防页面滚动影响选择
                ev.preventDefault();
                startSelect.call(this);
            }, {passive:false});

            // touchmove 需要跟踪触点位置并选择对应单元格
            td.addEventListener('touchmove', function (ev) {
                ev.preventDefault();
                const t = ev.touches[0];
                if (!t) return;
                const el = document.elementFromPoint(t.clientX, t.clientY);
                if (el && el.tagName === 'TD' && el.dataset && el.dataset.row !== undefined) {
                    selectCell(el);
                }
            }, {passive:false});

            td.addEventListener('touchend', function (ev) {
                ev.preventDefault();
                endSelect.call(this);
            }, {passive:false});

            tr.appendChild(td);
        }
        tbody.appendChild(tr);
    }
})();

// —— 颜色选择逻辑 ——
function hexToLuma(hex) {
    // hex: #rrggbb
    const c = hex.replace('#','');
    const r = parseInt(c.substring(0,2),16) / 255;
    const g = parseInt(c.substring(2,4),16) / 255;
    const b = parseInt(c.substring(4,6),16) / 255;
    // relative luminance
    const a = [r,g,b].map(v => v <= 0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055,2.4));
    return 0.2126*a[0] + 0.7152*a[1] + 0.0722*a[2];
}

function contrastColor(hex) {
    const l = hexToLuma(hex);
    return l > 0.5 ? '#002b59' : '#ffffff';
}

function selectColor(hex) {
    const hidden = document.getElementById('course-color');
    const picker = document.getElementById('course-color-picker');
    const swatches = document.querySelectorAll('.color-swatch');
    if (hidden) hidden.value = hex;
    if (picker) picker.value = hex;
    swatches.forEach(s => s.classList.toggle('selected', s.dataset.color === hex));
}

function initColorUI() {
    const swatches = document.querySelectorAll('.color-swatch');
    const picker = document.getElementById('course-color-picker');
    const hidden = document.getElementById('course-color');

    swatches.forEach(s => {
        s.addEventListener('click', () => {
            selectColor(s.dataset.color);
        });
    });

    if (picker) {
        picker.addEventListener('input', () => {
            selectColor(picker.value);
        });
    }

    // 初始化默认值
    const defaultColor = hidden && hidden.value ? hidden.value : (picker && picker.value ? picker.value : '#a8c6ff');
    selectColor(defaultColor);
}

// 延迟 init（DOM 已在外部 HTML 加载完）
window.addEventListener('DOMContentLoaded', initColorUI);
function startSelect() {
    if (disableSelect) return; // ⭐ 禁止选择
    selecting = true;
    selectedCells = [];
    selectCell(this);
}

function moveSelect() {
    if (disableSelect) return; // ⭐ 禁止选择
    if (!selecting) return;
    selectCell(this);
}

function endSelect() {
    if (disableSelect) return; // ⭐ 禁止选择
    selecting = false;

    if (selectedCells.length > 0) {
        // 新建模式：重置编辑索引与表单，隐藏任何激活的删除按钮
        editingCourseIndex = null;
        document.getElementById('course-name').value = '';
        document.getElementById('course-code').value = '';
        document.getElementById('course-teacher').value = '';
        document.getElementById('course-weeks').value = '';
        document.getElementById('course-room').value = '';
        const hidden = document.getElementById('course-color'); 
        if (hidden) hidden.value = '#a8c6ff';
        // 只隐藏触屏设备的删除按钮
        document.querySelectorAll('.delete-btn[data-device-type="touch"]').forEach(b => b.classList.add('hidden'));
        activeCourseCell = null;
        openCourseForm();
    }
}

function selectCell(td) {
    if (!selectedCells.includes(td)) {
        td.classList.add("selected");
        selectedCells.push(td);
    }
}

function clearSelection() {
    selectedCells.forEach(td => td.classList.remove("selected"));
    selectedCells = [];
}

// 弹窗控制
function openCourseForm() {
    document.getElementById("course-modal").style.display = "block";
    // 每次打开都确保颜色 UI 已同步（若用户上次更改）
    const hidden = document.getElementById('course-color');
    const picker = document.getElementById('course-color-picker');
    const start = (hidden && hidden.value) || (picker && picker.value) || '#a8c6ff';
    selectColor(start);
    clearCourseWarning();
}

function closeModal() {
    document.getElementById("course-modal").style.display = "none";
}

document.getElementById("cancel-course").onclick = () => {
    clearSelection();
    closeModal();
};

// 绑定输入时清除警告
['course-name','course-code','course-teacher','course-weeks','course-room','course-color-picker'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', clearCourseWarning);
});

document.getElementById("save-course").onclick = () => {
    // 先收集字段并验证：不能全为空
    const name = document.getElementById("course-name").value.trim();
    const code = document.getElementById("course-code").value.trim();
    const teacher = document.getElementById("course-teacher").value.trim();
    const weeks = document.getElementById("course-weeks").value.trim();
    const room = document.getElementById("course-room").value.trim();

    if (!name && !code && !teacher && !weeks && !room) {
        // 美观提示，阻止保存
        showCourseWarning('请填写至少一项课程信息（例如：课程名称、教师或教室），以便区分课程。');
        return;
    }

    const info = {
        name,
        code,
        teacher,
        weeks,
        room,
        color: document.getElementById('course-color') 
            ? document.getElementById('course-color').value 
            : (document.getElementById('course-color-picker') 
                ? document.getElementById('course-color-picker').value 
                : '#a8c6ff'),
        cells: selectedCells.map(td => ({
            row: +td.dataset.row,
            col: +td.dataset.col
        }))
    };

    if (editingCourseIndex !== null && editingCourseIndex >= 0 && editingCourseIndex < courses.length) {
        // 编辑现有课程
        courses[editingCourseIndex] = info;
    } else {
        // 新增课程
        courses.push(info);
    }
    renderCourses();

    // 清理状态
    editingCourseIndex = null;
    activeCourseCell = null;
    clearSelection();
    closeModal();
};

// 渲染课程
function renderCourses() {
    // 清空课程区域（跳过第一列 row label）
    document.querySelectorAll('#course-body td[data-col]').forEach(td => {
        td.innerHTML = "";
        td.style.display = "";
        td.removeAttribute("rowspan");
    });

    // 重新绘制所有课程
    courses.forEach(course => {
        const rows = course.cells.map(c => c.row);
        const col = course.cells[0].col;

        const minR = Math.min(...rows);
        const maxR = Math.max(...rows);
        const span = maxR - minR + 1;

        const mainCell = document.querySelector(`td[data-row="${minR}"][data-col="${col}"]`);
        mainCell.rowSpan = span;

        const html = `
            <div class="course-item">
                <strong>${course.name}${course.code ? `（${course.code}）` : ""}</strong><br>
                ${course.teacher}<br>
                ${course.weeks}<br>
                ${course.room}
                <button class="delete-btn">×</button>
            </div>
        `;

        mainCell.innerHTML = html;

        // 应用课程颜色与对比色
        const item = mainCell.querySelector('.course-item');
        if (item && course.color) {
            item.style.background = course.color;
            item.style.color = contrastColor(course.color);
        }

        // 隐藏被合并
        for (let r = minR + 1; r <= maxR; r++) {
            const td = document.querySelector(`td[data-row="${r}"][data-col="${col}"]`);
            td.style.display = "none";
        }
        // 删除按钮：拦截 mousedown/touchstart 防止触发格子选择
        const delBtn = mainCell.querySelector('.delete-btn');
        // 标记删除按钮所属的设备类型
        if (delBtn) {
            delBtn.dataset.deviceType = isTouchDevice ? 'touch' : 'desktop';
            // 触屏设备：初始隐藏（添加 hidden 类），由交互控制显示
            // 桌面设备：依赖 CSS :hover 效果，不添加类
            if (isTouchDevice) {
                delBtn.classList.add('hidden');
            }
        }

        if (delBtn) {
            // 不阻断默认事件，只阻断冒泡（避免阻断 touchend）
delBtn.addEventListener('mousedown', (e) => {
    e.stopPropagation();
}, { passive: true });

delBtn.addEventListener('touchstart', (e) => {
    e.stopPropagation();
}, { passive: true });

// 桌面端删除
delBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    e.preventDefault();

    courses = courses.filter(c => c !== course);
    renderCourses();
}, { passive: false });

// 手机端删除
if (isTouchDevice) {
    delBtn.addEventListener('touchend', (e) => {
        e.stopPropagation();
        e.preventDefault();

        courses = courses.filter(c => c !== course);
        renderCourses();
    }, { passive: false });
}

        }

        // ============================
        //   触屏设备：双击逻辑修复
        // ============================
        // 修复触控：第一次点 → 显示叉；第二次点同卡本体 → 编辑
if (isTouchDevice && item) {
    let lastTapTime = 0;
    let lastTapCell = null;
    const TAP_TIMEOUT = 350; // 毫秒

    item.addEventListener('touchstart', (e) => {
        e.stopPropagation();
    }, { passive: true });

    item.addEventListener('touchend', (e) => {
        e.stopPropagation();
        e.preventDefault(); // 防止触发 click 合成事件

        const now = Date.now();
        const tapped = e.target;
        const tappedDelete = tapped.closest && tapped.closest('.delete-btn');
        const tappedItem = tapped.closest && tapped.closest('.course-item');

        // 第二次点必须满足：
        const isSecondTap =
            lastTapCell === mainCell &&
            tappedItem === item &&
            !tappedDelete &&
            (now - lastTapTime <= TAP_TIMEOUT);

        if (isSecondTap) {
            // ---------- 进入编辑 ----------
            editingCourseIndex = courses.indexOf(course);

            clearSelection();
            selectedCells = course.cells.map(c =>
                document.querySelector(`td[data-row="${c.row}"][data-col="${c.col}"]`)
            ).filter(Boolean);
            selectedCells.forEach(td => td.classList.add('selected'));

            openCourseForm();
            document.getElementById('course-name').value = course.name || '';
            document.getElementById('course-code').value = course.code || '';
            document.getElementById('course-teacher').value = course.teacher || '';
            document.getElementById('course-weeks').value = course.weeks || '';
            document.getElementById('course-room').value = course.room || '';
            if (course.color) selectColor(course.color);

            // 隐藏叉
            const btn = mainCell.querySelector('.delete-btn');
            if (btn && btn.dataset.deviceType === 'touch') btn.classList.add('hidden');

            lastTapCell = null;
            lastTapTime = 0;
        } else {
            // ---------- 第一次点击：只显示叉 ----------
            document.querySelectorAll('.delete-btn[data-device-type="touch"]').forEach(b => {
                b.classList.add('hidden');
                b.classList.remove('visible');
            });

            const btn = mainCell.querySelector('.delete-btn');
            if (btn && btn.dataset.deviceType === 'touch') {
                btn.classList.remove('hidden');
                btn.classList.add('visible');
            }

            activeCourseCell = mainCell;
            lastTapCell = mainCell;
            lastTapTime = now;
        }
    }, { passive: false });
}


    });
}


// 删除全部课程
document.getElementById("clear-all").onclick = () => {
    courses = [];
    renderCourses();
};

// 点击页面空白处（移动端）隐藏任何激活的删除按钮
document.addEventListener('click', (e) => {
    if (!isTouchDevice) return;
    const ci = e.target.closest && e.target.closest('.course-item');
    if (!ci) {
        document.querySelectorAll('.delete-btn[data-device-type="touch"]').forEach(b => {
            b.classList.add('hidden');
            b.classList.remove('visible');
        });
        activeCourseCell = null;
    }
});
