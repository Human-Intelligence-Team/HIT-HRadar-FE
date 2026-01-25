import { defineStore } from 'pinia'
import { useMockStore } from '@/stores/mockStore'

export const useChatbotStore = defineStore('chatbot', {
  state: () => ({
    opened: false,
    messages: [
      { from: 'bot', text: '안녕하세요! 인사 제도/규정 관련해서 무엇을 도와드릴까요?' },
      { from: 'bot', text: '※ 개인 인사정보는 “요약”만 제공하며 상세 수치는 노출하지 않습니다.' },
    ],
    selectedCategory: null, // New state property for selected category
  }),
  actions: {
    open() { this.opened = true },
    close() { this.opened = false },
    toggle() { this.opened = !this.opened },
    clear() {
      this.messages = [
        { from: 'bot', text: '안녕하세요! 인사 제도/규정 관련해서 무엇을 도와드릴까요?' },
        { from: 'bot', text: '※ 개인 인사정보는 “요약”만 제공하며 상세 수치는 노출하지 않습니다.' },
      ]
      this.selectedCategory = null // Clear category on chat reset
    },
    sendUser(text, category = null) { // Modified to accept an optional category
      this.messages.push({ from: 'user', text })
      const answer = this.mockAnswer(text, category) // Pass category to mockAnswer
      this.messages.push({ from: 'bot', text: answer })
      this.selectedCategory = null // Clear selected category after sending message
    },
    setSelectedCategory(category) { // New action to set the selected category
      this.selectedCategory = category
      this.messages.push({ from: 'bot', text: `카테고리 [${category}]를 선택했습니다. 질문을 입력해주세요.` });
    },
    mockAnswer(q, category) { // Modified to accept category
      const s = useMockStore() // 단순 데모
      const t = q.trim()

      let responsePrefix = category ? `[${category} 관련] ` : '';

      if (t.includes('연차') && (t.includes('이월') || t.includes('기준') || t.includes('몇'))) {
        return responsePrefix + '연차는 최대 1년까지 이월될 수 있습니다.\n(‘연차유급휴가 운영 규정’ 제4조 기준)'
      }
      if (t.includes('평가') && (t.includes('결과') || t.includes('확인'))) {
        return responsePrefix + '평가 결과는 확정 후 알림으로 안내되며, 요약 등급만 제공됩니다.\n상세 점수는 제공되지 않습니다.'
      }
      if (t.includes('공지')) {
        return responsePrefix + `현재 공지 ${s.notices.length}건이 있습니다.\n가장 최근: ${s.notices[0]?.title || '-'}`.trim()
      }
      return responsePrefix + '해당 질문에 대한 정확한 안내가 어렵습니다.\n인사팀에 문의해 주세요.'
    },
  },
})
