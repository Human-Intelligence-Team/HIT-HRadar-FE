<template>
  <div class="login-wrapper">
    <div class="login-panel">
      <h1>Sign in</h1>

      <div class="field">
        <input
          v-model="companyCode"
          placeholder="Company Code"
          @blur="validateCompanyCode"
        />
        <p v-if="errors.companyCode" class="error">
          {{ errors.companyCode }}
        </p>
      </div>

      <div class="field">
        <input
          v-model="loginId"
          placeholder="ID"
          @blur="validateLoginId"
        />
        <p v-if="errors.loginId" class="error">
          {{ errors.loginId }}
        </p>
      </div>

      <div class="field">
        <input
          v-model="password"
          type="password"
          placeholder="Password"
          @blur="validatePassword"
        />
        <p v-if="errors.password" class="error">
          {{ errors.password }}
        </p>
      </div>

      <p v-if="serverError" class="server-error">
        {{ serverError }}
      </p>

      <button
        @click="login"
        :disabled="auth.loading || !isFormValid"
      >
        {{ auth.loading ? 'Signing in...' : 'Sign in' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'vue-router'

const loginId = ref('')
const password = ref('')
const companyCode = ref('')

const errors = ref({
  companyCode: '',
  loginId: '',
  password: '',
})

const serverError = ref('')

const auth = useAuthStore()
const router = useRouter()

/* ----------------------
 * validation rules
 * ---------------------- */
const validateCompanyCode = () => {
  errors.value.companyCode =
    !companyCode.value
      ? '회사 코드를 입력해주세요.'
      : ''
}

const validateLoginId = () => {
  errors.value.loginId =
    !loginId.value
      ? '아이디를 입력해주세요.'
      : ''
}

const validatePassword = () => {
  errors.value.password =
    !password.value
      ? '비밀번호를 입력해주세요.'
      : ''
}

/* ----------------------
 * computed
 * ---------------------- */
const isFormValid = computed(() => {
  return (
    companyCode.value &&
    loginId.value &&
    password.value &&
    !errors.value.companyCode &&
    !errors.value.loginId &&
    !errors.value.password
  )
})

/* ----------------------
 * submit
 * ---------------------- */
const login = async () => {
  validateCompanyCode()
  validateLoginId()
  validatePassword()

  if (!isFormValid.value) return

  serverError.value = ''

  const result = await auth.login({
    loginId: loginId.value,
    password: password.value,
    companyCode: companyCode.value,
  })

  if (result.success) {
    await router.replace('/')
  } else {
    serverError.value = result.message || '로그인에 실패했습니다.'
  }
}
</script>

<style scoped>

.error {
  margin-top: 6px;
  font-size: 12px;
  color: #dc2626;
}

.server-error {
  margin: 8px 0 4px;
  font-size: 13px;
  color: #b91c1c;
  text-align: center;
}

.login-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f7f8fa;
}

.login-panel {
  width: 340px;
  padding: 40px 36px 36px;
  background: #ffffff;
  border-radius: 10px;

  /* 👇 박스 느낌 핵심 */
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.03),
    0 8px 24px rgba(0, 0, 0, 0.04);
}

h1 {
  margin-bottom: 28px;
  font-size: 20px;
  font-weight: 600;
  color: #111;
  text-align: center;
}

.field {
  margin-bottom: 16px;
}

input {
  width: 100%;
  height: 42px;
  padding: 0 14px;
  font-size: 14px;
  color: #111;

  border-radius: 6px;
  border: 1px solid #d1d5db;
  background: #fff;

  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

input::placeholder {
  color: #9ca3af;
}

input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}

button {
  width: 100%;
  height: 44px;
  margin-top: 8px;

  background: #2563eb;
  color: #fff;
  font-size: 14px;
  font-weight: 500;

  border: none;
  border-radius: 6px;
  cursor: pointer;

  transition: background 0.15s ease;
}

button:hover {
  background: #1d4ed8;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
