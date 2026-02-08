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

onMounted(() => {
  auth.loadFromStorage()
})

// 로그인 상태 변화에만 반응
watch(
  () => auth.isLoggedIn,
  async (loggedIn, wasLoggedIn) => {
    // 로그인으로 "전환"될 때만 SSE 연결
    if (loggedIn && !wasLoggedIn) {
      try {
        await notificationStore.load()

        const onMessage = (data) => {
          notificationStore.push(data)
        }
        connectSSE(onMessage)
      } catch (error) {
        console.error('Failed to setup notifications:', error)
      }
      return
    }

    // 로그아웃으로 "전환"될 때만 SSE 해제
    if (!loggedIn && wasLoggedIn) {
      disconnectSSE()
      notificationStore.clear()
    }
  }
)
</script>
