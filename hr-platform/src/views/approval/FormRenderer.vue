<template>
  <div class="form-renderer">
    <!-- 헤더 -->
    <header class="renderer-header">
      <div>
        <h2 class="renderer-title">{{ formDefinition.title || '결재 문서 작성' }}</h2>
        <p class="renderer-subtitle">아래 항목을 모두 입력해주세요.</p>
      </div>
      <div class="renderer-actions">
        <button class="btn" @click="$emit('back')">취소</button>
        <button class="btn secondary" @click="saveDraft">임시저장</button>
        <button class="btn primary" @click="submitForm">등록</button>
      </div>
    </header>

    <div class="renderer-body">
      <!-- 공통 정보 -->
      <div class="common-section">
        <div class="info-box">
          <div class="box-title">기안자</div>
          <div class="box-content">
            <p><strong>이름:</strong> 홍길동</p>
            <p><strong>부서:</strong> 개발팀</p>
          </div>
        </div>
        <div class="info-box">
          <div class="box-title">결재선</div>
          <div class="box-content approval-line-display">
            <div v-for="(approver, index) in mockApprovers" :key="index" class="approver-item">
              <span class="approver-name">{{ approver.name }}</span>
              <div v-if="approver.status === 'approved'" class="status-stamp approved">
                <span>승인</span>
                <span class="approval-date">{{ approver.approvalDate }}</span>
              </div>
              <div v-else-if="approver.status === 'rejected'" class="status-stamp rejected">
                <span>반려</span>
                <span class="approval-date">{{ approver.approvalDate }}</span>
              </div>
              <div v-else class="status-stamp pending">
                <span>대기중</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 동적 폼 필드 -->
      <div class="dynamic-form">
        <div v-for="field in formDefinition.fields" :key="field.id" class="field-wrapper">
          <label :for="`field-${field.id}`" class="field-label">{{ field.label }}</label>
          <component
            :is="getFieldComponent(field.type)"
            :id="`field-${field.id}`"
            v-model="formData[field.id]"
            v-bind="getComponentProps(field)"
            class="form-input"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  formDefinition: {
    type: Object,
    required: true,
    default: () => ({ title: '제목 없음', fields: [] })
  },
  initialData: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['back', 'save-draft', 'submit']);

const formData = ref({});

// 모의 결재선 데이터
const mockApprovers = ref([
  { name: '김철수', status: 'approved', approvalDate: '2026-01-20' },
  { name: '이영희', status: 'pending', approvalDate: null },
  { name: '박민준', status: 'rejected', approvalDate: '2026-01-22' },
]);

// Props가 변경될 때 formData를 초기화하는 Watcher
watch(() => [props.formDefinition, props.initialData], () => {
  const newFormData = {};
  if (props.formDefinition && props.formDefinition.fields) {
    props.formDefinition.fields.forEach(field => {
      // initialData에 값이 있으면 그 값을, 없으면 기본값(null)을 사용
      newFormData[field.id] = props.initialData[field.id] || null;
    });
  }
  formData.value = newFormData;
}, { immediate: true, deep: true });


// 필드 타입에 따른 Vue 컴포넌트 매핑
const getFieldComponent = (type) => {
  switch (type) {
    case 'textarea': return 'textarea';
    case 'select': return 'select';
    default: return 'input';
  }
};

// 컴포넌트에 전달할 props 결정
const getComponentProps = (field) => {
  const compProps = { placeholder: field.placeholder || `(${field.name})` };
  if (field.type === 'number' || field.type === 'date') {
    compProps.type = field.type;
  }
  return compProps;
};

const saveDraft = () => {
  console.log('Saving draft:', formData.value);
  emit('save-draft', formData.value);
};

const submitForm = () => {
  console.log('Submitting form:', formData.value);
  emit('submit', formData.value);
};
</script>

<style scoped>
.form-renderer {
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  background: #fff;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.renderer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #e5e7eb;
}
.renderer-title { font-size: 18px; font-weight: 700; margin: 0; }
.renderer-subtitle { font-size: 13px; color: #6b7280; margin: 4px 0 0; }
.renderer-actions { display: flex; gap: 8px; }

.renderer-body {
  padding: 24px;
  overflow-y: auto;
  flex-grow: 1;
}

/* 공통 정보 */
.common-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 24px;
}
.info-box {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
}
.box-title {
  font-size: 14px;
  font-weight: 600;
  padding: 10px 14px;
  border-bottom: 1px solid #e5e7eb;
  background-color: #f9fafb;
}
.box-content {
  padding: 14px;
  font-size: 13px;
  color: #6b7280;
}

/* 결재선 표시 */
.approval-line-display {
  display: flex;
  justify-content: space-around;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 10px;
  padding: 10px;
}

.approver-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 5px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background-color: #fcfcfc;
}

.approver-name {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.status-stamp {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 11px;
  font-weight: 700;
  color: #fff;
  border: 2px solid;
  line-height: 1.2;
}

.status-stamp.approved {
  background-color: #ef4444; /* 빨간색 도장 */
  border-color: #dc2626;
}

.status-stamp.rejected {
  background-color: #9ca3af; /* 회색 반려 도장 */
  border-color: #6b7280;
}

.status-stamp.pending {
  background-color: #60a5fa; /* 파란색 대기 도장 */
  border-color: #3b82f6;
  font-size: 10px;
  width: auto;
  padding: 5px 8px;
  border-radius: 5px;
  height: auto;
}

.approval-date {
  font-size: 8px;
  font-weight: 500;
  margin-top: 2px;
  color: #fff;
}


/* 동적 폼 */
.dynamic-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.field-wrapper {
  display: flex;
  flex-direction: column;
}
.field-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
}
.form-input {
  width: 100%;
  padding: 10px 12px;
  font-size: 13px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background-color: #ffffff;
}
textarea.form-input {
  min-height: 120px;
  resize: vertical;
}

/* 버튼 */
.btn {
  padding: 8px 16px;
  font-size: 13px;
  border-radius: 10px;
  border: 1px solid #d1d5db;
  background-color: #ffffff;
  cursor: pointer;
}
.btn.secondary { background-color: #f3f4f6; }
.btn.primary {
  background-color: #2563eb;
  color: #ffffff;
  border-color: #2563eb;
}
</style>
