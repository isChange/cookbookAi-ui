import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    // 应用主题
    theme: 'light',
    // 设置对话框是否显示
    settingsDialogVisible: false,
    // 语言
    language: 'zh-CN'
  }),

  getters: {
    isDark: (state) => state.theme === 'dark'
  },

  actions: {
    /**
     * 切换主题
     */
    toggleTheme() {
      this.theme = this.theme === 'light' ? 'dark' : 'light'
      document.documentElement.setAttribute('data-theme', this.theme)
    },

    /**
     * 设置主题
     */
    setTheme(theme) {
      this.theme = theme
      document.documentElement.setAttribute('data-theme', theme)
    },

    /**
     * 显示设置对话框
     */
    showSettings() {
      this.settingsDialogVisible = true
    },

    /**
     * 隐藏设置对话框
     */
    hideSettings() {
      this.settingsDialogVisible = false
    },

    /**
     * 设置语言
     */
    setLanguage(language) {
      this.language = language
    }
  },

  persist: {
    enabled: true,
    strategies: [
      {
        key: 'app-store',
        storage: localStorage,
        paths: ['theme', 'language']
      }
    ]
  }
})

