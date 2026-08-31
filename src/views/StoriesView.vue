<script setup>
import { computed, ref } from 'vue'
import { useAuth } from '../store/auth.js'
import { getOrCreateFamily } from '../data/familyDirectory.js'
import { enrichFamily, STORY_THEMES } from '../data/familyProfileExtras.js'
import { useFamilySpace } from '../store/familySpace.js'
import DashboardSidebar from '../components/DashboardSidebar.vue'
import Icon from '../components/Icon.vue'

const { currentUser } = useAuth()

const family = computed(() => getOrCreateFamily(currentUser.value?.familyName ?? ''))
const extras = computed(() => (family.value ? enrichFamily(family.value) : null))

const { space } =
  family.value && extras.value ? useFamilySpace(currentUser.value.email, family.value, extras.value) : { space: null }

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=800&q=80'
const normalizedStories = computed(() => {
  if (!space) return []
  return space.stories.map((s) => ({
    ...s,
    type: s.type ?? 'Anecdote',
    theme: s.theme ?? 'quotidien',
    title: s.title ?? 'Anecdote de famille',
    excerpt: s.excerpt ?? s.text ?? '',
    date: s.date ?? new Date().toISOString().slice(0, 10),
    readTime: s.readTime ?? '5 min',
    comments: s.comments ?? 0,
    image: s.image ?? s.authorPhoto ?? FALLBACK_IMAGE,
    authorPhoto: s.authorPhoto ?? FALLBACK_IMAGE,
  }))
})

const typeFilters = ['Toutes', 'Histoire', 'Anecdote', 'Récit oral']
const activeType = ref('Toutes')
const periodFilter = ref('')
const memberFilter = ref('')
const query = ref('')
const visibleExtra = ref(0)

const typeCounts = computed(() => {
  return normalizedStories.value.reduce((acc, s) => {
    acc[s.type] = (acc[s.type] ?? 0) + 1
    return acc
  }, {})
})

const periods = computed(() => {
  return [...new Set(normalizedStories.value.map((s) => new Date(s.date).getFullYear()))].sort((a, b) => b - a)
})

const authorOptions = computed(() => {
  return [...new Set(normalizedStories.value.map((s) => s.author))]
})

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  return normalizedStories.value.filter((s) => {
    if (activeType.value !== 'Toutes' && s.type !== activeType.value) return false
    if (periodFilter.value && String(new Date(s.date).getFullYear()) !== periodFilter.value) return false
    if (memberFilter.value && s.author !== memberFilter.value) return false
    if (q && !s.title.toLowerCase().includes(q) && !s.author.toLowerCase().includes(q)) return false
    return true
  })
})

const featured = computed(() => filtered.value.find((s) => s.featured) ?? filtered.value[0] ?? null)
const restItems = computed(() => filtered.value.filter((s) => s.id !== featured.value?.id))
const sideList = computed(() => restItems.value.slice(0, 3))
const gridItems = computed(() => restItems.value.slice(3, 9 + visibleExtra.value))
const hasMore = computed(() => restItems.value.length > 3 + gridItems.value.length)

const themesWithCounts = computed(() => {
  const counts = normalizedStories.value.reduce((acc, s) => {
    acc[s.theme] = (acc[s.theme] ?? 0) + 1
    return acc
  }, {})
  return STORY_THEMES.map((t) => ({ ...t, count: counts[t.id] ?? 0 })).sort((a, b) => b.count - a.count)
})

const quoteOfDay = computed(() => {
  return normalizedStories.value.find((s) => s.type === 'Anecdote') ?? normalizedStories.value[0] ?? null
})

const recentStories = computed(() => {
  return [...normalizedStories.value].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3)
})

function loadMore() {
  visibleExtra.value += 6
}
</script>

<template>
  <div v-if="family && extras && space" class="dashboard">
    <div class="container dashboard-layout">
      <DashboardSidebar
        :family="family" :extras="extras" active-id="histoires"
        quote="Chaque histoire racontée, chaque anecdote partagée, c'est une racine qui se renforce. – Proverbe africain"
      />

      <main class="dashboard-main">
        <div class="stories-layout">
          <div class="stories-main-col">
            <div class="member-breadcrumb">
              <RouterLink to="/mon-espace">Ma famille</RouterLink>
              <span>›</span>
              <span>Histoires &amp; anecdotes</span>
            </div>

            <div class="stories-head">
              <div>
                <h1>Histoires &amp; anecdotes</h1>
                <p>Découvrez et partagez les récits, souvenirs et anecdotes qui font la richesse de notre histoire familiale.</p>
              </div>
              <div class="stories-head-actions">
                <button type="button" class="btn btn-yellow"><Icon name="upload" /> Partager une histoire</button>
                <button type="button" class="btn btn-light"><Icon name="upload" /> Importer</button>
              </div>
            </div>

            <div class="stories-filters">
              <button
                v-for="t in typeFilters" :key="t" type="button"
                class="stories-filter-pill" :class="{ active: activeType === t }"
                @click="activeType = t"
              >
                {{ t === 'Toutes' ? `Toutes (${space.stories.length})` : `${t === 'Récit oral' ? 'Récits oraux' : t + 's'} (${typeCounts[t] ?? 0})` }}
              </button>
              <select v-model="periodFilter" class="stories-filter-select">
                <option value="">Par période</option>
                <option v-for="p in periods" :key="p" :value="String(p)">{{ p }}</option>
              </select>
              <select v-model="memberFilter" class="stories-filter-select">
                <option value="">Par membre</option>
                <option v-for="m in authorOptions" :key="m" :value="m">{{ m }}</option>
              </select>
              <div class="stories-search">
                <Icon name="search" />
                <input v-model="query" type="text" placeholder="Rechercher une histoire…">
              </div>
            </div>

            <div v-if="featured" class="stories-featured-row">
              <article class="stories-featured-card">
                <button type="button" class="stories-expand-btn"><Icon name="expand" /></button>
                <img :src="featured.image" :alt="featured.title">
                <div class="stories-featured-overlay">
                  <span class="stories-badge on-image">{{ featured.type.toUpperCase() }}</span>
                  <h2>{{ featured.title }}</h2>
                  <p>{{ featured.excerpt }}</p>
                  <div class="stories-featured-foot">
                    <div class="stories-author">
                      <img :src="featured.authorPhoto" :alt="featured.author">
                      <div>
                        <strong>Par {{ featured.author }}</strong>
                        <small>{{ formatDate(featured.date) }} · <Icon name="clock" /> {{ featured.readTime }} · <Icon name="message" /> {{ featured.comments }}</small>
                      </div>
                    </div>
                    <RouterLink :to="`/mon-espace/membre/${featured.authorId}`" class="btn btn-yellow">Lire l'histoire</RouterLink>
                  </div>
                </div>
              </article>

              <div class="stories-side-list">
                <article v-for="s in sideList" :key="s.id" class="stories-side-card">
                  <div class="stories-side-thumb">
                    <img :src="s.image" :alt="s.title">
                    <span v-if="s.media" class="stories-play-btn"><Icon name="play" /></span>
                  </div>
                  <div>
                    <span class="stories-badge">{{ s.type.toUpperCase() }}</span>
                    <strong>{{ s.title }}</strong>
                    <small>Par {{ s.author }} · {{ formatDate(s.date) }}</small>
                  </div>
                </article>
              </div>
            </div>

            <h3 class="stories-grid-title">Toutes les histoires &amp; anecdotes</h3>
            <div class="stories-grid">
              <article v-for="s in gridItems" :key="s.id" class="stories-grid-card">
                <div class="stories-grid-thumb">
                  <img :src="s.image" :alt="s.title">
                  <span v-if="s.media" class="stories-play-btn"><Icon name="play" /></span>
                </div>
                <span class="stories-badge">{{ s.type.toUpperCase() }}</span>
                <strong>{{ s.title }}</strong>
                <p>{{ s.excerpt }}</p>
                <div class="stories-grid-foot">
                  <small>Par {{ s.author }}</small>
                  <small>{{ formatDate(s.date) }}</small>
                </div>
                <div class="stories-grid-meta">
                  <span><Icon name="clock" /> {{ s.readTime }}</span>
                  <span><Icon name="message" /> {{ s.comments }}</span>
                </div>
              </article>
            </div>
            <p v-if="!filtered.length" class="dashboard-empty">Aucune histoire ne correspond à votre recherche.</p>
            <button v-if="hasMore" type="button" class="stories-load-more" @click="loadMore">
              Charger plus d'histoires <Icon name="chevronLeft" />
            </button>
          </div>

          <aside class="stories-side-col">
            <div class="dashboard-card">
              <h4>Thèmes populaires</h4>
              <div class="stories-themes-list">
                <div v-for="t in themesWithCounts" :key="t.id" class="stories-theme-row">
                  <span class="stories-theme-icon"><Icon :name="t.icon" /></span>
                  <span class="stories-theme-label">{{ t.label }}</span>
                  <span class="stories-theme-count">{{ t.count }}</span>
                </div>
              </div>
            </div>

            <div v-if="quoteOfDay" class="dashboard-card stories-quote-card">
              <h4>Anecdote du jour</h4>
              <blockquote>« {{ quoteOfDay.excerpt }} »</blockquote>
              <div class="stories-author">
                <img :src="quoteOfDay.authorPhoto" :alt="quoteOfDay.author">
                <div>
                  <strong>Par {{ quoteOfDay.author }}</strong>
                  <small>{{ formatDate(quoteOfDay.date) }}</small>
                </div>
              </div>
            </div>

            <div class="dashboard-card">
              <h4>Histoires récentes</h4>
              <div class="stories-recent-list">
                <RouterLink v-for="s in recentStories" :key="s.id" :to="`/mon-espace/membre/${s.authorId}`" class="stories-recent-row">
                  <span class="stories-recent-thumb"><img :src="s.image" :alt="s.title"><Icon v-if="s.media" name="play" /></span>
                  <div>
                    <strong>{{ s.title }}</strong>
                    <small>Par {{ s.author }}</small>
                    <small>{{ formatDate(s.date) }}</small>
                  </div>
                </RouterLink>
              </div>
              <RouterLink to="/mon-espace/histoires" class="dashboard-add-link">Voir toutes les histoires →</RouterLink>
            </div>

            <div class="stories-privacy-card">
              <strong><Icon name="shield" /> Espace privé &amp; sécurisé</strong>
              <p>Vos histoires sont protégées et partagées uniquement avec les membres autorisés de la famille.</p>
              <button type="button" class="stories-privacy-link">Gérer les accès →</button>
            </div>
          </aside>
        </div>
      </main>
    </div>
  </div>
</template>
