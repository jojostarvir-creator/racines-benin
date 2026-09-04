<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth } from '../store/auth.js'
import { getOrCreateFamily } from '../data/familyDirectory.js'
import { enrichFamily } from '../data/familyProfileExtras.js'
import { useFamilySpace } from '../store/familySpace.js'
import DashboardSidebar from '../components/DashboardSidebar.vue'
import QuickAddModal from '../components/QuickAddModal.vue'

const route = useRoute()
const { currentUser } = useAuth()

const family = computed(() => getOrCreateFamily(currentUser.value?.familyName ?? ''))
const extras = computed(() => (family.value ? enrichFamily(family.value) : null))

const { space, addMember } =
  family.value && extras.value ? useFamilySpace(currentUser.value.email, family.value, extras.value) : { space: null }

const query = ref(typeof route.query.q === 'string' ? route.query.q : '')
const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!space) return []
  return [...space.members]
    .sort((a, b) => a.generation - b.generation)
    .filter((m) => !q || m.name.toLowerCase().includes(q))
})

const inviting = ref(false)
function submitInvite(payload) {
  addMember(payload)
  inviting.value = false
}
</script>

<template>
  <div v-if="family && extras && space" class="dashboard">
    <div class="container dashboard-layout">
      <DashboardSidebar :family="family" :extras="extras" active-id="membres" @invite="inviting = true" />

      <main class="dashboard-main">
        <div class="tree-page-head">
          <div><h2>Membres de la famille</h2></div>
        </div>
        <input v-model="query" type="text" class="login-input directory-search" placeholder="Rechercher un membre…">

        <div class="members-grid">
          <RouterLink v-for="m in filtered" :key="m.id" :to="`/mon-espace/membre/${m.id}`" class="member-list-card">
            <img :src="m.photo" :alt="m.name">
            <strong>{{ m.name }}</strong>
            <small>{{ m.years }}</small>
            <span class="badge">Génération {{ m.generation }}</span>
          </RouterLink>
        </div>
        <p v-if="!filtered.length" class="dashboard-empty">Aucun membre ne correspond à votre recherche.</p>
      </main>
    </div>

    <QuickAddModal v-if="inviting" type="member" @close="inviting = false" @submit="submitInvite" />
  </div>
</template>
