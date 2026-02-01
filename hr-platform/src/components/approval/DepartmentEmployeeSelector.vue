<template>
  <div class="department-employee-selector-container">
    <label v-if="label">{{ label }}</label>

    <div class="selector-group">
      <!-- Department Selector -->
      <div class="department-select-wrapper">
        <select v-model="selectedDeptId" class="input-field department-select">
          <option value="">-- 부서 선택 --</option>
          <option v-for="dept in departments" :key="dept.deptId" :value="dept.deptId">
            {{ dept.deptName }}
          </option>
        </select>
        <button 
          v-if="allowDeptSelection && selectedDeptId" 
          @click="selectEntireDepartment" 
          class="btn-dept-select"
          type="button"
        >
          부서 전체 선택
        </button>
      </div>

      <!-- Employee Selector (Dropdown Style) -->
      <div class="employee-selector-wrapper">
        <select 
          v-model="tempSelectedEmployeeId" 
          @change="handleEmployeeSelect" 
          class="input-field employee-select"
          :disabled="!selectedDeptId"
        >
          <option value="">-- 사원 선택 --</option>
          <option v-for="employee in filteredEmployees" :key="employee.accId" :value="employee.accId">
            {{ employee.name }} ({{ employee.accId }})
          </option>
        </select>
      </div>
    </div>

    <div v-if="selectedEmployees.length > 0" class="selected-tags">
      <span v-for="employee in selectedEmployees" :key="employee.accId" class="employee-tag">
        {{ employee.name }} ({{ employee.accId }})
        <button @click="removeEmployee(employee)" class="remove-tag-btn">✕</button>
      </span>
    </div>

    <small v-if="hint" class="hint">
      {{ hint }} 
      <template v-if="maxItems < 99"> (최대 {{ maxItems }}명)</template>
    </small>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed, defineProps, defineEmits } from 'vue';
import { getAllDepartmentsByCompany } from '@/api/departmentApi';
import { fetchUserAccounts } from '@/api/userAccount'; // Assuming this can take deptId

import { useAuthStore } from '@/stores/authStore';

const props = defineProps({
  label: {
    type: String,
    default: '',
  },
  hint: {
    type: String,
    default: '',
  },
  modelValue: {
    type: Array, // Expecting an array of employee IDs
    default: () => [],
  },
  maxItems: {
    type: Number,
    default: 100,
  },
  allowDeptSelection: {
    type: Boolean,
    default: false,
  }
});

const emit = defineEmits(['update:modelValue']);
const authStore = useAuthStore();

const departments = ref([]);
const selectedDeptId = ref('');
const allEmployeesInDept = ref([]);
const selectedEmployees = ref([]);
const tempSelectedEmployeeId = ref('');

// --- Computed Properties ---
const filteredEmployees = computed(() => {
  const currentUserId = Number(authStore.user?.employeeId);
  // Filter out already selected employees AND current user
  return allEmployeesInDept.value.filter(
    (employee) => 
      !selectedEmployees.value.some((selected) => selected.accId === employee.accId) &&
      Number(employee.accId) !== currentUserId
  );
});

// --- Watchers ---
watch(selectedDeptId, async (newDeptId) => {
  allEmployeesInDept.value = [];
  if (newDeptId) {
    await fetchEmployeesByDepartment(newDeptId);
  }
});

watch(() => props.modelValue, (newVal) => {
  // This is a simplified initialization. In a real app, you might fetch full user objects
  // for the initial IDs if only IDs are passed via modelValue.
  // For now, it assumes modelValue provides IDs and selectedEmployees stores objects.
  // If modelValue contains IDs, we need to fetch their names to display properly.
  // This would require an additional API call (e.g., fetchUserAccountDetail for each ID).
  // For simplicity, if modelValue has values, we'll try to represent them as { accId: id, name: `User ${id}` }
  if (newVal && newVal.length > 0 && selectedEmployees.value.length === 0) {
    selectedEmployees.value = newVal.map(id => ({ accId: id, name: `User ${id}` }));
  }
}, { immediate: true });

// --- Methods ---
const fetchDepartments = async () => {
  try {
    const response = await getAllDepartmentsByCompany();
    departments.value = response.data.data.departments || [];
  } catch (error) {
    console.error('부서 목록을 불러오는 데 실패했습니다:', error);
  }
};

const fetchEmployeesByDepartment = async (deptId) => {
  try {
    const response = await fetchUserAccounts({ deptId: deptId });
    const userList = response.data.data.accounts || [];
    allEmployeesInDept.value = userList.map(user => ({
      accId: user.accId || user.employeeId,
      name: user.name || user.employeeName,
    }));
  } catch (error) {
    console.error(`부서 ID ${deptId}의 사원 목록을 불러오는 데 실패했습니다:`, error);
    allEmployeesInDept.value = [];
  }
};

const handleEmployeeSelect = () => {
  if (!tempSelectedEmployeeId.value) return;
  
  if (selectedEmployees.value.length >= props.maxItems) {
    alert(`최대 ${props.maxItems}명까지 선택 가능합니다.`);
    tempSelectedEmployeeId.value = '';
    return;
  }

  const employee = allEmployeesInDept.value.find(e => e.accId === tempSelectedEmployeeId.value);
  if (employee) {
    selectEmployee(employee);
  }
  tempSelectedEmployeeId.value = ''; // Reset select after adding
};

const selectEntireDepartment = () => {
  const currentDept = departments.value.find(d => d.deptId === selectedDeptId.value);
  
  // 이미 선택된 인원 제외하고 추가 가능한 인원 계산
  const toAdd = allEmployeesInDept.value.filter(
    emp => !selectedEmployees.value.some(s => s.accId === emp.accId)
  );

  if (selectedEmployees.value.length + toAdd.length > props.maxItems) {
    alert(`부서 전체 인원(${toAdd.length}명)을 추가하면 최대 인원(${props.maxItems}명)을 초과합니다.`);
    return;
  }

  if (toAdd.length === 0) {
    alert('이미 해당 부서의 모든 인원이 선택되었습니다.');
    return;
  }

  if (confirm(`${currentDept.deptName}의 모든 사원(${toAdd.length}명)을 추가하시겠습니까?`)) {
    selectedEmployees.value.push(...toAdd);
    emitSelectedEmployeeIds();
  }
};

const selectEmployee = (employee) => {
  if (!selectedEmployees.value.some((selected) => selected.accId === employee.accId)) {
    selectedEmployees.value.push(employee);
    emitSelectedEmployeeIds();
  }
};

const removeEmployee = (employeeToRemove) => {
  selectedEmployees.value = selectedEmployees.value.filter(
    (employee) => employee.accId !== employeeToRemove.accId
  );
  emitSelectedEmployeeIds();
};

const emitSelectedEmployeeIds = () => {
  const ids = selectedEmployees.value.map((employee) => employee.accId);
  emit('update:modelValue', ids);
};

onMounted(() => {
  fetchDepartments();
});
</script>

<style scoped>
.department-employee-selector-container {
  margin-bottom: 20px;
  position: relative;
}

.department-employee-selector-container label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.selector-group {
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: flex-start;
}

.department-select-wrapper {
  flex: 1;
}

.employee-selector-wrapper {
  flex: 2;
  display: flex;
  gap: 8px;
}

.input-field {
  flex-grow: 1;
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  color: #333;
  box-sizing: border-box;
  background-color: #fff; /* For select */
}

.input-field:focus {
  border-color: #007bff;
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.15);
}

.btn-search {
  padding: 10px 15px;
  background-color: #007bff;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: background-color 0.2s ease;
}

.btn-search:hover {
  background-color: #0056b3;
}

.btn-dept-select {
  margin-top: 8px;
  width: 100%;
  padding: 8px;
  background-color: #f0f0f0;
  border: 1px solid #dcdcdc;
  border-radius: 6px;
  font-size: 12px;
  color: #555;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-dept-select:hover {
  background-color: #e0e0e0;
  color: #333;
}

.employee-results-dropdown {
  position: absolute;
  /* Adjust top dynamically if needed, or place it after the selector-group */
  /* For now, assuming it appears below the whole group for simplicity */
  top: calc(100% + 5px); /* Position below the container */
  left: 0;
  right: 0;
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  max-height: 200px;
  overflow-y: auto;
  z-index: 100;
}

.results-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.result-item {
  padding: 10px 15px;
  cursor: pointer;
  font-size: 14px;
  color: #333;
}

.result-item:hover {
  background-color: #f0f8ff;
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 12px;
}

.employee-tag {
  display: inline-flex;
  align-items: center;
  background-color: #e8f3ff;
  padding: 8px 14px;
  border-radius: 12px;
  font-size: 13px;
  color: #3182f6;
  font-weight: 500;
  border: 1px solid #d0e5ff;
  transition: all 0.2s;
}

.employee-tag:hover {
  background-color: #dbeaff;
}

.remove-tag-btn {
  background: none;
  border: none;
  color: #3182f6;
  font-size: 16px;
  margin-left: 8px;
  cursor: pointer;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.7;
}

.remove-tag-btn:hover {
  opacity: 1;
  color: #1b64da;
}

.hint {
  font-size: 12px;
  color: #888;
  margin-top: 4px;
  display: block;
}
</style>
