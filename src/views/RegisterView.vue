<script setup>
import { ref } from 'vue'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import { register, passwordIssues, isValidEmail } from '../store/auth.js'

const router = useRouter()
const route = useRoute()

const fullName = ref('')
const familyName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)

const error = ref('')
const submitting = ref(false)

function clientErrors() {
  if (!fullName.value.trim()) return 'Merci de renseigner votre nom complet.'
  if (!familyName.value.trim()) return 'Merci de renseigner votre nom de famille.'
  if (!isValidEmail(email.value)) return 'Adresse email invalide.'
  const issues = passwordIssues(password.value)
  if (issues.length) return `Le mot de passe doit contenir ${issues.join(', ')}.`
  if (password.value !== confirmPassword.value) return 'Les mots de passe ne correspondent pas.'
  return ''
}

async function submit() {
  error.value = clientErrors()
  if (error.value) return

  submitting.value = true
  const result = await register({
    fullName: fullName.value,
    familyName: familyName.value,
    email: email.value,
    password: password.value,
  })
  submitting.value = false

  if (!result.ok) {
    error.value = result.error
    return
  }

  router.push(route.query.redirect || { name: 'dashboard' })
}
</script>

<template>
  <section class="section login-section">
    <div class="container login-wrap">
      <div class="login-card">
        <div class="eyebrow">Créer un compte</div>
        <h2>Inscrivez-vous pour retrouver votre histoire</h2>
        <p class="lead login-lead">La création d'un compte est nécessaire avant de rechercher votre nom de famille dans notre base.</p>

        <form class="login-form" @submit.prevent="submit" novalidate>
          <label class="login-label" for="full-name">Nom complet</label>
          <input id="full-name" v-model="fullName" type="text" class="login-input" autocomplete="name" placeholder="Ex. Adjovi Houédji">

          <label class="login-label" for="family-name">Nom de famille</label>
          <input id="family-name" v-model="familyName" type="text" class="login-input" autocomplete="family-name" placeholder="Ex. Houédji">

          <label class="login-label" for="email">Email</label>
          <input id="email" v-model="email" type="email" class="login-input" autocomplete="email" placeholder="vous@exemple.com">

          <label class="login-label" for="password">Mot de passe</label>
          <div class="password-field">
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              class="login-input"
              autocomplete="new-password"
              placeholder="8 caractères minimum"
            >
            <button type="button" class="password-toggle" @click="showPassword = !showPassword">
              {{ showPassword ? 'Masquer' : 'Afficher' }}
            </button>
          </div>

          <label class="login-label" for="confirm-password">Confirmer le mot de passe</label>
          <input
            id="confirm-password"
            v-model="confirmPassword"
            :type="showPassword ? 'text' : 'password'"
            class="login-input"
            autocomplete="new-password"
          >

          <p v-if="error" class="login-error">{{ error }}</p>

          <button class="btn btn-yellow login-submit" type="submit" :disabled="submitting">
            {{ submitting ? 'Création du compte…' : "Créer mon compte →" }}
          </button>
        </form>

        <div class="login-hint">
          <span>Déjà inscrit·e ?</span>
          <RouterLink class="login-tag" to="/connexion">Se connecter</RouterLink>
        </div>
      </div>
    </div>
  </section>
</template>
