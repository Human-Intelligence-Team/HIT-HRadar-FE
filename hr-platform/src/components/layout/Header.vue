<template>
  <header class="header">
    <div class="header-left">
      <div class="brand">
        <span class="logo"></span>
        <div class="brand-text">
          <div class="brand-title">HRadar</div>
          <div class="brand-sub">HIT 인사관리시스템</div>
        </div>
      </div>
    </div>

    <div class="header-right">
      <NotificationBell />
<!--      <div class="chip">User <b>{{ auth.profile.name }}</b></div>-->
<!--      <div class="chip">Company <b>{{ auth.profile.companyName }}</b></div>-->
      <ThemeToggle />
      <button class="btn ghost" @click="logout">로그아웃</button>
    </div>
  </header>
</template>

<script setup>
import ThemeToggle from '@/components/common/ThemeToggle.vue'
import NotificationBell from '@/components/notification/NotificationBell.vue'
import { useAuthStore } from '@/stores/authStore'
const auth = useAuthStore()

const logout = async () => {
  const confirmed = confirm('로그아웃 하시겠습니까?')
  if (!confirmed) return

  await auth.logout()
}
</script>
