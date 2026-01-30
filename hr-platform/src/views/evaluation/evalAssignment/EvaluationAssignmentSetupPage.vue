<template>
  <section class="page">
    <!-- ===== Page Title ===== -->
    <div class="section-title">
      <div>
        <h1>평가 배정</h1>
        <div class="sub">
          평가 회차와 평가 유형을 기준으로 평가자와 피평가자를 배정합니다.
        </div>
      </div>
    </div>

    <!-- ===== Tabs ===== -->
    <div class="tabs">
      <button
        class="tab"
        :class="{ active: activeTab === 'assign' }"
        @click="activeTab = 'assign'"
      >
        평가 배정하기
      </button>
      <button
        class="tab"
        :class="{ active: activeTab === 'status' }"
        @click="$router.push('/hr/evaluation/assignment/status')"
      >
        평가 배정 상태 보기
      </button>
    </div>
    <!-- ======================================================
      TAB 1 : 평가 배정하기
    ======================================================= -->
    <section v-if="activeTab === 'assign'">
      <!-- ===== STEP 1 ===== -->
      <section class="card step-card">
        <div class="step-header">
          <span class="step">STEP 1</span>
          <h3>평가 기준 선택</h3>
        </div>

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

          <div class="field">
            <label>부서</label>
            <select v-model="selectedDepartment">
              <option value="">부서 선택</option>
              <option
                v-for="d in departments"
                :key="d"
                :value="d"
              >
                {{ d }}
              </option>
            </select>
          </div>
        </div>
      </section>

      <!-- ===== STEP 2~4 ===== -->
      <section v-if="isStep1Completed">
        <!-- ===== STEP 2 ===== -->
        <section class="card step-card">
          <div class="step-header">
            <span class="step">STEP 2</span>
            <h3>평가자 선택</h3>
          </div>

          <div class="employee-grid">
            <label
              v-for="emp in filteredEmployees"
              :key="emp.id"
              class="employee-card"
              :class="{ selected: selectedEvaluator?.id === emp.id }"
            >
              <input
                type="radio"
                name="evaluator"
                :value="emp"
                v-model="selectedEvaluator"
              />
              <div class="info">
                <div class="name">{{ emp.name }}</div>
                <div class="meta">
                  {{ emp.department }} · {{ emp.position }}
                </div>
              </div>
            </label>
          </div>
        </section>

        <!-- ===== STEP 3 ===== -->
        <section class="card step-card">
          <div class="step-header">
            <span class="step">STEP 3</span>
            <h3>피평가자 선택</h3>
          </div>

          <div class="employee-grid">
            <label
              v-for="emp in filteredEmployees"
              :key="emp.id"
              class="employee-card"
              :class="{
                selected: selectedEvaluatees.includes(emp),
                disabled:
                  selectedEvaluator?.id === emp.id ||
                  alreadyAssignedEvaluateeIds.includes(emp.id)
              }"
            >
              <input
                type="checkbox"
                :value="emp"
                v-model="selectedEvaluatees"
                :disabled="
                  selectedEvaluator?.id === emp.id ||
                  alreadyAssignedEvaluateeIds.includes(emp.id)
                "
              />
              <div class="info">
                <div class="name">{{ emp.name }}</div>
                <div class="meta">
                  {{ emp.department }} · {{ emp.position }}
                </div>
              </div>
            </label>
          </div>
        </section>

        <!-- ===== STEP 4 ===== -->
        <section class="card preview-card">
          <div class="step-header">
            <span class="step">STEP 4</span>
            <h3>기존 평가 배정 관리</h3>
          </div>

          <div v-if="assignments.length === 0" class="empty">
            아직 배정된 평가가 없습니다.
          </div>

          <div v-else class="assignment-table">
            <div class="assignment-head">
              <span></span>
              <span>평가자</span>
              <span>피평가자</span>
              <span>상태</span>
              <span></span>
            </div>

            <div
              v-for="a in assignments"
              :key="a.assignmentId"
              class="assignment-row"
            >
              <input
                type="checkbox"
                v-model="selectedAssignments"
                :value="a.assignmentId"
              />

              <span class="name">{{ mapEmployeeName(a.evaluatorId) }}</span>
              <span class="name">{{ mapEmployeeName(a.evaluateeId) }}</span>

              <span
                class="status"
                :class="a.assignmentStatus.toLowerCase()"
              >
                {{ a.assignmentStatus }}
              </span>

              <button
                class="icon-btn delete"
                @click="removeAssignment(a.assignmentId)"
              >
                🗑
              </button>
            </div>
          </div>

          <div
            v-if="selectedAssignments.length > 0"
            class="assignment-footer"
          >
            <button
              class="btn btn-danger"
              @click="removeSelectedAssignments"
            >
              선택한 배정 삭제
            </button>
          </div>
        </section>

        <!-- ===== Action ===== -->
        <div class="action-footer">
          <button
            class="btn btn-primary"
            :disabled="!isReady"
            @click="createAssignments"
          >
            평가 배정하기
          </button>
        </div>
      </section>
    </section>

    <!-- ======================================================
      TAB 2 : 평가 배정 상태 보기
    ======================================================= -->
    <section v-if="activeTab === 'status'" class="card preview-card">
      <div class="step-header">
        <h3>평가 배정 현황</h3>
      </div>

      <div v-if="assignments.length === 0" class="empty">
        아직 배정된 평가가 없습니다.
      </div>

      <div v-else class="assignment-table">
        <div class="assignment-head">
          <span></span>
          <span>평가자</span>
          <span>피평가자</span>
          <span>상태</span>
          <span></span>
        </div>

        <div
          v-for="a in assignments"
          :key="a.assignmentId"
          class="assignment-row"
        >
          <input
            type="checkbox"
            v-model="selectedAssignments"
            :value="a.assignmentId"
          />

          <span class="name">{{ mapEmployeeName(a.evaluatorId) }}</span>
          <span class="name">{{ mapEmployeeName(a.evaluateeId) }}</span>

          <span
            class="status"
            :class="a.assignmentStatus.toLowerCase()"
          >
            {{ a.assignmentStatus }}
          </span>

          <button
            class="icon-btn delete"
            @click="removeAssignment(a.assignmentId)"
          >
            🗑
          </button>
        </div>
      </div>
    </section>
  </section>
</template>




<script setup>
import { ref, computed, onMounted, watch } from 'vue'

// ===== API =====
import { fetchCycles } from '@/api/cycleApi'
import { fetchCycleEvaluationTypes } from '@/api/cycleEvaluationTypeApi'
import {
  fetchAssignmentsByCycleEvalType,
  createEvaluationAssignments,
  deleteEvaluationAssignment,
} from '@/api/evaluationAssignmentApi'

/* =========================
 * state
 * ========================= */

const cycles = ref([])
const evalTypes = ref([])
const assignments = ref([])

const selectedCycleId = ref('')
const selectedEvalTypeId = ref('')

const selectedEvaluator = ref(null)
const selectedEvaluatees = ref([])

const selectedAssignments = ref([])

const selectedDepartment = ref('')

const activeTab = ref('assign') // 'status' | 'assign'

/* ===== 더미 사원 (ID: 1001~1004) ===== */

const employees = ref([
  { id: 1001, name: '김성수', department: '개발팀', position: '대리' },
  { id: 1002, name: '이서연', department: '기획팀', position: '과장' },
  { id: 1003, name: '박민수', department: '인사팀', position: '사원' },
  { id: 1004, name: '정유진', department: '개발팀', position: '차장' },
])

const departments = ['개발팀', '기획팀', '인사팀']

/* =========================
 * computed
 * ========================= */

// 이미 배정된 피평가자 ID
const alreadyAssignedEvaluateeIds = computed(() =>
  assignments.value.map(a => a.evaluateeId)
)

const selectedCycle = computed(() =>
  cycles.value.find(c => c.cycleId === selectedCycleId.value)
)

const selectedEvalType = computed(() =>
  evalTypes.value.find(t => t.evalTypeId === selectedEvalTypeId.value)
)

// evalTypeId === cycleEvalTypeId
const cycleEvalTypeId = computed(() => selectedEvalTypeId.value)

// 배정 가능 여부
const isReady = computed(() =>
  selectedCycleId.value &&
  selectedEvalTypeId.value &&
  selectedEvaluator.value &&
  selectedEvaluatees.value.length > 0
)

const filteredEmployees = computed(() =>
  employees.value.filter(
    e => e.department === selectedDepartment.value
  )
)

/* =========================
 * load
 * ========================= */

const loadCycles = async () => {
  const res = await fetchCycles()
  cycles.value = res.data?.data ?? res.data ?? []
}

const loadEvalTypesByCycle = async (cycleId) => {
  if (!cycleId) {
    evalTypes.value = []
    return
  }
  const res = await fetchCycleEvaluationTypes(cycleId)
  evalTypes.value = res.data?.data ?? res.data ?? []
}

const loadAssignments = async (cycleEvalTypeId) => {
  if (!cycleEvalTypeId) {
    assignments.value = []
    return
  }
  const res = await fetchAssignmentsByCycleEvalType(cycleEvalTypeId)
  assignments.value = res.data?.data ?? []
}

const isStep1Completed = computed(() =>
  selectedCycleId.value &&
  selectedEvalTypeId.value &&
  selectedDepartment.value
)


/* =========================
 * lifecycle
 * ========================= */

onMounted(loadCycles)

/* =========================
 * watch
 * ========================= */

watch(selectedCycleId, (cycleId) => {
  loadEvalTypesByCycle(cycleId)
  selectedEvalTypeId.value = ''
  selectedEvaluator.value = null
  selectedEvaluatees.value = []
  assignments.value = []
})

watch(selectedEvalTypeId, (evalTypeId) => {
  selectedEvaluator.value = null
  selectedEvaluatees.value = []
  loadAssignments(evalTypeId)
})
watch(activeTab, () => {
  selectedAssignments.value = []
})

watch(selectedDepartment, () => {
  selectedEvaluator.value = null
  selectedEvaluatees.value = []
})

/* =========================
 * actions
 * ========================= */

// 평가 배정 생성
const createAssignments = async () => {
  if (!isReady.value) return

  try {
    await createEvaluationAssignments(cycleEvalTypeId.value, {
      evaluatorId: selectedEvaluator.value.id,
      evaluateeIds: selectedEvaluatees.value.map(e => e.id),
    })

    // 초기화 + 재조회
    selectedEvaluatees.value = []
    selectedAssignments.value = []
    selectedEvaluator.value = null
    await loadAssignments(cycleEvalTypeId.value)

    alert('평가 배정이 완료되었습니다.')
  } catch (e) {
    console.error(e)
    alert('평가 배정 중 오류가 발생했습니다.')
  }
}

// 단건 삭제
const removeAssignment = async (assignmentId) => {
  try {
    await deleteEvaluationAssignment(assignmentId)

    assignments.value = assignments.value.filter(
      a => a.assignmentId !== assignmentId
    )
    selectedAssignments.value =
      selectedAssignments.value.filter(id => id !== assignmentId)
  } catch (e) {
    console.error(e)
    alert('배정 삭제 중 오류가 발생했습니다.')
  }
}

// 선택 삭제
const removeSelectedAssignments = async () => {
  try {
    for (const id of selectedAssignments.value) {
      await deleteEvaluationAssignment(id)
    }

    selectedAssignments.value = []
    await loadAssignments(cycleEvalTypeId.value)
  } catch (e) {
    console.error(e)
    alert('선택 삭제 중 오류가 발생했습니다.')
  }
}

/* =========================
 * utils
 * ========================= */

const mapEmployeeName = (empId) => {
  return employees.value.find(e => e.id === empId)?.name ?? empId
}
</script>




<style scoped>
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

/* ===== Card ===== */
.card {
  background: #fff;
  border-radius: 16px;
  padding: 22px;
  margin-bottom: 22px;
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.06);
}
.step-card {
  border-left: 6px solid #6366f1;
}

/* ===== Step Header ===== */
.step-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}
.step {
  font-size: 11px;
  font-weight: 800;
  color: #6366f1;
}
.step-header h3 {
  font-size: 16px;
  font-weight: 700;
}

/* ===== Selector ===== */
.selector {
  display: flex;
  gap: 16px;
}
.field {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
label {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
}
select {
  border: none;
  border-bottom: 2px solid #e5e7eb;
  padding: 8px 4px;
}
select:focus {
  outline: none;
  border-bottom-color: #6366f1;
}

/* ===== Employee ===== */
.employee-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 14px;
}
.employee-card {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 14px;
  display: flex;
  gap: 10px;
  cursor: pointer;
  transition: 0.15s;
}
.employee-card input {
  accent-color: #6366f1;
}
.employee-card .name {
  font-weight: 700;
}
.employee-card .meta {
  font-size: 12px;
  color: #6b7280;
}
.employee-card.selected {
  background: #eef2ff;
  border-color: #6366f1;
}
.employee-card.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* ===== Preview ===== */
.preview-card {
  background: #f9fafb;
}
.preview-title {
  font-size: 14px;
  margin-bottom: 6px;
}
.preview-line {
  font-size: 13px;
  margin-bottom: 10px;
}
.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.tag {
  background: #6366f1;
  color: white;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
}
.tag small {
  opacity: 0.8;
  margin-left: 4px;
}

.empty {
  font-size: 13px;
  color: #9ca3af;
}

/* ===== Action ===== */
.action-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 28px;
}
.btn {
  padding: 10px 20px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  border: none;
}
.btn-primary {
  background: #6366f1;
  color: white;
}
.btn-primary:disabled {
  background: #c7d2fe;
  cursor: not-allowed;
}
.btn-primary:not(:disabled):hover {
  background: #4f46e5;
}

/* ===== Assignment Table ===== */
.assignment-table {
  margin-top: 14px;
  font-size: 13px;
}

.assignment-head,
.assignment-row {
  display: grid;
  grid-template-columns: 32px 1fr 1fr 90px 40px;
  align-items: center;
  padding: 10px 6px;
}

.assignment-head {
  font-weight: 700;
  color: #6b7280;
  border-bottom: 1px solid #e5e7eb;
}

.assignment-row {
  border-bottom: 1px solid #f1f5f9;
}
.assignment-row:hover {
  background: #f8fafc;
}

.assignment-row .name {
  font-weight: 600;
}

.status {
  font-size: 12px;
  font-weight: 700;
  color: #6366f1;
}
.status.pending {
  color: #6366f1;
}
.status.submitted {
  color: #16a34a;
}

.icon-btn.delete {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
}
.icon-btn.delete:hover {
  color: #ef4444;
}

/* ===== Assignment Footer ===== */
.assignment-footer {
  margin-top: 14px;
  display: flex;
  justify-content: flex-end;
}

/* ===== Tabs ===== */
.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
}

.tab {
  padding: 10px 18px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 700;
  background: #e5e7eb;
  color: #374151;
  border: none;
  cursor: pointer;
  transition: 0.15s;
}

.tab.active {
  background: #6366f1;
  color: white;
}

.tab:not(.active):hover {
  background: #d1d5db;
}

</style>
