<template>
  <aside class="sidebar">
    <nav class="nav">

      <!-- 인사 관리 -->
      <div class="section-title">인사 관리</div>

      <div class="nav-group has-flyout">
        <div class="nav-item">
          <span>사원 · 조직 관리</span>
          <span class="arrow">›</span>
        </div>
        <div class="flyout">
          <RouterLink to="/employee" class="flyout-item">사원 관리</RouterLink>
          <RouterLink to="/organization" class="flyout-item">조직 관리</RouterLink>
        </div>
      </div>

      <!-- 근태 관리 -->
      <div class="section-title">근태 관리</div>

      <div class="nav-group has-flyout">
        <div class="nav-item">
          <span>근태 관리</span>
          <span class="arrow">›</span>
        </div>
        <div class="flyout">
          <RouterLink to="/attendance/status" class="flyout-item">근태 현황</RouterLink>
          <RouterLink to="/attendance/request" class="flyout-item">근태 신청</RouterLink>
        </div>
      </div>

      <!-- 성과 평가 -->
      <div class="section-title">성과 평가</div>

      <div class="nav-group has-flyout">
        <div class="nav-item">
          <span>목표 관리</span>
          <span class="arrow">›</span>
        </div>
        <div class="flyout">
          <RouterLink to="/goal" class="flyout-item">KPI/OKR</RouterLink>
          <RouterLink to="/hr/goals" class="flyout-item">목표 전체 조회</RouterLink>
          <RouterLink to="/to/goals" class="flyout-item">팀장 목표 전체 조회</RouterLink>

        </div>
      </div>

      <div class="nav-group has-flyout">
        <div class="nav-item">
          <span>다면 평가</span>
          <span class="arrow">›</span>
        </div>
        <div class="flyout">
          <RouterLink to="/cycles" class="flyout-item">회차 등록/조회</RouterLink>
          <RouterLink to="/hr/cycles" class="flyout-item">회차 등록/조회</RouterLink>
        </div>
      </div>

      <div class="nav-group has-flyout">
        <div class="nav-item">
          <span>등급관리</span>
          <span class="arrow">›</span>
        </div>
        <div class="flyout">
          <RouterLink to="/grade/setting" class="flyout-item">등급 설정</RouterLink>
        </div>
      </div>

      <div class="nav-group has-flyout">
        <div class="nav-item">
          <span>대시보드/리포트</span>
          <span class="arrow">›</span>
        </div>
        <div class="flyout">
          <RouterLink to="/dashboard" class="flyout-item">대시보드</RouterLink>
          <RouterLink to="/report" class="flyout-item">리포트</RouterLink>
        </div>
      </div>

      <!-- 결재 관리 -->
      <div class="section-title">결재 관리</div>

      <div class="nav-group has-flyout">
        <div class="nav-item">
          <span>결재 관리</span>
          <span class="arrow">›</span>
        </div>
        <div class="flyout">
          <!-- 확장 -->
        </div>
      </div>

      <!-- 챗봇 관리 -->
      <div class="section-title">챗봇 관리</div>

      <RouterLink
        v-if="can('POLICY_READ')"
        to="/policy"
        class="nav-item link"
        active-class="active"
      >
        제도 · 규정
      </RouterLink>

      <RouterLink
        v-if="can('FAQ_MANAGE')"
        to="/faq"
        class="nav-item link"
        active-class="active"
      >
        FAQ
      </RouterLink>

      <!-- 기타 -->
      <div class="section-title">기타</div>

      <RouterLink
        v-if="can('NOTICE_READ')"
        to="/notice"
        class="nav-item link"
        active-class="active"
      >
        공지 관리
      </RouterLink>

      <RouterLink
        v-if="can('ALERT_MANAGE')"
        to="/alert"
        class="nav-item link"
        active-class="active"
      >
        알림 관리
      </RouterLink>

    </nav>
  </aside>
</template>

<script setup>
import { useAuthStore } from '@/stores/authStore'

const auth = useAuthStore()

const can = (perm) => {
  const permissions = {
    USER: ['POLICY_READ', 'FAQ_MANAGE', 'NOTICE_READ', 'ALERT_MANAGE'],
    ADMIN: ['POLICY_READ', 'FAQ_MANAGE', 'NOTICE_READ', 'ALERT_MANAGE'],
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
}

/* ===== Layout ===== */
.nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* ===== Section ===== */
.section-title {
  font-size: 9px;
  font-weight: 600;
  color: #8b95a1;
  margin: 16px 0 6px 8px;
  letter-spacing: 0.02em;
}

/* ===== Item ===== */
.nav-group {
  position: relative;
}

.nav-item {
  padding: 9px 12px;
  font-size: 11px;
  font-weight: 500;
  color: #2f343d;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}

.nav-item:hover {
  background: #f4f6f8;
}

/* ===== Arrow ===== */
.arrow {
  font-size: 15px;
  color: #9aa1ad;
}

/* ===== Flyout ===== */
.flyout {
  position: absolute;
  top: 0;
  left: calc(100% - 6px);
  width: 180px;
  background: #ffffff;
  border: 1px solid #e6e8ec;
  border-radius: 12px;
  padding: 6px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
  display: none;
  z-index: 30;
}

.has-flyout:hover .flyout {
  display: block;
}

.flyout-item {
  padding: 8px 12px;
  font-size: 11px;
  border-radius: 8px;
  color: #2f343d;
  text-decoration: none;
  display: block;
  transition: background 0.15s ease, color 0.15s ease;
}

.flyout-item:hover {
  background: #eef3ff;
  color: #1f4fd8;
}

/* ===== RouterLink ===== */
.link {
  text-decoration: none;
}

/* ===== Active ===== */
.active {
  background: #1f4fd8;
  color: #ffffff;
}

.active:hover {
  background: #1f4fd8;
}
</style>
