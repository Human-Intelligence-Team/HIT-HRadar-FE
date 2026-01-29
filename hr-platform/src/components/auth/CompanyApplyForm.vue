<template>
  <div class="apply-container">
    <form class="apply-content" @submit.prevent="submitApply">
      <h1>Company Apply</h1>

      <div class="field">
        <input
          v-model="form.companyName"
          placeholder="회사명 (Company Name)"
          @blur="validateField('companyName')"
        />
        <p v-if="errors.companyName" class="error">{{ errors.companyName }}</p>
      </div>

      <div class="field">
        <input
          v-model="form.bizNo"
          placeholder="사업자등록번호 (Business No)"
          @blur="validateField('bizNo')"
        />
        <p v-if="errors.bizNo" class="error">{{ errors.bizNo }}</p>
      </div>

      <div class="field">
        <input
          v-model="form.comTel"
          placeholder="전화번호 (Tel)"
          @blur="validateField('comTel')"
        />
        <p v-if="errors.comTel" class="error">{{ errors.comTel }}</p>
      </div>

      <div class="field">
        <input
          v-model="form.address"
          placeholder="주소 (Address)"
          @blur="validateField('address')"
        />
        <p v-if="errors.address" class="error">{{ errors.address }}</p>
      </div>

      <div class="field">
        <input
          v-model="form.name"
          placeholder="담당자명 (Manager Name)"
          @blur="validateField('name')"
        />
        <p v-if="errors.name" class="error">{{ errors.name }}</p>
      </div>

      <div class="field">
        <input
          v-model="form.email"
          type="email"
          placeholder="이메일 (Email)"
          @blur="validateField('email')"
        />
        <p v-if="errors.email" class="error">{{ errors.email }}</p>
      </div>

      <div class="field">
        <input
          v-model="form.loginId"
          placeholder="사용할 ID (Login ID)"
          @blur="validateField('loginId')"
        />
        <p v-if="errors.loginId" class="error">{{ errors.loginId }}</p>
      </div>

      <button
        class="btn-lg-primary"
        @click="submitApply"
        :disabled="loading || !isFormValid"
      >
        {{ loading ? 'Submitting...' : '회사 신청하기' }}
      </button>
      
      <button 
        type="button" 
        class="btn-text-back" 
        @click="$emit('back')"
      >
        돌아가기
      </button>

    </form>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { applyCompanyApi } from '@/api/comApp'

const emit = defineEmits(['apply-success', 'back'])

const form = reactive({
  companyName: '',
  bizNo: '',
  comTel: '',
  address: '',
  name: '',
  email: '',
  loginId: ''
})

const errors = reactive({
  companyName: '',
  bizNo: '',
  comTel: '',
  address: '',
  name: '',
  email: '',
  loginId: ''
})

const loading = ref(false)

const validateField = (field) => {
  if (!form[field]) {
    errors[field] = '필수 입력 항목입니다.'
  } else {
    errors[field] = ''
  }
}

const isFormValid = computed(() => {
  return Object.keys(form).every(k => form[k]) && Object.values(errors).every(e => !e)
})

const submitApply = async () => {
  Object.keys(form).forEach(validateField)
  if (!isFormValid.value) return

  loading.value = true
  
  console.log('Company Application:', form)
  
  try {
    await applyCompanyApi({ ...form })
    // success
    emit('apply-success')
  } catch (err) {
    const msg = err.response?.data?.message || err.customMessage || '신청 중 오류가 발생했습니다.'
    alert(msg)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.apply-container {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  /* Removed max-height to allow full vertical growth */
  /* max-height: 520px; */
  /* overflow-y: auto; */
}

.apply-content {
  width: 320px;
  padding: 20px;
}

h1 {
  margin-bottom: 24px;
  font-size: 22px;
  font-weight: 800;
  color: #0f172a;
  text-align: center;
  letter-spacing: -0.02em;
}

.field {
  margin-bottom: 12px;
}

input {
  width: 100%;
  height: 44px;
  padding: 0 16px;
  font-size: 0.9rem;
  color: #1e293b;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  transition: all 0.2s;
}

input::placeholder {
  color: #94a3b8;
}

input:focus {
  outline: none;
  background: white;
  border-color: #2563eb;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
}

.error {
  margin-top: 4px;
  font-size: 12px;
  color: #ef4444;
  margin-left: 4px;
}

/* --- Button --- */
.btn-lg-primary {
  width: 100%;
  height: 48px;
  margin-top: 16px;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.95rem;
  box-shadow: 
    0 8px 20px rgba(37, 99, 235, 0.25),
    inset 0 1px 0 rgba(255,255,255,0.2);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  cursor: pointer;
}

.btn-lg-primary:hover:not(:disabled) { 
  transform: translateY(-2px) scale(1.02);
  box-shadow: 
    0 12px 30px rgba(37, 99, 235, 0.35),
    inset 0 1px 0 rgba(255,255,255,0.2);
}

.btn-lg-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  background: #94a3b8;
}

.btn-text-back {
  width: 100%;
  margin-top: 12px;
  background: none;
  border: none;
  color: #64748b;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.2s;
}
.btn-text-back:hover {
  color: #1e293b;
  text-decoration: underline;
}

/* Custom scrollbar for form area */
.apply-container::-webkit-scrollbar {
  width: 6px;
}
.apply-container::-webkit-scrollbar-track {
  background: transparent;
}
.apply-container::-webkit-scrollbar-thumb {
  background-color: rgba(148, 163, 184, 0.3);
  border-radius: 10px;
}
</style>
