<template>
  <section class="attendance-ip-policy-view">
    <!-- 헤더 -->
    <div class="section-header">
      <div class="title-group">
        <h1>IP 정책 관리</h1>
        <div class="sub">근태 관리 시 허용되는 IP 주소를 관리합니다.</div>
      </div>
      <div class="header-actions">
        <button class="btn primary" @click="openPolicyModal()">+ IP 정책 추가</button>
      </div>
    </div>

    <!-- IP 정책 목록 테이블 -->
    <div class="policy-table-container">
      <table class="policy-table">
        <thead>
          <tr>
            <th>IP 주소/범위</th>
            <th>설명</th>
            <th>상태</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="4" class="no-results">IP 정책을 불러오는 중...</td>
          </tr>
          <tr v-else-if="!loading && ipPolicies.length === 0">
            <td colspan="4" class="no-results">등록된 IP 정책이 없습니다.</td>
          </tr>
          <template v-else>
            <tr v-for="policy in ipPolicies" :key="policy.ipPolicyId">
              <td>{{ policy.cidr }}</td>
              <td>{{ policy.locationName }}</td>
              <td>
                <span :class="['status-badge', policy.isActive  ? 'active' : 'inactive']">
                  {{ policy.isActive  ? '활성화' : '비활성화' }}
                </span>
              </td>
              <td>
                <button class="btn-sm secondary" @click="openPolicyModal(policy)">수정</button>
                <button class="btn-sm danger" @click="deletePolicy(policy.ipId)">삭제</button>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <!-- IP 정책 추가/수정 모달 -->
    <div v-if="isModalOpen" class="modal-overlay">
      <div class="modal-content">
        <h3>{{ isEditMode ? 'IP 정책 수정' : 'IP 정책 추가' }}</h3>
        <form @submit.prevent="savePolicy">
          <div class="form-group">
            <label for="ipAddress">IP 주소/범위</label>
            <input type="text" id="ipAddress" v-model="formPolicy.ipAddress" required />
          </div>
          <div class="form-group">
            <label for="description">설명</label>
            <textarea id="description" v-model="formPolicy.description"></textarea>
          </div>
          <div class="form-group">
            <label for="enabled">상태</label>
            <input type="checkbox" id="enabled" v-model="formPolicy.enabled" /> 활성화
          </div>
          <div class="modal-actions">
            <button type="button" class="btn" @click="closePolicyModal">취소</button>
            <button type="submit" class="btn primary">{{ isEditMode ? '저장' : '추가' }}</button>
          </div>
        </form>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import {
  fetchIpPolicies,
  createIpPolicy,
  updateIpPolicy,
  deleteIpPolicy as apiDeletePolicy
} from '@/api/attendanceApi'

/* =========================
   기본 상태
========================= */
const auth = useAuthStore()
const companyId = computed(() => auth.user?.companyId)

const ipPolicies = ref([])
const loading = ref(false)

const isModalOpen = ref(false)
const selectedPolicy = ref(null)

/* ⭐ 핵심: id 반드시 포함 */
const formPolicy = ref({
  id: null,
  ipAddress: '',
  description: '',
  enabled: true,
  ipPolicyType: 'ATTENDANCE'
})

const isEditMode = computed(() => !!formPolicy.value.id)

/* =========================
   목록 조회
========================= */
const loadPolicies = async () => {
  if (!companyId.value) return

  loading.value = true
  try {
    const res = await fetchIpPolicies(companyId.value)
    ipPolicies.value = res.data ?? []
  } finally {
    loading.value = false
  }
}

onMounted(loadPolicies)

/* =========================
   모달 제어
========================= */
const openPolicyModal = (policy = null) => {
  if (policy) {
    selectedPolicy.value = { ...policy }
    formPolicy.value = {
      id: policy.ipId,
      ipAddress: policy.cidr,
      description: policy.locationName,
      enabled: policy.isActive,
      ipPolicyType: policy.ipPolicyType
    }
  } else {
    formPolicy.value = {
      id: null,
      ipAddress: '',
      description: '',
      enabled: true,
      ipPolicyType: 'ATTENDANCE'
    }
  }
  isModalOpen.value = true
}

const closePolicyModal = () => {
  isModalOpen.value = false
  selectedPolicy.value = null
}

/* =========================
   저장 (추가 / 수정)
========================= */
const savePolicy = async () => {
  if (isEditMode.value) {
    await updateIpPolicy(formPolicy.value.id, {
      cidr: formPolicy.value.ipAddress,
      locationName: formPolicy.value.description,
      ipPolicyType: formPolicy.value.ipPolicyType
    })
  } else {
    await createIpPolicy({
      comId: companyId.value,
      cidr: formPolicy.value.ipAddress,
      locationName: formPolicy.value.description,
      ipPolicyType: 'ATTENDANCE'
    })
  }

  closePolicyModal()
  console.log('before', ipPolicies.value)
  await loadPolicies()
  console.log('after', ipPolicies.value)
}

/* =========================
   삭제
========================= */
const deletePolicy = async (ipId) => {
  if (!confirm('정말 삭제하시겠습니까?')) return

  await apiDeletePolicy(ipId)

  // ⭐ 이 한 줄
  ipPolicies.value = ipPolicies.value.filter(p => p.ipId !== ipId)
}
</script>

<style scoped>
.attendance-ip-policy-view {
  padding: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.title-group h1 {
  font-size: 20px;
  font-weight: 700;
  margin: 0;
}

.title-group .sub {
  font-size: 14px;
  color: #6b7280;
  margin-top: 4px;
}

.header-actions .btn.primary {
  background-color: #2563eb;
  color: #fff;
  border-color: #2563eb;
}

.policy-table-container {
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 20px;
  flex-grow: 1;
  overflow: auto;
}

.policy-table {
  width: 100%;
  border-collapse: collapse;
}

.policy-table th, .policy-table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #f3f4f6;
  font-size: 13px;
  color: #374151;
}

.policy-table th {
  background-color: #f9fafb;
  font-weight: 600;
  color: #4b5563;
}

.policy-table tbody tr:last-child td {
  border-bottom: none;
}

.no-results {
  text-align: center;
  padding: 50px 20px;
  font-size: 14px;
  color: #9ca3af;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
}
.status-badge.active {
  background-color: #d1fae5;
  color: #065f46;
}
.status-badge.inactive {
  background-color: #fee2e2;
  color: #991b1b;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  background-color: #ffffff;
  cursor: pointer;
  margin-right: 8px;
}
.btn-sm.secondary {
  background-color: #f3f4f6;
}
.btn-sm.danger {
  background-color: #ef4444;
  color: #fff;
  border-color: #ef4444;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: #ffffff;
  padding: 30px;
  border-radius: 14px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.modal-content h3 {
  font-size: 18px;
  font-weight: 700;
  margin-top: 0;
  margin-bottom: 20px;
  color: #111827;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
}

.form-group input[type="text"],
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  font-size: 13px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
}

.form-group textarea {
  min-height: 80px;
  resize: vertical;
}

.form-group input[type="checkbox"] {
  margin-right: 8px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 25px;
}

.btn {
  padding: 8px 16px;
  font-size: 13px;
  border-radius: 10px;
  border: 1px solid #d1d5db;
  background-color: #ffffff;
  cursor: pointer;
}
.btn.primary {
  background-color: #2563eb;
  color: #ffffff;
  border-color: #2563eb;
}
</style>
