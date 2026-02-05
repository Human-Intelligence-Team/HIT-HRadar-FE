
<template>
  <div class="org-chart-container" ref="container"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { Graph } from '@antv/x6'
import { register } from '@antv/x6-vue-shape'
import { Scroller } from '@antv/x6-plugin-scroller'
import dagre from 'dagre'
import DepartmentNode from './DepartmentNode.vue'

const props = defineProps({
  data: {
    type: Object, // OrganizationChartResponse
    required: true
  }
})

const container = ref(null)
let graph = null

// Register custom node
register({
  shape: 'dept-node',
  width: 220,
  height: 100, // Initial height, wil be dynamic or fixed
  component: DepartmentNode,
})

const initGraph = () => {
  if (!container.value) return

  graph = new Graph({
    container: container.value,
    autoResize: true,
    background: {
      color: '#f5f7fa',
    },
    grid: {
      visible: true,
      type: 'dot',
      args: { color: '#a0a0a0', thickness: 1 },
    },
    panning: true,
    mousewheel: {
      enabled: true,
      modifiers: ['ctrl', 'meta'],
    },
  })

  graph.use(
    new Scroller({
      enabled: true,
      pageVisible: false, // Infinite canvas mode (no page borders)
      pageBreak: false,
      pannable: true,
    })
  )
}

const renderChart = () => {
  if (!graph || !props.data || !props.data.organization) return

  const nodes = []
  const edges = []

  // Recursive function to traverse department tree
  const traverse = (dept, depth = 0) => {
    // Create Node (Width 220)
    const nodeWidth = 220
    const employees = dept.employees || []
    const nodeHeight = 40 + 16 + (employees.length > 0 ? employees.length * 40 : 20) + 20 // Approx height

    const node = {
      id: `dept-${dept.deptId}`,
      shape: 'dept-node',
      width: nodeWidth,
      height: nodeHeight,
      data: {
        deptName: dept.deptName,
        employees: employees,
        depth: depth, // Pass depth for styling
      },
    }
    nodes.push(node)

    // Create Edges to Children
    if (dept.children && dept.children.length > 0) {
      dept.children.forEach(child => {
        edges.push({
          source: `dept-${dept.deptId}`,
          target: `dept-${child.deptId}`,
          router: {
            name: 'manhattan',
            args: {
               padding: 20,
            },
          },
          connector: {
            name: 'rounded',
          },
          attrs: {
            line: {
              stroke: '#A2B1C6',
              strokeWidth: 2,
            },
          },
        })
        traverse(child, depth + 1)
      })
    }
  }

  // Start traversal
  props.data.organization.forEach(root => traverse(root))

  // Apply Dagre Layout manually
  const g = new dagre.graphlib.Graph()
  g.setGraph({ 
      rankdir: 'TB', 
      nodesep: 60, 
      ranksep: 80 
  })
  g.setDefaultEdgeLabel(() => ({}))

  nodes.forEach(node => {
      g.setNode(node.id, { width: node.width, height: node.height })
  })

  edges.forEach(edge => {
      g.setEdge(edge.source, edge.target)
  })

  dagre.layout(g)

  nodes.forEach(node => {
      const pos = g.node(node.id)
      node.x = pos.x
      node.y = pos.y
  })

  graph.fromJSON({ nodes, edges })
  graph.centerContent()
}

watch(() => props.data, () => {
    renderChart()
}, { deep: true })

onMounted(() => {
  initGraph()
  if (props.data) {
    renderChart()
  }
})

onUnmounted(() => {
  if (graph) {
    graph.dispose()
  }
})

defineExpose({
    zoomIn: () => graph?.zoom(0.1),
    zoomOut: () => graph?.zoom(-0.1),
    zoomToFit: () => graph?.zoomToFit({ padding: 20 }),
})
</script>

<style scoped>
.org-chart-container {
  width: 100%;
  height: 100%; /* Fill flex parent */
  background: white;
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
  position: relative; /* Context for absolute children */
}
</style>
