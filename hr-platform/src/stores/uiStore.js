import { defineStore } from 'pinia'
const STORAGE_KEY = 'hr-platform-theme'

export const useUiStore = defineStore('ui', {
  state: () => ({
    theme: 'dark',
  }),
  actions: {
    applyTheme(theme) {
      this.theme = theme
      document.documentElement.setAttribute('data-theme', theme)
      localStorage.setItem(STORAGE_KEY, theme)
    },
    toggleTheme() {
      this.applyTheme(this.theme === 'dark' ? 'light' : 'dark')
    },
    initTheme() {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved === 'dark' || saved === 'light') {
        this.applyTheme(saved)
        return
      }
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      this.applyTheme(prefersDark ? 'dark' : 'light')
    },
  },
})
