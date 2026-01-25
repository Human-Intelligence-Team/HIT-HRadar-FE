<template>
  <div class="modal-backdrop" @click.self="close">
    <div class="modal-surface">
      <BaseCard class="upload-card">
        <!-- Header -->
        <div class="card-hd">
          <div>
            <h2>문서 업로드</h2>
            <div class="desc">CSV 파일을 업로드하세요</div>
          </div>
          <button class="btn ghost" @click="close">✕</button>
        </div>

        <!-- Body -->
        <div class="card-bd">
          <div class="upload-box">
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
import { ref, nextTick } from 'vue'
import { useDocumentStore } from '@/stores/documentStore'
import { downloadDocumentTemplate } from '@/api/documentApi'
import BaseCard from '@/components/common/BaseCard.vue'

const emit = defineEmits(['close'])
const store = useDocumentStore()
const fileInput = ref(null)

function close() {
  emit('close')
}

async function onFile(e) {
  const file = e.target.files[0]
  if (!file) return

  try {
    await store.uploadCsv(file)

    await nextTick()
    close()
  } catch (e) {
    alert('CSV 업로드 실패')
  }
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
  padding: 12px;
}

.upload-card {
  width: 520px;
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
</style>
