<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth, logout } from '../store/auth.js'

const router = useRouter()
const { isAuthenticated } = useAuth()
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
      <RouterLink class="logo" to="/" @click="close">
        <span class="logo-mark"><span></span><span></span><span></span></span>
        Racines
      </RouterLink>
      <nav class="nav-links">
        <RouterLink to="/#familles">Familles</RouterLink>
        <RouterLink to="/#territoires">Territoires</RouterLink>
        <RouterLink to="/#territoires">Carte</RouterLink>
        <RouterLink to="/#methode">Méthode</RouterLink>
      </nav>
      <div class="nav-actions">
        <template v-if="isAuthenticated">
          <RouterLink class="btn btn-light" to="/recherche">Mon histoire</RouterLink>
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
        <RouterLink to="/#familles" @click="close">Familles</RouterLink>
        <RouterLink to="/#territoires" @click="close">Territoires</RouterLink>
        <RouterLink to="/#carte" @click="close">Carte</RouterLink>
        <RouterLink to="/#methode" @click="close">Méthode</RouterLink>
        <div class="nav-mobile-actions">
          <template v-if="isAuthenticated">
            <RouterLink class="btn btn-light" to="/recherche" @click="close">Mon histoire</RouterLink>
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
