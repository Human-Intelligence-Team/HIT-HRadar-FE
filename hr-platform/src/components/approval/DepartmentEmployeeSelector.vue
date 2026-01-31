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
      </div>

      <!-- Employee Search/List within selected department -->
      <div class="employee-selector-wrapper">
        <input
          type="text"
          v-model="employeeSearchQuery"
          @keyup.enter="filterEmployees"
          placeholder="사원 이름 검색..."
          class="input-field employee-search"
        />
        <button @click="filterEmployees" class="btn btn-search">검색</button>
      </div>
    </div>

    <div v-if="filteredEmployees.length > 0" class="employee-results-dropdown">
      <ul class="results-list">
        <li
          v-for="employee in filteredEmployees"
          :key="employee.accId"
          @click="selectEmployee(employee)"
          class="result-item"
        >
          {{ employee.name }} ({{ employee.accId }})
        </li>
      </ul>
    </div>

    <div v-if="selectedEmployees.length > 0" class="selected-tags">
      <span v-for="employee in selectedEmployees" :key="employee.accId" class="employee-tag">
        {{ employee.name }} ({{ employee.accId }})
        <button @click="removeEmployee(employee)" class="remove-tag-btn">✕</button>
      </span>
    </div>

    <small v-if="hint" class="hint">{{ hint }}</small>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed, defineProps, defineEmits } from 'vue';
import { getAllDepartmentsByCompany } from '@/api/departmentApi';
import { fetchUserAccounts } from '@/api/userAccount'; // Assuming this can take deptId

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
});

const emit = defineEmits(['update:modelValue']);

const departments = ref([]);
const selectedDeptId = ref('');
const allEmployeesInDept = ref([]); // All employees fetched for the selected department
const employeeSearchQuery = ref('');
const searchResults = ref([]); // Filtered employees based on employeeSearchQuery
const selectedEmployees = ref([]); // Stores { accId, name } objects

// --- Computed Properties ---
const filteredEmployees = computed(() => {
  let employeesToFilter = employeeSearchQuery.value.trim()
    ? searchResults.value
    : allEmployeesInDept.value;

  // Filter out already selected employees
  return employeesToFilter.filter(
    (employee) => !selectedEmployees.value.some((selected) => selected.accId === employee.accId)
  );
});

// --- Watchers ---
watch(selectedDeptId, async (newDeptId) => {
  allEmployeesInDept.value = [];
  employeeSearchQuery.value = '';
  searchResults.value = [];
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
    departments.value = response.data.data;
  } catch (error) {
    console.error('부서 목록을 불러오는 데 실패했습니다:', error);
  }
};

const fetchEmployeesByDepartment = async (deptId) => {
  try {
    // Assuming fetchUserAccounts can take deptId as a parameter
    const response = await fetchUserAccounts({ deptId: deptId });
    allEmployeesInDept.value = response.data.data.map(user => ({
      accId: user.accId || user.employeeId,
      name: user.name || user.employeeName,
    }));
    // Also update searchResults to reflect the full list initially
    searchResults.value = [...allEmployeesInDept.value];
  } catch (error) {
    console.error(`부서 ID ${deptId}의 사원 목록을 불러오는 데 실패했습니다:`, error);
    allEmployeesInDept.value = [];
    searchResults.value = [];
  }
};

const filterEmployees = () => {
  if (!employeeSearchQuery.value.trim()) {
    searchResults.value = [...allEmployeesInDept.value];
    return;
  }
  searchResults.value = allEmployeesInDept.value.filter(employee =>
    employee.name.toLowerCase().includes(employeeSearchQuery.value.trim().toLowerCase())
  );
};

const selectEmployee = (employee) => {
  if (!selectedEmployees.value.some((selected) => selected.accId === employee.accId)) {
    selectedEmployees.value.push(employee);
    emitSelectedEmployeeIds();
  }
  employeeSearchQuery.value = ''; // Clear search query after selection
  searchResults.value = [...allEmployeesInDept.value]; // Reset search results display
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
  flex-direction: column;
  gap: 10px;
}

.department-select-wrapper,
.employee-selector-wrapper {
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

.employee-tag {
  display: inline-flex;
  align-items: center;
  background-color: #e0e0e0;
  padding: 6px 10px;
  border-radius: 15px;
  font-size: 13px;
  color: #333;
}

.remove-tag-btn {
  background: none;
  border: none;
  color: #777;
  font-size: 14px;
  margin-left: 5px;
  cursor: pointer;
}

.remove-tag-btn:hover {
  color: #dc3545;
}

.hint {
  font-size: 12px;
  color: #888;
  margin-top: 4px;
  display: block;
}
</style>
