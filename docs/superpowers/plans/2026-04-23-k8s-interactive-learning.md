# K8s Architect 交互式教学网页 — 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个 Canvas + 游戏化交互的 K8s 架构教学单页应用，5 个模块 22 个挑战，全中文，零后端。

**Architecture:** 纯 HTML/CSS/JS SPA。Canvas 渲染架构图和动画，HTML overlay 负责 UI（侧边栏、状态栏、挑战卡）。游戏化系统管理经验值、等级、模块解锁。LocalStorage 持久化进度。每个模块是独立 JS 文件，遵循统一接口注册到 app。

**Tech Stack:** HTML5 Canvas, CSS3, ES6+ (原生 JS), D3.js (CDN，辅助数据可视化)

---

## File Structure

```
k8s_architecture/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── app.js               # 应用入口、路由、模块加载
│   ├── canvas-engine.js     # Canvas 渲染引擎（绘图原语、分层管理）
│   ├── animations.js        # 动画系统（缓动、粒子、路径流动、脉冲）
│   ├── interactions.js      # 交互处理器（拖拽、点击序列、决策选择）
│   ├── game.js              # 游戏状态（经验、等级、解锁、挑战追踪）
│   ├── progress-store.js    # LocalStorage 持久化
│   └── modules/
│       ├── architecture.js   # 模块一：整体架构（4 挑战）
│       ├── pod-lifecycle.js  # 模块二：Pod 创建流程（5 挑战）
│       ├── network.js        # 模块三：网络架构（5 挑战）
│       ├── storage-k8s.js    # 模块四：存储架构（4 挑战）
│       └── security.js       # 模块五：安全与可观测性（4 挑战）
├── sw.js                     # Service Worker
└── manifest.json             # PWA manifest
```

---

## Phase 1: 核心框架

### Task 1: 项目脚手架 + index.html

**Files:**
- Create: `index.html`
- Create: `css/` `js/` `js/modules/` `assets/` directories

- [ ] **Step 1: 创建目录结构**

```bash
mkdir -p css js/modules assets
```

- [ ] **Step 2: 创建 index.html**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>K8s Architect — 交互式 Kubernetes 架构学习</title>
  <link rel="stylesheet" href="css/style.css">
  <link rel="manifest" href="manifest.json">
</head>
<body>
  <!-- 顶部状态栏 -->
  <header id="status-bar">
    <div class="status-left">
      <span class="logo">☸ K8s Architect</span>
      <span class="tagline">交互式架构学习</span>
    </div>
    <div class="status-right">
      <span id="level-badge" class="level-badge">Lv.1 学徒</span>
      <span id="xp-display" class="xp-display">0 经验</span>
      <div class="xp-bar-container">
        <div id="xp-bar" class="xp-bar" style="width: 0%"></div>
      </div>
    </div>
  </header>

  <div class="main-layout">
    <!-- 侧边导航 -->
    <nav id="sidebar">
      <div class="sidebar-label">学习模块</div>
      <div id="module-list"></div>
      <div class="sidebar-footer">
        <div class="sidebar-label">学习进度</div>
        <div id="progress-stats"></div>
      </div>
    </nav>

    <!-- 主内容区 -->
    <main id="main-content">
      <div id="canvas-container">
        <canvas id="main-canvas"></canvas>
      </div>

      <!-- 挑战卡（右上角覆盖） -->
      <div id="challenge-card" class="challenge-card hidden">
        <div id="challenge-title" class="challenge-title"></div>
        <div id="challenge-desc" class="challenge-desc"></div>
        <div id="challenge-actions" class="challenge-actions"></div>
      </div>

      <!-- 反馈气泡 -->
      <div id="feedback-bubble" class="feedback-bubble hidden">
        <div id="feedback-icon" class="feedback-icon"></div>
        <div id="feedback-text" class="feedback-text"></div>
      </div>

      <!-- 知识点气泡 -->
      <div id="tooltip-bubble" class="tooltip-bubble hidden">
        <div id="tooltip-title" class="tooltip-title"></div>
        <div id="tooltip-text" class="tooltip-text"></div>
      </div>

      <!-- 底部操作栏 -->
      <div id="bottom-bar" class="bottom-bar">
        <button id="btn-start" class="btn btn-primary">▶ 开始挑战</button>
        <button id="btn-learn" class="btn btn-secondary">📖 先学习</button>
        <button id="btn-reset" class="btn btn-secondary">🔄 重置</button>
      </div>
    </main>
  </div>

  <!-- 脚本按依赖顺序加载 -->
  <script src="js/progress-store.js"></script>
  <script src="js/game.js"></script>
  <script src="js/canvas-engine.js"></script>
  <script src="js/animations.js"></script>
  <script src="js/interactions.js"></script>
  <script src="js/modules/architecture.js"></script>
  <script src="js/modules/pod-lifecycle.js"></script>
  <script src="js/modules/network.js"></script>
  <script src="js/modules/storage-k8s.js"></script>
  <script src="js/modules/security.js"></script>
  <script src="js/app.js"></script>
</body>
</html>
```

- [ ] **Step 3: 在浏览器中打开验证**

打开 `index.html`，页面应显示空布局（无 JS 报错即可，因为 CSS 还未创建）。

- [ ] **Step 4: 提交**

```bash
git init
git add index.html
git commit -m "feat: scaffold project with index.html"
```

---

### Task 2: CSS 深色主题

**Files:**
- Create: `css/style.css`

- [ ] **Step 1: 创建 style.css**

```css
/* ===== CSS Variables ===== */
:root {
  --bg-primary: #0d1117;
  --bg-secondary: #161b22;
  --bg-tertiary: #21262d;
  --border: #30363d;
  --border-light: #484f58;
  --text-primary: #e6edf3;
  --text-secondary: #8b949e;
  --text-muted: #484f58;
  --blue: #58a6ff;
  --green: #3fb950;
  --yellow: #d29922;
  --red: #f85149;
  --purple: #d2a8ff;
  --orange: #f0883e;
  --sidebar-width: 220px;
  --status-height: 48px;
}

/* ===== Reset ===== */
*, *::before, *::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans SC", sans-serif;
  background: var(--bg-primary);
  color: var(--text-primary);
  overflow: hidden;
  height: 100vh;
}

/* ===== Status Bar ===== */
#status-bar {
  height: var(--status-height);
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
}

.status-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo {
  color: var(--blue);
  font-weight: bold;
  font-size: 15px;
}

.tagline {
  color: var(--text-secondary);
  font-size: 12px;
}

.status-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.level-badge {
  background: var(--bg-tertiary);
  color: var(--green);
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.xp-display {
  color: var(--purple);
  font-size: 12px;
}

.xp-bar-container {
  background: var(--bg-tertiary);
  border-radius: 8px;
  width: 80px;
  height: 6px;
  overflow: hidden;
}

.xp-bar {
  background: linear-gradient(90deg, var(--green), var(--blue));
  height: 100%;
  border-radius: 8px;
  transition: width 0.5s ease;
}

/* ===== Main Layout ===== */
.main-layout {
  display: flex;
  height: calc(100vh - var(--status-height));
}

/* ===== Sidebar ===== */
#sidebar {
  width: var(--sidebar-width);
  background: var(--bg-secondary);
  border-right: 1px solid var(--border);
  padding: 12px;
  overflow-y: auto;
  flex-shrink: 0;
}

.sidebar-label {
  color: var(--text-muted);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 8px;
}

.sidebar-footer {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid var(--border);
}

.module-item {
  padding: 8px 10px;
  border-radius: 6px;
  margin-bottom: 4px;
  cursor: pointer;
  border-left: 3px solid transparent;
  transition: all 0.2s ease;
}

.module-item:hover {
  background: var(--bg-tertiary);
}

.module-item.active {
  background: rgba(31, 111, 235, 0.1);
  border-left-color: var(--blue);
}

.module-item.locked {
  opacity: 0.5;
  cursor: not-allowed;
}

.module-item.completed {
  border-left-color: var(--green);
}

.module-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.module-item.active .module-title {
  color: var(--blue);
}

.module-item.locked .module-title {
  color: var(--text-muted);
}

.module-progress {
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.module-progress-bar {
  background: var(--bg-tertiary);
  border-radius: 4px;
  width: 60px;
  height: 4px;
  overflow: hidden;
}

.module-progress-fill {
  background: var(--blue);
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.module-progress-text {
  color: var(--text-muted);
  font-size: 10px;
}

.module-status {
  font-size: 10px;
  margin-top: 2px;
}

.module-status.completed {
  color: var(--green);
}

.module-status.locked {
  color: var(--text-muted);
}

/* ===== Main Content ===== */
#main-content {
  flex: 1;
  position: relative;
  overflow: hidden;
}

#canvas-container {
  width: 100%;
  height: 100%;
}

#main-canvas {
  display: block;
  width: 100%;
  height: 100%;
  background: var(--bg-primary);
}

/* ===== Challenge Card ===== */
.challenge-card {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(22, 27, 34, 0.95);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 14px;
  max-width: 320px;
  z-index: 10;
  backdrop-filter: blur(8px);
}

.challenge-card.hidden {
  display: none;
}

.challenge-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--green);
  margin-bottom: 6px;
}

.challenge-desc {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.6;
}

.challenge-actions {
  margin-top: 10px;
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

/* ===== Feedback Bubble ===== */
.feedback-bubble {
  position: absolute;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(22, 27, 34, 0.95);
  border-radius: 10px;
  padding: 14px 20px;
  max-width: 500px;
  z-index: 20;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  backdrop-filter: blur(8px);
  animation: slideUp 0.3s ease;
}

.feedback-bubble.hidden {
  display: none;
}

.feedback-bubble.success {
  border: 1px solid var(--green);
}

.feedback-bubble.error {
  border: 1px solid var(--red);
}

.feedback-bubble.info {
  border: 1px solid var(--yellow);
}

.feedback-icon {
  font-size: 18px;
  flex-shrink: 0;
}

.feedback-text {
  font-size: 13px;
  line-height: 1.6;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

/* ===== Tooltip Bubble ===== */
.tooltip-bubble {
  position: absolute;
  background: rgba(22, 27, 34, 0.95);
  border: 1px solid var(--blue);
  border-radius: 8px;
  padding: 10px 14px;
  max-width: 280px;
  z-index: 15;
  backdrop-filter: blur(8px);
}

.tooltip-bubble.hidden {
  display: none;
}

.tooltip-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--blue);
  margin-bottom: 4px;
}

.tooltip-text {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.6;
}

/* ===== Bottom Bar ===== */
.bottom-bar {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  z-index: 10;
}

/* ===== Buttons ===== */
.btn {
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.btn-primary {
  background: var(--green);
  color: #fff;
}

.btn-primary:hover {
  background: #2ea043;
}

.btn-secondary {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
}

.btn-secondary:hover {
  background: var(--border);
}

.btn-choice {
  background: var(--bg-tertiary);
  color: var(--blue);
  border: 1px solid var(--border);
  font-size: 12px;
  padding: 5px 12px;
}

.btn-choice:hover {
  border-color: var(--blue);
}

.btn-choice.correct {
  border-color: var(--green);
  color: var(--green);
  background: rgba(63, 185, 80, 0.1);
}

.btn-choice.wrong {
  border-color: var(--red);
  color: var(--red);
  background: rgba(248, 81, 73, 0.1);
}

/* ===== Choice Options ===== */
.choice-options {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.choice-option {
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 8px 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.choice-option:hover {
  border-color: var(--blue);
}

.choice-option.selected {
  border-color: var(--blue);
  background: rgba(88, 166, 255, 0.1);
}

.choice-option.correct {
  border-color: var(--green);
  background: rgba(63, 185, 80, 0.1);
}

.choice-option.wrong {
  border-color: var(--red);
  background: rgba(248, 81, 73, 0.1);
}

/* ===== Utility ===== */
.hidden {
  display: none !important;
}

/* ===== Responsive (Tablet) ===== */
@media (max-width: 768px) {
  #sidebar {
    width: 180px;
  }

  .challenge-card {
    max-width: 240px;
  }
}
```

- [ ] **Step 2: 在浏览器中打开验证**

打开 `index.html`，应看到深色背景 + 顶部状态栏（显示 Lv.1 学徒、0 经验）+ 左侧空侧边栏 + 中央空白 Canvas 区域。

- [ ] **Step 3: 提交**

```bash
git add css/style.css
git commit -m "feat: add dark theme CSS with full component styles"
```

---

### Task 3: Canvas 渲染引擎

**Files:**
- Create: `js/canvas-engine.js`

- [ ] **Step 1: 创建 canvas-engine.js**

```javascript
/**
 * CanvasEngine — Canvas 渲染引擎
 * 管理画布上下文、绘图原语、分层、缩放
 */
class CanvasEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.elements = [];
    this.dpr = window.devicePixelRatio || 1;
    this.offsetX = 0;
    this.offsetY = 0;
    this._resizeHandler = null;
  }

  init() {
    this._resizeHandler = () => this.resize();
    window.addEventListener('resize', this._resizeHandler);
    this.resize();
    return this;
  }

  destroy() {
    if (this._resizeHandler) {
      window.removeEventListener('resize', this._resizeHandler);
    }
    this.elements = [];
  }

  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.canvas.style.width = this.width + 'px';
    this.canvas.style.height = this.height + 'px';
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.elements = [];
  }

  /* ===== 绘图原语 ===== */

  drawRect(x, y, w, h, options = {}) {
    const ctx = this.ctx;
    ctx.save();
    if (options.fillColor) {
      ctx.fillStyle = options.fillColor;
    }
    if (options.borderColor) {
      ctx.strokeStyle = options.borderColor;
      ctx.lineWidth = options.borderWidth || 1;
    }
    if (options.radius) {
      this._roundRect(x, y, w, h, options.radius);
      if (options.fillColor) ctx.fill();
      if (options.borderColor) ctx.stroke();
    } else {
      if (options.fillColor) ctx.fillRect(x, y, w, h);
      if (options.borderColor) ctx.strokeRect(x, y, w, h);
    }
    ctx.restore();
    return this._registerElement('rect', x, y, w, h, options);
  }

  drawCircle(cx, cy, r, options = {}) {
    const ctx = this.ctx;
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    if (options.fillColor) {
      ctx.fillStyle = options.fillColor;
      ctx.fill();
    }
    if (options.borderColor) {
      ctx.strokeStyle = options.borderColor;
      ctx.lineWidth = options.borderWidth || 1;
      ctx.stroke();
    }
    ctx.restore();
    return this._registerElement('circle', cx - r, cy - r, r * 2, r * 2, options);
  }

  drawText(text, x, y, options = {}) {
    const ctx = this.ctx;
    ctx.save();
    ctx.font = (options.fontWeight || 'normal') + ' ' + (options.fontSize || 12) + 'px -apple-system, "Noto Sans SC", sans-serif';
    ctx.fillStyle = options.color || '#e6edf3';
    ctx.textAlign = options.align || 'left';
    ctx.textBaseline = options.baseline || 'top';
    ctx.fillText(text, x, y);
    ctx.restore();
    const metrics = ctx.measureText(text);
    return this._registerElement('text', x, y, metrics.width, options.fontSize || 12, options);
  }

  drawLine(x1, y1, x2, y2, options = {}) {
    const ctx = this.ctx;
    ctx.save();
    ctx.strokeStyle = options.color || '#30363d';
    ctx.lineWidth = options.width || 1;
    if (options.dashed) ctx.setLineDash(options.dashed);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
  }

  drawArrow(x1, y1, x2, y2, options = {}) {
    const ctx = this.ctx;
    const color = options.color || '#30363d';
    const headLen = options.headLen || 8;
    const angle = Math.atan2(y2 - y1, x2 - x1);

    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = options.width || 1.5;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - headLen * Math.cos(angle - Math.PI / 6), y2 - headLen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(x2 - headLen * Math.cos(angle + Math.PI / 6), y2 - headLen * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  drawCurvedArrow(x1, y1, x2, y2, options = {}) {
    const ctx = this.ctx;
    const color = options.color || '#30363d';
    const headLen = options.headLen || 8;
    const curvature = options.curvature || 0.3;

    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const cpX = midX - dy * curvature;
    const cpY = midY + dx * curvature;

    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = options.width || 1.5;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.quadraticCurveTo(cpX, cpY, x2, y2);
    ctx.stroke();

    const angle = Math.atan2(y2 - cpY, x2 - cpX);
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - headLen * Math.cos(angle - Math.PI / 6), y2 - headLen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(x2 - headLen * Math.cos(angle + Math.PI / 6), y2 - headLen * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  /* ===== 复合组件 ===== */

  drawNode(x, y, w, h, label, options = {}) {
    const borderColor = options.borderColor || '#58a6ff';
    const bgColor = options.bgColor || 'rgba(31, 111, 235, 0.1)';
    const textColor = options.textColor || '#e6edf3';
    const subLabel = options.subLabel || '';

    this.drawRect(x, y, w, h, {
      fillColor: bgColor,
      borderColor: borderColor,
      borderWidth: options.borderWidth || 1.5,
      radius: 8
    });

    this.drawText(label, x + w / 2, y + (subLabel ? 10 : h / 2 - 6), {
      color: textColor,
      fontSize: options.fontSize || 12,
      fontWeight: '600',
      align: 'center',
      baseline: subLabel ? 'top' : 'middle'
    });

    if (subLabel) {
      this.drawText(subLabel, x + w / 2, y + h - 18, {
        color: '#8b949e',
        fontSize: 9,
        align: 'center',
        baseline: 'top'
      });
    }

    return this._registerElement('node', x, y, w, h, { ...options, label });
  }

  drawProgressBar(x, y, w, h, progress, options = {}) {
    const bgColor = options.bgColor || '#21262d';
    const fillColor = options.fillColor || '#58a6ff';

    this.drawRect(x, y, w, h, { fillColor: bgColor, radius: h / 2 });
    if (progress > 0) {
      const fillW = Math.max(h, w * Math.min(progress, 1));
      this.drawRect(x, y, fillW, h, { fillColor: fillColor, radius: h / 2 });
    }
  }

  drawBadge(x, y, text, color) {
    const padding = 6;
    const ctx = this.ctx;
    ctx.save();
    ctx.font = '600 10px -apple-system, "Noto Sans SC", sans-serif';
    const metrics = ctx.measureText(text);
    const w = metrics.width + padding * 2;
    const h = 18;

    this.drawRect(x - w / 2, y - h / 2, w, h, {
      fillColor: color + '22',
      borderColor: color,
      radius: 4
    });
    this.drawText(text, x, y, {
      color: color,
      fontSize: 10,
      fontWeight: '600',
      align: 'center',
      baseline: 'middle'
    });
    ctx.restore();
  }

  /* ===== 碰撞检测 ===== */

  hitTest(mx, my) {
    for (let i = this.elements.length - 1; i >= 0; i--) {
      const el = this.elements[i];
      if (!el.interactive) continue;
      if (mx >= el.x && mx <= el.x + el.w && my >= el.y && my <= el.y + el.h) {
        return el;
      }
    }
    return null;
  }

  /* ===== 内部方法 ===== */

  _roundRect(x, y, w, h, r) {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  _registerElement(type, x, y, w, h, options = {}) {
    const el = {
      type,
      x, y, w, h,
      id: options.id || null,
      interactive: options.interactive || false,
      data: options.data || {}
    };
    this.elements.push(el);
    return el;
  }
}

window.CanvasEngine = CanvasEngine;
```

- [ ] **Step 2: 在浏览器控制台测试**

打开 `index.html`，在控制台输入：
```javascript
const e = new CanvasEngine('main-canvas');
e.init();
e.drawNode(100, 100, 160, 60, 'API Server', { borderColor: '#58a6ff' });
e.drawArrow(280, 130, 350, 130, { color: '#3fb950' });
e.drawNode(360, 100, 120, 60, 'etcd', { borderColor: '#d2a8ff' });
```
应看到蓝色 API Server 节点 → 绿色箭头 → 紫色 etcd 节点。

- [ ] **Step 3: 提交**

```bash
git add js/canvas-engine.js
git commit -m "feat: add Canvas rendering engine with drawing primitives"
```

---

### Task 4: 动画系统

**Files:**
- Create: `js/animations.js`

- [ ] **Step 1: 创建 animations.js**

```javascript
/**
 * Animations — 动画系统
 * 缓动、粒子、路径流动、脉冲效果
 */
class AnimationManager {
  constructor() {
    this.tweens = [];
    this.particles = [];
    this.pulses = [];
    this.flows = [];
    this.running = false;
    this._raf = null;
  }

  start() {
    if (this.running) return;
    this.running = true;
    this._loop();
  }

  stop() {
    this.running = false;
    if (this._raf) {
      cancelAnimationFrame(this._raf);
      this._raf = null;
    }
  }

  clear() {
    this.stop();
    this.tweens = [];
    this.particles = [];
    this.pulses = [];
    this.flows = [];
  }

  _loop() {
    if (!this.running) return;
    const now = performance.now();
    this._updateTweens(now);
    this._updateParticles(now);
    this._updatePulses(now);
    this._updateFlows(now);
    this._raf = requestAnimationFrame(() => this._loop());
  }

  /* ===== Tween（属性补间） ===== */

  tween(target, props, duration, options = {}) {
    const tween = {
      target,
      startProps: {},
      endProps: props,
      duration,
      startTime: performance.now(),
      easing: options.easing || this.easeInOutCubic,
      onComplete: options.onComplete || null,
      yoyo: options.yoyo || false,
      repeat: options.repeat || 0,
      _repeats: 0
    };
    for (const key of Object.keys(props)) {
      tween.startProps[key] = target[key];
    }
    this.tweens.push(tween);
    if (!this.running) this.start();
    return tween;
  }

  _updateTweens(now) {
    this.tweens = this.tweens.filter(t => {
      let elapsed = now - t.startTime;
      let progress = Math.min(elapsed / t.duration, 1);
      let easedProgress = t.easing(progress);

      for (const key of Object.keys(t.endProps)) {
        t.target[key] = t.startProps[key] + (t.endProps[key] - t.startProps[key]) * easedProgress;
      }

      if (progress >= 1) {
        if (t.repeat === -1 || t._repeats < t.repeat) {
          if (t.yoyo) {
            const tmp = t.startProps;
            t.startProps = t.endProps;
            t.endProps = tmp;
          }
          t.startTime = now;
          t._repeats++;
          return true;
        }
        if (t.onComplete) t.onComplete(t.target);
        return false;
      }
      return true;
    });
  }

  /* ===== 粒子效果 ===== */

  emitParticles(engine, x, y, color, count = 12) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 / count) * i + Math.random() * 0.5;
      const speed = 1 + Math.random() * 2;
      this.particles.push({
        engine,
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        life: 1,
        decay: 0.015 + Math.random() * 0.01,
        size: 2 + Math.random() * 3
      });
    }
    if (!this.running) this.start();
  }

  _updateParticles() {
    this.particles = this.particles.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;
      if (p.life <= 0) return false;

      p.engine.ctx.save();
      p.engine.ctx.globalAlpha = p.life;
      p.engine.ctx.fillStyle = p.color;
      p.engine.ctx.beginPath();
      p.engine.ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      p.engine.ctx.fill();
      p.engine.ctx.restore();
      return true;
    });
  }

  /* ===== 脉冲效果 ===== */

  addPulse(engine, x, y, color, options = {}) {
    const pulse = {
      engine, x, y, color,
      maxRadius: options.maxRadius || 20,
      duration: options.duration || 1500,
      startTime: performance.now()
    };
    this.pulses.push(pulse);
    if (!this.running) this.start();
    return pulse;
  }

  _updatePulses(now) {
    this.pulses = this.pulses.filter(p => {
      const elapsed = now - p.startTime;
      const progress = (elapsed % p.duration) / p.duration;
      const radius = p.maxRadius * progress;
      const alpha = 1 - progress;

      p.engine.ctx.save();
      p.engine.ctx.globalAlpha = alpha * 0.3;
      p.engine.ctx.strokeStyle = p.color;
      p.engine.ctx.lineWidth = 2;
      p.engine.ctx.beginPath();
      p.engine.ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      p.engine.ctx.stroke();
      p.engine.ctx.restore();
      return true;
    });
  }

  /* ===== 路径流动（数据包沿路径移动） ===== */

  flowAlongPath(engine, points, color, options = {}) {
    const flow = {
      engine,
      points,
      color,
      speed: options.speed || 0.002,
      dotSize: options.dotSize || 5,
      progress: 0,
      onReachPoint: options.onReachPoint || null,
      lastPointIndex: -1
    };
    this.flows.push(flow);
    if (!this.running) this.start();
    return flow;
  }

  _updateFlows() {
    this.flows = this.flows.filter(f => {
      f.progress += f.speed;
      if (f.progress >= 1) {
        f.progress = 0;
      }

      const totalSegments = f.points.length - 1;
      const segIndex = Math.min(Math.floor(f.progress * totalSegments), totalSegments - 1);
      const segProgress = (f.progress * totalSegments) - segIndex;

      if (segIndex !== f.lastPointIndex) {
        f.lastPointIndex = segIndex;
        if (f.onReachPoint) f.onReachPoint(segIndex, f.points[segIndex]);
      }

      const p1 = f.points[segIndex];
      const p2 = f.points[segIndex + 1];
      const x = p1.x + (p2.x - p1.x) * segProgress;
      const y = p1.y + (p2.y - p1.y) * segProgress;

      f.engine.ctx.save();
      f.engine.ctx.fillStyle = f.color;
      f.engine.ctx.shadowColor = f.color;
      f.engine.ctx.shadowBlur = 10;
      f.engine.ctx.beginPath();
      f.engine.ctx.arc(x, y, f.dotSize, 0, Math.PI * 2);
      f.engine.ctx.fill();
      f.engine.ctx.restore();

      return true;
    });
  }

  /* ===== 缓动函数 ===== */

  easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  easeOutBack(t) {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  }

  easeOutElastic(t) {
    if (t === 0 || t === 1) return t;
    return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI / 3)) + 1;
  }
}

window.AnimationManager = AnimationManager;
```

- [ ] **Step 2: 在浏览器控制台测试**

在控制台测试脉冲效果：
```javascript
const eng = new CanvasEngine('main-canvas');
eng.init();
const anim = new AnimationManager();
anim.addPulse(eng, 200, 200, '#58a6ff');
anim.start();
```
应看到蓝色脉冲环不断扩散。

- [ ] **Step 3: 提交**

```bash
git add js/animations.js
git commit -m "feat: add animation system with tween, particles, pulse, and flow"
```

---

### Task 5: 交互处理器

**Files:**
- Create: `js/interactions.js`

- [ ] **Step 1: 创建 interactions.js**

```javascript
/**
 * Interactions — 交互处理器
 * 拖拽、点击序列、决策选择
 */
class InteractionManager {
  constructor(engine, animations) {
    this.engine = engine;
    this.animations = animations;
    this.canvas = engine.canvas;
    this.handlers = [];
    this._dragState = null;
    this._enabled = true;
  }

  destroy() {
    this.disable();
    this.handlers = [];
  }

  enable() { this._enabled = true; }
  disable() { this._enabled = false; }

  _getMousePos(e) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

  /* ===== 点击交互（探索型） ===== */

  onClick(elementIds, callback) {
    const handler = (e) => {
      if (!this._enabled) return;
      const pos = this._getMousePos(e);
      const hit = this.engine.hitTest(pos.x, pos.y);
      if (hit && elementIds.includes(hit.id)) {
        callback(hit.id, hit.data, pos);
      }
    };
    this.canvas.addEventListener('click', handler);
    this.handlers.push({ type: 'click', handler });
    return handler;
  }

  onAnyClick(callback) {
    const handler = (e) => {
      if (!this._enabled) return;
      const pos = this._getMousePos(e);
      const hit = this.engine.hitTest(pos.x, pos.y);
      callback(hit, pos);
    };
    this.canvas.addEventListener('click', handler);
    this.handlers.push({ type: 'click', handler });
    return handler;
  }

  /* ===== 拖拽交互（拖拽型） ===== */

  enableDrag(sources, targets, options = {}) {
    const onDragStart = options.onDragStart || null;
    const onDragMove = options.onDragMove || null;
    const onDrop = options.onDrop || null;
    const snapBack = options.snapBack !== false;

    let dragging = null;
    let dragOffset = { x: 0, y: 0 };
    let originalPos = { x: 0, y: 0 };

    const onMouseDown = (e) => {
      if (!this._enabled) return;
      const pos = this._getMousePos(e);
      const hit = this.engine.hitTest(pos.x, pos.y);
      if (hit && sources.some(s => s.id === hit.id)) {
        dragging = {
          el: hit,
          source: sources.find(s => s.id === hit.id)
        };
        dragOffset = { x: pos.x - hit.x, y: pos.y - hit.y };
        originalPos = { x: hit.x, y: hit.y };
        if (onDragStart) onDragStart(hit.id, hit.data);
        this.canvas.style.cursor = 'grabbing';
      }
    };

    const onMouseMove = (e) => {
      if (!dragging) {
        const pos = this._getMousePos(e);
        const hit = this.engine.hitTest(pos.x, pos.y);
        this.canvas.style.cursor = hit && sources.some(s => s.id === hit.id) ? 'grab' : 'default';
        return;
      }
      const pos = this._getMousePos(e);
      dragging.el.x = pos.x - dragOffset.x;
      dragging.el.y = pos.y - dragOffset.y;
      if (onDragMove) onDragMove(dragging.el.id, pos);
    };

    const onMouseUp = (e) => {
      if (!dragging) return;
      const pos = this._getMousePos(e);
      let matched = null;

      for (const target of targets) {
        const tx = target.x, ty = target.y, tw = target.w, th = target.h;
        if (dragging.el.x + dragging.el.w / 2 > tx &&
            dragging.el.x + dragging.el.w / 2 < tx + tw &&
            dragging.el.y + dragging.el.h / 2 > ty &&
            dragging.el.y + dragging.el.h / 2 < ty + th) {
          matched = target;
          break;
        }
      }

      if (matched && matched.accepts === dragging.source.id) {
        dragging.el.x = matched.x + (matched.w - dragging.el.w) / 2;
        dragging.el.y = matched.y + (matched.h - dragging.el.h) / 2;
        if (onDrop) onDrop(dragging.source.id, matched.id, true);
      } else {
        if (snapBack) {
          this.animations.tween(dragging.el, { x: originalPos.x, y: originalPos.y }, 300, {
            easing: this.animations.easeOutBack
          });
        }
        if (onDrop) onDrop(dragging.source.id, matched ? matched.id : null, false);
      }

      this.canvas.style.cursor = 'default';
      dragging = null;
    };

    this.canvas.addEventListener('mousedown', onMouseDown);
    this.canvas.addEventListener('mousemove', onMouseMove);
    this.canvas.addEventListener('mouseup', onMouseUp);

    this.handlers.push({ type: 'mousedown', handler: onMouseDown });
    this.handlers.push({ type: 'mousemove', handler: onMouseMove });
    this.handlers.push({ type: 'mouseup', handler: onMouseUp });

    return { onMouseDown, onMouseMove, onMouseUp };
  }

  /* ===== 序列交互（序列型） ===== */

  enableSequence(correctOrder, options = {}) {
    const onCorrectStep = options.onCorrectStep || null;
    const onWrongStep = options.onWrongStep || null;
    const onComplete = options.onComplete || null;
    let currentStep = 0;

    const handler = (e) => {
      if (!this._enabled) return;
      const pos = this._getMousePos(e);
      const hit = this.engine.hitTest(pos.x, pos.y);
      if (!hit) return;

      if (hit.id === correctOrder[currentStep]) {
        if (onCorrectStep) onCorrectStep(hit.id, currentStep);
        currentStep++;
        if (currentStep >= correctOrder.length && onComplete) {
          onComplete();
        }
      } else {
        if (onWrongStep) onWrongStep(hit.id, currentStep);
      }
    };

    this.canvas.addEventListener('click', handler);
    this.handlers.push({ type: 'click', handler });
    return handler;
  }

  /* ===== 决策选择（决策型 / 配置型） ===== */

  enableChoice(options, correctAnswer, callback) {
    const container = document.getElementById('challenge-actions');
    container.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'choice-options';

    options.forEach(opt => {
      const btn = document.createElement('div');
      btn.className = 'choice-option';
      btn.innerHTML = '<div style="font-weight:600;font-size:13px;">' + opt.label + '</div>' +
                      '<div style="color:#8b949e;font-size:11px;margin-top:2px;">' + (opt.desc || '') + '</div>';
      btn.addEventListener('click', () => {
        const allBtns = wrapper.querySelectorAll('.choice-option');
        allBtns.forEach(b => b.classList.remove('selected', 'correct', 'wrong'));

        if (opt.id === correctAnswer) {
          btn.classList.add('correct');
          callback(true, opt.id, opt);
        } else {
          btn.classList.add('wrong');
          callback(false, opt.id, opt);
        }
      });
      wrapper.appendChild(btn);
    });

    container.appendChild(wrapper);
    return wrapper;
  }
}

window.InteractionManager = InteractionManager;
```

- [ ] **Step 2: 提交**

```bash
git add js/interactions.js
git commit -m "feat: add interaction handlers for drag, sequence, and choice"
```

---

### Task 6: 游戏状态 + 持久化

**Files:**
- Create: `js/progress-store.js`
- Create: `js/game.js`

- [ ] **Step 1: 创建 progress-store.js**

```javascript
/**
 * ProgressStore — LocalStorage 持久化
 */
const ProgressStore = {
  KEY: 'k8s-architect-progress',

  save(state) {
    try {
      localStorage.setItem(this.KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('无法保存进度:', e);
    }
  },

  load() {
    try {
      const data = localStorage.getItem(this.KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  reset() {
    localStorage.removeItem(this.KEY);
  }
};

window.ProgressStore = ProgressStore;
```

- [ ] **Step 2: 创建 game.js**

```javascript
/**
 * Game — 游戏化状态管理
 * 经验值、等级、模块解锁、挑战追踪
 */
const Game = {
  LEVELS: [
    { level: 1, name: '学徒', xp: 0 },
    { level: 2, name: '运维工程师', xp: 500 },
    { level: 3, name: '架构师', xp: 1500 },
    { level: 4, name: '大师', xp: 3000 }
  ],

  XP_REWARDS: {
    challenge: 100,
    bonusNoHint: 50,
    hiddenKnowledge: 30,
    readDescription: 20
  },

  state: null,

  init() {
    const saved = ProgressStore.load();
    if (saved) {
      this.state = saved;
    } else {
      this.state = {
        xp: 0,
        currentModule: 'architecture',
        modules: {
          architecture: { unlocked: true, challenges: {} },
          'pod-lifecycle': { unlocked: false, challenges: {} },
          network: { unlocked: false, challenges: {} },
          storage: { unlocked: false, challenges: {} },
          security: { unlocked: false, challenges: {} }
        }
      };
    }
    return this;
  },

  getLevel() {
    let result = this.LEVELS[0];
    for (const lvl of this.LEVELS) {
      if (this.state.xp >= lvl.xp) result = lvl;
    }
    return result;
  },

  getNextLevel() {
    const current = this.getLevel();
    const idx = this.LEVELS.indexOf(current);
    return idx < this.LEVELS.length - 1 ? this.LEVELS[idx + 1] : null;
  },

  getXPProgress() {
    const current = this.getLevel();
    const next = this.getNextLevel();
    if (!next) return 1;
    const range = next.xp - current.xp;
    const progress = this.state.xp - current.xp;
    return progress / range;
  },

  addXP(amount, reason) {
    const oldLevel = this.getLevel().level;
    this.state.xp += amount;
    const newLevel = this.getLevel().level;
    this._save();

    if (typeof App !== 'undefined' && App.updateStatusBar) {
      App.updateStatusBar();
    }

    if (newLevel > oldLevel && typeof App !== 'undefined' && App.showFeedback) {
      App.showFeedback('success', '🎉 升级！你现在是 ' + this.getLevel().name + '（Lv.' + newLevel + '）', 3000);
    }

    return { amount, totalXP: this.state.xp, leveledUp: newLevel > oldLevel };
  },

  completeChallenge(moduleId, challengeId, usedHint = false) {
    if (!this.state.modules[moduleId]) return null;

    const isFirst = !this.state.modules[moduleId].challenges[challengeId];
    this.state.modules[moduleId].challenges[challengeId] = {
      completed: true,
      usedHint,
      completedAt: Date.now()
    };

    let totalXP = this.XP_REWARDS.challenge;
    const xpResult = this.addXP(totalXP, '挑战完成');
    xpResult.isFirst = isFirst;

    if (isFirst && !usedHint) {
      const bonus = this.addXP(this.XP_REWARDS.bonusNoHint, '首次通关奖励');
      totalXP += this.XP_REWARDS.bonusNoHint;
    }

    this._checkUnlocks();
    this._save();

    return { totalXP, isFirst };
  },

  isChallengeCompleted(moduleId, challengeId) {
    return this.state.modules[moduleId] &&
           this.state.modules[moduleId].challenges[challengeId]?.completed === true;
  },

  getModuleProgress(moduleId) {
    const mod = this.state.modules[moduleId];
    if (!mod) return 0;
    const total = this._getModuleChallengeCount(moduleId);
    if (total === 0) return 0;
    const completed = Object.keys(mod.challenges).filter(k => mod.challenges[k].completed).length;
    return completed / total;
  },

  isModuleUnlocked(moduleId) {
    return this.state.modules[moduleId]?.unlocked === true;
  },

  getTotalProgress() {
    let completed = 0;
    let total = 0;
    for (const modId of Object.keys(this.state.modules)) {
      const cnt = this._getModuleChallengeCount(modId);
      total += cnt;
      completed += Object.keys(this.state.modules[modId].challenges)
        .filter(k => this.state.modules[modId].challenges[k].completed).length;
    }
    return total > 0 ? completed / total : 0;
  },

  _getModuleChallengeCount(moduleId) {
    const counts = {
      architecture: 4,
      'pod-lifecycle': 5,
      network: 5,
      storage: 4,
      security: 4
    };
    return counts[moduleId] || 0;
  },

  _checkUnlocks() {
    const order = ['architecture', 'pod-lifecycle', 'network', 'storage', 'security'];
    for (let i = 0; i < order.length - 1; i++) {
      const progress = this.getModuleProgress(order[i]);
      if (progress >= 0.6 && !this.state.modules[order[i + 1]].unlocked) {
        this.state.modules[order[i + 1]].unlocked = true;
      }
    }
  },

  _save() {
    ProgressStore.save(this.state);
  },

  reset() {
    ProgressStore.reset();
    this.init();
  }
};

window.Game = Game;
```

- [ ] **Step 3: 在控制台测试**

```javascript
Game.init();
Game.addXP(100, '测试');
console.log(Game.getLevel());       // { level: 1, name: '学徒', xp: 0 }
console.log(Game.state.xp);         // 100
console.log(Game.getXPProgress());  // 0.2
Game.reset();
```

- [ ] **Step 4: 提交**

```bash
git add js/progress-store.js js/game.js
git commit -m "feat: add game state management and LocalStorage persistence"
```

---

### Task 7: 应用入口 + 侧边栏 + 状态栏

**Files:**
- Create: `js/app.js`

- [ ] **Step 1: 创建 app.js**

```javascript
/**
 * App — 应用主入口
 * 路由、模块加载、侧边栏、状态栏
 */
const App = {
  engine: null,
  animations: null,
  interactions: null,
  currentModule: null,
  currentChallenge: null,
  moduleRenderFrame: null,

  MODULE_ORDER: ['architecture', 'pod-lifecycle', 'network', 'storage', 'security'],

  MODULE_META: {
    'architecture': { title: '整体架构总览', icon: '🏛', color: '#58a6ff', challenges: 4 },
    'pod-lifecycle': { title: 'Pod 创建流程', icon: '📦', color: '#d2a8ff', challenges: 5 },
    'network': { title: '网络架构', icon: '🌐', color: '#3fb950', challenges: 5 },
    'storage': { title: '存储架构', icon: '💾', color: '#f0883e', challenges: 4 },
    'security': { title: '安全与可观测', icon: '🔒', color: '#f85149', challenges: 4 }
  },

  init() {
    Game.init();
    this.engine = new CanvasEngine('main-canvas').init();
    this.animations = new AnimationManager();
    this.interactions = new InteractionManager(this.engine, this.animations);

    this.renderSidebar();
    this.updateStatusBar();
    this._bindButtons();
    this.navigate(Game.state.currentModule);
  },

  renderSidebar() {
    const list = document.getElementById('module-list');
    list.innerHTML = '';

    for (const modId of this.MODULE_ORDER) {
      const meta = this.MODULE_META[modId];
      const unlocked = Game.isModuleUnlocked(modId);
      const progress = Game.getModuleProgress(modId);
      const isActive = this.currentModule === modId;

      const item = document.createElement('div');
      item.className = 'module-item' +
        (isActive ? ' active' : '') +
        (!unlocked ? ' locked' : '') +
        (progress >= 1 ? ' completed' : '');

      item.innerHTML =
        '<div class="module-title">' + meta.icon + ' ' + meta.title + '</div>' +
        '<div class="module-progress">' +
          '<div class="module-progress-bar">' +
            '<div class="module-progress-fill" style="width:' + (progress * 100) + '%"></div>' +
          '</div>' +
          '<span class="module-progress-text">' + Math.round(progress * 100) + '%</span>' +
        '</div>' +
        '<div class="module-status ' +
          (progress >= 1 ? 'completed' : '') +
          (!unlocked ? 'locked' : '') + '">' +
          (progress >= 1 ? '✓ 已完成' : (!unlocked ? '🔒 未解锁' : Math.round(progress * 100) + '%')) +
        '</div>';

      if (unlocked) {
        item.addEventListener('click', () => this.navigate(modId));
      }

      list.appendChild(item);
    }

    const stats = document.getElementById('progress-stats');
    const totalProgress = Game.getTotalProgress();
    const completedModules = this.MODULE_ORDER.filter(id => Game.getModuleProgress(id) >= 1).length;
    const totalChallenges = Object.values(Game.state.modules).reduce((sum, m) =>
      sum + Object.keys(m.challenges).filter(k => m.challenges[k].completed).length, 0);

    stats.innerHTML =
      '<div style="color:#d2a8ff;font-size:12px;margin-bottom:4px;">' + completedModules + '/5 模块</div>' +
      '<div style="color:#3fb950;font-size:12px;margin-bottom:4px;">' + totalChallenges + '/22 挑战</div>' +
      '<div style="color:#8b949e;font-size:12px;">总进度 ' + Math.round(totalProgress * 100) + '%</div>';
  },

  updateStatusBar() {
    const level = Game.getLevel();
    const nextLevel = Game.getNextLevel();
    const progress = Game.getXPProgress();

    document.getElementById('level-badge').textContent = 'Lv.' + level.level + ' ' + level.name;
    document.getElementById('xp-display').textContent = Game.state.xp + ' 经验';
    document.getElementById('xp-bar').style.width = (progress * 100) + '%';
  },

  navigate(moduleId) {
    if (!Game.isModuleUnlocked(moduleId)) return;

    if (this.currentModule === moduleId && this.currentChallenge !== null) return;

    this.currentModule = moduleId;
    this.currentChallenge = null;
    Game.state.currentModule = moduleId;
    Game._save();

    this._cleanupModule();
    this.renderSidebar();

    document.getElementById('challenge-card').classList.add('hidden');
    document.getElementById('feedback-bubble').classList.add('hidden');
    document.getElementById('tooltip-bubble').classList.add('hidden');
    document.getElementById('btn-start').classList.remove('hidden');
    document.getElementById('btn-learn').classList.remove('hidden');

    this._renderModuleOverview(moduleId);
  },

  startChallenge(challengeIndex) {
    this._cleanupModule();
    this.currentChallenge = challengeIndex;

    const mod = window.K8sModules[this.currentModule];
    if (!mod || !mod.challenges[challengeIndex]) return;

    const challenge = mod.challenges[challengeIndex];
    document.getElementById('challenge-card').classList.remove('hidden');
    document.getElementById('challenge-title').textContent = '🎯 挑战 ' + (challengeIndex + 1) + '：' + challenge.title;
    document.getElementById('challenge-desc').textContent = challenge.description;
    document.getElementById('challenge-actions').innerHTML = '';
    document.getElementById('btn-start').classList.add('hidden');
    document.getElementById('btn-learn').classList.add('hidden');

    challenge.render(this.engine, this.animations, this.interactions, this);
  },

  showFeedback(type, message, duration = 3000) {
    const bubble = document.getElementById('feedback-bubble');
    const icon = document.getElementById('feedback-icon');
    const text = document.getElementById('feedback-text');

    bubble.className = 'feedback-bubble ' + type;
    icon.textContent = type === 'success' ? '✅' : type === 'error' ? '❌' : '💡';
    text.textContent = message;
    bubble.classList.remove('hidden');

    if (duration > 0) {
      setTimeout(() => bubble.classList.add('hidden'), duration);
    }
  },

  showTooltip(title, text, x, y) {
    const tip = document.getElementById('tooltip-bubble');
    document.getElementById('tooltip-title').textContent = title;
    document.getElementById('tooltip-text').textContent = text;
    tip.style.left = (x + 15) + 'px';
    tip.style.top = (y - 10) + 'px';
    tip.classList.remove('hidden');
  },

  hideTooltip() {
    document.getElementById('tooltip-bubble').classList.add('hidden');
  },

  onChallengeComplete(moduleId, challengeIndex, usedHint = false) {
    const result = Game.completeChallenge(moduleId, String(challengeIndex), usedHint);
    this.updateStatusBar();
    this.renderSidebar();

    const xpMsg = result.isFirst && !usedHint
      ? '+' + result.totalXP + ' 经验（含首次通关奖励）'
      : '+' + this.XP_REWARDS?.challenge + ' 经验';

    this.showFeedback('success', '太棒了！挑战完成！' + xpMsg, 4000);

    const mod = window.K8sModules[moduleId];
    if (mod && challengeIndex + 1 < mod.challenges.length) {
      setTimeout(() => this.startChallenge(challengeIndex + 1), 2500);
    } else {
      setTimeout(() => {
        this.showFeedback('success', '🎉 模块完成！', 3000);
        this.navigate(moduleId);
      }, 2500);
    }
  },

  _renderModuleOverview(moduleId) {
    const mod = window.K8sModules[moduleId];
    if (!mod) return;

    this.engine.clear();
    const cx = this.engine.width / 2;
    const cy = this.engine.height / 2;
    const meta = this.MODULE_META[moduleId];

    this.engine.drawText(meta.icon + ' ' + meta.title, cx, cy - 60, {
      color: meta.color,
      fontSize: 24,
      fontWeight: '600',
      align: 'center',
      baseline: 'middle'
    });

    this.engine.drawText(mod.description || '', cx, cy - 20, {
      color: '#8b949e',
      fontSize: 14,
      align: 'center',
      baseline: 'middle'
    });

    this.engine.drawText('共 ' + mod.challenges.length + ' 个挑战 | 点击「开始挑战」继续', cx, cy + 20, {
      color: '#484f58',
      fontSize: 12,
      align: 'center',
      baseline: 'middle'
    });

    const nextChallenge = mod.challenges.findIndex((_, i) =>
      !Game.isChallengeCompleted(moduleId, String(i)));
    if (nextChallenge >= 0) {
      document.getElementById('btn-start').textContent = '▶ 开始挑战 ' + (nextChallenge + 1);
      document.getElementById('btn-start').onclick = () => this.startChallenge(nextChallenge);
    }
  },

  _cleanupModule() {
    this.animations.clear();
    this.interactions.destroy();
    this.engine.clear();
  },

  _bindButtons() {
    document.getElementById('btn-reset').addEventListener('click', () => {
      if (this.currentChallenge !== null) {
        this.startChallenge(this.currentChallenge);
      }
    });
  }
};

window.addEventListener('DOMContentLoaded', () => App.init());
```

- [ ] **Step 2: 在浏览器中打开验证**

打开 `index.html`，应看到：
- 顶部状态栏：Lv.1 学徒 | 0 经验 | 进度条
- 侧边栏：整体架构总览（高亮）+ 其余 4 个模块（locked）
- 中央 Canvas：模块标题文字

- [ ] **Step 3: 提交**

```bash
git add js/app.js
git commit -m "feat: add app entry point with sidebar, status bar, and navigation"
```

---

## Phase 2: 模块一 — 整体架构总览

### Task 8: 模块一 — 整体架构（4 挑战）

**Files:**
- Create: `js/modules/architecture.js`

- [ ] **Step 1: 创建 architecture.js**

```javascript
/**
 * 模块一：整体架构总览
 * 4 个挑战：认识组件、拼装控制面、组件通信、Worker 节点
 */
window.K8sModules = window.K8sModules || {};

window.K8sModules['architecture'] = {
  id: 'architecture',
  description: '理解 Kubernetes Master-Node 架构，认识每个控制面组件的角色和通信方式。',

  challenges: [
    /* ===== 挑战 1：认识组件（探索型） ===== */
    {
      title: '认识组件',
      type: 'explore',
      description: '点击每个组件，了解它在 K8s 集群中的作用。',
      render(engine, animations, interactions, app) {
        engine.clear();

        const components = [
          { id: 'apiserver', label: 'kube-apiserver', x: 120, y: 80, w: 160, h: 56, color: '#58a6ff',
            info: 'API Server 是集群的入口。所有组件（kubectl、scheduler、controller-manager、kubelet）都通过它通信。它负责认证、鉴权、准入控制和 RESTful API 暴露。' },
          { id: 'etcd', label: 'etcd', x: 120, y: 180, w: 160, h: 56, color: '#d2a8ff',
            info: 'etcd 是分布式键值存储，保存集群的所有状态数据：Pod 定义、Service、ConfigMap、Secret 等。API Server 是唯一与 etcd 直接通信的组件。' },
          { id: 'scheduler', label: 'kube-scheduler', x: 120, y: 280, w: 160, h: 56, color: '#3fb950',
            info: 'Scheduler 监听新建的、尚未调度的 Pod，根据资源需求、亲和性规则、污点容忍等条件为其选择最优节点。' },
          { id: 'controller', label: 'kube-controller-manager', x: 120, y: 380, w: 160, h: 56, color: '#f0883e',
            info: 'Controller Manager 运行多个控制器循环：Deployment Controller 维护副本数、Node Controller 处理节点故障、ReplicaSet Controller 管理Pod 副本等。' },
          { id: 'kubelet', label: 'kubelet', x: 450, y: 140, w: 140, h: 56, color: '#f85149',
            info: 'kubelet 运行在每个 Worker 节点上，负责：监听 API Server 获取分配到本节点的 Pod，拉取镜像，启动/停止容器，汇报节点和 Pod 状态。' },
          { id: 'kubeproxy', label: 'kube-proxy', x: 450, y: 260, w: 140, h: 56, color: '#d29922',
            info: 'kube-proxy 运行在每个节点上，维护 iptables/IPVS 规则，实现 Service 的负载均衡和网络代理，将 Service ClusterIP 的流量转发到后端 Pod。' }
        ];

        // 绘制标题
        engine.drawText('☸ 控制面组件', 200, 30, {
          color: '#58a6ff', fontSize: 16, fontWeight: '600', align: 'center', baseline: 'middle'
        });
        engine.drawText('工作节点组件', 520, 80, {
          color: '#f85149', fontSize: 14, fontWeight: '600', align: 'center', baseline: 'middle'
        });

        // 绘制分隔线
        engine.drawLine(350, 60, 350, 440, { color: '#30363d', dashed: [4, 4] });

        // 绘制组件节点
        components.forEach(comp => {
          engine.drawNode(comp.x, comp.y, comp.w, comp.h, comp.label, {
            id: comp.id,
            borderColor: comp.color,
            bgColor: comp.color + '11',
            interactive: true,
            data: comp
          });
        });

        // 绘制连接箭头
        engine.drawArrow(280, 108, 280, 180, { color: '#30363d' });
        engine.drawArrow(280, 208, 280, 280, { color: '#30363d' });
        engine.drawArrow(280, 308, 280, 380, { color: '#30363d' });
        engine.drawCurvedArrow(280, 136, 450, 168, { color: '#30363d', curvature: 0.2 });

        // 底部提示
        engine.drawText('💡 点击任意组件查看详情', engine.width / 2, engine.height - 40, {
          color: '#484f58', fontSize: 13, align: 'center', baseline: 'middle'
        });

        // 点击交互
        let explored = new Set();
        const compIds = components.map(c => c.id);

        interactions.onClick(compIds, (id, data, pos) => {
          app.showTooltip(data.label, data.info, pos.x + 10, pos.y - 20);
          animations.emitParticles(engine, pos.x, pos.y, data.color, 8);
          explored.add(id);

          // 探索完所有组件自动完成
          if (explored.size >= components.length) {
            setTimeout(() => app.onChallengeComplete('architecture', 0, false), 1000);
          }
        });

        // 点击空白关闭 tooltip
        interactions.onAnyClick((hit) => {
          if (!hit) app.hideTooltip();
        });
      }
    },

    /* ===== 挑战 2：拼装控制面（拖拽型） ===== */
    {
      title: '拼装控制面',
      type: 'drag',
      description: '将四个控制面组件拖拽到正确的位置，组装完整的 Master 控制面。',
      render(engine, animations, interactions, app) {
        engine.clear();

        // 绘制 Master 框
        const masterX = 300, masterY = 60, masterW = 380, masterH = 380;
        engine.drawRect(masterX, masterY, masterW, masterH, {
          fillColor: '#0d1117',
          borderColor: '#58a6ff',
          borderWidth: 2,
          radius: 12
        });
        engine.drawText('Master 控制面', masterX + masterW / 2, masterY + 20, {
          color: '#58a6ff', fontSize: 14, fontWeight: '600', align: 'center'
        });

        // 目标槽位
        const targets = [
          { id: 'slot-apiserver', x: 330, y: 80, w: 140, h: 50, label: 'API 网关', accepts: 'apiserver' },
          { id: 'slot-etcd', x: 510, y: 80, w: 140, h: 50, label: '状态存储', accepts: 'etcd' },
          { id: 'slot-scheduler', x: 330, y: 200, w: 140, h: 50, label: '调度器', accepts: 'scheduler' },
          { id: 'slot-controller', x: 510, y: 200, w: 140, h: 50, label: '控制器', accepts: 'controller' }
        ];

        targets.forEach(t => {
          engine.drawRect(t.x, t.y, t.w, t.h, {
            fillColor: '#0d1117',
            borderColor: '#484f58',
            borderWidth: 1,
            radius: 6,
            dashed: true,
            id: t.id,
            interactive: true,
            data: t
          });
          engine.drawText('拖入 ' + t.label, t.x + t.w / 2, t.y + t.h / 2, {
            color: '#484f58', fontSize: 11, align: 'center', baseline: 'middle'
          });
        });

        // 可拖拽的源组件
        const sources = [
          { id: 'apiserver', label: 'kube-apiserver', x: 40, y: 100, w: 130, h: 44, color: '#58a6ff' },
          { id: 'etcd', label: 'etcd', x: 40, y: 170, w: 130, h: 44, color: '#d2a8ff' },
          { id: 'scheduler', label: 'kube-scheduler', x: 40, y: 240, w: 130, h: 44, color: '#3fb950' },
          { id: 'controller', label: 'controller-manager', x: 40, y: 310, w: 130, h: 44, color: '#f0883e' }
        ];

        // 打乱顺序
        sources.sort(() => Math.random() - 0.5);
        sources.forEach((s, i) => {
          s.x = 40;
          s.y = 100 + i * 70;
          engine.drawNode(s.x, s.y, s.w, s.h, s.label, {
            id: s.id,
            borderColor: s.color,
            bgColor: s.color + '11',
            interactive: true,
            data: s
          });
        });

        // 提示文字
        engine.drawText('📦 将左侧组件拖入右侧对应位置', engine.width / 2, engine.height - 40, {
          color: '#484f58', fontSize: 13, align: 'center', baseline: 'middle'
        });

        // 拖拽交互
        let placed = 0;
        interactions.enableDrag(sources, targets, {
          onDrop(sourceId, targetId, correct) {
            if (correct) {
              const src = sources.find(s => s.id === sourceId);
              const tgt = targets.find(t => t.id === targetId);
              if (src) {
                engine.drawNode(tgt.x + (tgt.w - src.w) / 2, tgt.y + (tgt.h - src.h) / 2, src.w, src.h, src.label, {
                  borderColor: src.color, bgColor: src.color + '22'
                });
                animations.emitParticles(engine, tgt.x + tgt.w / 2, tgt.y + tgt.h / 2, src.color, 15);
              }
              placed++;
              app.showFeedback('success', '✅ ' + sources.find(s => s.id === sourceId).label + ' 放置正确！', 2000);
              if (placed >= sources.length) {
                setTimeout(() => app.onChallengeComplete('architecture', 1, false), 1500);
              }
            } else {
              app.showFeedback('error', '❌ 位置不对，再想想这个组件的职责是什么？', 2000);
            }
          }
        });
      }
    },

    /* ===== 挑战 3：组件通信（序列型） ===== */
    {
      title: '组件通信',
      type: 'sequence',
      description: '按照正确的顺序点击组件，模拟一个 Pod 创建请求在控制面中的流转路径。',
      render(engine, animations, interactions, app) {
        engine.clear();

        const steps = [
          { id: 'kubectl', label: 'kubectl', x: 80, y: 200, w: 100, h: 50, color: '#8b949e',
            hint: '用户通过 kubectl 发送创建请求' },
          { id: 'apiserver', label: 'API Server', x: 240, y: 200, w: 130, h: 50, color: '#58a6ff',
            hint: '请求到达 API Server，经过认证、鉴权、准入控制' },
          { id: 'etcd', label: 'etcd', x: 420, y: 200, w: 100, h: 50, color: '#d2a8ff',
            hint: 'Pod 定义被持久化到 etcd' },
          { id: 'scheduler', label: 'Scheduler', x: 240, y: 80, w: 130, h: 50, color: '#3fb950',
            hint: 'Scheduler 监听到未调度的 Pod，为其选择节点' },
          { id: 'apiserver2', label: 'API Server', x: 420, y: 80, w: 130, h: 50, color: '#58a6ff',
            hint: 'Scheduler 将调度结果写回 API Server' },
          { id: 'kubelet', label: 'kubelet', x: 600, y: 140, w: 110, h: 50, color: '#f85149',
            hint: 'kubelet 监听到 Pod 分配到本节点，开始创建容器' }
        ];

        const correctOrder = steps.map(s => s.id);

        // 绘制所有节点
        steps.forEach((step, i) => {
          engine.drawNode(step.x, step.y, step.w, step.h, step.label, {
            id: step.id,
            borderColor: step.color,
            bgColor: step.color + '11',
            interactive: true,
            data: { ...step, index: i }
          });
        });

        // 绘制预期路径（虚线）
        engine.drawArrow(180, 225, 240, 225, { color: '#30363d', dashed: [3, 3] });
        engine.drawArrow(370, 225, 420, 225, { color: '#30363d', dashed: [3, 3] });
        engine.drawCurvedArrow(470, 200, 305, 130, { color: '#30363d', dashed: [3, 3], curvature: -0.3 });
        engine.drawArrow(370, 105, 420, 105, { color: '#30363d', dashed: [3, 3] });
        engine.drawCurvedArrow(550, 105, 655, 165, { color: '#30363d', dashed: [3, 3], curvature: 0.2 });

        // 顶部标题
        engine.drawText('🚀 Pod 创建请求的流转路径', engine.width / 2, 25, {
          color: '#e6edf3', fontSize: 15, fontWeight: '600', align: 'center', baseline: 'middle'
        });

        // 底部提示
        engine.drawText('💡 按正确顺序点击组件，模拟请求流转', engine.width / 2, engine.height - 40, {
          color: '#484f58', fontSize: 13, align: 'center', baseline: 'middle'
        });

        // 进度指示
        let stepIndex = 0;

        interactions.enableSequence(correctOrder, {
          onCorrectStep(id, idx) {
            const step = steps[idx];
            // 高亮已完成的节点
            engine.drawNode(step.x, step.y, step.w, step.h, step.label, {
              borderColor: step.color,
              bgColor: step.color + '33',
              id: step.id,
              interactive: true,
              data: { ...step, index: idx }
            });
            animations.addPulse(engine, step.x + step.w / 2, step.y + step.h / 2, step.color);
            app.showFeedback('success', '✅ 第 ' + (idx + 1) + ' 步：' + step.hint, 2000);
          },
          onWrongStep(id, expectedIdx) {
            const correctStep = steps[expectedIdx];
            app.showFeedback('error', '❌ 顺序不对！下一个应该是「' + correctStep.label + '」— 提示：' + correctStep.hint, 3000);
          },
          onComplete() {
            setTimeout(() => app.onChallengeComplete('architecture', 2, false), 1000);
          }
        });
      }
    },

    /* ===== 挑战 4：Worker 节点（拖拽型） ===== */
    {
      title: 'Worker 节点',
      type: 'drag',
      description: '将 Worker 节点的三个关键组件拖拽到正确位置，组装一个完整的工作节点。',
      render(engine, animations, interactions, app) {
        engine.clear();

        // 绘制 Worker Node 框
        const nodeX = 280, nodeY = 60, nodeW = 400, nodeH = 380;
        engine.drawRect(nodeX, nodeY, nodeW, nodeH, {
          fillColor: '#0d1117',
          borderColor: '#f85149',
          borderWidth: 2,
          radius: 12
        });
        engine.drawText('Worker Node', nodeX + nodeW / 2, nodeY + 20, {
          color: '#f85149', fontSize: 14, fontWeight: '600', align: 'center'
        });

        // 目标槽位
        const targets = [
          { id: 'slot-kubelet', x: 320, y: 90, w: 150, h: 55, label: '节点代理', accepts: 'kubelet' },
          { id: 'slot-kubeproxy', x: 510, y: 90, w: 140, h: 55, label: '网络代理', accepts: 'kubeproxy' },
          { id: 'slot-runtime', x: 400, y: 220, w: 160, h: 55, label: '容器运行时', accepts: 'runtime' }
        ];

        targets.forEach(t => {
          engine.drawRect(t.x, t.y, t.w, t.h, {
            fillColor: '#0d1117',
            borderColor: '#484f58',
            radius: 6,
            id: t.id,
            interactive: true,
            data: t
          });
          engine.drawText('拖入 ' + t.label, t.x + t.w / 2, t.y + t.h / 2, {
            color: '#484f58', fontSize: 11, align: 'center', baseline: 'middle'
          });
        });

        // 绘制 Pod 容器占位（在运行时下方）
        engine.drawRect(370, 310, 80, 50, { fillColor: '#3fb95011', borderColor: '#3fb950', radius: 6 });
        engine.drawText('Pod', 410, 335, { color: '#3fb950', fontSize: 11, align: 'center', baseline: 'middle' });
        engine.drawRect(470, 310, 80, 50, { fillColor: '#3fb95011', borderColor: '#3fb950', radius: 6 });
        engine.drawText('Pod', 510, 335, { color: '#3fb950', fontSize: 11, align: 'center', baseline: 'middle' });
        engine.drawText('（运行时负责启动这些 Pod）', nodeX + nodeW / 2, 375, {
          color: '#484f58', fontSize: 10, align: 'center', baseline: 'middle'
        });

        // 可拖拽源
        const sources = [
          { id: 'kubelet', label: 'kubelet', color: '#f85149' },
          { id: 'kubeproxy', label: 'kube-proxy', color: '#d29922' },
          { id: 'runtime', label: '容器运行时 (CRI)', color: '#3fb950' }
        ];

        sources.sort(() => Math.random() - 0.5);
        sources.forEach((s, i) => {
          s.x = 50;
          s.y = 120 + i * 90;
          s.w = 140;
          s.h = 44;
          engine.drawNode(s.x, s.y, s.w, s.h, s.label, {
            id: s.id,
            borderColor: s.color,
            bgColor: s.color + '11',
            interactive: true,
            data: s
          });
        });

        // 连线提示
        engine.drawArrow(480, 275, 430, 310, { color: '#30363d', dashed: [3, 3] });
        engine.drawArrow(480, 275, 530, 310, { color: '#30363d', dashed: [3, 3] });

        engine.drawText('📦 将组件拖入 Worker Node', engine.width / 2, engine.height - 40, {
          color: '#484f58', fontSize: 13, align: 'center', baseline: 'middle'
        });

        let placed = 0;
        interactions.enableDrag(sources, targets, {
          onDrop(sourceId, targetId, correct) {
            if (correct) {
              const src = sources.find(s => s.id === sourceId);
              const tgt = targets.find(t => t.id === targetId);
              engine.drawNode(tgt.x + (tgt.w - src.w) / 2, tgt.y + (tgt.h - src.h) / 2, src.w, src.h, src.label, {
                borderColor: src.color, bgColor: src.color + '22'
              });
              animations.emitParticles(engine, tgt.x + tgt.w / 2, tgt.y + tgt.h / 2, src.color, 15);
              placed++;
              app.showFeedback('success', '✅ ' + src.label + ' 放置正确！', 2000);
              if (placed >= sources.length) {
                setTimeout(() => app.onChallengeComplete('architecture', 3, false), 1500);
              }
            } else {
              app.showFeedback('error', '❌ 位置不对，想想这个组件在节点上负责什么？', 2000);
            }
          }
        });
      }
    }
  ]
};
```

- [ ] **Step 2: 在浏览器中验证**

打开 `index.html`，点击「开始挑战」进入模块一：
- 挑战 1：点击各组件应弹出 tooltip 显示说明，探索完所有组件自动完成
- 挑战 2：拖拽组件到目标位置，正确放置后粒子效果
- 挑战 3：按正确顺序点击，错误时给出提示
- 挑战 4：拖拽 Worker 节点组件

- [ ] **Step 3: 提交**

```bash
git add js/modules/architecture.js
git commit -m "feat: add module 1 - architecture overview with 4 challenges"
```

---

## Phase 3: 模块二 — Pod 创建流程

### Task 9: 模块二 — Pod 创建流程（5 挑战）

**Files:**
- Create: `js/modules/pod-lifecycle.js`

- [ ] **Step 1: 创建 pod-lifecycle.js**

```javascript
/**
 * 模块二：Pod 创建流程
 * 5 个挑战：发起请求、认证鉴权、持久化、调度决策、启动容器
 */
window.K8sModules = window.K8sModules || {};

window.K8sModules['pod-lifecycle'] = {
  id: 'pod-lifecycle',
  description: '从 kubectl run 到容器运行的完整链路，理解每个环节的控制面组件如何协作。',

  challenges: [
    /* ===== 挑战 1：发起请求（序列型） ===== */
    {
      title: '发起请求',
      type: 'sequence',
      description: '模拟 kubectl 发送创建 Pod 请求到 API Server 的完整过程，按正确顺序点击每个步骤。',
      render(engine, animations, interactions, app) {
        engine.clear();

        const steps = [
          { id: 'user-cmd', label: '用户执行 kubectl run', x: 60, y: 160, w: 170, h: 50, color: '#8b949e',
            hint: '用户在终端输入 kubectl run nginx --image=nginx' },
          { id: 'read-yaml', label: '生成 Pod YAML', x: 60, y: 280, w: 170, h: 50, color: '#d2a8ff',
            hint: 'kubectl 将命令行参数转换为 Pod 定义 YAML' },
          { id: 'http-post', label: '发送 HTTP POST', x: 310, y: 220, w: 160, h: 50, color: '#58a6ff',
            hint: 'kubectl 通过 HTTP POST 将 YAML 发送到 API Server 的 /api/v1/namespaces/default/pods' },
          { id: 'api-receive', label: 'API Server 接收', x: 540, y: 160, w: 150, h: 50, color: '#58a6ff',
            hint: 'API Server 接收到请求，准备进入认证阶段' }
        ];

        const correctOrder = steps.map(s => s.id);

        steps.forEach(step => {
          engine.drawNode(step.x, step.y, step.w, step.h, step.label, {
            id: step.id, borderColor: step.color, bgColor: step.color + '11',
            interactive: true, data: step
          });
        });

        engine.drawArrow(145, 210, 145, 280, { color: '#30363d', dashed: [3, 3] });
        engine.drawArrow(230, 305, 310, 245, { color: '#30363d', dashed: [3, 3] });
        engine.drawArrow(470, 245, 540, 185, { color: '#30363d', dashed: [3, 3] });

        engine.drawText('🚀 发起 Pod 创建请求', engine.width / 2, 40, {
          color: '#e6edf3', fontSize: 15, fontWeight: '600', align: 'center', baseline: 'middle'
        });
        engine.drawText('💡 按正确顺序点击步骤', engine.width / 2, engine.height - 40, {
          color: '#484f58', fontSize: 13, align: 'center', baseline: 'middle'
        });

        interactions.enableSequence(correctOrder, {
          onCorrectStep(id, idx) {
            const step = steps[idx];
            engine.drawNode(step.x, step.y, step.w, step.h, step.label, {
              borderColor: step.color, bgColor: step.color + '33',
              id: step.id, interactive: true, data: step
            });
            animations.addPulse(engine, step.x + step.w / 2, step.y + step.h / 2, step.color);
            app.showFeedback('success', '✅ ' + step.hint, 2000);
          },
          onWrongStep(id, expectedIdx) {
            app.showFeedback('error', '❌ 顺序不对！提示：' + steps[expectedIdx].hint, 3000);
          },
          onComplete() {
            setTimeout(() => app.onChallengeComplete('pod-lifecycle', 0, false), 1000);
          }
        });
      }
    },

    /* ===== 挑战 2：认证鉴权（选择题） ===== */
    {
      title: '认证鉴权',
      type: 'choice',
      description: 'API Server 收到请求后，需要经过认证和鉴权。选择正确的认证方式来通过请求。',
      render(engine, animations, interactions, app) {
        engine.clear();

        // 绘制 API Server
        engine.drawNode(280, 60, 200, 60, 'API Server', {
          borderColor: '#58a6ff', bgColor: '#58a6ff22'
        });

        // 请求进入
        engine.drawArrow(150, 90, 280, 90, { color: '#3fb950' });
        engine.drawText('Pod 创建请求', 80, 75, { color: '#3fb950', fontSize: 12 });

        // 认证关卡
        engine.drawRect(200, 180, 360, 80, {
          fillColor: '#d2992211', borderColor: '#d29922', radius: 10
        });
        engine.drawText('🔐 认证关卡', 380, 195, {
          color: '#d29922', fontSize: 13, fontWeight: '600', align: 'center'
        });
        engine.drawText('一个 ServiceAccount 需要访问 API Server，选择认证方式：', 380, 220, {
          color: '#8b949e', fontSize: 11, align: 'center'
        });

        // 鉴权关卡
        engine.drawRect(200, 310, 360, 80, {
          fillColor: '#f0883e11', borderColor: '#f0883e', radius: 10
        });
        engine.drawText('📋 鉴权关卡', 380, 325, {
          color: '#f0883e', fontSize: 13, fontWeight: '600', align: 'center'
        });
        engine.drawText('该 ServiceAccount 需要创建 Pod 的权限，选择鉴权方式：', 380, 350, {
          color: '#8b949e', fontSize: 11, align: 'center'
        });

        engine.drawArrow(380, 260, 380, 310, { color: '#30363d', dashed: [3, 3] });

        let authPassed = false;

        // 认证选择
        interactions.enableChoice(
          [
            { id: 'basic', label: '用户名密码', desc: 'Basic Auth' },
            { id: 'token', label: 'Bearer Token（SA Token）', desc: 'JWT Token 认证' },
            { id: 'cert', label: '客户端证书', desc: 'X.509 双向 TLS' }
          ],
          'token',
          (correct, id) => {
            if (correct) {
              authPassed = true;
              app.showFeedback('success', '✅ 正确！ServiceAccount 使用 JWT Token 认证。API Server 验证 Token 签名后确认身份。', 3000);
              setTimeout(() => {
                // 显示鉴权选择
                interactions.enableChoice(
                  [
                    { id: 'abac', label: 'ABAC', desc: '基于属性的访问控制' },
                    { id: 'rbac', label: 'RBAC', desc: '基于角色的访问控制' },
                    { id: 'webhook', label: 'Webhook', desc: '外部鉴权服务' }
                  ],
                  'rbac',
                  (correct2) => {
                    if (correct2) {
                      app.showFeedback('success', '✅ 正确！K8s 默认使用 RBAC。RoleBinding 将 ServiceAccount 绑定到具有 Pod 创建权限的 Role。', 3000);
                      setTimeout(() => app.onChallengeComplete('pod-lifecycle', 1, false), 1500);
                    } else {
                      app.showFeedback('error', '❌ K8s 默认的鉴权方式是 RBAC（基于角色的访问控制）。', 3000);
                    }
                  }
                );
              }, 1000);
            } else {
              app.showFeedback('error', '❌ ServiceAccount 不使用用户名密码认证。它使用自动挂载的 JWT Token（在 /var/run/secrets/kubernetes.io/serviceaccount/ 下）。', 4000);
            }
          }
        );
      }
    },

    /* ===== 挑战 3：持久化（序列型） ===== */
    {
      title: '持久化',
      type: 'sequence',
      description: '请求通过认证后，Pod 定义需要被持久化到 etcd。按正确顺序点击步骤。',
      render(engine, animations, interactions, app) {
        engine.clear();

        const steps = [
          { id: 'validate', label: '验证 YAML 格式', x: 80, y: 100, w: 150, h: 50, color: '#d29922',
            hint: 'API Server 校验 YAML 的 schema 是否合法' },
          { id: 'admission', label: '准入控制器', x: 80, y: 220, w: 150, h: 50, color: '#f0883e',
            hint: 'MutatingWebhook 修改默认值 → ValidatingWebhook 校验策略' },
          { id: 'encode', label: '编码为 JSON', x: 310, y: 160, w: 140, h: 50, color: '#58a6ff',
            hint: '内部将 YAML 编码为 JSON protobuf 格式' },
          { id: 'write-etcd', label: '写入 etcd', x: 530, y: 100, w: 130, h: 50, color: '#d2a8ff',
            hint: 'Pod 定义持久化到 etcd，状态为 Pending' },
          { id: 'confirm', label: '返回确认', x: 530, y: 220, w: 130, h: 50, color: '#3fb950',
            hint: 'API Server 返回 201 Created 给 kubectl' }
        ];

        const correctOrder = steps.map(s => s.id);

        // 绘制 etcd 图标
        engine.drawRect(520, 60, 160, 240, {
          fillColor: '#0d1117', borderColor: '#d2a8ff', radius: 12
        });
        engine.drawText('etcd', 600, 80, { color: '#d2a8ff', fontSize: 14, fontWeight: '600', align: 'center' });

        steps.forEach(step => {
          engine.drawNode(step.x, step.y, step.w, step.h, step.label, {
            id: step.id, borderColor: step.color, bgColor: step.color + '11',
            interactive: true, data: step
          });
        });

        engine.drawText('💾 Pod 持久化流程', engine.width / 2, 30, {
          color: '#e6edf3', fontSize: 15, fontWeight: '600', align: 'center', baseline: 'middle'
        });

        interactions.enableSequence(correctOrder, {
          onCorrectStep(id, idx) {
            const step = steps[idx];
            engine.drawNode(step.x, step.y, step.w, step.h, step.label, {
              borderColor: step.color, bgColor: step.color + '33',
              id: step.id, interactive: true, data: step
            });
            animations.addPulse(engine, step.x + step.w / 2, step.y + step.h / 2, step.color);
            app.showFeedback('success', '✅ ' + step.hint, 2000);
          },
          onWrongStep(id, expectedIdx) {
            app.showFeedback('error', '❌ 顺序不对！下一步：' + steps[expectedIdx].hint, 3000);
          },
          onComplete() {
            setTimeout(() => app.onChallengeComplete('pod-lifecycle', 2, false), 1000);
          }
        });
      }
    },

    /* ===== 挑战 4：调度决策（决策型） ===== */
    {
      title: '调度决策',
      type: 'decision',
      description: 'Scheduler 需要为 Nginx Pod（需要 CPU 500m / 内存 256Mi）选择最优节点。分析节点资源后做出调度决策。',
      render(engine, animations, interactions, app) {
        engine.clear();

        // 绘制 Scheduler
        engine.drawNode(280, 30, 180, 50, 'kube-scheduler', {
          borderColor: '#3fb950', bgColor: '#3fb95022'
        });
        engine.drawText('正在为 Nginx Pod（CPU 500m / 内存 256Mi）选择节点...', 370, 100, {
          color: '#8b949e', fontSize: 12, align: 'center'
        });

        // 待调度 Pod
        engine.drawNode(60, 40, 140, 40, 'Nginx Pod', {
          borderColor: '#d2a8ff', bgColor: '#d2a8ff11'
        });
        engine.drawArrow(200, 60, 280, 55, { color: '#d29922' });

        // 节点
        const nodes = [
          { id: 'node1', label: 'Node-1', x: 80, y: 160, w: 180, h: 120,
            color: '#3fb950', cpu: '40%', mem: '35%', status: '资源充足', schedulable: true },
          { id: 'node2', label: 'Node-2', x: 310, y: 160, w: 180, h: 120,
            color: '#f85149', cpu: '92%', mem: '88%', status: '资源不足', schedulable: false },
          { id: 'node3', label: 'Node-3', x: 540, y: 160, w: 180, h: 120,
            color: '#d29922', cpu: '75%', mem: '70%', status: '资源紧张', schedulable: false }
        ];

        nodes.forEach(node => {
          engine.drawRect(node.x, node.y, node.w, node.h, {
            fillColor: node.color + '08', borderColor: node.color, radius: 10,
            id: node.id, interactive: true, data: node
          });
          engine.drawText(node.label, node.x + node.w / 2, node.y + 20, {
            color: node.color, fontSize: 14, fontWeight: '600', align: 'center'
          });
          engine.drawText('CPU: ' + node.cpu + ' | 内存: ' + node.mem, node.x + node.w / 2, node.y + 50, {
            color: '#8b949e', fontSize: 11, align: 'center'
          });
          engine.drawText(node.status, node.x + node.w / 2, node.y + 75, {
            color: node.color, fontSize: 11, fontWeight: '600', align: 'center'
          });

          // 进度条
          const cpuPct = parseInt(node.cpu) / 100;
          const memPct = parseInt(node.mem) / 100;
          engine.drawProgressBar(node.x + 15, node.y + 95, 65, 6, cpuPct, { fillColor: node.color });
          engine.drawProgressBar(node.x + 100, node.y + 95, 65, 6, memPct, { fillColor: node.color });
        });

        engine.drawText('📊 分析节点资源，选择最优调度目标', engine.width / 2, engine.height - 40, {
          color: '#484f58', fontSize: 13, align: 'center', baseline: 'middle'
        });

        const nodeIds = nodes.map(n => n.id);

        interactions.onClick(nodeIds, (id, data) => {
          if (data.schedulable) {
            animations.emitParticles(engine, data.x + data.w / 2, data.y + data.h / 2, '#3fb950', 20);
            app.showFeedback('success',
              '✅ 正确！Node-1 资源最充足（CPU 40%、内存 35%）。Scheduler 的打分算法（LeastRequestedPriority）会优先选择资源利用率最低的节点。',
              4000);
            setTimeout(() => app.onChallengeComplete('pod-lifecycle', 3, false), 2000);
          } else {
            const reason = id === 'node2'
              ? 'Node-2 CPU 92%、内存 88%，几乎耗尽，无法承载新 Pod。'
              : 'Node-3 资源紧张（CPU 75%、内存 70%），虽然可以勉强调度，但不是最优选择。';
            app.showFeedback('error', '❌ ' + reason + '提示：选择资源最充足的节点。', 4000);
          }
        });
      }
    },

    /* ===== 挑战 5：启动容器（序列型） ===== */
    {
      title: '启动容器',
      type: 'sequence',
      description: 'kubelet 收到调度结果后，需要完成一系列操作来启动容器。按正确顺序点击。',
      render(engine, animations, interactions, app) {
        engine.clear();

        const steps = [
          { id: 'watch', label: 'kubelet Watch', x: 60, y: 100, w: 140, h: 50, color: '#f85149',
            hint: 'kubelet 通过 Watch 机制监听 API Server，发现新 Pod 被调度到本节点' },
          { id: 'validate', label: '校验 Pod 规格', x: 60, y: 220, w: 140, h: 50, color: '#d29922',
            hint: 'kubelet 校验 Pod 定义（镜像、资源、挂载卷等）是否合法' },
          { id: 'pull', label: '拉取镜像', x: 260, y: 160, w: 130, h: 50, color: '#58a6ff',
            hint: '容器运行时（containerd）从镜像仓库拉取 nginx:latest' },
          { id: 'mount', label: '挂载存储卷', x: 440, y: 100, w: 130, h: 50, color: '#d2a8ff',
            hint: '如果 Pod 定义了 Volume，先挂载存储卷到指定路径' },
          { id: 'create', label: '创建容器', x: 440, y: 220, w: 130, h: 50, color: '#3fb950',
            hint: '容器运行时根据镜像创建容器进程，配置网络命名空间' },
          { id: 'probe', label: '健康检查', x: 620, y: 160, w: 120, h: 50, color: '#f0883e',
            hint: '启动探针（Startup Probe）和就绪探针（Readiness Probe）检查容器状态' }
        ];

        const correctOrder = steps.map(s => s.id);

        // 容器运行时框
        engine.drawRect(230, 60, 370, 240, {
          fillColor: '#0d1117', borderColor: '#3fb950', radius: 12
        });
        engine.drawText('容器运行时 (CRI)', 415, 80, {
          color: '#3fb950', fontSize: 12, fontWeight: '600', align: 'center'
        });

        steps.forEach(step => {
          engine.drawNode(step.x, step.y, step.w, step.h, step.label, {
            id: step.id, borderColor: step.color, bgColor: step.color + '11',
            interactive: true, data: step
          });
        });

        engine.drawText('🐳 容器启动全流程', engine.width / 2, 30, {
          color: '#e6edf3', fontSize: 15, fontWeight: '600', align: 'center', baseline: 'middle'
        });

        interactions.enableSequence(correctOrder, {
          onCorrectStep(id, idx) {
            const step = steps[idx];
            engine.drawNode(step.x, step.y, step.w, step.h, step.label, {
              borderColor: step.color, bgColor: step.color + '33',
              id: step.id, interactive: true, data: step
            });
            animations.addPulse(engine, step.x + step.w / 2, step.y + step.h / 2, step.color);
            app.showFeedback('success', '✅ ' + step.hint, 2000);
          },
          onWrongStep(id, expectedIdx) {
            app.showFeedback('error', '❌ 顺序不对！下一步：' + steps[expectedIdx].hint, 3000);
          },
          onComplete() {
            setTimeout(() => app.onChallengeComplete('pod-lifecycle', 4, false), 1000);
          }
        });
      }
    }
  ]
};
```

- [ ] **Step 2: 在浏览器中验证**

解锁模块二后测试 5 个挑战：
- 挑战 1：序列型 — 按 kubectl → YAML → POST → API Server 顺序
- 挑战 2：选择题 — 选择 Token 认证 + RBAC 鉴权
- 挑战 3：序列型 — 验证 → 准入控制 → 编码 → 写 etcd → 确认
- 挑战 4：决策型 — 点击资源最充足的 Node-1
- 挑战 5：序列型 — Watch → 校验 → 拉镜像 → 挂载 → 创建 → 健康检查

- [ ] **Step 3: 提交**

```bash
git add js/modules/pod-lifecycle.js
git commit -m "feat: add module 2 - pod lifecycle with 5 challenges"
```

---

## Phase 4: 模块三 — 网络架构

### Task 10: 模块三 — 网络架构（5 挑战）

**Files:**
- Create: `js/modules/network.js`

- [ ] **Step 1: 创建 network.js**

```javascript
/**
 * 模块三：网络架构
 * 5 个挑战：同节点通信、跨节点通信、Service 发现、Ingress 路由、网络策略
 */
window.K8sModules = window.K8sModules || {};

window.K8sModules['network'] = {
  id: 'network',
  description: '可视化数据包在 Pod 间、节点间、Service 间的完整路径，理解 K8s 网络模型。',

  challenges: [
    /* ===== 挑战 1：同节点通信（动画型） ===== */
    {
      title: '同节点通信',
      type: 'animation',
      description: '观察数据包从 Pod-A 发送到同节点 Pod-B 的完整路径，理解 veth pair 和网桥的作用。',
      render(engine, animations, interactions, app) {
        engine.clear();

        // Pod-A
        engine.drawNode(60, 60, 140, 50, 'Pod-A\n10.244.1.5', {
          borderColor: '#3fb950', bgColor: '#3fb95011', id: 'pod-a'
        });

        // veth pair A
        engine.drawRect(230, 65, 100, 40, {
          fillColor: '#58a6ff11', borderColor: '#58a6ff', radius: 6, id: 'veth-a'
        });
        engine.drawText('veth-A', 280, 85, {
          color: '#58a6ff', fontSize: 11, align: 'center', baseline: 'middle'
        });

        // 网桥
        engine.drawRect(360, 45, 140, 80, {
          fillColor: '#d2992211', borderColor: '#d29922', radius: 8, id: 'bridge'
        });
        engine.drawText('🌉 cbr0 网桥', 430, 70, {
          color: '#d29922', fontSize: 12, fontWeight: '600', align: 'center'
        });
        engine.drawText('MAC 学习\nARP 解析', 430, 95, {
          color: '#8b949e', fontSize: 10, align: 'center'
        });

        // veth pair B
        engine.drawRect(530, 65, 100, 40, {
          fillColor: '#58a6ff11', borderColor: '#58a6ff', radius: 6, id: 'veth-b'
        });
        engine.drawText('veth-B', 580, 85, {
          color: '#58a6ff', fontSize: 11, align: 'center', baseline: 'middle'
        });

        // Pod-B
        engine.drawNode(660, 60, 140, 50, 'Pod-B\n10.244.1.8', {
          borderColor: '#3fb950', bgColor: '#3fb95011', id: 'pod-b'
        });

        // 连接线
        engine.drawArrow(200, 85, 230, 85, { color: '#58a6ff' });
        engine.drawArrow(330, 85, 360, 85, { color: '#58a6ff' });
        engine.drawArrow(500, 85, 530, 85, { color: '#58a6ff' });
        engine.drawArrow(630, 85, 660, 85, { color: '#58a6ff' });

        engine.drawText('📍 同节点 Pod 间通信路径', engine.width / 2, 20, {
          color: '#e6edf3', fontSize: 15, fontWeight: '600', align: 'center', baseline: 'middle'
        });

        // 说明文字
        engine.drawRect(80, 180, 700, 80, {
          fillColor: '#161b22', borderColor: '#30363d', radius: 8
        });
        engine.drawText('💡 通信原理：', 100, 195, {
          color: '#58a6ff', fontSize: 12, fontWeight: '600'
        });
        engine.drawText('1. Pod-A 通过 eth0 发送数据包（目的 IP: 10.244.1.8）', 100, 215, {
          color: '#8b949e', fontSize: 11
        });
        engine.drawText('2. 数据包通过 veth-A 到达网桥 cbr0', 100, 232, {
          color: '#8b949e', fontSize: 11
        });
        engine.drawText('3. 网桥查找 MAC 地址表，发现 veth-B 连接目标 Pod，通过 ARP 解析得到', 100, 249, {
          color: '#8b949e', fontSize: 11
        });

        // 开始动画按钮
        const btn = document.createElement('div');
        btn.style.cssText = 'position:absolute;bottom:60px;left:50%;transform:translateX(-50%);background:#238636;color:#fff;padding:8px 16px;border-radius:6px;font-size:13px;cursor:pointer;font-weight:600;';
        btn.textContent = '▶ 播放数据包动画';
        document.getElementById('canvas-container').appendChild(btn);

        btn.addEventListener('click', () => {
          btn.style.display = 'none';
          const points = [
            { x: 130, y: 85 }, { x: 200, y: 85 }, { x: 230, y: 85 },
            { x: 330, y: 85 }, { x: 360, y: 85 },
            { x: 500, y: 85 }, { x: 530, y: 85 },
            { x: 630, y: 85 }, { x: 660, y: 85 }
          ];

          animations.flowAlongPath(engine, points, '#3fb950', {
            speed: 0.003,
            dotSize: 6,
            onReachPoint(idx) {
              const labels = [
                'Pod-A 发送数据', '进入 veth-A', '到达网桥 cbr0',
                'MAC/ARP 查找', '网桥转发', '进入 veth-B', '到达 Pod-B'
              ];
              if (labels[idx]) {
                app.showFeedback('info', '📍 ' + labels[idx], 1500);
              }
            }
          });

          setTimeout(() => app.onChallengeComplete('network', 0, false), 8000);
        });
      }
    },

    /* ===== 挑战 2：跨节点通信（动画型） ===== */
    {
      title: '跨节点通信',
      type: 'animation',
      description: '数据包从 Node-1 的 Pod 发送到 Node-2 的 Pod，需要经过 VXLAN 隧道。',
      render(engine, animations, interactions, app) {
        engine.clear();

        // Node-1
        engine.drawRect(30, 30, 340, 200, {
          fillColor: '#0d1117', borderColor: '#3fb950', radius: 10, id: 'node1'
        });
        engine.drawText('Node-1 (10.244.1.0/24)', 200, 50, {
          color: '#3fb950', fontSize: 12, fontWeight: '600', align: 'center'
        });
        engine.drawNode(80, 100, 120, 40, 'Pod-A\n10.244.1.5', {
          borderColor: '#3fb950', bgColor: '#3fb95011', id: 'pod-a'
        });
        engine.drawRect(240, 95, 100, 50, {
          fillColor: '#d2992211', borderColor: '#d29922', radius: 6, id: 'cbr1'
        });
        engine.drawText('cbr0', 290, 120, {
          color: '#d29922', fontSize: 11, align: 'center', baseline: 'middle'
        });

        // Node-2
        engine.drawRect(430, 30, 340, 200, {
          fillColor: '#0d1117', borderColor: '#58a6ff', radius: 10, id: 'node2'
        });
        engine.drawText('Node-2 (10.244.2.0/24)', 600, 50, {
          color: '#58a6ff', fontSize: 12, fontWeight: '600', align: 'center'
        });
        engine.drawNode(480, 100, 120, 40, 'Pod-B\n10.244.2.8', {
          borderColor: '#58a6ff', bgColor: '#58a6ff11', id: 'pod-b'
        });
        engine.drawRect(640, 95, 100, 50, {
          fillColor: '#d2992211', borderColor: '#d29922', radius: 6, id: 'cbr2'
        });
        engine.drawText('cbr0', 690, 120, {
          color: '#d29922', fontSize: 11, align: 'center', baseline: 'middle'
        });

        // VXLAN tunnel
        engine.drawRect(30, 280, 740, 100, {
          fillColor: '#f0883e11', borderColor: '#f0883e', radius: 8
        });
        engine.drawText('🌐 VXLAN 隧道 (UDP port 4789)', 400, 295, {
          color: '#f0883e', fontSize: 13, fontWeight: '600', align: 'center'
        });
        engine.drawText('跨节点流量封装在 UDP 数据包中，通过底层网络传输', 400, 315, {
          color: '#8b949e', fontSize: 11, align: 'center'
        });

        // 内部流量标签
        engine.drawText('Pod-A → Pod-B\n(10.244.1.5 → 10.244.2.8)', 400, 350, {
          color: '#3fb950', fontSize: 11, align: 'center'
        });

        // 说明
        engine.drawRect(30, 400, 740, 70, {
          fillColor: '#161b22', borderColor: '#30363d', radius: 8
        });
        engine.drawText('💡 VXLAN 原理：每个节点有一个 VTEP（VXLAN Tunnel End Point），负责封装/解封装。', 50, 415, {
          color: '#8b949e', fontSize: 11
        });
        engine.drawText('flannel 或 Calico CNI 插件负责维护 VNI（VXLAN Network Identifier）和 MAC 地址映射表。', 50, 435, {
          color: '#8b949e', fontSize: 11
        });

        engine.drawText('🌏 跨节点 Pod 通信', engine.width / 2, 15, {
          color: '#e6edf3', fontSize: 15, fontWeight: '600', align: 'center', baseline: 'middle'
        });

        const btn = document.createElement('div');
        btn.style.cssText = 'position:absolute;bottom:40px;left:50%;transform:translateX(-50%);background:#238636;color:#fff;padding:8px 16px;border-radius:6px;font-size:13px;cursor:pointer;font-weight:600;';
        btn.textContent = '▶ 播放 VXLAN 隧道动画';
        document.getElementById('canvas-container').appendChild(btn);

        btn.addEventListener('click', () => {
          btn.style.display = 'none';
          const flowPoints = [
            // 节点内：从 Pod-A 到网桥
            { x: 140, y: 120 }, { x: 240, y: 120 },
            // 封装：进入 VXLAN
            { x: 290, y: 120 }, { x: 290, y: 200 },
            { x: 400, y: 200 }, { x: 510, y: 200 },
            // 解封装
            { x: 640, y: 200 }, { x: 640, y: 120 },
            // 节点内：网桥到 Pod-B
            { x: 690, y: 120 }, { x: 750, y: 120 }
          ];

          animations.flowAlongPath(engine, flowPoints, '#f0883e', {
            speed: 0.0015,
            dotSize: 7,
            onReachPoint(idx) {
              const msgs = [
                'Pod-A 发送数据（目的 IP: 10.244.2.8）',
                '数据到达 cbr0 网桥',
                'VTEP-1 封装：原始 IP 包 + VXLAN 头 + UDP + IP 外层',
                '封装后数据包通过底层网络发送到 Node-2',
                '传输中...',
                'VTEP-2 收到数据包，解封装',
                '转发到 Node-2 的 cbr0 网桥',
                '网桥查找 MAC 表，转发给 veth-B',
                'Pod-B 收到数据'
              ];
              if (msgs[idx]) app.showFeedback('info', '📍 ' + msgs[idx], 1800);
            }
          });

          setTimeout(() => app.onChallengeComplete('network', 1, false), 15000);
        });
      }
    },

    /* ===== 挑战 3：Service 发现（序列型） ===== */
    {
      title: 'Service 发现',
      type: 'sequence',
      description: '从 DNS 查询到 iptables 规则的完整链路，理解 ClusterIP Service 如何将流量转发到后端 Pod。',
      render(engine, animations, interactions, app) {
        engine.clear();

        const steps = [
          { id: 'dns-lookup', label: 'DNS 查询', x: 60, y: 80, w: 130, h: 50, color: '#58a6ff',
            hint: 'Client Pod 通过 clusterIP:80 访问 Service，CoreDNS 解析 serviceName.namespace.svc.cluster.local' },
          { id: 'clusterip', label: 'ClusterIP 路由', x: 250, y: 80, w: 130, h: 50, color: '#d2a8ff',
            hint: 'Service 的虚拟 IP（ClusterIP）仅在集群内部路由，不对应真实网卡' },
          { id: 'iptables', label: 'iptables 规则', x: 440, y: 80, w: 130, h: 50, color: '#d29922',
            hint: 'kube-proxy 将 Service ClusterIP 转换为后端 Pod 的真实 IP（Endpoint）' },
          { id: 'endpoint', label: '转发到 Endpoint', x: 630, y: 80, w: 130, h: 50, color: '#3fb950',
            hint: 'iptables DNAT 规则将目标 IP 改为某个后端 Pod 的真实 IP' },
          { id: 'pod-receive', label: 'Pod 接收', x: 630, y: 200, w: 130, h: 50, color: '#f85149',
            hint: '数据包到达后端 Pod，Pod 收到请求并返回响应' }
        ];

        const correctOrder = ['dns-lookup', 'clusterip', 'iptables', 'endpoint', 'pod-receive'];

        // Service 框
        engine.drawRect(430, 50, 340, 230, {
          fillColor: '#0d1117', borderColor: '#d2a8ff', radius: 12
        });
        engine.drawText('ClusterIP Service', 600, 72, {
          color: '#d2a8ff', fontSize: 13, fontWeight: '600', align: 'center'
        });

        steps.forEach(step => {
          engine.drawNode(step.x, step.y, step.w, step.h, step.label, {
            id: step.id, borderColor: step.color, bgColor: step.color + '11',
            interactive: true, data: step
          });
        });

        engine.drawArrow(190, 105, 250, 105, { color: '#30363d', dashed: [3, 3] });
        engine.drawArrow(380, 105, 440, 105, { color: '#30363d', dashed: [3, 3] });
        engine.drawArrow(570, 105, 630, 105, { color: '#30363d', dashed: [3, 3] });
        engine.drawArrow(695, 130, 695, 200, { color: '#30363d', dashed: [3, 3] });

        engine.drawText('🔍 Service 发现与流量转发', engine.width / 2, 25, {
          color: '#e6edf3', fontSize: 15, fontWeight: '600', align: 'center', baseline: 'middle'
        });

        interactions.enableSequence(correctOrder, {
          onCorrectStep(id, idx) {
            const step = steps[idx];
            engine.drawNode(step.x, step.y, step.w, step.h, step.label, {
              borderColor: step.color, bgColor: step.color + '33',
              id: step.id, interactive: true, data: step
            });
            animations.addPulse(engine, step.x + step.w / 2, step.y + step.h / 2, step.color);
            app.showFeedback('success', '✅ ' + step.hint, 2500);
          },
          onWrongStep(id, expectedIdx) {
            app.showFeedback('error', '❌ 顺序不对！提示：' + steps[expectedIdx].hint, 3000);
          },
          onComplete() {
            setTimeout(() => app.onChallengeComplete('network', 2, false), 1000);
          }
        });
      }
    },

    /* ===== 挑战 4：Ingress 路由（配置型） ===== */
    {
      title: 'Ingress 路由',
      type: 'choice',
      description: '配置 Ingress 规则将外部流量正确路由到对应的后端 Service。',
      render(engine, animations, interactions, app) {
        engine.clear();

        engine.drawText('🌐 Ingress 路由配置', engine.width / 2, 25, {
          color: '#e6edf3', fontSize: 15, fontWeight: '600', align: 'center', baseline: 'middle'
        });

        engine.drawText('场景：根据 URL 路径将请求路由到正确的 Service', engine.width / 2, 55, {
          color: '#8b949e', fontSize: 12, align: 'center'
        });

        // 外部流量
        engine.drawNode(60, 100, 100, 40, '🌍 用户请求', {
          borderColor: '#8b949e', bgColor: '#8b949e11'
        });

        // Ingress
        engine.drawRect(220, 80, 160, 80, {
          fillColor: '#58a6ff11', borderColor: '#58a6ff', radius: 8
        });
        engine.drawText('Ingress Controller', 300, 105, {
          color: '#58a6ff', fontSize: 12, fontWeight: '600', align: 'center'
        });
        engine.drawText('nginx-ingress', 300, 125, {
          color: '#8b949e', fontSize: 10, align: 'center'
        });

        // 路由规则说明
        engine.drawText('路由规则：', 200, 185, {
          color: '#e6edf3', fontSize: 12, fontWeight: '600'
        });

        const rules = [
          { path: '/api', service: 'api-service:8080', color: '#3fb950' },
          { path: '/web', service: 'web-service:80', color: '#d29922' },
          { path: '/admin', service: 'admin-service:8080', color: '#f85149' }
        ];

        rules.forEach((r, i) => {
          engine.drawText(r.path + ' → ' + r.service, 220, 210 + i * 25, {
            color: r.color, fontSize: 12
          });
        });

        // 后端 Services
        const services = [
          { label: 'api-service:8080', x: 460, y: 80, w: 150, h: 40, color: '#3fb950' },
          { label: 'web-service:80', x: 460, y: 150, w: 150, h: 40, color: '#d29922' },
          { label: 'admin-service:8080', x: 460, y: 220, w: 150, h: 40, color: '#f85149' }
        ];

        services.forEach(s => {
          engine.drawNode(s.x, s.y, s.w, s.h, s.label, {
            borderColor: s.color, bgColor: s.color + '11'
          });
          engine.drawArrow(380, 105 + services.indexOf(s) * 70, 460, s.y + 20, {
            color: s.color, dashed: [3, 3]
          });
        });

        engine.drawArrow(160, 120, 220, 115, { color: '#58a6ff' });

        // 模拟用户访问路径选择
        interactions.enableChoice(
          [
            { id: 'path1', label: '访问 /api/users', desc: '应路由到 api-service:8080' },
            { id: 'path2', label: '访问 /web/home', desc: '应路由到 web-service:80' },
            { id: 'path3', label: '访问 /admin/dashboard', desc: '应路由到 admin-service:8080' }
          ],
          'path2',
          (correct) => {
            if (correct) {
              app.showFeedback('success', '✅ 正确！nginx-ingress 根据 path 匹配规则将 /web/* 请求转发到 web-service:80。', 3000);
              setTimeout(() => app.onChallengeComplete('network', 3, false), 1500);
            } else {
              app.showFeedback('error', '❌ 路由错误！检查 Ingress 规则中的 path 匹配方式。', 3000);
            }
          }
        );
      }
    },

    /* ===== 挑战 5：网络策略（配置型） ===== */
    {
      title: '网络策略',
      type: 'choice',
      description: '设置 NetworkPolicy 限制 Pod 间通信：只允许 frontend 访问 backend，不允许 internet 直接访问。',
      render(engine, animations, interactions, app) {
        engine.clear();

        engine.drawText('🔒 网络策略配置', engine.width / 2, 25, {
          color: '#e6edf3', fontSize: 15, fontWeight: '600', align: 'center', baseline: 'middle'
        });

        // Pod 布局
        const pods = [
          { id: 'internet', label: '🌐 Internet', x: 60, y: 80, w: 120, h: 40, color: '#8b949e', allowed: false },
          { id: 'frontend', label: 'Frontend', x: 240, y: 80, w: 120, h: 40, color: '#58a6ff', allowed: false },
          { id: 'backend', label: 'Backend', x: 420, y: 80, w: 120, h: 40, color: '#3fb950', allowed: true },
          { id: 'database', label: 'Database', x: 600, y: 80, w: 120, h: 40, color: '#f85149', allowed: true }
        ];

        pods.forEach(p => {
          engine.drawNode(p.x, p.y, p.w, p.h, p.label, {
            id: p.id, borderColor: p.color, bgColor: p.color + '11',
            interactive: true, data: p
          });
        });

        // 连接线（虚线表示需要被阻止）
        engine.drawArrow(180, 100, 240, 100, { color: '#f85149', dashed: [3, 3] });
        engine.drawArrow(360, 100, 420, 100, { color: '#3fb950' });
        engine.drawArrow(540, 100, 600, 100, { color: '#f85149', dashed: [3, 3] });

        // 策略说明框
        engine.drawRect(60, 180, 700, 100, {
          fillColor: '#161b22', borderColor: '#30363d', radius: 8
        });
        engine.drawText('🎯 安全策略要求：', 80, 195, {
          color: '#f85149', fontSize: 12, fontWeight: '600'
        });
        engine.drawText('1. 只允许 Frontend Pod 访问 Backend Pod（禁止 Internet 直接访问 Backend）', 80, 215, {
          color: '#8b949e', fontSize: 11
        });
        engine.drawText('2. 只允许 Backend Pod 访问 Database（禁止 Frontend 直接访问 Database）', 80, 235, {
          color: '#8b949e', fontSize: 11
        });
        engine.drawText('3. Internet 只能访问 Frontend', 80, 255, {
          color: '#8b949e', fontSize: 11
        });

        // 策略选择
        interactions.enableChoice(
          [
            { id: 'policy1', label: 'Allow Frontend → Backend，Block Internet → Backend',
              desc: '基础隔离：阻止 Internet 直连后端' },
            { id: 'policy2', label: 'Allow Frontend → Backend，Allow Internet → Frontend',
              desc: '推荐配置：Internet→Frontend→Backend 分层访问' },
            { id: 'policy3', label: 'Allow All',
              desc: '无限制：所有 Pod 可互相访问' }
          ],
          'policy2',
          (correct) => {
            if (correct) {
              app.showFeedback('success',
                '✅ 正确！正确的网络策略是：允许 Frontend → Backend，禁止 Internet → Backend，允许 Frontend → Database（可选）。' +
                '使用 label selector 和 podSelector 来定义策略规则。',
                4000);
              setTimeout(() => app.onChallengeComplete('network', 4, false), 2000);
            } else {
              app.showFeedback('error',
                '❌ 策略不完整！需要同时考虑：1) 允许 Frontend 访问 Backend，2) 阻止 Internet 直连 Backend。',
                4000);
            }
          }
        );
      }
    }
  ]
};
```

- [ ] **Step 2: 在浏览器中验证**

解锁模块三后测试：
- 挑战 1-2：点击按钮播放数据包动画（VXLAN 隧道），动画播放完自动完成
- 挑战 3：序列型 — DNS → ClusterIP → iptables → Endpoint → Pod
- 挑战 4：配置型 — 选择正确的 Ingress 路由规则
- 挑战 5：配置型 — 选择正确的网络策略

- [ ] **Step 3: 提交**

```bash
git add js/modules/network.js
git commit -m "feat: add module 3 - network architecture with 5 challenges"
```

---

## Phase 5: 模块四 — 存储架构

### Task 11: 模块四 — 存储架构（4 挑战）

**Files:**
- Create: `js/modules/storage-k8s.js`

- [ ] **Step 1: 创建 storage-k8s.js**

```javascript
/**
 * 模块四：存储架构
 * 4 个挑战：存储类型、动态供应、绑定挂载、数据生命周期
 */
window.K8sModules['storage'] = {
  id: 'storage',
  description: '理解 PVC 如何找到它的 PV，CSI 如何工作，以及不同存储类型的特点。',

  challenges: [
    /* ===== 挑战 1：存储类型（选择分类型） ===== */
    {
      title: '存储类型',
      type: 'choice',
      description: '区分 K8s 中的三种存储类型：emptyDir、hostPath、PersistentVolumeClaim。选择正确的使用场景。',
      render(engine, animations, interactions, app) {
        engine.clear();

        engine.drawText('💾 Kubernetes 存储类型', engine.width / 2, 25, {
          color: '#e6edf3', fontSize: 15, fontWeight: '600', align: 'center', baseline: 'middle'
        });

        // 三种存储类型卡片
        const types = [
          { id: 'emptydir', label: 'emptyDir', color: '#58a6ff',
            desc: '临时存储，随 Pod 删除而删除。用于临时缓存、合并排序等。',
            useCase: '临时工作目录' },
          { id: 'hostpath', label: 'hostPath', color: '#d29922',
            desc: '挂载节点本地文件系统。用于节点级别日志、节点 GPU 驱动等。',
            useCase: '节点级别持久化' },
          { id: 'pvc', label: 'PersistentVolumeClaim', color: '#3fb950',
            desc: '动态申请的持久化存储，由 PV 提供，不依赖特定节点。',
            useCase: '有状态应用的数据持久化' }
        ];

        types.forEach((t, i) => {
          const x = 80 + i * 260;
          engine.drawRect(x, 60, 220, 140, {
            fillColor: t.color + '08', borderColor: t.color, radius: 10
          });
          engine.drawText(t.label, x + 110, 80, {
            color: t.color, fontSize: 13, fontWeight: '600', align: 'center'
          });
          engine.drawText(t.desc, x + 110, 110, {
            color: '#8b949e', fontSize: 10, align: 'center'
          });
          engine.drawText('场景：' + t.useCase, x + 110, 175, {
            color: '#e6edf3', fontSize: 11, align: 'center'
          });
        });

        engine.drawText('❓ 场景题：一个 MySQL 数据库需要持久化存储数据，应该使用哪种存储类型？',
          engine.width / 2, 240, { color: '#e6edf3', fontSize: 13, align: 'center' });

        interactions.enableChoice(
          [
            { id: 'ans-empty', label: 'emptyDir', desc: 'Pod 删除后数据丢失，不适合数据库' },
            { id: 'ans-host', label: 'hostPath', desc: '挂载单个节点，Pod 调度到其他节点会丢失数据' },
            { id: 'ans-pvc', label: 'PVC（推荐）', desc: '动态 PV，不依赖特定节点，适合有状态应用' }
          ],
          'ans-pvc',
          (correct) => {
            if (correct) {
              app.showFeedback('success',
                '✅ 正确！MySQL 是有状态应用，需要持久化存储。PVC 从 PersistentVolume 动态申请空间，' +
                '不依赖特定节点，Pod 调度到任意节点都能访问同一个 PV。',
                4000);
              setTimeout(() => app.onChallengeComplete('storage', 0, false), 1500);
            } else {
              app.showFeedback('error', '❌ 数据库需要持久化存储。emptyDir 会随 Pod 删除丢失，hostPath 依赖单节点。', 3000);
            }
          }
        );
      }
    },

    /* ===== 挑战 2：动态供应（配置型） ===== */
    {
      title: '动态供应',
      type: 'choice',
      description: '配置 StorageClass 来动态创建 PV。选择正确的 StorageClass 配置。',
      render(engine, animations, interactions, app) {
        engine.clear();

        engine.drawText('📦 StorageClass 动态供应', engine.width / 2, 25, {
          color: '#e6edf3', fontSize: 15, fontWeight: '600', align: 'center', baseline: 'middle'
        });

        // PVC 申请
        engine.drawRect(80, 60, 300, 80, {
          fillColor: '#d2a8ff11', borderColor: '#d2a8ff', radius: 8
        });
        engine.drawText('PVC 申请', 230, 78, {
          color: '#d2a8ff', fontSize: 12, fontWeight: '600', align: 'center'
        });
        engine.drawText('storageClassName: "fast-storage"\nrequest: 10Gi | accessMode: ReadWriteOnce', 230, 102, {
          color: '#8b949e', fontSize: 10, align: 'center'
        });

        // StorageClass 选项
        engine.drawText('选择正确的 StorageClass 配置：', 80, 170, {
          color: '#e6edf3', fontSize: 12
        });

        interactions.enableChoice(
          [
            { id: 'sc1', label: 'provisioner: kubernetes.io/gce-pd\nparameters.type: pd-ssd\nreclaimPolicy: Delete',
              desc: '云盘 SSD + 动态供应（推荐）' },
            { id: 'sc2', label: 'provisioner: kubernetes.io/no-provisioner\nvolumeBindingMode: WaitForFirstConsumer',
              desc: '静态供应，需手动创建 PV' },
            { id: 'sc3', label: 'provisioner: kubernetes.io/aws-ebs\nparameters.type: gp2\nreclaimPolicy: Retain',
              desc: '通用 SSD + 保留策略（手动清理）' }
          ],
          'sc1',
          (correct) => {
            if (correct) {
              app.showFeedback('success',
                '✅ 正确！kubernetes.io/gce-pd 是 GCE/GKE 的存储供应器，pd-ssd 提供高性能 SSD 云盘。' +
                '动态供应意味着 PVC 创建时自动创建 PV，无需手动预配。',
                4000);
              setTimeout(() => app.onChallengeComplete('storage', 1, false), 1500);
            } else {
              app.showFeedback('error',
                '❌ 配置不对。注意：no-provisioner 是静态供应（手动创建 PV）；gp2 是通用 SSD 但 Retain 策略需要手动清理。',
                4000);
            }
          }
        );
      }
    },

    /* ===== 挑战 3：绑定挂载（拖拽型） ===== */
    {
      title: '绑定挂载',
      type: 'drag',
      description: '将 PVC 拖拽到 Pod 上，PVC 会自动绑定到匹配的 PV 并挂载到容器。',
      render(engine, animations, interactions, app) {
        engine.clear();

        engine.drawText('🔗 PVC 绑定与挂载', engine.width / 2, 25, {
          color: '#e6edf3', fontSize: 15, fontWeight: '600', align: 'center', baseline: 'middle'
        });

        // PV 池
        engine.drawRect(40, 60, 200, 200, {
          fillColor: '#0d1117', borderColor: '#484f58', radius: 10
        });
        engine.drawText('PV 池', 140, 78, {
          color: '#8b949e', fontSize: 12, fontWeight: '600', align: 'center'
        });

        const pvs = [
          { id: 'pv1', label: 'PV-5Gi-RWO', x: 70, y: 110, w: 140, h: 35, color: '#3fb950',
            size: '5Gi', access: 'RWO', status: '未绑定' },
          { id: 'pv2', label: 'PV-10Gi-RWX', x: 70, y: 160, w: 140, h: 35, color: '#f85149',
            size: '10Gi', access: 'RWX', status: '已绑定' },
          { id: 'pv3', label: 'PV-20Gi-RWO', x: 70, y: 210, w: 140, h: 35, color: '#d29922',
            size: '20Gi', access: 'RWO', status: '未绑定' }
        ];

        pvs.forEach(pv => {
          engine.drawRect(pv.x, pv.y, pv.w, pv.h, {
            fillColor: pv.color + '11', borderColor: pv.color, radius: 6,
            id: pv.id, interactive: true, data: pv
          });
          engine.drawText(pv.label, pv.x + pv.w / 2, pv.y + 12, {
            color: pv.color, fontSize: 10, fontWeight: '600', align: 'center'
          });
          engine.drawText(pv.size + ' | ' + pv.access + ' | ' + pv.status, pv.x + pv.w / 2, pv.y + 26, {
            color: '#8b949e', fontSize: 9, align: 'center'
          });
        });

        // 箭头
        engine.drawArrow(240, 150, 300, 150, { color: '#30363d', dashed: [3, 3] });

        // Pod
        engine.drawRect(320, 80, 200, 160, {
          fillColor: '#0d1117', borderColor: '#58a6ff', radius: 10
        });
        engine.drawText('Pod (mysql)', 420, 98, {
          color: '#58a6ff', fontSize: 12, fontWeight: '600', align: 'center'
        });

        // PVC 目标
        const pvcTarget = {
          id: 'pvc-slot', x: 350, y: 130, w: 140, h: 50,
          label: 'PVC (5Gi, RWO)', accepts: 'pvc',
          x: 350, y: 130, w: 140, h: 50
        };

        engine.drawRect(pvcTarget.x, pvcTarget.y, pvcTarget.w, pvcTarget.h, {
          fillColor: '#d2a8ff11', borderColor: '#d2a8ff', radius: 6,
          id: pvcTarget.id, interactive: true, data: pvcTarget
        });
        engine.drawText('拖入 PVC\n(请求 5Gi, RWO)', pvcTarget.x + pvcTarget.w / 2, pvcTarget.y + pvcTarget.h / 2, {
          color: '#d2a8ff', fontSize: 11, align: 'center', baseline: 'middle'
        });

        // 挂载点
        engine.drawText('挂载到容器', 420, 200, {
          color: '#8b949e', fontSize: 10, align: 'center'
        });

        // 可拖拽 PVC
        const pvc = { id: 'pvc', label: 'PVC (5Gi, RWO)', x: 560, y: 130, w: 150, h: 50, color: '#d2a8ff' };
        engine.drawNode(pvc.x, pvc.y, pvc.w, pvc.h, pvc.label, {
          id: pvc.id, borderColor: pvc.color, bgColor: pvc.color + '11',
          interactive: true, data: pvc
        });

        // 提示
        engine.drawRect(40, 300, 700, 60, {
          fillColor: '#161b22', borderColor: '#30363d', radius: 8
        });
        engine.drawText('💡 提示：PVC 会根据容量和访问模式自动匹配 PV（大小 >= 请求，且 accessMode 兼容）。', 50, 315, {
          color: '#8b949e', fontSize: 11
        });
        engine.drawText('PVC (5Gi, RWO) 会绑定到 PV-5Gi-RWO（5Gi >= 5Gi 且 RWO ⊆ RWO）。', 50, 335, {
          color: '#8b949e', fontSize: 11
        });

        interactions.enableDrag([pvc], [pvcTarget], {
          onDrop(sourceId, targetId, correct) {
            if (correct) {
              animations.emitParticles(engine, pvcTarget.x + pvcTarget.w / 2, pvcTarget.y + pvcTarget.h / 2, '#d2a8ff', 20);
              app.showFeedback('success',
                '✅ PVC 成功绑定到 PV-5Gi-RWO！StorageClass 动态创建了 PV，PVC 和 PV 绑定后挂载到容器。',
                4000);
              setTimeout(() => app.onChallengeComplete('storage', 2, false), 2000);
            } else {
              app.showFeedback('error', '❌ 绑定失败！PVC 的访问模式（ReadWriteOnce）和容量需求决定了它只能绑定到兼容的 PV。', 3000);
            }
          }
        });
      }
    },

    /* ===== 挑战 4：数据生命周期（决策型） ===== */
    {
      title: '数据生命周期',
      type: 'decision',
      description: '模拟 Pod 删除后数据的三种不同命运，根据回收策略（Retain/Delete/Recycle）做出决策。',
      render(engine, animations, interactions, app) {
        engine.clear();

        engine.drawText('🔄 数据生命周期与回收策略', engine.width / 2, 25, {
          color: '#e6edf3', fontSize: 15, fontWeight: '600', align: 'center', baseline: 'middle'
        });

        // Pod 删除前
        engine.drawRect(40, 60, 220, 120, {
          fillColor: '#0d1117', borderColor: '#58a6ff', radius: 10
        });
        engine.drawText('Pod 运行时', 150, 78, {
          color: '#58a6ff', fontSize: 12, fontWeight: '600', align: 'center'
        });
        engine.drawText('MySQL Pod 正在使用 PV\n数据目录：/var/lib/mysql\n数据已写入 100MB', 150, 108, {
          color: '#8b949e', fontSize: 10, align: 'center'
        });

        // 删除箭头
        engine.drawText('Pod 被删除 ↓', 150, 195, {
          color: '#f85149', fontSize: 12, align: 'center'
        });
        engine.drawLine(150, 180, 150, 200, { color: '#f85149', width: 2 });

        // 三种回收策略
        const policies = [
          { id: 'retain', label: 'Retain', color: '#d29922',
            desc: '保留数据，PV 变为 Released 状态\n需要手动删除 PV 和数据',
            outcome: '数据保留，可恢复' },
          { id: 'delete', label: 'Delete', color: '#f85149',
            desc: '删除 PV，云盘等存储资源也被删除\n数据无法恢复',
            outcome: '数据永久丢失' },
          { id: 'recycle', label: 'Recycle', color: '#3fb950',
            desc: '删除数据但保留 PV，PV 变为 Available\n可被新 PVC 重新绑定',
            outcome: '数据清除，PV 可复用' }
        ];

        policies.forEach((p, i) => {
          const x = 60 + i * 240;
          engine.drawRect(x, 230, 200, 120, {
            fillColor: p.color + '08', borderColor: p.color, radius: 10,
            id: p.id, interactive: true, data: p
          });
          engine.drawText(p.label, x + 100, 250, {
            color: p.color, fontSize: 14, fontWeight: '600', align: 'center'
          });
          engine.drawText(p.desc, x + 100, 280, {
            color: '#8b949e', fontSize: 10, align: 'center'
          });
          engine.drawText('结果：' + p.outcome, x + 100, 330, {
            color: p.color, fontSize: 10, fontWeight: '600', align: 'center'
          });
        });

        engine.drawText('❓ 如果 PVC 的回收策略是 Delete，删除 Pod 后数据会怎样？', 400, 380, {
          color: '#e6edf3', fontSize: 12, align: 'center'
        });

        const policyIds = policies.map(p => p.id);
        interactions.onClick(policyIds, (id, data) => {
          if (id === 'delete') {
            animations.emitParticles(engine, 160, 290, '#f85149', 15);
            app.showFeedback('success',
              '✅ 正确！Delete 策略会删除 PV 和底层存储资源（如云盘），数据永久丢失，无法恢复。' +
              '生产环境重要数据应使用 Retain 策略或开启快照备份。',
              4000);
            setTimeout(() => app.onChallengeComplete('storage', 3, false), 1500);
          } else if (id === 'retain') {
            app.showFeedback('error', '❌ Retain 策略会保留数据，不是 Delete。', 3000);
          } else {
            app.showFeedback('error', '❌ Recycle 会删除数据但保留 PV，也不是 Delete。', 3000);
          }
        });
      }
    }
  ]
};
```

- [ ] **Step 2: 在浏览器中验证**

- [ ] **Step 3: 提交**

```bash
git add js/modules/storage-k8s.js
git commit -m "feat: add module 4 - storage architecture with 4 challenges"
```

---

## Phase 6: 模块五 — 安全与可观测性

### Task 12: 模块五 — 安全与可观测性（4 挑战）

**Files:**
- Create: `js/modules/security.js`

- [ ] **Step 1: 创建 security.js**

```javascript
/**
 * 模块五：安全与可观测性
 * 4 个挑战：认证链路、RBAC 权限、安全上下文、可观测性三支柱
 */
window.K8sModules['security'] = {
  id: 'security',
  description: '理解 API 请求的安全链路（认证→鉴权→准入控制），掌握 RBAC、安全上下文配置，以及可观测性三支柱。',

  challenges: [
    /* ===== 挑战 1：认证链路（决策型） ===== */
    {
      title: '认证链路',
      type: 'decision',
      description: '一个 ServiceAccount 需要访问 API Server 获取 Pod 列表，选择正确的认证方式。',
      render(engine, animations, interactions, app) {
        engine.clear();

        engine.drawText('🔐 API 请求安全链路', engine.width / 2, 25, {
          color: '#e6edf3', fontSize: 15, fontWeight: '600', align: 'center', baseline: 'middle'
        });

        // 认证链
        const steps = [
          { id: 'sa', label: 'ServiceAccount\n（自动挂载 Token）', x: 60, y: 70, w: 140, h: 60, color: '#58a6ff' },
          { id: 'auth', label: '认证 (Authentication)', x: 260, y: 70, w: 160, h: 60, color: '#d29922' },
          { id: 'authz', label: '鉴权 (Authorization)', x: 480, y: 70, w: 160, h: 60, color: '#f0883e' },
          { id: 'admission', label: '准入控制 (Admission)', x: 480, y: 180, w: 160, h: 60, color: '#d2a8ff' },
          { id: 'execute', label: '执行请求', x: 260, y: 180, w: 140, h: 60, color: '#3fb950' }
        ];

        steps.forEach(s => {
          engine.drawNode(s.x, s.y, s.w, s.h, s.label, {
            borderColor: s.color, bgColor: s.color + '11', id: s.id, data: s
          });
        });

        engine.drawArrow(200, 100, 260, 100, { color: '#30363d', dashed: [3, 3] });
        engine.drawArrow(420, 100, 480, 100, { color: '#30363d', dashed: [3, 3] });
        engine.drawArrow(560, 130, 560, 180, { color: '#30363d', dashed: [3, 3] });
        engine.drawArrow(480, 210, 400, 210, { color: '#30363d', dashed: [3, 3] });

        engine.drawRect(60, 290, 700, 80, {
          fillColor: '#161b22', borderColor: '#30363d', radius: 8
        });
        engine.drawText('❓ ServiceAccount 访问 API Server 时，使用什么凭证？', 80, 305, {
          color: '#e6edf3', fontSize: 12
        });
        engine.drawText('提示：K8s 自动为每个 ServiceAccount 挂载一个 JWT Token 到 /var/run/secrets/...', 80, 325, {
          color: '#8b949e', fontSize: 11
        });

        interactions.enableChoice(
          [
            { id: 'basic', label: '用户名+密码', desc: 'Basic Auth，不推荐用于 ServiceAccount' },
            { id: 'token', label: 'JWT Bearer Token（推荐）', desc: '自动挂载的 ServiceAccount Token' },
            { id: 'cert', label: '客户端 TLS 证书', desc: '需要手动配置，较少用' }
          ],
          'token',
          (correct) => {
            if (correct) {
              app.showFeedback('success',
                '✅ 正确！ServiceAccount 使用 JWT Bearer Token 认证。Token 包含 ServiceAccount 的身份信息（namespace、name、uid），' +
                'API Server 通过验证 Token 签名来确认身份。',
                4000);
              setTimeout(() => app.onChallengeComplete('security', 0, false), 1500);
            } else {
              app.showFeedback('error', '❌ ServiceAccount 使用的是自动挂载的 JWT Token，不是用户名密码或 TLS 证书。', 3000);
            }
          }
        );
      }
    },

    /* ===== 挑战 2：RBAC 权限（配置型） ===== */
    {
      title: 'RBAC 权限',
      type: 'choice',
      description: '为一个只读 ServiceAccount 配置最小权限：只能读取 default 命名空间的 Pod。',
      render(engine, animations, interactions, app) {
        engine.clear();

        engine.drawText('📋 RBAC 最小权限原则', engine.width / 2, 25, {
          color: '#e6edf3', fontSize: 15, fontWeight: '600', align: 'center', baseline: 'middle'
        });

        engine.drawText('场景：readonly-sa 需要读取 default 命名空间的 Pod，但不能写操作。', 80, 60, {
          color: '#8b949e', fontSize: 12
        });

        interactions.enableChoice(
          [
            {
              id: 'correct-rbac',
              label: 'Role + RoleBinding',
              desc: '✅ 正确！Role 定义"读取 Pod"，RoleBinding 将权限绑定到 readonly-sa'
            },
            {
              id: 'clusterwide',
              label: 'ClusterRoleBinding (cluster-wide)',
              desc: '❌ 错误！ClusterRoleBinding 会授予集群所有命名空间的权限，范围过大'
            },
            {
              id: 'clusterrole',
              label: '仅 ClusterRole（无 Binding）',
              desc: '❌ 错误！ClusterRole 只是定义权限规则，需要 RoleBinding 才能实际生效'
            }
          ],
          'correct-rbac',
          (correct) => {
            if (correct) {
              app.showFeedback('success',
                '✅ 正确！RBAC 的最小权限配置：\n' +
                '1. Role 定义权限：get/list/watch pods（只读）\n' +
                '2. RoleBinding 将 Role 绑定到特定 ServiceAccount（default 命名空间）\n' +
                '这样 readonly-sa 只能读取 default 命名空间的 Pod。',
                5000);
              setTimeout(() => app.onChallengeComplete('security', 1, false), 1500);
            } else {
              app.showFeedback('error',
                '❌ RBAC 配置有误！最小权限原则要求：只在需要的命名空间授予最小需要的权限。' +
                'ClusterRoleBinding 会跨所有命名空间，权限过大。',
                4000);
            }
          }
        );
      }
    },

    /* ===== 挑战 3：安全上下文（配置型） ===== */
    {
      title: '安全上下文',
      type: 'choice',
      description: '为 Pod 配置 SecurityContext，限制容器的特权级别和资源访问能力。',
      render(engine, animations, interactions, app) {
        engine.clear();

        engine.drawText('🔒 Pod 安全上下文配置', engine.width / 2, 25, {
          color: '#e6edf3', fontSize: 15, fontWeight: '600', align: 'center', baseline: 'middle'
        });

        engine.drawRect(40, 55, 720, 80, {
          fillColor: '#161b22', borderColor: '#30363d', radius: 8
        });
        engine.drawText('场景：一个 Web 应用不需要 root 权限，不应能修改系统时间。配置最安全的 SecurityContext：', 60, 70, {
          color: '#8b949e', fontSize: 11
        });
        engine.drawText('• 禁用特权运行（privileged: false）• 不以 root 用户运行（runAsNonRoot: true）• 只读根文件系统（readOnlyRootFilesystem: true）', 60, 95, {
          color: '#58a6ff', fontSize: 11
        });

        interactions.enableChoice(
          [
            {
              id: 'secure',
              label: 'securityContext:\n  privileged: false\n  runAsNonRoot: true\n  readOnlyRootFilesystem: true',
              desc: '✅ 最安全配置：非特权、非 root、只读文件系统'
            },
            {
              id: 'partial',
              label: 'securityContext:\n  privileged: false\n  readOnlyRootFilesystem: true',
              desc: '⚠️ 部分安全：禁用了特权和只读文件系统，但未设置 runAsNonRoot'
            },
            {
              id: 'insecure',
              label: 'securityContext:\n  privileged: true',
              desc: '❌ 不安全：特权容器可以访问宿主所有资源，等于没有隔离'
            }
          ],
          'secure',
          (correct) => {
            if (correct) {
              app.showFeedback('success',
                '✅ 最安全配置！privileged: false 防止容器获取宿主 root 权限；' +
                'runAsNonRoot: true 强制容器不能以 root 运行（K8s 会阻止 runAsUser=0 的镜像）；' +
                'readOnlyRootFilesystem: true 防止写入系统目录，减少攻击面。',
                5000);
              setTimeout(() => app.onChallengeComplete('security', 2, false), 1500);
            } else {
              app.showFeedback('error', '❌ 配置不够安全！Web 应用不需要 root 权限和特权模式。', 3000);
            }
          }
        );
      }
    },

    /* ===== 挑战 4：可观测性三支柱（序列型） ===== */
    {
      title: '可观测性三支柱',
      type: 'sequence',
      description: '按正确顺序点击三个可观测性组件，理解 Metrics、Logs、Traces 的协作关系。',
      render(engine, animations, interactions, app) {
        engine.clear();

        const pillars = [
          { id: 'metrics', label: '📊 Metrics\nPrometheus', x: 80, y: 80, w: 160, h: 70, color: '#58a6ff',
            hint: 'Prometheus 定期抓取指标（CPU、内存、请求率），提供时序数据和告警能力' },
          { id: 'logs', label: '📝 Logs\nEFK Stack', x: 310, y: 80, w: 160, h: 70, color: '#f0883e',
            hint: 'Fluentd 收集日志，存入 Elasticsearch，提供全文检索能力' },
          { id: 'traces', label: '🔍 Traces\nOpenTelemetry', x: 540, y: 80, w: 160, h: 70, color: '#d2a8ff',
            hint: '分布式链路追踪，跟踪一个请求在各微服务间的调用路径和延迟' }
        ];

        pillars.forEach(p => {
          engine.drawNode(p.x, p.y, p.w, p.h, p.label, {
            borderColor: p.color, bgColor: p.color + '11',
            id: p.id, interactive: true, data: p
          });
        });

        // 说明框
        engine.drawRect(40, 200, 720, 100, {
          fillColor: '#161b22', borderColor: '#30363d', radius: 8
        });
        engine.drawText('💡 可观测性三支柱互补：', 60, 215, { color: '#e6edf3', fontSize: 12, fontWeight: '600' });
        engine.drawText('• Metrics 告诉你"发生了什么"（数值型健康状态）', 60, 235, { color: '#8b949e', fontSize: 11 });
        engine.drawText('• Logs 告诉你"为什么发生"（事件详细描述）', 60, 253, { color: '#8b949e', fontSize: 11 });
        engine.drawText('• Traces 告诉你"在哪一步发生"（请求路径追踪）', 60, 271, { color: '#8b949e', fontSize: 11 });

        engine.drawText('🕵️ 可观测性三支柱', engine.width / 2, 25, {
          color: '#e6edf3', fontSize: 15, fontWeight: '600', align: 'center', baseline: 'middle'
        });

        // 三者关系
        engine.drawArrow(240, 115, 310, 115, { color: '#30363d', dashed: [3, 3] });
        engine.drawArrow(470, 115, 540, 115, { color: '#30363d', dashed: [3, 3] });
        engine.drawText('互补 →', 275, 105, { color: '#484f58', fontSize: 10 });
        engine.drawText('互补 →', 505, 105, { color: '#484f58', fontSize: 10 });

        // 实际顺序无关紧要，都是同时运行
        engine.drawText('（三个组件同时采集，无需特定顺序）', engine.width / 2, 175, {
          color: '#484f58', fontSize: 11, align: 'center'
        });

        // 这个挑战是探索型，展示三个支柱后直接点击完成
        pillars.forEach(p => {
          interactions.onClick([p.id], (id, data) => {
            app.showTooltip(data.label.split('\n')[0], data.hint, 200, 200);
            animations.addPulse(engine, p.x + p.w / 2, p.y + p.h / 2, p.color);
          });
        });

        // 点击"完成探索"按钮
        const btn = document.createElement('div');
        btn.style.cssText = 'position:absolute;bottom:50px;left:50%;transform:translateX(-50%);background:#238636;color:#fff;padding:8px 20px;border-radius:6px;font-size:13px;cursor:pointer;font-weight:600;';
        btn.textContent = '✅ 完成探索';
        document.getElementById('canvas-container').appendChild(btn);

        let exploredCount = 0;
        pillars.forEach(p => {
          interactions.onClick([p.id], () => {
            exploredCount++;
            if (exploredCount >= 3) {
              btn.style.background = '#238636';
              btn.style.opacity = '1';
            }
          });
        });

        btn.addEventListener('click', () => {
          app.showFeedback('success', '✅ 掌握可观测性三支柱！Metrics（Prometheus）+ Logs（EFK）+ Traces（OpenTelemetry）构成完整的监控体系。', 4000);
          setTimeout(() => app.onChallengeComplete('security', 3, false), 1500);
        });
      }
    }
  ]
};
```

- [ ] **Step 2: 在浏览器中验证**

- [ ] **Step 3: 提交**

```bash
git add js/modules/security.js
git commit -m "feat: add module 5 - security and observability with 4 challenges"
```

---

## Phase 7: 收尾配置

### Task 13: PWA 配置 + Service Worker

**Files:**
- Create: `sw.js`
- Create: `manifest.json`

- [ ] **Step 1: 创建 manifest.json**

```json
{
  "name": "K8s Architect",
  "short_name": "K8s学习",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0d1117",
  "theme_color": "#58a6ff",
  "icons": [
    { "src": "assets/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "assets/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

- [ ] **Step 2: 创建 sw.js**

```javascript
const CACHE_NAME = 'k8s-architect-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/app.js',
  '/js/canvas-engine.js',
  '/js/animations.js',
  '/js/interactions.js',
  '/js/game.js',
  '/js/progress-store.js',
  '/js/modules/architecture.js',
  '/js/modules/pod-lifecycle.js',
  '/js/modules/network.js',
  '/js/modules/storage-k8s.js',
  '/js/modules/security.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(r => r || fetch(event.request))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(names =>
      Promise.all(names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n)))
    )
  );
});
```

- [ ] **Step 3: 在 index.html 中注册 Service Worker**

在 `</body>` 前添加：

```html
<script>
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
}
</script>
```

- [ ] **Step 4: 提交**

```bash
git add sw.js manifest.json
git commit -m "feat: add PWA support with service worker for offline usage"
```

---

## 实现计划总结

| Phase | 内容 | Tasks |
|-------|------|-------|
| Phase 1 | 核心框架（脚手架、CSS、Canvas、动画、交互、游戏状态） | Task 1-7 |
| Phase 2 | 模块一：整体架构（4 挑战） | Task 8 |
| Phase 3 | 模块二：Pod 创建流程（5 挑战） | Task 9 |
| Phase 4 | 模块三：网络架构（5 挑战） | Task 10 |
| Phase 5 | 模块四：存储架构（4 挑战） | Task 11 |
| Phase 6 | 模块五：安全与可观测性（4 挑战） | Task 12 |
| Phase 7 | 收尾配置（PWA + Service Worker） | Task 13 |

**共 13 个 Task，约 60-80 个步骤。**

**自检检查清单：**
- [ ] 所有 5 个模块 22 个挑战都有对应的 JS 文件和 render 实现
- [ ] 交互类型覆盖完整：探索、拖拽、序列、决策、动画、配置
- [ ] 游戏化系统：经验、等级、解锁、挑战完成回调
- [ ] LocalStorage 持久化
- [ ] 无 TBD/TODO 占位符
- [ ] Canvas 渲染引擎提供 drawNode / drawArrow / drawCurvedArrow / drawProgressBar 等所有需要的绘图原语
