<template>
  <section class="wide-container">
    <div class="section-title">
      <div>
        <h1>회사 관리</h1>
        <div class="sub">전체 등록된 회사를 조회하고 상세 정보를 통합 관리합니다.</div>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="toolbar">
      <div class="search-box">
        <input 
          type="text" 
          v-model="keyword" 
          placeholder="회사명 검색..." 
          class="input search-input"
          @keyup.enter="loadCompanies"
        />
        <button class="btn primary" @click="loadCompanies">검색</button>
      </div>

      <div class="toolbar-right">
        <label class="checkbox-container">
          <input type="checkbox" v-model="includeDeleted" @change="loadCompanies" />
          <div class="check-ui"></div>
          <span class="label-text">삭제된 회사 포함</span>
        </label>
      </div>
    </div>

    <div v-if="loading" class="loading-state">회사 목록을 불러오는 중...</div>
    
    <div v-else class="table-container">
      <table class="modern-table">
        <thead>
          <tr>
            <th width="120">회사코드</th>
            <th>회사명</th>
            <th>사업자 번호</th>
            <th>대표 전화</th>
            <th width="100">상태</th>
            <th width="140">관리</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="com in companies" :key="com.companyId" class="hover-row">
            <td class="text-center">
              <span class="code-badge">{{ com.comCode || '-' }}</span>
            </td>
            <td>
              <div class="com-info-cell">
                <span class="com-name-text">{{ com.companyName }}</span>
              </div>
            </td>
            <td class="text-center">
              <span class="biz-no">{{ com.bizNo || '-' }}</span>
            </td>
            <td class="text-center">
              <span class="tel-no">{{ com.comTel || '-' }}</span>
            </td>
            <td class="text-center">
              <span class="status-badge" :class="(!com.isDeleted || com.isDeleted === 'N') ? 'good' : 'bad'">
                {{ (!com.isDeleted || com.isDeleted === 'N') ? '정상' : '삭제됨' }}
              </span>
            </td>
            <td class="text-center">
              <div class="action-buttons centered">
                <button class="btn-action edit" @click="openEditModal(com)">
                  <span>수정</span>
                </button>
                <button 
                  v-if="!com.isDeleted || com.isDeleted === 'N'"
                  class="btn-action delete" 
                  @click="handleDelete(com.companyId)"
                >
                  <span>삭제</span>
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="companies.length === 0">
            <td colspan="6" class="empty-cell">
              <div class="empty-state">
                <i class="pi pi-inbox"></i>
                <p>등록된 회사가 없습니다.</p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
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
import CompanyFormModal from '@/components/company/CompanyFormModal.vue'
import { 
  fetchCompanies, 
  fetchCompanyDetail, 
  updateCompany, 
  deleteCompany 
} from '@/api/companyApi'

const companies = ref([])
const loading = ref(false)
const submitting = ref(false)
const showModal = ref(false)
const keyword = ref('')
const includeDeleted = ref(false)

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
const currentTargetId = ref(null)

const loadCompanies = async () => {
  loading.value = true
  try {
    const res = await fetchCompanies({ 
      keyword: keyword.value,
      includeDeleted: includeDeleted.value 
    })
    companies.value = res.data?.data || []
  } catch (e) {
    console.error('Failed to load companies', e)
  } finally {
    loading.value = false
  }
}

onMounted(loadCompanies)

const openEditModal = async (com) => {
  currentTargetId.value = com.companyId
  try {
    const res = await fetchCompanyDetail(com.companyId)
    const detail = res.data?.data
    form.value = {
      comName: detail.companyName, // Backend returns 'companyName', Frontend Model wants 'comName'
      address: detail.address || '',
      bizNo: detail.bizNo || '',
      ceoName: detail.ceoName || '',
      comEmail: detail.comEmail || '',
      foundDate: detail.foundDate || '',
      comTel: detail.comTel || '',
      description: detail.description || ''
    }
    showModal.value = true
  } catch (e) {
    console.error('Failed to load company detail', e)
    alert('회사 정보를 불러오지 못했습니다.')
  }
}

const closeModal = () => {
  showModal.value = false
}

const handleUpdate = async () => {
  submitting.value = true
  try {
    await updateCompany(currentTargetId.value, form.value)
    alert('회사 정보가 수정되었습니다.')
    closeModal()
    await loadCompanies()
  } catch (e) {
    console.error('Update failed', e)
    alert('수정에 실패했습니다.')
  } finally {
    submitting.value = false
  }
}

const handleDelete = async (id) => {
  if (!confirm('정말 이 회사를 삭제하시겠습니까? 관련 데이터가 모두 삭제될 수 있습니다.')) return
  try {
    await deleteCompany(id)
    alert('회사가 삭제되었습니다.')
    await loadCompanies()
  } catch (e) {
    console.error('Delete failed', e)
    alert('삭제에 실패했습니다.')
  }
}
</script>

<style scoped>
.wide-container {
  max-width: 1200px;
  margin: 0 auto;
  padding-bottom: 40px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-box {
  display: flex;
  gap: 8px;
}
.search-input { width: 300px; }

.toolbar-right {
  display: flex;
  align-items: center;
}

/* Custom Checkbox */
.checkbox-container {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}
.checkbox-container input { display: none; }
.check-ui {
  width: 18px;
  height: 18px;
  border: 2px solid #cbd5e1;
  border-radius: 5px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.checkbox-container input:checked + .check-ui {
  background: #3b82f6;
  border-color: #3b82f6;
}
.check-ui::after {
  content: "";
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
  display: none;
  margin-bottom: 2px;
}
.checkbox-container input:checked + .check-ui::after {
  display: block;
}
.label-text {
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
}

/* Table Design */
.table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.modern-table {
  width: 100%;
  border-collapse: collapse;
}

.modern-table th {
  padding: 14px 16px;
  background: #f8fafc;
  color: #64748b;
  font-size: 13px;
  font-weight: 600;
  border-bottom: 1px solid #e2e8f0;
  text-align: center;
}

.modern-table td {
  padding: 16px;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
  font-size: 14px;
}

.hover-row:hover {
  background: #f8fafc;
}

.code-badge {
  background: #f1f5f9;
  color: #475569;
  padding: 4px 8px;
  border-radius: 6px;
  font-family: var(--font-mono, monospace);
  font-size: 12px;
  font-weight: 600;
}

.com-name-text {
  font-weight: 700;
  color: #1e293b;
}

.status-badge {
  font-size: 12px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 6px;
  display: inline-flex;
}
.status-badge.good { background: #dcfce7; color: #15803d; }
.status-badge.bad { background: #fee2e2; color: #b91c1c; }

.btn-action {
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid transparent;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-action.edit { color: #3b82f6; background: #eff6ff; }
.btn-action.delete { color: #ef4444; background: #fef2f2; }
.btn-action:hover { filter: brightness(0.95); }

.centered { justify-content: center; }
.text-center { text-align: center; }

.empty-cell { padding: 80px 0; }
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #94a3b8;
}
.empty-state i { font-size: 40px; opacity: 0.3; margin-bottom: 12px; }

.loading-state {
  text-align: center;
  padding: 80px;
  color: var(--text-muted);
  background: var(--card);
  border-radius: 12px;
  border: 1px solid var(--border);
}
</style>
