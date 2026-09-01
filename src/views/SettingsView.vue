<script setup>
import { computed, reactive, watch } from 'vue'
import { useAuth, logout } from '../store/auth.js'
import { useRouter } from 'vue-router'
import { getOrCreateFamily } from '../data/familyDirectory.js'
import { enrichFamily } from '../data/familyProfileExtras.js'
import { useFamilySpace } from '../store/familySpace.js'
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
            <button type="button" class="btn btn-light">Modifier le profil</button>
          </div>
          <div class="settings-profile-row">
            <div class="settings-avatar-wrap">
              <img v-if="currentUser?.avatar" class="settings-avatar" :src="currentUser.avatar" :alt="currentUser.fullName">
              <span v-else class="settings-avatar settings-avatar-fallback">{{ (currentUser?.fullName || '?')[0] }}</span>
              <button type="button" class="settings-avatar-edit" aria-label="Changer la photo"><Icon name="camera" /></button>
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
              <button type="button" class="btn btn-light settings-row-btn">Modifier</button>
            </div>
            <div class="settings-row">
              <div><small>Authentification à deux facteurs</small><strong class="settings-row-desc">Renforcez la sécurité de votre compte</strong></div>
              <label class="toggle-switch">
                <input type="checkbox" v-model="settings.twoFactor">
                <span class="toggle-switch-track"></span>
              </label>
            </div>
            <button type="button" class="settings-link-row">
              <div><small>Sessions actives</small><strong class="settings-row-desc">Gérez vos connexions sur différents appareils</strong></div>
              <Icon name="chevronLeft" class="settings-chevron" />
            </button>
          </div>

          <div class="dashboard-card settings-card">
            <div class="dashboard-card-head"><h2><Icon name="lock" /> Confidentialité</h2></div>
            <button type="button" class="settings-link-row">
              <div><small>Visibilité de la famille</small></div>
              <span class="settings-value">{{ settings.familyVisibility }}</span>
              <Icon name="chevronLeft" class="settings-chevron" />
            </button>
            <button type="button" class="settings-link-row">
              <div><small>Qui peut me trouver&nbsp;?</small></div>
              <span class="settings-value">{{ settings.findMe }}</span>
              <Icon name="chevronLeft" class="settings-chevron" />
            </button>
            <button type="button" class="settings-link-row">
              <div><small>Autorisation des contenus</small><strong class="settings-row-desc">Validation requise avant publication</strong></div>
              <Icon name="chevronLeft" class="settings-chevron" />
            </button>
            <button type="button" class="settings-link-row">
              <div><small>Téléchargements</small></div>
              <span class="settings-value">{{ settings.downloads }}</span>
              <Icon name="chevronLeft" class="settings-chevron" />
            </button>
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

        <div class="dashboard-card settings-card">
          <div class="dashboard-card-head"><h2><Icon name="folder" /> Gestion des données</h2></div>
          <div class="settings-data-grid">
            <button type="button" class="settings-data-action" @click="exportData">
              <span class="settings-data-icon"><Icon name="upload" /></span>
              <div><strong>Exporter mes données</strong><small>Téléchargez une copie de vos données familiales.</small></div>
            </button>
            <button type="button" class="settings-data-action">
              <span class="settings-data-icon"><Icon name="upload" /></span>
              <div><strong>Importer des données</strong><small>Importez un fichier GEDCOM ou d'autres formats.</small></div>
            </button>
            <button type="button" class="settings-data-action danger" @click="deleteAccount">
              <span class="settings-data-icon"><Icon name="close" /></span>
              <div><strong>Supprimer mon compte</strong><small>Supprimez définitivement votre compte et toutes vos données.</small></div>
            </button>
          </div>
        </div>

        <div class="settings-help-row">
          <div><strong><Icon name="help" /> Besoin d'aide&nbsp;?</strong><p>Consultez notre centre d'aide ou contactez notre équipe.</p></div>
          <div class="settings-help-actions">
            <button type="button" class="btn btn-light">Centre d'aide</button>
            <button type="button" class="btn btn-yellow">Nous contacter</button>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>
