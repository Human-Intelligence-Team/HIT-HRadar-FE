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
            <h2 v-if="!isEditMode" class="emp-name">{{ employee.name }}</h2>
            <input v-else v-model="form.name" class="input name-input" placeholder="이름 입력" />
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
              <textarea v-else v-model="form.email" class="input auto-expand" placeholder="example@company.com" rows="1" @input="autoResize"></textarea>
            </div>
            <div class="field-item">
              <label for="phoneNo">휴대전화</label>
              <div v-if="!isEditMode" class="value">{{ employee.phoneNo || '-' }}</div>
              <input v-else id="phoneNo" name="phoneNo" v-model="form.phoneNo" class="input" placeholder="010-0000-0000" />
            </div>
            <div class="field-item">
              <label for="extNo">내선번호</label>
              <div v-if="!isEditMode" class="value">{{ employee.extNo || '-' }}</div>
              <input v-else id="extNo" name="extNo" v-model="form.extNo" class="input" placeholder="내선번호 입력" />
            </div>
          </div>

          <div class="grid-section">
            <h3><i class="pi pi-user"></i> 개인 정보</h3>
            <div class="field-item">
              <label for="birth">생년월일</label>
              <div v-if="!isEditMode" class="value">{{ employee.birth || '-' }}</div>
              <input v-else id="birth" name="birth" v-model="form.birth" class="input" placeholder="YYYYMMDD" maxlength="8" />
            </div>
            <div class="field-item">
              <label for="gender">성별</label>
              <div v-if="!isEditMode" class="value">{{ genderMap[employee.gender] || employee.gender || '-' }}</div>
              <select v-else id="gender" name="gender" v-model="form.gender" class="input">
                <option value="MALE">남성</option>
                <option value="FEMALE">여성</option>
              </select>
            </div>
            <div class="field-item full-width">
              <label for="note">비고</label>
              <div v-if="!isEditMode" class="value">{{ employee.note || '-' }}</div>
              <textarea v-else id="note" name="note" v-model="form.note" class="input auto-expand" placeholder="비고 사항 입력" rows="3" @input="autoResize"></textarea>
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
              <label for="currentPassword">현재 비밀번호</label>
              <input id="currentPassword" name="currentPassword" v-model="pwForm.currentPassword" class="input" type="password" placeholder="현재 비밀번호" />
            </div>
            <div class="field-group">
              <label for="newPassword">새 비밀번호</label>
              <input id="newPassword" name="newPassword" v-model="pwForm.newPassword" class="input" type="password" placeholder="영문, 숫자, 특수문자 포함 8자 이상" />
            </div>
            <div class="field-group">
              <label for="confirmPassword">새 비밀번호 확인</label>
              <input id="confirmPassword" name="confirmPassword" v-model="pwForm.confirmPassword" class="input" type="password" placeholder="새 비밀번호 확인" />
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
  name: '',
  email: '',
  extNo: '',
  phoneNo: '',
  note: '',
  birth: '',
  gender: ''
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
    form.name = employee.value.name || ''
    form.email = employee.value.email || ''
    form.extNo = employee.value.extNo || ''
    form.phoneNo = employee.value.phoneNo || ''
    form.note = employee.value.note || ''
    form.birth = employee.value.birth || ''
    form.gender = employee.value.gender || ''
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

const autoResize = (event) => {
    const element = event.target
    element.style.height = 'auto'
    element.style.height = element.scrollHeight + 'px'
}

onMounted(loadData)
</script>

<style scoped>
/* Toss-style Design System */
:root {
  --toss-blue: #3182f6;
  --toss-blue-dark: #1b64da;
  --toss-grey-bg: #f2f4f6;
  --toss-grey-100: #f9fafb;
  --toss-grey-200: #e5e8eb;
  --toss-grey-300: #b1b8c0;
  --toss-grey-400: #8b95a1;
  --toss-grey-500: #6b7684;
  --toss-grey-700: #333d4b;
  --toss-grey-900: #191f28;
}

.page-container {
    max-width: 720px; /* More mobile-app like width */
    margin: 0 auto;
    padding: 40px 20px 80px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    color: #333d4b;
}

/* Header */
.page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
}
.page-header h1 {
    font-size: 26px;
    font-weight: 700;
    color: #191f28;
    margin: 0;
    letter-spacing: -0.5px;
}
.subtitle {
    display: none; /* Minimalist header, hide subtitle */
}

/* Buttons */
.btn {
    padding: 12px 18px;
    border-radius: 12px;
    font-size: 15px;
    font-weight: 600;
    border: none;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.25, 0.1, 0.25, 1);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
}
.btn:active { transform: scale(0.96); }

.btn-primary { 
    background: #3182f6; 
    color: white; 
    box-shadow: 0 4px 10px rgba(49, 130, 246, 0.2);
}
.btn-primary:hover { background: #1b64da; }

.btn-ghost { background: transparent; color: #6b7684; }
.btn-ghost:hover { background: rgba(0,0,0,0.04); color: #333d4b; }

.btn-outline { 
    background: white; 
    border: 1px solid #e5e8eb; 
    color: #6b7684; 
    padding: 8px 12px;
}
.btn-warning {
    background-color: #ffeaea;
    color: #e63946;
}
.btn-xs { font-size: 13px; border-radius: 8px; }

/* Cards */
.card {
    background: white;
    border-radius: 24px; /* Super rounded */
    box-shadow: 0 2px 16px rgba(0, 0, 0, 0.04); /* Very soft shadow */
    padding: 30px;
    margin-bottom: 20px;
    border: none;
    transition: transform 0.2s;
}
.card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.06); }

/* Profile Header Section */
.profile-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    margin-bottom: 40px;
}
.avatar-lg {
    width: 100px; height: 100px;
    border-radius: 40px; /* Squircleish */
    background: #f2f4f6;
    margin-bottom: 16px;
    overflow: hidden;
    position: relative;
    border: none;
}
.avatar-lg img { width: 100%; height: 100%; object-fit: cover; }
.avatar-lg i { font-size: 40px; color: #b1b8c0; line-height: 100px; }

.emp-name {
    font-size: 24px;
    font-weight: 700;
    color: #191f28;
    margin-bottom: 8px;
}

.badges {
    display: flex;
    gap: 6px;
    justify-content: center;
    margin-bottom: 12px;
}
.badge {
    padding: 4px 8px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 500;
    background: #f2f4f6;
    color: #4e5968;
}
.badge.position { background: #e8f3ff; color: #3182f6; }
.badge.status.active { color: #3182f6; background: transparent; padding: 0; }
.badge.status.active:before { content: '● '; }

.emp-meta {
    font-size: 14px;
    color: #8b95a1;
}

/* Detail Grid */
.detail-grid { display: flex; flex-direction: column; gap: 32px; }
.grid-section h3 {
    font-size: 18px;
    font-weight: 700;
    color: #191f28;
    margin-bottom: 16px;
    display: flex; align-items: center; gap: 8px;
}
.grid-section h3 i { color: #b1b8c0; font-size: 20px; }

.field-item { 
    display: flex; 
    justify-content: space-between; 
    align-items: center; 
    padding: 12px 0;
    border-bottom: 1px solid #f2f4f6;
}
.field-item:last-child { border-bottom: none; }
.field-item.full-width { flex-direction: column; align-items: flex-start; gap: 8px; }

.field-item .label {
    font-size: 15px;
    color: #6b7684;
    font-weight: 500;
}
.field-item .value {
    font-size: 16px;
    color: #191f28;
    font-weight: 600;
    text-align: right;
}
.field-item.full-width .value {
    background: #f9fafb;
    width: 100%;
    padding: 12px;
    border-radius: 12px;
    text-align: left;
    font-weight: 400;
    line-height: 1.5;
    color: #4e5968;
}

/* Inputs */
.input {
    width: 50%; /* Reduced width as requested */
    text-align: right;
    border: none;
    background: #f9fafb; /* Light grey background for visibility */
    font-size: 15px;
    color: #191f28; /* Standard text color */
    font-weight: 500;
    padding: 6px 10px; /* Reduced padding */
    border-radius: 8px;
    transition: all 0.2s;
}
.input.auto-expand {
    resize: none;
    overflow: hidden;
    min-height: 40px; /* Match single line input height approximately */
    display: block;
}
.input::placeholder { color: #b1b8c0; font-weight: 400; }
.input:focus { 
    outline: none; 
    background: #e8f3ff; /* Highlight on focus */
    color: #1b64da;
}
.name-input {
    font-size: 24px;
    font-weight: 700;
    text-align: center;
    width: 200px;
    margin-bottom: 8px;
}
.field-item.full-width .input {
    text-align: left;
    height: auto;
    width: 100%;
}

/* Password Section */
.password-form .field-group { margin-bottom: 16px; }
.password-form label { display: block; font-size: 14px; color: #6b7684; margin-bottom: 6px; }
.password-form .input {
    text-align: left;
    background: #f2f4f6;
    padding: 14px;
    border-radius: 14px;
    color: #191f28;
    font-weight: 400;
}
.form-actions { margin-top: 24px; }
.btn-warning { width: 100%; }

/* States */
.loading-state, .error-state {
    text-align: center; padding: 80px 20px;
    background: white; border-radius: 24px;
    color: #8b95a1;
}
</style>
