<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { viewBox, countryOutline, departmentPaths } from '../data/beninMapPaths.js'

const props = defineProps({
  department: { type: String, default: null },
})

const deptRef = ref(null)
const marker = ref(null)

onMounted(async () => {
  await nextTick()
  if (deptRef.value) {
    const box = deptRef.value.getBBox()
    marker.value = { x: box.x + box.width / 2, y: box.y + box.height / 2 }
  }
})
</script>

<template>
  <svg class="benin-silhouette" :viewBox="viewBox" xmlns="http://www.w3.org/2000/svg">
    <path :d="countryOutline" class="silhouette-fill" />
    <path
      v-if="department && departmentPaths[department]"
      ref="deptRef"
      :d="departmentPaths[department]"
      class="silhouette-dept-hidden"
    />
    <circle v-if="marker" :cx="marker.x" :cy="marker.y" r="9" class="silhouette-marker-ring" />
    <circle v-if="marker" :cx="marker.x" :cy="marker.y" r="4" class="silhouette-marker-dot" />
  </svg>
</template>
