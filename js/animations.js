/**
 * Animations — 动画系统
 * 缓动、粒子、路径流动、脉冲效果
 * 所有动画绘制在独立的 overlay canvas 上，不影响静态内容
 */
class AnimationManager {
  constructor(engine) {
    this.engine = engine;
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
    // Clear overlay canvas
    const ctx = this.engine.animCtx;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, this.engine.animCanvas.width, this.engine.animCanvas.height);
    ctx.restore();
  }

  _loop() {
    if (!this.running) return;
    const now = performance.now();

    // Clear overlay canvas at the start of each frame
    const ctx = this.engine.animCtx;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, this.engine.animCanvas.width, this.engine.animCanvas.height);
    ctx.restore();

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

  emitParticles(engine, cx, cy, color, count = 12) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed = 0.5 + Math.random() * 1.5;
      this.particles.push({
        x: cx, y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: 2 + Math.random() * 3,
        life: 1,
        decay: 0.015 + Math.random() * 0.01
      });
    }
    if (!this.running) this.start();
  }

  _updateParticles() {
    const ctx = this.engine.animCtx;
    this.particles = this.particles.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;
      if (p.life <= 0) return false;

      ctx.save();
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return true;
    });
  }

  /* ===== 脉冲效果 ===== */

  addPulse(engine, cx, cy, color, duration = 2000) {
    this.pulses.push({
      x: cx, y: cy,
      color,
      maxRadius: 40,
      duration,
      startTime: performance.now()
    });
    if (!this.running) this.start();
  }

  _updatePulses(now) {
    const ctx = this.engine.animCtx;
    this.pulses = this.pulses.filter(p => {
      const elapsed = now - p.startTime;
      if (elapsed > p.duration) return false;
      const progress = elapsed / p.duration;
      const radius = p.maxRadius * progress;
      const alpha = 1 - progress;

      ctx.save();
      ctx.globalAlpha = alpha * 0.3;
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      return true;
    });
  }

  /* ===== 路径流动（数据包沿路径移动） ===== */

  flowAlongPath(engine, points, color, options = {}) {
    const flow = {
      points,
      color,
      speed: options.speed || 0.002,
      dotSize: options.dotSize || 5,
      progress: 0,
      onReachPoint: options.onReachPoint || null,
      lastPointIndex: -1,
      trail: []
    };
    this.flows.push(flow);
    if (!this.running) this.start();
    return flow;
  }

  _updateFlows() {
    const ctx = this.engine.animCtx;
    this.flows = this.flows.filter(f => {
      f.progress += f.speed;
      if (f.progress >= 1) {
        f.progress = 0;
        f.trail = [];
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

      // Maintain trail for comet effect
      f.trail.push({ x, y });
      if (f.trail.length > 12) f.trail.shift();

      // Draw trail
      f.trail.forEach((pt, i) => {
        const alpha = (i / f.trail.length) * 0.4;
        const size = f.dotSize * (i / f.trail.length) * 0.8;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = f.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Draw main dot with glow
      ctx.save();
      ctx.fillStyle = f.color;
      ctx.shadowColor = f.color;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(x, y, f.dotSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

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
