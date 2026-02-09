<template>
  <section class="page">
    <!-- ================= header ================= -->
    <header class="section-title">
      <div class="title-row">
        <div>
          <h2>평가 배정 관리</h2>
          <p>회차 → 평가유형 → 부서 선택 후 평가자를 배정합니다</p>
        </div>

      </div>
    </header>

    <!-- ================= selectors ================= -->
    <div class="assignment-link">
      <span>이미 배정된 평가가 있나요?</span>
      <button @click="goToAssignmentList">
        배정 현황 보러가기 →
      </button>
    </div>
    <div class="selector-grid">
      <select v-model="selectedCycleId" @change="onCycleChange">
        <option value="">회차 선택</option>
        <option v-for="c in cycles" :key="c.cycleId" :value="c.cycleId">
          {{ c.cycleName }}
        </option>
      </select>

      <select
        v-model="selectedCycleEvalTypeId"
        :disabled="!evalTypes.length"
      >
        <option value="">평가 유형 선택</option>
        <option
          v-for="t in evalTypes"
          :key="t.cycleEvalTypeId"
          :value="t.cycleEvalTypeId"
        >
          {{ t.typeName }}
        </option>
      </select>

      <select v-model="selectedDeptId" @change="loadDeptData">
        <option value="">부서 선택</option>
        <option v-for="d in departments" :key="d.deptId" :value="d.deptId">
          {{ d.deptName }}
        </option>
      </select>
    </div>

    <!-- ================= evaluator ================= -->
    <div v-if="members.length" class="card">
      <h3>① 평가자 선택</h3>

      <div class="list">
        <label
          v-for="m in members"
          :key="m.empId"
          class="item"
        >
          <input
            type="radio"
            name="evaluator"
            :value="m.empId"
            v-model="evaluatorId"
          />
          <span>{{ m.name }} ({{ m.positionName }})</span>
        </label>
      </div>
    </div>

    <!-- ================= evaluatee ================= -->
    <div v-if="evaluatorId" class="card">
      <h3>② 피평가자 선택</h3>

      <div class="list">
        <label
          v-for="m in members"
          :key="m.empId"
          class="item"
          :class="{ disabled: isAlreadyAssigned(m.empId) }"
        >
          <input
            type="checkbox"
            :value="m.empId"
            v-model="evaluateeIds"
            :disabled="isAlreadyAssigned(m.empId)"
          />

          <span>
            {{ m.name }} ({{ m.positionName }})
            <small v-if="isAlreadyAssigned(m.empId)">
              이미 배정됨
            </small>
          </span>
        </label>
      </div>
    </div>

    <!-- ================= action ================= -->
    <div class="actions" v-if="evaluateeIds.length">
      <button class="primary" @click="submitAssignments">
        평가 배정하기
      </button>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'

import { fetchCycles } from '@/api/cycleApi'
import { fetchCycleEvaluationTypes } from '@/api/cycleEvaluationTypeApi'
import {
  getAllDepartmentsByCompany,
  getDepartmentMembers
} from '@/api/departmentApi'
import {
  createEvaluationAssignments,
  fetchAssignmentsByCycleEvalType
} from '@/api/evaluationAssignmentApi'

// ================= router =================
const router = useRouter()

const goToAssignmentList = () => {
  router.push('/hr/evaluation/assignment/status')
}

// ================= state =================
const cycles = ref([])
const evalTypes = ref([])
const departments = ref([])
const members = ref([])
const assignments = ref([])

const selectedCycleId = ref('')
const selectedCycleEvalTypeId = ref('')
const selectedDeptId = ref('')

const evaluatorId = ref(null)
const evaluateeIds = ref([])

// ================= lifecycle =================
onMounted(async () => {
  cycles.value = (await fetchCycles()).data
  departments.value =
    (await getAllDepartmentsByCompany()).data.data.departments
})

// ================= handlers =================
const onCycleChange = async () => {
  selectedCycleEvalTypeId.value = ''
  selectedDeptId.value = ''
  evalTypes.value = []
  assignments.value = []

  if (!selectedCycleId.value) return

  evalTypes.value =
    (await fetchCycleEvaluationTypes(selectedCycleId.value)).data.data
}

// ================= members =================
const loadMembers = async () => {
  evaluatorId.value = null
  evaluateeIds.value = []

  if (!selectedDeptId.value) {
    members.value = []
    return
  }

  members.value =
    (await getDepartmentMembers(selectedDeptId.value)).data.data.employees
}

// ================= assignments =================
const loadAssignments = async () => {
  if (!selectedCycleEvalTypeId.value) {
    assignments.value = []
    return
  }

  assignments.value =
    (await fetchAssignmentsByCycleEvalType(
      selectedCycleEvalTypeId.value
    )).data.data
}

// 👉 평가유형 / 부서 바뀔 때마다 다시 조회
watch(
  [selectedCycleEvalTypeId, selectedDeptId],
  async ([cycleEvalTypeId, deptId]) => {
    if (!cycleEvalTypeId || !deptId) {
      assignments.value = []
      return
    }

    await loadMembers()
    await loadAssignments()
  }
)

// ================= utils =================

// 현재 부서에 해당하는 배정만 필터
const deptAssignments = computed(() =>
  assignments.value.filter(
    a => a.deptId === Number(selectedDeptId.value)
  )
)

const isAlreadyAssigned = (empId) => {
  return deptAssignments.value.some(
    a => a.evaluateeId === empId
  )
}

// ================= submit =================
const submitAssignments = async () => {
  await createEvaluationAssignments(
    selectedCycleEvalTypeId.value,
    {
      evaluatorId: evaluatorId.value,
      evaluateeIds: evaluateeIds.value,
    }
  )

  alert('평가 배정 완료')
  evaluateeIds.value = []

  // 저장 후 배정 다시 로드
  await loadAssignments()
}
</script>


<style scoped>
/* =====================
   PAGE
===================== */
.page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px 20px 40px;
}

/* =====================
   HEADER
===================== */
.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
}

.section-title h2 {
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.section-title p {
  margin-top: 4px;
  font-size: 13px;
  color: #6b7280;
}

/* =====================
   ASSIGNMENT LINK
===================== */
.assignment-link {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  margin-bottom: 18px;
  font-size: 12px;
  color: #6b7280;
}

.assignment-link button {
  background: none;
  border: none;
  font-size: 12px;
  font-weight: 700;
  color: #4f46e5;
  cursor: pointer;
}

.assignment-link button:hover {
  text-decoration: underline;
}

/* =====================
   SELECTORS
===================== */
.selector-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  margin-bottom: 28px;
}

.selector-grid select {
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  font-size: 13px;
  font-weight: 500;
  color: #111827;
  transition: all .15s ease;
}

.selector-grid select:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 2px rgba(99,102,241,.15);
}

/* =====================
   CARD
===================== */
.card {
  background: #ffffff;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 6px 18px rgba(0,0,0,.05);
}

.card h3 {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 16px;
}

/* =====================
   LIST
===================== */
.list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

/* =====================
   ITEM
===================== */
.item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;   /* ↓ 기존보다 축소 */
  border-radius: 10px;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  cursor: pointer;
  transition: all .15s ease;
}

.item input {
  transform: scale(0.9);   /* ↓ 버튼 크기 축소 */
  accent-color: #6366f1;
}

.item span {
  font-size: 13px;
  font-weight: 500;
}
/* =====================
   DISABLED ITEM
===================== */
.item.disabled {
  opacity: 0.45;
  background: #f1f5f9;
  border-style: dashed;
  pointer-events: none;
}

.item small {
  margin-left: 6px;
  font-size: 11px;
  font-weight: 700;
  color: #ef4444;
}

/* =====================
   ACTIONS
===================== */
.actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}

/* =====================
   PRIMARY BUTTON
===================== */
.primary {
  padding: 10px 22px;
  border-radius: 999px;
  background: #4f46e5;
  color: #ffffff;
  border: none;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 8px 18px rgba(79,70,229,.25);
  transition: all .15s ease;
}

.primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 24px rgba(79,70,229,.35);
}


</style>
