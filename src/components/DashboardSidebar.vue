<script setup>
import { ref } from 'vue'
import Icon from './Icon.vue'

defineProps({
  family: { type: Object, required: true },
  extras: { type: Object, required: true },
  activeId: { type: String, default: 'apercu' },
  quote: { type: String, default: 'Transmettons notre histoire, un héritage pour demain.' },
})
defineEmits(['invite', 'add-souvenir'])

const links = [
  { id: 'apercu', label: 'Tableau de bord', icon: 'home', to: '/mon-espace' },
  { id: 'arbre', label: 'Arbre généalogique', icon: 'tree', to: '/mon-espace/arbre' },
  { id: 'membres', label: 'Membres de la famille', icon: 'users', to: '/mon-espace/membres' },
  { id: 'photos', label: 'Souvenirs et médias', icon: 'image', to: '/mon-espace/souvenirs' },
  { id: 'documents', label: 'Documents', icon: 'file', to: '/mon-espace/documents' },
  { id: 'histoires', label: 'Histoires & anecdotes', icon: 'note', to: '/mon-espace/histoires' },
  { id: 'chronologie', label: 'Ligne du temps', icon: 'clock', to: '/mon-espace/chronologie' },
  { id: 'parametres', label: 'Paramètres', icon: 'settings', to: '/mon-espace#parametres' },
]

const mobileOpen = ref(false)
</script>

<template>
  <aside class="dashboard-sidebar" :class="{ 'mobile-open': mobileOpen }">
    <button type="button" class="sidebar-mobile-toggle" @click="mobileOpen = !mobileOpen">
      <Icon :name="mobileOpen ? 'close' : 'menu'" /> {{ mobileOpen ? 'Fermer le menu' : 'Menu' }}
    </button>

    <div class="sidebar-panel">
      <div class="sidebar-title">Mon espace</div>
      <nav class="sidebar-nav">
        <RouterLink
          v-for="link in links" :key="link.id" :to="link.to"
          class="sidebar-link" :class="{ active: link.id === activeId }"
          @click="mobileOpen = false"
        >
          <Icon :name="link.icon" />{{ link.label }}
        </RouterLink>
      </nav>

      <div class="sidebar-family-card">
        <div class="sidebar-family-label">Ma famille</div>
        <div class="sidebar-family-row">
          <img :src="family.image" :alt="family.name">
          <div>
            <strong>Famille {{ family.name }}</strong>
            <small>{{ extras.localities[0] }}, {{ family.department }}</small>
          </div>
        </div>
        <RouterLink :to="`/famille/${family.slug}`" class="sidebar-family-link">Voir la page publique →</RouterLink>
      </div>

      <div class="sidebar-privacy">
        <strong><Icon name="lock" /> Espace privé</strong>
        <p>Seuls les membres autorisés peuvent voir cet espace.</p>
        <button type="button" class="btn btn-light sidebar-invite" @click="$emit('invite')">Inviter un membre</button>
      </div>

      <div class="sidebar-cta">
        <svg class="sidebar-cta-figure" viewBox="0 0 120 170" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M60 30c14 0 22 12 22 26 0 10-4 17-9 22 16 6 27 20 30 40 2 14 3 30 3 42H14c0-12 1-28 3-42 3-20 14-34 30-40-5-5-9-12-9-22 0-14 8-26 22-26Z" fill="var(--dash-gold)" opacity=".16"/>
          <path d="M60 30c14 0 22 12 22 26 0 10-4 17-9 22 16 6 27 20 30 40 2 14 3 30 3 42H14c0-12 1-28 3-42 3-20 14-34 30-40-5-5-9-12-9-22 0-14 8-26 22-26Z" stroke="var(--dash-brown)" stroke-width="2"/>
          <path d="M40 34c4-10 12-16 20-16s16 6 20 16c3 7 1 14-4 16-3-8-9-13-16-13s-13 5-16 13c-5-2-7-9-4-16Z" fill="var(--dash-brown)" opacity=".85"/>
          <path d="M78 34c3 2 5 6 4 10" stroke="var(--dash-gold)" stroke-width="2" stroke-linecap="round"/>
          <path d="M20 130c6-3 13-5 40-5s34 2 40 5" stroke="var(--dash-brown)" stroke-width="1.4" opacity=".5"/>
          <path d="M26 110c8-3 16-4 34-4s26 1 34 4" stroke="var(--dash-brown)" stroke-width="1.4" opacity=".5"/>
          <circle cx="60" cy="90" r="2.4" fill="var(--dash-gold)"/>
          <circle cx="46" cy="96" r="2.4" fill="var(--dash-gold)"/>
          <circle cx="74" cy="96" r="2.4" fill="var(--dash-gold)"/>
        </svg>
        <p>{{ quote }}</p>
        <button type="button" class="btn btn-yellow" @click="$emit('add-souvenir')">Ajouter un souvenir</button>
      </div>
    </div>
  </aside>
</template>
