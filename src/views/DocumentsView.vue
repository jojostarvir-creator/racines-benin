<script setup>
import { computed, ref } from 'vue'
import { useAuth } from '../store/auth.js'
import { getOrCreateFamily } from '../data/familyDirectory.js'
import { enrichFamily, DOCUMENT_CATEGORIES } from '../data/familyProfileExtras.js'
import { useFamilySpace } from '../store/familySpace.js'
import DashboardSidebar from '../components/DashboardSidebar.vue'
import QuickAddModal from '../components/QuickAddModal.vue'
import Icon from '../components/Icon.vue'

const { currentUser } = useAuth()

const family = computed(() => getOrCreateFamily(currentUser.value?.familyName ?? ''))
const extras = computed(() => (family.value ? enrichFamily(family.value) : null))

const { space, addDocument, updateDocument, removeDocument } =
  family.value && extras.value ? useFamilySpace(currentUser.value.email, family.value, extras.value) : { space: null }

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1561812938-f6e60cbf95e3?auto=format&fit=crop&w=800&q=80'
const normalizedDocs = computed(() => {
  if (!space) return []
  return space.documents.map((d, i) => ({
    ...d,
    format: d.format ?? d.type ?? 'PDF',
    category: d.category ?? d.type ?? DOCUMENT_CATEGORIES[i % DOCUMENT_CATEGORIES.length],
    title: d.title ?? 'Document de famille',
    year: d.year ?? '—',
    place: d.place ?? '—',
    author: d.author ?? 'Vous',
    authorPhoto: d.authorPhoto ?? FALLBACK_IMAGE,
    image: d.image ?? d.src ?? FALLBACK_IMAGE,
    documentDate: d.documentDate ?? d.year ?? '—',
    description: d.description ?? d.title ?? '',
    addedAt: d.addedAt ?? '—',
  }))
})

const activeCategory = ref('Toutes')
const yearFilter = ref('')
const memberFilter = ref('')
const formatFilter = ref('')
const placeFilter = ref('')
const query = ref('')
const viewMode = ref('grid')
const visibleExtra = ref(0)
const modal = ref(false)

const categoryCounts = computed(() => {
  return normalizedDocs.value.reduce((acc, d) => {
    acc[d.category] = (acc[d.category] ?? 0) + 1
    return acc
  }, {})
})

const years = computed(() => [...new Set(normalizedDocs.value.map((d) => d.year))].sort((a, b) => b - a))
const authorOptions = computed(() => [...new Set(normalizedDocs.value.map((d) => d.author))])
const placeOptions = computed(() => [...new Set(normalizedDocs.value.map((d) => d.place))])

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  return normalizedDocs.value.filter((d) => {
    if (activeCategory.value !== 'Toutes' && d.category !== activeCategory.value) return false
    if (yearFilter.value && d.year !== yearFilter.value) return false
    if (memberFilter.value && d.author !== memberFilter.value) return false
    if (formatFilter.value && d.format !== formatFilter.value) return false
    if (placeFilter.value && d.place !== placeFilter.value) return false
    if (q && !d.title.toLowerCase().includes(q) && !d.author.toLowerCase().includes(q)) return false
    return true
  })
})

const visibleDocs = computed(() => filtered.value.slice(0, 11 + visibleExtra.value))
const hasMoreCount = computed(() => filtered.value.length - visibleDocs.value.length)
function loadMore() {
  visibleExtra.value += 11
}

const selectedId = ref(null)
const selectedDoc = computed(() => filtered.value.find((d) => d.id === selectedId.value) ?? filtered.value[0] ?? null)
const selectedIndex = computed(() => filtered.value.findIndex((d) => d.id === selectedDoc.value?.id))
function selectDoc(id) {
  selectedId.value = id
}
function closeDetail() {
  selectedId.value = '__closed__'
}
function prevDoc() {
  if (selectedIndex.value > 0) selectedId.value = filtered.value[selectedIndex.value - 1].id
}
function nextDoc() {
  if (selectedIndex.value < filtered.value.length - 1) selectedId.value = filtered.value[selectedIndex.value + 1].id
}

const detailTab = ref('details')

const stats = computed(() => {
  const docs = normalizedDocs.value
  const yearNums = docs.map((d) => parseInt(d.year, 10)).filter((y) => !Number.isNaN(y))
  return {
    total: docs.length,
    oldest: yearNums.length ? Math.min(...yearNums) : '—',
    newest: yearNums.length ? Math.max(...yearNums) : '—',
    members: new Set(docs.map((d) => d.author)).size,
    storage: (docs.length * 0.62).toFixed(1),
  }
})

function submitDocument(payload) {
  addDocument(payload)
  modal.value = false
}

async function downloadDoc() {
  if (!selectedDoc.value) return
  try {
    const res = await fetch(selectedDoc.value.image)
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${selectedDoc.value.title}.${(selectedDoc.value.format ?? 'jpg').toLowerCase()}`
    a.click()
    URL.revokeObjectURL(url)
  } catch {
    window.open(selectedDoc.value.image, '_blank')
  }
}

const shareFeedback = ref('')
async function shareDoc() {
  if (!selectedDoc.value) return
  const url = `${window.location.origin}/mon-espace/documents`
  if (navigator.share) {
    try {
      await navigator.share({ title: selectedDoc.value.title, url })
      return
    } catch {
      // user cancelled the native share sheet — fall through to clipboard copy
    }
  }
  try {
    await navigator.clipboard.writeText(url)
    shareFeedback.value = 'Lien copié !'
  } catch {
    shareFeedback.value = "Impossible de copier le lien."
  }
  setTimeout(() => { shareFeedback.value = '' }, 2500)
}

const movingDoc = ref(false)
function moveDoc(category) {
  if (!selectedDoc.value) return
  updateDocument(selectedDoc.value.id, { category })
  movingDoc.value = false
}

function deleteDoc() {
  if (!selectedDoc.value) return
  if (!confirm(`Supprimer « ${selectedDoc.value.title} » ? Cette action est irréversible.`)) return
  removeDocument(selectedDoc.value.id)
  selectedId.value = null
}
</script>

<template>
  <div v-if="family && extras && space" class="dashboard">
    <div class="container dashboard-layout">
      <DashboardSidebar
        :family="family" :extras="extras" active-id="documents"
        quote="Nos archives d'aujourd'hui sont la mémoire de demain."
        @invite="modal = 'invite'"
        @add-souvenir="modal = 'document'"
      />

      <main class="dashboard-main">
        <div class="stories-layout">
          <div class="stories-main-col">
            <div class="member-breadcrumb">
              <RouterLink to="/mon-espace">Ma famille</RouterLink>
              <span>›</span>
              <span>Documents</span>
            </div>

            <div class="stories-head">
              <div class="documents-title-row">
                <span class="documents-title-icon"><Icon name="file" /></span>
                <div>
                  <h1>Documents</h1>
                  <p>Conservez et organisez les documents précieux de votre famille.<br>Actes officiels, lettres, certificats, contrats et autres archives historiques.</p>
                </div>
              </div>
              <div class="stories-head-actions">
                <button type="button" class="btn btn-yellow" @click="modal = 'document'"><Icon name="upload" /> Ajouter un document</button>
              </div>
            </div>

            <div class="stories-filters">
              <button type="button" class="stories-filter-pill" :class="{ active: activeCategory === 'Toutes' }" @click="activeCategory = 'Toutes'">
                Tous les documents ({{ normalizedDocs.length }})
              </button>
              <button
                v-for="c in DOCUMENT_CATEGORIES" :key="c" type="button"
                class="stories-filter-pill" :class="{ active: activeCategory === c }"
                @click="activeCategory = c"
              >
                {{ c }} ({{ categoryCounts[c] ?? 0 }})
              </button>
            </div>

            <div class="stories-filters">
              <select v-model="yearFilter" class="stories-filter-select">
                <option value="">Toutes les années</option>
                <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
              </select>
              <select v-model="memberFilter" class="stories-filter-select">
                <option value="">Tous les membres</option>
                <option v-for="a in authorOptions" :key="a" :value="a">{{ a }}</option>
              </select>
              <select v-model="formatFilter" class="stories-filter-select">
                <option value="">Tous les types</option>
                <option value="PDF">PDF</option>
                <option value="JPG">JPG</option>
                <option value="PNG">PNG</option>
              </select>
              <select v-model="placeFilter" class="stories-filter-select">
                <option value="">Tous les lieux</option>
                <option v-for="p in placeOptions" :key="p" :value="p">{{ p }}</option>
              </select>
              <div class="stories-search">
                <Icon name="search" />
                <input v-model="query" type="text" placeholder="Rechercher un document…">
              </div>
              <div class="memories-view-toggle">
                <button type="button" :class="{ active: viewMode === 'grid' }" @click="viewMode = 'grid'"><Icon name="grid" /></button>
                <button type="button" :class="{ active: viewMode === 'list' }" @click="viewMode = 'list'"><Icon name="list" /></button>
              </div>
            </div>

            <div class="documents-grid" :class="{ 'list-view': viewMode === 'list' }">
              <button
                v-for="d in visibleDocs" :key="d.id" type="button"
                class="document-card" :class="{ selected: selectedDoc && d.id === selectedDoc.id }"
                @click="selectDoc(d.id)"
              >
                <div class="document-thumb">
                  <img :src="d.image" :alt="d.title">
                  <span class="document-format-badge">{{ d.format }}</span>
                </div>
                <div class="document-info">
                  <strong>{{ d.title }}</strong>
                  <small>{{ d.year }} · {{ d.place.split(',')[0] }}</small>
                  <div class="document-author"><img :src="d.authorPhoto" :alt="d.author"> Par {{ d.author }}</div>
                </div>
              </button>
              <div v-if="hasMoreCount > 0" class="document-more-card" @click="loadMore">
                <Icon name="folder" />
                <strong>Voir plus de documents</strong>
                <span>+{{ hasMoreCount }} documents</span>
              </div>
            </div>
            <p v-if="!filtered.length" class="dashboard-empty">Aucun document ne correspond à votre recherche.</p>

            <div class="documents-stats-row">
              <div class="documents-stat"><Icon name="folder" /><div><strong>{{ stats.total }}</strong><span>Documents au total</span></div></div>
              <div class="documents-stat"><Icon name="calendar" /><div><strong>{{ stats.oldest }} - {{ stats.newest }}</strong><span>Plus ancien - Plus récent</span></div></div>
              <div class="documents-stat"><Icon name="users" /><div><strong>{{ stats.members }}</strong><span>Membres concernés</span></div></div>
              <div class="documents-stat"><Icon name="upload" /><div><strong>{{ stats.storage }} Go</strong><span>Espace utilisé</span></div></div>
            </div>
          </div>

          <aside v-if="selectedDoc" class="timeline-detail-panel documents-detail-panel">
            <div class="documents-detail-head">
              <div>
                <h2>{{ selectedDoc.title }} <span class="stories-badge documents-format-tag">{{ selectedDoc.format }}</span></h2>
                <small>{{ selectedDoc.year }} · {{ selectedDoc.place }}</small>
              </div>
              <button type="button" class="timeline-detail-close" @click="closeDetail"><Icon name="close" /></button>
            </div>

            <div class="documents-preview">
              <button type="button" class="documents-nav prev" @click="prevDoc" :disabled="selectedIndex <= 0"><Icon name="chevronLeft" /></button>
              <img :src="selectedDoc.image" :alt="selectedDoc.title">
              <button type="button" class="documents-nav next" @click="nextDoc" :disabled="selectedIndex >= filtered.length - 1"><Icon name="chevronLeft" /></button>
            </div>

            <div class="documents-action-row">
              <button type="button" @click="downloadDoc"><Icon name="upload" /> Télécharger</button>
              <button type="button" @click="shareDoc">
                <Icon name="expand" /> {{ shareFeedback || 'Partager' }}
              </button>
              <div class="documents-move-wrap">
                <button type="button" @click="movingDoc = !movingDoc"><Icon name="folder" /> Déplacer</button>
                <div v-if="movingDoc" class="documents-move-menu">
                  <button v-for="c in DOCUMENT_CATEGORIES" :key="c" type="button" @click="moveDoc(c)">{{ c }}</button>
                </div>
              </div>
              <button type="button" class="danger" @click="deleteDoc"><Icon name="trash" /> Supprimer</button>
            </div>

            <div class="member-tabs documents-detail-tabs">
              <button type="button" class="member-tab" :class="{ active: detailTab === 'details' }" @click="detailTab = 'details'">Détails</button>
              <button type="button" class="member-tab" :class="{ active: detailTab === 'info' }" @click="detailTab = 'info'">Informations</button>
              <button type="button" class="member-tab" :class="{ active: detailTab === 'activity' }" @click="detailTab = 'activity'">Activité</button>
            </div>

            <div v-if="detailTab === 'details'" class="documents-detail-body">
              <div class="panel-keyinfo">
                <div><span>Type de document</span><strong>{{ selectedDoc.category }}</strong></div>
                <div>
                  <span>Membre concerné</span>
                  <strong class="documents-member-chip"><img :src="selectedDoc.authorPhoto" :alt="selectedDoc.author"> {{ selectedDoc.author }}</strong>
                </div>
                <div><span>Date du document</span><strong>{{ selectedDoc.documentDate }}</strong></div>
                <div><span>Lieu</span><strong><Icon name="pin" /> {{ selectedDoc.place }}, Bénin</strong></div>
                <div><span>Description</span><strong>{{ selectedDoc.description }}</strong></div>
                <div><span>Ajouté par</span><strong class="documents-member-chip"><img :src="selectedDoc.authorPhoto" :alt="selectedDoc.author"> {{ selectedDoc.author }}</strong></div>
                <div><span>Date d'ajout</span><strong>{{ selectedDoc.addedAt }}</strong></div>
              </div>
            </div>
            <div v-else-if="detailTab === 'info'" class="documents-detail-body">
              <p class="dashboard-empty">Métadonnées techniques du fichier non disponibles pour l'instant.</p>
            </div>
            <div v-else class="documents-detail-body">
              <p class="dashboard-empty">Aucune activité récente sur ce document.</p>
            </div>

            <div class="documents-privacy-card">
              <strong><Icon name="lock" /> Confidentialité</strong>
              <p>Privé - Visible uniquement par les membres autorisés de la famille.</p>
              <RouterLink to="/mon-espace/parametres#confidentialite" class="documents-privacy-edit">Modifier</RouterLink>
            </div>
          </aside>
        </div>
      </main>
    </div>

    <QuickAddModal v-if="modal === 'document'" type="document" @close="modal = false" @submit="submitDocument" />
  </div>
</template>
