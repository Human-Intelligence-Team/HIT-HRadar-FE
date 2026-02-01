<template>
  <div class="page-container">
    <h1 class="title">새 공지 작성</h1>
    <NoticeForm
      submit-label="작성 완료"
      @submit="handleSubmit"
      @cancel="router.back()"
    />
  </div>
</template>

<script setup>
import { useNoticeStore } from '@/stores/noticeStore'
import { useRouter } from 'vue-router'
import NoticeForm from '@/components/notice/NoticeForm.vue'

const store = useNoticeStore()
const router = useRouter()

async function handleSubmit(payload) {
  const { title, content, categoryId, attachments } = payload
  try {
    await store.createNotice({ title, content, categoryId }, attachments)
    router.push({ name: 'notice-list' })
  } catch (e) {
    console.error(e)
    // The alert is now handled by the Axios interceptor
  }
}
</script>

<style scoped>
.page-container {
  padding: 20px;
}
.title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 20px;
}
</style>