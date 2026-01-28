<template>
  <div class="modal-backdrop" @click.self="close">
    <div class="modal-surface">
      <BaseCard class="upload-card">
        <!-- Header -->
        <div class="card-hd">
          <div>
            <h2>{{ isEditMode ? '문서 수정' : '문서 업로드' }}</h2>
            <div class="desc">
              {{ isEditMode ? '문서 내용을 편집하세요' : 'CSV 파일을 업로드하세요' }}
            </div>
          </div>
          <button class="btn ghost" @click="close">✕</button>
        </div>

        <!-- Body -->
        <div class="card-bd">
          <div v-if="isEditMode">
            <div class="category-selection">
              <label class="label">문서 카테고리</label>
              <input class="input" type="text" v-model="docType" placeholder="카테고리를 입력하세요" required />
            </div>
            <div class="doc-title-box">
              <label class="label">문서 제목</label>
              <input class="input title-input" v-model="editedDocument.docTitle" required />
            </div>

            <div v-for="(c, i) in editedDocument.chunks" :key="i" class="chunk-card">
              <div class="chunk-header">
                <span class="chunk-index">리스트 {{ i + 1 }}</span>
                <button class="btn small danger" @click="removeChunk(i)">
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

            <div class="actions-row">
              <button class="btn ghost" @click="addChunk">
                + 리스트 추가
              </button>
              <button class="btn primary" @click="saveDocument" :disabled="isSaveDisabled">
                저장
              </button>
            </div>
          </div>

          <div v-else class="upload-box">
            <input
              ref="fileInput"
              type="file"
              accept=".csv"
              hidden
              @change="onFile"
            />

            <div class="upload-inner" @click="fileInput.click()">
              <div class="icon">📄</div>
              <div class="text">
                <b>CSV 파일 선택</b>
                <div class="sub">클릭하여 업로드</div>
              </div>
            </div>

            <button class="btn small" @click="downloadTemplate">
              CSV 템플릿 다운로드
            </button>
          </div>
        </div>
      </BaseCard>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { useDocumentStore } from '@/stores/documentStore'
import { downloadDocumentTemplate } from '@/api/documentApi'
import BaseCard from '@/components/common/BaseCard.vue'

const props = defineProps({
  mode: {
    type: String,
    default: 'create' // 'create' or 'edit'
  },
  document: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'document-saved'])
const store = useDocumentStore()
const fileInput = ref(null)
const editedDocument = reactive({
  id: null,
  docTitle: '',
  chunks: []
})

const docType = ref('') // Default to empty string

const isEditMode = computed(() => props.mode === 'edit')

// Watch for changes in props.document to update editedDocument
watch(() => props.document, (newDoc) => {
  if (newDoc && isEditMode.value) {
    editedDocument.id = newDoc.id
    editedDocument.docTitle = newDoc.title // assuming 'title' for display
    editedDocument.chunks = newDoc.chunks ? JSON.parse(JSON.stringify(newDoc.chunks)) : []
    docType.value = newDoc.category || '' // Initialize docType from category, default to empty
  } else {
    // Reset for create mode or if document is cleared
    editedDocument.id = null
    editedDocument.docTitle = ''
    editedDocument.chunks = []
    docType.value = '' // Reset docType to empty
  }
}, { immediate: true })

const isSaveDisabled = computed(() => {
  return !docType.value.trim() || !editedDocument.docTitle.trim();
})


function close() {
  emit('close')
}

async function onFile(e) {
  const file = e.target.files[0]
  if (!file) return

  try {
    await store.uploadCsv(file)
    await nextTick()
    emit('document-saved') // Notify parent that document was saved (created)
  } catch (e) {
    alert('CSV 업로드 실패: ' + e.message)
  }
}

async function saveDocument() {
  try {
    const payload = {
      docTitle: editedDocument.docTitle,
      chunks: editedDocument.chunks,
      category: docType.value // Add selected category to payload
    }
    await store.updateDocument(editedDocument.id, payload)
    alert('문서가 성공적으로 수정되었습니다.')
    emit('document-saved') // Notify parent that document was saved (updated)
  } catch (error) {
    alert('문서 수정에 실패했습니다: ' + error.message)
  }
}

function addChunk() {
  editedDocument.chunks.push({
    section: '',
    content: ''
  })
}

function removeChunk(index) {
  editedDocument.chunks.splice(index, 1)
}

async function downloadTemplate() {
  const blob = await downloadDocumentTemplate()
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = 'document_template.csv'
  a.click()

  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.modal-surface {
  background: rgba(255,255,255,0.92);
  border-radius: 14px;
  max-height: 80vh; /* Limit modal height */
  display: flex;
  flex-direction: column;
  overflow: hidden; /* Handle overflow from children */
}

.upload-card {
  width: 520px;
  padding: 20px; /* Add padding here instead of modal-surface */
  flex-grow: 1; /* Allow card to grow within modal-surface */
  display: flex;
  flex-direction: column;
  min-height: 0; /* Important for flex items with overflow */
}

.card-bd {
  flex-grow: 1; /* Allow card body to take available space */
  overflow-y: auto; /* Enable vertical scrolling */
}

.upload-box {
  border: 1px dashed #cfd3d8;
  border-radius: 10px;
  padding: 24px;
  text-align: center;
}

.upload-inner {
  cursor: pointer;
}

.icon {
  font-size: 32px;
  margin-bottom: 8px;
}

/* Edit mode specific styles */
.doc-title-box {
  margin-bottom: 24px;
}

.title-input {
  font-size: 18px;
  font-weight: 600;
}

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

.actions-row {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.category-selection {
  margin-bottom: 20px;
}

.category-selection .label {
  display: block; /* Re-add block display */
  margin-bottom: 8px; /* Re-add margin */
  font-weight: 600;
}
</style>
