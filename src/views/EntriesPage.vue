
<template>
  <Navbar />
  <Sidebar />

  <main class="page">
    <!-- HEADER -->
    <header class="page-header">
      <div>
        <span class="eyebrow">GESTION DES APPROVISIONNEMENTS</span>
        <h1>Entrées de stock</h1>
        <p>Enregistrez et suivez les approvisionnements de votre dépôt.</p>
      </div>

      <div class="header-date">
        <span class="date-dot"></span>
        {{ todayLabel }}
      </div>
    </header>

    <!-- STATISTIQUES -->
    <section class="stats-grid">
      <article class="stat-card">
        <div class="stat-icon blue">
          <span>📥</span>
        </div>
        <div>
          <span class="stat-label">Total des entrées</span>
          <strong>{{ entries.length }}</strong>
          <small>Enregistrements effectués</small>
        </div>
      </article>

      <article class="stat-card">
        <div class="stat-icon green">
          <span>📅</span>
        </div>
        <div>
          <span class="stat-label">Entrées aujourd'hui</span>
          <strong>{{ todayEntriesCount }}</strong>
          <small>Approvisionnements du jour</small>
        </div>
      </article>

      <article class="stat-card">
        <div class="stat-icon purple">
          <span>📦</span>
        </div>
        <div>
          <span class="stat-label">Articles réceptionnés</span>
          <strong>{{ totalUnits }}</strong>
          <small>Quantités cumulées</small>
        </div>
      </article>

      <article class="stat-card">
        <div class="stat-icon orange">
          <span>🛒</span>
        </div>
        <div>
          <span class="stat-label">Panier actuel</span>
          <strong>{{ cart.length }}</strong>
          <small>{{ cartTotalQty }} unité(s) à enregistrer</small>
        </div>
      </article>
    </section>

    <!-- AJOUT D'UNE ENTRÉE -->
    <section class="content-card">
      <div class="section-heading">
        <div>
          <h2>Nouvel approvisionnement</h2>
          <p>Ajoutez les produits réceptionnés dans votre dépôt.</p>
        </div>
        <span class="section-icon">＋</span>
      </div>

      <div class="form-grid">
        <div class="form-group product-field">
          <label>Produit</label>
          <select v-model="productId">
            <option disabled value="">Sélectionner un produit</option>
            <option
              v-for="p in products"
              :key="p.id"
              :value="p.id"
            >
              {{ p.name }} — {{ formatMoney(p.price) }}/casier
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>Quantité (casiers)</label>
          <input
            v-model.number="qty"
            type="number"
            min="1"
            step="1"
            placeholder="Ex : 10"
            @keyup.enter="addToCart"
          />
        </div>

        <div class="form-group action-field">
          <label>&nbsp;</label>
          <button
            class="btn btn-primary"
            @click="addToCart"
            :disabled="!products.length"
          >
            <span>＋</span> Ajouter au panier
          </button>
        </div>
      </div>

      <div v-if="selectedProduct" class="product-preview">
        <div class="preview-icon">📦</div>
        <div>
          <strong>{{ selectedProduct.name }}</strong>
          <span>
            Stock actuel :
            <b>{{ getProductStock(selectedProduct) }} casier(s)</b>
          </span>
        </div>
        <div class="preview-price">
          {{ formatMoney(selectedProduct.price) }}
          <small>FCFA / casier</small>
        </div>
      </div>

      <div v-if="!products.length && !pageLoading" class="empty-products">
        Aucun produit disponible. Ajoutez d'abord des produits.
      </div>
    </section>

    <!-- PANIER -->
    <section v-if="cart.length" class="content-card cart-section">
      <div class="section-heading">
        <div>
          <h2>Panier de réception</h2>
          <p>{{ cart.length }} produit(s) sélectionné(s)</p>
        </div>
        <span class="cart-count">{{ cartTotalQty }} casier(s)</span>
      </div>

      <div class="cart-list">
        <div
          v-for="item in cart"
          :key="item.productId"
          class="cart-item"
        >
          <div class="cart-product-icon">📦</div>

          <div class="cart-product-info">
            <strong>{{ item.name }}</strong>
            <span>{{ formatMoney(item.price) }} FCFA / casier</span>
          </div>

          <div class="cart-quantity">
            <button
              @click="changeCartQty(item.productId, -1)"
              :disabled="loading"
              aria-label="Diminuer la quantité"
            >−</button>
            <strong>{{ item.qty }}</strong>
            <button
              @click="changeCartQty(item.productId, 1)"
              :disabled="loading"
              aria-label="Augmenter la quantité"
            >＋</button>
          </div>

          <div class="cart-subtotal">
            {{ formatMoney(item.price * item.qty) }}
            <small>FCFA</small>
          </div>

          <button
            class="remove-btn"
            @click="removeFromCart(item.productId)"
            :disabled="loading"
            title="Retirer du panier"
          >
            ✕
          </button>
        </div>
      </div>

      <div class="cart-footer">
        <div>
          <span>Quantité totale</span>
          <strong>{{ cartTotalQty }} casier(s)</strong>
        </div>

        <button
          class="btn btn-success"
          @click="saveEntry"
          :disabled="loading || !cart.length"
        >
          <span v-if="loading" class="spinner"></span>
          <span v-else>✓ Valider l'entrée</span>
        </button>
      </div>
    </section>

    <!-- HISTORIQUE -->
    <section class="content-card history-section">
      <div class="section-heading history-heading">
        <div>
          <h2>Historique des entrées</h2>
          <p>Consultez les approvisionnements précédents.</p>
        </div>

        <div class="history-count">
          {{ filteredEntries.length }} résultat(s)
        </div>
      </div>

      <div class="history-toolbar">
        <div class="search-box">
          <span>⌕</span>
          <input
            v-model="search"
            type="text"
            placeholder="Rechercher un produit ou un responsable..."
          />
        </div>
      </div>

      <div v-if="pageLoading" class="loading-state">
        <span class="spinner dark"></span>
        <p>Chargement des entrées...</p>
      </div>

      <div
        v-else-if="!filteredEntries.length"
        class="empty-state"
      >
        <div class="empty-icon">📥</div>
        <h3>Aucune entrée trouvée</h3>
        <p>
          {{ search
            ? "Aucun résultat ne correspond à votre recherche."
            : "Les entrées de stock apparaîtront ici après leur enregistrement."
          }}
        </p>
      </div>

      <div v-else class="table-wrapper">
        <table class="entries-table">
          <thead>
            <tr>
              <th>Référence</th>
              <th>Date</th>
              <th>Responsable</th>
              <th>Produits</th>
              <th>Quantité totale</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="entry in paginatedEntries"
              :key="entry.id"
              :class="{ selected: openedEntry === entry.id }"
              @click="openModal(entry)"
            >
              <td>
                <span class="reference">
                  #{{ entry.id.slice(0, 7).toUpperCase() }}
                </span>
              </td>

              <td>
                <span class="date-cell">
                  {{ formatDate(entry.date) }}
                </span>
              </td>

              <td>
                <div class="seller-cell">
                  <span class="seller-avatar">
                    {{ getInitials(entry.seller) }}
                  </span>
                  {{ entry.seller || "Inconnu" }}
                </div>
              </td>

              <td>
                <span class="product-badge">
                  {{ entry.items?.length || 0 }} produit(s)
                </span>
              </td>

              <td>
                <strong class="quantity-cell">
                  {{ getEntryTotalQty(entry) }} casier(s)
                </strong>
              </td>

              <td>
                <div class="action-buttons">
                  <button
                    class="view-btn"
                    @click.stop="openModal(entry)"
                    title="Voir les détails"
                  >
                    <span>↗</span>
                  </button>

                  <button
                    v-if="currentUser?.role === 'Administrateur'"
                    class="delete-btn"
                    @click.stop="deleteEntry(entry)"
                    :disabled="deletingId === entry.id"
                    title="Supprimer cette entrée"
                  >
                    <span v-if="deletingId === entry.id" class="spinner dark"></span>
                    <span v-else>✕</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- PAGINATION -->
      <div
        v-if="filteredEntries.length > pageSize"
        class="pagination"
      >
        <span>
          {{ (currentPage - 1) * pageSize + 1 }} –
          {{ Math.min(currentPage * pageSize, filteredEntries.length) }}
          sur {{ filteredEntries.length }}
        </span>

        <div class="pagination-actions">
          <button
            :disabled="currentPage === 1"
            @click="prevPage"
          >←</button>

          <span>{{ currentPage }} / {{ totalPages }}</span>

          <button
            :disabled="currentPage === totalPages"
            @click="nextPage"
          >→</button>
        </div>
      </div>
    </section>

    <!-- MODAL DÉTAILS -->
    <div
      v-if="modalEntry"
      class="modal-overlay"
      @click.self="closeModal"
      @keydown.esc="closeModal"
    >
      <div class="detail-modal">
        <div class="modal-header">
          <div>
            <span class="eyebrow">DÉTAIL DE L'OPÉRATION</span>
            <h2>Entrée de stock</h2>
            <p>
              Référence #{{ modalEntry.id.slice(0, 7).toUpperCase() }}
            </p>
          </div>

          <button class="modal-close" @click="closeModal">✕</button>
        </div>

        <div class="modal-meta">
          <div>
            <span>Date</span>
            <strong>{{ formatDateTime(modalEntry.date) }}</strong>
          </div>
          <div>
            <span>Responsable</span>
            <strong>{{ modalEntry.seller || "Inconnu" }}</strong>
          </div>
        </div>

        <h3 class="detail-title">Produits réceptionnés</h3>

        <div class="detail-list">
          <div
            v-for="(item, index) in modalEntry.items || []"
            :key="item.productId || index"
            class="detail-item"
          >
            <div class="detail-product-icon">📦</div>
            <div class="detail-product-name">
              <strong>{{ item.name || "Produit supprimé" }}</strong>
              <span>{{ formatMoney(item.price || 0) }} FCFA / casier</span>
            </div>
            <div class="detail-qty">
              +{{ item.qty }}
              <small>casiers</small>
            </div>
          </div>
        </div>

        <div class="modal-total">
          <span>Quantité totale réceptionnée</span>
          <strong>{{ getEntryTotalQty(modalEntry) }} casier(s)</strong>
        </div>

        <button class="btn btn-primary modal-done" @click="closeModal">
          Fermer
        </button>
      </div>
    </div>
  </main>
</template>

<script>
import Navbar from "../components/NavbarPage.vue";
import Sidebar from "../components/SidebarPage.vue";
import { db } from "../firebase";

import {
  collection,
  getDocs,
  doc,
  runTransaction
} from "firebase/firestore";

export default {
  components: {
    Navbar,
    Sidebar
  },

  data() {
    return {
      products: [],
      entries: [],
      cart: [],

      productId: "",
      qty: 1,

      loading: false,
      pageLoading: true,
      deletingId: null,

      currentUser: null,
      depotId: "J5x1X8Cw10ErpwYM0Oyn",

      openedEntry: null,
      modalEntry: null,

      search: "",
      currentPage: 1,
      pageSize: 8
    };
  },

  computed: {
    selectedProduct() {
      return this.products.find(p => p.id === this.productId) || null;
    },

    todayLabel() {
      return new Date().toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
      });
    },

    todayEntriesCount() {
      return this.entries.filter(entry => this.isToday(entry.date)).length;
    },

    totalUnits() {
      return this.entries.reduce(
        (total, entry) => total + this.getEntryTotalQty(entry),
        0
      );
    },

    cartTotalQty() {
      return this.cart.reduce((total, item) => total + item.qty, 0);
    },

    filteredEntries() {
      const query = this.search.trim().toLowerCase();

      if (!query) return this.entries;

      return this.entries.filter(entry => {
        const reference = entry.id?.toLowerCase() || "";
        const seller = entry.seller?.toLowerCase() || "";
        const date = this.formatDate(entry.date).toLowerCase();

        const products = (entry.items || [])
          .map(item => item.name || "")
          .join(" ")
          .toLowerCase();

        return (
          reference.includes(query) ||
          seller.includes(query) ||
          date.includes(query) ||
          products.includes(query)
        );
      });
    },

    totalPages() {
      return Math.max(
        1,
        Math.ceil(this.filteredEntries.length / this.pageSize)
      );
    },

    paginatedEntries() {
      const start = (this.currentPage - 1) * this.pageSize;

      return this.filteredEntries.slice(
        start,
        start + this.pageSize
      );
    }
  },

  watch: {
    search() {
      this.currentPage = 1;
    }
  },

  methods: {
    async load() {
      this.pageLoading = true;

      try {
        const [productsSnap, entriesSnap] = await Promise.all([
          getDocs(collection(db, "products")),
          getDocs(collection(db, "entries"))
        ]);

        this.products = productsSnap.docs.map(d => ({
          id: d.id,
          ...d.data()
        }));

        this.entries = entriesSnap.docs
          .map(d => ({
            id: d.id,
            ...d.data()
          }))
          .sort((a, b) => this.getDateValue(b.date) - this.getDateValue(a.date));

      } catch (error) {
        console.error("Erreur de chargement :", error);
        alert("Impossible de charger les données. Vérifiez votre connexion.");
      } finally {
        this.pageLoading = false;
      }
    },

    getDateValue(date) {
      if (!date) return 0;
      if (typeof date.toMillis === "function") return date.toMillis();
      if (date instanceof Date) return date.getTime();
      if (typeof date === "number") return date;

      const parsed = new Date(date).getTime();
      return Number.isNaN(parsed) ? 0 : parsed;
    },

    formatDate(date) {
      const value = this.getDateValue(date);

      if (!value) return "Date inconnue";

      return new Date(value).toLocaleDateString("fr-FR");
    },

    formatDateTime(date) {
      const value = this.getDateValue(date);

      if (!value) return "Date inconnue";

      return new Date(value).toLocaleString("fr-FR", {
        dateStyle: "medium",
        timeStyle: "short"
      });
    },

    isToday(date) {
      const value = this.getDateValue(date);
      if (!value) return false;

      const d = new Date(value);
      const today = new Date();

      return (
        d.getDate() === today.getDate() &&
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear()
      );
    },

    formatMoney(value) {
      return Number(value || 0).toLocaleString("fr-FR");
    },

    getProductStock(product) {
      const value = Number(product?.stocks?.[this.depotId] || 0);
      return Number.isFinite(value) ? value : 0;
    },

    getEntryTotalQty(entry) {
      return (entry.items || []).reduce(
        (total, item) => total + Math.max(0, Number(item.qty) || 0),
        0
      );
    },

    getInitials(name) {
      return String(name || "I")
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(part => part.charAt(0).toUpperCase())
        .join("");
    },

    addToCart() {
      const product = this.selectedProduct;
      const quantity = Number(this.qty);

      if (!product) {
        alert("Veuillez sélectionner un produit.");
        return;
      }

      if (!Number.isInteger(quantity) || quantity <= 0) {
        alert("Veuillez saisir une quantité entière supérieure à zéro.");
        return;
      }

      const existing = this.cart.find(
        item => item.productId === product.id
      );

      if (existing) {
        existing.qty += quantity;
      } else {
        this.cart.push({
          productId: product.id,
          name: product.name,
          price: Number(product.price) || 0,
          qty: quantity
        });
      }

      this.qty = 1;
      this.productId = "";
    },

    changeCartQty(productId, amount) {
      const item = this.cart.find(i => i.productId === productId);
      if (!item) return;

      const nextQty = item.qty + amount;

      if (nextQty <= 0) {
        this.removeFromCart(productId);
        return;
      }

      item.qty = nextQty;
    },

    removeFromCart(productId) {
      this.cart = this.cart.filter(
        item => item.productId !== productId
      );
    },

    async saveEntry() {
      if (this.loading) return;

      if (!this.cart.length) {
        alert("Votre panier est vide.");
        return;
      }

      // Vérification avant enregistrement
      const invalidItem = this.cart.find(
        item => !Number.isInteger(item.qty) || item.qty <= 0
      );

      if (invalidItem) {
        alert("Une quantité du panier est invalide.");
        return;
      }

      this.loading = true;

      try {
        const itemsToSave = this.cart.map(item => ({ ...item }));
        const entryRef = doc(collection(db, "entries"));
        const seller =
          this.currentUser?.name ||
          this.currentUser?.username ||
          "Inconnu";

        await runTransaction(db, async transaction => {
          // Toutes les lectures doivent précéder les écritures.
          const productRefs = itemsToSave.map(item =>
            doc(db, "products", item.productId)
          );

          const snapshots = await Promise.all(
            productRefs.map(ref => transaction.get(ref))
          );

          snapshots.forEach((snapshot, index) => {
            if (!snapshot.exists()) {
              throw new Error(
                `Le produit "${itemsToSave[index].name}" n'existe plus.`
              );
            }
          });

          // Mise à jour des stocks
          snapshots.forEach((snapshot, index) => {
            const item = itemsToSave[index];
            const productData = snapshot.data();

            const currentStock = Number(
              productData.stocks?.[this.depotId] || 0
            );

            if (!Number.isFinite(currentStock) || currentStock < 0) {
              throw new Error(
                `Le stock actuel de "${item.name}" est invalide.`
              );
            }

            transaction.update(productRefs[index], {
              [`stocks.${this.depotId}`]: currentStock + item.qty
            });
          });

          // Création de l'historique dans la même transaction
          transaction.set(entryRef, {
            depotId: this.depotId,
            items: itemsToSave,
            seller,
            date: new Date()
          });
        });

        this.cart = [];
        this.productId = "";
        this.qty = 1;

        await this.load();

        alert("Entrée de stock enregistrée avec succès.");

      } catch (error) {
        console.error("Erreur d'enregistrement :", error);
        alert(
          error.message ||
          "Une erreur est survenue pendant l'enregistrement de l'entrée."
        );
      } finally {
        this.loading = false;
      }
    },

    async deleteEntry(entry) {
      if (this.currentUser?.role !== "Administrateur") {
        alert("Vous n'avez pas l'autorisation de supprimer cette entrée.");
        return;
      }

      if (this.deletingId) return;

      const confirmed = confirm(
        `Voulez-vous vraiment supprimer cette entrée du ${this.formatDate(entry.date)} ?\n\nLes quantités seront retirées du stock.`
      );

      if (!confirmed) return;

      this.deletingId = entry.id;

      try {
        const entryRef = doc(db, "entries", entry.id);

        await runTransaction(db, async transaction => {
          // Relire l'entrée pour éviter de travailler sur une ancienne version.
          const entrySnapshot = await transaction.get(entryRef);

          if (!entrySnapshot.exists()) {
            throw new Error("Cette entrée n'existe plus.");
          }

          const freshEntry = entrySnapshot.data();
          const depotId = freshEntry.depotId || this.depotId;

          // Regrouper les quantités par produit, y compris les anciennes entrées.
          const quantities = new Map();

          for (const item of freshEntry.items || []) {
            const id = item.productId;
            const quantity = Number(item.qty);

            if (!id || !Number.isInteger(quantity) || quantity <= 0) {
              throw new Error(
                "Cette entrée contient une quantité ou un produit invalide."
              );
            }

            quantities.set(
              id,
              (quantities.get(id) || 0) + quantity
            );
          }

          const productIds = [...quantities.keys()];
          const productRefs = productIds.map(id =>
            doc(db, "products", id)
          );

          // Lire tous les produits avant de commencer les écritures.
          const productSnapshots = await Promise.all(
            productRefs.map(ref => transaction.get(ref))
          );

          productSnapshots.forEach((snapshot, index) => {
            const productId = productIds[index];

            if (!snapshot.exists()) {
              throw new Error(
                `Impossible de supprimer cette entrée : un produit (${productId}) n'existe plus.`
              );
            }

            const currentStock = Number(
              snapshot.data().stocks?.[depotId] || 0
            );

            const quantityToRemove = quantities.get(productId);

            if (
              !Number.isFinite(currentStock) ||
              currentStock < quantityToRemove
            ) {
              throw new Error(
                `Stock insuffisant pour annuler l'entrée du produit "${snapshot.data().name || productId}". Suppression annulée.`
              );
            }
          });

          // Toutes les vérifications sont faites : on peut écrire.
          productSnapshots.forEach((snapshot, index) => {
            const productId = productIds[index];
            const currentStock = Number(
              snapshot.data().stocks?.[depotId] || 0
            );

            transaction.update(productRefs[index], {
              [`stocks.${depotId}`]:
                currentStock - quantities.get(productId)
            });
          });

          transaction.delete(entryRef);
        });

        if (this.modalEntry?.id === entry.id) {
          this.closeModal();
        }

        await this.load();

        alert("Entrée supprimée et stock mis à jour.");

      } catch (error) {
        console.error("Erreur de suppression :", error);
        alert(
          error.message ||
          "Impossible de supprimer cette entrée."
        );
      } finally {
        this.deletingId = null;
      }
    },

    openModal(entry) {
      this.modalEntry = entry;
      this.openedEntry = entry.id;
    },

    closeModal() {
      this.modalEntry = null;
      this.openedEntry = null;
    },

    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },

    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    }
  },

  mounted() {
    try {
      this.currentUser = JSON.parse(
        localStorage.getItem("user") || "{}"
      );
    } catch {
      this.currentUser = null;
    }

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
}

/* HEADER */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 28px;
}

.eyebrow {
  display: block;
  color: #2563eb;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.5px;
  margin-bottom: 8px;
}

.page-header h1 {
  font-size: 29px;
  font-weight: 800;
  letter-spacing: -1px;
  margin: 0;
  color: #14213d;
}

.page-header p {
  color: #8490a5;
  margin: 7px 0 0;
  font-size: 13px;
}

.header-date {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 11px 16px;
  background: white;
  border: 1px solid #e9edf4;
  border-radius: 12px;
  color: #68758b;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.date-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #16a36a;
  box-shadow: 0 0 0 4px #e6f7ef;
}

/* STATISTIQUES */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: #fff;
  border: 1px solid #edf0f5;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  min-width: 0;
  box-shadow: 0 4px 16px rgba(25, 42, 70, 0.035);
  transition: transform .2s, box-shadow .2s;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 9px 25px rgba(25, 42, 70, 0.07);
}

.stat-icon {
  width: 45px;
  height: 45px;
  min-width: 45px;
  display: grid;
  place-items: center;
  border-radius: 13px;
  font-size: 20px;
}

.stat-icon.blue {
  background: #eaf1ff;
}

.stat-icon.green {
  background: #e8f8f0;
}

.stat-icon.purple {
  background: #f1ebff;
}

.stat-icon.orange {
  background: #fff2e5;
}

.stat-label {
  display: block;
  color: #8792a5;
  font-size: 11px;
  font-weight: 600;
  margin-bottom: 5px;
}

.stat-card strong {
  display: block;
  font-size: 23px;
  font-weight: 800;
  color: #19243a;
  line-height: 1.2;
}

.stat-card small {
  display: block;
  color: #a1aaba;
  font-size: 10px;
  margin-top: 5px;
}

/* CARTES */
.content-card {
  background: #fff;
  border: 1px solid #edf0f5;
  border-radius: 17px;
  padding: 24px;
  margin-bottom: 22px;
  box-shadow: 0 4px 18px rgba(25, 42, 70, 0.035);
}

.section-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
  margin-bottom: 22px;
}

.section-heading h2 {
  color: #1c2940;
  font-size: 17px;
  font-weight: 800;
  margin: 0;
  letter-spacing: -.3px;
}

.section-heading p {
  color: #96a0b0;
  font-size: 12px;
  margin: 6px 0 0;
}

.section-icon {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  background: #eaf1ff;
  color: #2563eb;
  border-radius: 11px;
  font-size: 22px;
  font-weight: 700;
}

/* FORMULAIRE */
.form-grid {
  display: grid;
  grid-template-columns: 2fr 1fr auto;
  gap: 15px;
  align-items: end;
}

.form-group {
  min-width: 0;
}

.form-group label {
  display: block;
  color: #536078;
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 9px;
}

.form-group input,
.form-group select {
  width: 100%;
  height: 45px;
  border: 1px solid #e4e9f1;
  border-radius: 10px;
  background: #fbfcfe;
  padding: 0 13px;
  color: #27344b;
  font-size: 13px;
  outline: none;
  transition: .2s;
}

.form-group input:focus,
.form-group select:focus {
  border-color: #6c9bfa;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, .09);
}

.btn {
  height: 45px;
  padding: 0 19px;
  border: none;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: .2s;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

.btn:disabled {
  opacity: .55;
  cursor: not-allowed;
}

.btn-primary {
  background: #2563eb;
  color: white;
  box-shadow: 0 4px 10px rgba(37, 99, 235, .16);
}

.btn-primary:hover:not(:disabled) {
  background: #1d4ed8;
  transform: translateY(-1px);
}

.btn-success {
  background: #0e9f6e;
  color: white;
  padding: 0 24px;
  box-shadow: 0 4px 10px rgba(14, 159, 110, .15);
}

.btn-success:hover:not(:disabled) {
  background: #087f5b;
  transform: translateY(-1px);
}

.product-preview {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 13px;
  background: #f7f9fd;
  border: 1px solid #edf0f5;
  border-radius: 12px;
  margin-top: 18px;
}

.preview-icon,
.cart-product-icon,
.detail-product-icon {
  width: 39px;
  height: 39px;
  min-width: 39px;
  display: grid;
  place-items: center;
  border-radius: 11px;
  background: #eaf1ff;
  font-size: 18px;
}

.product-preview strong {
  display: block;
  font-size: 12px;
  color: #27344b;
}

.product-preview span {
  display: block;
  color: #8b96a8;
  font-size: 11px;
  margin-top: 4px;
}

.product-preview span b {
  color: #15966b;
}

.preview-price {
  margin-left: auto;
  color: #2563eb;
  font-size: 13px;
  font-weight: 800;
  text-align: right;
}

.preview-price small {
  display: block;
  color: #99a3b3;
  font-size: 10px;
  font-weight: 500;
  margin-top: 3px;
}

.empty-products {
  margin-top: 15px;
  color: #b7791f;
  font-size: 12px;
  background: #fff8e8;
  border-radius: 9px;
  padding: 12px;
}

/* PANIER */
.cart-section {
  border-color: #dce8ff;
}

.cart-count {
  padding: 8px 12px;
  color: #2563eb;
  background: #eaf1ff;
  border-radius: 9px;
  font-size: 11px;
  font-weight: 800;
  white-space: nowrap;
}

.cart-list {
  display: flex;
  flex-direction: column;
}

.cart-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 0;
  border-bottom: 1px solid #f0f2f6;
}

.cart-item:last-child {
  border-bottom: none;
}

.cart-product-info {
  flex: 1;
  min-width: 0;
}

.cart-product-info strong {
  display: block;
  font-size: 13px;
  color: #26344c;
}

.cart-product-info span {
  display: block;
  font-size: 11px;
  color: #98a2b2;
  margin-top: 4px;
}

.cart-quantity {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f6f8fc;
  padding: 5px;
  border-radius: 9px;
}

.cart-quantity button {
  width: 25px;
  height: 25px;
  border: none;
  border-radius: 7px;
  color: #2563eb;
  background: white;
  font-size: 17px;
  cursor: pointer;
}

.cart-quantity button:disabled {
  opacity: .5;
  cursor: not-allowed;
}

.cart-quantity strong {
  min-width: 18px;
  text-align: center;
  font-size: 12px;
}

.cart-subtotal {
  min-width: 100px;
  text-align: right;
  font-size: 13px;
  font-weight: 800;
  color: #26344c;
}

.cart-subtotal small {
  color: #9aa4b4;
  font-size: 10px;
  font-weight: 500;
}

.remove-btn {
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 8px;
  background: #fff0f0;
  color: #e05252;
  cursor: pointer;
}

.remove-btn:disabled {
  opacity: .5;
  cursor: not-allowed;
}

.cart-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
  border-top: 1px solid #edf0f5;
  padding-top: 18px;
  margin-top: 8px;
}

.cart-footer span {
  display: block;
  color: #929daf;
  font-size: 11px;
  margin-bottom: 5px;
}

.cart-footer strong {
  font-size: 17px;
  color: #1c2940;
}

/* HISTORIQUE */
.history-count {
  color: #77849a;
  font-size: 11px;
  font-weight: 700;
  background: #f3f5f9;
  padding: 8px 12px;
  border-radius: 8px;
}

.history-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 9px;
  width: min(100%, 380px);
  height: 41px;
  padding: 0 12px;
  border: 1px solid #e8ecf3;
  border-radius: 10px;
  background: #fbfcfe;
}

.search-box span {
  color: #8995a8;
  font-size: 22px;
}

.search-box input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  font-size: 12px;
  color: #27344b;
}

.table-wrapper {
  width: 100%;
  overflow-x: auto;
}

.entries-table {
  width: 100%;
  border-collapse: collapse;
  white-space: nowrap;
}

.entries-table th {
  text-align: left;
  padding: 13px 12px;
  color: #929daf;
  background: #f8f9fc;
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: .5px;
}

.entries-table th:first-child {
  border-radius: 8px 0 0 8px;
}

.entries-table th:last-child {
  border-radius: 0 8px 8px 0;
}

.entries-table td {
  padding: 15px 12px;
  border-bottom: 1px solid #f0f2f6;
  font-size: 12px;
  color: #59667c;
}

.entries-table tbody tr {
  cursor: pointer;
  transition: background .15s;
}

.entries-table tbody tr:hover,
.entries-table tbody tr.selected {
  background: #f7f9ff;
}

.reference {
  color: #2563eb;
  font-size: 11px;
  font-weight: 800;
}

.date-cell {
  color: #536078;
  font-weight: 600;
}

.seller-cell {
  display: flex;
  align-items: center;
  gap: 9px;
  color: #536078;
  font-weight: 600;
}

.seller-avatar {
  width: 28px;
  height: 28px;
  border-radius: 9px;
  display: grid;
  place-items: center;
  background: #eaf1ff;
  color: #2563eb;
  font-size: 10px;
  font-weight: 800;
}

.product-badge {
  background: #f1edff;
  color: #7652c8;
  padding: 6px 9px;
  border-radius: 7px;
  font-size: 10px;
  font-weight: 700;
}

.quantity-cell {
  color: #15966b;
  font-size: 12px;
}

.action-buttons {
  display: flex;
  gap: 7px;
}

.view-btn,
.delete-btn {
  width: 30px;
  height: 30px;
  display: grid;
  place-items: center;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
}

.view-btn {
  color: #2563eb;
  background: #eaf1ff;
}

.delete-btn {
  color: #dc5252;
  background: #fff0f0;
}

.delete-btn:disabled {
  opacity: .6;
  cursor: wait;
}

/* PAGINATION */
.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-top: 18px;
  color: #929daf;
  font-size: 11px;
}

.pagination-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pagination-actions button {
  width: 30px;
  height: 30px;
  border: 1px solid #e7ebf2;
  border-radius: 8px;
  background: white;
  color: #536078;
  cursor: pointer;
}

.pagination-actions button:disabled {
  opacity: .4;
  cursor: not-allowed;
}

.pagination-actions span {
  font-weight: 700;
  color: #536078;
}

/* ÉTATS VIDES ET CHARGEMENT */
.loading-state,
.empty-state {
  padding: 45px 15px;
  text-align: center;
  color: #97a2b3;
}

.loading-state p {
  font-size: 12px;
}

.empty-icon {
  font-size: 35px;
  margin-bottom: 12px;
}

.empty-state h3 {
  color: #344158;
  font-size: 14px;
  margin: 0 0 7px;
}

.empty-state p {
  font-size: 12px;
  margin: 0;
}

.spinner {
  display: inline-block;
  width: 15px;
  height: 15px;
  border: 2px solid rgba(255,255,255,.4);
  border-top-color: white;
  border-radius: 50%;
  animation: spin .7s linear infinite;
}

.spinner.dark {
  border-color: #dce3ed;
  border-top-color: #2563eb;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* MODAL */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(15, 23, 42, .55);
  backdrop-filter: blur(5px);
}

.detail-modal {
  width: 100%;
  max-width: 540px;
  max-height: 90vh;
  overflow-y: auto;
  background: white;
  border-radius: 19px;
  padding: 27px;
  box-shadow: 0 25px 70px rgba(0,0,0,.2);
  animation: modalIn .2s ease;
}

@keyframes modalIn {
  from {
    opacity: 0;
    transform: translateY(10px) scale(.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 15px;
}

.modal-header h2 {
  color: #19243a;
  font-size: 21px;
  margin: 0;
}

.modal-header p {
  color: #98a2b2;
  font-size: 11px;
  margin: 6px 0 0;
}

.modal-close {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 9px;
  color: #6b778a;
  background: #f2f4f8;
  cursor: pointer;
}

.modal-meta {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin: 22px 0;
  padding: 15px;
  border-radius: 12px;
  background: #f7f9fc;
}

.modal-meta span {
  display: block;
  color: #929daf;
  font-size: 10px;
  margin-bottom: 6px;
}

.modal-meta strong {
  display: block;
  color: #344158;
  font-size: 12px;
}

.detail-title {
  color: #27344b;
  font-size: 13px;
  margin: 0 0 12px;
}

.detail-list {
  display: flex;
  flex-direction: column;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 12px 0;
  border-bottom: 1px solid #eff1f5;
}

.detail-product-name {
  flex: 1;
  min-width: 0;
}

.detail-product-name strong {
  display: block;
  color: #344158;
  font-size: 12px;
}

.detail-product-name span {
  display: block;
  color: #9aa4b4;
  font-size: 10px;
  margin-top: 4px;
}

.detail-qty {
  color: #15966b;
  font-size: 13px;
  font-weight: 800;
  text-align: right;
}

.detail-qty small {
  display: block;
  color: #9aa4b4;
  font-size: 9px;
  font-weight: 500;
}

.modal-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  padding: 17px 0;
  color: #647188;
  font-size: 12px;
}

.modal-total strong {
  color: #15966b;
  font-size: 14px;
}

.modal-done {
  width: 100%;
}

/* RESPONSIVE */
@media (max-width: 1100px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .form-grid {
    grid-template-columns: 1fr 1fr;
  }

  .action-field {
    grid-column: 1 / -1;
  }

  .action-field .btn {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .page {
    margin-left: 0;
    padding: 22px 15px;
  }

  .page-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .page-header h1 {
    font-size: 25px;
  }

  .header-date {
    font-size: 11px;
  }

  .stats-grid {
    gap: 10px;
  }

  .stat-card {
    padding: 14px 11px;
    gap: 10px;
  }

  .stat-icon {
    width: 37px;
    height: 37px;
    min-width: 37px;
    font-size: 17px;
  }

  .stat-card strong {
    font-size: 19px;
  }

  .stat-label {
    font-size: 10px;
  }

  .stat-card small {
    font-size: 9px;
  }

  .content-card {
    padding: 17px;
    border-radius: 14px;
  }

  .form-grid {
    grid-template-columns: 1fr;
    gap: 13px;
  }

  .action-field {
    grid-column: auto;
  }

  .cart-item {
    flex-wrap: wrap;
    gap: 10px;
  }

  .cart-product-info {
    flex: 1;
  }

  .cart-quantity {
    order: 3;
  }

  .cart-subtotal {
    order: 4;
    margin-left: auto;
  }

  .remove-btn {
    order: 5;
  }

  .cart-footer {
    align-items: stretch;
    flex-direction: column;
  }

  .cart-footer .btn {
    width: 100%;
  }

  .history-heading {
    align-items: flex-start;
  }

  .detail-modal {
    padding: 20px;
  }
}

@media (max-width: 420px) {
  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }

  .stat-card {
    align-items: flex-start;
    flex-direction: column;
  }

  .section-heading h2 {
    font-size: 15px;
  }

  .cart-count {
    font-size: 10px;
    padding: 7px 9px;
  }

  .modal-meta {
    grid-template-columns: 1fr;
  }

  .pagination {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
