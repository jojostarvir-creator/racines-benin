<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { findFamily, slugify } from '../data/familyDirectory.js'
import { useAuth, logout } from '../store/auth.js'

const router = useRouter()
const route = useRoute()
const { currentUser } = useAuth()

const name = ref(route.query.q ?? '')
const searched = ref(false)
const notFound = ref(false)
const searchOpen = ref(!!route.query.q)

function goToResult(searchedName) {
  const family = findFamily(searchedName)
  searched.value = true
  if (family) {
    notFound.value = false
    const isOwnFamily = currentUser.value && slugify(currentUser.value.familyName) === family.slug
    if (isOwnFamily) {
      router.push({ name: 'dashboard' })
    } else {
      router.push({ name: 'family', params: { slug: family.slug } })
    }
  } else {
    notFound.value = true
  }
}

function discoverOwnFamily() {
  router.push({ name: 'dashboard' })
}

function submitSearch() {
  goToResult(name.value)
}

if (route.query.q) goToResult(route.query.q)

function handleLogout() {
  logout()
  router.push('/')
}
</script>

<template>
  <section class="section login-section">
    <div class="container login-wrap">
      <div class="login-card">
        <div class="eyebrow">Bonjour {{ currentUser?.fullName }}</div>
        <h2>Que souhaitez-vous faire ?</h2>
        <p class="lead login-lead">Découvrez l'histoire de votre propre famille, ou recherchez un autre nom dans notre base.</p>

        <div class="choice-card choice-primary">
          <strong>Voulez-vous en savoir plus sur votre nom de famille ?</strong>
          <p>« {{ currentUser?.familyName }} » — nous allons vérifier s'il est déjà enregistré.</p>
          <button type="button" class="btn btn-yellow login-submit" @click="discoverOwnFamily">
            Découvrir l'histoire de {{ currentUser?.familyName }} →
          </button>
        </div>

        <div class="choice-divider"><span>ou</span></div>

        <div class="choice-card">
          <button type="button" class="choice-toggle" @click="searchOpen = !searchOpen">
            <strong>Faire une recherche</strong>
            <span>{{ searchOpen ? '−' : '+' }}</span>
          </button>
          <form v-if="searchOpen" class="login-form" @submit.prevent="submitSearch">
            <label class="login-label" for="family-name">Nom de famille</label>
            <input
              id="family-name"
              v-model="name"
              type="text"
              class="login-input"
              placeholder="Ex. Houédji, Dossou-Yovo, Codjia…"
              autocomplete="family-name"
            >
            <button class="btn btn-dark login-submit" type="submit">Rechercher →</button>
          </form>
        </div>

        <div v-if="searched && notFound" class="login-not-found">
          <p>Aucune famille « {{ name || currentUser?.familyName }} » n'est encore enregistrée dans notre base.</p>
        </div>

        <div class="login-hint">
          <span>Essayez par exemple :</span>
          <div class="login-hint-tags">
            <button type="button" class="login-tag" @click="name = 'Houédji'; searchOpen = true; submitSearch()">Houédji</button>
            <button type="button" class="login-tag" @click="name = 'Dossou-Yovo'; searchOpen = true; submitSearch()">Dossou-Yovo</button>
            <button type="button" class="login-tag" @click="name = 'Codjia'; searchOpen = true; submitSearch()">Codjia</button>
          </div>
        </div>

        <button type="button" class="logout-link" @click="handleLogout">Se déconnecter</button>
      </div>
    </div>
  </section>
</template>
