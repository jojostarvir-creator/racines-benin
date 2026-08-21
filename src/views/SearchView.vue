<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { findFamily } from '../data/familyDirectory.js'
import { useAuth, logout } from '../store/auth.js'

const router = useRouter()
const { currentUser } = useAuth()

const name = ref(currentUser.value?.familyName ?? '')
const searched = ref(false)
const notFound = ref(false)

function submit() {
  const family = findFamily(name.value)
  searched.value = true
  if (family) {
    notFound.value = false
    router.push({ name: 'family', params: { slug: family.slug } })
  } else {
    notFound.value = true
  }
}

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
        <h2>Retrouvez l'histoire de votre famille</h2>
        <p class="lead login-lead">Entrez votre nom de famille. S'il est déjà présent dans notre base, vous accéderez directement à son histoire, ses origines et ses récits.</p>

        <form class="login-form" @submit.prevent="submit">
          <label class="login-label" for="family-name">Nom de famille</label>
          <input
            id="family-name"
            v-model="name"
            type="text"
            class="login-input"
            placeholder="Ex. Houédji, Dossou-Yovo, Codjia…"
            autocomplete="family-name"
          >
          <button class="btn btn-yellow login-submit" type="submit">Voir mon histoire →</button>
        </form>

        <div v-if="searched && notFound" class="login-not-found">
          <p>Aucune famille « {{ name }} » n'est encore enregistrée dans notre base.</p>
          <RouterLink class="btn btn-dark" to="/#contribuer">Raconter mon histoire</RouterLink>
        </div>

        <div class="login-hint">
          <span>Essayez par exemple :</span>
          <div class="login-hint-tags">
            <button type="button" class="login-tag" @click="name = 'Houédji'; submit()">Houédji</button>
            <button type="button" class="login-tag" @click="name = 'Dossou-Yovo'; submit()">Dossou-Yovo</button>
            <button type="button" class="login-tag" @click="name = 'Codjia'; submit()">Codjia</button>
          </div>
        </div>

        <button type="button" class="logout-link" @click="handleLogout">Se déconnecter</button>
      </div>
    </div>
  </section>
</template>
