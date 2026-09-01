<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useAuth, logout, updateProfile, changePassword } from '../store/auth.js'
import { useRouter } from 'vue-router'
import { getOrCreateFamily } from '../data/familyDirectory.js'
import { enrichFamily } from '../data/familyProfileExtras.js'
import { useFamilySpace, fileToDataUrl } from '../store/familySpace.js'
import DashboardSidebar from '../components/DashboardSidebar.vue'
import Icon from '../components/Icon.vue'

const router = useRouter()
const { currentUser } = useAuth()

const family = computed(() => getOrCreateFamily(currentUser.value?.familyName ?? ''))
const extras = computed(() => (family.value ? enrichFamily(family.value) : null))
const { space } =
  family.value && extras.value ? useFamilySpace(currentUser.value.email, family.value, extras.value) : { space: null }

function storageKey() {
  return `racines_settings_${currentUser.value?.email ?? 'anon'}`
}
function loadSettings() {
  try {
    const raw = localStorage.getItem(storageKey())
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}
function defaultSettings() {
  return {
    twoFactor: true,
    familyVisibility: 'Privée',
    findMe: 'Membres uniquement',
    contentApproval: true,
    downloads: 'Membres autorisés uniquement',
    language: 'Français',
    timezone: "(GMT+01:00) Afrique de l'Ouest",
    theme: 'clair',
    reduceMotion: false,
    notifications: {
      newMembers: true,
      mentions: true,
      newMemories: true,
      reminders: true,
      comments: true,
      news: false,
    },
  }
}
const settings = reactive(loadSettings() ?? defaultSettings())
watch(settings, () => {
  localStorage.setItem(storageKey(), JSON.stringify(settings))
}, { deep: true })

function disableAllNotifications() {
  for (const key in settings.notifications) settings.notifications[key] = false
}

function exportData() {
  const payload = { user: currentUser.value, family: family.value, space, exportedAt: new Date().toISOString() }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `racines-${family.value?.slug ?? 'export'}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function deleteAccount() {
  if (!confirm('Supprimer définitivement votre compte et toutes vos données ? Cette action est irréversible.')) return
  logout()
  router.push('/')
}

const editingProfile = ref(false)
const profileNameDraft = ref('')
function openEditProfile() {
  profileNameDraft.value = currentUser.value?.fullName ?? ''
  editingProfile.value = true
}
function saveProfile() {
  updateProfile({ fullName: profileNameDraft.value })
  editingProfile.value = false
}
const avatarInput = ref(null)
async function onAvatarChange(e) {
  const file = e.target.files?.[0]
  if (!file) return
  const dataUrl = await fileToDataUrl(file)
  updateProfile({ avatar: dataUrl })
  e.target.value = ''
}

const changingPassword = ref(false)
const currentPw = ref('')
const newPw = ref('')
const confirmPw = ref('')
const passwordError = ref('')
const passwordSuccess = ref(false)
function openChangePassword() {
  currentPw.value = ''
  newPw.value = ''
  confirmPw.value = ''
  passwordError.value = ''
  passwordSuccess.value = false
  changingPassword.value = true
}
async function submitPasswordChange() {
  passwordError.value = ''
  if (newPw.value !== confirmPw.value) {
    passwordError.value = 'Les nouveaux mots de passe ne correspondent pas.'
    return
  }
  const result = await changePassword({ currentPassword: currentPw.value, newPassword: newPw.value })
  if (!result.ok) {
    passwordError.value = result.error
    return
  }
  passwordSuccess.value = true
  currentPw.value = ''
  newPw.value = ''
  confirmPw.value = ''
}

const sessionsOpen = ref(false)
const currentSession = computed(() => (typeof navigator !== 'undefined' ? navigator.userAgent : 'Cet appareil'))
function handleLogoutSession() {
  sessionsOpen.value = false
  logout()
  router.push('/')
}

const importInput = ref(null)
const importMessage = ref('')
async function onImportFile(e) {
  const file = e.target.files?.[0]
  if (!file) return
  try {
    const text = await file.text()
    const parsed = JSON.parse(text)
    const incoming = parsed.space ?? parsed
    let count = 0
    if (space && incoming) {
      for (const key of ['photos', 'documents', 'stories', 'memories']) {
        if (Array.isArray(incoming[key])) {
          for (const item of incoming[key]) {
            if (!space[key].some((existing) => existing.id === item.id)) {
              space[key].push(item)
              count += 1
            }
          }
        }
      }
    }
    importMessage.value = count > 0 ? `${count} élément(s) importé(s) avec succès.` : "Fichier lu, mais aucun nouvel élément à importer."
  } catch {
    importMessage.value = "Ce fichier n'a pas pu être lu — vérifiez qu'il s'agit bien d'un export Béninto (.json)."
  }
  e.target.value = ''
}
</script>

<template>
  <div v-if="family && extras" class="dashboard">
    <div class="container dashboard-layout">
      <DashboardSidebar :family="family" :extras="extras" active-id="parametres" quote="Racontons notre histoire à nos enfants." />

      <main class="dashboard-main">
        <div class="settings-head">
          <div class="settings-head-pattern" aria-hidden="true"></div>
          <svg class="settings-head-figure" viewBox="0 0 140 170" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M70 34c16 0 26 13 26 29 0 11-5 19-11 24 18 7 30 22 33 44 2 15 3 32 3 45H19c0-13 1-30 3-45 3-22 15-37 33-44-6-5-11-13-11-24 0-16 10-29 26-29Z" fill="var(--dash-gold)" opacity=".14"/>
            <path d="M70 34c16 0 26 13 26 29 0 11-5 19-11 24 18 7 30 22 33 44 2 15 3 32 3 45H19c0-13 1-30 3-45 3-22 15-37 33-44-6-5-11-13-11-24 0-16 10-29 26-29Z" stroke="var(--dash-brown)" stroke-width="2"/>
            <path d="M46 38c4-11 13-18 24-18s20 7 24 18c3 8 1 15-4 18-4-9-11-14-20-14s-16 5-20 14c-5-3-7-10-4-18Z" fill="var(--dash-brown)" opacity=".85"/>
            <path d="M94 38c3 3 5 7 4 11" stroke="var(--dash-gold)" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <div class="settings-head-copy">
            <h1>Paramètres</h1>
            <p>Gérez votre compte, vos préférences et la confidentialité de votre espace familial.</p>
          </div>
        </div>

        <div class="dashboard-card settings-card">
          <div class="dashboard-card-head">
            <h2><Icon name="lock" /> Profil et compte</h2>
            <button type="button" class="btn btn-light" @click="openEditProfile">Modifier le profil</button>
          </div>
          <div class="settings-profile-row">
            <div class="settings-avatar-wrap">
              <img v-if="currentUser?.avatar" class="settings-avatar" :src="currentUser.avatar" :alt="currentUser.fullName">
              <span v-else class="settings-avatar settings-avatar-fallback">{{ (currentUser?.fullName || '?')[0] }}</span>
              <button type="button" class="settings-avatar-edit" aria-label="Changer la photo" @click="avatarInput?.click()"><Icon name="camera" /></button>
              <input ref="avatarInput" type="file" accept="image/*" class="settings-file-input" @change="onAvatarChange">
            </div>
            <div class="settings-profile-fields">
              <div>
                <small>Nom complet</small>
                <div class="settings-profile-name-row"><strong>{{ currentUser?.fullName }}</strong><span class="settings-owner-badge">Propriétaire</span></div>
              </div>
              <div><small>Email</small><strong>{{ currentUser?.email }}</strong></div>
              <div><small>Téléphone</small><strong class="settings-muted">Non renseigné</strong></div>
            </div>
          </div>
        </div>

        <div class="settings-two-col">
          <div class="dashboard-card settings-card">
            <div class="dashboard-card-head"><h2><Icon name="shield" /> Sécurité et accès</h2></div>
            <div class="settings-row">
              <div><small>Mot de passe</small><strong>••••••••••••</strong></div>
              <button type="button" class="btn btn-light settings-row-btn" @click="openChangePassword">Modifier</button>
            </div>
            <div class="settings-row">
              <div><small>Authentification à deux facteurs</small><strong class="settings-row-desc">Renforcez la sécurité de votre compte</strong></div>
              <label class="toggle-switch">
                <input type="checkbox" v-model="settings.twoFactor">
                <span class="toggle-switch-track"></span>
              </label>
            </div>
            <button type="button" class="settings-link-row" @click="sessionsOpen = true">
              <div><small>Sessions actives</small><strong class="settings-row-desc">Gérez vos connexions sur différents appareils</strong></div>
              <Icon name="chevronLeft" class="settings-chevron" />
            </button>
          </div>

          <div id="confidentialite" class="dashboard-card settings-card">
            <div class="dashboard-card-head"><h2><Icon name="lock" /> Confidentialité</h2></div>
            <div class="settings-link-row settings-link-select">
              <div><small>Visibilité de la famille</small></div>
              <select v-model="settings.familyVisibility" class="settings-inline-select">
                <option>Privée</option>
                <option>Visible sur invitation</option>
                <option>Publique</option>
              </select>
            </div>
            <div class="settings-link-row settings-link-select">
              <div><small>Qui peut me trouver&nbsp;?</small></div>
              <select v-model="settings.findMe" class="settings-inline-select">
                <option>Personne</option>
                <option>Membres uniquement</option>
                <option>Tout le monde</option>
              </select>
            </div>
            <div class="settings-row">
              <div><small>Autorisation des contenus</small><strong class="settings-row-desc">Validation requise avant publication</strong></div>
              <label class="toggle-switch">
                <input type="checkbox" v-model="settings.contentApproval">
                <span class="toggle-switch-track"></span>
              </label>
            </div>
            <div class="settings-link-row settings-link-select">
              <div><small>Téléchargements</small></div>
              <select v-model="settings.downloads" class="settings-inline-select">
                <option>Personne</option>
                <option>Membres autorisés uniquement</option>
                <option>Tous les membres</option>
              </select>
            </div>
          </div>
        </div>

        <div class="dashboard-card settings-card">
          <div class="dashboard-card-head"><h2><Icon name="settings" /> Préférences</h2></div>
          <div class="settings-pref-grid">
            <div class="settings-select-field">
              <label><Icon name="help" /> Langue</label>
              <select v-model="settings.language">
                <option>Français</option>
                <option>Fon</option>
                <option>English</option>
              </select>
            </div>
            <div class="settings-select-field">
              <label><Icon name="clock" /> Fuseau horaire</label>
              <select v-model="settings.timezone">
                <option>(GMT+01:00) Afrique de l'Ouest</option>
                <option>(GMT+00:00) Londres</option>
                <option>(GMT+01:00) Paris</option>
              </select>
            </div>
            <div class="settings-theme-field">
              <label>Thème</label>
              <div class="settings-theme-options">
                <button type="button" class="settings-theme-swatch light" :class="{ active: settings.theme === 'clair' }" @click="settings.theme = 'clair'">
                  <span></span><span></span>
                  <Icon v-if="settings.theme === 'clair'" name="shield" class="settings-theme-check" />
                  <small>Clair</small>
                </button>
                <button type="button" class="settings-theme-swatch dark" :class="{ active: settings.theme === 'sombre' }" @click="settings.theme = 'sombre'">
                  <span></span><span></span>
                  <Icon v-if="settings.theme === 'sombre'" name="shield" class="settings-theme-check" />
                  <small>Sombre</small>
                </button>
                <button type="button" class="settings-theme-swatch system" :class="{ active: settings.theme === 'systeme' }" @click="settings.theme = 'systeme'">
                  <span></span><span></span>
                  <Icon v-if="settings.theme === 'systeme'" name="shield" class="settings-theme-check" />
                  <small>Système</small>
                </button>
              </div>
              <div class="settings-row settings-row-tight">
                <div><strong class="settings-row-desc">Réduire les animations</strong><small>Désactive les animations et transitions</small></div>
                <label class="toggle-switch">
                  <input type="checkbox" v-model="settings.reduceMotion">
                  <span class="toggle-switch-track"></span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div class="dashboard-card settings-card">
          <div class="dashboard-card-head">
            <h2><Icon name="bell" /> Notifications</h2>
            <button type="button" class="btn btn-light" @click="disableAllNotifications">Tout désactiver</button>
          </div>
          <p class="settings-card-sub">Choisissez les notifications que vous souhaitez recevoir.</p>
          <div class="settings-notif-grid">
            <div class="settings-row">
              <div class="settings-row-icon-wrap"><Icon name="users" /><div><small>Nouveaux membres</small><strong class="settings-row-desc">Lorsqu'un membre rejoint la famille</strong></div></div>
              <label class="toggle-switch"><input type="checkbox" v-model="settings.notifications.newMembers"><span class="toggle-switch-track"></span></label>
            </div>
            <div class="settings-row">
              <div class="settings-row-icon-wrap"><Icon name="mail" /><div><small>Mentions</small><strong class="settings-row-desc">Lorsqu'un membre vous mentionne</strong></div></div>
              <label class="toggle-switch"><input type="checkbox" v-model="settings.notifications.mentions"><span class="toggle-switch-track"></span></label>
            </div>
            <div class="settings-row">
              <div class="settings-row-icon-wrap"><Icon name="star" /><div><small>Nouveaux souvenirs</small><strong class="settings-row-desc">Lorsqu'un souvenir est ajouté</strong></div></div>
              <label class="toggle-switch"><input type="checkbox" v-model="settings.notifications.newMemories"><span class="toggle-switch-track"></span></label>
            </div>
            <div class="settings-row">
              <div class="settings-row-icon-wrap"><Icon name="calendar" /><div><small>Rappels et anniversaires</small><strong class="settings-row-desc">Événements et dates importantes</strong></div></div>
              <label class="toggle-switch"><input type="checkbox" v-model="settings.notifications.reminders"><span class="toggle-switch-track"></span></label>
            </div>
            <div class="settings-row">
              <div class="settings-row-icon-wrap"><Icon name="message" /><div><small>Commentaires</small><strong class="settings-row-desc">Lorsqu'un commentaire est ajouté</strong></div></div>
              <label class="toggle-switch"><input type="checkbox" v-model="settings.notifications.comments"><span class="toggle-switch-track"></span></label>
            </div>
            <div class="settings-row">
              <div class="settings-row-icon-wrap"><Icon name="cloud" /><div><small>Actualités et mises à jour</small><strong class="settings-row-desc">Nouvelles fonctionnalités et conseils</strong></div></div>
              <label class="toggle-switch"><input type="checkbox" v-model="settings.notifications.news"><span class="toggle-switch-track"></span></label>
            </div>
          </div>
        </div>

        <div id="gestion-donnees" class="dashboard-card settings-card">
          <div class="dashboard-card-head"><h2><Icon name="folder" /> Gestion des données</h2></div>
          <div class="settings-data-grid">
            <button type="button" class="settings-data-action" @click="exportData">
              <span class="settings-data-icon"><Icon name="upload" /></span>
              <div><strong>Exporter mes données</strong><small>Téléchargez une copie de vos données familiales.</small></div>
            </button>
            <button type="button" class="settings-data-action" @click="importInput?.click()">
              <span class="settings-data-icon"><Icon name="upload" /></span>
              <div><strong>Importer des données</strong><small>{{ importMessage || "Importez un fichier exporté depuis Béninto (.json)." }}</small></div>
            </button>
            <input ref="importInput" type="file" accept="application/json" class="settings-file-input" @change="onImportFile">
            <button type="button" class="settings-data-action danger" @click="deleteAccount">
              <span class="settings-data-icon"><Icon name="close" /></span>
              <div><strong>Supprimer mon compte</strong><small>Supprimez définitivement votre compte et toutes vos données.</small></div>
            </button>
          </div>
        </div>

        <div class="settings-help-row">
          <div><strong><Icon name="help" /> Besoin d'aide&nbsp;?</strong><p>Consultez notre centre d'aide ou contactez notre équipe.</p></div>
          <div class="settings-help-actions">
            <RouterLink to="/#methode" class="btn btn-light">Centre d'aide</RouterLink>
            <a href="mailto:contact@beninto.bj" class="btn btn-yellow">Nous contacter</a>
          </div>
        </div>
      </main>
    </div>

    <div v-if="editingProfile" class="modal-backdrop" @click.self="editingProfile = false">
      <div class="modal-card">
        <div class="modal-head">
          <h3>Modifier le profil</h3>
          <button type="button" class="modal-close" @click="editingProfile = false">✕</button>
        </div>
        <form class="modal-form" @submit.prevent="saveProfile">
          <label class="login-label" for="profile-name">Nom complet</label>
          <input id="profile-name" v-model="profileNameDraft" type="text" class="login-input" autocomplete="name">
          <button type="submit" class="btn btn-yellow login-submit">Enregistrer</button>
        </form>
      </div>
    </div>

    <div v-if="changingPassword" class="modal-backdrop" @click.self="changingPassword = false">
      <div class="modal-card">
        <div class="modal-head">
          <h3>Modifier le mot de passe</h3>
          <button type="button" class="modal-close" @click="changingPassword = false">✕</button>
        </div>
        <form v-if="!passwordSuccess" class="modal-form" @submit.prevent="submitPasswordChange">
          <label class="login-label" for="current-pw">Mot de passe actuel</label>
          <input id="current-pw" v-model="currentPw" type="password" class="login-input" autocomplete="current-password">
          <label class="login-label" for="new-pw">Nouveau mot de passe</label>
          <input id="new-pw" v-model="newPw" type="password" class="login-input" autocomplete="new-password" placeholder="8 caractères minimum">
          <label class="login-label" for="confirm-pw">Confirmer le nouveau mot de passe</label>
          <input id="confirm-pw" v-model="confirmPw" type="password" class="login-input" autocomplete="new-password">
          <p v-if="passwordError" class="login-error">{{ passwordError }}</p>
          <button type="submit" class="btn btn-yellow login-submit">Modifier le mot de passe</button>
        </form>
        <div v-else class="settings-password-success">
          <p>✓ Votre mot de passe a été modifié avec succès.</p>
          <button type="button" class="btn btn-light" @click="changingPassword = false">Fermer</button>
        </div>
      </div>
    </div>

    <div v-if="sessionsOpen" class="modal-backdrop" @click.self="sessionsOpen = false">
      <div class="modal-card">
        <div class="modal-head">
          <h3>Sessions actives</h3>
          <button type="button" class="modal-close" @click="sessionsOpen = false">✕</button>
        </div>
        <div class="settings-session-row">
          <div>
            <strong>Cet appareil</strong>
            <small>{{ currentSession }}</small>
            <span class="settings-session-badge">Connecté·e maintenant</span>
          </div>
        </div>
        <p class="settings-card-sub">C'est la seule session détectée pour votre compte sur cet appareil.</p>
        <button type="button" class="btn btn-light login-submit" @click="handleLogoutSession">Se déconnecter de cette session</button>
      </div>
    </div>
  </div>
</template>
