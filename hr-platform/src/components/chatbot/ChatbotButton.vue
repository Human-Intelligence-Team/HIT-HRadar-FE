<template>
  <button class="chatbot-fab" @click="chat.toggle()">🤖</button>
</template>

<script setup>
import { useChatbotStore } from '@/stores/chatbotStore'
const chat = useChatbotStore()
</script>
