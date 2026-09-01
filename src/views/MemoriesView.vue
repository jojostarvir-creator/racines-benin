<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth } from '../store/auth.js'
import { getOrCreateFamily } from '../data/familyDirectory.js'
import { enrichFamily, MEMORY_TYPES, MEMORY_CATEGORIES } from '../data/familyProfileExtras.js'
import { useFamilySpace } from '../store/familySpace.js'
import DashboardSidebar from '../components/DashboardSidebar.vue'
import QuickAddModal from '../components/QuickAddModal.vue'
import Icon from '../components/Icon.vue'

const route = useRoute()
const { currentUser } = useAuth()

const family = computed(() => getOrCreateFamily(currentUser.value?.familyName ?? ''))
const extras = computed(() => (family.value ? enrichFamily(family.value) : null))

const { space, addMember, addMemory } =
  family.value && extras.value ? useFamilySpace(currentUser.value.email, family.value, extras.value) : { space: null }

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=800&q=80'
const normalizedMemories = computed(() => {
  if (!space?.memories) return []
  return space.memories.map((m, i) => ({
    ...m,
    type: m.type ?? 'Photo',
    category: m.category ?? MEMORY_CATEGORIES[0],
    title: m.title ?? 'Souvenir de famille',
    image: m.image ?? m.authorPhoto ?? FALLBACK_IMAGE,
    authorPhoto: m.authorPhoto ?? FALLBACK_IMAGE,
    addedDaysAgo: i * 6 + 2,
  }))
})

const activeType = ref(typeof route.query.type === 'string' && MEMORY_TYPES.some((t) => t.id === route.query.type) ? route.query.type : 'Toutes')
const categoryFilter = ref('')
const yearFilter = ref('')
const memberFilter = ref('')
const placeFilter = ref('')
const query = ref('')
const viewMode = ref('grid')
const visibleExtra = ref(0)
const modal = ref(null)

const typeCounts = computed(() => {
  return normalizedMemories.value.reduce((acc, m) => {
    acc[m.type] = (acc[m.type] ?? 0) + 1
    return acc
  }, {})
})

const years = computed(() => [...new Set(normalizedMemories.value.map((m) => m.year))])
const authorOptions = computed(() => [...new Set(normalizedMemories.value.map((m) => m.author))])
const placeOptions = computed(() => [...new Set(normalizedMemories.value.map((m) => m.place))])

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  return normalizedMemories.value.filter((m) => {
    if (activeType.value !== 'Toutes' && m.type !== activeType.value) return false
    if (categoryFilter.value && m.category !== categoryFilter.value) return false
    if (yearFilter.value && m.year !== yearFilter.value) return false
    if (memberFilter.value && m.author !== memberFilter.value) return false
    if (placeFilter.value && m.place !== placeFilter.value) return false
    if (q && !m.title.toLowerCase().includes(q) && !m.author.toLowerCase().includes(q)) return false
    return true
  })
})

const visibleItems = computed(() => filtered.value.slice(0, 12 + visibleExtra.value))
const hasMore = computed(() => filtered.value.length > visibleItems.value.length)
function loadMore() {
  visibleExtra.value += 12
}

const categoriesWithCounts = computed(() => {
  const counts = normalizedMemories.value.reduce((acc, m) => {
    acc[m.category] = (acc[m.category] ?? 0) + 1
    return acc
  }, {})
  return MEMORY_CATEGORIES.map((c) => ({ label: c, count: counts[c] ?? 0 })).filter((c) => c.count).sort((a, b) => b.count - a.count)
})

const recentMemories = computed(() => {
  return [...normalizedMemories.value].sort((a, b) => a.addedDaysAgo - b.addedDaysAgo).slice(0, 3)
})

const storagePercent = computed(() => Math.min(96, 20 + normalizedMemories.value.length * 4))
const storageUsedGo = computed(() => (storagePercent.value / 10).toFixed(1))

function formatAddedDate(daysAgo) {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function openInvite() {
  modal.value = 'member'
}
function submitMember(payload) {
  addMember(payload)
  modal.value = null
}
function newMemoryDefaults() {
  return {
    type: 'Photo',
    category: MEMORY_CATEGORIES[0],
    author: currentUser.value?.fullName ?? 'Vous',
    authorId: null,
    authorPhoto: currentUser.value?.avatar ?? FALLBACK_IMAGE,
    year: String(new Date().getFullYear()),
    place: extras.value?.localities?.[0] ?? '—',
  }
}
function submitPhoto(payload) {
  addMemory({ ...newMemoryDefaults(), title: payload.caption || 'Souvenir de famille', image: payload.src })
  modal.value = null
}

const importInput = ref(null)
function submitImport(e) {
  const file = e.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    addMemory({ ...newMemoryDefaults(), title: file.name.replace(/\.[^.]+$/, ''), image: reader.result })
  }
  reader.readAsDataURL(file)
  e.target.value = ''
}
</script>

<template>
  <div v-if="family && extras && space" class="dashboard">
    <div class="container dashboard-layout">
      <DashboardSidebar
        :family="family" :extras="extras" active-id="photos"
        quote="Chaque souvenir est une racine qui nourrit notre histoire."
        @invite="openInvite"
        @add-souvenir="modal = 'photo'"
      />

      <main class="dashboard-main">
        <div class="stories-layout">
          <div class="stories-main-col">
            <div class="member-breadcrumb">
              <RouterLink to="/mon-espace">Ma famille</RouterLink>
              <span>›</span>
              <span>Souvenirs &amp; médias</span>
            </div>

            <div class="stories-head">
              <div>
                <h1>Souvenirs &amp; médias</h1>
                <p>Conservez et partagez les trésors de votre famille.</p>
              </div>
              <div class="stories-head-actions">
                <button type="button" class="btn btn-yellow" @click="modal = 'photo'"><Icon name="upload" /> Ajouter un souvenir</button>
                <button type="button" class="btn btn-light" @click="importInput?.click()"><Icon name="upload" /> Importer</button>
                <input ref="importInput" type="file" accept="image/*" class="settings-file-input" @change="submitImport">
              </div>
            </div>

            <div class="stories-filters">
              <button type="button" class="stories-filter-pill" :class="{ active: activeType === 'Toutes' }" @click="activeType = 'Toutes'">
                Tous les souvenirs ({{ normalizedMemories.length }})
              </button>
              <button
                v-for="t in MEMORY_TYPES" :key="t.id" type="button"
                class="stories-filter-pill" :class="{ active: activeType === t.id }"
                @click="activeType = t.id"
              >
                <Icon :name="t.icon" /> {{ t.label }} ({{ typeCounts[t.id] ?? 0 }})
              </button>
            </div>

            <div class="stories-filters">
              <select v-model="categoryFilter" class="stories-filter-select">
                <option value="">Toutes les catégories</option>
                <option v-for="c in MEMORY_CATEGORIES" :key="c" :value="c">{{ c }}</option>
              </select>
              <select v-model="yearFilter" class="stories-filter-select">
                <option value="">Toutes les années</option>
                <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
              </select>
              <select v-model="memberFilter" class="stories-filter-select">
                <option value="">Tous les membres</option>
                <option v-for="a in authorOptions" :key="a" :value="a">{{ a }}</option>
              </select>
              <select v-model="placeFilter" class="stories-filter-select">
                <option value="">Tous les lieux</option>
                <option v-for="p in placeOptions" :key="p" :value="p">{{ p }}</option>
              </select>
              <div class="stories-search">
                <Icon name="search" />
                <input v-model="query" type="text" placeholder="Rechercher un souvenir…">
              </div>
              <div class="memories-view-toggle">
                <button type="button" :class="{ active: viewMode === 'grid' }" @click="viewMode = 'grid'"><Icon name="grid" /></button>
                <button type="button" :class="{ active: viewMode === 'list' }" @click="viewMode = 'list'"><Icon name="list" /></button>
              </div>
            </div>

            <div class="memories-grid" :class="{ 'list-view': viewMode === 'list' }">
              <RouterLink v-for="m in visibleItems" :key="m.id" :to="`/mon-espace/membre/${m.authorId}`" class="memory-card">
                <div class="memory-thumb">
                  <img :src="m.image" :alt="m.title">
                  <span class="memory-type-badge"><Icon :name="MEMORY_TYPES.find((t) => t.id === m.type)?.icon ?? 'image'" /></span>
                  <template v-if="m.duration">
                    <span class="memory-play-btn"><Icon name="play" /></span>
                    <span class="memory-duration">{{ m.duration }}</span>
                  </template>
                </div>
                <div class="memory-info">
                  <strong>{{ m.title }}</strong>
                  <small>{{ m.year }} · {{ m.place }}</small>
                  <div class="memory-author"><img :src="m.authorPhoto" :alt="m.author"> Par {{ m.author }}</div>
                </div>
              </RouterLink>
            </div>
            <p v-if="!filtered.length" class="dashboard-empty">Aucun souvenir ne correspond à votre recherche.</p>
            <button v-if="hasMore" type="button" class="stories-load-more" @click="loadMore">
              Charger plus de souvenirs <Icon name="chevronLeft" />
            </button>
          </div>

          <aside class="stories-side-col">
            <div class="dashboard-card memories-storage-card">
              <h4>Espace de stockage</h4>
              <div class="memories-storage-row">
                <div class="memories-storage-ring" :style="{ '--pct': storagePercent }">
                  <span>{{ storagePercent }}%</span>
                </div>
                <div>
                  <strong>{{ storageUsedGo }} Go / 10 Go</strong>
                  <p>Gérez vos fichiers et libérez de l'espace.</p>
                </div>
              </div>
              <RouterLink to="/mon-espace/parametres#gestion-donnees" class="dashboard-add-link">Gérer le stockage →</RouterLink>
            </div>

            <div class="dashboard-card">
              <h4>Catégories populaires</h4>
              <div class="stories-themes-list">
                <button
                  v-for="c in categoriesWithCounts" :key="c.label" type="button"
                  class="stories-theme-row memories-category-row" @click="categoryFilter = c.label"
                >
                  <span class="stories-theme-icon"><Icon name="image" /></span>
                  <span class="stories-theme-label">{{ c.label }}</span>
                  <span class="stories-theme-count">{{ c.count }}</span>
                </button>
              </div>
              <button type="button" class="dashboard-add-link" @click="categoryFilter = ''">Voir toutes les catégories →</button>
            </div>

            <div class="dashboard-card">
              <h4>Souvenirs récents</h4>
              <div class="stories-recent-list">
                <RouterLink v-for="m in recentMemories" :key="m.id" :to="`/mon-espace/membre/${m.authorId}`" class="stories-recent-row">
                  <span class="stories-recent-thumb"><img :src="m.image" :alt="m.title"><Icon v-if="m.duration" name="play" /></span>
                  <div>
                    <strong>{{ m.title }}</strong>
                    <small>{{ m.type }} · {{ formatAddedDate(m.addedDaysAgo) }}</small>
                  </div>
                </RouterLink>
              </div>
              <RouterLink to="/mon-espace/souvenirs" class="dashboard-add-link">Voir tous les récents →</RouterLink>
            </div>

            <div class="memories-share-card">
              <strong><Icon name="users" /> Partage en famille</strong>
              <p>Invitez d'autres membres à ajouter leurs souvenirs et enrichir l'histoire de notre famille.</p>
              <button type="button" class="btn btn-yellow" @click="openInvite"><Icon name="users" /> Inviter un membre</button>
            </div>
          </aside>
        </div>
      </main>
    </div>

    <QuickAddModal v-if="modal === 'member'" type="member" @close="modal = null" @submit="submitMember" />
    <QuickAddModal v-if="modal === 'photo'" type="photo" @close="modal = null" @submit="submitPhoto" />
  </div>
</template>
