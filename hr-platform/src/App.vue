<template>
  <RouterView />
</template>

<script setup>
import { onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { connectSSE, disconnectSSE } from '@/api/notificationSse.js'
import { useNotificationStore } from '@/stores/notificationStore.js'
import { useAuthStore } from '@/stores/authStore.js'


const route = useRoute()
const auth = useAuthStore()
const notificationStore = useNotificationStore()

// ✅ 어드민 경로인지 확인
const isAdminRoute = () => route.path.startsWith('/admin')

// 앱 시작 시 localStorage에서 토큰/권한 복원
onMounted(() => {
  auth.loadFromStorage()
})

// ✅ 로그인 상태 또는 경로 변화에 따른 SSE 제어
watch(
  [() => auth.isLoggedIn, () => route.path],
  async ([loggedIn, path], [wasLoggedIn, oldPath]) => {
    const isNowAdmin = path.startsWith('/admin')
    const wasAdmin = oldPath?.startsWith('/admin')

    if (loggedIn) {
      if (isNowAdmin) {
        // 어드민 경로로 진입하면 SSE 해제
        disconnectSSE()
        console.log('Admin route detected: SSE Disconnected')
      } else {
        // 일반 경로일 경우 (기존에 연결 안 되어 있었거나 어드민에서 넘어왔을 때)
        if (!wasLoggedIn || wasAdmin) {
          try {
            await notificationStore.load()
            connectSSE((data) => {
              notificationStore.push(data)
            })
            console.log('SSE connected on public/user route')
          } catch (error) {
            console.error('Failed to setup notifications:', error)
          }
        }
      }
    } else {
      // 로그아웃 시
      disconnectSSE()
      notificationStore.clear()
    }
  },
  { immediate: true }
)
</script>
