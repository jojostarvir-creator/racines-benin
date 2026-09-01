<script setup>
import { ref, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth, logout } from '../store/auth.js'
import { useFavorites } from '../store/favorites.js'
import { getOrCreateFamily } from '../data/familyDirectory.js'
import { enrichFamily } from '../data/familyProfileExtras.js'
import { useFamilySpace } from '../store/familySpace.js'
import Icon from './Icon.vue'

const router = useRouter()
const { currentUser } = useAuth()
const { favoriteSlugs } = useFavorites()
const menuOpen = ref(false)

const family = computed(() => (currentUser.value ? getOrCreateFamily(currentUser.value.familyName ?? '') : null))
const extras = computed(() => (family.value ? enrichFamily(family.value) : null))
const { space } =
  currentUser.value && family.value && extras.value
    ? useFamilySpace(currentUser.value.email, family.value, extras.value)
    : { space: null }

function handleLogout() {
  menuOpen.value = false
  logout()
  router.push('/')
}

const searchOpen = ref(false)
const searchQuery = ref('')
const searchInput = ref(null)
async function toggleSearch() {
  searchOpen.value = !searchOpen.value
  notifOpen.value = false
  mailOpen.value = false
  if (searchOpen.value) {
    await nextTick()
    searchInput.value?.focus()
  }
}
function submitSearch() {
  if (!searchQuery.value.trim()) return
  router.push({ path: '/mon-espace/membres', query: { q: searchQuery.value.trim() } })
  searchOpen.value = false
  searchQuery.value = ''
}

const notifOpen = ref(false)
const notifRead = ref(false)
function toggleNotifications() {
  notifOpen.value = !notifOpen.value
  searchOpen.value = false
  mailOpen.value = false
  if (notifOpen.value) notifRead.value = true
}
const notifications = computed(() => {
  if (!space) return []
  const items = []
  for (const p of space.photos.slice(0, 2)) {
    items.push({ id: `photo-${p.id}`, icon: 'image', text: `Nouvelle photo ajoutée : « ${p.caption} »`, to: '/mon-espace/souvenirs' })
  }
  for (const s of space.stories.slice(0, 2)) {
    items.push({ id: `story-${s.id}`, icon: 'note', text: `Nouvelle histoire : « ${s.title} »`, to: '/mon-espace/histoires' })
  }
  const incomplete = space.members.find((m) => m.branch === 'incomplete')
  if (incomplete) {
    items.push({ id: `member-${incomplete.id}`, icon: 'users', text: `${incomplete.name} attend d'être complété·e dans l'arbre`, to: `/mon-espace/membre/${incomplete.id}` })
  }
  return items.slice(0, 5)
})

const mailOpen = ref(false)
function toggleMail() {
  mailOpen.value = !mailOpen.value
  searchOpen.value = false
  notifOpen.value = false
}
</script>

<template>
  <header class="dash-header">
    <div class="container nav">
      <RouterLink class="logo logo-full" to="/" aria-label="Béninto">
        <span class="logo-stack">
          <span class="logo-word"></span>
          <span class="logo-tagline"></span>
        </span>
      </RouterLink>
      <nav class="nav-links">
        <RouterLink to="/">Explorer</RouterLink>
        <RouterLink to="/#territoires">Territoires</RouterLink>
        <RouterLink to="/familles">Familles</RouterLink>
        <RouterLink to="/#methode">À propos</RouterLink>
        <RouterLink to="/mon-espace" class="nav-link-active">Ma famille</RouterLink>
      </nav>
      <div class="dash-header-actions">
        <div class="dash-dropdown-wrap">
          <button type="button" class="dash-icon-btn" aria-label="Rechercher" @click="toggleSearch"><Icon name="search" /></button>
          <form v-if="searchOpen" class="dash-search-pop" @submit.prevent="submitSearch">
            <input ref="searchInput" v-model="searchQuery" type="text" placeholder="Rechercher un membre…">
            <button type="submit" aria-label="Lancer la recherche"><Icon name="search" /></button>
          </form>
        </div>

        <RouterLink to="/favoris" class="dash-icon-btn" aria-label="Mes favoris">
          <Icon name="heart" /><span v-if="favoriteSlugs.size" class="dash-badge">{{ favoriteSlugs.size }}</span>
        </RouterLink>

        <div class="dash-dropdown-wrap">
          <button type="button" class="dash-icon-btn" aria-label="Notifications" @click="toggleNotifications">
            <Icon name="bell" /><span v-if="notifications.length && !notifRead" class="dash-badge">{{ notifications.length }}</span>
          </button>
          <div v-if="notifOpen" class="dash-dropdown-panel">
            <strong class="dash-dropdown-title">Notifications</strong>
            <RouterLink
              v-for="n in notifications" :key="n.id" :to="n.to" class="dash-dropdown-row"
              @click="notifOpen = false"
            >
              <Icon :name="n.icon" /><span>{{ n.text }}</span>
            </RouterLink>
            <p v-if="!notifications.length" class="dash-dropdown-empty">Aucune notification pour l'instant.</p>
          </div>
        </div>

        <div class="dash-dropdown-wrap">
          <button type="button" class="dash-icon-btn" aria-label="Messages" @click="toggleMail"><Icon name="mail" /></button>
          <div v-if="mailOpen" class="dash-dropdown-panel">
            <strong class="dash-dropdown-title">Messages</strong>
            <p class="dash-dropdown-empty">Aucun message pour l'instant. Invitez un membre de votre famille pour commencer une conversation.</p>
            <RouterLink to="/mon-espace" class="dash-dropdown-cta" @click="mailOpen = false">Inviter un membre →</RouterLink>
          </div>
        </div>

        <div class="dash-user-menu">
          <button type="button" class="dash-user-btn" @click="menuOpen = !menuOpen">
            <img class="dash-user-avatar" :src="currentUser?.avatar" v-if="currentUser?.avatar" :alt="currentUser?.fullName">
            <span v-else class="dash-user-avatar dash-user-avatar-fallback">{{ (currentUser?.fullName || '?')[0] }}</span>
            <span class="dash-user-info">
              <strong>{{ currentUser?.fullName }}</strong>
              <small>Espace privé</small>
            </span>
            <Icon name="chevronLeft" class="dash-user-chevron" :class="{ open: menuOpen }" />
          </button>
          <div v-if="menuOpen" class="dash-user-dropdown">
            <RouterLink to="/mon-espace" @click="menuOpen = false">Mon espace</RouterLink>
            <RouterLink to="/mon-espace/parametres" @click="menuOpen = false">Paramètres</RouterLink>
            <button type="button" @click="handleLogout">Se déconnecter</button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>
