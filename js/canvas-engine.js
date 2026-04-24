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
