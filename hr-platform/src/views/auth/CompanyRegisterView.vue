<template>
  <div class="split-layout">
    <!-- Left: Branding Section -->
    <div class="brand-section">
      <div class="brand-content">
        <div class="brand-logo" @click="goHome">
          <div class="logo-mark"></div>
          <span class="logo-text">HIT : SIGNAL</span>
        </div>
        <h1 class="brand-slogan">
          Data-driven<br />
          HR Management<br />
          Starts Here.
        </h1>
        <p class="brand-desc">
          데이터 기반의 인재 관리 솔루션을 경험해보세요.<br />
          간편한 신청으로 바로 시작할 수 있습니다.
        </p>
      </div>
      <div class="brand-footer">
        © 2025 HIT : SIGNAL Inc.
      </div>
    </div>

    <!-- Right: Form Section -->
    <div class="form-section">
      <div class="form-wrapper">
        <CompanyApplyForm @apply-success="onSuccess" @back="goHome" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import CompanyApplyForm from '@/components/auth/CompanyApplyForm.vue'

const router = useRouter()

const onSuccess = () => {
  alert('신청이 성공적으로 접수되었습니다.\n담당자가 확인 후 이메일로 결과를 안내해 드립니다.')
  router.push('/home')
}

const goHome = () => {
  router.push('/home')
}
</script>

<style scoped>
.split-layout {
  display: flex;
  min-height: 100vh;
  width: 100%;
  background: white;
}

/* --- Left Side --- */
.brand-section {
  flex: 0.8; /* Takes up about 45% */
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color: white;
  padding: 60px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
}

/* Abstract decorations for trendy look */
.brand-section::before {
  content: '';
  position: absolute;
  top: -100px;
  right: -100px;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%);
  border-radius: 50%;
  filter: blur(60px);
}
.brand-section::after {
  content: '';
  position: absolute;
  bottom: -50px;
  left: -50px;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, transparent 70%);
  border-radius: 50%;
  filter: blur(50px);
}

.brand-content {
  position: relative;
  z-index: 10;
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 80px;
  cursor: pointer;
}
.logo-mark {
  width: 24px;
  height: 24px;
  background: #3b82f6;
  border-radius: 6px;
}
.logo-text {
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.brand-slogan {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 24px;
  background: linear-gradient(to right, #ffffff, #94a3b8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.brand-desc {
  font-size: 1.1rem;
  color: #94a3b8;
  line-height: 1.6;
}

.brand-footer {
  font-size: 0.85rem;
  color: #475569;
  position: relative;
  z-index: 10;
}

/* --- Right Side --- */
.form-section {
  flex: 1.2; /* Takes up about 55% */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow-y: auto;
}

.form-wrapper {
  width: 100%;
  max-width: 580px;
  padding: 40px;
}

@media (max-width: 1024px) {
  .brand-slogan { font-size: 2.5rem; }
}

@media (max-width: 768px) {
  .split-layout { flex-direction: column; }
  .brand-section { flex: none; padding: 40px; }
  .brand-logo { margin-bottom: 40px; }
  .brand-slogan { font-size: 2rem; }
  .form-section { padding: 20px 0; }
  .form-wrapper { padding: 20px; }
}
</style>
