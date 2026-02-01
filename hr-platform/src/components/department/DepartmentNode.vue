<template>
  <div class="dept-card">
    <div class="card-header" :style="headerStyle">
      <span class="dept-name">{{ data?.deptName || 'Unknown' }}</span>
    </div>
    <div class="card-body">
      <div v-if="data?.employees && data.employees.length > 0" class="employee-list">
        <div 
          v-for="emp in data.employees" 
          :key="emp.empId" 
          class="employee-item clickable"
          @click.stop="openProfile(emp.empId)"
        >
          <span class="emp-name">{{ emp.name }}</span>
          <span class="emp-pos">{{ emp.positionName }}</span>
        </div>
      </div>
      <div v-else class="empty-emp">
        구성원 없음
      </div>
    </div>
  </div>
</template>

<script setup>
import { inject, ref, onMounted, computed } from 'vue'
import router from '@/router' // Direct import for X6 context support

// const router = useRouter() // Removed: fails in X6
// const route = useRoute()   // Removed: fails in X6

const getNode = inject('getNode')
const node = getNode ? getNode() : null
const data = ref(node ? node.getData() : {})

// Dynamic Color Logic: Automatic HSL calculation
const headerStyle = computed(() => {
  const depth = data.value?.depth || 0
  // Base: Navy (HSL 220-230 range). 
  // Formula: Lightness starts at 15% and increases by 9% per depth level.
  const lightness = 15 + (depth * 9) 
  // Cap lightness at 90% to prevent white-on-white issues
  const safeLightness = Math.min(lightness, 90)
  
  return {
    backgroundColor: `hsl(223, 85%, ${safeLightness}%)`
  }
})

const openProfile = (empId) => {
  console.log('Clicked Employee ID:', empId)
  if (!empId) {
    console.warn('No empId found in click!', data.value)
    return
  }
  
  // Use currentRoute from imported router
  const currentQuery = router.currentRoute.value.query
  router.push({ query: { ...currentQuery, empId } })
}

onMounted(() => {
  if (node) {
    // console.log('DepartmentNode Mounted. Data:', node.getData()) 
    node.on('change:data', ({ current }) => {
      data.value = current
    })
  }
})
</script>

<style scoped>
.dept-card {
  width: 100%;
  height: 100%;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

/* Header Styling */
.card-header {
  /* Background is now set via inline style */
  padding: 10px 12px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s ease;
}

.dept-name {
  font-weight: 700;
  color: white;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Body Styling */
.card-body {
  flex: 1;
  padding: 8px;
  overflow-y: auto;
  background: white;
}

.employee-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.employee-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  padding: 6px 8px;
  background: #f8fafc;
  border-radius: 4px;
  border: 1px solid #f1f5f9;
  transition: all 0.2s;
}
.employee-item.clickable {
  cursor: pointer;
}
.employee-item.clickable:hover {
  background-color: #e2e8f0;
  border-color: #cbd5e1;
}

.emp-name { color: #334155; font-weight: 500; }
.emp-pos { color: #64748b; font-size: 0.75rem; }

.empty-emp {
  color: #cbd5e1;
  font-size: 0.8rem;
  text-align: center;
  margin-top: 10px;
}
</style>
