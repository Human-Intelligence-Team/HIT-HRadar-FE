<template>
  <div class="modal">
    <div class="header">
      <span>알림</span>
      <button class="close" @click="$emit('close')">✕</button>
    </div>

    <ul class="list">
      <li
        v-for="n in store.notifications"
        :key="n.id"
        :class="{ unread: !n.read }"
      >
        <div class="content" @click="go(n)">
          <div class="title">{{ n.title }}</div>
          <div class="msg">{{ n.message }}</div>
          <div class="time">{{ formatTime(n.createdAt) }}</div>
        </div>

        <div class="actions">
          <button
            v-if="!n.read"
            class="read"
            @click.stop="store.read(n.id)"
          >
            읽음
          </button>
          <button
            class="remove"
            @click.stop="store.remove(n.id)"
          >
            삭제
          </button>
        </div>
      </li>

      <li v-if="store.notifications.length === 0" class="empty">
        알림이 없습니다.
      </li>
    </ul>

    <!-- 맨 아래 전체 읽기 -->
    <div class="footer">
      <button
        class="read-all"
        :disabled="store.unreadCount === 0"
        @click="readAll"
      >
        전체 읽기
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useNotificationStore } from '@/stores/notificationStore'

const router = useRouter()
const store = useNotificationStore()

async function go(n) {
  if (!n.read) {
    await store.read(n.id)
  }
  if (n.linkUrl) {
    await router.push(n.linkUrl)
  }
}

async function readAll() {
  await store.readAll()
}

function formatTime(iso) {
  return new Date(iso).toLocaleString()
}
</script>

<style scoped>
.modal {
  position: absolute;
  right: 0;
  top: 36px;
  width: 360px;
  background: #ffffff;
  border-radius: 14px;
  box-shadow: 0 20px 40px rgba(0,0,0,.18);
  overflow: hidden;
  color: #0f172a;                    /* 기본 텍스트 색 */
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  font-weight: 700;
  border-bottom: 1px solid #e5e7eb;
}

.close {
  background: none;
  border: none;
  font-size: 14px;
  cursor: pointer;
  color: #64748b;
}

.close:hover {
  color: #0f172a;
}

.list {
  max-height: 420px;
  overflow-y: auto;

  padding: 0;
  margin: 0;
  list-style: none;
}

li {
  position: relative;
  display: flex;
  gap: 12px;
  padding: 14px 16px;
  border-bottom: 1px solid #f1f5f9;
  background: #fff;
}

/* unread 배경 레이어 */
li.unread::before {
  content: '';
  position: absolute;
  inset: 0;
  background: #f0f7ff;
  z-index: 0;
}

/* 실제 내용은 위로 */
li > * {
  position: relative;
  z-index: 1;
}

li:last-child {
  border-bottom: none;
}
/* 안 읽은 알림 강조 */
li.unread {
  background: #f0f7ff;
}

.content {
  flex: 1;
  cursor: pointer;
}

.title {
  font-weight: 700;
  margin-bottom: 4px;
  font-size: 14px;
}

.msg {
  font-size: 13px;
  color: #475569;
  margin: 0;
  padding: 0;
  line-height: 1.4;
}

.time {
  margin-top: 6px;
  font-size: 11px;
  color: #94a3b8;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: flex-end;
}

/* 버튼 스타일 */
.actions button {
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 999px;
  cursor: pointer;
  border: 1px solid transparent;
  background: #f8fafc;
  color: #334155;
  transition: all .15s ease;
}

/* 읽음 버튼 */
.actions button:not(.remove) {
  border-color: #c7d2fe;
  color: #1d4ed8;
  background: #eef2ff;
}

.actions button:not(.remove):hover {
  background: #e0e7ff;
}

/* 삭제 버튼 */
.actions .remove {
  border-color: #fecaca;
  color: #dc2626;
  background: #fef2f2;
}

.actions .remove:hover {
  background: #fee2e2;
}

.empty {
  padding: 40px;
  text-align: center;
  color: #94a3b8;
  font-size: 13px;
}

.footer {
  padding: 12px 16px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: center;
  background: #fafafa;
}

.read-all {
  padding: 8px 18px;
  font-size: 13px;
  font-weight: 600;
  border-radius: 999px;
  border: 1px solid #c7d2fe;
  background: #eef2ff;
  color: #1d4ed8;
  cursor: pointer;
  transition: all .15s ease;
}

.read-all:hover:not(:disabled) {
  background: #e0e7ff;
}

.read-all:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

</style>
