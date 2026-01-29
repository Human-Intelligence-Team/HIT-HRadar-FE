<template>
  <section>
    <!-- 상단 -->
    <div class="section-title">
      <div>
        <h1>제도·규정 관리</h1>
        <div class="sub">CSV 업로드 기반 관리</div>
      </div>
      <div class="right-actions">
        <BaseButton variant="primary" @click="openCreateModal">
          + 문서 업로드
        </BaseButton>
      </div>
    </div>

    <!-- 목록 / 상세 -->
    <div class="grid cols-2">
      <!-- 목록 -->
      <BaseCard>
        <div class="card-hd list-header">
          <h2>목록</h2>
          <div class="filter-controls">
            <select v-model="selectedCategory" class="input category-select">
              <option v-for="cat in uniqueCategories" :key="cat" :value="cat === '전체' ? '' : cat">{{ cat }}</option>
            </select>
            <input class="input" v-model="q" placeholder="제목 검색" />
          </div>
        </div>

        <!-- 목록만 스크롤 -->
        <div class="card-bd list-scroll">
          <div class="table-responsive" v-if="filtered.length">
            <table class="table">
            <tr v-for="d in filtered" :key="d.id">
              <td class="doc-title">{{ d.title }}</td>
              <td class="doc-category">{{ d.category }}</td>
              <td class="actions">
                <button class="btn small" @click="store.select(d)">보기</button>
                <button class="btn small btn-info" @click="openEditModal(d)">수정</button>
                <button class="btn small danger" @click="deleteDoc(d.id)">삭제</button>
              </td>
            </tr>
          </table>
          </div> 

          <div v-else class="empty-list">
            등록된 문서가 없습니다.
          </div>
        </div>
      </BaseCard>

      <!-- 상세 -->
      <BaseCard>
        <div class="card-hd">
          <h2>상세</h2>
        </div>

        <div class="card-bd detail-content-scroll" v-if="store.selected">
          <h3>{{ store.selected.title }}</h3>
          <p class="category">카테고리: {{ store.selected.category }}</p>

          <div
            v-for="c in store.selected.chunks"
            :key="c.index"
            class="detail-chunk"
          >
            <h4>{{ c.section }}</h4>
            <p>{{ c.content }}</p>
          </div>
        </div>

        <div class="card-bd empty" v-else>
          선택된 문서가 없습니다.
        </div>
      </BaseCard>

    </div>

    <!-- =========================
         Preview (스크롤 영역)
    ========================= -->
    <BaseCard v-if="store.preview" class="preview-card">
      <div class="card-hd preview-header">
                  <div style="display: flex; align-items: center; gap: 15px;">
                    <div>
                      <h2>업로드된 문서</h2>
                      <div class="desc">최종 등록 전 편집</div>
                    </div>
                    <div class="category-selection">
                      <label class="label">문서 카테고리</label>
                      <input class="input" type="text" v-model="previewDocType" placeholder="카테고리를 입력하세요" required ref="previewCategoryInput" />
                    </div>
                  </div>
      
                  <div class="right-actions">
                    <button class="btn ghost" @click="store.addChunk">
                      + 리스트 추가
                    </button>
                    <button class="btn primary" @click="commit">
                      최종 등록
                    </button>
                    <button class="btn" @click="store.clearPreview">
                      취소
                    </button>
                  </div>
                </div>
      <!-- Preview 본문만 스크롤 -->
      <div class="card-bd preview-scroll">
        <!-- 문서 제목 -->
        <div class="doc-title-box">
          <label class="label">문서 제목</label>
          <input
            class="input title-input"
            v-model="store.preview.docTitle"
            required
            ref="previewTitleInput"
          />
        </div>

        <!-- 청크 목록 -->
        <div
          v-for="(c, i) in store.preview.chunks"
          :key="i"
          class="chunk-card"
        >
          <div class="chunk-header">
            <span class="chunk-index">리스트 {{ i + 1 }}</span>
            <button
              class="btn small danger"
              @click="store.removeChunk(i)"
            >
              삭제
            </button>
          </div>

          <input
            class="input chunk-section"
            placeholder="섹션 제목"
            v-model="c.section"
          />

          <textarea
            class="textarea chunk-content"
            placeholder="내용"
            v-model="c.content"
          />
        </div>
      </div>
    </BaseCard>

    <!-- 문서 생성/수정 모달 -->
    <DocumentUploadModal
      v-if="showModal"
      :mode="modalMode"
      :document="editingDocument"
      @close="closeModal"
      @document-saved="handleDocumentSaved"
    />
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useDocumentStore } from '@/stores/documentStore'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseCard from '@/components/common/BaseCard.vue'
import DocumentUploadModal from '@/components/policy/DocumentUploadModal.vue'

const store = useDocumentStore()
const q = ref('')
const selectedCategory = ref('') // New ref for category filter
const showModal = ref(false)
const modalMode = ref('create') // 'create' or 'edit'
const editingDocument = ref(null)
const previewDocType = ref('') // Default to empty string
const previewCategoryInput = ref(null) // Ref for the category input
const previewTitleInput = ref(null) // Ref for the title input

onMounted(() => {
  store.loadDocuments()
})

const uniqueCategories = computed(() => {
  const categories = new Set(store.documents.map(d => d.category).filter(Boolean));
  return ['전체', ...Array.from(categories).sort()];
});

const filtered = computed(() =>
  store.documents.filter(d => {
    const matchesTitle = d.title.toLowerCase().includes(q.value.toLowerCase());
    const matchesCategory = selectedCategory.value === '전체' || !selectedCategory.value || d.category === selectedCategory.value;
    return matchesTitle && matchesCategory;
  })
)

function openCreateModal() {
  modalMode.value = 'create'
  editingDocument.value = null
  showModal.value = true
  previewDocType.value = '' // Reset preview type to empty when opening create modal
}

async function openEditModal(doc) {
  // Fetch full details before opening modal for editing
  await store.select(doc)
  modalMode.value = 'edit'
  editingDocument.value = store.selected // Use store.selected which has full details
  showModal.value = true
}

async function deleteDoc(id) {
  if (confirm('정말로 이 문서를 삭제하시겠습니까?')) {
    try {
      await store.deleteDocument(id)
      alert('문서가 삭제되었습니다.')
      store.loadDocuments() // Refresh the list
    } catch (error) {
      alert('문서 삭제에 실패했습니다: ' + error.message)
    }
  }
}

function closeModal() {
  showModal.value = false
  editingDocument.value = null
  store.selected = null // Clear selected document from store
}

function handleDocumentSaved() {
  closeModal()
  store.loadDocuments() // Refresh list after saving
}

function commit() {
  if (!store.preview?.docTitle.trim()) {
    alert('문서 제목을 입력해주세요.');
    previewTitleInput.value?.focus();
    return;
  }
  if (!previewDocType.value.trim()) {
    alert('문서 카테고리를 입력해주세요.');
    previewCategoryInput.value?.focus();
    return;
  }

  store.commitPreview(previewDocType.value).then(() => {
    alert('문서가 등록되었습니다.')
    store.loadDocuments() // Ensure list is reloaded after commit
    previewDocType.value = '' // Reset after commit
  }).catch(error => {
    alert('문서 등록에 실패했습니다: ' + error.message)
  })
}
</script>

<style scoped>
.grid.cols-2 {
  display: grid;
  grid-template-columns: 1fr 1fr; /* Make columns equal width */
  gap: 20px; /* Add some spacing between columns */
}

.input {
  height: 40px; /* Fixed height for consistency */
  padding: 8px 12px; /* Standard padding */
  border: 1px solid #cfd3d8; /* Matching existing border */
  border-radius: 8px; /* Matching existing border-radius */
}

.empty-list {
  padding: 40px;
  text-align: center;
  color: #777;
}

.doc-title {
  font-weight: 600;
}

.doc-category {
  font-size: 13px;
  color: #777;
  text-align: center; /* Center category text */
}

.actions {
  white-space: nowrap; /* Prevent buttons from wrapping */
  text-align: right; /* Align action buttons to the right */
}

.actions .btn {
  margin-left: 5px; /* Spacing between action buttons */
}

.btn-info {
  background-color: #1a73e8; /* Example blue color */
  color: white;
}

.btn-info:hover {
  background-color: #155cb0; /* Darker blue on hover */
}

.btn.danger {
  background-color: #dc3545; /* Red color */
  color: white;
}

.btn.danger:hover {
  background-color: #bd2130; /* Darker red on hover */
}

.card-hd {
  display: flex;
  align-items: center; /* Vertically center items */
  justify-content: space-between; /* Separate items horizontally */
  flex-wrap: wrap; /* Allow items to wrap on smaller screens */
}

.card-hd.list-header { /* Targeting the specific card-hd for list */
  display: flex;
  align-items: center;
  justify-content: space-between; /* Space out h2 and filter controls */
  flex-wrap: wrap;
}

.filter-controls {
  display: flex;
  gap: 10px; /* Space between select and input */
  align-items: center;
}

.category-select {
  padding: 8px 12px;
  border: 1px solid #cfd3d8;
  border-radius: 8px;
  background-color: #fff;
  cursor: pointer;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3e%3c/svg%3e"); /* Custom arrow */
  background-size: 10px 10px; /* Adjust size */
  background-repeat: no-repeat;
  background-position: right 10px center;
  padding-right: 30px;
}
.card-hd h2 {
  writing-mode: horizontal-tb;
  text-orientation: mixed;
  margin-right: 10px;
}

/* =========================
   목록 스크롤
========================= */
.list-scroll {
  max-height: 420px;
  overflow-y: auto;
}

/* =========================
   상세 내용 스크롤 (새로운 스타일)
========================= */
.detail-content-scroll {
  max-height: 420px; /* Adjust as needed */
  overflow-y: auto;
  padding-right: 6px; /* To prevent scrollbar from overlapping content */
}


/* =========================
   Preview 스크롤
========================= */
.preview-card {
  margin-top: 16px;
}

.preview-header .right-actions {
  display: flex;
  gap: 10px; /* Space out buttons in preview header */
}

.preview-scroll {
  max-height: 420px;
  overflow-y: auto;
  padding-right: 6px;
}

/* =========================
   문서 제목
========================= */
.doc-title-box {
  margin-bottom: 24px;
}

.title-input {
  font-size: 18px;
  font-weight: 600;
}

/* =========================
   청크 카드
========================= */
.chunk-card {
  margin-bottom: 20px;
  padding: 16px;
  border: 1px solid #e6e8eb;
  border-radius: 12px;
  background: #fafafa;
}

.chunk-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.chunk-index {
  font-size: 12px;
  font-weight: 600;
  color: #888;
}

.chunk-section {
  font-weight: 600;
  margin-bottom: 8px;
}

.chunk-content {
  min-height: 90px;
  line-height: 1.5;
}

/* =========================
   상세 뷰 청크 디자인
========================= */
.detail-chunk {
  background-color: #f9f9f9; /* Light background */
  border: 1px solid #e0e0e0; /* Subtle border */
  border-radius: 8px; /* Rounded corners */
  padding: 15px; /* Internal spacing */
  margin-bottom: 15px; /* Space between chunks */
}

.detail-chunk:last-child {
  margin-bottom: 0; /* No margin for the last chunk */
}

.detail-chunk h4 {
  font-size: 1.1em;
  color: #333;
  margin-top: 0;
  margin-bottom: 10px;
  border-bottom: 1px dashed #e0e0e0; /* A dashed line to separate section title */
  padding-bottom: 5px;
}

.detail-chunk p {
  font-size: 0.95em;
  color: #555;
  line-height: 1.6;
  margin-bottom: 0;
}

.table-responsive {
  overflow-x: auto; /* Enable horizontal scrolling */
}

.table {
  width: 100%;
  /* table-layout: fixed; */ /* Removed fixed table layout */
  /* min-width: 700px; */    /* Removed explicit min-width */
}

.table tr td {
  vertical-align: middle;
  padding: 12px 8px;
  white-space: normal; /* Allow text to wrap */
  word-break: break-word; /* Break long words */
}

.table tr td.doc-title {
  min-width: 150px; /* Ensure title has minimum space */
}

.table tr td.doc-category {
  min-width: 120px; /* Minimum width for category */
  text-align: center; /* Center category text */
}

.table tr td.actions {
  min-width: 180px; /* Minimum width for actions (enough for 3 buttons) */
  white-space: nowrap; /* Prevent buttons from wrapping */
  text-align: right; /* Align action buttons to the right */
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.category-selection {
  display: flex;
  align-items: center;
}

.category-selection .label {
  font-weight: 600;
  font-size: 0.85em;
  writing-mode: horizontal-tb;
  min-width: 85px; /* Increased min-width for the label */
  flex-shrink: 0;
  margin : 0;
}

.radio-group {
  display: flex;
  gap: 10px;
}

.radio-group label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 0.9em;
}

.radio-group input[type="radio"] {
  margin-right: 3px;
}
</style>
