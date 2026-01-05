<template>
  <section>
    <div class="section-title">
      <div>
        <h1>FAQ 관리</h1>
        <div class="sub">등록/조회 (Mock)</div>
      </div>
      <div class="right-actions">
        <button class="btn primary" @click="showCreate = !showCreate">+ FAQ 등록</button>
      </div>
    </div>

    <div class="grid cols-2">
      <BaseCard>
        <div class="card-hd">
          <div>
            <h2>목록</h2>
            <div class="desc">질문 검색</div>
          </div>
          <input class="input" v-model="q" placeholder="질문 검색" />
        </div>
        <div class="card-bd">
          <div class="list">
            <div class="li" v-for="f in filtered" :key="f.id" @click="selected=f">
              <div class="li-title">{{ f.q }}</div>
              <div class="li-meta">카테고리: {{ f.category }} · 최종수정: {{ f.updated }}</div>
            </div>
          </div>
        </div>
      </BaseCard>

      <BaseCard>
        <div class="card-hd">
          <div>
            <h2>상세</h2>
            <div class="desc">{{ selected ? `카테고리: ${selected.category}` : '목록에서 선택하세요.' }}</div>
          </div>
        </div>
        <div class="card-bd">
          <div class="label">질문</div>
          <input class="input" :value="selected?.q || ''" disabled />
          <div style="margin-top:10px;" class="label">답변</div>
          <textarea class="textarea" :value="selected?.a || ''" disabled />
        </div>
      </BaseCard>
    </div>

    <BaseCard v-if="showCreate" style="margin-top:14px;">
      <div class="card-hd">
        <div>
          <h2>FAQ 등록</h2>
          <div class="desc">등록 후 벡터 생성(구현 시)</div>
        </div>
        <div class="right-actions">
          <button class="btn" @click="showCreate=false">닫기</button>
          <button class="btn primary" @click="save">저장</button>
        </div>
      </div>
      <div class="card-bd">
        <div class="formgrid cols-2">
          <div>
            <div class="label">카테고리</div>
            <select class="select" v-model="form.category">
              <option>휴가</option><option>평가</option><option>근태</option><option>교육</option>
            </select>
          </div>
          <div>
            <div class="label">최종수정일</div>
            <input class="input" :value="today" disabled />
          </div>
        </div>

        <div style="margin-top:10px;">
          <div class="label">질문</div>
          <input class="input" v-model="form.q" />
        </div>
        <div style="margin-top:10px;">
          <div class="label">답변</div>
          <textarea class="textarea" v-model="form.a" />
        </div>
      </div>
    </BaseCard>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import BaseCard from '@/components/common/BaseCard.vue'
import { useMockStore } from '@/stores/mockStore'

const s = useMockStore()
const q = ref('')
const selected = ref(null)
const showCreate = ref(false)

const today = new Date().toISOString().slice(0, 10)
const form = ref({ category: '휴가', q: '', a: '' })

const filtered = computed(() =>
  s.faqs.filter(f => f.q.toLowerCase().includes(q.value.toLowerCase()))
)

function save() {
  if (!form.value.q.trim() || !form.value.a.trim()) {
    alert('질문/답변을 입력해 주세요.')
    return
  }
  s.createFaq({
    category: form.value.category,
    q: form.value.q.trim(),
    a: form.value.a.trim(),
    updated: today,
  })
  form.value = { category: '휴가', q: '', a: '' }
  showCreate.value = false
  alert('저장되었습니다. (Mock)')
}
</script>
