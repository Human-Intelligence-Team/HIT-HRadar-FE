<template>
  <section class="approval-list-view">
    <!-- 타이틀 & 툴바 -->
    <div class="section-header">
      <div class="title-group">
        <h1>전체 문서함</h1>
        <div class="sub">모든 결재 문서를 조회하고 관리합니다. (인사팀 전용)</div>
      </div>

      <!-- 툴바 (필터/정렬/검색) -->
      <div class="toolbar">
        <!-- 문서 유형 필터 -->
        <select v-model="docTypeFilter" class="select">
          <option value="ALL">전체 유형</option>
          <option v-for="type in uniqueDocTypes" :key="type" :value="type">
            {{ type }}
          </option>
        </select>

        <!-- 결재 상태 필터 -->
        <select v-model="statusFilter" class="select">
          <option value="ALL">전체 상태</option>
          <option value="DRAFT">임시저장</option>
          <option value="PENDING">대기중</option>
          <option value="APPROVED">승인됨</option>
          <option value="REJECTED">반려됨</option>
        </select>

        <!-- 정렬 -->
        <select v-model="sortOrder" class="select">
          <option value="latest">최신순</option>
          <option value="oldest">오래된순</option>
        </select>
        
        <!-- 부서 필터 -->
        <select v-model="deptFilter" class="select">
          <option value="ALL">전체 부서</option>
          <option v-for="dept in uniqueDepartments" :key="dept" :value="dept">
            {{ dept }}
          </option>
        </select>

        <!-- 기안자(이름) 필터 -->
        <select v-model="drafterFilter" class="select">
          <option value="ALL">전체 이름</option>
          <option v-for="name in uniqueDrafters" :key="name" :value="name">
            {{ name }}
          </option>
        </select>
      </div>
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
              <th>기안자</th>
              <th>부서</th>
              <th>문서 유형</th>
              <th>제출 일시</th>
              <th>상태</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="doc in filteredAndSortedDocuments" :key="doc.docId">
              <td>{{ doc.docId }}</td>
              <td>{{ doc.title }}</td>
              <td>{{ doc.drafterName }}</td> 
              <td>{{ doc.deptName }}</td>
              <td>{{ doc.docType }}</td>
              <td>{{ formatDate(doc.submittedAt) }}</td>
              <td>
                <span :class="['status-badge', getStatusClass(doc.status)]">{{ doc.status }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { fetchAllDocuments } from '@/api/approvalApi';

const loading = ref(false);
const allDocuments = ref([]);

const deptFilter = ref('ALL');
const drafterFilter = ref('ALL');
const sortOrder = ref('latest');
const statusFilter = ref('ALL'); // Missing declaration
const docTypeFilter = ref('ALL'); // Missing declaration

const uniqueDocTypes = computed(() => {
  const types = new Set(allDocuments.value.map(doc => doc.docType).filter(Boolean));
  return Array.from(types);
});

const uniqueDepartments = computed(() => {
  const depts = new Set(allDocuments.value.map(doc => doc.deptName).filter(Boolean));
  return Array.from(depts);
});

// 부서가 선택되면 해당 부서 기안자만, 아니면 전체 기안자
const uniqueDrafters = computed(() => {
  let docs = allDocuments.value;
  if (deptFilter.value !== 'ALL') {
    docs = docs.filter(doc => doc.deptName === deptFilter.value);
  }
  const drafters = new Set(docs.map(doc => doc.drafterName).filter(Boolean));
  return Array.from(drafters);
});

const fetchDocuments = async () => {
  loading.value = true;
  try {
    const response = await fetchAllDocuments();
    allDocuments.value = response.data.data || [];
  } catch (error) {
    console.error('Failed to fetch all documents:', error);
  } finally {
    loading.value = false;
  }
};

// 필터링
const processedDocuments = computed(() => {
  let result = allDocuments.value;

  // 1. 부서 필터
  if (deptFilter.value !== 'ALL') {
    result = result.filter(doc => doc.deptName === deptFilter.value);
  }

  // 2. 기안자(이름) 필터
  if (drafterFilter.value !== 'ALL') {
    result = result.filter(doc => doc.drafterName === drafterFilter.value);
  }

  // 3. 문서 유형 필터
  if (docTypeFilter.value !== 'ALL') {
    result = result.filter(doc => doc.docType === docTypeFilter.value);
  }

  // 4. 상태 필터 (statusFilter는 유지)
  if (statusFilter.value !== 'ALL') {
    result = result.filter(doc => doc.status === statusFilter.value);
  }

  return result;
});

// 정렬 로직
const filteredAndSortedDocuments = computed(() => {
  return [...processedDocuments.value].sort((a, b) => {
    const dateA = new Date(a.submittedAt);
    const dateB = new Date(b.submittedAt);
    return sortOrder.value === 'latest' ? dateB - dateA : dateA - dateB;
  });
});

watch(deptFilter, () => {
  // 부서가 바뀌면 기안자 필터 초기화 (그 부서에 없는 사람이 선택된 상태 유지 방지)
  drafterFilter.value = 'ALL';
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
    case 'PENDING': return 'in-progress';
    case 'REJECTED': return 'rejected';
    case 'DRAFT': return 'draft';
    default: return '';
  }
};

onMounted(() => {
  console.log("ApprovalAllListView mounted");
  fetchDocuments();
});
</script>

<style scoped>
.approval-list-view {
  padding: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
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

.toolbar {
  display: flex;
  gap: 12px;
  align-items: center;
}

.select {
  padding: 8px 12px;
  font-size: 13px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  background-color: #ffffff;
  cursor: pointer;
}



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

.status-badge {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}
.status-badge.approved { background-color: #dbeafe; color: #1e40af; }
.status-badge.in-progress { background-color: #fef3c7; color: #92400e; }
.status-badge.rejected { background-color: #fee2e2; color: #991b1b; }
.status-badge.draft { background-color: #e5e7eb; color: #4b5563; }
</style>
