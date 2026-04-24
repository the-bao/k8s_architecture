/**
 * CanvasEngine — Canvas 渲染引擎
 * 管理画布上下文、绘图原语、分层、缩放
 */
class CanvasEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.animCanvas = document.getElementById('anim-canvas');
    this.animCtx = this.animCanvas.getContext('2d');
    this.elements = [];
    this.dpr = window.devicePixelRatio || 1;
    this.scale = 1;
    this.offsetX = 0;
    this.offsetY = 0;
    this._resizeHandler = null;
    // Virtual design dimensions — modules render in this space
    this.REF_W = 800;
    this.REF_H = 480;
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
    const parentW = rect.width;
    const parentH = rect.height;

    this.canvas.width = parentW * this.dpr;
    this.canvas.height = parentH * this.dpr;
    this.canvas.style.width = parentW + 'px';
    this.canvas.style.height = parentH + 'px';

    // Uniform scale to fit virtual design into actual area
    this.scale = Math.min(parentW / this.REF_W, parentH / this.REF_H);
    const renderW = this.REF_W * this.scale;
    const renderH = this.REF_H * this.scale;
    this.offsetX = (parentW - renderW) / 2;
    this.offsetY = (parentH - renderH) / 2;

    // Report virtual dimensions so modules see a consistent coordinate space
    this.width = this.REF_W;
    this.height = this.REF_H;

    // Combined transform: DPR × scale + centering offset
    this.ctx.setTransform(
      this.dpr * this.scale, 0,
      0, this.dpr * this.scale,
      this.offsetX * this.dpr,
      this.offsetY * this.dpr
    );

    // Match animation overlay size and transform
    this.animCanvas.width = parentW * this.dpr;
    this.animCanvas.height = parentH * this.dpr;
    this.animCanvas.style.width = parentW + 'px';
    this.animCanvas.style.height = parentH + 'px';
    this.animCtx.setTransform(
      this.dpr * this.scale, 0,
      0, this.dpr * this.scale,
      this.offsetX * this.dpr,
      this.offsetY * this.dpr
    );
  }

  clear() {
    // Clear in physical pixel space to cover the entire canvas
    this.ctx.save();
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.restore();

    // Also clear animation overlay
    this.animCtx.save();
    this.animCtx.setTransform(1, 0, 0, 1, 0, 0);
    this.animCtx.clearRect(0, 0, this.animCanvas.width, this.animCanvas.height);
    this.animCtx.restore();
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
    const fontSize = options.fontSize || 12;
    ctx.save();
    ctx.font = (options.fontWeight || 'normal') + ' ' + fontSize + 'px Arial, system-ui, "Noto Sans SC", sans-serif';
    ctx.fillStyle = options.color || '#faf9f5';
    ctx.textAlign = options.align || 'left';
    ctx.textBaseline = options.baseline || 'top';

    if (options.maxWidth) {
      const lines = this._wrapText(ctx, text, options.maxWidth);
      const lineHeight = fontSize + 3;
      lines.forEach((line, i) => {
        ctx.fillText(line, x, y + i * lineHeight);
      });
      ctx.restore();
      return this._registerElement('text', x, y, options.maxWidth, lines.length * lineHeight, options);
    }

    ctx.fillText(text, x, y);
    ctx.restore();
    const metrics = ctx.measureText(text);
    return this._registerElement('text', x, y, metrics.width, fontSize, options);
  }

  drawLine(x1, y1, x2, y2, options = {}) {
    const ctx = this.ctx;
    ctx.save();
    ctx.strokeStyle = options.color || '#5e5d59';
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
    const color = options.color || '#5e5d59';
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
    const color = options.color || '#5e5d59';
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
    const borderColor = options.borderColor || '#d97757';
    const bgColor = options.bgColor || 'rgba(217, 119, 87, 0.1)';
    const textColor = options.textColor || '#faf9f5';
    const subLabel = options.subLabel || '';
    const fontSize = options.fontSize || 12;

    const ctx = this.ctx;
    ctx.save();
    ctx.font = '600 ' + fontSize + 'px Arial, system-ui, "Noto Sans SC", sans-serif';
    const maxTextWidth = w - 16;
    const lines = this._wrapText(ctx, label, maxTextWidth);
    const lineHeight = fontSize + 3;
    const textBlockHeight = lines.length * lineHeight;

    // Adjust box height if text needs more room
    let actualH = h;
    if (subLabel) {
      actualH = Math.max(h, textBlockHeight + 28);
    } else {
      actualH = Math.max(h, textBlockHeight + 12);
    }

    this.drawRect(x, y, w, actualH, {
      fillColor: bgColor,
      borderColor: borderColor,
      borderWidth: options.borderWidth || 1.5,
      radius: 8
    });

    // Draw wrapped label lines, centered vertically
    let textStartY;
    if (subLabel) {
      textStartY = y + (actualH - 18 - textBlockHeight) / 2 + 2;
    } else {
      textStartY = y + (actualH - textBlockHeight) / 2;
    }
    for (let i = 0; i < lines.length; i++) {
      this.drawText(lines[i], x + w / 2, textStartY + i * lineHeight, {
        color: textColor,
        fontSize: fontSize,
        fontWeight: '600',
        align: 'center',
        baseline: 'top'
      });
    }

    if (subLabel) {
      this.drawText(subLabel, x + w / 2, y + actualH - 18, {
        color: '#87867f',
        fontSize: 9,
        align: 'center',
        baseline: 'top'
      });
    }

    return this._registerElement('node', x, y, w, actualH, { ...options, label });
  }

  drawProgressBar(x, y, w, h, progress, options = {}) {
    const bgColor = options.bgColor || '#3d3d3a';
    const fillColor = options.fillColor || '#c96442';

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
    ctx.font = '600 10px Arial, system-ui, "Noto Sans SC", sans-serif';
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

  /** Convert screen (CSS pixel) coordinates to virtual design coordinates */
  screenToLocal(sx, sy) {
    return {
      x: (sx - this.offsetX) / this.scale,
      y: (sy - this.offsetY) / this.scale
    };
  }

  /** Convert virtual design coordinates back to screen (CSS pixel) coordinates */
  localToScreen(lx, ly) {
    return {
      x: lx * this.scale + this.offsetX,
      y: ly * this.scale + this.offsetY
    };
  }

  /* ===== 内部方法 ===== */

  _wrapText(ctx, text, maxWidth) {
    if (maxWidth <= 0) return [text];
    const lines = [];
    // First split on existing newlines
    const paragraphs = text.split('\n');
    for (const para of paragraphs) {
      if (ctx.measureText(para).width <= maxWidth) {
        lines.push(para);
        continue;
      }
      let current = '';
      for (const ch of para) {
        const test = current + ch;
        if (ctx.measureText(test).width > maxWidth && current.length > 0) {
          lines.push(current);
          current = ch;
        } else {
          current = test;
        }
      }
      if (current) lines.push(current);
    }
    return lines.length > 0 ? lines : [text];
  }

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
