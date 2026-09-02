<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useAuth } from '../store/auth.js'
import { getOrCreateFamily } from '../data/familyDirectory.js'
import { enrichFamily } from '../data/familyProfileExtras.js'
import { useFamilySpace } from '../store/familySpace.js'
import DashboardSidebar from '../components/DashboardSidebar.vue'
import QuickAddModal from '../components/QuickAddModal.vue'
import Icon from '../components/Icon.vue'

const route = useRoute()
const router = useRouter()
const { currentUser } = useAuth()

const family = computed(() => getOrCreateFamily(currentUser.value?.familyName ?? ''))
const extras = computed(() => (family.value ? enrichFamily(family.value) : null))

const { space, updateMember } =
  family.value && extras.value ? useFamilySpace(currentUser.value.email, family.value, extras.value) : { space: null }

const member = computed(() => space?.members.find((m) => m.id === route.params.id) ?? null)
const father = computed(() => {
  const parent = space?.members.find((m) => m.id === member.value?.parentId)
  return parent && parent.sex === 'M' ? parent : null
})
const mother = computed(() => {
  const parent = space?.members.find((m) => m.id === member.value?.parentId)
  return parent && parent.sex !== 'M' ? parent : null
})
const otherParentPartner = computed(() => {
  const parent = space?.members.find((m) => m.id === member.value?.parentId)
  return parent?.spouseInfo ?? null
})
const realChildren = computed(() => space?.members.filter((m) => m.parentId === member.value?.id) ?? [])
const children = computed(() => {
  const override = member.value?.familyLinksOverride?.children
  if (override) return override.map((c) => ({ id: null, name: c.name, years: c.years, photo: c.photo ?? null }))
  return realChildren.value
})
const treeParent = computed(() => space?.members.find((m) => m.id === member.value?.parentId) ?? null)
const treeSiblings = computed(() =>
  member.value ? space?.members.filter((m) => m.parentId === member.value.parentId && m.id !== member.value.id) ?? [] : []
)

function spouseName(m) {
  return m?.spouse ?? m?.spouseInfo?.name ?? null
}

function age(m) {
  if (!m) return null
  const end = m.deathYear ?? new Date().getFullYear()
  return end - m.birthYear
}

const milestoneIcons = { gift: 'gift', file: 'file', star: 'star', building: 'building', clock: 'clock', users: 'users' }
const ordinals = { 1: '1ʳᵉ', 2: '2ᵉ', 3: '3ᵉ', 4: '4ᵉ', 5: '5ᵉ' }

const activeTab = ref('info')
const tabs = computed(() => [
  { id: 'info', label: 'Informations', icon: 'file', count: null },
  { id: 'medias', label: 'Médias', icon: 'image', count: space?.photos.length ?? 0 },
  { id: 'documents', label: 'Documents', icon: 'folder', count: space?.documents.length ?? 0 },
  { id: 'anecdotes', label: 'Anecdotes', icon: 'help', count: storiesForMember.value.length },
  { id: 'evenements', label: 'Événements', icon: 'calendar', count: member.value?.milestones.length ?? 0 },
])

const photosForMember = computed(() => space?.photos ?? [])
const docsForMember = computed(() => space?.documents ?? [])
const storiesForMember = computed(() => space?.stories.filter((s) => !s.authorId || s.authorId === member.value?.id) ?? [])

const carouselIndex = ref(0)
const currentPhoto = computed(() => photosForMember.value[carouselIndex.value] ?? null)
function prevPhoto() {
  if (!photosForMember.value.length) return
  carouselIndex.value = (carouselIndex.value - 1 + photosForMember.value.length) % photosForMember.value.length
}
function nextPhoto() {
  if (!photosForMember.value.length) return
  carouselIndex.value = (carouselIndex.value + 1) % photosForMember.value.length
}

const editing = ref(false)
function submitEdit(payload) {
  updateMember(member.value.id, payload)
  editing.value = false
}
</script>

<template>
  <div v-if="family && extras && space && member" class="dashboard">
    <div class="container dashboard-layout">
      <DashboardSidebar :family="family" :extras="extras" active-id="membres" />

      <main class="dashboard-main">
        <div class="member-breadcrumb">
          <RouterLink to="/mon-espace">Ma famille</RouterLink>
          <span>›</span>
          <RouterLink to="/mon-espace/membres">Membres</RouterLink>
          <span>›</span>
          <span>{{ member.name }}</span>
        </div>

        <div class="member-toolbar">
          <button type="button" class="btn btn-light" @click="router.back()"><Icon name="chevronLeft" /> Retour à la liste</button>
          <button type="button" class="btn btn-yellow" @click="editing = true">Modifier le membre ✏</button>
        </div>

        <div class="member-layout">
          <div class="dashboard-card member-header-card">
            <img class="member-photo" :src="member.photo" :alt="member.name">
            <div class="member-header-info">
              <div class="member-name-row">
                <h2>{{ member.name }}</h2>
                <span class="story-count">{{ ordinals[member.generation] ?? member.generation + 'e' }} génération</span>
              </div>
              <div class="member-dates-row">
                <span><Icon name="calendar" /> {{ member.birthDateFull ?? member.birthYear }}</span>
                <span><Icon name="anchor" /> {{ member.birthPlaceFull ?? member.birthPlace }}</span>
                <span v-if="member.deathYear"><Icon name="star" /> {{ member.deathDateFull ?? member.deathYear }}</span>
              </div>

              <div class="member-fact-grid">
                <div><small>Alias</small><strong>{{ member.alias }}</strong></div>
                <div><small>Profession</small><strong>{{ member.profession }}</strong></div>
                <div><small>Langue</small><strong>{{ member.languages?.join(', ') }}</strong></div>
              </div>

              <div v-if="spouseName(member)" class="member-spouse-chip">
                <img v-if="member.spouseInfo?.photo" :src="member.spouseInfo.photo" :alt="spouseName(member)">
                <div><strong>{{ spouseName(member) }}</strong><small v-if="member.spouseInfo?.years">{{ member.spouseInfo.years }}</small></div>
              </div>

              <div v-if="children.length" class="member-children-row">
                <small>Enfants</small>
                <div class="member-children-avatars">
                  <template v-for="c in children.slice(0, 5)" :key="c.id ?? c.name">
                    <RouterLink v-if="c.id" :to="`/mon-espace/membre/${c.id}`">
                      <img :src="c.photo" :alt="c.name">
                    </RouterLink>
                    <span v-else-if="c.photo" class="member-child-avatar" :title="c.name"><img :src="c.photo" :alt="c.name"></span>
                    <span v-else class="member-child-chip">{{ c.name }}</span>
                  </template>
                  <span v-if="children.length > 5" class="member-children-more">+{{ children.length - 5 }}</span>
                </div>
              </div>
            </div>

            <div class="member-about-box">
              <h4>À propos de {{ member.name.split(' ')[0] }}</h4>
              <p>{{ member.bio }}</p>
              <div class="member-traits">
                <span v-for="(t, i) in member.traits" :key="i" class="member-trait">● {{ t }}</span>
              </div>
            </div>
          </div>

          <aside class="member-side-col">
            <div class="dashboard-card">
              <h4>Liens familiaux</h4>
              <div class="member-links">
                <template v-if="father || otherParentPartner">
                  <small class="member-link-label">Père</small>
                  <RouterLink v-if="father" :to="`/mon-espace/membre/${father.id}`" class="member-link-card">
                    <img :src="father.photo" :alt="father.name"><div><strong>{{ father.name }}</strong><small>{{ father.years }}</small></div><Icon name="chevronLeft" class="chevron-right" />
                  </RouterLink>
                  <div v-else-if="otherParentPartner" class="member-link-card static">
                    <img :src="otherParentPartner.photo" :alt="otherParentPartner.name"><div><strong>{{ otherParentPartner.name }}</strong><small>{{ otherParentPartner.years }}</small></div>
                    <Icon name="chevronLeft" class="chevron-right" />
                  </div>
                </template>
                <template v-if="mother || otherParentPartner">
                  <small class="member-link-label">Mère</small>
                  <RouterLink v-if="mother" :to="`/mon-espace/membre/${mother.id}`" class="member-link-card">
                    <img :src="mother.photo" :alt="mother.name"><div><strong>{{ mother.name }}</strong><small>{{ mother.years }}</small></div><Icon name="chevronLeft" class="chevron-right" />
                  </RouterLink>
                  <div v-else-if="otherParentPartner" class="member-link-card static">
                    <img :src="otherParentPartner.photo" :alt="otherParentPartner.name"><div><strong>{{ otherParentPartner.name }}</strong><small>{{ otherParentPartner.years }}</small></div>
                    <Icon name="chevronLeft" class="chevron-right" />
                  </div>
                </template>
                <template v-if="spouseName(member)">
                  <small class="member-link-label">Conjoint(e)</small>
                  <div class="member-link-card static">
                    <img v-if="member.spouseInfo?.photo" :src="member.spouseInfo.photo" :alt="spouseName(member)">
                    <div><strong>{{ spouseName(member) }}</strong><small v-if="member.spouseInfo?.years">{{ member.spouseInfo.years }}</small></div>
                    <Icon name="chevronLeft" class="chevron-right" />
                  </div>
                </template>
                <template v-if="children.length">
                  <small class="member-link-label">Enfants ({{ children.length }})</small>
                  <template v-for="c in children.slice(0, 4)" :key="c.id ?? c.name">
                    <RouterLink v-if="c.id" :to="`/mon-espace/membre/${c.id}`" class="member-link-card compact">
                      <span>{{ c.name }}</span><small>{{ c.birthYear }} – {{ c.deathYear ?? '' }}</small>
                    </RouterLink>
                    <div v-else class="member-link-card compact static">
                      <span>{{ c.name }}</span><small>{{ c.years }}</small>
                    </div>
                  </template>
                  <RouterLink to="/mon-espace/membres" class="dashboard-add-link">Voir tous les enfants →</RouterLink>
                </template>
              </div>
            </div>
          </aside>
        </div>

        <div class="dashboard-card member-tabs-card">
          <div class="member-tabs">
            <button
              v-for="tab in tabs" :key="tab.id" type="button"
              class="member-tab" :class="{ active: activeTab === tab.id }"
              @click="activeTab = tab.id"
            >
              <Icon :name="tab.icon" /> {{ tab.label }}<span v-if="tab.count !== null">&nbsp;({{ tab.count }})</span>
            </button>
          </div>

          <div v-if="activeTab === 'info'" class="member-tab-panel">
            <div class="member-info-columns">
              <div>
                <h4>Informations personnelles</h4>
                <div class="panel-keyinfo">
                  <div><span>Nom complet</span><strong>{{ member.name }}</strong></div>
                  <div><span>Date de naissance</span><strong>{{ member.birthYear }}</strong></div>
                  <div><span>Lieu de naissance</span><strong>{{ member.birthPlace }}</strong></div>
                  <div><span>Date de décès</span><strong>{{ member.deathYear ?? 'Vivant·e' }}</strong></div>
                  <div v-if="member.deathPlace"><span>Lieu de décès</span><strong>{{ member.deathPlace }}</strong></div>
                  <div><span>Sexe</span><strong>{{ member.sex === 'M' ? 'Homme' : 'Femme' }}</strong></div>
                  <div><span>Langues parlées</span><strong>{{ member.languages?.join(', ') }}</strong></div>
                  <div><span>Religion</span><strong>{{ member.religion }}</strong></div>
                </div>
              </div>

              <div>
                <h4>Repères clés</h4>
                <div class="member-milestones">
                  <div class="member-milestone" v-for="(ms, i) in member.milestones" :key="i">
                    <span class="member-milestone-icon"><Icon :name="milestoneIcons[ms.icon] ?? 'star'" /></span>
                    <div><strong>{{ ms.year }}</strong><p>{{ ms.text }}</p></div>
                  </div>
                </div>
              </div>

              <div>
                <div class="dashboard-card-head"><h4>Photos ({{ photosForMember.length }})</h4><RouterLink to="/mon-espace#photos" class="dashboard-add-link">Voir tout →</RouterLink></div>
                <div v-if="currentPhoto" class="member-carousel">
                  <button v-if="photosForMember.length > 1" type="button" class="member-carousel-arrow prev" @click="prevPhoto" aria-label="Photo précédente"><Icon name="chevronLeft" /></button>
                  <img class="member-carousel-photo" :src="currentPhoto.src" :alt="currentPhoto.caption">
                  <button v-if="photosForMember.length > 1" type="button" class="member-carousel-arrow next" @click="nextPhoto" aria-label="Photo suivante"><Icon name="chevronLeft" /></button>
                </div>
                <div v-if="photosForMember.length > 1" class="member-carousel-dots">
                  <button
                    v-for="(p, i) in photosForMember" :key="p.id" type="button"
                    class="member-carousel-dot" :class="{ active: i === carouselIndex }"
                    @click="carouselIndex = i" :aria-label="`Photo ${i + 1}`"
                  ></button>
                </div>
                <p v-if="!photosForMember.length" class="dashboard-empty">Aucune photo pour l'instant.</p>
                <div class="dashboard-card-head member-doc-head"><h4>Documents ({{ docsForMember.length }})</h4><RouterLink to="/mon-espace#documents" class="dashboard-add-link">Voir tout →</RouterLink></div>
                <div class="member-doc-grid">
                  <div class="dashboard-doc" v-for="d in docsForMember.slice(0, 3)" :key="d.id">
                    <img :src="d.src" :alt="d.title">
                    <strong>{{ d.title }}</strong>
                    <small>{{ d.type }} · {{ ((d.src.length * 37) % 900 + 100) }} Ko</small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else-if="activeTab === 'medias'" class="member-tab-panel">
            <div class="dashboard-photo-rail">
              <img v-for="p in photosForMember" :key="p.id" :src="p.src" :alt="p.caption">
            </div>
            <p v-if="!photosForMember.length" class="dashboard-empty">Aucune photo pour l'instant.</p>
          </div>

          <div v-else-if="activeTab === 'documents'" class="member-tab-panel">
            <div class="dashboard-doc-grid">
              <div class="dashboard-doc" v-for="d in docsForMember" :key="d.id">
                <img :src="d.src" :alt="d.title">
                <strong>{{ d.title }}</strong>
                <small>{{ d.year }}</small>
              </div>
            </div>
            <p v-if="!docsForMember.length" class="dashboard-empty">Aucun document pour l'instant.</p>
          </div>

          <div v-else-if="activeTab === 'anecdotes'" class="member-tab-panel">
            <div class="dashboard-story" v-for="s in storiesForMember" :key="s.id">
              <strong>{{ s.title }}</strong>
              <small>Récit de {{ s.author }}</small>
              <p>{{ s.text }}</p>
            </div>
            <p v-if="!storiesForMember.length" class="dashboard-empty">Aucune anecdote pour l'instant.</p>
          </div>

          <div v-else-if="activeTab === 'evenements'" class="member-tab-panel">
            <div class="member-milestones">
              <div class="member-milestone" v-for="(ms, i) in member.milestones" :key="i">
                <span class="member-milestone-icon"><Icon :name="milestoneIcons[ms.icon] ?? 'star'" /></span>
                <div><strong>{{ ms.year }}</strong><p>{{ ms.text }}</p></div>
              </div>
            </div>
          </div>
        </div>

        <div class="dashboard-card member-tree-full">
          <h4>Membre dans l'arbre</h4>
          <div class="member-tree-preview">
            <RouterLink v-if="treeParent" :to="`/mon-espace/membre/${treeParent.id}`" class="tree-node-mini small-preview">
              <span class="tree-node-mini-photo"><img :src="treeParent.photo" :alt="treeParent.name"></span>
              <strong>{{ treeParent.name }}</strong><small>{{ treeParent.years }}</small>
            </RouterLink>
            <div class="tree-node-mini small-preview current">
              <span class="tree-node-mini-photo"><img :src="member.photo" :alt="member.name"></span>
              <strong>{{ member.name }}</strong><small>{{ member.years }}</small>
            </div>
            <div class="member-tree-preview-children" v-if="children.length">
              <template v-for="c in children.slice(0, 2)" :key="c.id ?? c.name">
                <RouterLink v-if="c.id" :to="`/mon-espace/membre/${c.id}`" class="tree-node-mini small-preview">
                  <span class="tree-node-mini-photo"><img :src="c.photo" :alt="c.name"></span>
                  <strong>{{ c.name }}</strong><small>{{ c.birthYear }}</small>
                </RouterLink>
                <div v-else class="tree-node-mini small-preview">
                  <span class="tree-node-mini-photo"><img :src="c.photo" :alt="c.name"></span>
                  <strong>{{ c.name }}</strong><small>{{ c.years }}</small>
                </div>
              </template>
            </div>
          </div>
          <RouterLink :to="{ path: '/mon-espace/arbre', query: { person: member.id } }" class="dashboard-add-link">Voir dans l'arbre généalogique →</RouterLink>
        </div>
      </main>
    </div>

    <QuickAddModal v-if="editing" type="edit-member" :initial="member" @close="editing = false" @submit="submitEdit" />
  </div>

  <section v-else class="section">
    <div class="container login-wrap">
      <div class="login-card">
        <div class="eyebrow">Membre introuvable</div>
        <h2>Ce membre n'existe pas ou plus.</h2>
        <RouterLink class="btn btn-yellow login-submit" to="/mon-espace/membres">Retour à la liste →</RouterLink>
      </div>
    </div>
  </section>
</template>
