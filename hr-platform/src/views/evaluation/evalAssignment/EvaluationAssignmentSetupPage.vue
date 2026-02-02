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
            :disabled="
              m.empId === evaluatorId ||
              isAlreadyAssigned(m.empId)
            "
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import { fetchCycles } from '@/api/cycleApi'
import { fetchCycleEvaluationTypes } from '@/api/cycleEvaluationTypeApi'
import {
  getAllDepartmentsByCompany,
  getDepartmentMembers
} from '@/api/departmentApi'
import {
  createEvaluationAssignments,
  fetchDeptEvaluationAssignmentDetails
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
  evalTypes.value = []

  if (!selectedCycleId.value) return

  evalTypes.value =
    (await fetchCycleEvaluationTypes(selectedCycleId.value)).data.data
}

const loadDeptData = async () => {
  evaluatorId.value = null
  evaluateeIds.value = []

  if (!selectedDeptId.value) return

  members.value =
    (await getDepartmentMembers(selectedDeptId.value)).data.data.employees

  assignments.value =
    (await fetchDeptEvaluationAssignmentDetails(selectedDeptId.value)).data.data
}

// ================= utils =================
const isAlreadyAssigned = (empId) => {
  return assignments.value.some(
    a =>
      a.evaluateeId === empId &&
      a.cycleId === Number(selectedCycleId.value)
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
}
</script>


<style scoped>
/* =====================
   PAGE
===================== */
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

.section-title h2 {
  font-size: 28px;
  font-weight: 900;
  letter-spacing: -0.03em;
}

.section-title p {
  margin-top: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
}

/* =====================
   ASSIGNMENT LINK
===================== */
.assignment-link {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
  font-size: 13px;
  color: #64748b;
  opacity: .85;
}

.assignment-link button {
  background: none;
  border: none;
  padding: 0;
  font-size: 13px;
  font-weight: 800;
  color: #4f46e5;
  cursor: pointer;
  transition: all .15s ease;
}

.assignment-link button:hover {
  text-decoration: underline;
  color: #3730a3;
}

.assignment-link:hover {
  opacity: 1;
}

/* =====================
   SELECTORS
===================== */
.selector-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 22px;
  margin-bottom: 40px;
}

.selector-grid select {
  padding: 18px 20px;
  border-radius: 18px;
  border: 1.5px solid #e5e7eb;
  background:
    linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  font-size: 14px;
  font-weight: 700;
  color: #111827;
  transition: all .2s ease;
}

.selector-grid select:hover:not(:disabled) {
  border-color: #818cf8;
}

.selector-grid select:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 5px rgba(99,102,241,.18);
}

.selector-grid select:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

/* =====================
   CARD
===================== */
.card {
  background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
  border-radius: 24px;
  padding: 30px;
  margin-bottom: 32px;
  border: 1px solid #e5e7eb;
  box-shadow:
    0 10px 28px rgba(0,0,0,.06),
    0 2px 6px rgba(0,0,0,.04);
  transition: transform .2s ease, box-shadow .2s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow:
    0 16px 36px rgba(0,0,0,.08),
    0 6px 10px rgba(0,0,0,.05);
}

.card h3 {
  font-size: 19px;
  font-weight: 900;
  margin-bottom: 22px;
  letter-spacing: -0.01em;
}

/* =====================
   LIST
===================== */
.list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

/* =====================
   ITEM
===================== */
.item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px 20px;
  border-radius: 18px;
  background: #f8fafc;
  border: 1.5px solid #e5e7eb;
  cursor: pointer;
  transition: all .15s ease;
}

.item:hover {
  background: #eef2ff;
  border-color: #c7d2fe;
}

.item input {
  transform: scale(1.3);
  accent-color: #6366f1;
}

.item span {
  font-size: 14px;
  font-weight: 700;
  color: #111827;
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
  margin-left: 10px;
  font-size: 12px;
  font-weight: 800;
  color: #ef4444;
}

/* =====================
   ACTIONS
===================== */
.actions {
  position: sticky;
  bottom: 28px;
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}

/* =====================
   PRIMARY BUTTON
===================== */
.primary {
  padding: 16px 34px;
  border-radius: 999px;
  background:
    linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: #ffffff;
  border: none;
  font-size: 15px;
  font-weight: 900;
  cursor: pointer;
  box-shadow:
    0 14px 30px rgba(79,70,229,.45);
  transition: all .2s ease;
}

.primary:hover {
  transform: translateY(-3px);
  box-shadow:
    0 20px 40px rgba(79,70,229,.55);
}

.primary:active {
  transform: translateY(0);
}


</style>
