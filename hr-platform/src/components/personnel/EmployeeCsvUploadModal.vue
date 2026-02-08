<template>
  <Transition name="fade">
    <div v-if="visible" class="modal-overlay" @click.self="close">
      <div class="modal-container">
        <div class="modal-header">
          <div class="header-left">
            <i class="pi pi-file-excel header-icon"></i>
            <h2>사원 일괄 등록</h2>
          </div>
          <button class="close-btn" @click="close">
            <i class="pi pi-times"></i>
          </button>
        </div>

        <div class="modal-body custom-scrollbar">
          <!-- Step 1: Upload Area -->
          <div class="step-card upload-card">
            <div class="guide-header">
              <span class="step-badge">STEP 01</span>
              <h3>파일 업로드 및 템플릿</h3>
            </div>
            
            <div class="upload-controls">
              <div 
                class="drop-zone" 
                :class="{ 'has-file': selectedFile }"
                @click="$refs.fileInput.click()"
              >
                <i :class="selectedFile ? 'pi pi-file-check' : 'pi pi-cloud-upload'"></i>
                <div class="drop-text">
                  <span v-if="selectedFile" class="file-name">{{ selectedFile.name }}</span>
                  <span v-else>파일(CSV)을 드래그하거나 클릭하여 선택하세요</span>
                </div>
                <input type="file" ref="fileInput" accept=".csv" hidden @change="handleFileSelect" />
              </div>

              <div class="action-buttons">
                <button class="btn-modern secondary" @click="handleDownloadTemplate">
                  <i class="pi pi-download"></i> 템플릿 받기
                </button>
                <button 
                  class="btn-modern primary" 
                  :disabled="!selectedFile || loading" 
                  @click="handlePreview"
                >
                  <i class="pi pi-search"></i> 데이터 검증
                </button>
              </div>
            </div>
          </div>

          <!-- Step 2: Preview Summary & Table -->
          <Transition name="slide">
            <div v-if="previewData" class="step-card preview-card">
              <div class="guide-header">
                <span class="step-badge">STEP 02</span>
                <h3>데이터 검증 결과</h3>
              </div>

              <div class="stats-grid">
                <div class="stat-item total">
                  <div class="stat-label">전체</div>
                  <div class="stat-value">{{ previewData.totalCount }}</div>
                </div>
                <div class="stat-item success">
                  <div class="stat-label">유효</div>
                  <div class="stat-value">{{ previewData.validCount }}</div>
                </div>
                <div class="stat-item error">
                  <div class="stat-label">오류</div>
                  <div class="stat-value">{{ previewData.invalidCount }}</div>
                </div>
              </div>

              <div class="table-frame">
                <div class="table-scroll custom-scrollbar">
                  <table class="modern-table">
                    <thead>
                      <tr>
                        <th width="50">No</th>
                        <th>이름</th>
                        <th>이메일</th>
                        <th>부서</th>
                        <th>직위</th>
                        <th>입사일</th>
                        <th width="80">상태</th>
                        <th>검증 메시지</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="row in previewData.rows" :key="row.rowNumber" :class="{ 'row-error': !row.valid }">
                        <td class="text-secondary">{{ row.rowNumber }}</td>
                        <td><input v-model="row.name" class="table-input" /></td>
                        <td><input v-model="row.email" class="table-input" /></td>
                        <td><input v-model="row.deptName" class="table-input" /></td>
                        <td><input v-model="row.positionName" class="table-input" /></td>
                        <td><input v-model="row.hireDate" class="table-input center" placeholder="YYYY-MM-DD" /></td>
                        <td>
                          <span :class="['status-badge', row.valid ? 'success' : 'error']">
                            {{ row.valid ? '정상' : '오류' }}
                          </span>
                        </td>
                        <td :class="['message-cell', { 'error-text': !row.valid }]">
                          {{ row.failReason || '검증 완료' }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </Transition>
        </div>

        <div class="modal-footer">
          <button class="btn-modern ghost" @click="close">창 닫기</button>
          <button 
            class="btn-modern primary-gradient" 
            :disabled="!canRegister" 
            @click="handleRegister"
          >
            <i class="pi pi-check-circle" v-if="!loading"></i>
            <span class="spinner-small" v-if="loading"></span>
            {{ loading ? '처리 중...' : '전체 등록' }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed } from 'vue'
import { downloadCsvTemplate, previewCsv, registerCsv } from '@/api/employeeApi'

const props = defineProps({
  visible: Boolean
})
const emit = defineEmits(['close', 'success'])

const fileInput = ref(null)
const selectedFile = ref(null)
const previewData = ref(null)
const loading = ref(false)

const canRegister = computed(() => {
  return previewData.value && !loading.value && previewData.value.validCount > 0
})

const close = () => {
  reset()
  emit('close')
}

const reset = () => {
  selectedFile.value = null
  previewData.value = null
  if (fileInput.value) fileInput.value.value = ''
}

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    selectedFile.value = file
    previewData.value = null
  }
}

const handleDownloadTemplate = async () => {
  try {
    const response = await downloadCsvTemplate()
    // 엑셀 -> CSV로 변경됨
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', '사원등록_템플릿.csv')
    document.body.appendChild(link)
    link.click()
    link.remove()
  } catch (e) {
    alert('템플릿 다운로드 실패')
  }
}

const handlePreview = async () => {
  if (!selectedFile.value) return
  
  loading.value = true
  const formData = new FormData()
  formData.append('file', selectedFile.value)

  try {
    const res = await previewCsv(formData)
    previewData.value = res.data.data
  } catch (e) {
    alert('검증 중 오류가 발생했습니다.')
  } finally {
    loading.value = false
  }
}

const handleRegister = async () => {
  if (!canRegister.value) return
  
  if (previewData.value.invalidCount > 0) {
    if (!confirm(`오류 데이터 ${previewData.value.invalidCount}건은 제외되고 정상 데이터만 등록됩니다. 진행하시겠습니까?`)) return
  } else {
    if (!confirm('사원 정보를 일괄 등록하시겠습니까?')) return
  }

  loading.value = true
  const validRows = previewData.value.rows.filter(r => r.valid)
  
  const requestData = validRows.map(row => ({
    name: row.name,
    email: row.email,
    employeeNo: row.employeeNo,
    loginId: row.loginId,
    password: 'password123!', // Default password
    hireDate: row.hireDate,
    deptName: row.deptName,
    positionName: row.positionName,
    birth: row.birth
  }))

  try {
    const res = await registerCsv(requestData)
    alert(`성공적으로 ${res.data.data.successCount}명의 사원이 등록되었습니다.`)
    emit('success')
    close()
  } catch (e) {
    alert('등록 중 실패했습니다.')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* Modal Structure - Aligned with Notification/Chatbot Style */
.modal-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(15, 23, 42, 0.4);
  display: flex; justify-content: center; align-items: center;
  z-index: 2000; backdrop-filter: blur(4px);
}
.modal-container {
  background: #ffffff;
  width: 900px;
  max-width: 95vw;
  height: 80vh;
  border-radius: 14px; /* Matches NotificationModal */
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 40px rgba(0,0,0,.18); /* Matches NotificationModal */
  overflow: hidden;
  color: #0f172a;
}

/* Header - Simplified like Chatbot/Notification */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 24px;
  font-weight: 700;
  border-bottom: 1px solid #e5e7eb;
}
.header-left { display: flex; align-items: center; gap: 10px; }
.header-icon { font-size: 1.2rem; color: #10b981; }
.header-left h2 { font-size: 1rem; font-weight: 700; color: #0f172a; margin: 0; }

.close-btn {
  background: none;
  border: none;
  font-size: 14px;
  cursor: pointer;
  color: #64748b;
  transition: color 0.15s;
}
.close-btn:hover { color: #0f172a; }

/* Body Area */
.modal-body { padding: 24px; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 20px; }

/* Cards & Sections - Cleaned up */
.step-card { 
  background: #ffffff; 
  border: 1px solid #f1f5f9; 
  border-radius: 12px; 
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}
.guide-header { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
.step-badge { 
  background: #eff6ff; color: #1d4ed8; font-size: 10px; font-weight: 800;
  padding: 2px 8px; border-radius: 999px; border: 1px solid #c7d2fe;
}
.guide-header h3 { font-size: 0.95rem; font-weight: 700; color: #1e293b; margin: 0; }

/* Drop Zone */
.upload-controls { display: flex; flex-direction: column; gap: 12px; }
.action-buttons { display: flex; gap: 10px; }

.drop-zone {
  border: 2px dashed #e2e8f0; border-radius: 12px; padding: 24px;
  text-align: center; cursor: pointer; transition: all 0.2s ease;
  display: flex; flex-direction: column; align-items: center; gap: 10px;
  background: #f8fafc;
}
.drop-zone:hover { border-color: #3b82f6; background: #f1f7ff; }
.drop-zone.has-file { border-color: #10b981; background: #f0fdf4; border-style: solid; }
.drop-zone i { font-size: 2rem; color: #94a3b8; }
.has-file i { color: #10b981; }
.drop-text { color: #64748b; font-size: 0.85rem; }
.file-name { color: #0f172a; font-weight: 700; font-size: 0.95rem; }

/* Statistics Grid */
.stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px; }
.stat-item { padding: 12px; border-radius: 10px; text-align: center; background: #fff; border: 1px solid #f1f5f9; }
.stat-label { font-size: 0.75rem; color: #64748b; margin-bottom: 2px; font-weight: 600; }
.stat-value { font-size: 1.25rem; font-weight: 800; }
.stat-item.total .stat-value { color: #1e293b; }
.stat-item.success .stat-value { color: #10b981; }
.stat-item.error .stat-value { color: #ef4444; }

/* Table Section */
.table-frame { 
  background: white; border: 1px solid #f1f5f9; border-radius: 10px; 
  overflow: hidden; max-height: 350px; 
}
.table-scroll { overflow: auto; height: 100%; }
.modern-table { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
.modern-table th { 
  background: #fafafa; padding: 10px 14px; text-align: left; 
  font-weight: 700; color: #475569; position: sticky; top: 0; z-index: 10;
  border-bottom: 1px solid #f1f5f9;
}
.modern-table td { padding: 8px 14px; border-bottom: 1px solid #f1f5f9; color: #334155; }
.row-error { background-color: #fef2f2; }
.table-input { 
  width: 100%; border: 1px solid transparent; background: transparent; 
  padding: 4px 6px; border-radius: 4px; transition: 0.15s;
}
.table-input:hover, .table-input:focus { background: white; border-color: #cbd5e1; outline: none; }
.status-badge { 
  padding: 2px 8px; border-radius: 999px; font-size: 0.7rem; font-weight: 700;
}
.status-badge.success { background: #dcfce7; color: #166534; }
.status-badge.error { background: #fee2e2; color: #991b1b; }
.error-text { color: #ef4444; font-weight: 600; }

/* Footer */
.modal-footer {
  padding: 14px 24px; background: #fafafa; border-top: 1px solid #e5e7eb;
  display: flex; justify-content: flex-end; gap: 10px;
}

/* Buttons - Matches Style Palette */
.btn-modern {
  display: flex; align-items: center; gap: 6px; padding: 8px 18px; 
  border-radius: 999px; font-weight: 600; font-size: 0.85rem; 
  cursor: pointer; border: 1px solid transparent; transition: all 0.15s ease;
}
.btn-modern.primary { 
  background: #eef2ff; border-color: #c7d2fe; color: #1d4ed8; 
}
.btn-modern.primary:hover:not(:disabled) { background: #e0e7ff; }
.btn-modern.secondary { 
  background: #ffffff; border-color: #e2e8f0; color: #475569; 
}
.btn-modern.secondary:hover { background: #f8fafc; }
.btn-modern.ghost { background: transparent; color: #64748b; }
.btn-modern.ghost:hover { background: #f1f5f9; color: #0f172a; }
.btn-modern.primary-gradient {
  background: #1e293b; color: #ffffff; border-color: #1e293b;
}
.btn-modern.primary-gradient:hover:not(:disabled) { background: #334155; }
.btn-modern:disabled { opacity: 0.4; cursor: not-allowed; }

/* Custom Scrollbar */
.custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }

/* Transitions */
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.slide-enter-active { transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
.slide-enter-from { opacity: 0; transform: translateY(20px); }

/* Helpers */
.center { text-align: center; }
.spinner-small {
  width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
