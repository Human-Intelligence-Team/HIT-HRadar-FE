<template>
  <section class="approval-admin-view">
    <!-- 타이틀 -->
    <div class="section-title">
      <div>
        <h1>결재 관리 (인사팀)</h1>
        <div class="sub">공식 템플릿을 관리하고 모든 결재 문서를 조회합니다.</div>
      </div>
    </div>

    <!-- 탭 -->
    <div class="tabs">
      <button class="tab" :class="{ active: activeTab === 'templates' }" @click="activeTab = 'templates'">
        템플릿 관리
      </button>
      <button class="tab" :class="{ active: activeTab === 'documents' }" @click="activeTab = 'documents'">
        전체 문서 조회
      </button>
    </div>

    <!-- 컨텐츠 -->
    <div class="admin-content">
      <!-- 템플릿 관리 탭 -->
      <div v-if="activeTab === 'templates'">
        <p class="tab-description">새로운 공식 템플릿을 만들거나 기존 템플릿을 수정합니다.</p>
        <FormBuilder @save="onTemplateSave" />
      </div>

      <!-- 전체 문서 조회 탭 -->
      <div v-if="activeTab === 'documents'">
        <p class="tab-description">모든 부서 및 직원의 결재 문서를 검색하고 조회합니다.</p>
        <!-- 여기에 전체 문서 목록을 보여주는 컴포넌트가 위치합니다. -->
        <div class="coming-soon">전체 문서 조회 기능은 곧 제공될 예정입니다.</div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue';
import FormBuilder from './FormBuilder.vue';

const activeTab = ref('templates'); // 'templates' | 'documents'

const onTemplateSave = (formDefinition) => {
  console.log('A new official template was saved:', formDefinition);
  // 여기에 템플릿을 서버에 저장하는 로직을 추가합니다.
  alert('공식 템플릿이 저장되었습니다.');
};
</script>

<style scoped>
.approval-admin-view {
  padding: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 헤더 */
.section-title { margin-bottom: 16px; }
.section-title h1 { font-size: 20px; font-weight: 700; }
.section-title .sub { font-size: 14px; color: #6b7280; margin-top: 4px; }

/* 탭 */
.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}
.tab {
  padding: 8px 16px;
  font-size: 14px;
  border-radius: 999px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  color: #374151;
  cursor: pointer;
}
.tab.active {
  background: #1e40af; /* 인사팀 관리자용 색상 */
  color: #ffffff;
  border-color: #1e40af;
}

/* 컨텐츠 */
.admin-content {
  flex-grow: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.tab-description {
  font-size: 13px;
  color: #4b5563;
  margin-bottom: 16px;
  padding-left: 4px;
}

.coming-soon {
  text-align: center;
  padding: 60px 20px;
  font-size: 14px;
  color: #9ca3af;
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  background: #f9fafb;
}
</style>
