import { defineStore } from 'pinia'

export const useMockStore = defineStore('mock', {
  state: () => ({
    policies: [
      {
        id: 1,
        title: '연차유급휴가 운영 규정',
        type: 'POLICY',
        status: 'ACTIVE', // ACTIVE | REVISED | RETIRED
        date: '2025-11-30',
        body: `제4조(연차유급휴가)
1) 연차는 근로기준법에 따라 부여한다.
2) 미사용 연차는 최대 1년까지 이월될 수 있다.
3) 사용 절차는 전자결재(휴가 신청) 기준을 따른다.`,
      },
      {
        id: 2,
        title: '평가 제도 운영 지침(2025)',
        type: 'POLICY',
        status: 'REVISED',
        date: '2025-09-10',
        body: `제2장(평가 운영)
1) 평가 등급과 산정 기준을 정의한다.
2) 결과는 확정 후 개인에게 통지한다.`,
      },
      {
        id: 3,
        title: '교육 지원 제도(폐기)',
        type: 'MANUAL',
        status: 'RETIRED',
        date: '2024-12-02',
        body: `해당 제도는 2025년부터 폐기되었습니다.`,
      },
    ],
    faqs: [
      {
        id: 1,
        category: '휴가',
        q: '연차 이월 기준은 무엇인가요?',
        a: `연차는 최대 1년까지 이월될 수 있습니다.
세부 기준은 ‘연차유급휴가 운영 규정’ 제4조를 참고하세요.`,
        updated: '2025-12-10',
      },
      {
        id: 2,
        category: '평가',
        q: '평가 결과는 어디에서 확인하나요?',
        a: `평가 결과 확정 시 알림으로 안내되며, 요약 등급만 제공됩니다.
상세 점수는 개인정보 보호 정책상 제공되지 않습니다.`,
        updated: '2025-10-03',
      },
    ],
    notices: [
      {
        id: 1,
        title: '2026 상반기 평가 일정 안내',
        body: `• 평가 대상: 전사
• 기간: 2026-02-01 ~ 2026-02-15
• 안내: 평가 관련 FAQ 참고`,
        date: '2025-12-28',
        author: '인사팀',
      },
      {
        id: 2,
        title: '연말 연차 사용 권장 안내',
        body: `• 연차 소진 권장 기간 안내
• 부서별 일정 확인 후 신청 바랍니다.`,
        date: '2025-12-15',
        author: '인사팀',
      },
    ],
    alerts: [
      {
        id: 1,
        title: '[근태] 지각 발생 안내',
        body: `사유: 지각 발생이 감지되었습니다.
관련 화면에서 요약을 확인할 수 있습니다.`,
        date: '2026-01-02',
        link: '/me/attendance',
        read: false,
      },
      {
        id: 2,
        title: '[평가] 평가 결과 확정',
        body: `평가 결과가 확정되었습니다.
요약 등급을 확인해 주세요.`,
        date: '2025-12-28',
        link: '/me/review',
        read: true,
      },
    ],
  }),

  actions: {
    createPolicy(payload) {
      const id = Date.now()
      this.policies.unshift({ id, ...payload })
    },
    updatePolicy(id, patch) {
      const idx = this.policies.findIndex((p) => p.id === id)
      if (idx >= 0) this.policies[idx] = { ...this.policies[idx], ...patch }
    },
    createFaq(payload) {
      const id = Date.now()
      this.faqs.unshift({ id, ...payload })
    },
    createNotice(payload) {
      const id = Date.now()
      this.notices.unshift({ id, ...payload })
    },
    markAlertRead(id) {
      const a = this.alerts.find((x) => x.id === id)
      if (a) a.read = true
    },
  },
})
