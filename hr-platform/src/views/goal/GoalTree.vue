<!-- GoalTree.vue -->
<template>
  <div>
    <GoalTreeItem
      v-for="goal in goals"
      :key="goal.goalId"
      :goal="goal"
      :level="1"
    />
  </div>
</template>

<script setup>
import GoalTreeItem from './GoalTreeItem.vue'

defineProps({
  goals: {
    type: Array,
    required: true,
  },
})
</script>
