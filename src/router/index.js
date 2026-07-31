import { createRouter, createWebHistory } from 'vue-router'
import { auth } from '../firebase'

import Login from '../views/LoginPage.vue'
import Dashboard from '../views/DashboardPage.vue'
import Products from '../views/ProductsPage.vue'
import Entries from '../views/EntriesPage.vue'
import Sales from '../views/SalesPage.vue'
import Comptabilite from '../views/ComptaPge.vue'
import loadingPage from '../views/LoadingPage.vue'
import Clients from '../views/ClientsPage.vue'
import BarSales from '../views/BarSales.vue'
import BarStockBar from '../views/BarStock.vue'

import Register from '../views/RegisterPage.vue'
import Suppliers from '../views/SuppliersPage.vue'

const routes = [
  { path: '/lod', component: loadingPage },
  { path: '/', component: Login },
  { path: '/barStock', component: BarStockBar },
  { path: '/barSale', component: BarSales },
  { path: '/dashboard', component: Dashboard },
  { path: '/register', component: Register},
  { path: '/products', component: Products },
  { path: '/compt', component: Comptabilite },
  { path: '/entries', component: Entries },
  { path: '/sales', component: Sales },
  { path: '/clients', component: Clients },
  { path: '/suppliers', component: Suppliers },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, _, next) => {
  if (to.meta.auth && !auth.currentUser) next('/')
  else next()
})

export default router
