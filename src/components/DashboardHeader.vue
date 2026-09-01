<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth, logout } from '../store/auth.js'
import { useFavorites } from '../store/favorites.js'
import Icon from './Icon.vue'

const router = useRouter()
const { currentUser } = useAuth()
const { favoriteSlugs } = useFavorites()
const menuOpen = ref(false)

function handleLogout() {
  menuOpen.value = false
  logout()
  router.push('/')
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
        <button type="button" class="dash-icon-btn" aria-label="Rechercher"><Icon name="search" /></button>
        <RouterLink to="/favoris" class="dash-icon-btn" aria-label="Mes favoris">
          <Icon name="heart" /><span v-if="favoriteSlugs.size" class="dash-badge">{{ favoriteSlugs.size }}</span>
        </RouterLink>
        <button type="button" class="dash-icon-btn" aria-label="Notifications">
          <Icon name="bell" /><span class="dash-badge">3</span>
        </button>
        <button type="button" class="dash-icon-btn" aria-label="Messages"><Icon name="mail" /></button>
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
            <button type="button" @click="handleLogout">Se déconnecter</button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>
