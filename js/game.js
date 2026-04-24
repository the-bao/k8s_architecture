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
          'pod-lifecycle': { unlocked: true, challenges: {} },
          network: { unlocked: true, challenges: {} },
          storage: { unlocked: true, challenges: {} },
          security: { unlocked: true, challenges: {} }
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
      this.addXP(this.XP_REWARDS.bonusNoHint, '首次通关奖励');
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
    return true;
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