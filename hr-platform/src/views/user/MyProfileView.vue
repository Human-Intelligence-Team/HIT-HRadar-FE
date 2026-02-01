<template>
  <section class="page-container">
    <div class="page-header">
      <div class="header-content">
        <h1>내 정보 조회</h1>
        <p class="subtitle">나의 프로필 정보를 확인하고 수정할 수 있습니다.</p>
      </div>
      <div class="actions">
        <template v-if="!isEditMode">
          <button class="btn btn-primary" @click="isEditMode = true">
            <i class="pi pi-user-edit"></i> 정보 수정
          </button>
        </template>
        <template v-else>
          <button class="btn btn-ghost" @click="cancelEdit">취소</button>
          <button class="btn btn-primary" @click="saveProfile">
            <i class="pi pi-check"></i> 저장
          </button>
        </template>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>정보를 불러오는 중입니다...</p>
    </div>
    <div v-else-if="!employee" class="error-state">
      <i class="pi pi-exclamation-triangle"></i>
      <p>사원 정보를 찾을 수 없습니다.</p>
    </div>

    <div v-else class="content-wrapper">
      <!-- Profile Card -->
      <div class="card profile-card">
        <div class="profile-header">
          <div class="avatar-area">
            <div class="avatar-lg">
              <img v-if="employee.image" :src="employee.image" alt="Profile" />
              <i v-else class="pi pi-user"></i>
            </div>
            <button v-if="isEditMode" class="btn-xs btn-outline mt-2">
              <i class="pi pi-camera"></i> 사진 변경
            </button>
          </div>
          
          <div class="basic-info">
            <h2 class="emp-name">{{ employee.name }}</h2>
            <div class="badges">
              <span class="badge position">{{ employee.positionName || '-' }}</span>
              <span class="badge dept">{{ employee.deptName || '-' }}</span>
              <span class="badge role">{{ employee.role || 'USER' }}</span>
              <span :class="['badge status', employee.status === '재직' ? 'active' : 'inactive']">
                {{ employee.status || '상태미정' }}
              </span>
            </div>
            <div class="emp-meta">
              <span>사번: {{ employee.employeeNo }}</span>
              <span class="separator">|</span>
              <span>입사일: {{ employee.hireDate || '-' }}</span>
            </div>
          </div>
        </div>

        <div class="divider"></div>

        <div class="detail-grid">
          <div class="grid-section">
            <h3><i class="pi pi-id-card"></i> 연락처 정보</h3>
            <div class="field-item">
              <div class="label">로그인 ID</div>
              <div class="value font-mono">{{ employee.loginId || '-' }}</div>
            </div>
            <div class="field-item">
              <div class="label">이메일</div>
              <div v-if="!isEditMode" class="value">{{ employee.email || '-' }}</div>
              <input v-else v-model="form.email" class="input" type="email" placeholder="example@company.com" />
            </div>
            <div class="field-item">
              <div class="label">휴대전화</div>
              <div v-if="!isEditMode" class="value">{{ employee.phoneNo || '-' }}</div>
              <input v-else v-model="form.phoneNo" class="input" placeholder="010-0000-0000" />
            </div>
            <div class="field-item">
              <div class="label">내선번호</div>
              <div v-if="!isEditMode" class="value">{{ employee.extNo || '-' }}</div>
              <input v-else v-model="form.extNo" class="input" placeholder="내선번호 입력" />
            </div>
          </div>

          <div class="grid-section">
            <h3><i class="pi pi-user"></i> 개인 정보</h3>
            <div class="field-item">
              <div class="label">생년월일</div>
              <div class="value">{{ employee.birth || '-' }}</div>
            </div>
            <div class="field-item">
              <div class="label">성별</div>
              <div class="value">{{ genderMap[employee.gender] || employee.gender || '-' }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Password Change Card -->
      <div class="card password-card">
        <h3><i class="pi pi-lock"></i> 비밀번호 변경</h3>
        <p class="info-text">보안을 위해 3개월마다 비밀번호를 변경하는 것을 권장합니다.</p>
        
        <div class="password-form">
          <div class="form-row">
            <div class="field-group">
              <label>현재 비밀번호</label>
              <input v-model="pwForm.currentPassword" class="input" type="password" placeholder="현재 비밀번호" />
            </div>
            <div class="field-group">
              <label>새 비밀번호</label>
              <input v-model="pwForm.newPassword" class="input" type="password" placeholder="영문, 숫자, 특수문자 포함 8자 이상" />
            </div>
            <div class="field-group">
              <label>새 비밀번호 확인</label>
              <input v-model="pwForm.confirmPassword" class="input" type="password" placeholder="새 비밀번호 확인" />
            </div>
          </div>
          <div class="form-actions">
            <button class="btn btn-warning" @click="handlePasswordChange" :disabled="pwLoading">
              <i v-if="pwLoading" class="pi pi-spin pi-spinner"></i>
              {{ pwLoading ? '변경 중...' : '비밀번호 변경' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, computed, reactive } from 'vue'
import { fetchEmployeeDetail, updateEmployeeProfile } from '@/api/employeeApi'
import { changeMyPassword } from '@/api/userAccount'
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()

const empId = computed(() => authStore.user?.employeeId)
const loading = ref(false)
const employee = ref(null)
const isEditMode = ref(false)

const genderMap = {
  'MALE': '남성',
  'FEMALE': '여성'
}

const form = reactive({
  email: '',
  extNo: '',
  phoneNo: ''
})

const pwForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})
const pwLoading = ref(false)

const loadData = async () => {
    if (!empId.value) return
    loading.value = true
    try {
        const res = await fetchEmployeeDetail(empId.value)
        if(res.data && res.data.success) {
            employee.value = res.data.data
            syncForm()
        }
    } catch(e) {
        console.error(e)
    } finally {
        loading.value = false
    }
}

const syncForm = () => {
    if(!employee.value) return
    form.email = employee.value.email || ''
    form.extNo = employee.value.extNo || ''
    form.phoneNo = employee.value.phoneNo || ''
}

const cancelEdit = () => {
    isEditMode.value = false
    syncForm()
}

const saveProfile = async () => {
    if(!confirm('정보를 수정하시겠습니까?')) return

    try {
        const res = await updateEmployeeProfile(empId.value, { ...form })
        if(res.data && res.data.success) {
            alert('저장되었습니다.')
            employee.value = { ...employee.value, ...res.data.data }
            syncForm()
            isEditMode.value = false
        }
    } catch(e) {
        console.error(e)
        alert('저장 실패: ' + (e.response?.data?.message || e.message))
    }
}

const handlePasswordChange = async () => {
    if (!pwForm.currentPassword || !pwForm.newPassword || !pwForm.confirmPassword) {
        alert('모든 필드를 입력해주세요.')
        return
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
        alert('새 비밀번호가 일치하지 않습니다.')
        return
    }
    if (!confirm('비밀번호를 변경하시겠습니까? 변경 후에는 다시 로그인해야 할 수 있습니다.')) return

    pwLoading.value = true
    try {
        await changeMyPassword({
            currentPassword: pwForm.currentPassword,
            newPassword: pwForm.newPassword
        })
        alert('비밀번호가 성공적으로 변경되었습니다. 보안을 위해 다시 로그인해주세요.')
        authStore.logout()
    } catch(e) {
        console.error(e)
        alert('비밀번호 변경 실패: ' + (e.response?.data?.message || '알 수 없는 오류가 발생했습니다.'))
    } finally {
        pwLoading.value = false
    }
}

onMounted(loadData)
</script>

<style scoped>
.page-container {
    max-width: 900px;
    margin: 0 auto;
    padding: 32px 20px;
}

.page-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    margin-bottom: 32px;
}
.page-header h1 {
    font-size: 26px;
    font-weight: 700;
    color: #1a1a1a;
    margin-bottom: 4px;
}
.subtitle {
    font-size: 14px;
    color: #666;
    margin: 0;
}

.actions {
    display: flex;
    gap: 8px;
}

/* Enhanced Buttons */
.btn {
    padding: 10px 18px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: all 0.2s;
}
.btn-primary { background: #0f172a; color: white; }
.btn-primary:hover { background: #334155; }
.btn-secondary { background: #f1f5f9; color: #475569; }
.btn-secondary:hover { background: #e2e8f0; }
.btn-ghost { background: transparent; color: #64748b; }
.btn-ghost:hover { background: #f8fafc; color: #334155; }
.btn-warning { background: #fff7ed; color: #c2410c; border: 1px solid #ffedd5; }
.btn-warning:hover { background: #ffedd5; }
.btn-outline { background: white; border: 1px solid #e2e8f0; color: #475569; }
.btn-outline:hover { background: #f8fafc; border-color: #cbd5e1; }
.btn-xs { padding: 4px 10px; font-size: 12px; }

/* Enhanced Cards */
.card {
    background: white;
    border-radius: 16px;
    border: 1px solid #e2e8f0;
    padding: 32px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    margin-bottom: 24px;
}

/* Profile Header */
.profile-header {
    display: flex;
    gap: 32px;
    align-items: center;
}
@media (max-width: 600px) {
    .profile-header { flex-direction: column; text-align: center; }
    .avatar-area { margin: 0 auto; }
}

.avatar-lg {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background: #f8fafc;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border: 3px solid white;
    box-shadow: 0 0 0 1px #e2e8f0;
}
.avatar-lg img { width: 100%; height: 100%; object-fit: cover; }
.avatar-lg i { font-size: 48px; color: #cbd5e1; }

.basic-info { flex: 1; }
.emp-name {
    font-size: 28px;
    font-weight: 800;
    color: #0f172a;
    margin-bottom: 12px;
}

.badges {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
    flex-wrap: wrap;
    justify-content: flex-start;
}
.badge {
    padding: 5px 10px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
}
.badge.position { background: #eff6ff; color: #3b82f6; }
.badge.dept { background: #f5f3ff; color: #8b5cf6; }
.badge.role { background: #fefce8; color: #ca8a04; border: 1px solid #fef9c3; }
.badge.status.active { background: #f0fdf4; color: #16a34a; }
.badge.status.inactive { background: #fef2f2; color: #dc2626; }

.emp-meta {
    display: flex;
    gap: 12px;
    color: #64748b;
    font-size: 14px;
    align-items: center;
}
.separator { color: #cbd5e1; }

.divider {
    height: 1px;
    background: #f1f5f9;
    margin: 32px 0;
}

/* Detail Grid */
.detail-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 40px;
}
.grid-section h3 {
    font-size: 16px;
    font-weight: 700;
    margin-bottom: 20px;
    color: #334155;
    display: flex;
    align-items: center;
    gap: 8px;
}
.grid-section h3 i { color: #94a3b8; font-size: 18px; }

.field-item { margin-bottom: 18px; }
.field-item .label {
    font-size: 12px;
    font-weight: 600;
    color: #94a3b8;
    margin-bottom: 6px;
    text-transform: uppercase;
    letter-spacing: 0.03em;
}
.field-item .value {
    font-size: 15px;
    color: #1e293b;
    font-weight: 500;
    min-height: 24px;
}
.font-mono { font-family: monospace; }

/* Input Styling */
.input {
    width: 100%;
    padding: 10px 14px;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    font-size: 14px;
    transition: all 0.2s;
}
.input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Password Card */
.password-card h3 {
    font-size: 18px;
    font-weight: 700;
    margin-bottom: 8px;
    color: #334155;
    display: flex;
    align-items: center;
    gap: 8px;
}
.info-text {
    font-size: 13px;
    color: #64748b;
    margin-bottom: 24px;
}

.form-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    align-items: flex-end;
}
@media (max-width: 768px) {
    .form-row { grid-template-columns: 1fr; }
}

.field-group label {
    display: block;
    font-size: 13px;
    font-weight: 600;
    color: #475569;
    margin-bottom: 6px;
}
.form-actions {
    margin-top: 24px;
    display: flex;
    justify-content: flex-end;
}

/* Loading/Error States */
.loading-state, .error-state {
    text-align: center;
    padding: 60px;
    background: white;
    border-radius: 16px;
    border: 1px dashed #cbd5e1;
    color: #64748b;
}
.spinner {
    width: 32px; height: 32px;
    border: 3px solid #e2e8f0;
    border-top-color: #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 16px;
}
@keyframes spin { to { transform: rotate(360deg); } }
.error-state i { font-size: 32px; color: #ef4444; margin-bottom: 12px; }
</style>
