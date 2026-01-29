<template>
  <form @submit.prevent="handleSubmit" class="form-container">
    <div class="form-row">
      <!-- Category -->
      <div class="form-group">
        <label for="category">카테고리</label>
        <select id="category" v-model="form.categoryId" required class="form-select">
          <option disabled value="">카테고리를 선택하세요</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">
            {{ cat.name }}
          </option>
        </select>
      </div>
      <!-- Title -->
      <div class="form-group title-group">
        <label for="title">제목</label>
        <input id="title" v-model="form.title" required class="form-input" />
      </div>
    </div>

    <!-- Editor -->
    <div class="form-group">
      <label>내용</label>
      <div
        ref="editorRef"
        contenteditable="true"
        class="editor"
        @input="handleContentInput"
        @drop.prevent="handleDrop"
        @dragover.prevent
        @paste="handlePaste"
        v-html="form.content"
      ></div>
    </div>

    <!-- Attachments -->
    <div class="form-group">
      <label>첨부파일</label>
      <input type="file" multiple @change="handleFileUpload" class="form-input-file" ref="fileInputRef" style="display: none;" />
      <button type="button" @click="triggerFileInput" class="btn">파일 선택</button>
      <div v-if="form.attachments.length" class="file-list">
        <div v-for="(file, index) in form.attachments" :key="index" class="file-item">
          <span>{{ file.name }}</span>
          <button type="button" @click="removeFile(index)" class="btn-remove">✕</button>
        </div>
      </div>
    </div>

    <!-- Buttons -->
    <div class="button-group">
      <button type="button" @click="$emit('cancel')" class="btn secondary">취소</button>
      <button type="submit" class="btn primary">{{ submitLabel }}</button>
    </div>
  </form>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { useNoticeStore } from '@/stores/noticeStore'

const props = defineProps({
  notice: {
    type: Object,
    default: null,
  },
  submitLabel: {
    type: String,
    default: '저장',
  },
})

const emit = defineEmits(['submit', 'cancel'])
const store = useNoticeStore()

const categories = computed(() => store.categories)
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

const form = ref({
  title: '',
  content: '',
  categoryId: '',
  attachments: [], // For new files to be uploaded
  existingAttachments: [], // For files that are already on the notice
})

const editorRef = ref(null)
const fileInputRef = ref(null)

// Populate form when notice prop is provided (for editing)
watch(
  () => props.notice,
  (newNotice) => {
    if (newNotice) {
      form.value.title = newNotice.title || ''
      form.value.content = newNotice.content || ''
      form.value.categoryId = newNotice.categoryId || ''
      form.value.existingAttachments = newNotice.attachments || [] // Assuming the prop contains attachments
      if(editorRef.value) editorRef.value.innerHTML = newNotice.content || ''
    }
  },
  { immediate: true }
)

onMounted(() => {
  if (store.categories.length === 0) {
    store.fetchCategories()
  }
  // Set initial content for contenteditable div
  if(editorRef.value) {
    editorRef.value.innerHTML = form.value.content
  }
})

function handleContentInput(e) {
  form.value.content = e.target.innerHTML
}

function insertImageAtCursor(url) {
  const img = document.createElement('img');
  img.src = url;
  img.style.maxWidth = '100%'; // Optional styling

  const selection = window.getSelection();
  if (selection.getRangeAt && selection.rangeCount) {
    const range = selection.getRangeAt(0);
    range.deleteContents();
    range.insertNode(img);
  }
}


async function uploadAndInsert(file) {
  if (!file?.type.startsWith('image/')) return
  try {
    const relativeUrl = await store.uploadImage(file)
    const absoluteUrl = apiBaseUrl + relativeUrl
    insertImageAtCursor(absoluteUrl)
    // Update content model after insertion
    if (editorRef.value) form.value.content = editorRef.value.innerHTML
  } catch (e) {
    console.error('Image upload failed:', e)
    alert('이미지 업로드에 실패했습니다.')
  }
}

function handleDrop(e) {
  const file = e.dataTransfer.files[0]
  uploadAndInsert(file)
}

function handlePaste(e) {
  const item = [...e.clipboardData.items].find((i) => i.type.startsWith('image/'))
  if (!item) return
  e.preventDefault()
  uploadAndInsert(item.getAsFile())
}

function triggerFileInput() {
  fileInputRef.value.click()
}

function handleFileUpload(e) {
  form.value.attachments.push(...e.target.files)
  e.target.value = '' // Reset file input
}

function removeFile(index) {
  form.value.attachments.splice(index, 1)
}

function handleSubmit() {
  const payload = {
    title: form.value.title,
    content: form.value.content,
    categoryId: form.value.categoryId,
    attachments: form.value.attachments,
    // When editing, you might need to handle existing attachments too
  }
  emit('submit', payload)
}
</script>

<style scoped>
.form-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.form-row {
  display: flex;
  gap: 20px;
  align-items: center;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.title-group {
  flex-grow: 1;
}
.form-select, .form-input {
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background-color: var(--panel);
  color: var(--text-main);
  height: 40px;
}
.editor {
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 10px;
  min-height: 300px;
  background-color: var(--panel);
  color: var(--text-main);
  outline: none;
}
.editor:focus {
  border-color: var(--primary);
}
.file-list {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 10px;
  background-color: var(--panel);
  border-radius: 4px;
}
.btn-remove {
  background: none;
  border: none;
  color: var(--text-sub);
  cursor: pointer;
}
.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}
.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}
.btn.primary {
  background-color: var(--primary);
  color: var(--text-on-primary);
}
.btn.secondary {
  background-color: var(--panel);
  color: var(--text-main);
  border: 1px solid var(--border);
}
</style>