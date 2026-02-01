<template>
  <div v-if="visible" class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <div class="modal-header">
        <h3>{{ isViewMode ? '사원 상세 정보' : (isEditMode ? '사원 정보 수정' : '신규 사원 등록') }}</h3>
        <button class="close-btn" @click="close" type="button" aria-label="Close">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="modal-body">
        <form @submit.prevent="handleSubmit" class="form-grid">
          
          <!-- 공통 필수 정보 -->
          <div class="form-group">
            <label>사번 <span class="required" v-if="!isViewMode">*</span></label>
            <input type="text" v-model="form.employeeNo" class="input" :required="!isEditMode && !isViewMode" :disabled="isEditMode || isViewMode" placeholder="예: EMP2024001" />
          </div>

          <div class="form-group">
            <label>로그인 ID <span class="required" v-if="!isViewMode">*</span></label>
            <input type="text" v-model="form.loginId" class="input" :required="!isEditMode && !isViewMode" :disabled="isEditMode || isViewMode" placeholder="예: user01" />
          </div>

          <div class="form-group" v-if="!isEditMode && !isViewMode">
            <label>비밀번호 <span class="required">*</span></label>
            <input type="password" v-model="form.password" class="input" required placeholder="초기 비밀번호" />
          </div>

          <div class="form-group">
            <label>이름 <span class="required" v-if="!isViewMode">*</span></label>
            <input type="text" v-model="form.name" class="input" :disabled="isViewMode" required />
          </div>

          <div class="form-group">
            <label>이메일 <span class="required" v-if="!isViewMode">*</span></label>
            <input type="email" v-model="form.email" class="input" :disabled="isViewMode" required />
          </div>

          <div class="form-group">
            <label>휴대전화</label>
            <input type="tel" v-model="form.phoneNo" class="input" :disabled="isViewMode" placeholder="010-0000-0000" />
          </div>

          <!-- 소속/직책 정보 -->
          <div class="form-group">
            <label>부서</label>
            <select v-model="form.deptId" class="input" :disabled="isViewMode">
              <option :value="null">미배정</option>
              <option v-for="dept in departments" :key="dept.deptId" :value="dept.deptId">
                {{ dept.deptName }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>직위</label>
            <select v-model="form.positionId" class="input" :disabled="isViewMode">
              <option :value="null">미배정</option>
              <option v-for="pos in positions" :key="pos.positionId" :value="pos.positionId">
                {{ pos.name || pos.positionName }}
              </option>
            </select>
          </div>

          <!-- 개인 상세 정보 -->
          <div class="form-group">
            <label>성별</label>
            <select v-model="form.gender" class="input" :disabled="isViewMode">
              <option value="">선택</option>
              <option value="MALE">남성</option>
              <option value="FEMALE">여성</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>생년월일</label>
            <input type="date" v-model="form.birth" class="input" :disabled="isViewMode" />
          </div>

          <div class="form-group">
            <label>입사일</label>
            <input type="date" v-model="form.hireDate" class="input" :disabled="isViewMode" />
          </div>
          
          <div class="form-group" v-if="isEditMode || isViewMode">
            <label>퇴사일</label>
            <input type="date" v-model="form.exitDate" class="input" :disabled="isViewMode" />
          </div>

          <div class="form-group" v-if="isEditMode || isViewMode">
            <label>내선번호</label>
            <input type="text" v-model="form.extNo" class="input" :disabled="isViewMode" placeholder="예: 070-1234-5678" />
          </div>

          <div class="form-actions">
             <button type="button" class="btn secondary" @click="close">
               {{ isViewMode ? '닫기' : '취소' }}
             </button>
            <button v-if="!isViewMode" type="submit" class="btn primary" :disabled="loading">
              {{ loading ? '처리중...' : (isEditMode ? '수정 저장' : '등록 완료') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { createEmployee, updateEmployeeProfile } from '@/api/employeeApi'

const props = defineProps({
  visible: Boolean,
  editMode: Boolean,
  viewMode: Boolean,
  targetEmp: Object,
  departments: { type: Array, default: () => [] },
  positions: { type: Array, default: () => [] }
})

const emit = defineEmits(['close', 'success'])

const loading = ref(false)
const isEditMode = computed(() => props.editMode)
const isViewMode = computed(() => props.viewMode)

const form = ref({
  employeeNo: '',
  name: '',
  phoneNo: '', // normalized label
  loginId: '',
  email: '',
  password: '',
  deptId: null,
  positionId: null,
  gender: '',
  birth: '',
  hireDate: '',
  exitDate: '',
  extNo: ''
})

// Initialize form when opening
watch(() => props.visible, (val) => {
  if (val) {
    if ((props.editMode || props.viewMode) && props.targetEmp) {
      // Load existing data for Edit/View
      const t = props.targetEmp
      form.value = {
        employeeNo: t.employeeNo || t.empNo,
        loginId: t.loginId,
        name: t.name,
        email: t.email,
        phoneNo: t.phoneNo || t.phone,
        deptId: t.deptId || null,
        positionId: t.positionId || null,
        gender: t.gender || '',
        birth: t.birth,
        hireDate: t.hireDate,
        exitDate: t.exitDate,
        extNo: t.extNo
      }
    } else {
      // Reset for Create
      form.value = {
        employeeNo: '',
        name: '',
        phoneNo: '',
        loginId: '',
        email: '',
        password: '',
        deptId: null,
        positionId: null,
        gender: '',
        birth: '',
        hireDate: '',
        exitDate: '',
        extNo: ''
      }
    }
  }
})

const close = () => {
  emit('close')
}

const handleSubmit = async () => {
  loading.value = true
  try {
    if (isEditMode.value) {
      // Update Logic
      const res = await updateEmployeeProfile(props.targetEmp.empId, form.value)
      if(res.data && res.data.success) {
        alert('사원 정보가 수정되었습니다.')
        emit('success')
        close()
      }
    } else {
      // Create Logic
      // Backend expects 'phone' instead of 'phoneNo' for creation DTO
      const payload = { ...form.value, phone: form.value.phoneNo }
      const res = await createEmployee(payload)
      if(res.data && res.data.success) {
        alert('신규 사원이 등록되었습니다.')
        emit('success')
        close()
      }
    }
  } catch (e) {
    console.error(e)
    alert('처리 중 오류가 발생했습니다.')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100vw; height: 100vh;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  width: 720px; /* Widened for 2 columns */
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
  overflow: hidden;
  max-height: 90vh; /* Prevent screen overflow */
  display: flex;
  flex-direction: column;
}

/* ... header ... */
.modal-header {
  padding: 16px 24px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0; /* Prevent shrinking */
}

.modal-header h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: #1e293b;
}

.close-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  color: #64748b; /* Visible Slate-500 */
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.close-btn:hover {
  background-color: #f1f5f9;
  color: #ef4444; /* Red on hover */
}

.modal-body {
  padding: 24px;
  overflow-y: auto; /* Scroll if needed */
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr; /* 2 Columns */
  gap: 16px 24px; /* RowGap ColGap */
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* ... inputs ... */

.input {
  width: 100%;
  padding: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  height: 42px; /* Fixed height for consistency */
  box-sizing: border-box;
  transition: border-color 0.2s;
  background-color: white; /* Ensure white bg */
  color: #1e293b;
  outline: none; /* Prevent focus outline */
}
/* Fix Autofill Yellow in Scoped Component */
.input:-webkit-autofill,
.input:-webkit-autofill:hover,
.input:-webkit-autofill:focus {
  -webkit-box-shadow: 0 0 0px 1000px white inset !important;
  transition: background-color 5000s ease-in-out 0s;
}
.input:focus {
  border-color: #3b82f6;
  outline: none;
}
.input:disabled {
  background: #f8fafc;
  color: #94a3b8;
  cursor: not-allowed;
}

/* Custom Select Styling */
select.input {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 16px;
  padding-right: 32px; /* Space for arrow */
}

.form-actions {
  grid-column: 1 / -1; /* Span full width */
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--border);
}

.btn {
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: none;
}

.btn.primary { background: var(--primary); color: white; }
.btn.secondary { background: #f3f4f6; color: var(--text-main); }
.btn:disabled { opacity: 0.7; cursor: not-allowed; }
</style>
