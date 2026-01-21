import { defineStore } from 'pinia'
import { sendChatApi } from '@/api/chatApi'

export const useChatbotStore = defineStore('chatbot', {
  state: () => ({
    opened: false,
    messages: [],
    sessionId: crypto.randomUUID(),
    loading: false,
  }),

  actions: {
    toggle() {
      this.opened = !this.opened
    },
    close() {
      this.opened = false
    },
    clear() {
      this.messages = []
      this.sessionId = crypto.randomUUID()
    },

    async sendUser(text) {
      // 사용자 메시지 즉시 표시
      this.messages.push({ from: 'user', text })
      this.loading = true

      try {
        const res = await sendChatApi({
          message: text,
          sessionId: this.sessionId,
        })

        this.messages.push({
          from: 'bot',
          text: res.data.answer,
        })
      } catch (e) {
        this.messages.push({
          from: 'bot',
          text: '서버 오류가 발생했습니다.',
        })
      } finally {
        this.loading = false
      }
    },
  },
})
