<template>
  <section>
    <div class="section-title">
      <div>
        <h1>회사 관리</h1>
        <div class="sub">전체 등록된 회사를 조회하고 정보를 관리합니다.</div>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="toolbar">
      <input 
        type="text" 
        v-model="keyword" 
        placeholder="회사명 검색..." 
        class="input search-input"
        @keyup.enter="loadCompanies"
      />
      <div class="checkbox-group">
        <input type="checkbox" id="includeDeleted" v-model="includeDeleted" @change="loadCompanies" />
        <label for="includeDeleted">삭제된 회사 포함</label>
      </div>
      <button class="btn primary" @click="loadCompanies">검색</button>
    </div>

    <div v-if="loading" class="loading-state">회사 목록을 불러오는 중...</div>
    
    <div v-else class="card">
      <div class="card-bd no-padding">
        <table class="table">
          <thead>
            <tr>
              <th style="width: 100px">회사코드</th>
              <th>회사명</th>
              <th>사업자 번호</th>
              <th>대표 전화</th>
              <th style="width: 100px">상태</th>
              <th style="width: 120px" class="text-right">관리</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="com in companies" :key="com.companyId">
              <td><span class="text-muted font-mono">{{ com.comCode || '-' }}</span></td>
              <td><b class="com-name">{{ com.companyName }}</b></td>
              <td><span class="text-sub">{{ com.bizNo || '-' }}</span></td>
              <td><span class="text-sub">{{ com.comTel || '-' }}</span></td>
              <td>
                <span class="badge good" v-if="!com.isDeleted || com.isDeleted === 'N'">
                  <span class="dot"></span> 정상
                </span>
                <span class="badge bad" v-else>
                  <span class="dot"></span> 삭제됨
                </span>
              </td>
              <td class="text-right">
                <div class="action-btns">
                  <button class="btn-icon" title="수정" @click="openEditModal(com)">
                    <i class="pi pi-pencil"></i>
                  </button>
                  <button 
                    class="btn-icon danger" 
                    title="삭제" 
                    @click="handleDelete(com.companyId)"
                    v-if="!com.isDeleted || com.isDeleted === 'N'"
                  >
                    <i class="pi pi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="companies.length === 0">
              <td colspan="7" class="text-center py-12">
                <div class="empty-msg">등록된 회사가 없습니다.</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
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
.toolbar {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}
.search-input { width: 300px; }
.checkbox-group {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-sub);
}
.checkbox-group label { cursor: pointer; }

.no-padding { padding: 0 !important; }
.com-name { color: var(--text-main); }
.text-muted { color: var(--text-muted); }
.text-sub { color: var(--text-sub); font-size: 13px; }
.text-right { text-align: right; }
.text-center { text-align: center; }
.py-12 { padding: 60px 0; }
.empty-msg { color: var(--text-muted); }

.action-btns {
  display: flex;
  justify-content: flex-end;
  gap: 6px;
}
.btn-icon {
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: rgba(255,255,255,.03);
  color: var(--text-sub);
  cursor: pointer;
  transition: var(--transition-fast);
}
.btn-icon:hover {
  background: rgba(255,255,255,.08);
  color: var(--text-main);
  border-color: var(--primary);
}
.btn-icon.danger:hover {
  background: rgba(251,113,133,.1);
  color: var(--bad);
  border-color: var(--bad);
}

.loading-state {
  text-align: center;
  padding: 80px;
  color: var(--text-muted);
  background: var(--card);
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
}
</style>
