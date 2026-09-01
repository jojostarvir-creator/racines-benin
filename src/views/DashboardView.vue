<script setup>
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuth } from '../store/auth.js'
import { getOrCreateFamily } from '../data/familyDirectory.js'
import { enrichFamily } from '../data/familyProfileExtras.js'
import { useFamilySpace } from '../store/familySpace.js'
import QuickAddModal from '../components/QuickAddModal.vue'
import DashboardSidebar from '../components/DashboardSidebar.vue'
import Icon from '../components/Icon.vue'

const { currentUser } = useAuth()

const family = computed(() => getOrCreateFamily(currentUser.value?.familyName ?? ''))
const extras = computed(() => (family.value ? enrichFamily(family.value) : null))

const { space, addMember, addPhoto, addDocument, addStory, addVideo, addTimelineEvent } =
  family.value && extras.value ? useFamilySpace(currentUser.value.email, family.value, extras.value) : { space: null }

const activeModal = ref(null)
function openModal(type) { activeModal.value = type }
function closeModal() { activeModal.value = null }
function handleSubmit(payload) {
  if (activeModal.value === 'member') addMember(payload)
  else if (activeModal.value === 'photo') addPhoto(payload)
  else if (activeModal.value === 'document') addDocument(payload)
  else if (activeModal.value === 'anecdote') addStory(payload)
  else if (activeModal.value === 'video') addVideo(payload)
  else if (activeModal.value === 'event') addTimelineEvent(payload)
  closeModal()
}

const quickAddButtons = [
  { type: 'member', icon: 'users', label: 'Membre' },
  { type: 'photo', icon: 'camera', label: 'Photo' },
  { type: 'document', icon: 'file', label: 'Document' },
  { type: 'anecdote', icon: 'help', label: 'Anecdote' },
  { type: 'video', icon: 'video', label: 'Vidéo' },
  { type: 'event', icon: 'calendar', label: 'Événement' },
]

const founder = computed(() => space?.members.find((m) => !m.parentId))
const tier1 = computed(() => space?.members.filter((m) => m.parentId === founder.value?.id) ?? [])
function childrenOf(id) {
  return space?.members.filter((m) => m.parentId === id) ?? []
}

const timelineIcons = ['home', 'file', 'building', 'calendar', 'users', 'building', 'star']

const photoRail = ref(null)
function scrollPhotos(dir) {
  photoRail.value?.scrollBy({ left: dir * 220, behavior: 'smooth' })
}

const playingVideo = ref(null)
const sidebarCollapsed = ref(false)
</script>

<template>
  <div v-if="family && extras && space" class="dashboard">
    <div class="container dashboard-layout" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
      <DashboardSidebar
        v-show="!sidebarCollapsed"
        :family="family"
        :extras="extras"
        active-id="apercu"
        @invite="openModal('member')"
        @add-souvenir="openModal('anecdote')"
      />

      <button
        type="button"
        class="sidebar-collapse-btn"
        :class="{ collapsed: sidebarCollapsed }"
        :aria-label="sidebarCollapsed ? 'Afficher le menu' : 'Masquer le menu'"
        @click="sidebarCollapsed = !sidebarCollapsed"
      >
        <Icon name="chevronLeft" />
      </button>

      <main class="dashboard-main">
        <section id="apercu" class="dashboard-hero">
          <img :src="family.image" :alt="family.name" class="dashboard-hero-bg">
          <div class="dashboard-hero-scrim"></div>
          <div class="dashboard-hero-inner">
            <div>
              <h1>Ma famille</h1>
              <div class="dashboard-hero-subtitle">Espace privé</div>
              <p>Créez, conservez et transmettez l'histoire de votre famille aux générations futures.</p>
              <div class="dashboard-stats">
                <div class="stat-block">
                  <div class="stat-top"><span class="stat-icon"><Icon name="users" /></span><strong>{{ space.members.length }}</strong></div>
                  <span>Membres</span>
                </div>
                <div class="stat-block">
                  <div class="stat-top"><span class="stat-icon"><Icon name="tree" /></span><strong>{{ family.generations }}</strong></div>
                  <span>Générations</span>
                </div>
                <div class="stat-block">
                  <div class="stat-top"><span class="stat-icon"><Icon name="image" /></span><strong>{{ space.photos.length }}</strong></div>
                  <span>Souvenirs</span>
                </div>
                <div class="stat-block">
                  <div class="stat-top"><span class="stat-icon"><Icon name="folder" /></span><strong>{{ space.documents.length }}</strong></div>
                  <span>Documents</span>
                </div>
              </div>
            </div>
            <button type="button" class="btn btn-yellow" @click="openModal('member')">+ Ajouter un membre</button>
          </div>
        </section>

        <section id="arbre" class="dashboard-card">
          <div class="dashboard-card-head">
            <h2>Arbre généalogique</h2>
            <span class="tree-privacy"><Icon name="lock" /> Privé</span>
            <RouterLink to="/mon-espace/arbre" class="btn btn-light tree-open-link">Voir l'arbre complet ⤢</RouterLink>
          </div>

          <div class="dashboard-tree">
            <div class="tree-node tree-founder" v-if="founder">
              <img class="tree-photo" :src="founder.photo" :alt="founder.name">
              <strong>{{ founder.name.toUpperCase() }}</strong>
              <small>{{ founder.years }}</small>
              <small>{{ founder.place }}</small>
            </div>

            <div class="dashboard-tree-branches">
              <div class="dashboard-tree-branch" v-for="node in tier1" :key="node.id">
                <div class="tree-node tree-branch-node">
                  <img class="tree-photo small" :src="node.photo" :alt="node.name">
                  <strong>{{ node.name.toUpperCase() }}</strong>
                  <small>{{ node.years }}</small>
                  <small>{{ node.place }}</small>
                </div>
                <div class="tree-children">
                  <div class="tree-node tree-child" v-for="gc in childrenOf(node.id)" :key="gc.id">
                    <img class="tree-photo small" :src="gc.photo" :alt="gc.name">
                    <strong>{{ gc.name.toUpperCase() }}</strong>
                    <small>{{ gc.years }}</small>
                    <small>{{ gc.place }}</small>
                    <RouterLink :to="`/mon-espace/membre/${gc.id}`" class="tree-descendants-link">Voir les descendants</RouterLink>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="quick-add-row">
            <span class="video-row-label">Ajouter rapidement</span>
            <div class="quick-add-buttons">
              <button type="button" v-for="btn in quickAddButtons" :key="btn.type" @click="openModal(btn.type)">
                <Icon :name="btn.icon" />{{ btn.label }}
              </button>
            </div>
          </div>
        </section>

        <div class="dashboard-media-grid">
          <section id="photos" class="dashboard-card">
            <div class="dashboard-card-head">
              <h2>Photos de famille</h2>
              <RouterLink to="/mon-espace/souvenirs?type=Photo" class="dashboard-add-link">Voir tout →</RouterLink>
            </div>
            <div class="dashboard-photo-wrap">
              <button type="button" class="carousel-arrow prev dashboard-arrow" @click="scrollPhotos(-1)">‹</button>
              <div class="dashboard-photo-rail" ref="photoRail">
                <img v-for="photo in space.photos" :key="photo.id" :src="photo.src" :alt="photo.caption" :title="photo.caption">
              </div>
              <button type="button" class="carousel-arrow next dashboard-arrow" @click="scrollPhotos(1)">›</button>
            </div>
            <p v-if="!space.photos.length" class="dashboard-empty">Aucune photo pour l'instant.</p>
          </section>

          <section id="documents" class="dashboard-card">
            <div class="dashboard-card-head">
              <h2>Documents</h2>
              <RouterLink to="/mon-espace/documents" class="dashboard-add-link">Voir tout →</RouterLink>
            </div>
            <div class="dashboard-doc-grid">
              <div class="dashboard-doc" v-for="doc in space.documents.slice(0, 4)" :key="doc.id">
                <img :src="doc.src" :alt="doc.title">
                <strong>{{ doc.title }}</strong>
                <small>{{ doc.year }}</small>
              </div>
            </div>
            <p v-if="!space.documents.length" class="dashboard-empty">Aucun document pour l'instant.</p>
          </section>
        </div>

        <div class="dashboard-media-grid">
          <section id="histoires" class="dashboard-card">
            <div class="dashboard-card-head">
              <h2>Histoires &amp; anecdotes</h2>
              <RouterLink to="/mon-espace/histoires" class="dashboard-add-link">Voir tout →</RouterLink>
            </div>
            <div class="dashboard-story" v-for="story in space.stories.slice(0, 3)" :key="story.id">
              <div class="dashboard-story-row">
                <img class="dashboard-story-photo" :src="story.authorPhoto ?? founder?.photo" :alt="story.author">
                <div>
                  <strong>{{ story.title }}</strong>
                  <small>Récit de {{ story.author }}</small>
                </div>
              </div>
              <p>{{ story.text }}</p>
              <audio v-if="story.audio" :src="story.audio" controls class="dashboard-audio"></audio>
            </div>
            <p v-if="!space.stories.length" class="dashboard-empty">Aucune anecdote pour l'instant.</p>
          </section>

          <section class="dashboard-card">
            <div class="dashboard-card-head">
              <h2>Vidéos</h2>
              <RouterLink to="/mon-espace/souvenirs?type=Vidéo" class="dashboard-add-link">Voir tout →</RouterLink>
            </div>
            <div class="dashboard-video-grid">
              <div class="dashboard-video" v-for="video in space.videos" :key="video.id">
                <video v-if="playingVideo === video.id" :src="video.src" controls autoplay class="dashboard-video-player"></video>
                <button v-else type="button" class="dashboard-video-poster" @click="playingVideo = video.id">
                  <span class="video-play small"></span>
                </button>
                <strong>{{ video.title }}</strong>
              </div>
            </div>
            <p v-if="!space.videos.length" class="dashboard-empty">Aucune vidéo pour l'instant.</p>
          </section>
        </div>

        <section id="chronologie" class="dashboard-card">
          <div class="dashboard-card-head">
            <h2>Ligne du temps familiale</h2>
            <RouterLink to="/mon-espace/chronologie" class="dashboard-add-link">Voir tout →</RouterLink>
          </div>
          <div class="dashboard-timeline-line">
            <div class="dashboard-timeline-item" v-for="(event, i) in space.timeline" :key="event.id">
              <span class="dashboard-timeline-icon"><Icon :name="timelineIcons[i % timelineIcons.length]" /></span>
              <div class="dashboard-timeline-dot"></div>
              <strong>{{ event.period }}</strong>
              <p>{{ event.text }}</p>
            </div>
          </div>
        </section>

        <div id="parametres" class="dashboard-footer-notice">
          <div>
            <strong><Icon name="shield" /> Vos données sont précieuses</strong>
            <p>Cet espace est privé et sécurisé. Vous contrôlez qui peut voir chaque information.</p>
          </div>
          <RouterLink to="/mon-espace/parametres#confidentialite" class="btn btn-yellow">Gérer les accès</RouterLink>
        </div>
      </main>
    </div>

    <QuickAddModal v-if="activeModal" :type="activeModal" @close="closeModal" @submit="handleSubmit" />
  </div>

  <section v-else class="section">
    <div class="container login-wrap">
      <div class="login-card">
        <div class="eyebrow">Espace introuvable</div>
        <h2>Nous n'avons pas trouvé de famille associée à votre compte.</h2>
        <RouterLink class="btn btn-yellow login-submit" to="/recherche">Chercher ma famille →</RouterLink>
      </div>
    </div>
  </section>
</template>
