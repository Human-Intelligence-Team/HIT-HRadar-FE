<template>
  <div class="page-container">
    <div v-if="loading" class="loading-indicator">
      <p>Loading...</p>
    </div>
    
    <div v-else-if="!notice" class="no-data">
      <p>공지사항을 찾을 수 없습니다.</p>
       <button @click="goBack" class="btn secondary">목록으로</button>
    </div>

    <div v-else class="notice-container">
      <div class="notice-header">
        <h1 class="notice-title">{{ notice.title }}</h1>
        <div class="notice-meta">
          <span>ID: {{ notice.noticeId }}</span>
          <span>|</span>
          <span>카테고리: {{ notice.categoryName }}</span>
          <span>|</span>
          <span>작성자: {{ notice.createdByName }}</span>
          <span>|</span>
          <span>작성일: {{ formatDateTime(notice.createdAt) }}</span>
          <template v-if="notice.updatedAt">
            <span>|</span>
            <span>최종 수정자: {{ notice.updatedByName }}</span>
            <span>|</span>
            <span>수정일: {{ formatDateTime(notice.updatedAt) }}</span>
          </template>
        </div>
      </div>

      <div class="notice-content" v-html="notice.content">
      </div>

      <!-- Attachments - assuming notice.attachments will contain data like { url, name } -->
      <div v-if="notice.attachments && notice.attachments.length > 0" class="attachment-section">
        <h3>첨부파일</h3>
        <ul>
          <li v-for="(file, index) in notice.attachments" :key="index">
            <a :href="file.url" target="_blank" rel="noopener noreferrer">{{ file.name }}</a>
          </li>
        </ul>
      </div>

      <div class="button-group">
        <button @click="goBack" class="btn secondary">목록</button>
        <!-- The logic for isCurrentUserAuthor needs to be revised based on available API data -->
        <!-- For now, assuming current user can edit/delete for demonstration -->
        <div class="author-actions">
          <button @click="goToEdit" class="btn primary">수정</button>
          <button @click="handleDelete" class="btn danger">삭제</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue';
import { useNoticeStore } from '@/stores/noticeStore';
// import { useAuthStore } from '@/stores/authStore'; // Auth store might be needed for actual authorization checks
import { useRouter, useRoute } from 'vue-router';

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
});

const store = useNoticeStore();
// const authStore = useAuthStore(); // Uncomment if needed for authorization
const router = useRouter();
const route = useRoute();
const noticeId = route.params.id; // Get ID from route params

const notice = computed(() => store.currentNotice);
const loading = computed(() => store.loading);

onMounted(() => {
  store.fetchNoticeDetail(noticeId);
});

function goBack() {
  router.push({ name: 'notice-list' });
}

function goToEdit() {
  router.push({ name: 'notice-edit', params: { id: noticeId } });
}

async function handleDelete() {
  if (confirm('정말로 이 공지사항을 삭제하시겠습니까?')) {
    try {
      await store.deleteNotice(noticeId);
      router.push({ name: 'notice-list' });
    } catch (error) {
      // Alert is handled by Axios interceptor
      console.error('Failed to delete notice:', error);
    }
  }
}

function formatDateTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}
</script>

<style scoped>
.page-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  color: var(--text-main);
}

.notice-container {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 30px;
}

.notice-header {
  border-bottom: 1px solid var(--border);
  padding-bottom: 20px;
  margin-bottom: 20px;
}

.notice-title {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 10px;
}

.notice-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  font-size: 13px;
  color: var(--text-sub);
}
.notice-meta span {
    white-space: nowrap; /* Prevent breaking in the middle of a meta item */
}

.notice-content {
  margin-bottom: 30px;
  min-height: 100px; /* Ensure content area has some height */
  line-height: 1.7;
  font-size: 16px;
  white-space: pre-wrap; /* For rendering potential plain text with line breaks */
}

/* Style images within the content */
.notice-content :deep(img) {
  max-width: 100%;
  height: auto;
  display: block; /* Prevent extra space below image */
  margin: 10px 0; /* Some spacing above/below images */
  border-radius: 4px;
}

.attachment-section {
  margin-top: 20px;
  padding: 20px;
  background-color: var(--background-color);
  border-radius: 6px;
  border: 1px solid var(--border);
}

.attachment-section h3 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 18px;
  color: var(--text-main);
}

.attachment-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.attachment-section li {
    margin-bottom: 8px;
}

.attachment-section li a {
  color: var(--primary);
  text-decoration: none;
  font-size: 15px;
  display: flex;
  align-items: center;
  gap: 5px;
}
.attachment-section li a:hover {
    text-decoration: underline;
}
/* Optional: add an icon for attachments */
.attachment-section li a::before {
    content: "📎"; /* Paperclip emoji or a custom icon */
    font-size: 1em;
}

.button-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 30px;
}

.author-actions {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s;
}

.btn.primary {
  background-color: var(--primary);
  color: var(--text-on-primary);
}

.btn.primary:hover {
    background-color: var(--primary-dark);
}

.btn.secondary {
  background-color: var(--background-color);
  color: var(--text-main);
  border: 1px solid var(--border);
}
.btn.secondary:hover {
    background-color: var(--panel);
}

.btn.danger {
    background-color: var(--danger);
    color: var(--text-on-primary);
}
.btn.danger:hover {
    background-color: var(--danger-dark);
}

.loading-indicator, .no-data {
  text-align: center;
  padding: 50px;
  color: var(--text-sub);
}
</style>