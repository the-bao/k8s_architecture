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
      lastPointIndex: -1,
      prevX: null,
      prevY: null
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

      // 清除上一个位置的 dot（使用比 dot 稍大的区域避免残留）
      if (f.prevX !== null && f.prevY !== null) {
        f.engine.ctx.save();
        f.engine.ctx.globalCompositeOperation = 'destination-out';
        f.engine.ctx.fillStyle = 'rgba(0,0,0,1)';
        f.engine.ctx.beginPath();
        f.engine.ctx.arc(f.prevX, f.prevY, f.dotSize + 3, 0, Math.PI * 2);
        f.engine.ctx.fill();
        f.engine.ctx.restore();
      }

      f.prevX = x;
      f.prevY = y;

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
