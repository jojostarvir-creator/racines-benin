<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { departmentData } from '../data/departments.js'
import { viewBox, countryOutline, waterBody, departmentPaths } from '../data/beninMapPaths.js'

const deptIds = Object.keys(departmentPaths)
const selected = ref('Alibori')
const hovered = ref(null)
const current = computed(() => departmentData[selected.value])

const shapeRefs = ref({})
const labels = ref([])

const selectedPin = computed(() => {
  const label = labels.value.find((l) => l.id === selected.value)
  if (!label) return null
  const r = 6.5
  const tipX = label.x
  const tipY = label.y - 8
  const bulbY = tipY - r * 3.4
  return {
    r,
    holeCx: tipX,
    holeCy: tipY - r * 1.7,
    path: `M ${tipX},${tipY} C ${tipX - r * 1.6},${tipY - r * 1.8} ${tipX - r * 1.2},${bulbY} ${tipX},${bulbY} C ${tipX + r * 1.2},${bulbY} ${tipX + r * 1.6},${tipY - r * 1.8} ${tipX},${tipY} Z`,
  }
})

function setShapeRef(id, el) {
  if (el) shapeRefs.value[id] = el
}

function select(id) {
  selected.value = id
}

onMounted(async () => {
  await nextTick()
  labels.value = deptIds.map((id) => {
    const el = shapeRefs.value[id]
    if (!el) return { id, x: 0, y: 0 }
    const box = el.getBBox()
    return { id, x: box.x + box.width / 2, y: box.y + box.height / 2 }
  })
})
</script>

<template>
  <section class="section map-section" id="territoires">
    <div class="container">
      <div class="section-head">
        <div>
          <div class="eyebrow">Comme une carte touristique</div>
          <h2>Explorez les histoires par département</h2>
        </div>
        <p>Choisissez un département directement sur la carte du Bénin. Les récits, familles et traditions associés s'affichent instantanément.</p>
      </div>

      <div class="interactive-map-wrap">
        <div class="interactive-map">
          <svg class="benin-map" :viewBox="viewBox" xmlns="http://www.w3.org/2000/svg">
            <path class="map-outline" :d="countryOutline" />
            <path class="map-water" :d="waterBody" />

            <path
              v-for="id in deptIds"
              :key="id"
              :ref="(el) => setShapeRef(id, el)"
              class="dept-shape"
              :class="{ active: selected === id, hovered: hovered === id }"
              :d="departmentPaths[id]"
              @click="select(id)"
              @mouseenter="hovered = id"
              @mouseleave="hovered = null"
            >
              <title>{{ id }}</title>
            </path>

            <text
              v-for="label in labels"
              :key="label.id"
              class="dept-label"
              :class="{ active: selected === label.id }"
              :x="label.x"
              :y="label.y"
              text-anchor="middle"
              @click="select(label.id)"
            >{{ label.id }}</text>

            <g v-if="selectedPin" class="dept-marker">
              <path :d="selectedPin.path" />
              <circle :cx="selectedPin.holeCx" :cy="selectedPin.holeCy" :r="selectedPin.r * 0.4" />
            </g>
          </svg>
        </div>

        <aside class="dept-panel">
          <div class="dept-panel-top">
            <div>
              <div class="eyebrow">Département sélectionné</div>
              <h3>{{ selected }}</h3>
            </div>
            <span class="story-count">{{ current.count }}</span>
          </div>

          <p class="dept-intro">{{ current.intro }}</p>

          <div class="dept-stories">
            <RouterLink
              v-for="story in current.stories"
              :key="story[0]"
              class="dept-story"
              to="/recherche"
            >
              <img :src="story[2]" :alt="story[0]">
              <div>
                <small>{{ story[1] }}</small>
                <h4>{{ story[0] }}</h4>
                <p>Découvrir le récit →</p>
              </div>
            </RouterLink>
          </div>
          <RouterLink class="btn btn-yellow dept-more" to="/recherche">Voir les {{ current.count }} →</RouterLink>
        </aside>
      </div>
    </div>
  </section>
</template>
