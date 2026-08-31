<script setup>
import { computed, ref } from 'vue'
import { allFamilies } from '../data/familyDirectory.js'

const families = allFamilies()
const query = ref('')
const activeDept = ref('Tous')

const departments = computed(() => {
  const set = new Set(families.map((f) => f.department))
  return ['Tous', ...[...set].sort((a, b) => a.localeCompare(b, 'fr'))]
})

const isSearching = computed(() => query.value.trim().length > 0)

const searchResults = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return []
  return families.filter((f) => f.name.toLowerCase().includes(q))
})

const rows = computed(() => {
  const depts = activeDept.value === 'Tous' ? departments.value.slice(1) : [activeDept.value]
  return depts
    .map((dept) => ({ dept, items: families.filter((f) => f.department === dept) }))
    .filter((row) => row.items.length)
})

const railRefs = ref({})
function setRailRef(dept, el) {
  if (el) railRefs.value[dept] = el
}
function scrollRow(dept, dir) {
  railRefs.value[dept]?.scrollBy({ left: dir * 320, behavior: 'smooth' })
}
</script>

<template>
  <section class="section directory-section">
    <div class="container">
      <div class="section-head">
        <div>
          <div class="eyebrow">Comme Netflix</div>
          <h2>Toutes les familles ({{ families.length }})</h2>
        </div>
        <p>Parcourez l'ensemble des noms de famille présents dans notre base, département par département, et cliquez sur une affiche pour découvrir son histoire.</p>
      </div>

      <div class="directory-controls">
        <input
          v-model="query"
          type="text"
          class="login-input directory-search"
          placeholder="Rechercher un nom de famille…"
        >
        <div class="archive-tabs directory-depts">
          <button
            v-for="dept in departments"
            :key="dept"
            class="archive-tab"
            :class="{ active: activeDept === dept }"
            @click="activeDept = dept"
          >{{ dept }}</button>
        </div>
      </div>

      <div v-if="isSearching">
        <p v-if="!searchResults.length" class="dashboard-empty">Aucun nom ne correspond à votre recherche.</p>
        <div v-else class="directory-grid">
          <RouterLink v-for="f in searchResults" :key="f.slug" :to="`/famille/${f.slug}`" class="poster-card">
            <div class="poster-img"><img :src="f.image" :alt="f.name"><span v-if="f.verified" class="badge">Vérifiée</span></div>
            <div class="poster-body">
              <strong>{{ f.name }}</strong>
              <small>{{ f.department }} · {{ f.origin }}</small>
            </div>
          </RouterLink>
        </div>
      </div>

      <div v-else class="directory-rows">
        <div class="directory-row" v-for="row in rows" :key="row.dept">
          <h3>{{ row.dept }}</h3>
          <div class="carousel-wrap">
            <button type="button" class="carousel-arrow prev" @click="scrollRow(row.dept, -1)">‹</button>
            <div class="rail poster-rail" :ref="(el) => setRailRef(row.dept, el)">
              <RouterLink v-for="f in row.items" :key="f.slug" :to="`/famille/${f.slug}`" class="poster-card">
                <div class="poster-img"><img :src="f.image" :alt="f.name"><span v-if="f.verified" class="badge">Vérifiée</span></div>
                <div class="poster-body">
                  <strong>{{ f.name }}</strong>
                  <small>{{ f.origin }}</small>
                </div>
              </RouterLink>
            </div>
            <button type="button" class="carousel-arrow next" @click="scrollRow(row.dept, 1)">›</button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
