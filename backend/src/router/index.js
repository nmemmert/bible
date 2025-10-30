import { createRouter, createWebHistory } from 'vue-router'
import Home from '../components/Home.vue'
import Login from '../components/auth/Login.vue'
import Register from '../components/auth/Register.vue'
import BibleReader from '../components/bible/BibleReader.vue'
import BibleSearch from '../components/bible/BibleSearch.vue'
import StudyTools from '../components/study/StudyTools.vue'
import Lexicon from '../components/Lexicon.vue'
import WordStudies from '../components/WordStudies.vue'
import Resources from '../components/Resources.vue'
import Profile from '../components/Profile.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path: '/bible/:version?/:book?/:chapter?',
    name: 'BibleReader',
    component: BibleReader,
    props: true
  },
  {
    path: '/search',
    name: 'BibleSearch',
    component: BibleSearch
  },
  {
    path: '/study',
    name: 'StudyTools',
    component: StudyTools,
    meta: { requiresAuth: true }
  },
  {
    path: '/lexicon',
    name: 'Lexicon',
    component: Lexicon
  },
  {
    path: '/word-studies',
    name: 'WordStudies',
    component: WordStudies,
    meta: { requiresAuth: true }
  },
  {
    path: '/resources',
    name: 'Resources',
    component: Resources,
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard for authentication
router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('authToken')
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  if (requiresAuth && !isAuthenticated) {
    // Redirect to login with return path
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  } else {
    next()
  }
})

export default router