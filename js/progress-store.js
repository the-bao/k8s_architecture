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