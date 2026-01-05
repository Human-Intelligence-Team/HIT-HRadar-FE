<template>
  <div v-if="chat.opened" class="overlay" @click.self="chat.close()">
    <div class="modal">
      <div class="modal-head">
        <div class="modal-title">
          <span class="bot-badge">🤖</span>
          HR 챗봇
        </div>
        <div class="modal-actions">
          <button class="btn ghost" @click="chat.clear()">초기화</button>
          <button class="btn ghost" @click="chat.close()">✕</button>
        </div>
      </div>

      <QuickQuestions @pick="onPick" />

      <div class="modal-body" ref="bodyEl">
        <ChatMessage v-for="(m,i) in chat.messages" :key="i" :msg="m" />
      </div>

      <div class="modal-foot">
        <input class="chat-input" v-model="input" placeholder="예: 연차 이월 기준 알려줘"
               @keydown.enter="send" />
        <button class="btn primary" @click="send">전송</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { nextTick, ref, watch } from 'vue'
import { useChatbotStore } from '@/stores/chatbotStore'
import ChatMessage from './ChatMessage.vue'
import QuickQuestions from './QuickQuestions.vue'

const chat = useChatbotStore()
const input = ref('')
const bodyEl = ref(null)

function scrollBottom() {
  if (!bodyEl.value) return
  bodyEl.value.scrollTop = bodyEl.value.scrollHeight
}

function send() {
  const t = input.value.trim()
  if (!t) return
  chat.sendUser(t)
  input.value = ''
}

function onPick(text) {
  chat.sendUser(text)
}

watch(
  () => chat.messages.length,
  async () => {
    await nextTick()
    scrollBottom()
  }
)
</script>
