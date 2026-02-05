<template>
  <div class="page-container">
    <div class="page-header">
      <h1>역할 및 권한 관리</h1>
      <p class="subtitle">우리 회사에 필요한 역할을 정의하고, 각 역할별 권한을 설정합니다.</p>
    </div>

    <div class="layout-container">
      <!-- Role List -->
      <div class="role-list-card card">
        <div class="card-header">
          <h2>역할 목록</h2>
          <button class="btn-sm primary" @click="startCreate">
            <i class="pi pi-plus"></i> 추가
          </button>
        </div>
        <ul class="role-list">
          <li 
            v-for="role in roles" 
            :key="role.roleId" 
            :class="{ active: selectedRole?.roleId === role.roleId, system: role.isSystem === 'Y' }"
            @click="selectRole(role)"
          >
            <div class="role-info">
              <span class="role-name">{{ role.name }}</span>
              <span v-if="role.isSystem === 'Y'" class="badge system">기본</span>
            </div>
            <div class="role-actions" v-if="role.isSystem === 'N'">
               <!-- 커스텀 역할 액션 (예: 삭제 등)은 호버 시 표시할 수 있으나, 현재는 상세 뷰에서 수정/삭제를 처리함 -->
            </div>
          </li>
        </ul>
      </div>

      <!-- Detail / Edit Area -->
      <div class="role-detail-card card" v-if="selectedRole || isCreating">
        <div class="card-header">
          <h2>{{ isCreating ? '새 역할 생성' : '역할 상세 정보' }}</h2>
          <div class="actions" v-if="!isCreating && selectedRole?.isSystem === 'N'">
             <button class="btn-sm danger" @click="confirmDelete">삭제</button>
          </div>
        </div>

        <div class="detail-body">
          <div class="form-group">
            <label>역할 명 <span class="required">*</span></label>
            <input 
              type="text" 
              v-model="form.name" 
              placeholder="역할 이름을 입력하세요"
              :disabled="!isCreating && selectedRole?.isSystem === 'Y'"
            />
          </div>

          <div class="permissions-section">
            <label>권한 설정</label>
            <p class="hint" v-if="selectedRole?.isSystem === 'Y'">
              <i class="pi pi-info-circle"></i> 기본 역할(System Role)은 시스템에 고정된 역할로, 수정하거나 삭제할 수 없습니다.
            </p>
            
            <div class="perm-grid" :class="{ disabled: !isCreating && selectedRole?.isSystem === 'Y' }">
              <div 
                v-for="perm in allPermissions" 
                :key="perm.permId" 
                class="perm-item"
              >
                <label class="checkbox-label">
                  <input 
                    type="checkbox" 
                    :value="perm.permId" 
                    v-model="form.permIds"
                    :disabled="!isCreating && selectedRole?.isSystem === 'Y'"
                  />
                  <span class="check-text">
                    <span class="perm-name">{{ perm.name }}</span>
                    <span class="perm-desc">{{ perm.description }}</span>
                  </span>
                </label>
              </div>
            </div>
          </div>
          
          <div class="form-actions">
            <button class="btn-primary" @click="saveRole" :disabled="loading || (!isCreating && selectedRole?.isSystem === 'Y')">
              {{ loading ? '저장 중...' : '저장' }}
            </button>
            <button class="btn-secondary" @click="cancelEdit" v-if="isCreating">취소</button>
          </div>
        </div>
      </div>
      
      <div class="role-detail-card card empty" v-else>
        <div class="empty-state">
          <i class="pi pi-shield"></i>
          <p>좌측 목록에서 역할을 선택하거나 '추가' 버튼을 눌러 새 역할을 만드세요.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, watch } from 'vue'
import { getRoles, createRole, updateRole, deleteRole } from '@/api/roleApi'
import { getPermissions } from '@/api/permissionApi'

const roles = ref([])
const allPermissions = ref([])
const selectedRole = ref(null)
const isCreating = ref(false)
const loading = ref(false)

const form = reactive({
    name: '',
    permIds: []
})

const loadData = async () => {
    try {
        const [roleRes, permRes] = await Promise.all([
            getRoles(),
            getPermissions()
        ])
        roles.value = roleRes.data?.data || []
        allPermissions.value = permRes.data?.data || []
    } catch (e) {
        console.error(e)
        alert('데이터를 불러오는 중 오류가 발생했습니다.')
    }
}

const selectRole = (role) => {
    isCreating.value = false
    selectedRole.value = role
    
    form.name = role.name
    // 백엔드는 역할 조회 시 권한 정보를 반환하지 않을 수 있음.
    // 만약 `GET /roles` 응답에 `permissions` 필드가 포함되어 있다고 가정함.
    // 포함되지 않는다면 별도의 상세 조회 API 호출이 필요할 수 있음.
    // 현재는 role.permissions = [{permId: 1, ...}, ...] 형태로 가정하고 매핑 수행.
    form.permIds = role.permissions ? role.permissions.map(p => p.permId) : []
}

const startCreate = () => {
    selectedRole.value = null
    isCreating.value = true
    form.name = ''
    form.permIds = []
}

const cancelEdit = () => {
    isCreating.value = false
    selectedRole.value = null
}

const saveRole = async () => {
    if (!form.name.trim()) {
        alert('역할 명을 입력해주세요.')
        return
    }

    loading.value = true
    try {
        if (isCreating.value) {
            await createRole({
                name: form.name,
                permIds: form.permIds
            })
            alert('생성되었습니다.')
        } else {
            await updateRole(selectedRole.value.roleId, {
                name: form.name,
                permIds: form.permIds
            })
            alert('수정되었습니다.')
        }
        await loadData()
        // Reselect or reset
        if (isCreating.value) {
           isCreating.value = false
        } else {
           // Refresh selected role permissions
           const updated = roles.value.find(r => r.roleId === selectedRole.value.roleId)
           if(updated) selectRole(updated)
        }
    } catch (e) {
        console.error(e)
        alert('저장 실패: ' + (e.response?.data?.message || '오류 발생'))
    } finally {
        loading.value = false
    }
}

const confirmDelete = async () => {
    if(!selectedRole.value) return
    if(!confirm(`'${selectedRole.value.name}' 역할을 삭제하시겠습니까?`)) return

    try {
        await deleteRole(selectedRole.value.roleId)
        alert('삭제되었습니다.')
        selectedRole.value = null
        await loadData()
    } catch (e) {
        console.error(e)
        alert('삭제 실패: ' + (e.response?.data?.message || '오류 발생'))
    }
}

onMounted(loadData)
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

.layout-container {
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 24px;
    align-items: start;
}

.card {
    background: white; border-radius: 12px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
    display: flex; flex-direction: column;
    overflow: hidden;
}

.role-list-card { min-height: 400px; }
.role-detail-card { min-height: 400px; }

.card-header {
    padding: 16px 20px; border-bottom: 1px solid #e2e8f0;
    display: flex; justify-content: space-between; align-items: center;
    background: #f8fafc;
}
.card-header h2 { margin: 0; font-size: 16px; font-weight: 700; color: #334155; }

.role-list { list-style: none; padding: 0; margin: 0; }
.role-list li {
    padding: 14px 20px; border-bottom: 1px solid #f1f5f9;
    cursor: pointer; transition: background 0.2s;
    display: flex; justify-content: space-between; align-items: center;
}
.role-list li:hover { background: #f8fafc; }
.role-list li.active { background: #eff6ff; border-left: 3px solid #3b82f6; }

.role-name { font-weight: 500; color: #1e293b; font-size: 14px; }
.badge.system {
    background: #e2e8f0; color: #64748b; font-size: 11px; padding: 2px 6px;
    border-radius: 4px; font-weight: 600;
}

.detail-body { padding: 24px; }

.form-group { margin-bottom: 24px; }
.form-group label { display: block; font-size: 14px; font-weight: 600; color: #475569; margin-bottom: 8px; }
.form-group input {
    width: 100%; padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 8px;
    font-size: 14px;
}
.form-group input:disabled { background: #f1f5f9; color: #94a3b8; }

.permissions-section label { margin-bottom: 12px; }
.hint { font-size: 13px; color: #64748b; margin-bottom: 12px; display: flex; align-items: center; gap: 6px; }

.perm-grid {
    display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;
    max-height: 400px; overflow-y: auto;
    padding: 4px; border: 1px solid #e2e8f0; border-radius: 8px;
    padding: 12px;
}
.perm-grid.disabled { opacity: 0.7; pointer-events: none; background: #f8fafc; }

.perm-item {
    background: white; border: 1px solid #e2e8f0;
    border-radius: 8px; padding: 10px;
    transition: all 0.15s;
}
.perm-item:hover { border-color: #cbd5e1; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }

.checkbox-label {
    display: flex; align-items: flex-start; gap: 10px; cursor: pointer;
    width: 100%;
}
.checkbox-label input { width: 16px; height: 16px; margin-top: 2px; }
.check-text { display: flex; flex-direction: column; }
.perm-name { font-size: 14px; font-weight: 600; color: #334155; }
.perm-desc { font-size: 12px; color: #94a3b8; margin-top: 2px; }

.form-actions { margin-top: 32px; display: flex; gap: 12px; }

.btn-primary {
    background: #3b82f6; color: white; border: none; padding: 10px 24px;
    border-radius: 8px; font-weight: 600; cursor: pointer;
}
.btn-primary:hover { background: #2563eb; }
.btn-primary:disabled { background: #94a3b8; }

.btn-secondary {
    background: white; color: #475569; border: 1px solid #cbd5e1; padding: 10px 24px;
    border-radius: 8px; font-weight: 600; cursor: pointer;
}
.btn-secondary:hover { background: #f8fafc; }

.btn-sm {
    padding: 6px 12px; font-size: 13px; border-radius: 6px; border: none; cursor: pointer; font-weight: 600;
}
.btn-sm.primary { background: #eff6ff; color: #3b82f6; }
.btn-sm.primary:hover { background: #dbeafe; }
.btn-sm.danger { background: #fef2f2; color: #ef4444; }
.btn-sm.danger:hover { background: #fee2e2; }

.empty-state {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    height: 100%; color: #94a3b8; text-align: center; padding: 40px;
}
.empty-state i { font-size: 48px; margin-bottom: 16px; color: #cbd5e1; }
.empty-state p { font-size: 14px; max-width: 240px; line-height: 1.5; }
</style>
