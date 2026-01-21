<template>
  <section>
    <!-- 상단 -->
    <div class="section-title">
      <div>
        <h1>제도·규정 관리</h1>
        <div class="sub">CSV 업로드 기반 관리</div>
      </div>
      <div class="right-actions">
        <BaseButton variant="primary" @click="showUpload = true">
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

        <!-- ✅ 목록만 스크롤 -->
        <div class="card-bd list-scroll">
          <table v-if="filtered.length" class="table">
            <tr v-for="d in filtered" :key="d.id">
              <td class="doc-title">{{ d.title }}</td>
              <td class="doc-category">{{ d.category }}</td>
              <td>
                <button class="btn small" @click="store.select(d)">보기</button>
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

        <div class="card-bd" v-if="store.selected">
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
        <div>
          <h2>업로드된 문서</h2>
          <div class="desc">최종 등록 전 편집</div>
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

      <!-- ✅ Preview 본문만 스크롤 -->
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

    <!-- 업로드 모달 -->
    <DocumentUploadModal
      v-if="showUpload"
      @close="showUpload = false"
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
const showUpload = ref(false)

onMounted(() => {
  store.loadDocuments()
})

const filtered = computed(() =>
  store.documents.filter(d =>
    d.title.toLowerCase().includes(q.value.toLowerCase())
  )
)

function commit() {
  store.commitPreview().then(() => {
    alert('문서가 등록되었습니다.')
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
}

/* =========================
   목록 스크롤
========================= */
.list-scroll {
  max-height: 420px;
  overflow-y: auto;
}

/* =========================
   Preview 스크롤
========================= */
.preview-card {
  margin-top: 16px;
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
</style>
