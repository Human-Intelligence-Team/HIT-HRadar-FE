import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: {
      id: 1,
      name: '민욱',
      roles: ['HR_ADMIN'],
      permissions: [
        'POLICY_READ',
        'POLICY_WRITE',
        'FAQ_MANAGE',
        'NOTICE_READ',
        'NOTICE_WRITE',
        // 'ALERT_MANAGE'  // ← 필요하면 여기 추가
      ],
    },
  }),
  getters: {
    hasPermission: (state) => (perm) => state.user.permissions.includes(perm),
  },
  actions: {
    // 실제 서비스면 로그인 응답으로 user 세팅
    setUser(user) {
      this.user = user
    },
    firstAccessiblePath() {
      const p = this.user.permissions
      if (p.includes('POLICY_READ')) return '/policy'
      if (p.includes('FAQ_MANAGE')) return '/faq'
      if (p.includes('NOTICE_READ')) return '/notice'
      if (p.includes('ALERT_MANAGE')) return '/alert'
      return null
    },
  },
})
