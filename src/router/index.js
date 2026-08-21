import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import RegisterView from '../views/RegisterView.vue'
import LoginView from '../views/LoginView.vue'
import SearchView from '../views/SearchView.vue'
import FamilyView from '../views/FamilyView.vue'
import { useAuth } from '../store/auth.js'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/inscription', name: 'register', component: RegisterView },
    { path: '/connexion', name: 'login', component: LoginView },
    { path: '/recherche', name: 'search', component: SearchView, meta: { requiresAuth: true } },
    { path: '/famille/:slug', name: 'family', component: FamilyView, meta: { requiresAuth: true } },
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
