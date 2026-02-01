<template>
  <div class="page">
    <div class="section-title">
      <h1>결재 문서 조회</h1>
    </div>

    <div class="tabs-container">
      <div class="tabs">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          :class="['tab-btn', { active: currentTab === tab.id }]"
          @click="currentTab = tab.id"
        >
          {{ tab.name }}
          <span v-if="documents.length > 0 && currentTab === tab.id" class="count">{{ documents.length }}</span>
        </button>
      </div>

      <div class="tab-panel card">
        <div v-if="loading" class="loading-state">
          데이터를 불러오는 중입니다...
        </div>
        <table v-else class="table">
          <thead>
            <tr>
              <th>문서 ID</th>
              <th>제목</th>
              <th>문서 유형</th>
              <th>상태</th>
              <th>제출 일시</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="documents.length === 0">
              <td colspan="5" class="no-data">조회된 문서가 없습니다.</td>
            </tr>
            <tr v-for="doc in documents" :key="doc.docId" @click="goToDetail(doc.docId)">
              <td>{{ doc.docId }}</td>
              <td class="title-cell">{{ doc.title }}</td>
              <td><span class="type-badge">{{ doc.docType }}</span></td>
              <td>
                <span :class="['status-badge', getStatusClass(doc.status)]">
                  {{ doc.status }}
                </span>
              </td>
              <td class="date-cell">{{ formatDate(doc.submittedAt) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { 
  fetchMyDocuments, 
  fetchApprovalTasks, 
  fetchRejectedDocuments, 
  fetchReferenceDocuments 
} from '@/api/approvalApi';

const router = useRouter();
const documents = ref([]);
const loading = ref(false);
const currentTab = ref('my');

const tabs = [
  { id: 'my', name: '내 문서함' },
  { id: 'inbox', name: '결재할 문서' },
  { id: 'rejected', name: '반려된 문서' },
  { id: 'references', name: '참조된 문서' }
];

const fetchDocuments = async () => {
  loading.value = true;
  try {
    let response;
    if (currentTab.value === 'my') {
      response = await fetchMyDocuments();
    } else if (currentTab.value === 'inbox') {
      response = await fetchApprovalTasks();
    } else if (currentTab.value === 'rejected') {
      response = await fetchRejectedDocuments();
    } else if (currentTab.value === 'references') {
      response = await fetchReferenceDocuments();
    }
    
    if (response && response.data && response.data.data) {
      documents.value = response.data.data;
    } else {
      documents.value = [];
    }
  } catch (error) {
    console.error('Failed to fetch documents:', error);
    documents.value = [];
  } finally {
    loading.value = false;
  }
};

watch(currentTab, () => {
  fetchDocuments();
});

const goToDetail = (docId) => {
  router.push(`/approval/${docId}`);
};

const formatDate = (datetime) => {
  if (!datetime) return '-';
  const date = new Date(datetime);
  return date.toLocaleString('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getStatusClass = (status) => {
  switch (status) {
    case 'APPROVED': return 'approved';
    case 'REJECTED': return 'rejected';
    case 'IN_PROGRESS': return 'in-progress';
    case 'DRAFT': return 'draft';
    default: return 'default';
  }
};

onMounted(() => {
  fetchDocuments();
});
</script>

<style scoped>
.page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 32px 20px;
}
.section-title {
  margin-bottom: 32px;
}
.section-title h1 {
  font-size: 26px;
  font-weight: 700;
  color: #191f28;
}
.tabs-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.tabs {
  display: flex;
  gap: 8px;
  border-bottom: 1px solid #e5e8eb;
  padding-bottom: 2px;
}
.tab-btn {
  padding: 12px 16px;
  font-size: 15px;
  font-weight: 600;
  color: #8b95a1;
  background: none;
  border: none;
  cursor: pointer;
  position: relative;
  transition: color 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}
.tab-btn:hover {
  color: #4e593d;
}
.tab-btn.active {
  color: #3182f6;
}
.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 3px;
  background-color: #3182f6;
  border-radius: 3px 3px 0 0;
}
.count {
  font-size: 11px;
  background: #f2f4f6;
  color: #4e5968;
  padding: 2px 6px;
  border-radius: 10px;
}
.active .count {
  background: #e8f3ff;
  color: #3182f6;
}
.card {
  background: #ffffff;
  border-radius: 20px;
  padding: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
}
.table {
  width: 100%;
  border-collapse: collapse;
}
.table th {
  padding: 14px 16px;
  text-align: left;
  font-size: 13px;
  font-weight: 600;
  color: #8b95a1;
  background: #f9fafb;
}
.table td {
  padding: 18px 16px;
  font-size: 14px;
  color: #333d4b;
  border-bottom: 1px solid #f2f4f6;
}
.table tbody tr {
  cursor: pointer;
  transition: background 0.2s;
}
.table tbody tr:hover {
  background-color: #f9fafb;
}
.title-cell {
  font-weight: 500;
  color: #191f28;
}
.type-badge {
  font-size: 12px;
  color: #6b7684;
  background: #f2f4f6;
  padding: 4px 8px;
  border-radius: 6px;
}
.status-badge {
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 10px;
}
.status-badge.approved { background: #e7f5ff; color: #1c7ed6; }
.status-badge.rejected { background: #fff0f6; color: #d6336c; }
.status-badge.in-progress { background: #fff4e6; color: #fd7e14; }
.status-badge.draft { background: #f8f9fa; color: #495057; }
.status-badge.default { background: #f8f9fa; color: #495057; }
.date-cell {
  color: #8b95a1;
  font-size: 13px;
}
.loading-state, .no-data {
  text-align: center;
  padding: 60px;
  color: #8b95a1;
  font-size: 15px;
}
</style>
