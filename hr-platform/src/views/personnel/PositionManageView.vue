<template>
  <section class="page-container">
    <div class="page-header">
      <div class="header-content">
        <h1 class="title">직위 관리</h1>
        <p class="subtitle">회사의 직위 체계와 서열(Rank)을 효율적으로 관리하세요.</p>
      </div>
    </div>

    <div v-if="loading" class="loading-container">
       <div class="loader"></div>
       <p>데이터를 불러오는 중입니다...</p>
    </div>
    
    <div v-else class="content-wrapper">
      <PositionTable 
        :positions="positions" 
        :is-admin="true"
        @add="openModal()" 
        @edit="openModal" 
        @delete="handleDelete" 
      />
    </div>

    <!-- Form Modal (Component) -->
    <PositionFormModal 
      v-model="form"
      :show="showModal"
      :is-edit="isEdit"
      :submitting="submitting"
      @close="closeModal"
      @submit="handleSubmit"
    />
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import PositionTable from '@/components/personnel/PositionTable.vue'
import PositionFormModal from '@/components/personnel/PositionFormModal.vue'
import { 
  fetchPositions, 
  createPosition, 
  updatePosition, 
  deletePosition 
} from '@/api/positionApi'

const positions = ref([])
const loading = ref(false)
const submitting = ref(false)
const showModal = ref(false)
const isEdit = ref(false)
const currentId = ref(null)

const form = ref({
  name: '',
  rank: 0
})

const loadPositions = async () => {
  loading.value = true
  try {
    const res = await fetchPositions()
    positions.value = res.data?.data?.positions || []
  } catch (e) {
    console.error('Failed to load positions', e)
  } finally {
    loading.value = false
  }
}

onMounted(loadPositions)

const openModal = (pos = null) => {
  if (pos) {
    isEdit.value = true
    currentId.value = pos.positionId
    form.value = { 
      name: pos.name, 
      rank: pos.rank 
    }
  } else {
    isEdit.value = false
    currentId.value = null
    form.value = { name: '', rank: 0 }
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const handleSubmit = async () => {
  submitting.value = true
  try {
    if (isEdit.value) {
      await updatePosition(currentId.value, form.value)
    } else {
      await createPosition(form.value)
    }
    closeModal()
    await loadPositions()
  } catch (e) {
    console.error('Submit failed', e)
    alert('작업에 실패했습니다.')
  } finally {
    submitting.value = false
  }
}

const handleDelete = async (id) => {
  if (!confirm('정말 삭제하시겠습니까? 관련 사원 정보에 영향을 줄 수 있습니다.')) return
  try {
    await deletePosition(id)
    await loadPositions()
  } catch (e) {
    console.error('Delete failed', e)
    alert('삭제에 실패했습니다.')
  }
}
</script>

<style scoped>
.page-container {
  padding: 0 20px 40px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin: 24px 0 32px;
}

.title {
  font-size: 28px;
  font-weight: 700;
  color: #111827;
  letter-spacing: -0.02em;
  margin-bottom: 8px;
}

.subtitle {
  color: #6b7280;
  font-size: 15px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 0;
  color: #6b7280;
}
</style>
