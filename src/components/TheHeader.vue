<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth, logout } from '../store/auth.js'
import { useFavorites } from '../store/favorites.js'
import Icon from './Icon.vue'

const router = useRouter()
const { isAuthenticated } = useAuth()
const { favoriteSlugs } = useFavorites()
const open = ref(false)

function close() {
  open.value = false
}

function handleLogout() {
  logout()
  close()
  router.push('/')
}
</script>

<template>
  <header>
    <div class="container nav">
      <RouterLink class="logo logo-full" to="/" @click="close" aria-label="Béninto">
        <span class="logo-stack">
          <span class="logo-word"></span>
          <span class="logo-tagline"></span>
        </span>
      </RouterLink>
      <nav class="nav-links">
        <RouterLink to="/">Accueil</RouterLink>
        <RouterLink to="/familles">Familles</RouterLink>
        <RouterLink to="/#territoires">Territoires</RouterLink>
        <RouterLink to="/#methode">À propos</RouterLink>
        <RouterLink v-if="isAuthenticated" to="/mon-espace" class="nav-link-active">Ma famille</RouterLink>
      </nav>
      <div class="nav-actions">
        <RouterLink to="/favoris" class="nav-favorites-link" aria-label="Mes favoris">
          <Icon name="heart" />
          <span v-if="favoriteSlugs.size" class="nav-favorites-count">{{ favoriteSlugs.size }}</span>
        </RouterLink>
        <template v-if="isAuthenticated">
          <RouterLink class="btn btn-light" to="/mon-espace">Mon espace</RouterLink>
          <button class="btn btn-yellow" type="button" @click="handleLogout">Se déconnecter</button>
        </template>
        <template v-else>
          <RouterLink class="btn btn-light" to="/connexion">Se connecter</RouterLink>
          <RouterLink class="btn btn-yellow" to="/inscription">Raconter mon histoire</RouterLink>
        </template>
      </div>
      <button
        class="nav-burger"
        :class="{ open }"
        aria-label="Ouvrir le menu"
        :aria-expanded="open"
        @click="open = !open"
      >
        <span></span><span></span><span></span>
      </button>
    </div>

    <div class="nav-mobile" :class="{ open }">
      <div class="container nav-mobile-inner">
        <RouterLink to="/" @click="close">Accueil</RouterLink>
        <RouterLink to="/#familles" @click="close">Familles</RouterLink>
        <RouterLink to="/#territoires" @click="close">Territoires</RouterLink>
        <RouterLink to="/#methode" @click="close">À propos</RouterLink>
        <RouterLink v-if="isAuthenticated" to="/mon-espace" class="nav-link-active" @click="close">Ma famille</RouterLink>
        <RouterLink to="/favoris" @click="close">Mes favoris{{ favoriteSlugs.size ? ` (${favoriteSlugs.size})` : '' }}</RouterLink>
        <div class="nav-mobile-actions">
          <template v-if="isAuthenticated">
            <RouterLink class="btn btn-light" to="/mon-espace" @click="close">Mon espace</RouterLink>
            <button class="btn btn-yellow" type="button" @click="handleLogout">Se déconnecter</button>
          </template>
          <template v-else>
            <RouterLink class="btn btn-light" to="/connexion" @click="close">Se connecter</RouterLink>
            <RouterLink class="btn btn-yellow" to="/inscription" @click="close">Raconter mon histoire</RouterLink>
          </template>
        </div>
      </div>
    </div>
  </header>
</template>
