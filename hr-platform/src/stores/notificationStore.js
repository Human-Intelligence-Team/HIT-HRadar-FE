// stores/notificationStore.js
import { defineStore } from 'pinia'
import {
  fetchNotifications,
  markNotificationRead,
  deleteNotification,
  markAllNotificationsRead,
} from '@/api/notificationApi'

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    notifications: [],
    loaded: false,
  }),

  getters: {
    unreadCount(state) {
      return state.notifications.filter((n) => !n.read).length
    },
  },

  actions: {
    async load() {
      if (this.loaded) return

      const res = await fetchNotifications()
      this.notifications = res.data.map(n => ({
        ...n,
        read: n.read === true || n.read === 'Y'
      }))
      this.loaded = true
    },

    push(notification) {
      const normalized = {
        ...notification,
        read: notification.read === true || notification.read === 'Y'
      }

      const idx = this.notifications.findIndex(n => n.id === normalized.id)

      if (idx !== -1) {
        this.notifications[idx] = {
          ...this.notifications[idx],
          ...normalized
        }
      } else {
        this.notifications.unshift(normalized)
      }
    },

    async read(id) {
      await markNotificationRead(id)

      this.notifications = this.notifications.map(n =>
        n.id === id ? { ...n, read: true } : n
      )
    },

    async remove(id) {
      await deleteNotification(id)
      this.notifications = this.notifications.filter((n) => n.id !== id)
    },

    clear() {
      this.notifications = []
      this.loaded = false
    },

    async readAll() {
      if (this.unreadCount === 0) return

      await markAllNotificationsRead()

      this.notifications = this.notifications.map(n => ({
        ...n,
        read: true
      }))
    },
  },
})
