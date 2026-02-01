<template>
  <section>
    <div class="section-title">
      <div>
        <h1>회사 정보 관리</h1>
        <div class="sub">내가 소속된 회사의 정보를 조회하고 관리합니다.</div>
      </div>
    </div>

    <div v-if="loading" class="loading-state">데이터를 불러오는 중...</div>

    <div v-else-if="company" class="company-detail">
      <div class="grid cols-2">
        <!-- Basic Info Card -->
        <BaseCard>
          <div class="card-hd">
            <h2>기본 정보</h2>
          </div>
          <div class="card-bd info-list">
            <div class="info-item">
              <span class="label">회사명</span>
              <span class="value">{{ company.companyName }}</span>
            </div>
            <div class="info-item">
              <span class="label">주소</span>
              <span class="value">{{ company.address || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="label">설립일</span>
              <span class="value">{{ company.foundDate || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="label">사업자 등록번호</span>
              <span class="value">{{ company.bizNo || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="label">대표자명</span>
              <span class="value">{{ company.ceoName || '-' }}</span>
            </div>
             <div class="info-item">
              <span class="label">상태</span>
              <span class="value">
                <span class="badge good" v-if="!company.isDeleted || company.isDeleted === 'N'">
                  <span class="dot"></span> 정상
                </span>
                <span class="badge bad" v-else>
                  <span class="dot"></span> 정지
                </span>
              </span>
            </div>
          </div>
        </BaseCard>

        <!-- System Info Card -->
        <BaseCard>
          <div class="card-hd">
            <h2>시스템 정보</h2>
          </div>
          <div class="card-bd info-list">
            <div class="info-item">
              <span class="label">회사코드</span>
              <span class="value font-mono">{{ company.comCode || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="label">대표 전화</span>
              <span class="value">{{ company.comTel || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="label">이메일</span>
              <span class="value">{{ company.comEmail || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="label">등록일</span>
              <span class="value">{{ company.createdAt || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="label">최근 수정일</span>
              <span class="value">{{ company.updatedAt || '-' }}</span>
            </div>
          </div>
        </BaseCard>
      </div>

      <!-- Action Buttons -->
      <div class="action-footer">
        <button class="btn danger" @click="handleDelete" v-if="!company.isDeleted || company.isDeleted === 'N'">
          삭제하기
        </button>
        <button class="btn primary" @click="openEditModal">
          정보 수정
        </button>
      </div>

    </div>

    <div v-else class="empty-state">
      <i class="pi pi-exclamation-circle"></i>
      <p>회사 정보를 불러올 수 없습니다.</p>
    </div>

    <!-- Edit Modal -->
    <CompanyFormModal 
      v-model="form"
      :show="showModal"
      :submitting="submitting"
      @close="closeModal"
      @submit="handleUpdate"
    />
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import BaseCard from '@/components/common/BaseCard.vue'
import CompanyFormModal from '@/components/company/CompanyFormModal.vue'
import { fetchMyCompany, updateCompany, deleteCompany } from '@/api/companyApi'

const company = ref(null)
const loading = ref(false)
const submitting = ref(false)
const showModal = ref(false)

const form = ref({
  comName: '',
  address: '',
  bizNo: '',
  ceoName: '',
  comEmail: '',
  foundDate: '',
  comTel: '',
  description: ''
})

const loadCompany = async () => {
  loading.value = true
  try {
    const res = await fetchMyCompany()
    company.value = res.data?.data
  } catch (e) {
    console.error('Failed to load company info', e)
  } finally {
    loading.value = false
  }
}

onMounted(loadCompany)

const openEditModal = () => {
  if (!company.value) return
  const detail = company.value
  
  form.value = {
    comName: detail.companyName,
    address: detail.address || '',
    bizNo: detail.bizNo || '',
    ceoName: detail.ceoName || '',
    comEmail: detail.comEmail || '',
    foundDate: detail.foundDate || '',
    comTel: detail.comTel || '',
    description: detail.description || ''
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const handleUpdate = async () => {
  if (!company.value) return
  submitting.value = true
  try {
    await updateCompany(company.value.companyId, form.value)
    alert('회사 정보가 수정되었습니다.')
    closeModal()
    await loadCompany()
  } catch (e) {
    console.error('Update failed', e)
    alert('수정에 실패했습니다.')
  } finally {
    submitting.value = false
  }
}

const handleDelete = async () => {
  if (!confirm('정말 회사를 삭제하시겠습니까? 돌이킬 수 없습니다.')) return
  try {
    await deleteCompany(company.value.companyId)
    alert('회사가 삭제되었습니다.')
    await loadCompany()
  } catch (e) {
    console.error('Delete failed', e)
    alert('삭제에 실패했습니다.')
  }
}
</script>

<style scoped>
.company-detail {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
}
.info-item:last-child {
  border-bottom: none;
}
.label {
  font-size: 13px;
  color: var(--text-sub);
}
.value {
  font-weight: 600;
  color: var(--text-main);
}
.font-mono {
  font-family: var(--font-mono, monospace);
}

.action-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--border);
}

.loading-state, .empty-state {
  text-align: center;
  padding: 80px;
  color: var(--text-muted);
  background: var(--card);
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
}
.empty-state i {
  font-size: 32px;
  margin-bottom: 12px;
}

.grid { display: grid; gap: 24px; }
.cols-2 { grid-template-columns: 1fr 1fr; }
</style>
