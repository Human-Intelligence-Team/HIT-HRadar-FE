<template>
  <div class="page-container">
    <h1 class="title">공지사항 수정</h1>

    <div v-if="loading" class="loading-indicator">
      Loading...
    </div>

    <NoticeForm
      v-else-if="notice"
      :notice="notice"
      submit-label="수정 완료"
      @submit="handleSubmit"
      @cancel="router.back()"
    />
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useNoticeStore } from '@/stores/noticeStore'
import { useRouter, useRoute } from 'vue-router'
import NoticeForm from '@/components/notice/NoticeForm.vue'

const store = useNoticeStore()
const router = useRouter()
const route = useRoute()
const noticeId = route.params.id

const notice = computed(() => store.currentNotice)
const loading = computed(() => store.loading && !store.currentNotice)

onMounted(() => {
  store.fetchNoticeDetail(noticeId)
})

async function handleSubmit(payload) {
  const { title, content, categoryId, attachments } = payload
  try {
    await store.updateNotice(noticeId, { title, content, categoryId }, attachments)
    router.push({ name: 'notice-detail', params: { id: noticeId } })
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
.loading-indicator {
  text-align: center;
  padding: 40px;
  color: var(--text-sub);
}
</style>