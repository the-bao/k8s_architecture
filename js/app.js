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
    'architecture': { title: '整体架构总览', icon: '🏛', color: '#d97757', challenges: 4 },
    'pod-lifecycle': { title: 'Pod 创建流程', icon: '📦', color: '#a08bb5', challenges: 5 },
    'network': { title: '网络架构', icon: '🌐', color: '#7c9a5e', challenges: 5 },
    'storage': { title: '存储架构', icon: '💾', color: '#c96442', challenges: 4 },
    'security': { title: '安全与可观测', icon: '🔒', color: '#b53333', challenges: 4 }
  },

  init() {
    Game.init();
    this.engine = new CanvasEngine('main-canvas').init();
    this.animations = new AnimationManager(this.engine);
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
          (progress >= 1 ? 'completed' : '') + '">' +
          (progress >= 1 ? '✓ 已完成' : Math.round(progress * 100) + '%') +
        '</div>';

      item.addEventListener('click', () => this.navigate(modId));

      list.appendChild(item);
    }

    const stats = document.getElementById('progress-stats');
    const totalProgress = Game.getTotalProgress();
    const completedModules = this.MODULE_ORDER.filter(id => Game.getModuleProgress(id) >= 1).length;
    const totalChallenges = Object.values(Game.state.modules).reduce((sum, m) =>
      sum + Object.keys(m.challenges).filter(k => m.challenges[k].completed).length, 0);

    stats.innerHTML =
      '<div style="color:#d97757;font-size:12px;margin-bottom:4px;">' + completedModules + '/5 模块</div>' +
      '<div style="color:#7c9a5e;font-size:12px;margin-bottom:4px;">' + totalChallenges + '/22 挑战</div>' +
      '<div style="color:#87867f;font-size:12px;">总进度 ' + Math.round(totalProgress * 100) + '%</div>';
  },

  updateStatusBar() {
    const level = Game.getLevel();
    const progress = Game.getXPProgress();

    document.getElementById('level-badge').textContent = 'Lv.' + level.level + ' ' + level.name;
    document.getElementById('xp-display').textContent = Game.state.xp + ' 经验';
    document.getElementById('xp-bar').style.width = (progress * 100) + '%';
  },

  navigate(moduleId) {
    // 如果点击同一模块且在挑战中，返回模块概览（不退出挑战）
    if (this.currentModule === moduleId && this.currentChallenge !== null) {
      this._renderModuleOverview(moduleId);
      return;
    }

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
    document.getElementById('btn-prev').classList.add('hidden');
    document.getElementById('btn-next').classList.add('hidden');

    this._renderModuleOverview(moduleId);
  },

  startChallenge(challengeIndex) {
    this._cleanupModule();
    this.currentChallenge = challengeIndex;

    const mod = window.K8sModules[this.currentModule];
    if (!mod || !mod.challenges[challengeIndex]) return;

    const challenge = mod.challenges[challengeIndex];
    document.getElementById('challenge-card').classList.remove('hidden');
    document.getElementById('challenge-title').textContent = '🎯 挑战 ' + (challengeIndex + 1) + '/' + mod.challenges.length + '：' + challenge.title;
    document.getElementById('challenge-desc').textContent = challenge.description;
    document.getElementById('challenge-actions').innerHTML = '';
    document.getElementById('btn-start').classList.add('hidden');
    document.getElementById('btn-learn').classList.add('hidden');
    this._updateNavButtons();

    challenge.render(this.engine, this.animations, this.interactions, this);

    // Re-enable interactions after challenge renders
    this.interactions.enable();
  },

  showFeedback(type, message, duration = 2000) {
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
    const screen = this.engine.localToScreen(x, y);
    tip.style.left = (screen.x + 15) + 'px';
    tip.style.top = (screen.y - 10) + 'px';
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
      : '+100 经验';

    this.showFeedback('success', '太棒了！挑战完成！' + xpMsg, 2500);

    const mod = window.K8sModules[moduleId];
    if (mod && challengeIndex + 1 < mod.challenges.length) {
      setTimeout(() => this.startChallenge(challengeIndex + 1), 2500);
    } else {
      setTimeout(() => {
        this.showFeedback('success', '🎉 模块完成！', 2500);
        this.navigate(moduleId);
      }, 2500);
    }
  },

  _updateNavButtons() {
    const mod = window.K8sModules[this.currentModule];
    if (!mod || this.currentChallenge === null) {
      document.getElementById('btn-prev').classList.add('hidden');
      document.getElementById('btn-next').classList.add('hidden');
      return;
    }
    const total = mod.challenges.length;
    document.getElementById('btn-prev').classList.toggle('hidden', this.currentChallenge <= 0);
    document.getElementById('btn-next').classList.toggle('hidden', this.currentChallenge >= total - 1);
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
      color: '#87867f',
      fontSize: 14,
      align: 'center',
      baseline: 'middle'
    });

    this.engine.drawText('共 ' + mod.challenges.length + ' 个挑战 | 点击「开始挑战」继续', cx, cy + 20, {
      color: '#5e5d59',
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

    // Remove any dynamically added DOM elements from canvas-container
    const container = document.getElementById('canvas-container');
    const keepIds = new Set(['main-canvas', 'anim-canvas', 'feedback-bubble', 'tooltip-bubble']);
    Array.from(container.children).forEach(child => {
      if (!keepIds.has(child.id)) {
        child.remove();
      }
    });
  },

  _bindButtons() {
    document.getElementById('btn-reset').addEventListener('click', () => {
      if (this.currentChallenge !== null) {
        this.startChallenge(this.currentChallenge);
      }
    });

    document.getElementById('btn-learn').addEventListener('click', () => {
      if (this.currentModule) {
        this._renderModuleOverview(this.currentModule);
      }
    });

    document.getElementById('btn-prev').addEventListener('click', () => {
      if (this.currentChallenge !== null && this.currentChallenge > 0) {
        this.startChallenge(this.currentChallenge - 1);
      }
    });

    document.getElementById('btn-next').addEventListener('click', () => {
      const mod = window.K8sModules[this.currentModule];
      if (this.currentChallenge !== null && mod && this.currentChallenge < mod.challenges.length - 1) {
        this.startChallenge(this.currentChallenge + 1);
      }
    });
  }
};

window.addEventListener('DOMContentLoaded', () => App.init());
