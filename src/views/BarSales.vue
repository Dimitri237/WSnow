
<template>
  <Navbar />
  <Sidebar />

  <main class="page">

    <!-- HEADER -->
    <header class="page-header">
      <div>
        <div class="eyebrow">GESTION COMMERCIALE</div>
        <h1>Vente Bar <span class="header-icon">🍺</span></h1>
        <p>Gérez vos ventes de boissons et suivez votre activité.</p>
      </div>

      <div class="header-date">
        <span class="date-dot"></span>
        {{ currentDate }}
      </div>
    </header>

    <!-- STATISTIQUES -->
    <section class="stats-grid">

      <div class="stat-card">
        <div class="stat-top">
          <span class="stat-label">Ventes aujourd'hui</span>
          <div class="stat-icon blue">🧾</div>
        </div>
        <div class="stat-value">{{ todayCount }}</div>
        <div class="stat-footer">Transactions enregistrées</div>
      </div>

      <div class="stat-card">
        <div class="stat-top">
          <span class="stat-label">Chiffre d'affaires</span>
          <div class="stat-icon green">💰</div>
        </div>
        <div class="stat-value">{{ formatMoney(todayTotal) }}</div>
        <div class="stat-footer">Total encaissé aujourd'hui</div>
      </div>

      <div class="stat-card">
        <div class="stat-top">
          <span class="stat-label">Bouteilles vendues</span>
          <div class="stat-icon orange">🍾</div>
        </div>
        <div class="stat-value">{{ todayBottles }}</div>
        <div class="stat-footer">Équivalent bouteilles</div>
      </div>

      <div class="stat-card">
        <div class="stat-top">
          <span class="stat-label">Produits disponibles</span>
          <div class="stat-icon purple">📦</div>
        </div>
        <div class="stat-value">{{ products.length }}</div>
        <div class="stat-footer">Références du bar</div>
      </div>

    </section>

    <div class="main-grid">

      <!-- ZONE DE VENTE -->
      <section class="sales-column">

        <!-- INFORMATIONS CLIENT -->
        <div class="panel">
          <div class="panel-heading">
            <div>
              <span class="section-kicker">NOUVELLE TRANSACTION</span>
              <h2>Informations client</h2>
            </div>
            <span class="step-number">01</span>
          </div>

          <div class="form-grid">
            <div class="field">
              <label>Nom du client</label>
              <input
                v-model.trim="clientName"
                type="text"
                placeholder="Ex : Jean Dupont"
              />
            </div>

            <div class="field">
              <label>Observation</label>
              <input
                v-model.trim="remark"
                type="text"
                placeholder="Observation facultative"
              />
            </div>
          </div>
        </div>

        <!-- AJOUT PRODUIT -->
        <div class="panel">
          <div class="panel-heading">
            <div>
              <span class="section-kicker">COMPOSITION DE LA VENTE</span>
              <h2>Ajouter une boisson</h2>
            </div>
            <span class="step-number">02</span>
          </div>

          <div class="field">
            <label>Choisir une boisson</label>
            <select v-model="productId">
              <option value="">Sélectionner un produit</option>

              <option
                v-for="p in products"
                :key="p.id"
                :value="p.id"
                :disabled="Number(p.quantityBottle || 0) <= 0"
              >
                {{ p.name }} — {{ Number(p.quantityBottle || 0) }} bouteilles disponibles
              </option>
            </select>
          </div>

          <div class="form-grid product-fields">

            <div class="field">
              <label>Type de vente</label>
              <select v-model="type">
                <option value="bottle">🍾 Bouteille</option>
                <option value="crate">📦 Casier (12 bouteilles)</option>
              </select>
            </div>

            <div class="field">
              <label>Quantité</label>
              <input
                v-model.number="qty"
                type="number"
                min="1"
                step="1"
                @keyup.enter="addCart"
              />
            </div>

          </div>

          <div v-if="selectedProduct" class="product-preview">
            <div class="preview-info">
              <div class="preview-avatar">🍺</div>
              <div>
                <strong>{{ selectedProduct.name }}</strong>
                <span>
                  Stock : {{ selectedProduct.quantityBottle || 0 }} bouteilles
                  · {{ selectedProduct.quantityCrate ?? Math.floor((selectedProduct.quantityBottle || 0) / 12) }} casiers
                </span>
              </div>
            </div>

            <div class="preview-price">
              <strong>
                {{ formatMoney(type === 'crate' ? selectedProduct.priceCrate : selectedProduct.priceBottle) }}
              </strong>
              <span>{{ type === 'crate' ? 'Par casier' : 'Par bouteille' }}</span>
            </div>
          </div>

          <button
            class="btn btn-primary add-button"
            @click="addCart"
            :disabled="!selectedProduct"
          >
            <span>＋</span> Ajouter au panier
          </button>
        </div>

        <!-- PANIER -->
        <div class="panel cart-panel">
          <div class="panel-heading">
            <div>
              <span class="section-kicker">RÉCAPITULATIF</span>
              <h2>Votre panier</h2>
            </div>

            <span class="cart-count">{{ cart.length }} article(s)</span>
          </div>

          <div v-if="cart.length" class="cart-list">

            <div
              v-for="(item, index) in cart"
              :key="item.productId + item.type"
              class="cart-item"
            >
              <div class="cart-product">
                <div class="cart-avatar">
                  {{ item.type === 'crate' ? '📦' : '🍾' }}
                </div>

                <div class="cart-product-info">
                  <strong>{{ item.name }}</strong>
                  <span>
                    {{ item.type === 'crate' ? 'Casier' : 'Bouteille' }}
                    · {{ formatMoney(item.price) }} / unité
                  </span>
                </div>
              </div>

              <div class="cart-quantity">
                <button @click="changeCartQty(index, -1)" :disabled="item.qty <= 1">
                  −
                </button>
                <span>{{ item.qty }}</span>
                <button @click="changeCartQty(index, 1)">+</button>
              </div>

              <div class="cart-item-total">
                <strong>{{ formatMoney(item.total) }}</strong>
                <button class="remove-btn" @click="removeCart(item)" title="Supprimer">
                  <icon name="trash-2" size="16" />
                </button>
              </div>
            </div>

          </div>

          <div v-else class="empty-cart">
            <div class="empty-icon">🛒</div>
            <strong>Votre panier est vide</strong>
            <span>Ajoutez des boissons pour commencer une vente.</span>
          </div>

          <div v-if="cart.length" class="cart-summary">
            <div class="summary-line">
              <span>Nombre de lignes</span>
              <strong>{{ cart.length }}</strong>
            </div>

            <div class="summary-line">
              <span>Total des articles</span>
              <strong>{{ totalCartUnits }} unités</strong>
            </div>

            <div class="cart-total">
              <span>Total à payer</span>
              <strong>{{ formatMoney(cartTotal) }}</strong>
            </div>

            <button
              class="btn btn-primary validate-button"
              @click="saveSale"
              :disabled="loading || !cart.length"
            >
              <span v-if="loading" class="spinner"></span>
              <span v-else>✓</span>
              {{ loading ? 'Enregistrement...' : 'Valider et enregistrer la vente' }}
            </button>
          </div>
        </div>

      </section>

      <!-- COLONNE INFORMATIONS -->
      <aside class="side-column">

        <div class="panel side-panel">
          <div class="panel-heading">
            <div>
              <span class="section-kicker">INVENTAIRE</span>
              <h2>État du stock</h2>
            </div>
            <span class="stock-icon">📦</span>
          </div>

          <div class="stock-overview">
            <strong>{{ totalStockBottles }}</strong>
            <span>Bouteilles disponibles</span>
          </div>

          <div class="stock-divider"></div>

          <div class="stock-list">
            <div
              v-for="p in lowStockProducts"
              :key="p.id"
              class="stock-row"
            >
              <div class="stock-product">
                <span class="stock-status" :class="Number(p.quantityBottle || 0) <= 0 ? 'danger' : 'warning'"></span>
                <span>{{ p.name }}</span>
              </div>

              <strong>{{ p.quantityBottle || 0 }}</strong>
            </div>

            <div v-if="!lowStockProducts.length" class="stock-ok">
              <span>✓</span>
              Tous les stocks sont suffisants.
            </div>
          </div>
        </div>

        <div class="tip-card">
          <div class="tip-icon">💡</div>
          <h3>Bon à savoir</h3>
          <p>
            Un casier correspond à 12 bouteilles. Le stock est automatiquement
            recalculé après chaque vente.
          </p>
        </div>

      </aside>

    </div>

    <!-- HISTORIQUE -->
    <section class="panel history-panel">

      <div class="panel-heading history-heading">
        <div>
          <span class="section-kicker">SUIVI DES TRANSACTIONS</span>
          <h2>Historique des ventes</h2>
          <p>Consultez les transactions effectuées dans votre bar.</p>
        </div>

        <div class="history-count">
          {{ filteredSales.length }} vente(s)
        </div>
      </div>

      <div class="history-toolbar">
        <div class="search-box">
          <icon name="search" size="18" />
          <input
            v-model="search"
            type="text"
            placeholder="Rechercher un client..."
          />
        </div>
      </div>

      <div v-if="salesLoading" class="loading-state">
        <span class="spinner"></span>
        Chargement des ventes...
      </div>

      <div v-else-if="!filteredSales.length" class="empty-history">
        <span>📋</span>
        <strong>Aucune vente trouvée</strong>
        <p>Les ventes enregistrées apparaîtront ici.</p>
      </div>

      <div v-else class="history-content">

        <div
          v-for="day in groupedSales"
          :key="day.key"
          class="day-group"
        >

          <div class="day-heading">
            <div class="day-title">
              <span class="day-icon">📅</span>
              <strong>{{ day.date }}</strong>
            </div>

            <div class="day-summary">
              {{ day.sales.length }} vente(s)
              <strong>{{ formatMoney(day.total) }}</strong>
            </div>
          </div>

          <div class="sales-table">

            <div class="table-header">
              <span>TRANSACTION</span>
              <span>CLIENT</span>
              <span>ARTICLES</span>
              <span>MONTANT</span>
              <span></span>
            </div>

            <div
              v-for="s in day.sales"
              :key="s.id"
              class="sale-row"
              @click="openModal(s)"
            >
              <div class="sale-date">
                <strong>{{ formatTime(s.date) }}</strong>
                <span>#{{ s.id.slice(0, 7) }}</span>
              </div>

              <div class="sale-client">
                <div class="client-avatar">
                  {{ getInitial(s.clientName) }}
                </div>
                <strong>{{ s.clientName || 'Client comptant' }}</strong>
              </div>

              <div class="sale-articles">
                {{ s.items?.length || 0 }} article(s)
              </div>

              <div class="sale-amount">
                {{ formatMoney(s.total) }}
              </div>

              <button class="detail-button" title="Voir les détails">
                <icon name="chevron-right" size="18" />
              </button>
            </div>

          </div>

        </div>

        <!-- PAGINATION -->
        <div class="pagination">
          <span>
            Page {{ page }} sur {{ totalPages }}
          </span>

          <div class="pagination-actions">
            <button @click="page--" :disabled="page <= 1">
              <icon name="chevron-left" size="17" />
            </button>

            <button @click="page++" :disabled="page >= totalPages">
              <icon name="chevron-right" size="17" />
            </button>
          </div>
        </div>

      </div>
    </section>

    <!-- MODAL DÉTAILS -->
    <div
      v-if="modalSale"
      class="modal-overlay"
      @click.self="modalSale = null"
      @keydown.esc="modalSale = null"
    >
      <div class="sale-modal">

        <div class="modal-header">
          <div>
            <span class="section-kicker">DÉTAIL DE TRANSACTION</span>
            <h2>Détails de la vente</h2>
          </div>

          <button class="close-modal" @click="modalSale = null">
            <icon name="x" size="20" />
          </button>
        </div>

        <div class="modal-info">
          <div>
            <span>Client</span>
            <strong>{{ modalSale.clientName || 'Client comptant' }}</strong>
          </div>

          <div>
            <span>Date</span>
            <strong>{{ formatDate(modalSale.date) }}</strong>
          </div>
        </div>

        <div class="modal-items">
          <h3>Articles vendus</h3>

          <div
            v-for="(item, index) in modalSale.items || []"
            :key="index"
            class="modal-item"
          >
            <div class="modal-item-info">
              <span class="modal-item-icon">
                {{ item.type === 'crate' ? '📦' : '🍾' }}
              </span>

              <div>
                <strong>{{ item.name }}</strong>
                <span>
                  {{ item.qty }} × {{ item.type === 'crate' ? 'Casier' : 'Bouteille' }}
                </span>
              </div>
            </div>

            <strong>{{ formatMoney(item.total) }}</strong>
          </div>
        </div>

        <div v-if="modalSale.remark" class="modal-remark">
          <span>Observation</span>
          <p>{{ modalSale.remark }}</p>
        </div>

        <div class="modal-total">
          <span>Total de la vente</span>
          <strong>{{ formatMoney(modalSale.total) }}</strong>
        </div>

        <button class="btn btn-primary modal-close-button" @click="modalSale = null">
          Fermer
        </button>

      </div>
    </div>

  </main>
</template>

<script>
import Navbar from "../components/NavbarPage.vue";
import Sidebar from "../components/SidebarPage.vue";

import {
  collection,
  getDocs,
  doc,
  runTransaction
} from "firebase/firestore";

import { db } from "../firebase";
import { printInvoiceDirect } from "../utils/invoice";

export default {
  components: {
    Navbar,
    Sidebar
  },

  data() {
    return {
      products: [],
      sales: [],
      cart: [],

      productId: "",
      type: "bottle",
      qty: 1,

      clientName: "",
      remark: "",

      loading: false,
      salesLoading: true,

      search: "",
      page: 1,
      pageSize: 10,

      modalSale: null
    };
  },

  computed: {
    currentDate() {
      return new Intl.DateTimeFormat("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
      }).format(new Date());
    },

    selectedProduct() {
      return this.products.find(p => p.id === this.productId) || null;
    },

    cartTotal() {
      return this.cart.reduce((sum, item) => {
        return sum + Number(item.total || 0);
      }, 0);
    },

    totalCartUnits() {
      return this.cart.reduce((sum, item) => {
        return sum + Number(item.qty || 0);
      }, 0);
    },

    todaySales() {
      return this.sales.filter(s => this.isToday(s.date));
    },

    todayCount() {
      return this.todaySales.length;
    },

    todayTotal() {
      return this.todaySales.reduce((sum, sale) => {
        return sum + Number(sale.total || 0);
      }, 0);
    },

    todayBottles() {
      return this.todaySales.reduce((sum, sale) => {
        return sum + (sale.items || []).reduce((total, item) => {
          return total + (
            Number(item.qty || 0) *
            (item.type === "crate" ? 12 : 1)
          );
        }, 0);
      }, 0);
    },

    totalStockBottles() {
      return this.products.reduce((sum, p) => {
        return sum + Number(p.quantityBottle || 0);
      }, 0);
    },

    lowStockProducts() {
      return this.products
        .filter(p => Number(p.quantityBottle || 0) <= 24)
        .sort((a, b) => {
          return Number(a.quantityBottle || 0) - Number(b.quantityBottle || 0);
        })
        .slice(0, 6);
    },

    filteredSales() {
      const query = this.search.trim().toLowerCase();

      if (!query) return this.sales;

      return this.sales.filter(s => {
        const client = String(s.clientName || "").toLowerCase();
        const id = String(s.id || "").toLowerCase();

        return client.includes(query) || id.includes(query);
      });
    },

    totalPages() {
      return Math.max(1, Math.ceil(this.filteredSales.length / this.pageSize));
    },

    paginatedSales() {
      const start = (this.page - 1) * this.pageSize;

      return this.filteredSales.slice(start, start + this.pageSize);
    },

    groupedSales() {
      const groups = {};

      this.paginatedSales.forEach(sale => {
        const date = this.toDate(sale.date);

        const key = date
          ? `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
          : "date-inconnue";

        const label = date
          ? date.toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric"
            })
          : "Date inconnue";

        if (!groups[key]) {
          groups[key] = {
            key,
            date: label,
            sales: [],
            total: 0
          };
        }

        groups[key].sales.push(sale);
        groups[key].total += Number(sale.total || 0);
      });

      return Object.values(groups);
    }
  },

  watch: {
    search() {
      this.page = 1;
    },

    totalPages(value) {
      if (this.page > value) {
        this.page = value;
      }
    }
  },

  methods: {
    async load() {
      this.salesLoading = true;

      try {
        const [productsSnapshot, salesSnapshot] = await Promise.all([
          getDocs(collection(db, "barProducts")),
          getDocs(collection(db, "barSales"))
        ]);

        this.products = productsSnapshot.docs.map(d => ({
          id: d.id,
          ...d.data()
        }));

        this.sales = salesSnapshot.docs
          .map(d => ({
            id: d.id,
            ...d.data()
          }))
          .sort((a, b) => {
            return this.getTimestamp(b.date) - this.getTimestamp(a.date);
          });

      } catch (error) {
        console.error("Erreur de chargement :", error);
        alert("Impossible de charger les données du bar.");
      } finally {
        this.salesLoading = false;
      }
    },

    addCart() {
      const product = this.selectedProduct;

      if (!product) {
        alert("Veuillez sélectionner une boisson.");
        return;
      }

      const quantity = Number(this.qty);

      if (!Number.isInteger(quantity) || quantity <= 0) {
        alert("Veuillez saisir une quantité entière supérieure à zéro.");
        return;
      }

      const bottlesNeeded = quantity * (this.type === "crate" ? 12 : 1);
      const stock = Number(product.quantityBottle || 0);

      // Stock déjà réservé dans le panier pour ce produit.
      const alreadyInCart = this.cart
        .filter(item => item.productId === product.id)
        .reduce((sum, item) => {
          return sum + item.qty * (item.type === "crate" ? 12 : 1);
        }, 0);

      if (alreadyInCart + bottlesNeeded > stock) {
        alert(
          `Stock insuffisant pour ${product.name}.\n` +
          `Stock disponible : ${stock} bouteilles.\n` +
          `Déjà dans le panier : ${alreadyInCart} bouteilles.`
        );
        return;
      }

      const price = Number(
        this.type === "crate" ? product.priceCrate : product.priceBottle
      );

      if (!Number.isFinite(price) || price < 0) {
        alert("Le prix de ce produit est invalide.");
        return;
      }

      const existing = this.cart.find(item => {
        return item.productId === product.id && item.type === this.type;
      });

      if (existing) {
        existing.qty += quantity;
        existing.total = existing.qty * existing.price;
      } else {
        this.cart.push({
          productId: product.id,
          name: product.name,
          qty: quantity,
          type: this.type,
          price,
          total: price * quantity
        });
      }

      this.productId = "";
      this.qty = 1;
    },

    changeCartQty(index, variation) {
      const item = this.cart[index];

      if (!item) return;

      const newQty = item.qty + variation;

      if (newQty < 1) return;

      const product = this.products.find(p => p.id === item.productId);

      if (!product) {
        alert("Ce produit n'existe plus dans le stock.");
        return;
      }

      const bottlesNeeded = newQty * (item.type === "crate" ? 12 : 1);

      const otherItems = this.cart
        .filter((cartItem, i) => {
          return i !== index && cartItem.productId === item.productId;
        })
        .reduce((sum, cartItem) => {
          return sum + cartItem.qty * (cartItem.type === "crate" ? 12 : 1);
        }, 0);

      if (bottlesNeeded + otherItems > Number(product.quantityBottle || 0)) {
        alert("Stock insuffisant pour cette quantité.");
        return;
      }

      item.qty = newQty;
      item.total = item.qty * item.price;
    },

    removeCart(item) {
      this.cart = this.cart.filter(i => i !== item);
    },

    async saveSale() {
      if (this.loading) return;

      if (!this.cart.length) {
        alert("Votre panier est vide.");
        return;
      }

      // Copie du panier pour figer les données de la transaction.
      const items = this.cart.map(item => ({ ...item }));

      const total = items.reduce((sum, item) => {
        return sum + Number(item.total || 0);
      }, 0);

      if (!Number.isFinite(total) || total < 0) {
        alert("Le montant de la vente est invalide.");
        return;
      }

      this.loading = true;

      try {
        const saleRef = doc(collection(db, "barSales"));

        const client = this.clientName.trim() || "Client comptant";

        // Une transaction garantit que le stock et la vente
        // sont enregistrés ensemble ou pas du tout.
        await runTransaction(db, async transaction => {
          const requiredByProduct = {};

          items.forEach(item => {
            if (!Number.isInteger(Number(item.qty)) || Number(item.qty) <= 0) {
              throw new Error("Une quantité du panier est invalide.");
            }

            const bottles = Number(item.qty) *
              (item.type === "crate" ? 12 : 1);

            requiredByProduct[item.productId] =
              (requiredByProduct[item.productId] || 0) + bottles;
          });

          const updates = [];

          // Toutes les lectures sont effectuées avant les écritures.
          for (const productId of Object.keys(requiredByProduct)) {
            const productRef = doc(db, "barProducts", productId);
            const snapshot = await transaction.get(productRef);

            if (!snapshot.exists()) {
              throw new Error("Un produit du panier n'existe plus.");
            }

            const product = snapshot.data();
            const currentStock = Number(product.quantityBottle || 0);
            const required = requiredByProduct[productId];

            if (required > currentStock) {
              throw new Error(
                `Stock insuffisant pour ${product.name}. ` +
                `Disponible : ${currentStock} bouteilles.`
              );
            }

            const newStock = currentStock - required;

            updates.push({
              ref: productRef,
              quantityBottle: newStock,
              quantityCrate: Math.floor(newStock / 12)
            });
          }

          updates.forEach(update => {
            transaction.update(update.ref, {
              quantityBottle: update.quantityBottle,
              quantityCrate: update.quantityCrate
            });
          });

          transaction.set(saleRef, {
            items,
            clientName: client,
            remark: this.remark.trim(),
            total,
            date: new Date()
          });
        });

        // La vente est déjà enregistrée à ce stade.
        // Une erreur d'impression ne doit pas annuler la vente.
        this.cart = [];
        this.clientName = "";
        this.remark = "";
        this.productId = "";
        this.qty = 1;

        await this.load();

        try {
          await printInvoiceDirect(
            {
              id: saleRef.id,
              total
            },
            items,
            client,
            {
              name: "Bar"
            }
          );
        } catch (invoiceError) {
          console.error("Erreur impression facture :", invoiceError);
          alert("Vente enregistrée, mais l'impression de la facture a échoué.");
          return;
        }

        alert("Vente enregistrée avec succès.");

      } catch (error) {
        console.error("Erreur vente :", error);
        alert(error.message || "Une erreur est survenue lors de la vente.");
      } finally {
        this.loading = false;
      }
    },

    toDate(value) {
      if (!value) return null;

      if (value instanceof Date) {
        return isNaN(value.getTime()) ? null : value;
      }

      if (typeof value.toDate === "function") {
        return value.toDate();
      }

      if (typeof value === "number") {
        const date = new Date(value);
        return isNaN(date.getTime()) ? null : date;
      }

      if (typeof value === "string") {
        const date = new Date(value);
        return isNaN(date.getTime()) ? null : date;
      }

      if (value.seconds !== undefined) {
        const date = new Date(value.seconds * 1000);
        return isNaN(date.getTime()) ? null : date;
      }

      return null;
    },

    getTimestamp(value) {
      const date = this.toDate(value);
      return date ? date.getTime() : 0;
    },

    isToday(value) {
      const date = this.toDate(value);

      if (!date) return false;

      const today = new Date();

      return (
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate()
      );
    },

    formatMoney(value) {
      return new Intl.NumberFormat("fr-FR").format(
        Number(value) || 0
      ) + " FCFA";
    },

    formatDate(value) {
      const date = this.toDate(value);

      if (!date) return "Date inconnue";

      return date.toLocaleString("fr-FR");
    },

    formatTime(value) {
      const date = this.toDate(value);

      if (!date) return "--:--";

      return date.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit"
      });
    },

    getInitial(name) {
      return String(name || "C").trim().charAt(0).toUpperCase();
    },

    openModal(sale) {
      this.modalSale = sale;
    }
  },

  mounted() {
    this.load();
  }
};
</script>

<style scoped>
.page {
  margin-left: 250px;
  padding: 32px;
  min-height: 100vh;
  background: #f5f7fb;
  color: #172033;
  font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  box-sizing: border-box;
}

.page * {
  box-sizing: border-box;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-bottom: 28px;
}

.eyebrow,
.section-kicker {
  display: block;
  color: #8792a7;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.5px;
  margin-bottom: 8px;
}

.page-header h1 {
  font-size: 30px;
  font-weight: 800;
  letter-spacing: -1px;
  margin: 0;
  color: #172033;
}

.header-icon {
  font-size: 25px;
}

.page-header p {
  color: #8490a5;
  margin: 8px 0 0;
  font-size: 13px;
}

.header-date {
  display: flex;
  align-items: center;
  gap: 9px;
  background: white;
  padding: 12px 17px;
  border: 1px solid #e9edf4;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 700;
  color: #526078;
  text-transform: capitalize;
}

.date-dot {
  width: 8px;
  height: 8px;
  background: #16b879;
  border-radius: 50%;
  box-shadow: 0 0 0 4px #e4f8ef;
}

/* STATISTIQUES */

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 17px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  padding: 21px;
  border: 1px solid #e9edf4;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(24, 39, 75, 0.035);
  min-width: 0;
}

.stat-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.stat-label {
  color: #8390a5;
  font-size: 12px;
  font-weight: 600;
}

.stat-icon {
  width: 37px;
  height: 37px;
  display: grid;
  place-items: center;
  border-radius: 11px;
  font-size: 17px;
}

.stat-icon.blue {
  background: #edf4ff;
}

.stat-icon.green {
  background: #e8f9f1;
}

.stat-icon.orange {
  background: #fff4e7;
}

.stat-icon.purple {
  background: #f2edff;
}

.stat-value {
  font-size: 25px;
  font-weight: 800;
  letter-spacing: -0.7px;
  margin-top: 17px;
  overflow-wrap: anywhere;
}

.stat-footer {
  color: #a0aabc;
  font-size: 11px;
  margin-top: 6px;
}

/* STRUCTURE */

.main-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.7fr) minmax(260px, 0.8fr);
  align-items: start;
  gap: 20px;
}

.sales-column,
.side-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.panel {
  background: white;
  border: 1px solid #e9edf4;
  border-radius: 17px;
  padding: 23px;
  box-shadow: 0 4px 16px rgba(24, 39, 75, 0.035);
  min-width: 0;
}

.panel-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 22px;
}

.panel-heading h2 {
  margin: 0;
  color: #172033;
  font-size: 17px;
  font-weight: 800;
  letter-spacing: -0.3px;
}

.step-number {
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  background: #f0f4fa;
  color: #65738b;
  font-size: 12px;
  font-weight: 800;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 15px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.field label {
  color: #66738a;
  font-size: 12px;
  font-weight: 700;
}

.field input,
.field select {
  width: 100%;
  height: 46px;
  border: 1px solid #e4e9f1;
  border-radius: 10px;
  background: #fafbfd;
  padding: 0 13px;
  outline: none;
  color: #27344b;
  font-size: 13px;
  transition: 0.2s;
}

.field input:focus,
.field select:focus {
  border-color: #4384f5;
  background: white;
  box-shadow: 0 0 0 3px rgba(67, 132, 245, 0.09);
}

.field input::placeholder {
  color: #adb6c5;
}

.product-fields {
  margin-top: 15px;
}

.product-preview {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  background: #f7f9fc;
  padding: 13px;
  border-radius: 12px;
  margin-top: 17px;
}

.preview-info,
.cart-product {
  display: flex;
  align-items: center;
  gap: 11px;
  min-width: 0;
}

.preview-avatar,
.cart-avatar {
  width: 39px;
  height: 39px;
  display: grid;
  place-items: center;
  background: white;
  border: 1px solid #edf0f5;
  border-radius: 11px;
  flex-shrink: 0;
}

.preview-info strong,
.cart-product-info strong {
  display: block;
  font-size: 12px;
  color: #26334a;
}

.preview-info span,
.cart-product-info span {
  display: block;
  font-size: 10px;
  color: #8b97a9;
  margin-top: 5px;
}

.preview-price {
  text-align: right;
}

.preview-price strong {
  display: block;
  color: #2563eb;
  font-size: 13px;
}

.preview-price span {
  color: #97a2b3;
  font-size: 10px;
  display: block;
  margin-top: 4px;
}

.btn {
  border: none;
  cursor: pointer;
  border-radius: 11px;
  font-size: 13px;
  font-weight: 750;
  transition: 0.2s;
}

.btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.btn-primary {
  background: #2563eb;
  color: white;
  box-shadow: 0 5px 12px rgba(37, 99, 235, 0.17);
}

.btn-primary:hover:not(:disabled) {
  background: #1d4ed8;
  transform: translateY(-1px);
}

.add-button {
  width: 100%;
  height: 46px;
  margin-top: 18px;
}

.add-button span {
  font-size: 19px;
  vertical-align: -1px;
  margin-right: 5px;
}

/* PANIER */

.cart-count {
  background: #eff4ff;
  color: #3268d5;
  border-radius: 20px;
  padding: 7px 11px;
  font-size: 10px;
  font-weight: 800;
}

.cart-list {
  display: flex;
  flex-direction: column;
}

.cart-item {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  align-items: center;
  gap: 15px;
  padding: 13px 0;
  border-bottom: 1px solid #f0f2f6;
}

.cart-item:last-child {
  border-bottom: none;
}

.cart-product-info {
  min-width: 0;
}

.cart-product-info strong {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cart-quantity {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f5f7fb;
  border-radius: 9px;
  padding: 4px;
}

.cart-quantity button {
  width: 25px;
  height: 25px;
  border: none;
  border-radius: 6px;
  background: white;
  color: #52627c;
  cursor: pointer;
  font-size: 16px;
}

.cart-quantity button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.cart-quantity span {
  font-size: 12px;
  font-weight: 800;
  min-width: 13px;
  text-align: center;
}

.cart-item-total {
  text-align: right;
  min-width: 100px;
}

.cart-item-total strong {
  font-size: 12px;
  color: #26334a;
}

.remove-btn {
  display: block;
  margin: 7px 0 0 auto;
  padding: 4px;
  border: none;
  background: transparent;
  color: #e15b65;
  cursor: pointer;
}

.empty-cart {
  text-align: center;
  padding: 35px 10px;
  display: flex;
  align-items: center;
  flex-direction: column;
}

.empty-icon {
  width: 55px;
  height: 55px;
  background: #f3f6fb;
  border-radius: 17px;
  display: grid;
  place-items: center;
  font-size: 23px;
  margin-bottom: 12px;
}

.empty-cart strong {
  font-size: 13px;
}

.empty-cart span {
  color: #99a4b5;
  font-size: 11px;
  margin-top: 7px;
}

.cart-summary {
  margin-top: 17px;
  padding-top: 17px;
  border-top: 1px solid #edf0f5;
}

.summary-line {
  display: flex;
  justify-content: space-between;
  color: #8995a8;
  font-size: 12px;
  margin-bottom: 12px;
}

.summary-line strong {
  color: #3d4a60;
}

.cart-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: #f1f5ff;
  border-radius: 11px;
  margin: 15px 0;
  gap: 10px;
}

.cart-total span {
  color: #54637c;
  font-size: 12px;
  font-weight: 700;
}

.cart-total strong {
  color: #2159cf;
  font-size: 19px;
  font-weight: 850;
  overflow-wrap: anywhere;
}

.validate-button {
  width: 100%;
  height: 48px;
}

/* STOCK */

.stock-icon {
  font-size: 21px;
}

.stock-overview {
  background: linear-gradient(135deg, #edf4ff, #f5f8ff);
  border-radius: 13px;
  padding: 19px;
}

.stock-overview strong {
  display: block;
  font-size: 27px;
  color: #2563eb;
  font-weight: 850;
}

.stock-overview span {
  display: block;
  color: #8190a8;
  font-size: 11px;
  margin-top: 5px;
}

.stock-divider {
  height: 1px;
  background: #edf0f5;
  margin: 19px 0;
}

.stock-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.stock-row,
.stock-product {
  display: flex;
  align-items: center;
}

.stock-row {
  justify-content: space-between;
  gap: 10px;
  font-size: 11px;
}

.stock-product {
  gap: 9px;
  color: #66738a;
  min-width: 0;
}

.stock-product span:last-child {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stock-row strong {
  color: #26334a;
}

.stock-status {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.stock-status.warning {
  background: #f2a63a;
}

.stock-status.danger {
  background: #e85c67;
}

.stock-ok {
  color: #16a36b;
  font-size: 11px;
  background: #effaf5;
  padding: 12px;
  border-radius: 9px;
}

.stock-ok span {
  font-weight: 900;
  margin-right: 5px;
}

.tip-card {
  padding: 21px;
  border-radius: 16px;
  background: #172b4d;
  color: white;
}

.tip-icon {
  font-size: 24px;
  margin-bottom: 13px;
}

.tip-card h3 {
  font-size: 15px;
  margin: 0 0 9px;
}

.tip-card p {
  font-size: 11px;
  line-height: 1.8;
  color: #c2cde0;
  margin: 0;
}

/* HISTORIQUE */

.history-panel {
  margin-top: 23px;
}

.history-heading {
  margin-bottom: 17px;
}

.history-heading h2 {
  font-size: 19px;
}

.history-heading p {
  margin: 7px 0 0;
  color: #929daf;
  font-size: 11px;
}

.history-count {
  background: #f1f5fb;
  color: #64728a;
  border-radius: 9px;
  padding: 9px 12px;
  font-size: 11px;
  font-weight: 800;
}

.history-toolbar {
  margin-bottom: 22px;
}

.search-box {
  height: 43px;
  max-width: 350px;
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid #e6eaf1;
  border-radius: 10px;
  padding: 0 12px;
  color: #96a2b4;
  background: #fafbfd;
}

.search-box input {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  color: #34425b;
  font-size: 12px;
}

.day-group {
  margin-bottom: 23px;
}

.day-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 12px 14px;
  background: #f5f7fb;
  border-radius: 10px 10px 0 0;
}

.day-title {
  display: flex;
  align-items: center;
  gap: 9px;
  font-size: 12px;
  color: #42516a;
  text-transform: capitalize;
}

.day-summary {
  display: flex;
  align-items: center;
  gap: 13px;
  color: #8a96a8;
  font-size: 10px;
}

.day-summary strong {
  color: #2563eb;
  font-size: 11px;
}

.sales-table {
  border: 1px solid #edf0f5;
  border-radius: 0 0 10px 10px;
  overflow: hidden;
}

.table-header,
.sale-row {
  display: grid;
  grid-template-columns: 1fr 1.5fr 0.8fr 1fr 30px;
  align-items: center;
  gap: 12px;
  padding: 13px 15px;
}

.table-header {
  background: #fff;
  border-bottom: 1px solid #edf0f5;
  color: #a0aabc;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.5px;
}

.sale-row {
  cursor: pointer;
  border-bottom: 1px solid #f0f2f6;
  transition: 0.15s;
}

.sale-row:last-child {
  border-bottom: none;
}

.sale-row:hover {
  background: #f8faff;
}

.sale-date strong {
  display: block;
  font-size: 11px;
  color: #35435a;
}

.sale-date span {
  display: block;
  font-size: 9px;
  color: #a2adbc;
  margin-top: 4px;
}

.sale-client {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.sale-client strong {
  font-size: 11px;
  color: #526078;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.client-avatar {
  width: 29px;
  height: 29px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  border-radius: 9px;
  background: #edf3ff;
  color: #3972df;
  font-size: 11px;
  font-weight: 800;
}

.sale-articles {
  color: #8b97a9;
  font-size: 10px;
}

.sale-amount {
  color: #1c9b69;
  font-size: 11px;
  font-weight: 800;
}

.detail-button {
  width: 27px;
  height: 27px;
  display: grid;
  place-items: center;
  background: #f3f6fb;
  color: #7b8ba3;
  border: none;
  border-radius: 7px;
  cursor: pointer;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding-top: 20px;
  color: #8995a8;
  font-size: 11px;
}

.pagination-actions {
  display: flex;
  gap: 7px;
}

.pagination-actions button {
  width: 33px;
  height: 33px;
  display: grid;
  place-items: center;
  background: white;
  border: 1px solid #e6eaf1;
  border-radius: 8px;
  color: #53627b;
  cursor: pointer;
}

.pagination-actions button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.empty-history,
.loading-state {
  min-height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  color: #929daf;
  gap: 9px;
  font-size: 12px;
}

.empty-history > span {
  font-size: 28px;
}

.empty-history strong {
  color: #4c5a71;
}

.empty-history p {
  margin: 0;
}

/* MODAL */

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(14, 25, 45, 0.55);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.sale-modal {
  width: 100%;
  max-width: 490px;
  max-height: 90vh;
  overflow-y: auto;
  background: white;
  border-radius: 19px;
  padding: 25px;
  box-shadow: 0 20px 70px rgba(0, 0, 0, 0.2);
  animation: modalIn 0.2s ease-out;
}

@keyframes modalIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 23px;
}

.modal-header h2 {
  margin: 0;
  font-size: 19px;
}

.close-modal {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border: none;
  background: #f3f5f9;
  color: #66748b;
  border-radius: 9px;
  cursor: pointer;
}

.modal-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 15px;
  background: #f7f9fc;
  border-radius: 11px;
}

.modal-info span,
.modal-remark span {
  display: block;
  color: #9aa5b5;
  font-size: 10px;
  margin-bottom: 6px;
}

.modal-info strong {
  font-size: 11px;
  color: #3c4a62;
}

.modal-items {
  margin-top: 23px;
}

.modal-items h3 {
  font-size: 13px;
  margin: 0 0 13px;
}

.modal-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  padding: 12px 0;
  border-bottom: 1px solid #eff1f5;
}

.modal-item-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.modal-item-icon {
  width: 35px;
  height: 35px;
  display: grid;
  place-items: center;
  background: #f3f6fb;
  border-radius: 9px;
}

.modal-item-info strong {
  display: block;
  font-size: 11px;
}

.modal-item-info div span {
  display: block;
  font-size: 10px;
  color: #99a4b4;
  margin-top: 4px;
}

.modal-item > strong {
  font-size: 11px;
  color: #34435a;
}

.modal-remark {
  margin-top: 18px;
  background: #f8f9fc;
  padding: 12px;
  border-radius: 9px;
}

.modal-remark p {
  margin: 0;
  color: #53627a;
  font-size: 11px;
}

.modal-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
  padding: 16px;
  background: #edf3ff;
  border-radius: 11px;
}

.modal-total span {
  font-size: 12px;
  font-weight: 700;
  color: #61718d;
}

.modal-total strong {
  color: #245ed6;
  font-size: 17px;
  overflow-wrap: anywhere;
}

.modal-close-button {
  width: 100%;
  height: 44px;
  margin-top: 17px;
}

/* CHARGEMENT */

.spinner {
  width: 15px;
  height: 15px;
  display: inline-block;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  vertical-align: middle;
  margin-right: 7px;
}

.loading-state .spinner {
  width: 23px;
  height: 23px;
  border-color: #e1e8f5;
  border-top-color: #2563eb;
  margin: 0;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* RESPONSIVE */

@media (max-width: 1150px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .main-grid {
    grid-template-columns: 1fr;
  }

  .side-column {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 850px) {
  .page {
    margin-left: 0;
    padding: 22px 17px;
  }
}

@media (max-width: 600px) {
  .page {
    padding: 18px 12px;
  }

  .page-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .page-header h1 {
    font-size: 25px;
  }

  .header-date {
    font-size: 10px;
  }

  .stats-grid {
    gap: 10px;
  }

  .stat-card {
    padding: 14px;
    border-radius: 13px;
  }

  .stat-value {
    font-size: 19px;
  }

  .stat-label {
    font-size: 10px;
  }

  .stat-icon {
    width: 31px;
    height: 31px;
    font-size: 14px;
  }

  .stat-footer {
    font-size: 9px;
  }

  .panel {
    padding: 17px;
    border-radius: 14px;
  }

  .panel-heading h2 {
    font-size: 15px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .product-preview {
    align-items: flex-start;
    flex-direction: column;
  }

  .preview-price {
    text-align: left;
    padding-left: 50px;
  }

  .cart-item {
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 10px;
  }

  .cart-item-total {
    grid-column: 2;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 10px;
  }

  .remove-btn {
    margin: 0;
  }

  .side-column {
    grid-template-columns: 1fr;
  }

  .history-heading {
    align-items: flex-start;
  }

  .day-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .day-summary {
    width: 100%;
    justify-content: space-between;
  }

  .table-header {
    display: none;
  }

  .sale-row {
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    padding: 13px 10px;
  }

  .sale-articles {
    display: none;
  }

  .sale-amount {
    text-align: right;
  }

  .detail-button {
    display: none;
  }

  .pagination {
    font-size: 10px;
  }

  .sale-modal {
    padding: 19px;
  }

  .modal-info {
    grid-template-columns: 1fr;
  }
}
</style>
