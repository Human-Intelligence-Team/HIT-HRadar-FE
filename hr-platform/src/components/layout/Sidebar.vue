<template>
  <aside class="sidebar">
    <div class="navtitle">Menu</div>

    <nav class="nav">
      <RouterLink v-if="can('POLICY_READ')" to="/policy">제도·규정</RouterLink>
      <RouterLink v-if="can('FAQ_MANAGE')" to="/faq">FAQ 관리</RouterLink>
      <RouterLink v-if="can('NOTICE_READ')" to="/notice">공지 관리</RouterLink>
      <RouterLink v-if="can('ALERT_MANAGE')" to="/alert">알림 관리</RouterLink>
    </nav>

    <div class="sidebar-tip card">
      <div class="tip-title">Quick Tips</div>
      <div class="tip-body">
        • 권한에 따라 메뉴 노출<br />
        • 챗봇은 우측 하단 버튼<br />
        • 개인 정보는 요약만
      </div>
    </div>
  </aside>
</template>

<script setup>
import { useAuthStore } from '@/stores/authStore'
const auth = useAuthStore()
const can = auth.hasPermission
</script>
