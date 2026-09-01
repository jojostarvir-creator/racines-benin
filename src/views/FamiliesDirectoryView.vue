<script setup>
import { computed, ref, nextTick } from 'vue'
import { allFamilies } from '../data/familyDirectory.js'
import FavoriteHeart from '../components/FavoriteHeart.vue'

const families = allFamilies()
const query = ref('')
const activeDept = ref('Tous')

const mosaicFamilies = families.slice(0, 20)
const heroQuery = ref('')
const resultsRef = ref(null)
async function scrollToResults() {
  await nextTick()
  resultsRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
async function submitHeroSearch() {
  query.value = heroQuery.value
  await scrollToResults()
}

const departments = computed(() => {
  const set = new Set(families.map((f) => f.department))
  return ['Tous', ...[...set].sort((a, b) => a.localeCompare(b, 'fr'))]
})

async function selectHeroDept(dept) {
  activeDept.value = dept
  query.value = ''
  heroQuery.value = ''
  await scrollToResults()
}

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
  <section class="directory-hero">
    <div class="directory-hero-mosaic" aria-hidden="true">
      <RouterLink v-for="f in mosaicFamilies" :key="f.slug" :to="`/famille/${f.slug}`" class="mosaic-tile">
        <img :src="f.image" :alt="f.name" loading="lazy">
        <span class="mosaic-tile-label">{{ f.name }}</span>
        <FavoriteHeart :slug="f.slug" />
      </RouterLink>
    </div>
    <div class="directory-hero-scrim"></div>

    <div class="container directory-hero-inner">
      <h1>Découvrez les Histoires de vos Ancêtres, et bien plus</h1>
      <p class="directory-hero-subtitle">Un catalogue unique de récits et de traditions familiales.</p>
      <p class="directory-hero-hint">Prêt à explorer votre patrimoine&nbsp;? Indiquez votre nom de famille pour commencer.</p>
      <form class="directory-hero-search" @submit.prevent="submitHeroSearch">
        <input v-model="heroQuery" type="text" placeholder="Sélectionnez votre Clan / Nom">
        <button type="submit" class="btn btn-yellow">Explorer →</button>
      </form>

      <div class="archive-tabs directory-hero-depts">
        <button
          v-for="dept in departments"
          :key="dept"
          class="archive-tab"
          :class="{ active: activeDept === dept && !isSearching }"
          @click="selectHeroDept(dept)"
        >{{ dept }}</button>
      </div>
    </div>
  </section>

  <section class="section directory-section">
    <div class="container" ref="resultsRef">
      <div v-if="isSearching">
        <p v-if="!searchResults.length" class="dashboard-empty">Aucun nom ne correspond à votre recherche.</p>
        <div v-else class="directory-grid">
          <RouterLink v-for="f in searchResults" :key="f.slug" :to="`/famille/${f.slug}`" class="poster-card">
            <div class="poster-img">
              <img :src="f.image" :alt="f.name">
              <span v-if="f.verified" class="badge">Vérifiée</span>
              <FavoriteHeart :slug="f.slug" />
            </div>
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
                <div class="poster-img">
                  <img :src="f.image" :alt="f.name">
                  <span v-if="f.verified" class="badge">Vérifiée</span>
                  <FavoriteHeart :slug="f.slug" />
                </div>
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
