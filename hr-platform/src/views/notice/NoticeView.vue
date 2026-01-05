<template>
  <section>
    <div class="section-title">
      <div>
        <h1>공지 관리</h1>
        <div class="sub">작성/조회 (Mock)</div>
      </div>
      <div class="right-actions">
        <button class="btn primary" @click="showCreate = !showCreate">+ 공지 작성</button>
      </div>
    </div>

    <div class="grid cols-2">
      <BaseCard>
        <div class="card-hd">
          <div>
            <h2>공지 목록</h2>
            <div class="desc">제목 클릭 → 상세</div>
          </div>
        </div>
        <div class="card-bd">
          <table class="table">
            <thead>
            <tr>
              <th style="width:60%;">제목</th>
              <th style="width:20%;">작성자</th>
              <th style="width:20%;">등록일</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="n in s.notices" :key="n.id">
              <td><a href="#" @click.prevent="selected=n">{{ n.title }}</a></td>
              <td>{{ n.author }}</td>
              <td>{{ n.date }}</td>
            </tr>
            </tbody>
          </table>
        </div>
      </BaseCard>

      <BaseCard>
        <div class="card-hd">
          <div>
            <h2>공지 상세</h2>
            <div class="desc">{{ selected ? `등록일: ${selected.date}` : '목록에서 선택하세요.' }}</div>
          </div>
        </div>
        <div class="card-bd">
          <div class="label">제목</div>
          <input class="input" :value="selected?.title || ''" disabled />
          <div style="margin-top:10px;" class="label">내용</div>
          <textarea class="textarea" :value="selected?.body || ''" disabled />
        </div>
      </BaseCard>
    </div>

    <BaseCard v-if="showCreate" style="margin-top:14px;">
      <div class="card-hd">
        <div>
          <h2>공지 작성</h2>
          <div class="desc">제도 변경/평가 일정/정책 안내</div>
        </div>
        <div class="right-actions">
          <button class="btn" @click="showCreate=false">닫기</button>
          <button class="btn primary" @click="save">저장</button>
        </div>
      </div>
      <div class="card-bd">
        <div class="label">제목</div>
        <input class="input" v-model="form.title" />
        <div style="margin-top:10px;" class="label">내용</div>
        <textarea class="textarea" v-model="form.body" />
      </div>
    </BaseCard>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import BaseCard from '@/components/common/BaseCard.vue'
import { useMockStore } from '@/stores/mockStore'
import { useAuthStore } from '@/stores/authStore'

const s = useMockStore()
const auth = useAuthStore()

const selected = ref(null)
const showCreate = ref(false)
const form = ref({ title: '', body: '' })

function save() {
  if (!auth.hasPermission('NOTICE_WRITE')) {
    alert('권한이 없습니다: NOTICE_WRITE')
    return
  }
  if (!form.value.title.trim() || !form.value.body.trim()) {
    alert('제목/내용을 입력해 주세요.')
    return
  }
  s.createNotice({
    title: form.value.title.trim(),
    body: form.value.body.trim(),
    date: new Date().toISOString().slice(0, 10),
    author: '인사팀',
  })
  form.value = { title: '', body: '' }
  showCreate.value = false
  alert('저장되었습니다. (Mock)')
}
</script>
