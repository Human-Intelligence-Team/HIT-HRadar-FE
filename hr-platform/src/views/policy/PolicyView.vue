<template>
  <section>
    <div class="section-title">
      <div>
        <h1>제도·규정 관리</h1>
        <div class="sub">등록/조회/개정/폐기 (Mock)</div>
      </div>
      <div class="right-actions">
        <BaseButton variant="primary" @click="showCreate = !showCreate">
          + 제도·규정 등록
        </BaseButton>
      </div>
    </div>

    <div class="grid cols-2">
      <BaseCard>
        <div class="card-hd">
          <div>
            <h2>목록</h2>
            <div class="desc">상태 배지로 구분</div>
          </div>
          <input class="input" v-model="q" placeholder="제목 검색 (예: 연차)" />
        </div>

        <div class="card-bd">
          <table class="table">
            <thead>
            <tr>
              <th style="width:44%;">제목</th>
              <th style="width:14%;">유형</th>
              <th style="width:18%;">상태</th>
              <th style="width:14%;">등록일</th>
              <th style="width:10%;">상세</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="p in filtered" :key="p.id">
              <td>{{ p.title }}</td>
              <td>{{ p.type }}</td>
              <td>
                <BaseBadge :tone="tone(p.status)">
                  {{ label(p.status) }}
                </BaseBadge>
              </td>
              <td>{{ p.date }}</td>
              <td><button class="btn" @click="select(p)">보기</button></td>
            </tr>
            </tbody>
          </table>

          <div class="hint">* 실제 구현: PDF 업로드 → 청크/벡터 적재(RAG)</div>
        </div>
      </BaseCard>

      <BaseCard>
        <div class="card-hd">
          <div>
            <h2>상세</h2>
            <div class="desc">
              {{ selected ? `유형: ${selected.type} · 등록일: ${selected.date}` : '목록에서 선택하세요.' }}
            </div>
          </div>
          <div class="right-actions">
            <button class="btn" :disabled="!selected" @click="revise">개정</button>
            <button class="btn" :disabled="!selected" @click="retire">폐기</button>
          </div>
        </div>

        <div class="card-bd">
          <div class="formgrid cols-2">
            <div>
              <div class="label">제목</div>
              <input class="input" :value="selected?.title || ''" disabled />
            </div>
            <div>
              <div class="label">상태</div>
              <input class="input" :value="selected ? label(selected.status) : ''" disabled />
            </div>
          </div>

          <div style="margin-top:10px;">
            <div class="label">본문</div>
            <textarea class="textarea" :value="selected?.body || ''" disabled />
          </div>
        </div>
      </BaseCard>
    </div>

    <BaseCard v-if="showCreate" style="margin-top:14px;">
      <div class="card-hd">
        <div>
          <h2>등록</h2>
          <div class="desc">텍스트 등록 (Mock)</div>
        </div>
        <div class="right-actions">
          <button class="btn" @click="showCreate=false">닫기</button>
          <button class="btn primary" @click="save">저장</button>
        </div>
      </div>

      <div class="card-bd">
        <div class="formgrid cols-2">
          <div>
            <div class="label">제목</div>
            <input class="input" v-model="form.title" />
          </div>
          <div>
            <div class="label">유형</div>
            <select class="select" v-model="form.type">
              <option value="POLICY">POLICY</option>
              <option value="MANUAL">MANUAL</option>
            </select>
          </div>
        </div>

        <div style="margin-top:10px;">
          <div class="label">내용</div>
          <textarea class="textarea" v-model="form.body" />
        </div>
      </div>
    </BaseCard>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import BaseCard from '@/components/common/BaseCard.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseBadge from '@/components/common/BaseBadge.vue'
import { useMockStore } from '@/stores/mockStore'
import { useAuthStore } from '@/stores/authStore'

const s = useMockStore()
const auth = useAuthStore()

const q = ref('')
const selected = ref(null)
const showCreate = ref(false)

const form = ref({ title: '', type: 'POLICY', body: '' })

const filtered = computed(() =>
  s.policies.filter(p => p.title.toLowerCase().includes(q.value.toLowerCase()))
)

function select(p) {
  selected.value = p
}

function label(status) {
  if (status === 'ACTIVE') return '사용중'
  if (status === 'REVISED') return '개정됨'
  if (status === 'RETIRED') return '폐기'
  return status
}

function tone(status) {
  if (status === 'ACTIVE') return 'good'
  if (status === 'REVISED') return 'warn'
  if (status === 'RETIRED') return 'bad'
  return ''
}

function save() {
  if (!auth.hasPermission('POLICY_WRITE')) {
    alert('권한이 없습니다: POLICY_WRITE')
    return
  }
  if (!form.value.title.trim()) {
    alert('제목을 입력해 주세요.')
    return
  }
  s.createPolicy({
    title: form.value.title.trim(),
    type: form.value.type,
    status: 'ACTIVE',
    date: new Date().toISOString().slice(0, 10),
    body: form.value.body?.trim() || '(내용 없음)',
  })
  form.value = { title: '', type: 'POLICY', body: '' }
  showCreate.value = false
  alert('저장되었습니다. (Mock)')
}

function revise() {
  if (!selected.value) return
  alert('개정 (Mock): 실제는 버전 생성 + 벡터 재적재')
}

function retire() {
  if (!selected.value) return
  if (!confirm('폐기 처리하시겠습니까?')) return
  s.updatePolicy(selected.value.id, { status: 'RETIRED' })
  selected.value = s.policies.find(p => p.id === selected.value.id)
}
</script>
