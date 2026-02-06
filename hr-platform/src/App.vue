<template>
  <RouterView />
</template>

<script setup>
import { onMounted, watch } from 'vue'
import { connectSSE, disconnectSSE } from '@/api/notificationSse.js'
import { useNotificationStore } from '@/stores/notificationStore.js'
import { useAuthStore } from '@/stores/authStore.js'


const notificationStore = useNotificationStore()
const auth = useAuthStore()

// 앱 시작 시 localStorage에서 토큰/권한 복원
onMounted(() => {
  auth.loadFromStorage()
})

// router.beforeEach(async (to) => {
//   if (auth.accessToken && !auth.profile.name) {
//     await auth.loadProfile()
//   }
// })

// ✅ 로그인 후에만 SSE 연결 시작 (immediate: true 제거)
watch(
  () => auth.isLoggedIn,
  async (loggedIn, wasLoggedIn) => {
    if (loggedIn && !wasLoggedIn) {
      // 로그인 상태로 변경되었을 때만 실행
      try {
        await notificationStore.load()

        const onMessage = (data) => {
          notificationStore.push(data)
        }
        connectSSE(onMessage)
      } catch (error) {
        console.error('Failed to setup notifications:', error)
      }
    } else if (!loggedIn && wasLoggedIn) {
      // 로그아웃 상태로 변경되었을 때
      disconnectSSE()
      notificationStore.clear()
    }
  }
)
</script>
