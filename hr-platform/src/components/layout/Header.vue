<template>
  <header class="header">
    <!-- Left -->
    <div class="header-left">
      <div class="brand">
        <span class="logo" />
        <div class="brand-text">
          <div class="brand-title">HRadar</div>
          <div class="brand-sub">HIT 인사관리시스템</div>
        </div>
      </div>
    </div>

    <!-- Right -->
    <div class="header-right">
      <RouterLink v-if="auth.isAdmin" to="/admin/company-applications" class="admin-link">
         관리자 페이지 
      </RouterLink>
      <NotificationBell />
      <ThemeToggle />
      <button class="logout-btn" @click="logout">로그아웃</button>
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

<style scoped>
/* ===== Header ===== */
.header {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 18px;
  background: #ffffff;
  border-bottom: 1px solid #e6e8ec;
}

/* ===== Left ===== */
.header-left {
  display: flex;
  align-items: center;
}

/* ===== Brand ===== */
.brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: linear-gradient(135deg, #1f4fd8, #3b82f6);
}

/* Brand text */
.brand-text {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}

.brand-title {
  font-size: 15px;
  font-weight: 700;
  color: #1f2937;
}

.brand-sub {
  font-size: 11px;
  color: #6b7280;
}

/* ===== Right ===== */
.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* ===== Logout ===== */
.logout-btn {
  font-size: 12px;
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid #e6e8ec;
  background: #ffffff;
  color: #374151;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}

.logout-btn:hover {
  background: #f4f6f8;
}

.admin-link {
  font-size: 13px;
  font-weight: 600;
  color: #2563eb;
  text-decoration: none;
  border: 1px solid #bfdbfe;
  padding: 6px 10px;
  border-radius: 6px;
  background: #eff6ff;
  transition: all 0.2s;
}
.admin-link:hover {
  background: #dbeafe;
}
</style>
