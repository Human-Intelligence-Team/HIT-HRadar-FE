<template>
  <div class="template-selector">
    <!-- 헤더: 타이틀, 뒤로가기 -->
    <header class="builder-header">
      <div>
        <h2 class="builder-title">템플릿으로 시작하기</h2>
        <p class="builder-subtitle">사용할 결재 템플릿을 선택하세요.</p>
      </div>
      <div class="builder-actions">
        <button class="btn" @click="$emit('back')">뒤로가기</button>
      </div>
    </header>

    <div class="selector-body">
      <!-- 탭 -->
      <div class="tabs">
        <button
          class="tab"
          :class="{ active: activeTab === 'official' }"
          @click="activeTab = 'official'"
        >
          공식 템플릿
        </button>
        <button
          class="tab"
          :class="{ active: activeTab === 'my' }"
          @click="activeTab = 'my'"
        >
          나만의 템플릿
        </button>
      </div>

      <!-- 검색 및 필터 -->
      <div class="toolbar">
        <input v-model="searchTerm" class="search-input" placeholder="템플릿 이름 검색..." />
      </div>

      <!-- 템플릿 그리드 -->
      <div class="template-grid">
        <div
          v-for="template in filteredTemplates"
          :key="template.id"
          class="template-card"
          @click="selectTemplate(template)"
        >
          <div class="template-icon">📄</div>
          <h3 class="template-name">{{ template.name }}</h3>
          <p class="template-description">{{ template.description }}</p>
        </div>
        <div v-if="filteredTemplates.length === 0" class="no-results">
          검색 결과가 없습니다.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const emit = defineEmits(['back', 'select-template']);

const activeTab = ref('official'); // 'official' | 'my'
const searchTerm = ref('');

// --- Mock Data ---
const mockTemplates = [
  { id: 1, category: 'official', name: '연차 신청서', description: '개인 연차 사용을 위해 제출하는 공식 양식입니다.' },
  { id: 2, category: 'official', name: '지출 결의서', description: '업무 관련 비용 지출에 대한 승인을 요청하는 양식입니다.' },
  { id: 3, category: 'official', name: '재택 근무 신청서', description: '지정된 날짜에 재택 근무를 신청하는 양식입니다.' },
  { id: 4, category: 'my', name: '개인 주간 업무 보고', description: '팀 내 공유를 위한 주간 업무 보고 양식입니다.' },
  { id: 5, category: 'my', name: '프로젝트 아이디어 제안', description: '신규 프로젝트 아이디어를 제안하기 위해 만든 양식.' },
];
// --- End Mock Data ---

const filteredTemplates = computed(() => {
  return mockTemplates.filter(template => {
    const inTab = template.category === activeTab.value;
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.value.toLowerCase());
    return inTab && matchesSearch;
  });
});

const selectTemplate = (template) => {
  console.log('Selected template:', template);
  emit('select-template', template);
};
</script>

<style scoped>
.template-selector {
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

.selector-body {
  padding: 20px;
  overflow-y: auto;
  flex-grow: 1;
}

/* 탭 */
.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
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
  background: #2563EB;
  color: #ffffff;
  border-color: #2563EB;
}

/* 툴바 */
.toolbar {
  margin-bottom: 20px;
}
.search-input {
  width: 100%;
  max-width: 400px;
  padding: 10px 14px;
  font-size: 13px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
}

/* 템플릿 그리드 */
.template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}
.template-card {
  padding: 20px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #f9fafb;
  cursor: pointer;
  transition: all .15s ease;
}
.template-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 10px rgba(0,0,0,.06);
  border-color: #93c5fd;
}
.template-icon {
  font-size: 28px;
  margin-bottom: 12px;
}
.template-name {
  font-size: 15px;
  font-weight: 600;
  margin: 0 0 6px;
}
.template-description {
  font-size: 12px;
  color: #6b7280;
  line-height: 1.5;
  margin: 0;
}

.no-results {
  font-size: 14px;
  color: #9ca3af;
  padding: 40px 0;
  text-align: center;
  grid-column: 1 / -1;
}

/* 공통 버튼 */
.btn {
  padding: 8px 16px;
  font-size: 13px;
  border-radius: 10px;
  border: 1px solid #d1d5db;
  background-color: #ffffff;
  cursor: pointer;
}
</style>
