<template>
  <Navbar />
  <Sidebar />
  <div class="page">

    <!-- HEADER -->
    <div class="header">
      <h2>📤 Sorties de stock</h2>
      <div class="summary">
        <div class="summary-card">
          <span>Aujourd'hui</span>
          <strong>{{ todaySalesCount }} ventes</strong>
        </div>
        <div class="summary-card green">
          <span>Total aujourd'hui</span>
          <strong>{{ formatMoney(todaySalesTotal) }}</strong>
        </div>
      </div>
    </div>

    <!-- INFOS CLIENT -->
    <div class="card form">
      <input v-model="clientName" placeholder="Nom du client (optionnel)" />
      <textarea v-model="remark" placeholder="Remarque / Observation" rows="2" />
    </div>

    <!-- AJOUT PRODUIT -->
    <div class="card form">
      <select v-model="productId">
        <option disabled value="">-- Produit --</option>
        <option v-for="p in products" :key="p.id" :value="p.id">
          {{ p.name }} ({{ formatMoney(p.price) }})
        </option>
      </select>

      <input v-model.number="qty" type="number" min="1" placeholder="Qté" />

      <button class="btn primary" @click="addToCart" :disabled="!productId || qty <= 0">
        ➕ Ajouter
      </button>
    </div>

    <!-- PANIER -->
    <div v-if="cart.length" class="card cart-card">
      <h3>🛒 Panier</h3>

      <div class="cart-item" v-for="i in cart" :key="i.productId">

        <div class="cart-left">
          <strong>{{ i.name }}</strong>
          <div class="meta">
            {{ i.qty }} × {{ formatMoney(i.price) }}
          </div>
        </div>

        <div class="cart-right">
          <div class="line-total">
            {{ formatMoney(i.qty * i.price) }}
          </div>
          <button class="danger" @click="removeFromCart(i.productId)">
            ✕
          </button>
        </div>
      </div>

      <div class="total-box">
        <span>Total</span>
        <strong>{{ formatMoney(cartTotal) }}</strong>
      </div>

      <button class="btn primary full" @click="saveSale" :disabled="loading">
        <span v-if="loading" class="loading-indicator"></span>
        <span v-else>Valider & Imprimer</span>
      </button>
    </div>

    <!-- HISTORIQUE -->
    <div class="card">
      <h3>📋 Historique</h3>

      <div v-for="s in paginatedSales" :key="s.id" class="entry" :class="{ selected: openedSale === s.id }"
        @click="openModal(s)">

        <div>
          <strong>{{ formatDate(s.date) }}</strong>
          <div class="meta">
            👤 {{ s.clientName || "Client comptant" }}
            <span class="badge">
              {{ formatMoney(s.total) }}
            </span>
          </div>
        </div>

        <button v-if="currentUser?.role === 'Administrateur'" class="danger" @click.stop="deleteSale(s)">
          Supprimer
        </button>

      </div>

      <div class="pagination" v-if="sales.length > pageSize">
        <button @click="prevPage" :disabled="currentPage === 1">⬅️</button>

        <span>Page {{ currentPage }} / {{ totalPages }}</span>

        <button @click="nextPage" :disabled="currentPage === totalPages">➡️</button>
      </div>
    </div>

    <!-- MODAL -->
    <div v-if="modalSale" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <h3>Détails vente</h3>

        <p><strong>Date :</strong> {{ formatDate(modalSale.date) }}</p>
        <p><strong>Client :</strong> {{ modalSale.clientName }}</p>

        <hr />

        <div v-for="i in modalSale.items" :key="i.productId">
          • {{ i.name }} —
          {{ i.qty }} × {{ formatMoney(i.price) }}
        </div>

        <hr />

        <div class="modal-total">
          Total : {{ formatMoney(modalSale.total) }}
        </div>

        <button class="btn primary" @click="closeModal">
          Fermer
        </button>
      </div>
    </div>

  </div>
</template>


<script>
import { db } from "../firebase"
import Sidebar from "../components/SidebarPage.vue"
import Navbar from '../components/NavbarPage.vue'
import { printInvoiceDirect } from "../utils/invoice"
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc
} from "firebase/firestore"

export default {
  data() {
    return {
      products: [],
      sales: [],
      cart: [],
      productId: "",
      qty: 1,
      loading: false,
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
  components: {
    Sidebar,
    Navbar
  },
  computed: {
    todaySalesCount() {
      const today = new Date().toDateString()
      return this.sales.filter(s => {
        const d = s.date?.seconds
          ? new Date(s.date.seconds * 1000)
          : new Date(s.date)
        return d.toDateString() === today
      }).length
    },

    todaySalesTotal() {
      const today = new Date().toDateString()
      return this.sales
        .filter(s => {
          const d = s.date?.seconds
            ? new Date(s.date.seconds * 1000)
            : new Date(s.date)
          return d.toDateString() === today
        })
        .reduce((sum, s) => sum + (s.total || 0), 0)
    },
    cartTotal() {
      return this.cart.reduce((s, i) => s + i.qty * i.price, 0)
    },
    totalPages() {
      return Math.ceil(this.sales.length / this.pageSize)
    },
    paginatedSales() {
      const start = (this.currentPage - 1) * this.pageSize
      return this.sales.slice(start, start + this.pageSize)
    }
  },

  methods: {
    async load() {
      const p = await getDocs(collection(db, "products"))
      this.products = p.docs.map(d => ({ id: d.id, ...d.data() }))

      await this.loadProducts()
      await this.loadSales()

    },
    formatMoney(amount) {
      return new Intl.NumberFormat("fr-FR").format(amount) + " FCFA"
    },
    async loadSales() {
      const snap = await getDocs(collection(db, "sales"))
      this.sales = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => {
          const da = a.date?.seconds
            ? a.date.seconds * 1000
            : new Date(a.date).getTime()

          const db = b.date?.seconds
            ? b.date.seconds * 1000
            : new Date(b.date).getTime()

          return db - da
        })

    },
    async loadProducts() {
      const p = await getDocs(collection(db, "products"))
      this.products = p.docs.map(d => ({
        id: d.id,
        ...d.data()
      }))
    },

    addToCart() {
      const p = this.products.find(x => x.id === this.productId)
      if (!p) return

      const existing = this.cart.find(i => i.productId === p.id)
      if (existing) {
        existing.qty += this.qty
      } else {
        const stock = p.stocks?.[this.depotId] || 0

        const deja = this.cart.find(i => i.productId === p.id)?.qty || 0

        if (deja + this.qty > stock) {
          alert("Stock insuffisant.")
          return
        }

        this.cart.push({
          productId: p.id,
          name: p.name,
          price: p.price,
          qty: this.qty
        })
      }

      this.productId = ""
      this.qty = 1
    },

    removeFromCart(id) {
      this.cart = this.cart.filter(i => i.productId !== id)
    },

    async saveSale() {
      if (!this.cart.length) return;

      this.loading = true;

      try {
        // Vérification des stocks
        for (const i of this.cart) {
          const p = this.products.find(x => x.id === i.productId);
          const current = p.stocks?.[this.depotId] || 0;

          if (current < i.qty) {
            throw new Error(`Stock insuffisant pour ${i.name}`);
          }
        }

        // Mise à jour des stocks
        for (const i of this.cart) {
          const p = this.products.find(x => x.id === i.productId);
          const current = p.stocks?.[this.depotId] || 0;

          await updateDoc(doc(db, "products", p.id), {
            [`stocks.${this.depotId}`]: current - i.qty
          });
        }

        // Recharger les produits une seule fois
        await this.load();

        // Création de la vente
        const sale = {
          depotId: this.depotId,
          items: this.cart,
          clientName: this.clientName || "Client comptant",
          remark: this.remark || "",
          total: this.cartTotal,
          seller:
            this.currentUser?.name ||
            this.currentUser?.username ||
            "Inconnu",
          date: new Date()
        };

        const ref = await addDoc(collection(db, "sales"), sale);

        await printInvoiceDirect(
          { id: ref.id, total: sale.total },
          sale.items,
          sale.clientName,
          { name: "Dépôt principal" }
        );

        // Réinitialisation
        this.cart = [];
        this.clientName = "";
        this.remark = "";

        await this.loadSales();

        alert("Vente enregistrée avec succès !");
      } catch (error) {
        console.error(error);
        alert(error.message || "Une erreur est survenue lors de l'enregistrement de la vente.");
      } finally {
        // S'exécute toujours, qu'il y ait une erreur ou non
        this.loading = false;
      }
    },


    async deleteSale(sale) {
      if (!confirm("Supprimer cette vente ?")) return

      for (const i of sale.items) {
        const p = this.products.find(x => x.id === i.productId)
        const current = p.stocks?.[sale.depotId] || 0
        await updateDoc(doc(db, "products", p.id), {
          [`stocks.${sale.depotId}`]: current + i.qty
        })
      }

      await deleteDoc(doc(db, "sales", sale.id))
      await this.load()
      if (this.currentPage > this.totalPages) {
        // this.currentPage = this.totalPages || 1
        this.currentPage = 1

      }
    },

    openModal(sale) {
      this.modalSale = sale
      this.openedSale = sale.id
    },

    closeModal() {
      this.modalSale = null
      this.openedSale = null
    },

    prevPage() {
      if (this.currentPage > 1) this.currentPage--
    },
    nextPage() {
      if (this.currentPage < this.totalPages) this.currentPage++
    },

    formatDate(date) {
      if (!date) return ""
      const d = date.seconds ? new Date(date.seconds * 1000) : new Date(date)
      return d.toLocaleString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
    }
  },

  mounted() {
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    this.currentUser = user
    this.load()
  }
}
</script>


<style scoped>
/* ===== PAGE ===== */
.page {
  max-width: 1000px;
  margin: auto;
  padding: 16px;
}

.title {
  margin-bottom: 16px;
  text-align: center;
  font-size: clamp(1.3rem, 4vw, 1.8rem);
}

/* ===== CARD ===== */
.card {
  background: #fff;
  padding: 16px;
  margin-bottom: 16px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* ===== FORM ===== */
.form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

select,
input,
textarea {
  /* padding: 10px; */
  border-radius: 8px;
  border: 1px solid #ccc;
  width: 100%;
  padding: 10px 0;
  font-size: 1rem;
}

/* ===== BOUTONS ===== */
.btn {
  padding: 10px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  background: #ddd;
  font-size: 1rem;
}

.primary {
  background: linear-gradient(135deg, #1d6b2f, #45b05e);
  color: white;
}

.danger {
  background: #ef4444;
  color: white;
  border-radius: 6px;
  padding: 6px 10px;
  border: none;
}

.full {
  width: 100%;
  margin-top: 12px;
}

/* ===== PANIER ===== */
.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.cart-item .meta {
  font-size: 0.9rem;
  color: #555;
}

.header {
  margin-bottom: 20px;
}

.summary {
  display: flex;
  gap: 15px;
  margin-top: 10px;
}

.summary-card {
  background: white;
  padding: 10px 16px;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
}

.summary-card span {
  font-size: 0.75rem;
  color: #64748b;
}

.summary-card strong {
  font-size: 1rem;
}

.summary-card.green {
  border-left: 4px solid #16a34a;
}

.cart-card {
  border-left: 4px solid linear-gradient(135deg, #1d6b2f, #45b05e);
}

.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #eee;
}

.cart-left .meta {
  font-size: 0.85rem;
  color: #64748b;
}

.cart-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.line-total {
  font-weight: 600;
  color: #16a34a;
}

.total-box {
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
  font-size: 1.1rem;
  font-weight: 700;
  padding-top: 10px;
  border-top: 2px solid #eee;
}

.modal-total {
  font-size: 1.2rem;
  font-weight: 700;
  margin: 10px 0;
}

.total {
  text-align: right;
  margin-top: 10px;
  font-size: 1.05rem;
}

/* ===== HISTORIQUE ===== */
.entry {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
}

.entry button {
  align-self: flex-end;
}

.entry.selected {
  background: #e0f2fe;
}

.meta {
  font-size: 0.85rem;
  color: #555;
}

.badge {
  background: linear-gradient(135deg, #1d6b2f, #45b05e);
  color: white;
  padding: 3px 8px;
  border-radius: 10px;
  font-size: 0.75rem;
  margin-left: 8px;
}

/* ===== PAGINATION ===== */
.pagination {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 10px;
}

/* ===== MODAL ===== */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal {
  background: white;
  padding: 20px;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
}

/* ===== LOADING ===== */
.loading-indicator {
  display: flex;
  justify-content: center;
}

.loading-indicator::after {
  content: "";
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 3px solid #06283D;
  border-top-color: #F2994A;
  border-bottom-color: #F2994A;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ===== TABLETTE & + ===== */
@media (min-width: 768px) {
  .form {
    flex-direction: row;
  }

  .form select,
  .form input,
  .form textarea {
    flex: 1;
  }

  .form .btn {
    width: auto;
  }

  .entry {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
