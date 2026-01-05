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
      <div class="chip">Company <b>DemoCorp</b></div>
      <div class="chip">User <b>{{ auth.user.name }}</b></div>
      <ThemeToggle />
      <button class="btn ghost" @click="logout">로그아웃</button>
    </div>
  </header>
</template>

<script setup>
import ThemeToggle from '@/components/common/ThemeToggle.vue'
import { useAuthStore } from '@/stores/authStore'
const auth = useAuthStore()

function logout() {
  alert('로그아웃 (Mock)')
}
</script>
