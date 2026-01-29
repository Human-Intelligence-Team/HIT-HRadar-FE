<template>
  <section class="page">
    <!-- ===== Page Title (고정) ===== -->
    <div class="section-title">
      <div>
        <h1>평가 유형 관리</h1>
        <div class="sub">
          회사에서 사용하는 평가 유형을 정의하고,
          회차별로 적용할 평가 유형을 선택합니다.
        </div>
      </div>
    </div>

    <div class="grid">
      <!-- =====================
           1) 회사 평가 유형 정책
      ====================== -->
      <section class="card">
        <div class="card-head">
          <div>
            <h2>회사 평가 유형</h2>
            <p class="muted">
              회사 차원에서 사용할 평가 유형을 등록합니다.
            </p>
          </div>
          <div class="pill">
            <span class="dot"></span>
            <span>{{ companyTypes.length }} types</span>
          </div>
        </div>

        <!-- 유형 목록 -->
        <div v-if="companyTypes.length" class="type-list">
          <div
            v-for="t in companyTypes"
            :key="t.evalTypeId"
            class="type-item"
          >
            <!-- 왼쪽: 이름 / 수정 인풋 -->
            <div class="type-left">
              <input
                v-if="editingTypeId === t.evalTypeId"
                v-model="editingTypeName"
                class="edit-input"
              />
              <span
                v-else
                class="type-name"
              >
                {{ t.typeName }}
              </span>
            </div>

            <!-- 오른쪽: 액션 버튼 -->
            <div class="type-actions">
              <button
                v-if="editingTypeId !== t.evalTypeId"
                class="btn btn-light btn-sm"
                @click="startEdit(t)"
              >
                수정
              </button>

              <button
                v-else
                class="btn btn-primary btn-sm"
                @click="submitEdit(t.evalTypeId)"
              >
                저장
              </button>

              <button
                class="btn btn-danger btn-sm"
                @click="removeType(t.evalTypeId)"
              >
                삭제
              </button>
            </div>
          </div>
        </div>

        <div v-else class="empty">
          <p class="strong">등록된 평가 유형이 없습니다.</p>
          <p class="muted small">아래에서 평가 유형을 추가하세요.</p>
        </div>

        <!-- 유형 생성 -->
        <div class="divider"></div>

        <div class="form">
          <div class="field">
            <label>평가 유형명</label>
            <input
              v-model.trim="newTypeName"
              placeholder="예: 동료 평가"
              @keyup.enter="addType"
            />
          </div>

          <div class="form-actions">
            <button class="btn btn-primary" @click="addType">
              평가 유형 추가
            </button>
          </div>
        </div>
      </section>

      <!-- =====================
           2) 회차별 평가 유형 적용 (아직 UI만)
      ====================== -->
      <section class="card">
        <div class="card-head">
          <div>
            <h2>회차별 평가 유형 설정</h2>
            <p class="muted">
              선택한 회차에 포함할 평가 유형을 지정합니다.
            </p>
          </div>
        </div>

        <div class="field">
          <label>평가 회차</label>
          <select v-model="selectedCycleId">
            <option disabled value="">회차 선택</option>
            <option
              v-for="c in cycles"
              :key="c.cycleId"
              :value="c.cycleId"
            >
              {{ c.cycleName }}
            </option>
          </select>
        </div>

        <div v-if="!selectedCycleId" class="empty mt">
          <p class="strong">회차를 먼저 선택해 주세요.</p>
          <p class="muted small">
            회차 선택 후 평가 유형을 적용할 수 있습니다.
          </p>
        </div>

        <div v-else class="checkbox-group">
          <label
            v-for="t in companyTypes"
            :key="t.evalTypeId"
            class="checkbox-item"
          >
            <input
              type="checkbox"
              v-model="selectedTypeIds"
              :value="t.evalTypeId"
            />
            <span class="checkbox-label">
              {{ t.typeName }}
            </span>
          </label>
        </div>

        <div class="actions" v-if="selectedCycleId">
          <button
            class="btn btn-primary"
            @click="applyToCycle"
          >
            회차에 적용
          </button>
        </div>
      </section>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

// 평가 유형(회사 정책) API
import {
  fetchEvaluationTypes,
  createEvaluationType,
  deleteEvaluationType,
  updateEvaluationType,
} from '@/api/evaluationTypeApi'

// 회차 API
import { fetchCycles } from '@/api/cycleApi'

// 회차별 평가 유형 API
import {
  fetchCycleEvaluationTypes,
  saveCycleEvaluationTypes,
} from '@/api/cycleEvaluationTypeApi'


// 상태
const companyTypes = ref([])
const cycles = ref([])

const newTypeName = ref('')
const selectedCycleId = ref('')
const selectedTypeIds = ref([])

// 수정 상태
const editingTypeId = ref(null)
const editingTypeName = ref('')


// 회사 평가 유형 목록 조회
const loadEvaluationTypes = async () => {
  const res = await fetchEvaluationTypes()
  companyTypes.value = res.data.data ?? []
}

// 회차 목록 조회
const loadCycles = async () => {
  const res = await fetchCycles()
  cycles.value = res.data.data ?? res.data
}


// 최초 로드
onMounted(() => {
  loadEvaluationTypes()
  loadCycles()
})


// 평가 유형 추가
const addType = async () => {
  if (!newTypeName.value.trim()) return

  await createEvaluationType({
    typeName: newTypeName.value.trim(),
  })

  newTypeName.value = ''
  await loadEvaluationTypes()
}


// 삭제
const removeType = async (evalTypeId) => {
  if (!confirm('이 평가 유형을 삭제하시겠습니까?')) return

  await deleteEvaluationType(evalTypeId)
  await loadEvaluationTypes()

  // 체크된 상태에서도 제거
  selectedTypeIds.value = selectedTypeIds.value.filter(
    id => id !== evalTypeId
  )
}


// 수정 시작
const startEdit = (t) => {
  editingTypeId.value = t.evalTypeId
  editingTypeName.value = t.typeName
}

// 수정 저장
const submitEdit = async (evalTypeId) => {
  if (!editingTypeName.value.trim()) return

  await updateEvaluationType(evalTypeId, {
    typeName: editingTypeName.value.trim(),
  })

  editingTypeId.value = null
  editingTypeName.value = ''
  await loadEvaluationTypes()
}


// 회차 선택 시 평가 유형 미리 확인
watch(selectedCycleId, async (cycleId) => {
  if (!cycleId) {
    selectedTypeIds.value = []
    return
  }

  const res = await fetchCycleEvaluationTypes(cycleId)
  const list = res.data.data ?? []

  selectedTypeIds.value = list.map(v => v.evalTypeId)
})


// 회차에 평가 유형 적용
const applyToCycle = async () => {
  if (!selectedCycleId.value) return

  await saveCycleEvaluationTypes(selectedCycleId.value, {
    evalTypeIds: selectedTypeIds.value,
  })

  alert('회차별 평가 유형이 저장되었습니다.')
}
</script>


<style scoped>
/* ===== Layout ===== */
.page{
  max-width: 1160px;
  margin: 0 auto;
  padding: 28px 18px 48px;
}
.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.section-title h1 {
  font-size: 20px;
  font-weight: 700;
}
.grid{
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 18px;
}
@media (max-width: 980px){
  .grid{ grid-template-columns: 1fr; }
}

/* ===== Card ===== */
.card{
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
}
.card-head{
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  gap: 12px;
  margin-bottom: 12px;
}
.card h2, .card h3{
  margin: 0;
  font-size: 16px;
  letter-spacing: -0.01em;
}
.muted{ color:#64748b; }
.small{ font-size:12px; }
.strong{ font-weight:700; }

/* ===== Pills ===== */
.pill{
  display:flex;
  gap:8px;
  align-items:center;
  font-size:12px;
  padding:6px 10px;
  border-radius:999px;
  background:#f8fafc;
  border:1px solid #e2e8f0;
}
.dot{
  width:8px;
  height:8px;
  border-radius:50%;
  background:#22c55e;
}

/* ===== Type list ===== */
.type-list{
  display:flex;
  flex-direction:column;
  gap:8px;
}
.type-item{
  display:flex;
  justify-content:space-between;
  align-items:center;
  padding:10px 12px;
  border-radius:12px;
  background:#f8fafc;
  border:1px solid #e2e8f0;
}
.type-name{
  font-weight:500;
}

/* ===== Form ===== */
.divider{
  height:1px;
  background:#eef2f7;
  margin:14px 0;
}
.field{
  display:flex;
  flex-direction:column;
  gap:6px;
}
label{
  font-size:12px;
  font-weight:700;
  color:#64748b;
}
input, select{
  height:40px;
  padding:0 12px;
  border-radius:12px;
  border:1px solid #e2e8f0;
}
.form-actions{
  display:flex;
  justify-content:flex-end;
}

/* ===== Checkbox ===== */
.checkbox-group{
  display:flex;
  flex-direction:column;
  gap:10px;
  margin-top:12px;
}
.checkbox-item{
  display:flex;
  gap:10px;
  align-items:center;
  padding:10px 12px;
  border-radius:12px;
  border:1px solid #e2e8f0;
  background:#f8fafc;
}
.checkbox-label{
  font-weight:600;
}

/* ===== Buttons ===== */
.actions{
  display:flex;
  justify-content:flex-end;
  margin-top:16px;
}
.btn{
  height:40px;
  padding:0 14px;
  border-radius:12px;
  border:1px solid transparent;
  cursor:pointer;
  font-weight:700;
}
.btn:hover{
  opacity: 1;
  filter: none;
}
.btn-primary{
  background: rgb(52, 88, 237);
  color: #ffffff;

}
.btn-primary:hover{
  background: rgb(17, 61, 248);
}
.btn-danger{
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

.btn-danger:hover{
  background: #fecaca;
  border-color: #fca5a5;
}
.btn-sm{
  height:32px;
  font-size:12px;
}

/* ===== Empty ===== */
.empty{
  padding:14px;
  border-radius:12px;
  border:1px dashed #e2e8f0;
  background:#fbfdff;
}
.mt{ margin-top:12px; }

.type-left{
  display: flex;
  align-items: center;
  gap: 8px;
}

.type-actions{
  display: flex;
  gap: 6px;
}

.edit-input{
  height: 32px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  font-size: 13px;
}

.btn-light{
  background: #ffffff;
  color: #374151;
  border: 1px solid #e5e7eb;
}
.btn-light:hover{
  background: #f8fafc;
  border-color: #c7d2fe;
  color: #1e3a8a;
}

</style>
