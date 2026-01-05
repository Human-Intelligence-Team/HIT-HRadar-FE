<template>
  <section>
    <div class="section-title">
      <div>
        <h1>알림 관리</h1>
        <div class="sub">이벤트 기반 알림 규칙/템플릿 (Mock)</div>
      </div>
    </div>

    <div class="grid cols-2">
      <BaseCard>
        <div class="card-hd">
          <div>
            <h2>알림 목록(샘플)</h2>
            <div class="desc">읽음/안읽음 표시</div>
          </div>
        </div>
        <div class="card-bd">
          <div class="list">
            <div class="li" v-for="a in s.alerts" :key="a.id" @click="selected=a">
              <div class="li-title">
                <span class="pill" :class="a.read ? 'p-read' : 'p-unread'">
                  {{ a.read ? 'READ' : 'UNREAD' }}
                </span>
                {{ a.title }}
              </div>
              <div class="li-meta">{{ a.date }} · 링크: {{ a.link }}</div>
            </div>
          </div>
        </div>
      </BaseCard>

      <BaseCard>
        <div class="card-hd">
          <div>
            <h2>상세</h2>
            <div class="desc">{{ selected ? selected.date : '목록에서 선택하세요.' }}</div>
          </div>
          <div class="right-actions">
            <button class="btn" :disabled="!selected" @click="markRead">읽음 처리</button>
            <button class="btn primary" :disabled="!selected" @click="goLink">관련 화면</button>
          </div>
        </div>
        <div class="card-bd">
          <div class="label">내용</div>
          <textarea class="textarea" :value="selected?.body || ''" disabled />
        </div>
      </BaseCard>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import BaseCard from '@/components/common/BaseCard.vue'
import { useMockStore } from '@/stores/mockStore'

const s = useMockStore()
const selected = ref(null)

function markRead() {
  if (!selected.value) return
  s.markAlertRead(selected.value.id)
  selected.value = s.alerts.find(x => x.id === selected.value.id)
}

function goLink() {
  if (!selected.value) return
  alert('관련 화면 이동(Mock): ' + selected.value.link)
}
</script>
