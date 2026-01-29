<template>
  <section class="page">
    <!-- ===== Page Title ===== -->
    <div class="section-title">
      <div>
        <h1>평가 문항지 설정</h1>
        <div class="sub">
          회차와 평가 유형에 맞는 평가 문항지를 구성합니다.
        </div>
      </div>
    </div>

    <!-- ===== Top Selector ===== -->
    <section class="card selector-card">
      <div class="selector">
        <div class="field">
          <label>평가 회차</label>
          <select v-model="selectedCycleId">
            <option value="">회차 선택</option>
            <option
              v-for="c in cycles"
              :key="c.cycleId"
              :value="c.cycleId"
            >
              {{ c.cycleName }}
            </option>
          </select>
        </div>

        <div class="field">
          <label>평가 유형</label>
          <select v-model="selectedEvalTypeId">
            <option value="">평가 유형 선택</option>
            <option
              v-for="t in evalTypes"
              :key="t.evalTypeId"
              :value="t.evalTypeId"
            >
              {{ t.typeName }}
            </option>
          </select>

        </div>
      </div>
    </section>
    <!-- ===== 상태 안내 (DRAFT 아닐 때) ===== -->
    <div
      v-if="selectedCycleId && !canCreateForm"
      class="cycle-status-notice"
    >
      <b>{{ selectedCycle.cycleName }}</b> 회차는<br />
      현재 <b>{{ selectedCycle.status }}</b> 상태로<br />
      평가 문항지를 생성하거나 수정할 수 없습니다.
    </div>

    <!-- ===== Form Builder ===== -->
    <section
      v-else-if="canCreateForm"
      v-for="(section, sIdx) in sections"
      :key="section.id"
      class="form-section"
    >
    <div class="section-header">
        <input
          v-model="section.title"
          class="section-title-input"
          placeholder="섹션 제목"
        />
        <textarea
          v-model="section.description"
          class="section-desc"
          placeholder="섹션 설명 (선택)"
        />
      </div>
      <!-- 질문 -->
      <div
        v-for="(q, qIdx) in section.questions"
        :key="q.id"
        class="question-card"
      >
        <div class="question-head">
          <input
            v-model="q.title"
            class="question-title"
            placeholder="질문"
          />

          <select v-model="q.type" class="question-type">
            <option value="CHOICE">객관식</option>
            <option value="SCORE">점수형</option>
            <option value="TEXT">주관식</option>
          </select>
        </div>

        <!-- 객관식 -->
        <div v-if="q.type === 'CHOICE'" class="choice-list">
          <div
            v-for="(opt, oIdx) in q.options"
            :key="oIdx"
            class="choice-item"
          >
            <span class="radio"></span>
            <input
              v-model="q.options[oIdx]"
              placeholder="옵션"
            />
            <button class="icon-btn" @click="removeOption(section, q, oIdx)">
              ✕
            </button>
          </div>

          <button class="add-option" @click="addOption(q)">
            + 옵션 추가
          </button>
        </div>

        <!-- 점수형 -->
        <div v-if="q.type === 'SCORE'" class="score-box">
          <div class="score-config">
            <select v-model="q.maxScore" class="score-select">
              <option :value="5">5</option>
              <option :value="7">7</option>
              <option :value="10">10</option>
            </select>

            <span class="score-icon">⭐</span>
          </div>

          <div class="score-scale">
            <div
              v-for="n in q.maxScore"
              :key="n"
              class="score-item"
            >
              <span class="score-num">{{ n }}</span>
              <span class="score-star">☆</span>
            </div>
          </div>
        </div>


        <!-- 주관식 -->
        <div v-if="q.type === 'TEXT'" class="text-preview">
          장문형 텍스트 응답
        </div>

        <!-- 하단 액션 -->
        <div class="question-actions">
          <label class="required-toggle">
            <input type="checkbox" v-model="q.required" />
            필수
          </label>

          <button class="icon-btn" @click="removeQuestion(section, qIdx)">
            🗑
          </button>
        </div>
      </div>

      <button class="add-question" @click="addQuestion(section)">
        + 질문 추가
      </button>

      <div class="section-footer">
        <button class="btn btn-danger btn-sm" @click="removeSection(sIdx)">
          섹션 삭제
        </button>
      </div>
    </section>

    <!-- ===== Add Section ===== -->
    <div class="add-section">
      <button class="btn btn-primary" @click="addSection">
        + 섹션 추가
      </button>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

// 회차 API
import { fetchCycles } from '@/api/cycleApi'

// 회차-평가유형 API
import {
  fetchCycleEvaluationTypes,
} from '@/api/cycleEvaluationTypeApi'

//문항지 생성 가능 여부 체크
import { computed } from 'vue'

// 선택된 회차 객체
const selectedCycle = computed(() => {
  return cycles.value.find(
    c => c.cycleId === selectedCycleId.value
  )
})

// 문항지 생성 가능 여부 (DRAFT만 허용)
const canCreateForm = computed(() => {
  return selectedCycle.value?.status === 'DRAFT'
})
/* =====================
   state
===================== */

// 회차 / 평가유형
const cycles = ref([])
const evalTypes = ref([])

// 선택 값
const selectedCycleId = ref('')
const selectedEvalTypeId = ref('')

// 문항지 섹션
const sections = ref([
  {
    id: Date.now(),
    title: '',
    description: '',
    questions: [],
  },
])

/* =====================
   load
===================== */

// 회차 목록 조회
const loadCycles = async () => {
  const res = await fetchCycles()
  console.log('raw response:', res.data)

  const body = res.data
  cycles.value = Array.isArray(body)
    ? body
    : body?.data ?? []

  console.log('parsed cycles:', cycles.value)
}

// 회차별 평가 유형 조회
const loadEvalTypesByCycle = async (cycleId) => {
  if (!cycleId) {
    evalTypes.value = []
    selectedEvalTypeId.value = ''
    return
  }

  const res = await fetchCycleEvaluationTypes(cycleId)
  console.log('evalTypes:', evalTypes.value)

  const body = res.data
  evalTypes.value = Array.isArray(body)
    ? body
    : body?.data ?? []

  selectedEvalTypeId.value = ''
}
/* =====================
   lifecycle
===================== */

onMounted(() => {
  loadCycles()
})

// 회차 선택 시 → 평가유형 다시 조회
watch(selectedCycleId, (newVal) => {
  loadEvalTypesByCycle(newVal)
})

/* =====================
   section actions
===================== */

// 섹션 추가
const addSection = () => {
  sections.value.push({
    id: Date.now(),
    title: '',
    description: '',
    questions: [],
  })
}

// 섹션 삭제
const removeSection = (idx) => {
  sections.value.splice(idx, 1)
}

/* =====================
   question actions
===================== */

// 질문 추가
const addQuestion = (section) => {
  section.questions.push({
    id: Date.now(),
    title: '',
    type: 'CHOICE',
    required: false,
    options: ['옵션 1'],
    maxScore: 5,
  })
}

// 질문 삭제
const removeQuestion = (section, idx) => {
  section.questions.splice(idx, 1)
}

// 객관식 옵션 추가
const addOption = (q) => {
  q.options.push(`옵션 ${q.options.length + 1}`)
}

// 객관식 옵션 삭제
const removeOption = (section, q, idx) => {
  q.options.splice(idx, 1)
}
</script>

<style scoped>
/* ===== Page ===== */
.page {
  max-width: 920px;
  margin: 0 auto;
  padding: 32px 16px 64px;
}

/* ===== Title ===== */
.section-title {
  margin-bottom: 20px;
}
.section-title h1 {
  font-size: 22px;
  font-weight: 700;
}
.section-title .sub {
  margin-top: 4px;
  font-size: 13px;
  color: #6b7280;
}

/* ===== Card ===== */
.card {
  background: #ffffff;
  border-radius: 14px;
  padding: 18px 20px;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
}

.selector-card {
  margin-bottom: 28px;
}

/* ===== Selector ===== */
.selector {
  display: flex;
  gap: 16px;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}
label {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
}

/* ===== Google Form Input ===== */
input,
textarea,
select {
  background: transparent;
  border: none;
  border-bottom: 2px solid #e5e7eb;
  padding: 8px 4px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.15s ease;
}
input:focus,
textarea:focus,
select:focus {
  border-bottom-color: #6366f1;
}
textarea {
  resize: none;
}

/* ===== Section ===== */
.form-section {
  background: #ffffff;
  border-radius: 14px;
  border-left: 6px solid #6366f1;
  padding: 22px;
  margin-bottom: 22px;
  box-shadow: 0 6px 18px rgba(99, 102, 241, 0.08);
}

.section-header {
  display: flex;
  flex-direction: column;   /* 핵심: 세로 정렬 */
  gap: 8px;                 /* 제목-설명 간격 */
}

/* 섹션 제목 */
.section-title-input {
  font-size: 20px;
  font-weight: 700;
  padding: 6px 4px;
}

/* 섹션 설명 */
.section-desc {
  font-size: 14px;
  color: #6b7280;
  padding: 6px 4px;
  line-height: 1.6;
  min-height: 28px;
  width: 60%;               /* 구글폼처럼 살짝 짧게 */
  border-bottom: 2px solid #e5e7eb;
}
.section-desc:focus {
  border-bottom-color: #6366f1;
  color: #374151;
}

/* ===== Question Card ===== */
.question-card {
  background: #ffffff;
  border-radius: 14px;
  padding: 18px;
  margin-top: 18px;
  border-left: 4px solid transparent;
  transition: box-shadow 0.15s ease, border-color 0.15s ease;
}
.question-card:focus-within {
  border-left-color: #6366f1;
  box-shadow: 0 6px 18px rgba(99, 102, 241, 0.18);
}

/* ===== Question Head ===== */
.question-head {
  display: flex;
  gap: 14px;
  align-items: center;
}
.question-title {
  flex: 1;
  font-size: 16px;
  font-weight: 500;
}
.question-type {
  width: 130px;
  font-size: 13px;
}

/* ===== Choice ===== */
.choice-list {
  margin-top: 14px;
}
.choice-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
}
.radio {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid #9ca3af;
}
.choice-item input {
  flex: 1;
}

/* ===== Add Option / Question ===== */
.add-option,
.add-question {
  margin-top: 12px;
  color: #4f46e5;
  font-size: 13px;
  font-weight: 600;
  background: none;
  border: none;
  cursor: pointer;
}
.add-option:hover,
.add-question:hover {
  text-decoration: underline;
}

/* ===== Score (Star Rating) ===== */
.score-box {
  margin-top: 18px;
}
.score-config {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}
.score-select {
  width: 72px;
}
.score-icon {
  font-size: 20px;
  color: #fbbf24;
}
.score-scale {
  display: flex;
  justify-content: space-between;
  max-width: 420px;
}
.score-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.score-num {
  font-size: 13px;
  color: #374151;
  margin-bottom: 6px;
}
.score-star {
  font-size: 22px;
  color: #9ca3af;
}

/* ===== Text Question ===== */
.text-preview {
  margin-top: 14px;
  padding: 12px;
  border-radius: 10px;
  background: #f9fafb;
  color: #9ca3af;
  font-size: 13px;
}

/* ===== Actions ===== */
.question-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
}
.required-toggle {
  font-size: 13px;
  color: #374151;
  display: flex;
  gap: 6px;
  align-items: center;
}
.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  color: #6b7280;
}
.icon-btn:hover {
  color: #ef4444;
}

/* ===== Footer ===== */
.section-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

/* ===== Buttons ===== */
.btn {
  padding: 8px 16px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  border: none;
}
.btn-primary {
  background: #6366f1;
  color: #ffffff;
}
.btn-primary:hover {
  background: #4f46e5;
}
.btn-danger {
  background: #fee2e2;
  color: #991b1b;
}
.btn-danger:hover {
  background: #fecaca;
}

/* ===== Add Section ===== */
.add-section {
  margin-top: 28px;
  text-align: center;
}

.cycle-status-notice {
  margin-top: 20px;
  padding: 18px 20px;
  border-radius: 14px;
  background: #f8fafc;
  border: 1px dashed #c7d2fe;
  color: #1e3a8a;
  font-size: 14px;
  line-height: 1.6;
}
</style>
