<!--ContributionBarChart-->
<template>
  <div class="contribution-chart">
    <div ref="chartRef" class="chart"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  categories: {
    type: Array,
    default: () => []
  },
  values: {
    type: Array,
    default: () => []
  }
})


const chartRef = ref(null)
let chartInstance = null

const createOption = () => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'shadow' },
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 8,
    textStyle: {
      color: '#fff',
      fontSize: 12
    },
    formatter: params => {
      const p = params[0]
      return `<b>${p.name}</b><br/>기여도: ${p.value}%`
    }
  },
  grid: {
    left: '6%',
    right: '8%',
    top: '6%',
    bottom: '6%',
    containLabel: true
  },
  xAxis: {
    type: 'value',
    max: 100,
    axisLine: { show: false },
    axisTick: { show: false },
    splitLine: {
      lineStyle: {
        color: '#F1F3F5'
      }
    },
    axisLabel: {
      formatter: '{value}%',
      color: '#9AA0A6',
      fontSize: 11
    }
  },
  yAxis: {
    type: 'category',
    data: props.categories,
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: {
      color: '#374151',
      fontSize: 14,
      fontWeight: 600,
      margin: 20
    }
  },
  series: [
    // 🔹 배경 트랙
    {
      type: 'bar',
      data: props.categories.map(() => 100),
      barWidth: 22,
      barGap: '-100%',
      itemStyle: {
        color: '#F4F6FA',
        borderRadius: [0, 10, 10, 0]
      },
      silent: true,
      tooltip: { show: false }
    },
    // 🔹 실제 데이터 바
    {
      type: 'bar',
      data: props.values,
      barWidth: 22,
      label: {
        show: true,
        position: 'right',
        formatter: '{c}%',
        fontSize: 12,
        fontWeight: 600,
        color: '#4A6CF7',
        padding: [4, 8],
        backgroundColor: '#EEF2FF',
        borderRadius: 999
      },
      itemStyle: {
        borderRadius: [0, 10, 10, 0],
        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
          { offset: 0, color: '#6C8CFF' },
          { offset: 1, color: '#4A6CF7' }
        ])
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 12,
          shadowColor: 'rgba(74,108,247,0.35)'
        }
      }
    }
  ]
})


const renderChart = async () => {
  if (!chartRef.value) return

  await nextTick()

  if (!chartInstance) {
    chartInstance = echarts.init(chartRef.value)
  }


  chartInstance.clear()
  chartInstance.setOption(createOption())
  chartInstance.resize()
}

onMounted(() => {
  renderChart()
})

watch(
  () => props.categories,
  () => {
    renderChart()
  }
)

watch(
  () => props.values,
  () => {
    renderChart()
  }
)

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
})
</script>

<style scoped>
.contribution-chart {
  width: 100%;
}

.chart {
  width: 100%;
  height: 220px;
}
</style>
