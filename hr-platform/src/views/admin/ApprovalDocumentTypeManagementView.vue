<template>
  <div class="page">
    <div class="section-title">
      <h1>결재 문서 유형 관리</h1>
    </div>

    <section class="card document-type-management">
      <div class="header-actions">
        <button class="btn btn-primary" @click="openCreateModal">새 문서 유형 등록</button>
      </div>

      <table class="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>유형 값 (Value)</th>
            <th>유형명 (Text)</th>
            <th>시스템 연동 (Mapping)</th>
            <th>액션</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="documentTypes.length === 0">
            <td colspan="4" class="no-data">등록된 문서 유형이 없습니다.</td>
          </tr>
          <tr v-for="(type, index) in documentTypes" :key="type.typeId">
            <td>{{ index + 1 }}</td>
            <td>{{ type.docType }}</td>
            <td>{{ type.name }}</td>
            <td>
                <span :class="['category-badge', type.attendanceCategory.toLowerCase()]">
                    {{ type.attendanceCategory }}
                </span>
            </td>
            <td>
              <button class="btn btn-secondary btn-small" @click="openEditModal(type)">수정</button>
              <button class="btn btn-danger btn-small" @click="deleteDocumentType(type.typeId)">삭제</button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- Document Type Modal (Create/Edit) -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-content">
        <h3>{{ isEditing ? '문서 유형 수정' : '새 문서 유형 등록' }}</h3>
        <div class="form-group">
          <label for="docType">유형 값 (고유 ID)</label>
          <input type="text" id="docType" v-model="form.docType" class="input-field" :disabled="isEditing" placeholder="예: VACATION_REQUEST" />
        </div>
        <div class="form-group">
          <label for="name">유형명</label>
          <input type="text" id="name" v-model="form.name" class="input-field" placeholder="예: 휴가 신청" />
        </div>
        <div class="form-group">
            <label for="attendanceCategory">시스템 연동 설정 (System Mapping)</label>
            <select id="attendanceCategory" v-model="form.attendanceCategory" class="input-field select-field">
                <option v-for="cat in categories" :key="cat" :value="cat">
                    {{ mapCategoryName(cat) }} ({{ cat }})
                </option>
            </select>
            <p class="hint">결재 승인 시, 선택한 시스템 기능(근태/휴가 등)이 자동으로 수행됩니다.</p>
        </div>
        <div class="form-group">
          <label for="active">활성화</label>
          <input type="checkbox" id="active" v-model="form.active" />
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="showModal = false">취소</button>
          <button class="btn btn-primary" @click="saveDocumentType">저장</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import {
  fetchApprovalDocumentTypes,
  createApprovalDocumentType,
  deleteApprovalDocumentType,
  fetchApprovalAttendanceCategories
} from '@/api/approvalApi';

const documentTypes = ref([]);
const showModal = ref(false);
const isEditing = ref(false);
const currentTypeId = ref(null);
const form = ref({
  docType: '', 
  name: '',    
  active: true, 
  attendanceCategory: 'NONE'
});

const categories = ref(['NONE']);

const fetchDocumentTypes = async () => {
  try {
    const response = await fetchApprovalDocumentTypes();
    documentTypes.value = response.data.data.map(type => ({
      typeId: type.docId, 
      docType: type.docType,
      name: type.name,
      active: type.active,
      attendanceCategory: type.attendanceCategory || 'NONE'
    }));
  } catch (error) {
    console.error('Failed to fetch document types:', error);
  }
};

const fetchCategories = async () => {
    try {
        const response = await fetchApprovalAttendanceCategories();
        if (response.data && response.data.data) {
            categories.value = response.data.data;
        }
    } catch (error) {
        console.error('Failed to fetch categories:', error);
    }
}

const mapCategoryName = (cat) => {
    const mapper = {
        'NONE': '없음',
        'WORK_OFFICE': '내근',
        'WORK_REMOTE': '재택',
        'WORK_FIELD': '외근',
        'WORK_TRIP': '출장',
        'VACATION': '휴가',
        'OVERTIME': '초과근무'
    };
    return mapper[cat] || cat;
}

const openCreateModal = () => {
  isEditing.value = false;
  currentTypeId.value = null;
  form.value.docType = '';
  form.value.name = '';
  form.value.active = true; 
  form.value.attendanceCategory = 'NONE';
  showModal.value = true;
};

const openEditModal = async (type) => {
  isEditing.value = true;
  currentTypeId.value = type.typeId;
  form.value.docType = type.docType;
  form.value.name = type.name;
  form.value.active = type.active;
  form.value.attendanceCategory = type.attendanceCategory || 'NONE';
  showModal.value = true; // Added missing modal open
};

const saveDocumentType = async () => {
  if (!form.value.docType.trim() || !form.value.name.trim()) { 
    alert('유형 값과 유형명을 모두 입력해주세요.');
    return;
  }

  try {
    if (isEditing.value) {
      await updateApprovalDocumentType(currentTypeId.value, {
        docType: form.value.docType,
        name: form.value.name,
        active: form.value.active, 
        attendanceCategory: form.value.attendanceCategory
      });
      alert('문서 유형이 수정되었습니다.');
    } else {
      await createApprovalDocumentType({
        docType: form.value.docType,
        name: form.value.name,
        active: form.value.active, 
        attendanceCategory: form.value.attendanceCategory
      });
      alert('새 문서 유형이 등록되었습니다.');
    }
    showModal.value = false;
    fetchDocumentTypes(); // Refresh list
  } catch (error) {
    alert('문서 유형 저장에 실패했습니다.');
    console.error('Failed to save document type:', error);
  }
};

const deleteDocumentType = async (id) => {
  if (!confirm('정말로 이 문서 유형을 삭제하시겠습니까?')) return;
  try {
    await deleteApprovalDocumentType(id);
    alert('문서 유형이 삭제되었습니다.');
    fetchDocumentTypes(); // Refresh list
  } catch (error) {
    alert('문서 유형 삭제에 실패했습니다.');
    console.error('Failed to delete document type:', error);
  }
};

onMounted(() => {
  fetchDocumentTypes();
  fetchCategories();
});
</script>

<style scoped>
.page {
  max-width: 960px;
  margin: 0 auto;
  padding: 32px 16px;
}

.section-title {
  margin-bottom: 20px;
}

.section-title h1 {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.card {
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
}

.document-type-management .header-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th,
.table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
}

.table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #555;
}

.table tbody tr {
  cursor: default;
}

.table tbody tr:hover {
  background-color: #f1f1f1;
}

.no-data {
  text-align: center;
  color: #888;
  padding: 40px;
}

.btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: background-color 0.2s ease;
}

.btn-primary {
  background-color: #007bff;
  color: #ffffff;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.btn-secondary {
  background-color: #6c757d;
  color: #ffffff;
}

.btn-secondary:hover {
  background-color: #5a6268;
}

.btn-danger {
  background-color: #dc3545;
  color: #ffffff;
  margin-left: 5px; /* Spacing for action buttons */
}

.btn-danger:hover {
  background-color: #c82333;
}

.btn-small {
  padding: 5px 10px;
  font-size: 12px;
  border-radius: 6px;
}

/* Modal Styles - Reuse from ApprovalDetailView or global styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: #fff;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 500px;
}

.modal-content h3 {
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 20px;
  color: #333;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.input-field {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  color: #333;
  box-sizing: border-box;
}

.input-field:disabled {
  background-color: #f8f9fa;
  cursor: not-allowed;
}

.input-field:focus {
  border-color: #007bff;
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.15);
}

.modal-actions {
  gap: 10px;
  margin-top: 30px;
}

.select-field {
    background-color: white;
}

.hint {
    font-size: 12px;
    color: #666;
    margin-top: 4px;
}

.category-badge {
    display: inline-block;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 600;
    color: #555;
    background-color: #eee;
}

.category-badge.work_office { background-color: #e3f2fd; color: #1565c0; }
.category-badge.work_field { background-color: #e8f5e9; color: #2e7d32; }
.category-badge.work_trip { background-color: #fff3e0; color: #ef6c00; }
.category-badge.work_remote { background-color: #f3e5f5; color: #7b1fa2; }
.category-badge.vacation { background-color: #ffebee; color: #c62828; }
.category-badge.overtime { background-color: #fff8e1; color: #f57f17; }
.category-badge.none { background-color: #f5f5f5; color: #757575; }
</style>
