<script setup>
import { computed, ref, onMounted, nextTick, watch, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth } from '../store/auth.js'
import { getOrCreateFamily } from '../data/familyDirectory.js'
import { enrichFamily } from '../data/familyProfileExtras.js'
import { useFamilySpace } from '../store/familySpace.js'
import DashboardSidebar from '../components/DashboardSidebar.vue'
import QuickAddModal from '../components/QuickAddModal.vue'
import Icon from '../components/Icon.vue'

const route = useRoute()
const { currentUser } = useAuth()

const family = computed(() => getOrCreateFamily(currentUser.value?.familyName ?? ''))
const extras = computed(() => (family.value ? enrichFamily(family.value) : null))

const { space, updateMember, addMember, addStory } =
  family.value && extras.value ? useFamilySpace(currentUser.value.email, family.value, extras.value) : { space: null }

const sidebarCollapsed = ref(false)
const selectedId = ref(route.query.person ?? null)
const selected = computed(() => space?.members.find((m) => m.id === selectedId.value) ?? null)
const noMoreGenerations = ref(false)

const zoom = ref(100)
function zoomOut() { zoom.value = Math.max(60, zoom.value - 10) }
function zoomIn() { zoom.value = Math.min(150, zoom.value + 10) }
const expanded = ref(false)
function toggleExpand() {
  expanded.value = !expanded.value
  sidebarCollapsed.value = expanded.value
}

const canvasRef = ref(null)
const nodeRefs = ref({})
const connectors = ref([])
const canvasSize = ref({ width: 0, height: 0 })

function setNodeRef(id, el) {
  if (el) nodeRefs.value[id] = el
}

async function computeConnectors() {
  await nextTick()
  const canvas = canvasRef.value
  if (!canvas || !space) return
  const canvasBox = canvas.getBoundingClientRect()
  canvasSize.value = { width: canvas.scrollWidth, height: canvas.scrollHeight }

  // Group children by parent, then draw one classic "elbow" connector per
  // parent: a trunk down from the parent, a horizontal bus spanning the
  // children, and a drop into each child — instead of a straight line per
  // child, which fans out and crosses when siblings aren't perfectly
  // centered under their parent.
  const byParent = {}
  for (const m of space.members) {
    if (!m.parentId) continue
    ;(byParent[m.parentId] ??= []).push(m)
  }

  const paths = []
  for (const [parentId, kids] of Object.entries(byParent)) {
    const parentEl = nodeRefs.value[parentId]
    if (!parentEl) continue
    const parentBox = parentEl.getBoundingClientRect()
    const px = parentBox.left + parentBox.width / 2 - canvasBox.left
    const py = parentBox.bottom - canvasBox.top

    const childPositions = kids
      .map((k) => {
        const el = nodeRefs.value[k.id]
        if (!el) return null
        const box = el.getBoundingClientRect()
        return { x: box.left + box.width / 2 - canvasBox.left, y: box.top - canvasBox.top, branch: k.branch }
      })
      .filter(Boolean)
    if (!childPositions.length) continue

    const busY = py + (childPositions[0].y - py) / 2
    const xs = childPositions.map((c) => c.x)
    const minX = Math.min(px, ...xs)
    const maxX = Math.max(px, ...xs)
    const branch = childPositions[0].branch

    let d = `M ${px} ${py} L ${px} ${busY}`
    if (childPositions.length > 1) d += ` M ${minX} ${busY} L ${maxX} ${busY}`
    for (const c of childPositions) d += ` M ${c.x} ${busY} L ${c.x} ${c.y}`
    paths.push({ d, branch })
  }
  connectors.value = paths
}

let resizeHandler
onMounted(() => {
  if (!selectedId.value && space?.members.length) selectedId.value = space.members[0].id
  computeConnectors()
  resizeHandler = () => computeConnectors()
  window.addEventListener('resize', resizeHandler)
})
onBeforeUnmount(() => {
  if (resizeHandler) window.removeEventListener('resize', resizeHandler)
})
watch(() => noMoreGenerations.value, () => computeConnectors())
watch(selected, () => computeConnectors())
watch(() => space?.members.length, () => computeConnectors())
watch(zoom, () => computeConnectors())

function select(member) {
  selectedId.value = member.id
  activePanelTab.value = 'info'
}

const activePanelTab = ref('info')
const panelFather = computed(() => {
  const parent = space?.members.find((m) => m.id === selected.value?.parentId)
  return parent && parent.sex === 'M' ? parent : null
})
const panelMother = computed(() => {
  const parent = space?.members.find((m) => m.id === selected.value?.parentId)
  return parent && parent.sex !== 'M' ? parent : null
})
const panelOtherParent = computed(() => {
  const parent = space?.members.find((m) => m.id === selected.value?.parentId)
  return parent?.spouseInfo ?? null
})
const panelChildren = computed(() => space?.members.filter((m) => m.parentId === selected.value?.id) ?? [])

const generations = computed(() => {
  if (!space) return []
  const set = new Set(space.members.map((m) => m.generation))
  return [...set].sort((a, b) => a - b)
})
function membersOfGen(gen) {
  return space?.members.filter((m) => m.generation === gen) ?? []
}
// Members within a generation are already stored grouped by parent (see
// buildFamilyTree), so clustering consecutive same-parent members keeps each
// family branch visually together instead of spreading siblings across the
// row — which is what made the connector lines fan out and cross.
function clustersOfGen(gen) {
  const members = membersOfGen(gen)
  const clusters = []
  let current = null
  for (const m of members) {
    if (!current || current.parentId !== m.parentId) {
      current = { parentId: m.parentId, members: [] }
      clusters.push(current)
    }
    current.members.push(m)
  }
  return clusters
}
const ordinals = { 1: '1ʳᵉ', 2: '2ᵉ', 3: '3ᵉ', 4: '4ᵉ', 5: '5ᵉ', 6: '6ᵉ' }

function age(member) {
  const end = member.deathYear ?? new Date().getFullYear()
  return end - member.birthYear
}

function spouseName(m) {
  return m.spouse ?? m.spouseInfo?.name ?? null
}

const linkedFamilies = computed(() => {
  if (!space) return 0
  const surnames = space.members
    .map((m) => spouseName(m))
    .filter(Boolean)
    .map((n) => n.trim().split(' ').slice(1).join(' '))
  return new Set(surnames).size
})

const editingMember = ref(null)
function openEdit() {
  editingMember.value = selected.value
}
function closeEdit() {
  editingMember.value = null
}
function submitEdit(payload) {
  updateMember(selectedId.value, payload)
  closeEdit()
}

const sidebarModal = ref(null)
const addChildParent = ref(null)
const sidebarModalTitle = computed(() => (addChildParent.value ? `Compléter la branche de ${addChildParent.value.name}` : null))
function openSidebarModal(type) { sidebarModal.value = type }
function closeSidebarModal() { sidebarModal.value = null; addChildParent.value = null }
function submitSidebarModal(payload) {
  if (sidebarModal.value === 'member') addMember({ ...payload, parentId: addChildParent.value?.id ?? null })
  else if (sidebarModal.value === 'anecdote') addStory(payload)
  closeSidebarModal()
}

function openAddChild(member) {
  addChildParent.value = member
  sidebarModal.value = 'member'
}

function exportTree() {
  if (!space || !family.value) return
  const lines = space.members
    .slice()
    .sort((a, b) => a.generation - b.generation)
    .map((m) => `${'  '.repeat(m.generation - 1)}${m.name} (${m.years})${m.profession ? ' — ' + m.profession : ''}`)
  const content = `Arbre généalogique — Famille ${family.value.name}\n${space.members.length} membres · ${generations.value.length} générations\n\n${lines.join('\n')}`
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `arbre-${family.value.slug}.txt`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div v-if="family && extras && space" class="dashboard">
    <div class="container dashboard-layout" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
      <DashboardSidebar
        v-show="!sidebarCollapsed"
        :family="family"
        :extras="extras"
        active-id="arbre"
        @invite="openSidebarModal('member')"
        @add-souvenir="openSidebarModal('anecdote')"
      />

      <button
        type="button"
        class="sidebar-collapse-btn"
        :class="{ collapsed: sidebarCollapsed }"
        :aria-label="sidebarCollapsed ? 'Afficher le menu' : 'Masquer le menu'"
        @click="sidebarCollapsed = !sidebarCollapsed"
      >
        <Icon name="chevronLeft" />
      </button>

      <main class="dashboard-main">
        <div class="tree-page-head">
          <div>
            <h2>Arbre généalogique <span class="tree-privacy"><Icon name="lock" /> Privé</span></h2>
          </div>
          <button type="button" class="btn btn-light" @click="exportTree"><Icon name="file" /> Exporter l'arbre</button>
        </div>

        <div class="tree-page-controls">
          <div class="tree-controls">
            <span class="tree-view-label">Vue par générations</span>
            <span class="tree-zoom">
              <button type="button" aria-label="Réduire" @click="zoomOut">−</button>
              {{ zoom }}%
              <button type="button" aria-label="Agrandir" @click="zoomIn">+</button>
            </span>
            <button type="button" class="tree-expand" :aria-label="expanded ? 'Réduire' : 'Agrandir la vue'" @click="toggleExpand">⤢</button>
          </div>
          <div class="tree-page-stats">
            <span><Icon name="star" /> {{ generations.length }} générations</span>
            <span><Icon name="users" /> {{ space.members.length }} membres</span>
          </div>
        </div>

        <div class="tree-page-body" :class="{ 'has-panel': selected }">
          <div class="tree-full">
            <div class="tree-bg-art" aria-hidden="true">
              <svg viewBox="0 0 400 800" preserveAspectRatio="xMidYMid slice">
                <path d="M200 800 V500 M200 500 C200 420 120 400 90 320 M200 500 C200 420 280 400 310 320 M200 400 C200 340 150 320 130 260 M200 400 C200 340 250 320 270 260 M90 320 C70 280 40 270 20 220 M310 320 C330 280 360 270 380 220 M130 260 C115 220 90 210 70 170 M270 260 C285 220 310 210 330 170" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
              </svg>
            </div>

            <div class="tree-canvas" ref="canvasRef" :style="{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }">
              <svg class="tree-connectors" :width="canvasSize.width" :height="canvasSize.height">
                <path
                  v-for="(line, i) in connectors"
                  :key="i"
                  :d="line.d"
                  fill="none"
                  :class="`connector-${line.branch}`"
                />
              </svg>

              <div class="tree-gen-row" v-for="gen in generations" :key="gen" :style="{ '--gen-delay': `${(gen - 1) * 0.12}s` }">
                <div class="tree-gen-label">{{ ordinals[gen] ?? gen + 'e' }} génération</div>
                <div class="tree-gen-nodes">
                  <div class="tree-node-cluster" v-for="cluster in clustersOfGen(gen)" :key="cluster.parentId ?? 'root'">
                    <div class="tree-node-wrap" v-for="m in cluster.members" :key="m.id">
                      <button
                        type="button"
                        :ref="(el) => setNodeRef(m.id, el)"
                        class="tree-node-mini"
                        :class="[`branch-${m.branch}`, `gen-${gen}`, { selected: selectedId === m.id }]"
                        @click="select(m)"
                      >
                        <span class="tree-node-mini-photo"><img :src="m.photo" :alt="m.name"></span>
                        <span class="tree-node-mini-text">
                          <strong>{{ m.name }}</strong>
                          <small>{{ m.years }}</small>
                          <small class="tree-node-mini-city">{{ m.place }}</small>
                        </span>
                        <span class="tree-leaf-icon">🍃</span>
                      </button>
                      <button
                        type="button"
                        class="tree-node-add-child"
                        :aria-label="`Ajouter un membre oublié sous ${m.name}`"
                        :title="`Ajouter un membre oublié sous ${m.name}`"
                        @click="openAddChild(m)"
                      >+</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button type="button" class="btn btn-light tree-more-gens" v-if="!noMoreGenerations" @click="noMoreGenerations = true">
              Voir les générations suivantes ⌄
            </button>
            <p v-else class="dashboard-empty tree-more-gens-note">
              Vous avez atteint la dernière génération enregistrée. Ajoutez un membre pour continuer l'arbre.
            </p>
          </div>

          <aside v-if="selected" class="tree-detail-panel">
            <div class="panel-photo-wrap">
              <img class="panel-photo" :src="selected.photo" :alt="selected.name">
              <button type="button" class="panel-close" @click="selectedId = null">✕</button>
            </div>
            <h3>{{ selected.name }}</h3>
            <small>{{ selected.years }} ({{ age(selected) }} ans)</small>
            <span class="story-count panel-badge">
              {{ selected.branch === 'founder' ? 'Ancêtre fondateur' : selected.branch === 'paternal' ? 'Branche paternelle' : selected.branch === 'maternal' ? 'Branche maternelle' : 'Informations incomplètes' }}
            </span>

            <div class="panel-info-rows">
              <div><span>Origine</span><strong>{{ selected.birthPlace }}</strong></div>
              <div><span>Langue</span><strong>{{ extras.language }}</strong></div>
              <div><span>Profession</span><strong>{{ selected.profession }}</strong></div>
              <div><span>Conjoint(e)</span><strong>{{ spouseName(selected) ?? '—' }}</strong></div>
              <div><span>Enfants</span><strong>{{ selected.childrenCount }}</strong></div>
            </div>

            <div class="panel-tabs">
              <button type="button" :class="{ active: activePanelTab === 'info' }" aria-label="Informations" @click="activePanelTab = 'info'"><Icon name="file" /></button>
              <button type="button" :class="{ active: activePanelTab === 'family' }" aria-label="Liens familiaux" @click="activePanelTab = 'family'"><Icon name="users" /></button>
              <button type="button" :class="{ active: activePanelTab === 'photos' }" aria-label="Photos" @click="activePanelTab = 'photos'"><Icon name="image" /></button>
              <button type="button" :class="{ active: activePanelTab === 'documents' }" aria-label="Documents" @click="activePanelTab = 'documents'"><Icon name="folder" /></button>
              <button type="button" :class="{ active: activePanelTab === 'milestones' }" aria-label="Repères clés" @click="activePanelTab = 'milestones'"><Icon name="help" /></button>
            </div>

            <template v-if="activePanelTab === 'info'">
              <div class="panel-section">
                <h4>À propos</h4>
                <p>{{ selected.bio }}</p>
              </div>

              <div class="panel-section panel-keyinfo">
                <h4>Informations clés</h4>
                <div><span>Date de naissance</span><strong>~{{ selected.birthYear }}</strong></div>
                <div><span>Lieu de naissance</span><strong>{{ selected.birthPlace }}</strong></div>
                <div><span>Date de décès</span><strong>{{ selected.deathYear ?? 'Vivant·e' }}</strong></div>
                <div><span>Lieu de décès</span><strong>{{ selected.deathPlace ?? '—' }}</strong></div>
              </div>
            </template>

            <div v-else-if="activePanelTab === 'family'" class="panel-section">
              <h4>Liens familiaux</h4>
              <div class="member-links">
                <template v-if="panelFather || panelOtherParent">
                  <small class="member-link-label">Père</small>
                  <RouterLink v-if="panelFather" :to="`/mon-espace/membre/${panelFather.id}`" class="member-link-card">
                    <img :src="panelFather.photo" :alt="panelFather.name"><div><strong>{{ panelFather.name }}</strong><small>{{ panelFather.years }}</small></div>
                  </RouterLink>
                  <div v-else class="member-link-card static">
                    <img :src="panelOtherParent.photo" :alt="panelOtherParent.name"><div><strong>{{ panelOtherParent.name }}</strong><small>{{ panelOtherParent.years }}</small></div>
                  </div>
                </template>
                <template v-if="panelMother || panelOtherParent">
                  <small class="member-link-label">Mère</small>
                  <RouterLink v-if="panelMother" :to="`/mon-espace/membre/${panelMother.id}`" class="member-link-card">
                    <img :src="panelMother.photo" :alt="panelMother.name"><div><strong>{{ panelMother.name }}</strong><small>{{ panelMother.years }}</small></div>
                  </RouterLink>
                  <div v-else class="member-link-card static">
                    <img :src="panelOtherParent.photo" :alt="panelOtherParent.name"><div><strong>{{ panelOtherParent.name }}</strong><small>{{ panelOtherParent.years }}</small></div>
                  </div>
                </template>
                <template v-if="spouseName(selected)">
                  <small class="member-link-label">Conjoint(e)</small>
                  <div class="member-link-card static">
                    <img v-if="selected.spouseInfo?.photo" :src="selected.spouseInfo.photo" :alt="spouseName(selected)">
                    <div><strong>{{ spouseName(selected) }}</strong><small v-if="selected.spouseInfo?.years">{{ selected.spouseInfo.years }}</small></div>
                  </div>
                </template>
                <template v-if="panelChildren.length">
                  <small class="member-link-label">Enfants ({{ panelChildren.length }})</small>
                  <RouterLink v-for="c in panelChildren" :key="c.id" :to="`/mon-espace/membre/${c.id}`" class="member-link-card compact">
                    <span>{{ c.name }}</span><small>{{ c.birthYear }} – {{ c.deathYear ?? '' }}</small>
                  </RouterLink>
                </template>
                <p v-if="!panelFather && !panelMother && !panelOtherParent && !spouseName(selected) && !panelChildren.length" class="dashboard-empty">Aucun lien familial enregistré.</p>
                <button type="button" class="btn btn-light panel-complete-branch" @click="openAddChild(selected)">
                  <Icon name="users" /> Compléter la branche — ajouter un enfant
                </button>
              </div>
            </div>

            <div v-else-if="activePanelTab === 'photos'" class="panel-section">
              <h4>Photos</h4>
              <div v-if="space.photos.length" class="member-media-rail">
                <img v-for="p in space.photos.slice(0, 6)" :key="p.id" :src="p.src" :alt="p.caption">
              </div>
              <p v-else class="dashboard-empty">Aucune photo pour l'instant.</p>
            </div>

            <div v-else-if="activePanelTab === 'documents'" class="panel-section">
              <h4>Documents</h4>
              <div v-if="space.documents.length" class="member-doc-grid">
                <div class="dashboard-doc" v-for="d in space.documents.slice(0, 4)" :key="d.id">
                  <img :src="d.src" :alt="d.title">
                  <strong>{{ d.title }}</strong>
                </div>
              </div>
              <p v-else class="dashboard-empty">Aucun document pour l'instant.</p>
            </div>

            <div v-else-if="activePanelTab === 'milestones'" class="panel-section">
              <h4>Repères clés</h4>
              <div v-if="selected.milestones?.length" class="member-milestones">
                <div class="member-milestone" v-for="(ms, i) in selected.milestones" :key="i">
                  <span class="member-milestone-icon"><Icon :name="['gift','file','star','building','clock','users'].includes(ms.icon) ? ms.icon : 'star'" /></span>
                  <div><strong>{{ ms.year }}</strong><p>{{ ms.text }}</p></div>
                </div>
              </div>
              <p v-else class="dashboard-empty">Aucun repère enregistré.</p>
            </div>

            <RouterLink :to="`/mon-espace/membre/${selected.id}`" class="btn btn-light panel-edit">Voir la fiche complète →</RouterLink>
            <button type="button" class="btn btn-yellow panel-edit" @click="openEdit">Modifier les informations ✏</button>
          </aside>
        </div>

        <div class="tree-page-summary">
          <div class="summary-card"><strong>{{ space.members.length }}</strong><span>Membres</span></div>
          <div class="summary-card"><strong>{{ generations.length }}</strong><span>Générations</span></div>
          <div class="summary-card"><strong>{{ linkedFamilies }}</strong><span>Familles liées</span></div>
          <div class="summary-card"><strong>{{ extras.localities[0] }}</strong><span>Lieu d'origine</span></div>
          <div class="summary-card"><strong>{{ extras.language }}</strong><span>Langue historique</span></div>
        </div>

        <div class="tree-legend">
          <span><i class="legend-dot founder"></i>Ancêtre fondateur</span>
          <span><i class="legend-dot paternal"></i>Branche paternelle</span>
          <span><i class="legend-dot maternal"></i>Branche maternelle</span>
          <span><i class="legend-dot incomplete"></i>Informations incomplètes</span>
        </div>
      </main>
    </div>

    <QuickAddModal v-if="editingMember" type="edit-member" :initial="editingMember" @close="closeEdit" @submit="submitEdit" />
    <QuickAddModal v-if="sidebarModal" :type="sidebarModal" :header-title="sidebarModalTitle" @close="closeSidebarModal" @submit="submitSidebarModal" />
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
