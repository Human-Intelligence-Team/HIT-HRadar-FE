<template>
  <div class="app">
    <Header />
    <div class="main">
      <Sidebar />
      <main class="content">
        <RouterView />
        <ChatbotButton />
      </main>
    </div>
    <ChatbotModal />
  </div>
</template>

<script setup>
import Header from './Header.vue'
import Sidebar from './Sidebar.vue'
import ChatbotButton from '@/components/chatbot/ChatbotButton.vue'
import ChatbotModal from '@/components/chatbot/ChatbotModal.vue'
</script>
