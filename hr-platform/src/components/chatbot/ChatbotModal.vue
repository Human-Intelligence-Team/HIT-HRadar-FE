<template>
  <div v-if="chat.opened" class="overlay" @click.self="chat.close()">
    <div class="modal">
      <div class="modal-head">
        <div class="modal-title">
          <span class="bot-badge">🤖</span>
          HR 챗봇
        </div>
        <div class="modal-actions">
          <button class="btn ghost" @click="clearChat">초기화</button>
          <button class="btn ghost" @click="chat.close()">✕</button>
        </div>
      </div>

      <QuickQuestions @pick="onPick" @selectCategory="onSelectCategory" />

      <div class="modal-body" ref="bodyEl">
        <ChatMessage v-for="(m,i) in chat.messages" :key="i" :msg="m" />
      </div>

      <div class="modal-foot">
        <div v-if="chat.selectedCategory" class="selected-category-display">
          선택된 카테고리: <strong>{{ chat.selectedCategory }}</strong>
          <button class="btn ghost btn-clear-category" @click="clearSelectedCategory">✕</button>
        </div>
        <input class="chat-input" v-model="input" :placeholder="inputPlaceholder"
               @keydown.enter="onEnter" />
        <button class="btn primary" @click="send">전송</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { nextTick, ref, watch, computed } from 'vue'
import { useChatbotStore } from '@/stores/chatbotStore'
import ChatMessage from './ChatMessage.vue'
import QuickQuestions from './QuickQuestions.vue'

const chat = useChatbotStore()
const input = ref('')
const bodyEl = ref(null)

const inputPlaceholder = computed(() => {
  return chat.selectedCategory ? `${chat.selectedCategory}에 대해 질문하세요.` : '예: 연차 이월 기준 알려줘';
});

function scrollBottom() {
  if (!bodyEl.value) return
  bodyEl.value.scrollTop = bodyEl.value.scrollHeight
}

function send() {
  const t = input.value.trim()
  if (!t) return
  chat.sendUser(t, chat.selectedCategory) // Pass selected category
  input.value = ''
}

function onPick(text) {
  chat.sendUser(text, chat.selectedCategory) // Pass selected category
}

function onSelectCategory(category) {
  chat.setSelectedCategory(category)
}

function clearSelectedCategory() {
  chat.setSelectedCategory(null);
}

function clearChat() {
  chat.clear();
  chat.setSelectedCategory(null); // Clear category on full chat clear
}

watch(
  () => chat.messages.length,
  async () => {
    await nextTick()
    scrollBottom()
  }
)

function onEnter(e) {
  if (e.isComposing) return
  send()
}
</script>

<style scoped>
.selected-category-display {
  padding: 8px 12px;
  background-color: #f0f0f0;
  border-radius: 4px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.9em;
  color: #333;
}

.selected-category-display strong {
  color: #007bff;
}

.btn-clear-category {
  margin-left: 10px;
  font-size: 0.8em;
  padding: 2px 6px;
}
</style>
