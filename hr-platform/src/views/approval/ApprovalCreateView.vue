<template>
  <section class="approval-create-view">
    <!-- 동적 컴포넌트 렌더링 -->
    <component
      v-if="activeComponent"
      :is="activeComponent"
      :form-definition="formDefinition"
      :initial-data="initialData"
      @back="resetStep"
      @save="startForm"
      @select-template="startFormWithTemplate"
      @select-document="startFormFromCopy"
    />

    <!-- 시작 옵션 선택 (currentStep이 null일 때만 보임) -->
    <div v-else>
      <!-- 타이틀 -->
      <div class="section-title">
        <div>
          <h1>결재 문서 작성</h1>
          <div class="sub">어떻게 문서를 작성하시겠어요?</div>
        </div>
      </div>

      <!-- 시작 옵션 선택 -->
      <div class="option-grid">
        <!-- 1. 템플릿으로 시작하기 -->
        <div class="option-card" @click="handleOptionClick('template')">
          <div class="card-icon-wrapper">
            <svg class="card-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
          <div class="card-content">
            <h2 class="card-title">템플릿으로 시작하기</h2>
            <p class="card-description">공식 또는 나만의 템플릿으로 빠르게 문서를 작성합니다.</p>
          </div>
        </div>

        <!-- 2. 빈 양식으로 시작하기 -->
        <div class="option-card" @click="handleOptionClick('custom')">
          <div class="card-icon-wrapper" style="background-color: #E0F2F1;"><svg class="card-icon" style="color: #14B8A6;" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></div>
          <div class="card-content">
            <h2 class="card-title">빈 양식으로 시작하기</h2>
            <p class="card-description">원하는 항목을 직접 구성하여 새로운 양식을 만듭니다.</p>
          </div>
        </div>

        <!-- 3. 이전 문서 복사하기 -->
        <div class="option-card" @click="handleOptionClick('copy')">
          <div class="card-icon-wrapper" style="background-color: #FEF3C7;"><svg class="card-icon" style="color: #FBBF24;" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg></div>
          <div class="card-content">
            <h2 class="card-title">이전 문서 복사하기</h2>
            <p class="card-description">기존에 작성한 문서를 복사하여 새 문서를 작성합니다.</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue';
import TemplateSelector from './TemplateSelector.vue';
import FormBuilder from './FormBuilder.vue';
import PreviousDocumentSelector from './PreviousDocumentSelector.vue';
import FormRenderer from './FormRenderer.vue';

const currentStep = ref(null); // null, 'template', 'custom', 'copy', 'rendering'
const formDefinition = ref(null);
const initialData = ref(null);

const activeComponent = computed(() => {
  switch (currentStep.value) {
    case 'template': return TemplateSelector;
    case 'custom': return FormBuilder;
    case 'copy': return PreviousDocumentSelector;
    case 'rendering': return FormRenderer;
    default: return null;
  }
});

const handleOptionClick = (step) => {
  currentStep.value = step;
};

const resetStep = () => {
  currentStep.value = null;
  formDefinition.value = null;
  initialData.value = null;
};

// FormBuilder에서 '저장'시 호출
const startForm = (definition) => {
  formDefinition.value = definition;
  initialData.value = {}; // 새 양식이므로 초기 데이터 없음
  currentStep.value = 'rendering';
};

// TemplateSelector에서 '선택'시 호출
const startFormWithTemplate = (template) => {
  // 실제로는 template.id를 이용해 전체 formDefinition을 가져와야 함
  // 지금은 목업 데이터로 대체
  formDefinition.value = {
    title: template.name,
    fields: [
      { id: 0, type: 'text', name: '제목', label: '제목', placeholder: '제목을 입력하세요' },
      { id: 1, type: 'textarea', name: '내용', label: '내용', placeholder: '내용을 입력하세요' }
    ]
  };
  initialData.value = {};
  currentStep.value = 'rendering';
};

// PreviousDocumentSelector에서 '복사'시 호출
const startFormFromCopy = (doc) => {
  // 실제로는 doc.id를 이용해 formDefinition과 formData를 모두 가져와야 함
  // 지금은 목업 데이터로 대체
  formDefinition.value = {
    title: `(복사) ${doc.title}`,
    fields: [
      { id: 0, type: 'text', name: '제목', label: '제목' },
    ]
  };
  initialData.value = { 0: `(복사) ${doc.title}` }; // 복사된 데이터
  currentStep.value = 'rendering';
};

</script>

<style scoped>
.approval-create-view {
  padding: 16px;
  height: 100%;
}
.section-title { margin-bottom: 24px; }
.section-title h1 { font-size: 20px; font-weight: 700; }
.section-title .sub { font-size: 14px; color: #6b7280; margin-top: 4px; }
.option-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; }
.option-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 24px;
  border: 1px solid var(--border, #e5e7eb);
  border-radius: 14px;
  background-color: var(--card, #ffffff);
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}
.option-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  border-color: #2563eb;
}
.card-icon-wrapper {
  flex-shrink: 0;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #E0E7FF;
}
.card-icon { width: 28px; height: 28px; color: #4F46E5; }
.card-content { text-align: left; }
.card-title { font-size: 16px; font-weight: 600; color: var(--text-main, #111827); margin: 0 0 4px; }
.card-description { font-size: 13px; color: var(--text-sub, #6b7280); margin: 0; line-height: 1.5; }
</style>