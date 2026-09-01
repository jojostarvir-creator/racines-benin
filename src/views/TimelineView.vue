<script setup>
import { computed, ref } from 'vue'
import { useAuth } from '../store/auth.js'
import { getOrCreateFamily } from '../data/familyDirectory.js'
import { enrichFamily, TIMELINE_BADGES } from '../data/familyProfileExtras.js'
import { useFamilySpace } from '../store/familySpace.js'
import DashboardSidebar from '../components/DashboardSidebar.vue'
import QuickAddModal from '../components/QuickAddModal.vue'
import Icon from '../components/Icon.vue'

const { currentUser } = useAuth()

const family = computed(() => getOrCreateFamily(currentUser.value?.familyName ?? ''))
const extras = computed(() => (family.value ? enrichFamily(family.value) : null))

const { space, addTimelineEvent, addMember, updateTimelineEvent, removeTimelineEvent } =
  family.value && extras.value ? useFamilySpace(currentUser.value.email, family.value, extras.value) : { space: null }

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=800&q=80'
const FALLBACK_ICONS = ['home', 'gift', 'sail', 'building', 'star', 'users']
const BADGE_COLORS = {
  Origines: { bg: '#FBEAD2', text: '#A9660A' },
  Naissance: { bg: '#E3F0DE', text: '#4C7A3D' },
  Migration: { bg: '#DEEBF7', text: '#3B6FA0' },
  Installation: { bg: '#F3E4C8', text: '#8A5A1E' },
  Héritage: { bg: '#F7DCE8', text: '#A34E77' },
  Génération: { bg: '#E8E0F7', text: '#6B4FA0' },
}
function badgeColor(badge) {
  return BADGE_COLORS[badge] ?? { bg: '#F3EFE7', text: '#6B5544' }
}

const normalizedEvents = computed(() => {
  if (!space) return []
  return space.timeline.map((e, i) => ({
    ...e,
    year: e.year ?? e.period ?? '—',
    title: e.title ?? e.text ?? 'Événement familial',
    description: e.description ?? e.text ?? '',
    fullDescription: e.fullDescription ?? e.description ?? e.text ?? '',
    badge: e.badge ?? TIMELINE_BADGES[i % TIMELINE_BADGES.length],
    icon: e.icon ?? FALLBACK_ICONS[i % FALLBACK_ICONS.length],
    image: e.image ?? FALLBACK_IMAGE,
    author: e.author ?? 'Vous',
    authorPhoto: e.authorPhoto ?? FALLBACK_IMAGE,
    place: e.place ?? '—',
    keywords: e.keywords ?? [],
    documents: e.documents ?? [],
    keyPerson: e.keyPerson ?? null,
  }))
})

const typeFilter = ref('')
const memberFilter = ref('')
const query = ref('')

const authorOptions = computed(() => [...new Set(normalizedEvents.value.map((e) => e.author))])

const filteredEvents = computed(() => {
  const q = query.value.trim().toLowerCase()
  return normalizedEvents.value.filter((e) => {
    if (typeFilter.value && e.badge !== typeFilter.value) return false
    if (memberFilter.value && e.author !== memberFilter.value) return false
    if (q && !e.title.toLowerCase().includes(q)) return false
    return true
  })
})

const selectedId = ref(null)
const selectedEvent = computed(() => filteredEvents.value.find((e) => e.id === selectedId.value) ?? filteredEvents.value[0] ?? null)
function selectEvent(id) {
  selectedId.value = id
}
function closeDetail() {
  selectedId.value = '__closed__'
}

const modal = ref(null)
function submitEvent(payload) {
  addTimelineEvent(payload)
  modal.value = null
}
function submitMember(payload) {
  addMember(payload)
  modal.value = null
}

const editingEvent = ref(false)
function openEditEvent() {
  editingEvent.value = true
}
function submitEditEvent(payload) {
  if (selectedEvent.value) updateTimelineEvent(selectedEvent.value.id, payload)
  editingEvent.value = false
}
function deleteEvent() {
  if (!selectedEvent.value) return
  if (!confirm(`Supprimer l'événement « ${selectedEvent.value.title} » ? Cette action est irréversible.`)) return
  removeTimelineEvent(selectedEvent.value.id)
  selectedId.value = null
}

function exportTimeline() {
  if (!space || !family.value) return
  const lines = normalizedEvents.value.map((e) => `${e.year} — ${e.title}\n${e.description}\n`)
  const content = `Ligne du temps — Famille ${family.value.name}\n${normalizedEvents.value.length} événements\n\n${lines.join('\n')}`
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `chronologie-${family.value.slug}.txt`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div v-if="family && extras && space" class="dashboard">
    <div class="container dashboard-layout">
      <DashboardSidebar
        :family="family" :extras="extras" active-id="chronologie"
        quote="« Le passé est une racine, l'avenir est un arbre. » — Proverbe béninois"
        @invite="modal = 'member'"
        @add-souvenir="modal = 'event'"
      />

      <main class="dashboard-main">
        <div class="timeline-layout">
          <div class="timeline-main-col">
            <div class="member-breadcrumb">
              <RouterLink to="/mon-espace">Ma famille</RouterLink>
              <span>›</span>
              <span>Ligne du temps</span>
            </div>

            <div class="stories-head">
              <div>
                <h1>Ligne du temps familiale</h1>
                <p>Découvrez les événements marquants qui ont façonné l'histoire de notre famille à travers les générations.</p>
              </div>
              <div class="stories-head-actions">
                <button type="button" class="btn btn-yellow" @click="modal = 'event'"><Icon name="upload" /> Ajouter un événement</button>
                <button type="button" class="btn btn-light" @click="exportTimeline"><Icon name="upload" /> Exporter la chronologie</button>
              </div>
            </div>

            <div class="stories-filters">
              <span class="tree-view-label">Vue chronologique</span>
              <select v-model="typeFilter" class="stories-filter-select">
                <option value="">Tous les types</option>
                <option v-for="b in TIMELINE_BADGES" :key="b" :value="b">{{ b }}</option>
              </select>
              <select v-model="memberFilter" class="stories-filter-select">
                <option value="">Filtrer par membre</option>
                <option v-for="a in authorOptions" :key="a" :value="a">{{ a }}</option>
              </select>
              <div class="stories-search">
                <Icon name="search" />
                <input v-model="query" type="text" placeholder="Rechercher un événement…">
              </div>
            </div>

            <div class="timeline-track">
              <div v-for="e in filteredEvents" :key="e.id" class="timeline-row">
                <div class="timeline-year-col">
                  <strong>{{ e.year }}</strong>
                  <small v-if="e.era">{{ e.era }}</small>
                </div>
                <div class="timeline-node-col">
                  <span class="timeline-node-icon"><Icon :name="e.icon" /></span>
                </div>
                <button
                  type="button" class="timeline-event-card"
                  :class="{ selected: selectedEvent && e.id === selectedEvent.id }"
                  @click="selectEvent(e.id)"
                >
                  <img :src="e.image" :alt="e.title">
                  <div class="timeline-event-body">
                    <div class="timeline-event-head">
                      <strong>{{ e.title }}</strong>
                      <span class="timeline-badge" :style="{ background: badgeColor(e.badge).bg, color: badgeColor(e.badge).text }">{{ e.badge }}</span>
                    </div>
                    <p>{{ e.description }}</p>
                    <div class="timeline-event-foot">
                      <span class="timeline-event-author"><img :src="e.authorPhoto" :alt="e.author"> Par {{ e.author }}</span>
                      <span class="timeline-event-place"><Icon name="pin" /> {{ e.place }}</span>
                    </div>
                  </div>
                </button>
              </div>
              <p v-if="!filteredEvents.length" class="dashboard-empty">Aucun événement ne correspond à votre recherche.</p>
            </div>

            <div class="timeline-footer-banner">
              <div class="timeline-footer-text">
                <Icon name="shield" />
                <div>
                  <strong>Votre histoire continue…</strong>
                  <p>Chaque souvenir ajouté aujourd'hui devient un héritage pour demain.</p>
                </div>
              </div>
              <button type="button" class="btn btn-yellow" @click="modal = 'event'">Ajouter un événement</button>
            </div>
          </div>

          <aside v-if="selectedEvent" class="timeline-detail-panel">
            <div class="timeline-detail-image">
              <img :src="selectedEvent.image" :alt="selectedEvent.title">
              <button type="button" class="timeline-detail-close" @click="closeDetail"><Icon name="close" /></button>
            </div>
            <div class="timeline-detail-body">
              <span class="timeline-badge" :style="{ background: badgeColor(selectedEvent.badge).bg, color: badgeColor(selectedEvent.badge).text }">
                {{ selectedEvent.badge.toUpperCase() }}
              </span>
              <h2>{{ selectedEvent.title }}</h2>
              <div class="timeline-detail-meta">
                <span><Icon name="calendar" /> Vers {{ selectedEvent.year }}</span>
                <span><Icon name="pin" /> {{ selectedEvent.place }}</span>
              </div>
              <p class="timeline-detail-desc">{{ selectedEvent.fullDescription }}</p>

              <div v-if="selectedEvent.keyPerson" class="timeline-detail-section">
                <h4>Personne clé</h4>
                <div class="timeline-keyperson">
                  <img :src="selectedEvent.keyPerson.photo" :alt="selectedEvent.keyPerson.name">
                  <div><strong>{{ selectedEvent.keyPerson.name }}</strong><small>{{ selectedEvent.keyPerson.role }}</small></div>
                </div>
              </div>

              <div v-if="selectedEvent.documents.length" class="timeline-detail-section">
                <h4>Documents &amp; médias ({{ selectedEvent.documents.length }})</h4>
                <div class="timeline-detail-docs">
                  <img v-for="(d, i) in selectedEvent.documents" :key="i" :src="d" :alt="`Document ${i + 1}`">
                </div>
              </div>

              <div v-if="selectedEvent.keywords.length" class="timeline-detail-section">
                <h4>Mots-clés</h4>
                <div class="timeline-detail-keywords">
                  <span v-for="k in selectedEvent.keywords" :key="k">{{ k }}</span>
                </div>
              </div>

              <button type="button" class="timeline-detail-action" @click="openEditEvent"><Icon name="settings" /> Modifier cet événement</button>
              <button type="button" class="timeline-detail-action danger" @click="deleteEvent"><Icon name="trash" /> Supprimer cet événement</button>
            </div>
          </aside>
        </div>
      </main>
    </div>

    <QuickAddModal v-if="modal === 'event'" type="event" @close="modal = null" @submit="submitEvent" />
    <QuickAddModal v-if="modal === 'member'" type="member" @close="modal = null" @submit="submitMember" />
    <QuickAddModal v-if="editingEvent" type="edit-event" :initial="selectedEvent" @close="editingEvent = false" @submit="submitEditEvent" />
  </div>
</template>
