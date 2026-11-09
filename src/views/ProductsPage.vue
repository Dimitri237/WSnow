
<template>
  <Navbar />
  <Sidebar />

  <main class="page">

    <!-- HEADER -->
    <header class="page-header">
      <div class="header-content">
        <div class="header-icon">▤</div>
        <div>
          <span class="eyebrow">GESTION COMMERCIALE</span>
          <h1>Gestion des produits</h1>
          <p>Gérez votre catalogue, vos prix et les disponibilités en stock.</p>
        </div>
      </div>

      <div class="header-date">
        <span class="date-dot"></span>
        Catalogue des produits
      </div>
    </header>

    <!-- STATISTIQUES -->
    <section class="stats-grid">

      <div class="stat-card">
        <div class="stat-top">
          <span class="stat-label">Total des produits</span>
          <span class="stat-icon blue">▤</span>
        </div>
        <div class="stat-value">{{ products.length }}</div>
        <div class="stat-footer">Produits dans le catalogue</div>
      </div>

      <div class="stat-card">
        <div class="stat-top">
          <span class="stat-label">Stock disponible</span>
          <span class="stat-icon green">✓</span>
        </div>
        <div class="stat-value">{{ totalStock.toLocaleString('fr-FR') }}</div>
        <div class="stat-footer">Casiers disponibles tous dépôts</div>
      </div>

      <div class="stat-card">
        <div class="stat-top">
          <span class="stat-label">Prix moyen</span>
          <span class="stat-icon orange">₣</span>
        </div>
        <div class="stat-value">{{ formatMoney(averagePrice) }}</div>
        <div class="stat-footer">Prix moyen par produit</div>
      </div>

    </section>

    <!-- AJOUT PRODUIT -->
    <section class="panel add-panel">

      <div class="panel-heading">
        <div class="heading-icon">＋</div>
        <div>
          <h2>Nouveau produit</h2>
          <p>Ajoutez un produit à votre catalogue.</p>
        </div>
      </div>

      <form class="product-form" @submit.prevent="add">

        <div class="field name-field">
          <label>Nom du produit</label>
          <input
            v-model.trim="name"
            type="text"
            placeholder="Ex : Bière, Boisson, Jus..."
            maxlength="120"
            required
          />
        </div>

        <div class="field price-field">
          <label>Prix unitaire (FCFA)</label>
          <input
            v-model.number="price"
            type="number"
            min="0"
            step="1"
            placeholder="Ex : 2500"
            required
          />
        </div>

        <button
          type="submit"
          class="btn-add"
          :disabled="loading || !name.trim() || !validPrice"
        >
          <span v-if="loading" class="spinner"></span>
          <template v-else>
            <span>＋</span> Ajouter le produit
          </template>
        </button>

      </form>

      <div class="form-note">
        <span>ⓘ</span>
        Les stocks seront initialisés à zéro et pourront être alimentés depuis la page des entrées de stock.
      </div>

    </section>

    <!-- LISTE DES PRODUITS -->
    <section class="panel products-panel">

      <div class="products-heading">

        <div class="panel-heading">
          <div class="heading-icon list-icon">▤</div>
          <div>
            <h2>Catalogue des produits</h2>
            <p>Consultez et gérez tous vos produits.</p>
          </div>
        </div>

        <span class="count-badge">
          {{ filteredProducts.length }} produit(s)
        </span>

      </div>

      <!-- RECHERCHE ET FILTRES -->
      <div class="toolbar">

        <div class="search-box">
          <span class="search-icon">⌕</span>
          <input
            v-model.trim="search"
            type="search"
            placeholder="Rechercher un produit..."
          />
          <button
            v-if="search"
            class="clear-search"
            @click="search = ''"
            type="button"
          >
            ✕
          </button>
        </div>

        <select v-model="sortBy" class="sort-select">
          <option value="name">Trier : Nom</option>
          <option value="priceAsc">Prix croissant</option>
          <option value="priceDesc">Prix décroissant</option>
          <option value="stockDesc">Stock disponible</option>
        </select>

      </div>

      <!-- CHARGEMENT -->
      <div v-if="pageLoading" class="loading-state">
        <span class="large-spinner"></span>
        <p>Chargement des produits...</p>
      </div>

      <!-- PRODUITS -->
      <transition-group
        v-else-if="filteredProducts.length"
        name="list"
        tag="div"
        class="products-grid"
      >

        <article
          v-for="p in filteredProducts"
          :key="p.id"
          class="product-card"
        >

          <!-- CARD HEADER -->
          <div class="product-top">

            <div class="product-avatar">
              {{ getInitials(p.name) }}
            </div>

            <div class="product-title">
              <h3>{{ p.name }}</h3>
              <span class="product-reference">
                Produit enregistré
              </span>
            </div>

            <button
              v-if="currentUser?.role === 'Administrateur'"
              class="delete-button"
              title="Supprimer le produit"
              @click="deleteProduct(p)"
              :disabled="deletingId === p.id"
            >
              <span v-if="deletingId === p.id" class="mini-spinner"></span>
              <span v-else>✕</span>
            </button>

          </div>

          <!-- PRICE -->
          <div class="product-price-box">
            <span>Prix de vente</span>
            <strong>{{ formatMoney(p.price) }}</strong>
            <small>FCFA / Casier</small>
          </div>

          <!-- STOCKS -->
          <div class="stock-section">

            <div class="stock-heading">
              <span>Disponibilité des stocks</span>
              <strong :class="{ 'has-stock': getTotalProductStock(p) > 0 }">
                {{ getTotalProductStock(p) }} casier(s)
              </strong>
            </div>

            <div
              v-if="getProductDepots(p).length"
              class="depot-list"
            >

              <div
                v-for="depot in getProductDepots(p)"
                :key="depot.id"
                class="depot-item"
              >
                <div class="depot-indicator"></div>

                <span class="depot-name">
                  {{ depot.id }}
                </span>

                <strong>{{ depot.quantity }}</strong>
              </div>

            </div>

            <div v-else class="no-stock">
              <span>○</span>
              Aucun stock disponible
            </div>

          </div>

          <!-- FOOTER -->
          <div class="product-footer">
            <span
              class="stock-status"
              :class="getTotalProductStock(p) > 0 ? 'available' : 'empty'"
            >
              <span class="status-dot"></span>
              {{ getTotalProductStock(p) > 0 ? 'En stock' : 'Stock épuisé' }}
            </span>

            <span class="product-id">
              ID : {{ p.id.slice(0, 7) }}
            </span>
          </div>

        </article>

      </transition-group>

      <!-- EMPTY STATE -->
      <div v-else class="empty-state">

        <div class="empty-icon">
          <span v-if="search">⌕</span>
          <span v-else>▤</span>
        </div>

        <strong>
          {{ search ? 'Aucun résultat trouvé' : 'Aucun produit enregistré' }}
        </strong>

        <p>
          {{
            search
              ? 'Essayez avec un autre nom de produit.'
              : 'Commencez par ajouter votre premier produit.'
          }}
        </p>

        <button
          v-if="search"
          class="reset-search"
          @click="search = ''"
        >
          Réinitialiser la recherche
        </button>

      </div>

      <!-- FOOTER LISTE -->
      <div v-if="filteredProducts.length" class="list-footer">
        <span>
          Affichage de {{ filteredProducts.length }} produit(s)
        </span>
        <span>Catalogue mis à jour</span>
      </div>

    </section>

  </main>
</template>

<script>
import Navbar from "../components/NavbarPage.vue"
import Sidebar from "../components/SidebarPage.vue"
import { db } from "../firebase"

import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc
} from "firebase/firestore"

export default {
  components: {
    Navbar,
    Sidebar
  },

  data() {
    return {
      products: [],

      name: "",
      price: null,

      loading: false,
      pageLoading: false,
      deletingId: null,

      currentUser: null,

      search: "",
      sortBy: "name"
    }
  },

  computed: {

    validPrice() {
      return (
        this.price !== null &&
        this.price !== "" &&
        Number.isFinite(Number(this.price)) &&
        Number(this.price) >= 0
      )
    },

    totalStock() {
      return this.products.reduce(
        (total, product) => total + this.getTotalProductStock(product),
        0
      )
    },

    averagePrice() {
      if (!this.products.length) return 0

      const total = this.products.reduce(
        (sum, p) => sum + (Number(p.price) || 0),
        0
      )

      return total / this.products.length
    },

    filteredProducts() {
      let result = [...this.products]

      // RECHERCHE
      if (this.search) {
        const query = this.search.toLocaleLowerCase("fr")

        result = result.filter(p =>
          String(p.name || "")
            .toLocaleLowerCase("fr")
            .includes(query)
        )
      }

      // TRI
      switch (this.sortBy) {

        case "priceAsc":
          result.sort(
            (a, b) => (Number(a.price) || 0) - (Number(b.price) || 0)
          )
          break

        case "priceDesc":
          result.sort(
            (a, b) => (Number(b.price) || 0) - (Number(a.price) || 0)
          )
          break

        case "stockDesc":
          result.sort(
            (a, b) => this.getTotalProductStock(b) - this.getTotalProductStock(a)
          )
          break

        default:
          result.sort((a, b) =>
            String(a.name || "").localeCompare(
              String(b.name || ""),
              "fr"
            )
          )
      }

      return result
    }

  },

  methods: {

    async load() {
      this.pageLoading = true

      try {
        const snap = await getDocs(collection(db, "products"))

        this.products = snap.docs.map(d => ({
          id: d.id,
          ...d.data()
        }))

      } catch (error) {
        console.error("Erreur chargement produits :", error)
        alert("Impossible de charger les produits.")
      } finally {
        this.pageLoading = false
      }
    },

    formatMoney(amount) {
      return new Intl.NumberFormat("fr-FR", {
        maximumFractionDigits: 0
      }).format(Number(amount) || 0) + " FCFA"
    },

    getInitials(name) {
      if (!name) return "PR"

      return String(name)
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(word => word.charAt(0).toUpperCase())
        .join("")
    },

    getTotalProductStock(product) {
      if (!product.stocks || typeof product.stocks !== "object") {
        return 0
      }

      return Object.values(product.stocks).reduce(
        (total, quantity) => {
          const value = Number(quantity)

          return total + (
            Number.isFinite(value) && value > 0
              ? value
              : 0
          )
        },
        0
      )
    },

    getProductDepots(product) {
      if (!product.stocks || typeof product.stocks !== "object") {
        return []
      }

      return Object.entries(product.stocks)
        .filter(([, quantity]) => Number(quantity) > 0)
        .map(([id, quantity]) => ({
          id,
          quantity: Number(quantity)
        }))
        .sort((a, b) => b.quantity - a.quantity)
    },

    async add() {
      if (this.loading) return

      const productName = this.name.trim()
      const productPrice = Number(this.price)

      if (!productName) {
        alert("Veuillez saisir le nom du produit.")
        return
      }

      if (
        this.price === null ||
        this.price === "" ||
        !Number.isFinite(productPrice) ||
        productPrice < 0
      ) {
        alert("Veuillez saisir un prix valide.")
        return
      }

      this.loading = true

      try {
        await addDoc(collection(db, "products"), {
          name: productName,
          price: productPrice,
          stocks: {}
        })

        this.name = ""
        this.price = null

        await this.load()

        alert("Produit ajouté avec succès !")

      } catch (error) {
        console.error("Erreur ajout produit :", error)
        alert("Impossible d'enregistrer le produit.")
      } finally {
        this.loading = false
      }
    },

    async deleteProduct(product) {
      if (this.currentUser?.role !== "Administrateur") {
        alert("Vous n'avez pas l'autorisation de supprimer ce produit.")
        return
      }

      if (this.deletingId) return

      // Protection contre la suppression d'un produit ayant du stock.
      const stock = this.getTotalProductStock(product)

      if (stock > 0) {
        alert(
          `Impossible de supprimer "${product.name}".\n` +
          `Ce produit possède encore ${stock} casier(s) en stock.`
        )
        return
      }

      if (
        !confirm(
          `Voulez-vous vraiment supprimer le produit "${product.name}" ?`
        )
      ) return

      this.deletingId = product.id

      try {
        await deleteDoc(doc(db, "products", product.id))

        this.products = this.products.filter(
          p => p.id !== product.id
        )

        alert("Produit supprimé avec succès.")

      } catch (error) {
        console.error("Erreur suppression :", error)
        alert("Impossible de supprimer ce produit.")
      } finally {
        this.deletingId = null
      }
    }

  },

  mounted() {
    try {
      this.currentUser = JSON.parse(
        localStorage.getItem("user") || "{}"
      )
    } catch {
      this.currentUser = null
    }

    this.load()
  }
}
</script>

<style scoped>
/* =====================================
   PREMIUM PRODUCT MANAGEMENT
===================================== */

.page {
  --primary: #2563eb;
  --primary-dark: #1746b0;
  --text: #172033;
  --muted: #8490a4;
  --border: #e9edf4;
  --background: #f5f7fb;

  margin-left: 250px;
  padding: 32px 35px 55px;
  min-height: 100vh;
  background: var(--background);
  color: var(--text);
  font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  box-sizing: border-box;
}

.page *,
.page *::before,
.page *::after {
  box-sizing: border-box;
}

button,
input,
select {
  font: inherit;
}

button {
  cursor: pointer;
}

/* HEADER */

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 17px;
}

.header-icon {
  width: 55px;
  height: 55px;
  display: grid;
  place-items: center;
  border-radius: 16px;
  background: linear-gradient(135deg, #2563eb, #1746b0);
  color: white;
  font-size: 26px;
  box-shadow: 0 8px 22px rgba(37, 99, 235, .22);
}

.eyebrow {
  display: block;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.5px;
  color: #8a97ad;
  margin-bottom: 6px;
}

.page-header h1 {
  font-size: 27px;
  font-weight: 800;
  margin: 0;
  letter-spacing: -.7px;
}

.page-header p {
  font-size: 13px;
  color: var(--muted);
  margin: 6px 0 0;
}

.header-date {
  display: flex;
  align-items: center;
  gap: 9px;
  background: white;
  border: 1px solid var(--border);
  padding: 12px 16px;
  border-radius: 12px;
  color: #68758a;
  font-size: 12px;
  font-weight: 600;
}

.date-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #16b981;
}

/* STATISTICS */

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
  margin-bottom: 25px;
}

.stat-card {
  background: white;
  border: 1px solid var(--border);
  border-radius: 17px;
  padding: 21px 23px;
  box-shadow: 0 4px 16px rgba(20, 40, 80, .025);
  transition: .25s ease;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 25px rgba(20, 40, 80, .07);
}

.stat-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.stat-label {
  font-size: 13px;
  color: #778398;
  font-weight: 600;
}

.stat-icon {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  border-radius: 11px;
  font-size: 18px;
  font-weight: 800;
}

.stat-icon.blue {
  background: #edf3ff;
  color: #3475ed;
}

.stat-icon.green {
  background: #e9f9f1;
  color: #16a36a;
}

.stat-icon.orange {
  background: #fff4e8;
  color: #ed9636;
}

.stat-value {
  font-size: 27px;
  font-weight: 800;
  letter-spacing: -.7px;
  margin-top: 17px;
  color: #18243b;
  overflow-wrap: anywhere;
}

.stat-footer {
  margin-top: 7px;
  color: #9aa4b5;
  font-size: 11px;
}

/* PANELS */

.panel {
  background: white;
  border: 1px solid var(--border);
  border-radius: 17px;
  padding: 23px;
  box-shadow: 0 4px 18px rgba(20, 40, 80, .025);
  margin-bottom: 22px;
}

.panel-heading {
  display: flex;
  align-items: center;
  gap: 13px;
}

.heading-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: #edf3ff;
  color: #3475ed;
  font-size: 22px;
}

.list-icon {
  background: #edfaf3;
  color: #16a36a;
}

.panel-heading h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 750;
}

.panel-heading p {
  font-size: 11px;
  color: #95a0b1;
  margin: 5px 0 0;
}

/* ADD FORM */

.add-panel {
  margin-bottom: 22px;
}

.add-panel .panel-heading {
  margin-bottom: 23px;
}

.product-form {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 220px 175px;
  align-items: end;
  gap: 15px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.field label {
  font-size: 12px;
  font-weight: 700;
  color: #59667b;
}

.field input {
  width: 100%;
  min-width: 0;
  border: 1px solid #e4e9f1;
  border-radius: 10px;
  padding: 13px 14px;
  background: #fbfcfe;
  color: #26334a;
  outline: none;
  font-size: 12px;
  transition: .2s;
}

.field input:focus {
  border-color: #4b83ef;
  background: white;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, .09);
}

.field input::placeholder {
  color: #aab3c1;
}

.btn-add {
  border: none;
  border-radius: 10px;
  padding: 13px 14px;
  background: linear-gradient(135deg, #2563eb, #1746b0);
  color: white;
  font-size: 12px;
  font-weight: 750;
  transition: .2s;
  box-shadow: 0 6px 15px rgba(37, 99, 235, .17);
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  min-height: 43px;
}

.btn-add:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 9px 20px rgba(37, 99, 235, .25);
}

.btn-add:disabled {
  opacity: .5;
  cursor: not-allowed;
}

.btn-add span {
  font-size: 19px;
}

.form-note {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 18px;
  color: #929daf;
  font-size: 11px;
  line-height: 1.6;
}

.form-note span {
  color: #3475ed;
  font-size: 15px;
}

/* PRODUCTS PANEL */

.products-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 22px;
}

.count-badge {
  background: #edf3ff;
  color: #3475ed;
  padding: 8px 12px;
  border-radius: 9px;
  font-size: 11px;
  font-weight: 800;
  white-space: nowrap;
}

/* TOOLBAR */

.toolbar {
  display: flex;
  gap: 12px;
  margin-bottom: 23px;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  border: 1px solid #e4e9f1;
  background: #fbfcfe;
  border-radius: 10px;
  padding: 0 13px;
  transition: .2s;
}

.search-box:focus-within {
  border-color: #4b83ef;
  background: white;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, .07);
}

.search-icon {
  font-size: 22px;
  color: #8794a8;
}

.search-box input {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  padding: 12px 0;
  font-size: 12px;
  color: #344158;
}

.search-box input::placeholder {
  color: #aab3c1;
}

.clear-search {
  border: none;
  background: transparent;
  color: #8b97a9;
}

.sort-select {
  min-width: 175px;
  border: 1px solid #e4e9f1;
  background: #fbfcfe;
  border-radius: 10px;
  padding: 12px;
  outline: none;
  color: #59667b;
  font-size: 11px;
  cursor: pointer;
}

/* PRODUCT GRID */

.products-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 17px;
}

.product-card {
  min-width: 0;
  background: white;
  border: 1px solid #e9edf4;
  border-radius: 15px;
  padding: 17px;
  transition: .25s ease;
  animation: cardAppear .3s ease;
}

@keyframes cardAppear {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.product-card:hover {
  border-color: #cbdafa;
  transform: translateY(-3px);
  box-shadow: 0 12px 25px rgba(20, 40, 80, .07);
}

.product-top {
  display: flex;
  align-items: center;
  gap: 11px;
  min-width: 0;
}

.product-avatar {
  width: 43px;
  height: 43px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  border-radius: 12px;
  background: linear-gradient(135deg, #edf3ff, #dce8ff);
  color: #2861c9;
  font-size: 14px;
  font-weight: 850;
}

.product-title {
  flex: 1;
  min-width: 0;
}

.product-title h3 {
  font-size: 13px;
  font-weight: 750;
  color: #25334a;
  margin: 0;
  overflow-wrap: anywhere;
}

.product-reference {
  display: block;
  color: #9ba6b5;
  font-size: 10px;
  margin-top: 5px;
}

.delete-button {
  flex-shrink: 0;
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 8px;
  background: #fff0f0;
  color: #df5555;
  transition: .2s;
}

.delete-button:hover:not(:disabled) {
  background: #ffe0e0;
  transform: scale(1.06);
}

.delete-button:disabled {
  opacity: .5;
  cursor: wait;
}

/* PRICE */

.product-price-box {
  margin-top: 19px;
  padding: 14px;
  background: #f7f9fc;
  border-radius: 11px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.product-price-box span {
  color: #919daf;
  font-size: 10px;
  font-weight: 600;
}

.product-price-box strong {
  color: #172b4d;
  font-size: 19px;
  font-weight: 850;
  overflow-wrap: anywhere;
}

.product-price-box small {
  color: #a2acba;
  font-size: 10px;
}

/* STOCKS */

.stock-section {
  margin-top: 19px;
}

.stock-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 11px;
}

.stock-heading span {
  color: #8591a3;
  font-size: 10px;
  font-weight: 650;
}

.stock-heading strong {
  font-size: 11px;
  color: #e18a38;
  white-space: nowrap;
}

.stock-heading strong.has-stock {
  color: #16a36a;
}

.depot-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.depot-item {
  display: flex;
  align-items: center;
  gap: 9px;
  background: #fbfcfe;
  padding: 9px 10px;
  border: 1px solid #f0f2f6;
  border-radius: 8px;
}

.depot-indicator {
  width: 7px;
  height: 7px;
  background: #16b981;
  border-radius: 50%;
  flex-shrink: 0;
}

.depot-name {
  flex: 1;
  min-width: 0;
  color: #8793a5;
  font-size: 10px;
  overflow-wrap: anywhere;
}

.depot-item strong {
  color: #344158;
  font-size: 11px;
}

.no-stock {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fafbfc;
  padding: 11px;
  border-radius: 8px;
  color: #a2acba;
  font-size: 10px;
}

.no-stock span {
  font-size: 15px;
}

/* PRODUCT FOOTER */

.product-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  border-top: 1px solid #f0f2f6;
  padding-top: 14px;
  margin-top: 17px;
}

.stock-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  font-weight: 700;
}

.stock-status.available {
  color: #159b68;
}

.stock-status.empty {
  color: #d38a38;
}

.status-dot {
  width: 7px;
  height: 7px;
  background: currentColor;
  border-radius: 50%;
}

.product-id {
  color: #a5afbd;
  font-size: 9px;
}

/* EMPTY STATE */

.empty-state {
  padding: 55px 15px;
  text-align: center;
}

.empty-icon {
  width: 65px;
  height: 65px;
  display: grid;
  place-items: center;
  background: #f1f5fb;
  color: #8293ac;
  font-size: 27px;
  border-radius: 50%;
  margin: 0 auto 17px;
}

.empty-state strong {
  display: block;
  color: #344158;
  font-size: 14px;
}

.empty-state p {
  color: #9ba6b5;
  font-size: 11px;
  margin: 8px 0 0;
}

.reset-search {
  margin-top: 17px;
  border: none;
  background: #edf3ff;
  color: #3475ed;
  padding: 10px 15px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 700;
}

/* LIST FOOTER */

.list-footer {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  padding-top: 20px;
  margin-top: 22px;
  border-top: 1px solid #edf0f5;
  color: #9ba6b5;
  font-size: 10px;
}

/* LOADING */

.loading-state {
  padding: 55px 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 13px;
  color: #8996a9;
  font-size: 12px;
}

.large-spinner,
.spinner,
.mini-spinner {
  border-radius: 50%;
  animation: spin .7s linear infinite;
}

.large-spinner {
  width: 30px;
  height: 30px;
  border: 3px solid #e5edfa;
  border-top-color: #2563eb;
}

.spinner {
  width: 17px;
  height: 17px;
  border: 2px solid rgba(255,255,255,.4);
  border-top-color: white;
}

.mini-spinner {
  display: inline-block;
  width: 12px;
  height: 12px;
  border: 2px solid #f5caca;
  border-top-color: #d94b4b;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* TRANSITIONS */

.list-enter-active,
.list-leave-active {
  transition: all .25s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.list-move {
  transition: transform .25s ease;
}

/* RESPONSIVE */

@media (max-width: 1350px) {
  .products-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .product-form {
    grid-template-columns: minmax(0, 1fr) 180px 160px;
  }
}

@media (max-width: 1100px) {
  .page {
    padding: 25px 22px;
  }

  .product-form {
    grid-template-columns: 1fr 1fr;
  }

  .btn-add {
    grid-column: 1 / -1;
  }
}

@media (max-width: 700px) {
  .page {
    margin-left: 0;
    padding: 20px 13px 35px;
  }

  .page-header {
    align-items: flex-start;
    flex-direction: column;
    gap: 15px;
  }

  .page-header h1 {
    font-size: 22px;
  }

  .header-date {
    font-size: 10px;
  }

  .stats-grid {
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .stat-card {
    padding: 15px;
  }

  .stat-value {
    font-size: 21px;
  }

  .stat-label {
    font-size: 11px;
  }

  .stat-footer {
    font-size: 9px;
  }

  .panel {
    padding: 17px 14px;
  }

  .product-form {
    grid-template-columns: 1fr;
  }

  .btn-add {
    grid-column: auto;
  }

  .toolbar {
    flex-direction: column;
  }

  .sort-select {
    width: 100%;
  }

  .products-grid {
    grid-template-columns: 1fr;
  }

  .products-heading {
    align-items: flex-start;
  }

  .count-badge {
    font-size: 9px;
  }

  .list-footer {
    font-size: 9px;
  }
}

@media (max-width: 380px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .products-heading {
    flex-wrap: wrap;
  }
}
</style>
