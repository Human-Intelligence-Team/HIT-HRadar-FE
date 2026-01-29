<template>
  <div class="document-selector">
    <!-- 헤더 -->
    <header class="builder-header">
      <div>
        <h2 class="builder-title">이전 문서 복사하기</h2>
        <p class="builder-subtitle">복사할 결재 문서를 선택하세요.</p>
      </div>
      <div class="builder-actions">
        <button class="btn" @click="$emit('back')">뒤로가기</button>
      </div>
    </header>

    <div class="selector-body">
      <!-- 검색 -->
      <div class="toolbar">
        <input v-model="searchTerm" class="search-input" placeholder="문서 제목으로 검색..." />
      </div>

      <!-- 문서 목록 테이블 -->
      <div class="table-container">
        <table class="doc-table">
          <thead>
            <tr>
              <th>문서 제목</th>
              <th>기안일</th>
              <th>상태</th>
              <th>선택</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="doc in paginatedDocuments" :key="doc.id">
              <td>{{ doc.title }}</td>
              <td>{{ doc.creationDate }}</td>
              <td><span :class="['status-badge', doc.status]">{{ doc.statusName }}</span></td>
              <td>
                <button class="btn-select" @click="selectDocument(doc)">복사</button>
              </td>
            </tr>
            <tr v-if="filteredDocuments.length === 0">
              <td colspan="4" class="no-results">검색 결과가 없습니다.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 페이지네이션 -->
      <div class="pagination">
        <button @click="prevPage" :disabled="currentPage === 1">이전</button>
        <span>{{ currentPage }} / {{ totalPages }}</span>
        <button @click="nextPage" :disabled="currentPage === totalPages">다음</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const emit = defineEmits(['back', 'select-document']);

const searchTerm = ref('');
const currentPage = ref(1);
const itemsPerPage = 5;

// --- Mock Data ---
const mockDocuments = [
  { id: 1, title: '2025년 4분기 영업팀 워크샵 비용', creationDate: '2025-10-15', status: 'approved', statusName: '승인' },
  { id: 2, title: '개인 연차 사용 신청 (1일)', creationDate: '2025-11-02', status: 'approved', statusName: '승인' },
  { id: 3, title: '[긴급] 서버 점검을 위한 재택 근무', creationDate: '2025-11-20', status: 'rejected', statusName: '반려' },
  { id: 4, title: '마케팅팀 신규 장비 구매 요청', creationDate: '2025-12-01', status: 'in_progress', statusName: '진행중' },
  { id: 5, title: '2026년 1월 출장 계획', creationDate: '2025-12-10', status: 'draft', statusName: '임시저장' },
  { id: 6, title: '디자인팀 소프트웨어 구독 갱신', creationDate: '2025-12-15', status: 'approved', statusName: '승인' },
  { id: 7, title: '법인카드 사용 내역 보고 (11월)', creationDate: '2025-12-05', status: 'in_progress', statusName: '진행중' },
];
// --- End Mock Data ---

const filteredDocuments = computed(() => {
  return mockDocuments.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.value.toLowerCase())
  );
});

const totalPages = computed(() => {
  return Math.ceil(filteredDocuments.value.length / itemsPerPage);
});

const paginatedDocuments = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredDocuments.value.slice(start, end);
});

const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--;
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++;
};

const selectDocument = (doc) => {
  console.log('Selected document to copy:', doc);
  emit('select-document', doc);
};
</script>

<style scoped>
.document-selector {
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
}
.builder-title { font-size: 18px; font-weight: 700; margin: 0; }
.builder-subtitle { font-size: 13px; color: #6b7280; margin: 4px 0 0; }

.selector-body { padding: 20px; flex-grow: 1; display: flex; flex-direction: column; }
.toolbar { margin-bottom: 20px; }
.search-input {
  width: 100%;
  max-width: 400px;
  padding: 10px 14px;
  font-size: 13px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
}

.table-container { flex-grow: 1; }
.doc-table { width: 100%; border-collapse: collapse; }
.doc-table th, .doc-table td {
  padding: 12px 14px;
  text-align: left;
  border-bottom: 1px solid #f3f4f6;
  font-size: 13px;
}
.doc-table th {
  background-color: #f9fafb;
  font-weight: 600;
  color: #4b5563;
}
.doc-table td { color: #374151; }

.status-badge {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}
.status-badge.approved { background-color: #dbeafe; color: #1e40af; }
.status-badge.rejected { background-color: #fee2e2; color: #991b1b; }
.status-badge.in_progress { background-color: #fef3c7; color: #92400e; }
.status-badge.draft { background-color: #e5e7eb; color: #4b5563; }

.btn-select {
  padding: 6px 14px;
  font-size: 12px;
  border-radius: 6px;
  background-color: #e5e7eb;
  color: #374151;
  border: 1px solid #d1d5db;
  cursor: pointer;
}
.btn-select:hover { background-color: #d1d5db; }

.no-results { text-align: center; color: #9ca3af; padding: 30px; }
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}
.pagination button {
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  background: #fff;
  cursor: pointer;
}
.pagination button:disabled { opacity: 0.5; cursor: not-allowed; }

.btn {
  padding: 8px 16px;
  font-size: 13px;
  border-radius: 10px;
  border: 1px solid #d1d5db;
  background-color: #ffffff;
  cursor: pointer;
}
</style>
