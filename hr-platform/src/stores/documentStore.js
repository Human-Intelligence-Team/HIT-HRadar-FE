// stores/documentStore.ts
import { defineStore } from 'pinia'
import {
  fetchDocuments,
  previewDocumentCsv,
  commitDocument,
  fetchDocumentDetail,
} from '@/api/documentApi'

export const useDocumentStore = defineStore('document', {
  state: () => ({
    documents: [],
    selected: null,
    preview: null
  }),

  actions: {
    /* =========================
       문서 목록
    ========================= */
    async loadDocuments() {
      this.documents = await fetchDocuments()
    },

    async select(doc) {
      const detail = await fetchDocumentDetail(doc.id)
      this.selected = detail
    },

    /* =========================
       CSV → Preview
    ========================= */
    async uploadCsv(file) {
      const res = await previewDocumentCsv(file)

      // 서버 응답 구조 그대로 매핑
      this.preview = {
        docTitle: res.data.docTitle,
        chunks: res.data.chunks.map(c => ({
          section: c.section,
          content: c.content
        }))
      }
    },

    /* =========================
       Preview 편집
    ========================= */
    addChunk() {
      this.preview.chunks.push({
        section: '',
        content: ''
      })
    },

    removeChunk(index) {
      this.preview.chunks.splice(index, 1)
    },

    clearPreview() {
      this.preview = null
    },

    /* =========================
       최종 등록
    ========================= */
    async commitPreview() {
      if (!this.preview) return

      await commitDocument(this.preview)

      // 등록 후 처리
      await this.loadDocuments()
      this.preview = null
    }
  }
})
