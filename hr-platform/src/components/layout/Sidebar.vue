<template>
  <aside class="sidebar">
    <nav class="nav">
      <template v-for="(section, sIdx) in menuConfig" :key="sIdx">
        <div class="section-title" v-if="!section.hidden">{{ section.title }}</div>
        
        <template v-for="(item, iIdx) in section.items" :key="iIdx">
          <!-- Item with Flyout -->
          <div 
            v-if="item.children"
            class="nav-group has-flyout"
            @mouseenter="showFlyout($event, item)"
            @mouseleave="hideFlyout"
          >
            <div class="nav-item">
              <span>{{ item.text }}</span>
              <span class="arrow">›</span>
            </div>
          </div>

          <!-- Direct Link -->
          <RouterLink
            v-else-if="!item.perm || can(item.perm)"
            :to="item.to"
            class="nav-item link"
            active-class="active"
          >
            {{ item.text }}
          </RouterLink>
        </template>
      </template>
    </nav>
  </aside>

  <!-- Teleported Flyout Menu -->
  <Teleport to="body">
    <div 
      v-if="activeFlyout" 
      class="flyout-container"
      :style="flyoutStyle"
      @mouseenter="cancelHide"
      @mouseleave="hideFlyout"
    >
      <div class="flyout-content">
        <RouterLink 
          v-for="child in activeFlyout.children" 
          :key="child.to" 
          :to="child.to" 
          class="flyout-item"
          @click="closeAll"
        >
          {{ child.text }}
        </RouterLink>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'

const auth = useAuthStore()

// --- Menu Configuration ---
const menuConfig = computed(() => [
  {
    title: '인사 관리',
    items: [
      {
        text: '사원 · 부서 관리',
        children: [
          { text: '사원 관리 (목록)', to: '/employee' },
          { text: '사원 목록 조회', to: '/personnel/employees/list' },
          { text: '부서 관리 (목록)', to: '/organization' },
          { text: '조직도', to: '/department/org-chart' },
          { text: '부서 정책 관리', to: '/department/manage' },
          { text: '직위 관리', to: '/personnel/positions' },
          { text: '직위 목록 조회', to: '/personnel/positions/list' },
          { text: '인사 발령 이력', to: '/personnel/history' },
        ]
      }
    ]
  },
  {
    title: '회사 관리',
    items: [
      {
        text: '회사 정보 관리',
        children: [
          { text: '내 회사 정보', to: '/company/my' },
          { text: '내 회사 관리', to: '/company/my-manage' },
          { text: '역할/권한 관리', to: '/company/roles' },
          ...(auth.isAdmin ? [{ text: '회사 정보 관리 (전체)', to: '/company/manage' }] : [])
        ]
      }
    ]
  },
  {
    title: '성과 평가',
    items: [
      {
        text: '목표 관리',
        children: [
          { text: 'KPI/OKR', to: '/goal' },
          { text: '목표 전체 조회', to: '/hr/goals' },
          { text: '팀장 목표 전체 조회', to: '/to/goals' },
        ]
      },
      {
        text: '다면 평가',
        children: [
          { text: '회차 등록/조회', to: '/cycles' },
          { text: '회차 등록/조회', to: '/hr/cycles' },
          { text: '평가유형 생성/회차 포함', to: '/hr/evaluation/type/setting' },
          { text: '문항지 생성', to: '/hr/evaluation/question/form/setting' },
          { text: '평가 배정', to: '/hr/evaluation/assignment' },
          { text: '다면 평가', to: '/evaluation/assignment/response' },
          { text: '평가 응답 조회', to: '/hr/evaluation/response/result' },
          { text: '평가 결과 조회', to: '/evaluation/response/my/result' },
        ]
      },
      {
        text: '등급관리',
        children: [
          { text: '등급 설정', to: '/grade/setting' },
          { text: '부서 등급 부여 현황', to: '/grading/list' },
          { text: '부서 등급 부여 현황(승인)', to: '/hr/grading/list' },
          { text: '부서원 등급 부여', to: '/to/grading/list' },
          { text: '부서원 등급 부여 및 승인', to: '/hr/grading/list/approve' },
          { text: '부여된 등급 조회', to: '/my/grading' },
          { text: '이의 제기 관리', to: '/to/grading/objection' },
        ]
      },
      {
        text: '대시보드/리포트',
        children: [
          { text: '대시보드', to: '/my/dashboard' },
          { text: '사원 대시보드', to: '/hr/dashboard' },
          { text: '리포트(인사팀)', to: '/all/competency/report' },
          { text: '리포트(팀장)', to: '/dept/competency/report' },
          { text: '리포트(개인)', to: '/me/competency/report' },
          { text: '학습컨텐츠 관리', to: '/all/contents' },
        ]
      }
    ]
  },
  {
    title: '근태 관리',
    items: [
      {
        text: '근태 관리',
        children: [
          { text: '나의 출퇴근 관리', to: '/attendance/commute' },
          { text: '나의 근태 캘린더', to: '/attendance/my-calendar' },
          ...(auth.isAdmin ? [
            { text: 'IP 정책 관리', to: '/attendance/ip-policy' },
            { text: '부서 출퇴근 관리', to: '/attendance/department' },
            { text: '부서별 근태 캘린더', to: '/attendance/department-calendar' }
          ] : [])
        ]
      }
    ]
  },
  {
    title: '휴가 관리',
    items: [
      {
        text: '휴가 관리',
        children: [
          { text: '내 휴가 이력', to: '/leave/my-history' },
          { text: '휴가 정책 관리', to: '/leave/policy' },
          ...(auth.isAdmin ? [{ text: '부서 휴가 이력', to: '/leave/admin/department-history' }] : [])
        ]
      }
    ]
  },
  {
    title: '결재 관리',
    items: [
      {
        text: '결재 관리',
        children: [
          { text: '결재 문서 등록', to: '/approval/create' },
          { text: '내 문서함', to: '/approval/my-documents' },
          { text: '결재 문서함', to: '/approval/approval-tasks' },
          { text: '반려 문서함', to: '/approval/rejected-documents' },
          { text: '참조 문서함', to: '/approval/references' },
          { text: '전체 문서함', to: '/approval/all-documents' },
          { text: '결재 관리(인사팀)', to: '/approval/admin' },
        ]
      }
    ]
  },
  {
    title: '연봉 관리',
    items: [
      {
        text: '연봉관리',
        children: [
          { text: '기본급관리(인사팀)', to: '/all/salary/basic' },
          { text: '기본급관리(본인)', to: '/me/salary/basic' },
          { text: '변동보상관리', to: '/all/salary/compensation' },
        ]
      }
    ]
  },
  { title: '챗봇 관리', items: [{ text: '제도 · 규정', to: '/policy', perm: 'POLICY_READ' }] },
  { 
    title: '기타', 
    items: [
      { text: '공지 관리', to: '/notice', perm: 'NOTICE_READ' },
      { text: '알림 관리', to: '/alert', perm: 'ALERT_MANAGE' }
    ] 
  },
  {
    title: '마이페이지',
    items: [
      {
        text: '내 정보 관리',
        children: [
          { text: '내 정보 조회/수정', to: '/my-profile' },
          { text: '내 부서 조회', to: '/my-department' },
        ]
      }
    ]
  },
  {
    title: '시스템 관리',
    hidden: !auth.isAdmin,
    items: [
      {
        text: '권한/설정',
        children: [
          { text: '권한 레지스트리', to: '/admin/permissions' },
        ]
      }
    ]
  }
])

// --- Logic ---
const activeFlyout = ref(null)
const flyoutTop = ref(0)
const flyoutLeft = ref(0)
let hideTimer = null

const flyoutStyle = computed(() => ({
  top: `${flyoutTop.value}px`,
  left: `${flyoutLeft.value}px`
}))

function showFlyout(event, item) {
  if (hideTimer) clearTimeout(hideTimer)
  const rect = event.currentTarget.getBoundingClientRect()
  flyoutTop.value = rect.top
  flyoutLeft.value = rect.right + 2 // 2px gap
  activeFlyout.value = item
}

function hideFlyout() {
  hideTimer = setTimeout(() => {
    activeFlyout.value = null
  }, 100)
}

function cancelHide() {
  if (hideTimer) clearTimeout(hideTimer)
}

function closeAll() {
  activeFlyout.value = null
}

const can = (perm) => {
  const permissions = {
    USER: ['POLICY_READ', 'NOTICE_READ', 'ALERT_MANAGE'],
    ADMIN: ['POLICY_READ', 'NOTICE_READ', 'ALERT_MANAGE'],
  }
  return permissions[auth.user.role]?.includes(perm) ?? false
}
</script>

<style scoped>
/* ===== Sidebar ===== */
.sidebar {
  width: 220px;
  background: #ffffff;
  border-right: 1px solid #e6e8ec;
  padding: 14px 10px;
  font-family: Pretendard, -apple-system, BlinkMacSystemFont, sans-serif;
  position: relative;
  z-index: 1000;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: rgba(0,0,0,0.1) transparent;
}

/* Custom Scrollbar */
.sidebar::-webkit-scrollbar { width: 4px; }
.sidebar::-webkit-scrollbar-track { background: transparent; }
.sidebar::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 10px;
}
.sidebar:hover::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.1); }

/* ===== Layout ===== */
.nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-bottom: 40px;
}

/* ===== Section ===== */
.section-title {
  font-size: 9px;
  font-weight: 600;
  color: #8b95a1;
  margin: 16px 0 6px 8px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

/* ===== Item ===== */
.nav-item {
  padding: 10px 12px;
  font-size: 13px;
  font-weight: 500;
  color: #2f343d;
  border-radius: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}
.nav-item:hover {
  background: #f4f7fa;
  color: #1f4fd8;
}

/* ===== Arrow ===== */
.arrow {
  font-size: 14px;
  color: #9aa1ad;
  transition: transform 0.2s;
}
.has-flyout:hover .arrow {
  transform: translateX(2px);
  color: #1f4fd8;
}

/* ===== Active ===== */
.active {
  background: #1f4fd8 !important;
  color: #ffffff !important;
  box-shadow: 0 4px 12px rgba(31, 79, 216, 0.2);
}
</style>

<!-- Global Styles for Teleported Flyout -->
<style>
.flyout-container {
  position: fixed;
  z-index: 9999;
  padding-left: 10px; /* Bridge gap buffer */
  margin-left: -5px;   /* Overlap buffer */
}

.flyout-content {
  width: 200px;
  background: #ffffff;
  border: 1px solid #e6e8ec;
  border-radius: 14px;
  padding: 8px;
  box-shadow: 10px 10px 40px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  animation: slideInSidebar 0.2s ease;
}

@keyframes slideInSidebar {
  from { opacity: 0; transform: translateX(8px); }
  to { opacity: 1; transform: translateX(0); }
}

.flyout-item {
  padding: 8px 12px;
  font-size: 13px;
  border-radius: 8px;
  color: #4b5563;
  text-decoration: none;
  display: block;
  transition: all 0.15s ease;
  margin-bottom: 2px;
}
.flyout-item:last-child { margin-bottom: 0; }
.flyout-item:hover {
  background: #f0f4ff;
  color: #1f4fd8;
  font-weight: 600;
}
</style>
