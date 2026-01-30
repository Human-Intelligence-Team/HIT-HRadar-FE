<template>
  <div class="form-builder">
    <!-- 헤더: 타이틀, 뒤로가기, 저장 -->
    <header class="builder-header">
      <div>
        <h2 class="builder-title">나만의 양식 만들기</h2>
        <p class="builder-subtitle">원하는 입력 항목을 추가하여 새로운 결재 양식을 만듭니다.</p>
      </div>
      <div class="builder-actions">
        <button class="btn" @click="$emit('back')">뒤로가기</button>
        <button class="btn primary" @click="saveForm">저장</button>
      </div>
    </header>

    <div class="builder-body">
      <!-- 왼쪽: 필드 팔레트 -->
      <aside class="field-palette">
        <h3 class="palette-title">입력 항목</h3>
        <div class="palette-grid">
          <button v-for="field in availableFields" :key="field.type" class="field-btn" @click="addField(field.type)">
            <span class="field-icon">{{ field.icon }}</span>
            <span class="field-name">{{ field.name }}</span>
          </button>
        </div>
      </aside>

      <!-- 오른쪽: 폼 미리보기 및 편집 -->
      <main class="form-canvas">
        <div class="canvas-header">
          <input type="text" v-model="formTitle" placeholder="양식 제목을 입력하세요" class="form-title-input" />
        </div>

        <!-- 공통 영역: 기안자, 결재선 -->
        <div class="common-section">
          <div class="common-box"><strong>기안자:</strong> (자동 표시)</div>
          <div class="common-box"><strong>결재선:</strong> (자동 표시)</div>
        </div>

        <!-- 커스텀 필드 영역 -->
        <div class="custom-fields-list">
          <div v-if="formFields.length === 0" class="empty-canvas">
            왼쪽에서 항목을 추가하세요.
          </div>
          <div v-for="(field, index) in formFields" :key="field.id" class="field-item">
            <div class="field-preview">
              <label class="field-label">{{ field.label || `(${field.name})` }}</label>
              <component :is="getFieldComponent(field.type)" v-bind="getComponentProps(field)" readonly />
            </div>
            <div class="field-actions">
              <button class="action-btn" @click="removeField(index)">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const emit = defineEmits(['back', 'save']);

const formTitle = ref('');
const formFields = ref([]);
let fieldCounter = 0;

// 사용 가능한 필드 타입 정의
const availableFields = [
  { type: 'text', name: '한 줄 텍스트', icon: '✏️' },
  { type: 'textarea', name: '여러 줄 텍스트', icon: '📄' },
  { type: 'number', name: '숫자', icon: '🔢' },
  { type: 'date', name: '날짜', icon: '📅' },
  { type: 'select', name: '선택상자', icon: '🗳️' },
];

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
  const props = { placeholder: `예시) ${field.label}` };
  if (field.type === 'number' || field.type === 'date') {
    props.type = field.type;
  }
  return props;
};

// 필드 추가
const addField = (type) => {
  const fieldInfo = availableFields.find(f => f.type === type);
  formFields.value.push({
    id: fieldCounter++,
    type: type,
    name: fieldInfo.name,
    label: fieldInfo.name, // 기본 레이블
    // 추가 설정...
  });
};

// 필드 삭제
const removeField = (index) => {
  formFields.value.splice(index, 1);
};

// 폼 저장
const saveForm = () => {
  const formDefinition = {
    title: formTitle.value,
    fields: formFields.value,
  };
  console.log('Saving form:', JSON.stringify(formDefinition, null, 2));
  emit('save', formDefinition);
};
</script>

<style scoped>
/* ===== 전체 레이아웃 ===== */
.form-builder {
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  background: #fff;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.builder-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.builder-title { font-size: 18px; font-weight: 700; margin: 0; }
.builder-subtitle { font-size: 13px; color: #6b7280; margin: 4px 0 0; }
.builder-actions { display: flex; gap: 10px; }

.builder-body {
  flex-grow: 1;
  display: flex;
  min-height: 0;
}

/* ===== 왼쪽: 필드 팔레트 ===== */
.field-palette {
  width: 280px;
  padding: 20px;
  border-right: 1px solid #e5e7eb;
  background: #f9fafb;
  flex-shrink: 0;
}
.palette-title {
  font-size: 15px;
  font-weight: 600;
  margin: 0 0 16px;
}
.palette-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.field-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px 10px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #fff;
  cursor: pointer;
  text-align: center;
  transition: all .15s ease;
}
.field-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0,0,0,.07);
  border-color: #2563eb;
}
.field-icon { font-size: 24px; }
.field-name { font-size: 12px; font-weight: 500; }

/* ===== 오른쪽: 폼 캔버스 ===== */
.form-canvas {
  flex-grow: 1;
  padding: 24px;
  overflow-y: auto;
}
.canvas-header {
  margin-bottom: 20px;
}
.form-title-input {
  width: 100%;
  font-size: 22px;
  font-weight: 700;
  border: none;
  border-bottom: 2px solid #e5e7eb;
  padding: 8px 4px;
  outline: none;
  transition: border-color .2s;
}
.form-title-input:focus {
  border-color: #2563eb;
}

.common-section {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px dashed #d1d5db;
}
.common-box {
  font-size: 13px;
  padding: 10px 14px;
  border-radius: 8px;
  background: #f3f4f6;
  color: #4b5563;
}

.custom-fields-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.empty-canvas {
  text-align: center;
  padding: 60px 20px;
  font-size: 14px;
  color: #9ca3af;
  border: 2px dashed #d1d5db;
  border-radius: 12px;
}
.field-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: 10px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
}
.field-preview {
  flex-grow: 1;
}
.field-label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 6px;
  color: #374151;
}
.field-preview input, .field-preview textarea, .field-preview select {
  width: 100%;
  padding: 8px 12px;
  font-size: 13px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  background: #fff;
  pointer-events: none; /* 미리보기에서는 입력 방지 */
}

.field-actions {
  flex-shrink: 0;
}
.action-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  color: #9ca3af;
  cursor: pointer;
  border-radius: 8px;
}
.action-btn:hover {
  background: #f3f4f6;
  color: #ef4444;
}
.action-btn svg { width: 20px; height: 20px; }

/* 공통 버튼 스타일 */
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
