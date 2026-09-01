<script setup>
import { computed, ref } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { getFamilyBySlug, slugify } from '../data/familyDirectory.js'
import { enrichFamily } from '../data/familyProfileExtras.js'
import { useAuth } from '../store/auth.js'
import BeninSilhouette from '../components/BeninSilhouette.vue'

const route = useRoute()
const family = computed(() => getFamilyBySlug(route.params.slug))
const extras = computed(() => (family.value ? enrichFamily(family.value) : null))

const { isAuthenticated, currentUser } = useAuth()
const showFreeStoryNotice = computed(() => !isAuthenticated.value)
const isOwnFamily = computed(() => isAuthenticated.value && currentUser.value && family.value && slugify(currentUser.value.familyName) === family.value.slug)

const archiveTabs = ["Toutes", "Photo", "Lettre", "Acte", "Document", "Objet"]
const activeTab = ref("Toutes")
const filteredArchives = computed(() => {
  if (!extras.value) return []
  if (activeTab.value === "Toutes") return extras.value.archives
  return extras.value.archives.filter((a) => a.category === activeTab.value)
})

const timelineIcons = ["⌂", "☺", "▤", "⌂", "☺", "★"]

const episodes = [
  { title: "Les origines", duration: "12 min" },
  { title: "Le départ vers la ville", duration: "9 min" },
  { title: "Les descendants racontent", duration: "14 min" },
]
const extraits = ["1:35", "2:10", "1:48", "2:35"]

const videosRef = ref(null)
function scrollToVideos() {
  videosRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const lightbox = ref(null)
function openLightbox(image, title, subtitle) {
  lightbox.value = { image, title, subtitle }
}
function closeLightbox() {
  lightbox.value = null
}
</script>

<template>
  <div v-if="family && extras" class="family-profile">
    <div class="container breadcrumb">
      <RouterLink to="/">Accueil</RouterLink>
      <span>›</span>
      <RouterLink to="/recherche">Familles</RouterLink>
      <span>›</span>
      <span>Famille {{ family.name }}</span>
    </div>

    <div v-if="showFreeStoryNotice" class="container">
      <div class="free-story-notice">
        <span>👋 Vous consultez votre histoire gratuite. Créez un compte pour découvrir toutes les autres familles.</span>
        <RouterLink class="btn btn-yellow" :to="{ name: 'register', query: { redirect: route.fullPath } }">Créer mon compte →</RouterLink>
      </div>
    </div>

    <section class="family-hero">
      <img :src="family.image" :alt="`Famille ${family.name}`" class="family-hero-bg">
      <div class="family-hero-scrim"></div>
      <div class="container family-hero-inner px-6">
        <div class="family-hero-copy">
          <span class="family-hero-pill">Famille</span>
          <h1>Famille {{ family.name }}</h1>
          <p class="family-hero-subtitle">Une histoire entre {{ extras.localities.slice(0, 2).join(' et ') }}</p>

          <div class="family-badges">
            <div class="family-badge"><span class="icon-pin"></span><div><small>Origine</small><strong>{{ extras.localities[0] }}</strong></div></div>
            <div class="family-badge"><span class="icon-calendar"></span><div><small>Première implantation</small><strong>{{ extras.firstImplantation }}</strong></div></div>
            <div class="family-badge"><span class="icon-bubble"></span><div><small>Langue</small><strong>{{ extras.language }}</strong></div></div>
            <div class="family-badge"><span class="icon-cluster"></span><div><small>Localités associées</small><strong>{{ extras.localities.slice(0, 3).join(', ') }}…</strong></div></div>
          </div>

          <button type="button" class="btn btn-yellow family-play-btn" @click="scrollToVideos">
            <span class="family-play-icon"></span> Voir le film de la famille
          </button>
        </div>

        <RouterLink to="/#territoires" class="family-map-card">
          <BeninSilhouette class="family-map-icon" :department="family.department" />
          <strong>{{ extras.localities[0] }}</strong>
          <span>Département {{ family.department }}</span>
          <span class="family-map-link">Explorer le territoire →</span>
        </RouterLink>
      </div>
    </section>

    <section class="section family-split family-split-first">
      <div class="container family-split-grid">
        <div class="family-history">
          <h2>L'histoire de la famille</h2>
          <div class="family-history-body">
            <div class="family-history-text">
              <p>{{ family.description }}</p>
              <p>De génération en génération, la famille {{ family.name }} a préservé ses valeurs, son identité et ses traditions tout en s'adaptant aux changements du temps.</p>
              <p>Aujourd'hui, elle est présente à {{ extras.localities.slice(0, 2).join(' et ') }}, et continue de transmettre son héritage aux nouvelles générations.</p>
            </div>
            <div class="family-history-photo">
              <img :src="extras.historyPhoto" :alt="`Archive de la famille ${family.name}`">
            </div>
          </div>
        </div>

        <div class="family-tree-card">
          <div class="family-tree-head">
            <h2>Arbre généalogique</h2>
            <span class="tree-privacy">🔒 Arbre privé</span>
          </div>

          <div class="family-tree">
            <div class="tree-node tree-founder">
              <img class="tree-photo" :src="extras.tree.founder.photo" :alt="extras.tree.founder.name">
              <strong>{{ extras.tree.founder.name }}</strong>
              <small>{{ extras.tree.founder.years }}</small>
              <small>Ancêtre fondateur</small>
            </div>

            <div class="tree-branches">
              <div class="tree-branch" v-for="branch in extras.tree.branches" :key="branch.label">
                <div class="tree-node tree-branch-node">
                  <img class="tree-photo small" :src="branch.children[0].photo" :alt="branch.label">
                  <strong>{{ branch.label }}</strong>
                  <small>{{ branch.sublabel }}</small>
                </div>
                <div class="tree-children">
                  <div class="tree-node tree-child" v-for="(child, i) in branch.children.slice(0, 2)" :key="i">
                    <img class="tree-photo small" :src="child.photo" :alt="child.name">
                    <strong>{{ branch.label[branch.label.length - 1] }}{{ i + 1 }}</strong>
                    <small>{{ child.years }}</small>
                  </div>
                </div>
                <div class="tree-children">
                  <div class="tree-node tree-child" v-for="(child, i) in branch.children.slice(2, 4)" :key="i">
                    <img class="tree-photo small" :src="child.photo" :alt="child.name">
                    <strong>{{ branch.label[branch.label.length - 1] }}{{ i + 3 }}</strong>
                    <small>{{ child.years }}</small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <RouterLink v-if="isOwnFamily" to="/mon-espace/arbre" class="btn btn-yellow tree-more">Voir l'arbre complet ⤢</RouterLink>
          <RouterLink v-else to="/recherche" class="btn btn-light tree-more">Découvrir votre propre arbre →</RouterLink>
        </div>
      </div>
    </section>

    <section class="section family-timeline-section">
      <div class="container">
        <h2>Chronologie de la famille</h2>
        <div class="timeline-strip">
          <div class="timeline-strip-item" v-for="(event, i) in family.timeline" :key="i">
            <span class="timeline-strip-icon">{{ timelineIcons[i % timelineIcons.length] }}</span>
            <strong>{{ event[0] }}</strong>
            <p>{{ event[1] }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="section family-media-row">
      <div class="container family-media-grid">
        <div class="family-videos" ref="videosRef">
          <h2>Vidéos</h2>
          <button
            type="button" class="video-main"
            @click="openLightbox(family.image, `L'histoire de la famille ${family.name}`, 'Épisode complet · 18 min')"
          >
            <img :src="family.image" :alt="`Vidéo famille ${family.name}`">
            <span class="video-play"></span>
            <span class="video-caption-text">
              <strong>L'histoire de la famille {{ family.name }}</strong>
              <small>Épisode complet · 18 min</small>
            </span>
          </button>
          <div class="video-row-label">Épisodes</div>
          <div class="video-thumbs">
            <button
              type="button" class="video-thumb" v-for="(ep, i) in episodes" :key="i"
              @click="openLightbox(extras.archives[i % extras.archives.length].image, ep.title, `Épisode 0${i + 1} · ${ep.duration}`)"
            >
              <img :src="extras.archives[i % extras.archives.length].image" alt="">
              <span class="video-play small"></span>
              <span class="video-thumb-caption">
                <small>Épisode 0{{ i + 1 }}</small>
                {{ ep.title }}
                <em>{{ ep.duration }}</em>
              </span>
            </button>
          </div>

          <div class="video-row-label">Extraits</div>
          <div class="video-extraits">
            <button
              type="button" class="video-extrait" v-for="(clip, i) in extraits" :key="i"
              @click="openLightbox(extras.archives[(i + 2) % extras.archives.length].image, `Extrait ${i + 1}`, clip)"
            >
              <img :src="extras.archives[(i + 2) % extras.archives.length].image" alt="">
              <span class="video-extrait-time">{{ clip }}</span>
            </button>
          </div>
          <RouterLink v-if="isOwnFamily" to="/mon-espace/souvenirs" class="archive-more">Voir tous les extraits →</RouterLink>
        </div>

        <div class="family-archives">
          <h2>Archives</h2>
          <div class="archive-tabs">
            <button
              v-for="tab in archiveTabs"
              :key="tab"
              class="archive-tab"
              :class="{ active: activeTab === tab }"
              @click="activeTab = tab"
            >{{ tab }}</button>
          </div>
          <div class="archive-grid">
            <div class="archive-card" v-for="(archive, i) in filteredArchives" :key="i">
              <img :src="archive.image" :alt="archive.title">
              <div class="archive-body">
                <strong>{{ archive.year }}</strong>
                <p>{{ archive.title }}</p>
                <span class="badge">{{ archive.category }}</span>
              </div>
            </div>
          </div>
          <RouterLink v-if="isOwnFamily" to="/mon-espace/documents" class="archive-more">Voir toutes les archives →</RouterLink>
        </div>
      </div>
    </section>

    <section class="section family-media-row">
      <div class="container family-media-grid">
        <div class="family-personalities">
          <h2>Personnalités de la famille</h2>
          <div class="personalities-grid">
            <div class="personality-card" v-for="(person, i) in extras.personalities" :key="i">
              <img class="personality-photo" :src="person.photo" :alt="person.name">
              <strong>{{ person.name }}</strong>
              <small>{{ person.years }}</small>
              <p>{{ person.role }}</p>
            </div>
          </div>
        </div>

        <div class="family-places">
          <h2>Les lieux qui racontent notre histoire</h2>
          <div class="family-places-body">
            <BeninSilhouette class="family-places-map" :department="family.department" />
            <div class="places-grid">
              <div class="place-card" v-for="(place, i) in extras.places" :key="i">
                <img :src="place.image" :alt="place.name">
                <div class="place-body">
                  <strong>{{ place.name }}</strong>
                  <small>{{ place.role }}</small>
                </div>
              </div>
            </div>
          </div>
          <RouterLink to="/#territoires" class="btn btn-yellow places-more">Voir la carte complète →</RouterLink>
        </div>
      </div>
    </section>

    <div class="container family-footer-nav">
      <RouterLink to="/recherche" class="back-link">← Chercher une autre famille</RouterLink>
    </div>

    <div v-if="lightbox" class="modal-backdrop" @click.self="closeLightbox">
      <div class="video-lightbox">
        <button type="button" class="modal-close video-lightbox-close" @click="closeLightbox">✕</button>
        <img :src="lightbox.image" :alt="lightbox.title">
        <div class="video-lightbox-caption">
          <strong>{{ lightbox.title }}</strong>
          <small>{{ lightbox.subtitle }}</small>
        </div>
      </div>
    </div>
  </div>

  <section v-else class="section">
    <div class="container login-wrap">
      <div class="login-card">
        <div class="eyebrow">Famille introuvable</div>
        <h2>Cette famille n'existe pas dans notre base.</h2>
        <RouterLink class="btn btn-yellow login-submit" to="/recherche">Réessayer une recherche →</RouterLink>
      </div>
    </div>
  </section>
</template>
