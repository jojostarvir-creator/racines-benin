<script setup>
import { computed, ref, nextTick } from 'vue'
import { useAuth } from '../store/auth.js'
import { getOrCreateFamily } from '../data/familyDirectory.js'
import { enrichFamily, COTISATION_PURPOSES } from '../data/familyProfileExtras.js'
import { useFamilySpace } from '../store/familySpace.js'
import DashboardSidebar from '../components/DashboardSidebar.vue'
import Icon from '../components/Icon.vue'

const { currentUser } = useAuth()

const family = computed(() => getOrCreateFamily(currentUser.value?.familyName ?? ''))
const extras = computed(() => (family.value ? enrichFamily(family.value) : null))

const { space, addGroupMessage, addCotisation, addEventComment } =
  family.value && extras.value ? useFamilySpace(currentUser.value.email, family.value, extras.value) : { space: null }

const activeTab = ref('discussion')
const tabs = [
  { id: 'discussion', label: 'Discussion', icon: 'message' },
  { id: 'cotisations', label: 'Cotisations', icon: 'gift' },
  { id: 'evenements', label: 'Événements', icon: 'calendar' },
]

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}
function formatAmount(n) {
  return `${n.toLocaleString('fr-FR')} FCFA`
}

// ---- Discussion ----
const messageGroups = computed(() => {
  if (!space) return []
  const groups = []
  for (const m of space.groupMessages) {
    const day = new Date(m.createdAt)
    const label = dayLabel(day)
    let group = groups.find((g) => g.label === label)
    if (!group) { group = { label, items: [] }; groups.push(group) }
    group.items.push(m)
  }
  return groups
})
function dayLabel(date) {
  const today = new Date()
  const diffDays = Math.floor((today.setHours(0, 0, 0, 0) - new Date(date).setHours(0, 0, 0, 0)) / 86400000)
  if (diffDays === 0) return "Aujourd'hui"
  if (diffDays === 1) return 'Hier'
  return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
}
function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}
function isMine(m) {
  return m.authorName === currentUser.value?.fullName
}

const newMessage = ref('')
const chatEnd = ref(null)
async function sendMessage() {
  const text = newMessage.value.trim()
  if (!text) return
  addGroupMessage({
    authorId: null,
    authorName: currentUser.value?.fullName ?? 'Vous',
    authorPhoto: currentUser.value?.avatar ?? null,
    text,
  })
  newMessage.value = ''
  await nextTick()
  chatEnd.value?.scrollIntoView({ behavior: 'smooth', block: 'end' })
}

// ---- Cotisations ----
const totalCollected = computed(() => (space ? space.cotisations.filter((c) => c.status === 'Payé').reduce((sum, c) => sum + c.amount, 0) : 0))
const totalPending = computed(() => (space ? space.cotisations.filter((c) => c.status === 'En attente').reduce((sum, c) => sum + c.amount, 0) : 0))
const contributorCount = computed(() => (space ? new Set(space.cotisations.map((c) => c.memberName)).size : 0))
const sortedCotisations = computed(() => (space ? [...space.cotisations].sort((a, b) => new Date(b.date) - new Date(a.date)) : []))

const cotisationModal = ref(false)
const cotisationForm = ref({ memberName: '', amount: '', purpose: COTISATION_PURPOSES[0] })
function openCotisationModal() {
  cotisationForm.value = { memberName: currentUser.value?.fullName ?? '', amount: '', purpose: COTISATION_PURPOSES[0] }
  cotisationModal.value = true
}
function submitCotisation() {
  const amount = Number(cotisationForm.value.amount)
  if (!cotisationForm.value.memberName.trim() || !amount) return
  addCotisation({
    memberId: null,
    memberName: cotisationForm.value.memberName.trim(),
    memberPhoto: currentUser.value?.avatar ?? null,
    amount,
    purpose: cotisationForm.value.purpose,
    status: 'Payé',
  })
  cotisationModal.value = false
}

// ---- Événements ----
const sortedEvents = computed(() => (space ? [...space.groupEvents].sort((a, b) => new Date(a.date) - new Date(b.date)) : []))
function daysUntil(iso) {
  const diff = Math.round((new Date(iso).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / 86400000)
  if (diff === 0) return "Aujourd'hui"
  if (diff === 1) return 'Demain'
  if (diff > 1) return `Dans ${diff} jours`
  return formatDate(iso)
}

const commentDrafts = ref({})
function submitComment(eventId) {
  const text = (commentDrafts.value[eventId] ?? '').trim()
  if (!text) return
  addEventComment(eventId, {
    authorId: null,
    authorName: currentUser.value?.fullName ?? 'Vous',
    authorPhoto: currentUser.value?.avatar ?? null,
    text,
  })
  commentDrafts.value[eventId] = ''
}
</script>

<template>
  <div v-if="family && extras && space" class="dashboard">
    <div class="container dashboard-layout">
      <DashboardSidebar :family="family" :extras="extras" active-id="messagerie" quote="Une famille qui se parle est une famille qui reste unie." />

      <main class="dashboard-main">
        <div class="member-breadcrumb">
          <RouterLink to="/mon-espace">Ma famille</RouterLink>
          <span>›</span>
          <span>Messagerie familiale</span>
        </div>

        <div class="stories-head">
          <div>
            <h1>Messagerie familiale</h1>
            <p>Discutez, organisez les cotisations et parlez des événements à venir avec toute la famille — comme un groupe WhatsApp, rien que pour vous.</p>
          </div>
        </div>

        <div class="msg-demo-notice">
          <Icon name="help" /> Démonstration : les messages que vous envoyez restent visibles uniquement dans votre navigateur.
        </div>

        <div class="member-tabs">
          <button
            v-for="t in tabs" :key="t.id" type="button"
            class="member-tab" :class="{ active: activeTab === t.id }"
            @click="activeTab = t.id"
          >
            <Icon :name="t.icon" /> {{ t.label }}
          </button>
        </div>

        <div v-if="activeTab === 'discussion'" class="dashboard-card msg-chat-card">
          <div class="msg-chat-scroll">
            <div v-for="group in messageGroups" :key="group.label" class="msg-day-group">
              <div class="msg-day-label"><span>{{ group.label }}</span></div>
              <div
                v-for="m in group.items" :key="m.id"
                class="msg-bubble-row" :class="{ mine: isMine(m) }"
              >
                <img v-if="!isMine(m)" class="msg-avatar" :src="m.authorPhoto" :alt="m.authorName">
                <div class="msg-bubble">
                  <strong v-if="!isMine(m)" class="msg-author">{{ m.authorName }}</strong>
                  <p>{{ m.text }}</p>
                  <small class="msg-time">{{ formatTime(m.createdAt) }}</small>
                </div>
              </div>
            </div>
            <p v-if="!space.groupMessages.length" class="dashboard-empty">Aucun message pour l'instant. Lancez la discussion !</p>
            <div ref="chatEnd"></div>
          </div>
          <form class="msg-chat-input" @submit.prevent="sendMessage">
            <input v-model="newMessage" type="text" placeholder="Écrivez un message à la famille…">
            <button type="submit" class="btn btn-yellow" :disabled="!newMessage.trim()"><Icon name="upload" /> Envoyer</button>
          </form>
        </div>

        <div v-else-if="activeTab === 'cotisations'" class="msg-cotis-wrap">
          <div class="msg-cotis-stats">
            <div class="summary-card"><strong>{{ formatAmount(totalCollected) }}</strong><span>Collecté</span></div>
            <div class="summary-card"><strong>{{ formatAmount(totalPending) }}</strong><span>En attente</span></div>
            <div class="summary-card"><strong>{{ contributorCount }}</strong><span>Contributeurs</span></div>
          </div>

          <div class="dashboard-card">
            <div class="dashboard-card-head">
              <h2>Historique des cotisations</h2>
              <button type="button" class="btn btn-yellow" @click="openCotisationModal"><Icon name="upload" /> Ajouter une cotisation</button>
            </div>
            <div class="msg-cotis-list">
              <div v-for="c in sortedCotisations" :key="c.id" class="msg-cotis-row">
                <img v-if="c.memberPhoto" class="msg-avatar" :src="c.memberPhoto" :alt="c.memberName">
                <span v-else class="msg-avatar msg-avatar-fallback">{{ c.memberName[0] }}</span>
                <div class="msg-cotis-info">
                  <strong>{{ c.memberName }}</strong>
                  <small>{{ c.purpose }} · {{ formatDate(c.date) }}</small>
                </div>
                <span class="msg-cotis-amount">{{ formatAmount(c.amount) }}</span>
                <span class="msg-status-pill" :class="{ pending: c.status === 'En attente' }">{{ c.status }}</span>
              </div>
              <p v-if="!sortedCotisations.length" class="dashboard-empty">Aucune cotisation enregistrée pour l'instant.</p>
            </div>
          </div>
        </div>

        <div v-else-if="activeTab === 'evenements'" class="msg-events-list">
          <div v-for="e in sortedEvents" :key="e.id" class="dashboard-card msg-event-card">
            <div class="msg-event-head">
              <div>
                <span class="story-count">{{ daysUntil(e.date) }}</span>
                <h2>{{ e.title }}</h2>
                <small><Icon name="pin" /> {{ e.location }} · {{ formatDate(e.date) }}</small>
              </div>
            </div>
            <p class="msg-event-desc">{{ e.description }}</p>

            <div class="msg-event-comments">
              <div v-for="c in e.comments" :key="c.id" class="msg-comment-row">
                <img class="msg-avatar small" :src="c.authorPhoto" :alt="c.authorName">
                <div>
                  <strong>{{ c.authorName }}</strong>
                  <p>{{ c.text }}</p>
                </div>
              </div>
              <p v-if="!e.comments.length" class="dashboard-empty">Personne n'a encore commenté.</p>
            </div>

            <form class="msg-comment-input" @submit.prevent="submitComment(e.id)">
              <input v-model="commentDrafts[e.id]" type="text" placeholder="Réagir à cet événement…">
              <button type="submit" class="btn btn-light" :disabled="!(commentDrafts[e.id] ?? '').trim()">Envoyer</button>
            </form>
          </div>
          <p v-if="!sortedEvents.length" class="dashboard-empty">Aucun événement prévu pour l'instant.</p>
        </div>
      </main>
    </div>

    <div v-if="cotisationModal" class="modal-backdrop" @click.self="cotisationModal = false">
      <div class="modal-card">
        <div class="modal-head">
          <h3>Ajouter une cotisation</h3>
          <button type="button" class="modal-close" @click="cotisationModal = false">✕</button>
        </div>
        <form class="modal-form" @submit.prevent="submitCotisation">
          <label class="login-label">Membre</label>
          <input class="login-input" v-model="cotisationForm.memberName" type="text" placeholder="Nom du membre">
          <label class="login-label">Montant (FCFA)</label>
          <input class="login-input" v-model="cotisationForm.amount" type="number" min="0" step="500" placeholder="Ex. 10000">
          <label class="login-label">Motif</label>
          <select class="login-input" v-model="cotisationForm.purpose">
            <option v-for="p in COTISATION_PURPOSES" :key="p" :value="p">{{ p }}</option>
          </select>
          <button class="btn btn-yellow login-submit" type="submit">Ajouter</button>
        </form>
      </div>
    </div>
  </div>

  <section v-else class="section">
    <div class="container login-wrap">
      <div class="login-card">
        <div class="eyebrow">Espace introuvable</div>
        <h2>Nous n'avons pas trouvé de famille associée à votre compte.</h2>
        <RouterLink class="btn btn-yellow login-submit" to="/recherche">Chercher ma famille →</RouterLink>
      </div>
    </div>
  </section>
</template>
