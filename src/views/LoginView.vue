<script setup>
import { ref } from 'vue'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import { login } from '../store/auth.js'

const router = useRouter()
const route = useRoute()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const error = ref('')
const submitting = ref(false)
const attempts = ref(0)

async function submit() {
  error.value = ''
  if (attempts.value >= 5) {
    error.value = 'Trop de tentatives. Merci de patienter avant de réessayer.'
    return
  }
  if (!email.value || !password.value) {
    error.value = 'Merci de renseigner votre email et votre mot de passe.'
    return
  }

  submitting.value = true
  const result = await login({ email: email.value, password: password.value })
  submitting.value = false

  if (!result.ok) {
    attempts.value += 1
    error.value = result.error
    return
  }
  router.push(route.query.redirect || { name: 'search' })
}
</script>

<template>
  <section class="section login-section">
    <div class="container login-wrap">
      <div class="login-card">
        <div class="eyebrow">Connexion</div>
        <h2>Bon retour parmi nous</h2>
        <p class="lead login-lead">Connectez-vous à votre compte pour accéder à la recherche et retrouver l'histoire de votre famille.</p>

        <form class="login-form" @submit.prevent="submit" novalidate>
          <label class="login-label" for="login-email">Email</label>
          <input id="login-email" v-model="email" type="email" class="login-input" autocomplete="email" placeholder="vous@exemple.com">

          <label class="login-label" for="login-password">Mot de passe</label>
          <div class="password-field">
            <input
              id="login-password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              class="login-input"
              autocomplete="current-password"
            >
            <button type="button" class="password-toggle" @click="showPassword = !showPassword">
              {{ showPassword ? 'Masquer' : 'Afficher' }}
            </button>
          </div>

          <p v-if="error" class="login-error">{{ error }}</p>

          <button class="btn btn-yellow login-submit" type="submit" :disabled="submitting">
            {{ submitting ? 'Connexion…' : 'Se connecter →' }}
          </button>
        </form>

        <div class="login-hint">
          <span>Pas encore de compte ?</span>
          <RouterLink class="login-tag" to="/inscription">S'inscrire</RouterLink>
        </div>
      </div>
    </div>
  </section>
</template>
