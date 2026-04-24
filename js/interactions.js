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
    this._clickedIds = new Set(); // 防止同一元素重复触发
  }

  destroy() {
    this.disable();
    this.handlers.forEach(h => {
      this.canvas.removeEventListener(h.type, h.handler);
    });
    this.handlers = [];
    this._clickedIds.clear();
  }

  enable() {
    this._enabled = true;
    this._clickedIds.clear(); // 重新启用时清除
  }

  disable() { this._enabled = false; }

  _getCanvasPos(e) {
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
      const pos = this._getCanvasPos(e);
      const hit = this.engine.hitTest(pos.x, pos.y);
      if (hit && elementIds.includes(hit.id)) {
        // 防止同一元素在当前交互周期内重复触发
        if (this._clickedIds.has(hit.id)) return;
        this._clickedIds.add(hit.id);
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
      const pos = this._getCanvasPos(e);
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
    // renderCallback 用于在拖拽时重绘画布
    const renderCallback = options.renderCallback || null;

    let dragging = null;
    let dragOffset = { x: 0, y: 0 };
    let originalPos = { x: 0, y: 0 };

    const onMouseDown = (e) => {
      if (!this._enabled) return;
      const pos = this._getCanvasPos(e);
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
        const pos = this._getCanvasPos(e);
        const hit = this.engine.hitTest(pos.x, pos.y);
        this.canvas.style.cursor = hit && sources.some(s => s.id === hit.id) ? 'grab' : 'default';
        return;
      }
      const pos = this._getCanvasPos(e);
      dragging.el.x = pos.x - dragOffset.x;
      dragging.el.y = pos.y - dragOffset.y;

      // 重绘画布以显示拖拽位置（清除旧位置，绘制新位置）
      if (renderCallback) {
        renderCallback();
      }
      if (onDragMove) onDragMove(dragging.el.id, pos);
    };

    const onMouseUp = (e) => {
      if (!dragging) return;
      const pos = this._getCanvasPos(e);
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
    // 记录已完成的步骤，防止重复触发
    const completedSteps = new Set();

    const handler = (e) => {
      if (!this._enabled) return;
      const pos = this._getCanvasPos(e);
      const hit = this.engine.hitTest(pos.x, pos.y);
      if (!hit) return;

      const expectedId = correctOrder[currentStep];

      if (hit.id === expectedId && !completedSteps.has(hit.id)) {
        completedSteps.add(hit.id);
        if (onCorrectStep) onCorrectStep(hit.id, currentStep);
        currentStep++;
        if (currentStep >= correctOrder.length && onComplete) {
          onComplete();
        }
      } else if (!completedSteps.has(hit.id)) {
        // 只有未完成的元素才会触发错误提示
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