import { createRouter, createWebHistory } from 'vue-router'
import Home from '../components/Home.vue'
import Login from '../components/auth/Login.vue'
import Register from '../components/auth/Register.vue'
import BibleReader from '../components/bible/BibleReader.vue'
import BibleSearch from '../components/bible/BibleSearch.vue'
import StudyTools from '../components/study/StudyTools.vue'

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
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router