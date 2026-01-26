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
        <div class="card-hd">
          <h2>목록</h2>
          <input class="input" v-model="q" placeholder="제목 검색" />
        </div>

        <!-- 목록만 스크롤 -->
        <div class="card-bd list-scroll">
          <table v-if="filtered.length" class="table">
            <tr v-for="d in filtered" :key="d.id">
              <td class="doc-title">{{ d.title }}</td>
              <td class="doc-category">{{ d.category }}</td>
              <td class="actions">
                <button class="btn small" @click="store.select(d)">보기</button>
                <button class="btn small" @click="openEditModal(d)">수정</button>
                <button class="btn small danger" @click="deleteDoc(d.id)">삭제</button>
              </td>
            </tr>
          </table>

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
                      <label class="label">문서 종류</label>
                      <div class="radio-group">
                        <label>
                          <input type="radio" value="제도" v-model="previewDocType" /> 제도
                        </label>
                        <label>
                          <input type="radio" value="규정" v-model="previewDocType" /> 규정
                        </label>
                      </div>
                    </div>
                  </div>
      
                  <div class="right-actions">
                    <button class="btn ghost" @click="store.addChunk">
                      + 청크 추가
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
const showModal = ref(false)
const modalMode = ref('create') // 'create' or 'edit'
const editingDocument = ref(null)
const previewDocType = ref('규정') // Default to '규정'

onMounted(() => {
  store.loadDocuments()
})

const filtered = computed(() =>
  store.documents.filter(d =>
    d.title.toLowerCase().includes(q.value.toLowerCase())
  )
)

function openCreateModal() {
  modalMode.value = 'create'
  editingDocument.value = null
  showModal.value = true
  previewDocType.value = '규정' // Reset preview type when opening create modal
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
  store.commitPreview(previewDocType.value).then(() => {
    alert('문서가 등록되었습니다.')
    store.loadDocuments() // Ensure list is reloaded after commit
    previewDocType.value = '규정' // Reset after commit
  }).catch(error => {
    alert('문서 등록에 실패했습니다: ' + error.message)
  })
}
</script>

<style scoped>
/* =========================
   공통
========================= */
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

.card-hd {
  display: flex;
  align-items: center; /* Vertically center items */
  justify-content: space-between; /* Separate items horizontally */
  flex-wrap: wrap; /* Allow items to wrap on smaller screens */
}

.card-hd h2 {
  writing-mode: horizontal-tb; /* Ensure horizontal text display */
  text-orientation: mixed; /* Handle text orientation */
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

.table tr td {
  vertical-align: middle;
}

.category-selection {
  /* margin-bottom: 20px; */ /* Removed margin-bottom as it's inline in flex */
}

.category-selection .label {
  display: block;
  margin-bottom: 4px; /* Reduced margin for compact layout */
  font-weight: 600;
  font-size: 0.85em; /* Smaller label for compact layout */
}

.radio-group {
  display: flex;
  gap: 10px; /* Reduced gap for compact layout */
}

.radio-group label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 0.9em; /* Smaller text for compact layout */
}

.radio-group input[type="radio"] {
  margin-right: 3px; /* Reduced margin for compact layout */
}
</style>
