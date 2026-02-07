<template>
  <div class="page-container">
    <div class="page-header">
      <h1>권한(기능) 레지스트리 목록</h1>
      <p class="subtitle">시스템 전체의 권한(화면/기능 단위)을 등록하고 관리합니다. (플랫폼 관리자 전용)</p>
    </div>

    <div class="actions-bar">
      <button class="btn-primary" @click="openCreateModal">
        새 권한 등록
      </button>
    </div>

    <div class="card table-card">
      <table class="data-table">
        <thead>
          <tr>
            <th class="text-center" width="80">ID</th>
            <th>권한 키 (Key)</th>
            <th>권한 명 (Name)</th>
            <th>경로 (Route Path)</th>
            <th>설명</th>
            <th class="text-center" width="150">관리</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading && permissions.length === 0">
            <td colspan="6">
              <div class="loading-spinner"></div>
            </td>
          </tr>
          <tr v-else v-for="perm in permissions" :key="perm.permId" class="clickable-row" @click="openEditModal(perm)">
            <td class="text-center">{{ perm.permId }}</td>
            <td>{{ perm.permKey }}</td>
            <td>{{ perm.name }}</td>
            <td>{{ perm.routePath || '-' }}</td>
            <td>{{ perm.description || '-' }}</td>
            <td class="text-center">
              <button class="btn-text edit" @click.stop="openEditModal(perm)">수정</button>
              <button class="btn-text delete" @click.stop="confirmDelete(perm)">삭제</button>
            </td>
          </tr>
          <tr v-if="!loading && permissions.length === 0">
            <td colspan="6" class="empty-message">등록된 권한이 없습니다.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Main Modal -->
    <div v-if="showModal" class="modal-backdrop" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ isEditMode ? '권한 정보 수정' : '새 권한 등록' }}</h3>
          <button class="btn-close" @click="closeModal">✕</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitForm">
            <div class="form-group" v-if="!isEditMode">
              <div class="label-row">
                <label>권한 키 (Key) <span class="required">*</span></label>
                <span class="char-count">{{ form.permKey.length }}/100</span>
              </div>
              <input type="text" v-model="form.permKey" maxlength="100" placeholder="예: USER_READ" required />
              <small>시스템에서 사용하는 고유 식별 키입니다. 저장 후 변경 불가능합니다.</small>
            </div>

            <div class="form-group">
              <div class="label-row">
                <label>권한 명 (Name) <span class="required">*</span></label>
                <span class="char-count">{{ form.name.length }}/255</span>
              </div>
              <input type="text" v-model="form.name" maxlength="255" placeholder="예: 사용자 조회" required />
            </div>

            <div class="form-group">
              <div class="label-row">
                <label>경로 (Route Path) <span class="required">*</span></label>
                <span class="char-count">{{ form.routePath.length }}/255</span>
              </div>
              <input type="text" v-model="form.routePath" maxlength="255" placeholder="예: /users" required />
            </div>

            <div class="form-group">
              <div class="label-row">
                <label>설명</label>
                <span class="char-count">{{ form.description.length }}/255</span>
              </div>
              <textarea v-model="form.description" maxlength="255" rows="3"></textarea>
            </div>
            
            <div class="modal-footer">
              <button type="button" class="btn-secondary" @click="closeModal">취소</button>
              <button type="submit" class="btn-primary" :disabled="loading">
                {{ loading ? '저장 중...' : '저장' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { getPermissions, createPermission, updatePermission, deletePermission } from '@/api/permissionApi'

const permissions = ref([])
const showModal = ref(false)
const isEditMode = ref(false)
const loading = ref(false)

const form = reactive({
    permId: null,
    permKey: '',
    name: '',
    routePath: '',
    description: ''
})

const loadPermissions = async () => {
    try {
        const res = await getPermissions()
        permissions.value = res.data?.data || []
    } catch (e) {
        console.error(e)
        alert('권한 목록을 불러오지 못했습니다.')
    }
}

const openCreateModal = () => {
    isEditMode.value = false
    resetForm()
    showModal.value = true
}

const openEditModal = (perm) => {
    // alert('Open modal for: ' + perm.name) // 디버깅용
    isEditMode.value = true
    form.permId = perm.permId
    form.permKey = perm.permKey
    form.name = perm.name
    form.routePath = perm.routePath
    form.description = perm.description
    showModal.value = true
}

const closeModal = () => {
    showModal.value = false
    resetForm()
}

const resetForm = () => {
    form.permId = null
    form.permKey = ''
    form.name = ''
    form.routePath = ''
    form.description = ''
}

const submitForm = async () => {
    loading.value = true
    try {
        if (isEditMode.value) {
            await updatePermission(form.permId, {
                name: form.name,
                routePath: form.routePath,
                description: form.description
            })
            alert('수정되었습니다.')
        } else {
            await createPermission({
                permKey: form.permKey,
                name: form.name,
                routePath: form.routePath,
                description: form.description
            })
            alert('등록되었습니다.')
        }
        await loadPermissions()
        closeModal()
    } catch (e) {
        console.error(e)
        const msg = e.response?.data?.message || '처리 중 오류가 발생했습니다.'
        alert(msg)
    } finally {
        loading.value = false
    }
}

const confirmDelete = async (perm) => {
    if(!confirm(`정말 '${perm.name}' 권한을 삭제하시겠습니까?`)) return
    
    try {
        await deletePermission(perm.permId)
        alert('삭제되었습니다.')
        loadPermissions()
    } catch (e) {
        console.error(e)
        alert('삭제 실패: ' + (e.response?.data?.message || '오류 발생'))
    }
}

onMounted(loadPermissions)
</script>

<style scoped>
.page-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 32px 20px;
}
.page-header { margin-bottom: 24px; }
.page-header h1 { font-size: 24px; font-weight: 700; color: #1e293b; margin-bottom: 8px; }
.subtitle { color: #64748b; margin: 0; font-size: 14px; }

.actions-bar { margin-bottom: 16px; display: flex; justify-content: flex-end; }

.card {
    background: white; border-radius: 12px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
    overflow: hidden;
}

.data-table { width: 100%; border-collapse: collapse; }
.data-table th {
    background: #f8fafc; padding: 12px 16px; text-align: left;
    font-size: 13px; font-weight: 600; color: #475569;
    border-bottom: 1px solid #e2e8f0;
}

.text-center { text-align: center !important; }
.data-table td {
    padding: 14px 16px; border-bottom: 1px solid #f1f5f9;
    font-size: 14px; color: #334155;
    vertical-align: middle;
}
.clickable-row:hover {
    background: #f8fafc;
}
.clickable-row {
    cursor: pointer;
    position: relative;
    z-index: 5;
}
@keyframes spin { 100% { transform: rotate(360deg); } }
.loading-spinner {
    width: 32px; height: 32px; margin: 40px auto;
    border: 3px solid #e2e8f0; border-top-color: #3b82f6;
    border-radius: 50%; animation: spin 0.8s linear infinite;
}

.btn-primary {
    background: #3b82f6; color: white; border: none; padding: 10px 20px;
    border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px;
    transition: background 0.2s;
}
.btn-primary:hover { background: #2563eb; }
.btn-primary:disabled { background: #94a3b8; cursor: not-allowed; }

.btn-secondary {
    background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; padding: 10px 20px;
    border-radius: 8px; font-weight: 600; cursor: pointer; margin-right: 8px;
}
.btn-secondary:hover { background: #e2e8f0; }

.btn-text {
    padding: 6px 12px; border-radius: 6px; border: 1px solid #e2e8f0;
    background: white; cursor: pointer; font-size: 13px; font-weight: 500;
    margin-right: 6px; color: #475569;
}
.btn-text:hover { background: #f8fafc; border-color: #cbd5e1; }
.btn-text.edit { color: #2563eb; border-color: #dbeafe; background: #eff6ff; }
.btn-text.edit:hover { background: #dbeafe; }
.btn-text.delete { color: #ef4444; border-color: #fee2e2; background: #fef2f2; }
.btn-text.delete:hover { background: #fee2e2; }

.empty-message { text-align: center; padding: 40px; color: #94a3b8; }

/* Modal */
.modal-backdrop {
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.5); z-index: 10000;
    display: flex; justify-content: center; align-items: center;
    backdrop-filter: blur(4px);
}
.modal-content {
    background: white; width: 500px; max-width: 90vw;
    border-radius: 16px; overflow: hidden;
    box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
}
.modal-header {
    padding: 20px 24px; border-bottom: 1px solid #e2e8f0;
    display: flex; justify-content: space-between; align-items: center;
    background: #f8fafc;
}
.modal-header h3 { margin: 0; font-size: 18px; font-weight: 700; color: #1e293b; }
.btn-close { background: none; border: none; font-size: 20px; color: #94a3b8; cursor: pointer; padding: 0; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 50%; transition: background 0.2s; }
.btn-close:hover { background: #e2e8f0; color: #475569; }

.modal-body { padding: 24px; }
.form-group { margin-bottom: 20px; }
.label-row { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 6px; }
.form-group label { display: block; font-size: 14px; font-weight: 600; color: #475569; margin: 0; }
.char-count { font-size: 11px; color: #94a3b8; font-weight: 400; }
.form-group input, .form-group textarea {
    width: 100%; padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 8px;
    font-size: 14px; transition: border-color 0.2s;
}
.form-group textarea {
    resize: none;
    min-height: 100px;
}
.form-group input:focus, .form-group textarea:focus { outline: none; border-color: #3b82f6; ring: 2px solid #eff6ff; }
.form-group small { display: block; margin-top: 4px; color: #94a3b8; font-size: 12px; }
.required { color: #ef4444; }

.modal-footer { display: flex; justify-content: flex-end; margin-top: 32px; }
</style>
