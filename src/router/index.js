import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import RegisterView from '../views/RegisterView.vue'
import LoginView from '../views/LoginView.vue'
import SearchView from '../views/SearchView.vue'
import FamilyView from '../views/FamilyView.vue'
import DashboardView from '../views/DashboardView.vue'
import TreeView from '../views/TreeView.vue'
import MembersListView from '../views/MembersListView.vue'
import MemberView from '../views/MemberView.vue'
import StoriesView from '../views/StoriesView.vue'
import MemoriesView from '../views/MemoriesView.vue'
import TimelineView from '../views/TimelineView.vue'
import DocumentsView from '../views/DocumentsView.vue'
import FamiliesDirectoryView from '../views/FamiliesDirectoryView.vue'
import { useAuth } from '../store/auth.js'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/inscription', name: 'register', component: RegisterView },
    { path: '/connexion', name: 'login', component: LoginView },
    { path: '/recherche', name: 'search', component: SearchView, meta: { requiresAuth: true } },
    { path: '/famille/:slug', name: 'family', component: FamilyView, meta: { requiresAuth: true } },
    { path: '/mon-espace', name: 'dashboard', component: DashboardView, meta: { requiresAuth: true, layout: 'dashboard' } },
    { path: '/mon-espace/arbre', name: 'tree', component: TreeView, meta: { requiresAuth: true, layout: 'dashboard' } },
    { path: '/mon-espace/membres', name: 'members', component: MembersListView, meta: { requiresAuth: true, layout: 'dashboard' } },
    { path: '/mon-espace/membre/:id', name: 'member', component: MemberView, meta: { requiresAuth: true, layout: 'dashboard' } },
    { path: '/mon-espace/histoires', name: 'stories', component: StoriesView, meta: { requiresAuth: true, layout: 'dashboard' } },
    { path: '/mon-espace/souvenirs', name: 'memories', component: MemoriesView, meta: { requiresAuth: true, layout: 'dashboard' } },
    { path: '/mon-espace/chronologie', name: 'timeline', component: TimelineView, meta: { requiresAuth: true, layout: 'dashboard' } },
    { path: '/mon-espace/documents', name: 'documents', component: DocumentsView, meta: { requiresAuth: true, layout: 'dashboard' } },
    { path: '/familles', name: 'directory', component: FamiliesDirectoryView },
  ],
  scrollBehavior(to) {
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth' }
    }
    return { top: 0 }
  },
})

router.beforeEach((to) => {
  if (to.meta.requiresAuth) {
    const { isAuthenticated } = useAuth()
    if (!isAuthenticated.value) {
      return { name: 'register', query: { redirect: to.fullPath } }
    }
  }
})

export default router
