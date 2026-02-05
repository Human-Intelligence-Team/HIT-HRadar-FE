<template>
  <section class="page">
    <div class="page-header">
      <h1>휴가 정책 관리</h1>
    </div>

    <div class="content">
      <!-- 정책 목록 -->
      <div class="policy-list-card">
        <h2>등록된 휴가 정책</h2>
        <div class="policy-list-header">
            <span>정책명</span>
            <span>상세 내용</span>
        </div>
        <ul v-if="policies.length > 0" class="policy-list">
          <li v-for="policy in policies" :key="policy.policyId" class="policy-item">
            <div class="policy-name">{{ policy.typeName }}</div>
            <div class="policy-details">
              유형: {{ policy.typeCode }} | 단위: {{ policy.unitCode }} ({{ policy.unitDays }}일)
            </div>
          </li>
        </ul>
        <div v-else class="no-policies">
          등록된 휴가 정책이 없습니다.
        </div>
      </div>

      <!-- 새 정책 생성 -->
      <div class="create-policy-card">
        <h2>새 휴가 정책 생성</h2>
        <form @submit.prevent="handleCreatePolicy" class="policy-form">
          <div class="form-grid">
            <div class="form-field">
              <label for="typeName">정책명</label>
              <input type="text" id="typeName" v-model="newPolicy.typeName" required placeholder="예: 연차, 병가">
            </div>
            <div class="form-field">
              <label for="typeCode">정책 유형 코드</label>
              <input type="text" id="typeCode" v-model="newPolicy.typeCode" required placeholder="예: ANNUAL, SICK">
            </div>
            <div class="form-field">
              <label for="unitCode">차감 단위 코드</label>
              <select id="unitCode" v-model="newPolicy.unitCode" required>
                <option value="">선택</option>
                <option value="FULL">일차</option>
                <option value="HALF_AM">오전반차</option>
                <option value="HALF_PM">오후반차</option>
              </select>
            </div>
            <div class="form-field">
              <label for="unitDays">차감 일수</label>
              <input type="number" id="unitDays" v-model.number="newPolicy.unitDays" required step="0.1" min="0">
            </div>
          </div>
          <button type="submit" class="btn-primary">생성</button>
        </form>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { getLeavePolicies, createLeavePolicy } from '@/api/leaveApi'

const authStore = useAuthStore()
const policies = ref([])
const newPolicy = ref({
  typeName: '',
  typeCode: '',
  unitCode: '',
  unitDays: 1,
})

const loadPolicies = async () => {
  if (!authStore.user?.companyId) return; // ✅ 수정: user 객체 내에서 가져오기

  try {
    const response = await getLeavePolicies(authStore.user.companyId)
    policies.value = response.data.data || []
  } catch (error) {
    console.error('휴가 정책을 불러오는 중 오류 발생:', error)
    alert('휴가 정책을 불러오는 데 실패했습니다.')
  }
}

onMounted(loadPolicies)

const handleCreatePolicy = async () => {
  if (!newPolicy.value.typeName || !newPolicy.value.typeCode || !newPolicy.value.unitCode) {
    alert('모든 필드를 입력해주세요.')
    return
  }

  try {
    await createLeavePolicy({
      ...newPolicy.value,
      companyId: authStore.user.companyId
    })
    alert('새로운 휴가 정책이 생성되었습니다.')

    newPolicy.value = {
      typeName: '',
      typeCode: '',
      unitCode: '',
      unitDays: 1,
    }

    await loadPolicies() // 목록 새로고침
  } catch (error) {
    console.error('휴가 정책 생성 중 오류 발생:', error)
    const message = error.response?.data?.message || '휴가 정책 생성에 실패했습니다.'
    alert(message)
  }
}
</script>

<style scoped>
.page {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.page-header p {
  font-size: 1rem;
  color: #6b7280;
}

.content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.content.single-column {
  grid-template-columns: 1fr;
  max-width: 800px;
  margin: 0 auto;
}

.policy-list-card,
.create-policy-card {
  background: #fff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}

h2 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 0.75rem;
}

.policy-list-header {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background-color: #f9fafb;
  border-bottom: 2px solid #e5e7eb;
  font-weight: 700;
  color: #374151;
  font-size: 0.9rem;
}

.policy-list {
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 400px;
  overflow-y: auto;
}

.policy-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.policy-item:not(:last-child) {
    border-bottom: 1px solid #f3f4f6;
}

.policy-item:hover {
  background-color: #f9fafb;
}

.policy-name {
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0; /* Remove bottom margin */
  flex-shrink: 0;
  margin-right: 1rem;
}

.policy-details {
  font-size: 0.875rem;
  color: #6b7280;
  text-align: right; /* Right align the details */
}

.no-policies {
  text-align: center;
  padding: 2rem;
  color: #9ca3af;
}

.policy-form {
  display: flex;
  flex-direction: column;
}

.form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
}

.form-field {
  display: flex;
  flex-direction: column;
}

.form-field label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.form-field input,
.form-field select {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-field input:focus,
.form-field select:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.btn-primary {
  align-self: flex-end;
  padding: 0.75rem 1.5rem;
  background-color: #4f46e5;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-primary:hover {
  background-color: #4338ca;
}
</style>
