import { createRouter, createWebHistory } from 'vue-router'
import Home from '../components/Home.vue'
import Login from '../components/auth/Login.vue'
import Register from '../components/auth/Register.vue'
import BibleReader from '../components/bible/BibleReader.vue'
import BibleSearch from '../components/bible/BibleSearch.vue'
import StudyTools from '../components/study/StudyTools.vue'
import Lexicon from '../components/Lexicon.vue'
import WordStudies from '../components/WordStudies.vue'

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
    component: StudyTools
  },
  {
    path: '/lexicon',
    name: 'Lexicon',
    component: Lexicon
  },
  {
    path: '/word-studies',
    name: 'WordStudies',
    component: WordStudies
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router