<template>
  <section class="approval-list-view">
    <!-- 타이틀, 드롭다운 탭, 필터 및 정렬 -->
    <div class="section-header">
      <div class="title-group">
        <h1>내 문서함</h1>
        <div class="sub">내가 기안한 결재 문서들을 확인하고 관리합니다.</div>
      </div>

      <!-- 툴바 (필터/정렬) - 타이틀 우측으로 이동 -->
      <div class="toolbar">
        <!-- 문서 유형 필터 -->
        <select v-model="docTypeFilter" class="select">
          <option value="ALL">전체 유형</option>
          <option v-for="type in uniqueDocTypes" :key="type" :value="type">
            {{ type }}
          </option>
        </select>

        <!-- 정렬 -->
        <select v-model="sortOrder" class="select">
          <option value="latest">최신순</option>
          <option value="oldest">오래된순</option>
        </select>
      </div>
    </div>

    <!-- 상태 탭 (Tabs) -->
    <div class="tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab.value"
        class="tab-button"
        :class="{ active: statusFilter === tab.value }"
        @click="statusFilter = tab.value"
      >
        {{ tab.label }}
      </button>
    </div>




    <!-- 문서 목록 -->
    <div class="document-section">
      <div v-if="loading" class="loading-indicator">데이터를 불러오는 중...</div>
      <div v-else-if="filteredAndSortedDocuments.length === 0" class="no-results">
        표시할 문서가 없습니다.
      </div>
      <div v-else class="table-container">
        <table class="doc-table">
          <thead>
            <tr>
              <th>문서 ID</th>
              <th>문서 제목</th>
              <th>문서 유형</th>
              <th>상태</th>
              <th>제출 일시</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="doc in filteredAndSortedDocuments" :key="doc.docId">
              <td>{{ doc.docId }}</td>
              <td>{{ doc.title }}</td>
              <td>{{ doc.docType }}</td>
              <td>
                <span :class="['status-badge', getStatusClass(doc.status)]">{{ doc.status }}</span>
              </td>
              <td>{{ formatDate(doc.submittedAt) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { fetchMyDocuments } from '@/api/approvalApi';

const auth = useAuthStore();
const employeeId = computed(() => auth.user.employeeId);

const loading = ref(false);
const myDocuments = ref([]);
const statusFilter = ref('ALL'); // ALL, DRAFT, IN_PROGRESS, APPROVED, REJECTED
const docTypeFilter = ref('ALL');
const sortOrder = ref('latest'); // latest, oldest

const tabs = [
  { label: '전체', value: 'ALL' },
  { label: '임시저장', value: 'DRAFT' },
  { label: '상신/진행', value: 'IN_PROGRESS' },
  { label: '승인', value: 'APPROVED' },
];

const uniqueDocTypes = computed(() => {
  const types = new Set(myDocuments.value.map(doc => doc.docType).filter(Boolean));
  return Array.from(types);
});

const fetchMyDocs = async () => {
  if (!employeeId.value) {
    console.error("Employee ID is not available.");
    return;
  }
  loading.value = true;
  try {
    const response = await fetchMyDocuments(employeeId.value);
    myDocuments.value = response.data.data || [];
  } catch (error) {
    console.error('Failed to fetch my documents:', error);
  } finally {
    loading.value = false;
  }
};

const filteredDocuments = computed(() => {
  let result = myDocuments.value;

  // 상태 필터링
  if (statusFilter.value !== 'ALL') {
    result = result.filter(doc => doc.status === statusFilter.value);
  }

  // 문서 유형 필터링
  if (docTypeFilter.value !== 'ALL') {
    result = result.filter(doc => doc.docType === docTypeFilter.value);
  }

  return result;
});

const filteredAndSortedDocuments = computed(() => {
  const sorted = [...filteredDocuments.value].sort((a, b) => {
    const dateA = new Date(a.submittedAt);
    const dateB = new Date(b.submittedAt);
    if (sortOrder.value === 'latest') {
      return dateB - dateA;
    } else {
      return dateA - dateB;
    }
  });
  return sorted;
});

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getStatusClass = (status) => {
  switch (status) {
    case 'APPROVED': return 'approved';
    case 'IN_PROGRESS': return 'in-progress';
    case 'REJECTED': return 'rejected';
    case 'DRAFT': return 'draft';
    default: return '';
  }
};

watch(employeeId, (newId) => {
  if (newId) {
    fetchMyDocs();
  }
}, { immediate: true });

watch([statusFilter, sortOrder], () => {
  // 필터나 정렬 변경 시 문서 재정렬 (API 재호출은 필요 없음)
});

onMounted(() => {
  // 컴포넌트 마운트 시 초기 데이터 로드 (employeeId watch와 함께 사용)
  // employeeId watch의 immediate: true가 마운트 시점을 처리하지만,
  // onMounted를 명시적으로 사용하여 linter 경고를 해결합니다.
  if (employeeId.value) {
    fetchMyDocs();
  }
});
</script>

<style scoped>
.approval-list-view {
  padding: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* ===== 헤더 ===== */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end; /* 타이틀과 툴바 바닥 정렬 */
  margin-bottom: 20px;
}

.title-group h1 {
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.title-group .sub {
  font-size: 14px;
  color: #6b7280;
  margin-top: 4px;
}

/* ===== 툴바 (필터/정렬) ===== */
.toolbar {
  display: flex;
  gap: 12px;
}
.select {
  padding: 8px 12px;
  font-size: 13px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  background-color: #ffffff;
  cursor: pointer;
}

/* ===== 탭 스타일 ===== */
.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.tab-button {
  padding: 8px 16px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  transition: all 0.2s;
}

.tab-button:hover {
  color: #374151;
}

.tab-button.active {
  color: #2563eb;
  border-bottom-color: #2563eb;
  font-weight: 600;
}

/* ===== 문서 섹션 ===== */
.document-section {
  flex-grow: 1;
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.loading-indicator, .no-results {
  text-align: center;
  padding: 50px 20px;
  font-size: 14px;
  color: #9ca3af;
}

.table-container {
  overflow-x: auto;
  flex-grow: 1;
  min-height: 0;
}

.doc-table {
  width: 100%;
  border-collapse: collapse;
}

.doc-table th, .doc-table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #f3f4f6;
  font-size: 13px;
  color: #374151;
}

.doc-table th {
  background-color: #f9fafb;
  font-weight: 600;
  color: #4b5563;
}

.doc-table tbody tr:last-child td {
  border-bottom: none;
}

/* 상태 뱃지 */
.status-badge {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}
.status-badge.approved { background-color: #dbeafe; color: #1e40af; } /* 파랑 */
.status-badge.in-progress { background-color: #fef3c7; color: #92400e; } /* 노랑 */
.status-badge.rejected { background-color: #fee2e2; color: #991b1b; } /* 빨강 */
.status-badge.draft { background-color: #e5e7eb; color: #4b5563; } /* 회색 */
</style>
