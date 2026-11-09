<template>
  <Navbar />
  <Sidebar />

  <main class="page">

    <!-- HEADER -->
    <header class="page-header">
      <div class="header-content">
        <div class="header-icon">↗</div>
        <div>
          <span class="eyebrow">GESTION COMMERCIALE</span>
          <h1>Sorties de stock</h1>
          <p>Gérez vos ventes et suivez vos mouvements de stock.</p>
        </div>
      </div>

      <div class="header-date">
        <span class="date-dot"></span>
        {{ new Date().toLocaleDateString('fr-FR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }) }}
      </div>
    </header>

    <!-- STATISTIQUES -->
    <section class="stats-grid">
      <div class="stat-card">
        <div class="stat-top">
          <span class="stat-label">Ventes aujourd'hui</span>
          <span class="stat-icon blue">↗</span>
        </div>
        <div class="stat-value">{{ todaySalesCount }}</div>
        <div class="stat-footer">Transactions enregistrées</div>
      </div>

      <div class="stat-card revenue-card">
        <div class="stat-top">
          <span class="stat-label">Chiffre d'affaires</span>
          <span class="stat-icon green">₣</span>
        </div>
        <div class="stat-value">{{ formatMoney(todaySalesTotal) }}</div>
        <div class="stat-footer">Total des ventes du jour</div>
      </div>

      <div class="stat-card">
        <div class="stat-top">
          <span class="stat-label">Articles vendus</span>
          <span class="stat-icon orange">▤</span>
        </div>
        <div class="stat-value">
          {{ formatQuantity(todayItemsCount) }}
        </div>
        <div class="stat-footer">Unités sorties aujourd'hui</div>
      </div>
    </section>

    <!-- FORMULAIRE DE VENTE -->
    <section class="workspace">

      <div class="main-column">

        <!-- CLIENT -->
        <div class="panel">
          <div class="panel-heading">
            <div class="heading-icon">♙</div>
            <div>
              <h2>Informations du client</h2>
              <p>Renseignez les informations de la transaction.</p>
            </div>
          </div>

          <div class="form-grid">
            <div class="field">
              <label>Nom du client</label>
              <input v-model.trim="clientName" type="text" placeholder="Ex : Jean Dupont" />
            </div>

            <div class="field">
              <label>Vendeur</label>
              <div class="readonly-field">
                <span>♙</span>
                {{ currentUser?.name || currentUser?.username || 'Utilisateur' }}
              </div>
            </div>

            <div class="field full-field">
              <label>Remarque / Observation</label>
              <textarea v-model.trim="remark" rows="2"
                placeholder="Ajouter une observation concernant cette vente..."></textarea>
            </div>
          </div>
        </div>

        <!-- PRODUITS -->
        <div class="panel">
          <div class="panel-heading">
            <div class="heading-icon product-icon">▤</div>
            <div>
              <h2>Ajouter des produits</h2>
              <p>Sélectionnez les articles à sortir du dépôt.</p>
            </div>
          </div>

          <div class="product-form">
            <div class="field product-select">
              <label>Produit</label>
              <select v-model="productId">
                <option value="" disabled>Choisir un produit</option>
                <option v-for="p in products" :key="p.id" :value="p.id" :disabled="getAvailableStock(p.id) <= 0">
                  {{ p.name }} — {{ formatMoney(p.price) }}
                  (Stock : {{ formatQuantity(getAvailableStock(p.id)) }})
                </option>
              </select>
            </div>

            <div class="field quantity-field">
              <label>Quantité</label>
              <input v-model.number="qty" type="number" min="0.001" step="any" placeholder="Ex : 3,5"
                @keyup.enter="addToCart" />
            </div>

            <button class="btn-add" @click="addToCart" :disabled="!productId ||
              !Number.isFinite(Number(qty)) ||
              Number(qty) <= 0
              ">
              <span>＋</span> Ajouter
            </button>
          </div>

          <div v-if="selectedProduct" class="product-stock-info">
            <span class="stock-indicator"></span>
            Stock disponible :
            <strong>
              {{ formatQuantity(getAvailableStock(selectedProduct.id)) }}
            </strong>
            <span class="stock-unit">casier(s)</span>
          </div>
        </div>

        <!-- HISTORIQUE -->
        <div class="panel history-panel">
          <div class="panel-heading history-heading">
            <div class="heading-icon history-icon">▤</div>
            <div>
              <h2>Historique des ventes</h2>
              <p>Consultez les dernières transactions effectuées.</p>
            </div>
            <span class="count-badge">{{ sales.length }} ventes</span>
          </div>

          <div v-if="sales.length" class="sales-list">

            <div v-for="s in paginatedSales" :key="s.id" class="sale-entry" :class="{ selected: openedSale === s.id }"
              @click="openModal(s)">
              <div class="sale-date-icon">
                <span>▤</span>
              </div>

              <div class="sale-info">
                <strong>{{ formatDate(s.date) }}</strong>
                <span class="sale-client">
                  {{ s.clientName || 'Client comptant' }}
                </span>

                <span v-if="currentUser?.role === 'Administrateur'" class="seller-label">
                  Vendeur : {{ s.seller || 'Inconnu' }}
                </span>
              </div>

              <div class="sale-amount">
                <strong>{{ formatMoney(s.total) }}</strong>
                <span>{{ s.items?.length || 0 }} article(s)</span>
              </div>

              <div class="sale-actions">
                <button class="icon-action view-action" title="Voir les détails" @click.stop="openModal(s)">
                  ↗
                </button>

                <button v-if="currentUser?.role === 'Administrateur'" class="icon-action delete-action"
                  title="Supprimer la vente" @click.stop="deleteSale(s)">
                  ✕
                </button>
              </div>
            </div>

          </div>

          <div v-else class="empty-state">
            <div class="empty-icon">▤</div>
            <strong>Aucune vente enregistrée</strong>
            <p>Les transactions apparaîtront ici après validation.</p>
          </div>

          <div v-if="sales.length > pageSize" class="pagination">
            <span>
              Affichage de
              {{ (currentPage - 1) * pageSize + 1 }}
              à
              {{ Math.min(currentPage * pageSize, sales.length) }}
              sur {{ sales.length }}
            </span>

            <div class="pagination-actions">
              <button @click="prevPage" :disabled="currentPage === 1">
                ←
              </button>

              <span>{{ currentPage }} / {{ totalPages }}</span>

              <button @click="nextPage" :disabled="currentPage === totalPages">
                →
              </button>
            </div>
          </div>
        </div>

      </div>

      <!-- PANIER -->
      <aside class="cart-panel">
        <div class="cart-header">
          <div>
            <span class="eyebrow">TRANSACTION EN COURS</span>
            <h2>Mon panier</h2>
          </div>
          <span class="cart-count">{{ cart.length }}</span>
        </div>

        <div v-if="cart.length" class="cart-content">

          <div v-for="item in cart" :key="item.productId" class="cart-item">
            <div class="cart-item-info">
              <strong>{{ item.name }}</strong>
              <span>
                {{ formatQuantity(item.qty) }} × {{ formatMoney(item.price) }}
              </span>
            </div>

            <div class="cart-item-right">
              <strong>{{ formatMoney(item.qty * item.price) }}</strong>
              <button @click="removeFromCart(item.productId)" title="Retirer">
                ✕
              </button>
            </div>
          </div>

          <div class="cart-summary">
            <div class="summary-line">
              <span>Nombre d'articles</span>
              <strong>{{ formatQuantity(cartItemsCount) }}</strong>
            </div>

            <div class="summary-line">
              <span>Sous-total</span>
              <strong>{{ formatMoney(cartTotal) }}</strong>
            </div>

            <div class="summary-total">
              <span>Total à payer</span>
              <strong>{{ formatMoney(cartTotal) }}</strong>
            </div>
          </div>

          <button class="checkout-btn" @click="saveSale" :disabled="loading || !cart.length">
            <span v-if="loading" class="spinner"></span>
            <template v-else>
              Valider la vente
              <span>→</span>
            </template>
          </button>

          <p class="cart-security">
            <span>✓</span> Enregistrement sécurisé des stocks
          </p>

          <button class="clear-cart" @click="clearCart" :disabled="loading">
            Vider le panier
          </button>

        </div>

        <div v-else class="cart-empty">
          <div class="cart-empty-icon">🛒</div>
          <strong>Votre panier est vide</strong>
          <p>Ajoutez des produits pour commencer une nouvelle vente.</p>
        </div>

      </aside>

    </section>

    <!-- MODAL DETAILS -->
    <div v-if="modalSale" class="modal-overlay" @click.self="closeModal" @keydown.esc="closeModal">
      <div class="modal">

        <div class="modal-header">
          <div>
            <span class="eyebrow">DÉTAIL DE TRANSACTION</span>
            <h2>Facture de vente</h2>
          </div>

          <button class="modal-close" @click="closeModal">✕</button>
        </div>

        <div class="invoice-info">
          <div>
            <span>Date</span>
            <strong>{{ formatDate(modalSale.date) }}</strong>
          </div>

          <div>
            <span>Client</span>
            <strong>{{ modalSale.clientName || 'Client comptant' }}</strong>
          </div>

          <div>
            <span>Vendeur</span>
            <strong>{{ modalSale.seller || 'Inconnu' }}</strong>
          </div>
        </div>

        <div class="invoice-table">
          <div class="invoice-table-head">
            <span>Produit</span>
            <span>Qté</span>
            <span>Prix unitaire</span>
            <span>Total</span>
          </div>

          <div v-for="(item, index) in modalSale.items || []" :key="item.productId || index" class="invoice-row">
            <strong>{{ item.name }}</strong>
            <span>{{ formatQuantity(item.qty) }}</span>
            <span>{{ formatMoney(item.price) }}</span>
            <strong>{{ formatMoney(item.qty * item.price) }}</strong>
          </div>
        </div>

        <div v-if="modalSale.remark" class="invoice-remark">
          <span>Observation</span>
          <p>{{ modalSale.remark }}</p>
        </div>

        <div class="invoice-total">
          <span>Montant total</span>
          <strong>{{ formatMoney(modalSale.total) }}</strong>
        </div>

        <button class="modal-button" @click="closeModal">
          Fermer
        </button>

      </div>
    </div>

  </main>
</template>

<script>

import { db } from "../firebase"
import Sidebar from "../components/SidebarPage.vue"
import Navbar from "../components/NavbarPage.vue"
import { printInvoiceDirect } from "../utils/invoice"

import {
  collection,
  getDocs,
  doc,
  runTransaction
} from "firebase/firestore"

export default {
  components: {
    Sidebar,
    Navbar
  },

  data() {
    return {
      products: [],
      sales: [],
      cart: [],

      productId: "",
      qty: 1,

      loading: false,
      pageLoading: false,

      depotId: "J5x1X8Cw10ErpwYM0Oyn",

      clientName: "",
      remark: "",

      currentUser: null,

      modalSale: null,
      openedSale: null,

      currentPage: 1,
      pageSize: 5
    }
  },

  computed: {
    selectedProduct() {
      return this.products.find(
        p => p.id === this.productId
      ) || null
    },

    cartTotal() {
      return this.cart.reduce(
        (sum, item) =>
          sum + item.qty * item.price,
        0
      )
    },

    cartItemsCount() {
      return this.cart.reduce(
        (sum, item) => sum + item.qty,
        0
      )
    },

    todaySales() {
      return this.sales.filter(s => {
        const date = this.getDateValue(s.date)

        if (!date || isNaN(date.getTime())) {
          return false
        }

        const now = new Date()

        return (
          date.getFullYear() === now.getFullYear() &&
          date.getMonth() === now.getMonth() &&
          date.getDate() === now.getDate()
        )
      })
    },

    todaySalesCount() {
      return this.todaySales.length
    },

    todaySalesTotal() {
      return this.todaySales.reduce(
        (sum, sale) =>
          sum + (Number(sale.total) || 0),
        0
      )
    },

    todayItemsCount() {
      return this.todaySales.reduce(
        (sum, sale) => {
          return sum + (sale.items || []).reduce(
            (total, item) =>
              total + (Number(item.qty) || 0),
            0
          )
        },
        0
      )
    },

    totalPages() {
      return Math.ceil(
        this.sales.length / this.pageSize
      )
    },

    paginatedSales() {
      const start =
        (this.currentPage - 1) * this.pageSize

      return this.sales.slice(
        start,
        start + this.pageSize
      )
    }
  },

  methods: {

    // =====================================
    // GESTION DES NOMBRES DECIMAUX
    // =====================================

    normalizeQuantity(value) {
      const number = Number(value)

      if (!Number.isFinite(number)) return 0

      // Évite les erreurs de précision des nombres flottants.
      return Number(number.toFixed(6))
    },

    formatQuantity(quantity) {
      return new Intl.NumberFormat("fr-FR", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 6
      }).format(
        this.normalizeQuantity(quantity)
      )
    },

    isValidQuantity(value) {
      const number = Number(value)

      return (
        value !== "" &&
        value !== null &&
        value !== undefined &&
        Number.isFinite(number) &&
        number > 0
      )
    },

    // =====================================
    // DATES
    // =====================================

    getDateValue(date) {
      if (!date) return null

      if (typeof date.toDate === "function") {
        return date.toDate()
      }

      if (date.seconds !== undefined) {
        return new Date(date.seconds * 1000)
      }

      return new Date(date)
    },

    formatDate(date) {
      const d = this.getDateValue(date)

      if (!d || isNaN(d.getTime())) {
        return "Date inconnue"
      }

      return d.toLocaleString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
    },

    // =====================================
    // CHARGEMENT DES DONNEES
    // =====================================

    async load() {
      this.pageLoading = true

      try {
        const [
          productsSnap,
          salesSnap
        ] = await Promise.all([
          getDocs(collection(db, "products")),
          getDocs(collection(db, "sales"))
        ])

        this.products = productsSnap.docs.map(d => ({
          id: d.id,
          ...d.data()
        }))

        this.sales = salesSnap.docs
          .map(d => ({
            id: d.id,
            ...d.data()
          }))
          .sort((a, b) => {
            const da =
              this.getDateValue(a.date)?.getTime() || 0

            const dbDate =
              this.getDateValue(b.date)?.getTime() || 0

            return dbDate - da
          })

        if (
          this.currentPage > this.totalPages &&
          this.totalPages > 0
        ) {
          this.currentPage = this.totalPages
        }

      } catch (error) {
        console.error("Erreur chargement :", error)

        alert("Impossible de charger les données.")

      } finally {
        this.pageLoading = false
      }
    },

    // =====================================
    // FORMATAGE DES PRIX
    // =====================================

    formatMoney(amount) {
      return new Intl.NumberFormat("fr-FR", {
        maximumFractionDigits: 0
      }).format(
        Number(amount) || 0
      ) + " FCFA"
    },

    // =====================================
    // STOCK DISPONIBLE
    // =====================================

    getAvailableStock(productId) {
      const product = this.products.find(
        p => p.id === productId
      )

      if (!product) return 0

      const stock = this.normalizeQuantity(
        product.stocks?.[this.depotId] ?? 0
      )

      const inCart = this.cart.find(
        item => item.productId === productId
      )?.qty || 0

      return Math.max(
        0,
        this.normalizeQuantity(stock - inCart)
      )
    },

    // =====================================
    // AJOUT AU PANIER
    // =====================================

    addToCart() {
      const product = this.selectedProduct

      const quantity = this.normalizeQuantity(
        this.qty
      )

      if (!product) {
        alert("Veuillez sélectionner un produit.")
        return
      }

      if (!this.isValidQuantity(this.qty)) {
        alert(
          "Veuillez saisir une quantité décimale valide supérieure à zéro."
        )
        return
      }

      const stock = this.normalizeQuantity(
        product.stocks?.[this.depotId] ?? 0
      )

      const existing = this.cart.find(
        item => item.productId === product.id
      )

      const alreadyAdded = existing?.qty || 0

      const totalRequested = this.normalizeQuantity(
        alreadyAdded + quantity
      )

      if (totalRequested > stock) {
        const available = this.normalizeQuantity(
          stock - alreadyAdded
        )

        alert(
          `Stock insuffisant pour ${product.name}.\n` +
          `Stock disponible : ${this.formatQuantity(
            Math.max(0, available)
          )} casier(s).`
        )

        return
      }

      const price = Number(product.price)

      if (
        !Number.isFinite(price) ||
        price < 0
      ) {
        alert("Le prix de ce produit est invalide.")
        return
      }

      if (existing) {
        existing.qty = totalRequested
      } else {
        this.cart.push({
          productId: product.id,
          name: product.name,
          price,
          qty: quantity
        })
      }

      this.productId = ""
      this.qty = 1
    },

    // =====================================
    // SUPPRESSION D'UN ARTICLE DU PANIER
    // =====================================

    removeFromCart(id) {
      this.cart = this.cart.filter(
        item => item.productId !== id
      )
    },

    // =====================================
    // VIDER LE PANIER
    // =====================================

    clearCart() {
      if (!this.cart.length) return

      if (
        confirm(
          "Voulez-vous vider entièrement le panier ?"
        )
      ) {
        this.cart = []
      }
    },

    // =====================================
    // ENREGISTREMENT DE LA VENTE
    // =====================================

    async saveSale() {
      if (this.loading || !this.cart.length) return

      this.loading = true

      try {
        // Préparer les articles avec les quantités normalisées.
        const items = this.cart.map(item => ({
          ...item,
          qty: this.normalizeQuantity(item.qty)
        }))

        // Vérifier toutes les quantités.
        for (const item of items) {
          if (!this.isValidQuantity(item.qty)) {
            throw new Error(
              `Quantité invalide pour ${item.name}.`
            )
          }
        }

        const total = items.reduce(
          (sum, item) =>
            sum + item.qty * item.price,
          0
        )

        const saleData = {
          depotId: this.depotId,

          items,

          clientName:
            this.clientName || "Client comptant",

          remark: this.remark || "",

          total,

          seller:
            this.currentUser?.name ||
            this.currentUser?.username ||
            "Inconnu",

          date: new Date()
        }

        const saleRef = doc(
          collection(db, "sales")
        )

        // Transaction atomique : stocks + vente.
        await runTransaction(
          db,
          async transaction => {

            const productRefs = items.map(item => ({
              item,
              ref: doc(
                db,
                "products",
                item.productId
              )
            }))

            // Toutes les lectures avant les écritures.
            const snapshots = await Promise.all(
              productRefs.map(({ ref }) =>
                transaction.get(ref)
              )
            )

            const updates = []

            for (
              let index = 0;
              index < productRefs.length;
              index++
            ) {
              const { item, ref } =
                productRefs[index]

              const snapshot = snapshots[index]

              if (!snapshot.exists()) {
                throw new Error(
                  `Produit introuvable : ${item.name}`
                )
              }

              const product = snapshot.data()

              const stock = this.normalizeQuantity(
                product.stocks?.[this.depotId] ?? 0
              )

              if (stock < item.qty) {
                throw new Error(
                  `Stock insuffisant pour ${item.name}.\n` +
                  `Disponible : ${this.formatQuantity(stock)} casier(s).`
                )
              }

              const newStock = this.normalizeQuantity(
                stock - item.qty
              )

              updates.push({
                ref,
                stock: newStock
              })
            }

            // Déduire les stocks.
            updates.forEach(({ ref, stock }) => {
              transaction.update(ref, {
                [`stocks.${this.depotId}`]: stock
              })
            })

            // Enregistrer la vente.
            transaction.set(saleRef, saleData)
          }
        )

        // Recharger les données après validation.
        await this.load()

        this.cart = []
        this.clientName = ""
        this.remark = ""
        this.productId = ""
        this.qty = 1

        // Impression de la facture.
        await printInvoiceDirect(
          {
            id: saleRef.id,
            total
          },
          items,
          saleData.clientName,
          {
            name: "Dépôt principal"
          }
        )

        alert("Vente enregistrée avec succès !")

      } catch (error) {
        console.error("Erreur vente :", error)

        alert(
          error.message ||
          "Une erreur est survenue lors de l'enregistrement."
        )

      } finally {
        this.loading = false
      }
    },

    // =====================================
    // SUPPRESSION D'UNE VENTE
    // ET RESTAURATION DES STOCKS
    // =====================================

    async deleteSale(sale) {
      if (this.loading) return

      if (
        !confirm(
          "Voulez-vous vraiment supprimer cette vente et restaurer les stocks ?"
        )
      ) {
        return
      }

      this.loading = true

      try {
        await runTransaction(
          db,
          async transaction => {

            const saleRef = doc(
              db,
              "sales",
              sale.id
            )

            const saleSnap = await transaction.get(
              saleRef
            )

            if (!saleSnap.exists()) {
              throw new Error(
                "Cette vente n'existe plus."
              )
            }

            const saleData = saleSnap.data()
            const items = saleData.items || []

            if (!saleData.depotId) {
              throw new Error(
                "Dépôt de la vente introuvable. Restauration annulée."
              )
            }

            // Regrouper les quantités par produit.
            const quantitiesByProduct = new Map()

            items.forEach(item => {
              if (!item.productId) {
                throw new Error(
                  `Identifiant manquant pour ${item.name || "un produit"}.`
                )
              }

              const quantity = Number(item.qty)

              if (
                !Number.isFinite(quantity) ||
                quantity < 0
              ) {
                throw new Error(
                  `Quantité invalide pour ${item.name}.`
                )
              }

              const previous =
                quantitiesByProduct.get(item.productId) || 0

              quantitiesByProduct.set(
                item.productId,
                this.normalizeQuantity(
                  previous + quantity
                )
              )
            })

            const productRefs = Array.from(
              quantitiesByProduct.entries()
            ).map(([productId, quantity]) => ({
              productId,
              quantity,
              ref: doc(
                db,
                "products",
                productId
              )
            }))

            // Lire tous les produits avant les écritures.
            const snapshots = await Promise.all(
              productRefs.map(({ ref }) =>
                transaction.get(ref)
              )
            )

            const updates = []

            for (
              let index = 0;
              index < productRefs.length;
              index++
            ) {
              const {
                productId,
                quantity,
                ref
              } = productRefs[index]

              const snapshot = snapshots[index]

              if (!snapshot.exists()) {
                throw new Error(
                  `Impossible de restaurer le stock : produit ${productId} introuvable.`
                )
              }

              const product = snapshot.data()

              const stock = this.normalizeQuantity(
                product.stocks?.[saleData.depotId] ?? 0
              )

              const restoredStock =
                this.normalizeQuantity(
                  stock + quantity
                )

              updates.push({
                ref,
                stock: restoredStock
              })
            }

            // Restaurer les quantités.
            updates.forEach(({ ref, stock }) => {
              transaction.update(ref, {
                [`stocks.${saleData.depotId}`]: stock
              })
            })

            // Supprimer la vente.
            transaction.delete(saleRef)
          }
        )

        this.closeModal()

        await this.load()

        alert(
          "Vente supprimée et stocks restaurés avec succès."
        )

      } catch (error) {
        console.error("Erreur suppression :", error)

        alert(
          error.message ||
          "Impossible de supprimer cette vente."
        )

      } finally {
        this.loading = false
      }
    },

    // =====================================
    // MODAL DETAILS VENTE
    // =====================================

    openModal(sale) {
      this.modalSale = sale
      this.openedSale = sale.id
    },

    closeModal() {
      this.modalSale = null
      this.openedSale = null
    },

    // =====================================
    // PAGINATION
    // =====================================

    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--
      }
    },

    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++
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
/* ================================
   DESIGN PREMIUM
================================ */

.page {
  --primary: #2563eb;
  --primary-dark: #1746b0;
  --text: #172033;
  --muted: #8490a4;
  --border: #e9edf4;
  --surface: #ffffff;
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
textarea,
select {
  font: inherit;
}

button {
  cursor: pointer;
}

/* HEADER */

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
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
  font-size: 29px;
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

.date-dot,
.stock-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #16b981;
}

/* STATS */

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

.revenue-card .stat-value {
  font-size: 22px;
}

.stat-footer {
  margin-top: 7px;
  color: #9aa4b5;
  font-size: 11px;
}

/* WORKSPACE */

.workspace {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 330px;
  gap: 22px;
  align-items: start;
}

.main-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.panel,
.cart-panel {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 17px;
  box-shadow: 0 4px 18px rgba(20, 40, 80, .025);
}

.panel {
  padding: 23px;
}

.panel-heading {
  display: flex;
  align-items: center;
  gap: 13px;
  margin-bottom: 23px;
}

.heading-icon {
  width: 41px;
  height: 41px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: #edf3ff;
  color: #3475ed;
  font-size: 19px;
}

.product-icon {
  background: #edfaf3;
  color: #16a36a;
}

.history-icon {
  background: #fff4e8;
  color: #e99a37;
}

.panel-heading h2,
.cart-header h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 750;
}

.panel-heading p {
  font-size: 11px;
  color: #95a0b1;
  margin: 5px 0 0;
}

/* FORM */

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
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

.field input,
.field textarea,
.field select {
  width: 100%;
  min-width: 0;
  border: 1px solid #e4e9f1;
  border-radius: 10px;
  padding: 12px 14px;
  background: #fbfcfe;
  color: #26334a;
  outline: none;
  font-size: 12px;
  transition: .2s;
}

.field input:focus,
.field textarea:focus,
.field select:focus {
  border-color: #4b83ef;
  background: white;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, .09);
}

.field input::placeholder,
.field textarea::placeholder {
  color: #aab3c1;
}

.field textarea {
  resize: vertical;
}

.full-field {
  grid-column: 1 / -1;
}

.readonly-field {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  background: #f4f6fa;
  border-radius: 10px;
  font-size: 12px;
  color: #56647a;
  min-height: 40px;
}

/* PRODUCT FORM */

.product-form {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 100px 115px;
  align-items: end;
  gap: 13px;
}

.btn-add {
  border: none;
  border-radius: 10px;
  padding: 12px 14px;
  background: #172b4d;
  color: white;
  font-size: 12px;
  font-weight: 700;
  transition: .2s;
}

.btn-add:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-1px);
}

.btn-add span {
  font-size: 17px;
  vertical-align: -1px;
  margin-right: 4px;
}

.btn-add:disabled {
  opacity: .45;
  cursor: not-allowed;
}

.product-stock-info {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-top: 15px;
  font-size: 11px;
  color: #7d8a9e;
}

.product-stock-info strong {
  color: #16a36a;
}

.stock-unit {
  color: #a0aaba;
}

/* CART */

.cart-panel {
  position: sticky;
  top: 20px;
  overflow: hidden;
}

.cart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 23px;
  border-bottom: 1px solid var(--border);
}

.cart-count,
.count-badge {
  background: #edf3ff;
  color: #3475ed;
  padding: 7px 11px;
  border-radius: 9px;
  font-size: 11px;
  font-weight: 800;
}

.cart-content {
  padding: 18px;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
  padding: 15px 0;
  border-bottom: 1px solid #f0f2f6;
}

.cart-item-info {
  display: flex;
  flex-direction: column;
  gap: 7px;
  min-width: 0;
}

.cart-item-info strong {
  font-size: 12px;
  color: #29354a;
  overflow-wrap: anywhere;
}

.cart-item-info span {
  font-size: 10px;
  color: #929daf;
}

.cart-item-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 9px;
  flex-shrink: 0;
}

.cart-item-right strong {
  font-size: 11px;
  color: #172b4d;
}

.cart-item-right button {
  border: none;
  background: #fff0f0;
  color: #e45151;
  width: 23px;
  height: 23px;
  border-radius: 7px;
  font-size: 10px;
}

.cart-summary {
  margin-top: 18px;
}

.summary-line {
  display: flex;
  justify-content: space-between;
  margin-bottom: 13px;
  font-size: 11px;
  color: #8b97a9;
}

.summary-line strong {
  color: #47546b;
}

.summary-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 17px;
  margin-top: 13px;
  border-top: 1px dashed #dce2eb;
}

.summary-total span {
  font-size: 12px;
  font-weight: 700;
  color: #47546b;
}

.summary-total strong {
  font-size: 19px;
  font-weight: 850;
  color: #172b4d;
}

.checkout-btn {
  width: 100%;
  border: none;
  border-radius: 11px;
  margin-top: 23px;
  padding: 15px;
  background: linear-gradient(135deg, #2563eb, #1746b0);
  color: white;
  font-size: 12px;
  font-weight: 750;
  box-shadow: 0 7px 17px rgba(37, 99, 235, .2);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  transition: .2s;
}

.checkout-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 22px rgba(37, 99, 235, .3);
}

.checkout-btn:disabled {
  opacity: .6;
  cursor: not-allowed;
}

.checkout-btn span:not(.spinner) {
  font-size: 17px;
}

.cart-security {
  text-align: center;
  font-size: 10px;
  color: #96a2b3;
  margin: 14px 0;
}

.cart-security span {
  color: #16a36a;
  font-weight: 800;
  margin-right: 4px;
}

.clear-cart {
  display: block;
  margin: 10px auto 0;
  border: none;
  background: transparent;
  color: #df6262;
  font-size: 11px;
  font-weight: 700;
}

.clear-cart:disabled {
  opacity: .5;
}

.cart-empty {
  padding: 45px 25px;
  text-align: center;
}

.cart-empty-icon {
  width: 62px;
  height: 62px;
  display: grid;
  place-items: center;
  background: #f1f5fb;
  border-radius: 50%;
  margin: 0 auto 17px;
  font-size: 25px;
}

.cart-empty strong {
  font-size: 13px;
}

.cart-empty p {
  color: #9ba5b4;
  font-size: 11px;
  line-height: 1.7;
}

/* HISTORY */

.history-heading {
  margin-bottom: 18px;
}

.count-badge {
  margin-left: auto;
  white-space: nowrap;
}

.sales-list {
  display: flex;
  flex-direction: column;
}

.sale-entry {
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 15px 9px;
  border-bottom: 1px solid #f0f2f6;
  border-radius: 9px;
  cursor: pointer;
  transition: .2s;
}

.sale-entry:hover,
.sale-entry.selected {
  background: #f6f8fc;
}

.sale-date-icon {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  border-radius: 11px;
  background: #f1f5fc;
  color: #5480ca;
  font-size: 17px;
}

.sale-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.sale-info strong {
  font-size: 12px;
  color: #344158;
}

.sale-client,
.seller-label {
  color: #919db0;
  font-size: 10px;
  overflow-wrap: anywhere;
}

.sale-amount {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 5px;
}

.sale-amount strong {
  color: #172b4d;
  font-size: 12px;
}

.sale-amount span {
  color: #9ca7b6;
  font-size: 10px;
}

.sale-actions {
  display: flex;
  gap: 6px;
}

.icon-action {
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 8px;
  transition: .2s;
}

.view-action {
  background: #edf3ff;
  color: #3475ed;
}

.view-action:hover {
  background: #dce8ff;
}

.delete-action {
  background: #fff0f0;
  color: #e45151;
}

.delete-action:hover {
  background: #ffe0e0;
}

.empty-state {
  text-align: center;
  padding: 45px 15px;
}

.empty-icon {
  width: 58px;
  height: 58px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  margin: 0 auto 15px;
  background: #f2f5fa;
  color: #8b9ab0;
  font-size: 25px;
}

.empty-state strong {
  font-size: 13px;
}

.empty-state p {
  font-size: 11px;
  color: #9ca6b5;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 20px;
  color: #929daf;
  font-size: 11px;
}

.pagination-actions {
  display: flex;
  align-items: center;
  gap: 13px;
}

.pagination-actions button {
  width: 30px;
  height: 30px;
  border: 1px solid #e5eaf1;
  background: white;
  color: #40516d;
  border-radius: 8px;
}

.pagination-actions button:disabled {
  opacity: .35;
  cursor: not-allowed;
}

/* MODAL */

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(13, 24, 43, .58);
  backdrop-filter: blur(5px);
}

.modal {
  width: 100%;
  max-width: 650px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 28px;
  border-radius: 19px;
  background: white;
  box-shadow: 0 25px 80px rgba(0, 0, 0, .2);
  animation: modalAppear .25s ease;
}

@keyframes modalAppear {
  from {
    opacity: 0;
    transform: translateY(12px) scale(.98);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 25px;
}

.modal-header h2 {
  font-size: 21px;
  margin: 0;
}

.modal-close {
  border: none;
  background: #f1f4f8;
  width: 34px;
  height: 34px;
  border-radius: 9px;
  color: #67748a;
}

.invoice-info {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  padding: 17px;
  background: #f7f9fc;
  border-radius: 12px;
  margin-bottom: 22px;
}

.invoice-info div {
  display: flex;
  flex-direction: column;
  gap: 7px;
  min-width: 0;
}

.invoice-info span,
.invoice-remark span {
  font-size: 10px;
  color: #929daf;
}

.invoice-info strong {
  font-size: 11px;
  color: #344158;
  overflow-wrap: anywhere;
}

.invoice-table {
  width: 100%;
  overflow-x: auto;
}

.invoice-table-head,
.invoice-row {
  min-width: 490px;
  display: grid;
  grid-template-columns: 1.4fr .45fr 1fr 1fr;
  align-items: center;
  gap: 9px;
  padding: 13px 5px;
  border-bottom: 1px solid #edf0f5;
}

.invoice-table-head {
  background: #f7f9fc;
  font-size: 10px;
  color: #8b96a8;
  font-weight: 700;
}

.invoice-row {
  font-size: 10px;
  color: #647188;
}

.invoice-row strong {
  color: #344158;
}

.invoice-row> :last-child,
.invoice-table-head> :last-child {
  text-align: right;
}

.invoice-remark {
  margin-top: 18px;
  padding: 13px;
  background: #f7f9fc;
  border-radius: 10px;
}

.invoice-remark p {
  font-size: 11px;
  color: #526079;
  margin: 8px 0 0;
}

.invoice-total {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px dashed #dce2eb;
  margin-top: 20px;
  padding-top: 19px;
}

.invoice-total span {
  font-size: 13px;
  font-weight: 700;
}

.invoice-total strong {
  font-size: 21px;
  color: #1746b0;
}

.modal-button {
  width: 100%;
  margin-top: 25px;
  padding: 13px;
  background: #172b4d;
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  font-size: 12px;
}

/* LOADING */

.spinner {
  width: 17px;
  height: 17px;
  border: 2px solid rgba(255, 255, 255, .4);
  border-top-color: white;
  border-radius: 50%;
  animation: spin .7s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* RESPONSIVE */

@media (max-width: 1250px) {
  .workspace {
    grid-template-columns: minmax(0, 1fr) 290px;
  }

  .page {
    padding: 25px 22px;
  }
}

@media (max-width: 1000px) {
  .workspace {
    grid-template-columns: 1fr;
  }

  .cart-panel {
    position: static;
  }

  .stats-grid {
    gap: 12px;
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

  .revenue-card .stat-value {
    font-size: 17px;
  }

  .stat-label {
    font-size: 11px;
  }

  .stat-footer {
    font-size: 10px;
  }

  .panel {
    padding: 17px 14px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .full-field {
    grid-column: auto;
  }

  .product-form {
    grid-template-columns: 1fr 85px;
  }

  .btn-add {
    grid-column: 1 / -1;
  }

  .sale-entry {
    gap: 8px;
    padding: 13px 4px;
  }

  .sale-date-icon {
    width: 33px;
    height: 33px;
  }

  .sale-info strong,
  .sale-amount strong {
    font-size: 10px;
  }

  .sale-amount span {
    font-size: 9px;
  }

  .sale-actions {
    flex-direction: column;
  }

  .icon-action {
    width: 26px;
    height: 26px;
  }

  .pagination {
    gap: 10px;
    font-size: 9px;
  }

  .invoice-info {
    grid-template-columns: 1fr;
  }

  .modal {
    padding: 20px 15px;
  }

  .history-heading {
    flex-wrap: wrap;
  }

  .count-badge {
    font-size: 9px;
  }
}

@media (max-width: 380px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .sale-date-icon {
    display: none;
  }
}
</style>
