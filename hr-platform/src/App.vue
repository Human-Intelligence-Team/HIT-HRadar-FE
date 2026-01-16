<template>
  <RouterView />
</template>

<script setup>
import { onMounted, watch } from 'vue'
import { connectSSE, disconnectSSE } from '@/api/notificationSse.js'
import { useNotificationStore } from '@/stores/notificationStore.js'
import { useAuthStore } from '@/stores/authStore.js'
import router from '@/router/index.js'

const notificationStore = useNotificationStore()
const auth = useAuthStore()

// onMounted(async () => {
//   auth.loadFromStorage()
//
//   if (auth.accessToken) {
//     await auth.loadProfile()
//   }
// })

// router.beforeEach(async (to) => {
//   if (auth.accessToken && !auth.profile.name) {
//     await auth.loadProfile()
//   }
// })

watch(
  () => auth.isLoggedIn,
  async (loggedIn) => {
    if (loggedIn) {
      await notificationStore.load()

      connectSSE((data) => {
        notificationStore.push(data)
      })
    } else {
      disconnectSSE()
    }
  },
  { immediate: true },
)
</script>
