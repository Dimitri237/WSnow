
<template>
  <Navbar />
  <Sidebar />

  <main class="page">

    <!-- HEADER -->
    <header class="page-header">
      <div>
        <span class="eyebrow">GESTION COMMERCIALE</span>
        <h1>Stock Bar <span>🍺</span></h1>
        <p>Gérez vos boissons, vos tarifs et vos disponibilités.</p>
      </div>

      <button class="btn btn-primary header-button" @click="startNewProduct">
        <icon name="plus" size="18" />
        Nouvelle boisson
      </button>
    </header>

    <!-- STATISTIQUES -->
    <section class="stats-grid">

      <div class="stat-card">
        <div class="stat-top">
          <span>Références boissons</span>
          <div class="stat-icon blue">🍺</div>
        </div>
        <strong class="stat-value">{{ products.length }}</strong>
        <span class="stat-footer">Produits enregistrés</span>
      </div>

      <div class="stat-card">
        <div class="stat-top">
          <span>Stock disponible</span>
          <div class="stat-icon green">🍾</div>
        </div>
        <strong class="stat-value">{{ totalBottles }}</strong>
        <span class="stat-footer">Bouteilles en stock</span>
      </div>

      <div class="stat-card">
        <div class="stat-top">
          <span>Valeur du stock</span>
          <div class="stat-icon purple">💰</div>
        </div>
        <strong class="stat-value">{{ formatMoney(stockValue) }}</strong>
        <span class="stat-footer">Estimation au prix bouteille</span>
      </div>

      <div class="stat-card">
        <div class="stat-top">
          <span>Alertes de stock</span>
          <div class="stat-icon orange">⚠️</div>
        </div>
        <strong class="stat-value">{{ lowStockCount }}</strong>
        <span class="stat-footer">Produits à surveiller</span>
      </div>

    </section>

    <!-- FORMULAIRE -->
    <section ref="formSection" class="panel form-panel">

      <div class="panel-heading">
        <div>
          <span class="section-kicker">
            {{ editMode ? 'MISE À JOUR' : 'NOUVEAU PRODUIT' }}
          </span>

          <h2>
            {{ editMode ? 'Modifier une boisson' : 'Ajouter une boisson' }}
          </h2>

          <p>
            {{ editMode
              ? 'Modifiez les informations de votre produit.'
              : 'Enregistrez une nouvelle référence dans votre stock.'
            }}
          </p>
        </div>

        <div class="form-icon">
          {{ editMode ? '✏️' : '🍺' }}
        </div>
      </div>

      <form @submit.prevent="saveProduct">

        <div class="product-form-grid">

          <!-- IMAGE -->
          <div class="image-section">

            <label class="field-label">Photo du produit</label>

            <div class="image-upload">

              <img
                v-if="form.photo"
                :src="form.photo"
                alt="Aperçu du produit"
              />

              <div v-else class="image-placeholder">
                <span>🍺</span>
                <strong>Aucune image</strong>
                <small>Ajoutez une photo</small>
              </div>

            </div>

            <label class="upload-button">
              <icon name="image-plus" size="16" />
              Choisir une image

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                @change="convertImage"
              />
            </label>

            <button
              v-if="form.photo"
              type="button"
              class="remove-image"
              @click="form.photo = ''"
            >
              Supprimer la photo
            </button>

            <small class="image-hint">
              JPG, PNG ou WebP. Taille maximale : 1 Mo.
            </small>

          </div>

          <!-- CHAMPS -->
          <div class="fields-section">

            <div class="field">
              <label>Nom de la boisson <span>*</span></label>
              <input
                v-model.trim="form.name"
                type="text"
                placeholder="Ex : Guinness, 33 Export..."
                required
                maxlength="100"
              />
            </div>

            <div class="form-grid">

              <div class="field">
                <label>Prix bouteille (FCFA) <span>*</span></label>
                <div class="input-with-icon">
                  <span>🍾</span>
                  <input
                    v-model.number="form.priceBottle"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="Ex : 1000"
                    required
                  />
                </div>
              </div>

              <div class="field">
                <label>Prix casier (FCFA) <span>*</span></label>
                <div class="input-with-icon">
                  <span>📦</span>
                  <input
                    v-model.number="form.priceCrate"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="Ex : 12000"
                    required
                  />
                </div>
              </div>

            </div>

            <div class="field">
              <label>Nombre de casiers disponibles <span>*</span></label>
              <input
                v-model.number="form.quantityCrate"
                type="number"
                min="0"
                step="1"
                placeholder="Ex : 20"
                required
              />
            </div>

            <!-- APERÇU STOCK -->
            <div class="stock-preview">

              <div class="preview-heading">
                <span>📊</span>
                Aperçu du stock
              </div>

              <div class="preview-grid">

                <div>
                  <strong>{{ safeCrates }}</strong>
                  <span>Casiers</span>
                </div>

                <div class="preview-separator"></div>

                <div>
                  <strong>{{ safeCrates * 12 }}</strong>
                  <span>Bouteilles</span>
                </div>

                <div class="preview-separator"></div>

                <div>
                  <strong>{{ formatMoney(safeCrates * 12 * safePriceBottle) }}</strong>
                  <span>Valeur au détail</span>
                </div>

              </div>

            </div>

            <div class="form-actions">

              <button
                v-if="editMode"
                type="button"
                class="btn btn-light"
                @click="reset"
              >
                Annuler
              </button>

              <button
                type="submit"
                class="btn btn-primary save-button"
                :disabled="saving"
              >
                <span v-if="saving" class="spinner"></span>
                <icon v-else :name="editMode ? 'save' : 'plus'" size="17" />

                {{ saving
                  ? 'Enregistrement...'
                  : editMode
                    ? 'Enregistrer les modifications'
                    : 'Ajouter la boisson'
                }}
              </button>

            </div>

          </div>

        </div>

      </form>

    </section>

    <!-- INVENTAIRE -->
    <section class="panel inventory-panel">

      <div class="panel-heading inventory-heading">
        <div>
          <span class="section-kicker">INVENTAIRE DU BAR</span>
          <h2>Boissons disponibles</h2>
          <p>Consultez et gérez toutes les références de votre bar.</p>
        </div>

        <span class="product-count">
          {{ filteredProducts.length }} produit(s)
        </span>
      </div>

      <!-- RECHERCHE ET FILTRES -->
      <div class="toolbar">

        <div class="search-box">
          <icon name="search" size="18" />
          <input
            v-model="search"
            type="text"
            placeholder="Rechercher une boisson..."
          />
        </div>

        <select v-model="stockFilter" class="filter-select">
          <option value="all">Tous les stocks</option>
          <option value="available">En stock</option>
          <option value="low">Stock faible</option>
          <option value="empty">Épuisé</option>
        </select>

        <select v-model="sortBy" class="filter-select">
          <option value="name">Trier par nom</option>
          <option value="stock">Trier par stock</option>
          <option value="price">Trier par prix</option>
        </select>

      </div>

      <!-- CHARGEMENT -->
      <div v-if="loading" class="loading-state">
        <span class="spinner blue-spinner"></span>
        Chargement de l'inventaire...
      </div>

      <!-- VIDE -->
      <div v-else-if="!paginatedProducts.length" class="empty-state">
        <div>🍺</div>
        <strong>Aucune boisson trouvée</strong>
        <p>
          {{ search || stockFilter !== 'all'
            ? 'Essayez de modifier vos critères de recherche.'
            : 'Ajoutez votre première boisson pour commencer.'
          }}
        </p>

        <button
          v-if="!search && stockFilter === 'all'"
          class="btn btn-primary"
          @click="startNewProduct"
        >
          Ajouter une boisson
        </button>
      </div>

      <!-- PRODUITS -->
      <div v-else class="products-grid">

        <article
          v-for="p in paginatedProducts"
          :key="p.id"
          class="product-card"
        >

          <div class="product-image">

            <img
              v-if="p.photo"
              :src="p.photo"
              :alt="p.name"
              loading="lazy"
            />

            <div v-else class="no-photo">
              🍺
            </div>

            <span
              class="stock-badge"
              :class="stockClass(p)"
            >
              {{ stockLabel(p) }}
            </span>

          </div>

          <div class="product-content">

            <div class="product-title-row">
              <h3>{{ p.name }}</h3>
              <span class="product-reference">
                #{{ p.id.slice(0, 6) }}
              </span>
            </div>

            <div class="prices-grid">

              <div class="price-box">
                <span>🍾 Bouteille</span>
                <strong>{{ formatMoney(p.priceBottle) }}</strong>
              </div>

              <div class="price-box">
                <span>📦 Casier</span>
                <strong>{{ formatMoney(p.priceCrate) }}</strong>
              </div>

            </div>

            <div class="product-stock">

              <div class="stock-heading">
                <span>Stock disponible</span>
                <strong>{{ Number(p.quantityBottle || 0) }} bouteilles</strong>
              </div>

              <div class="stock-progress">
                <div
                  class="stock-progress-bar"
                  :class="stockClass(p)"
                  :style="{ width: stockPercentage(p) + '%' }"
                ></div>
              </div>

              <div class="stock-details">
                <span>
                  {{ Number(p.quantityCrate ?? Math.floor((p.quantityBottle || 0) / 12)) }}
                  casiers
                </span>

                <span>
                  {{ Number(p.quantityBottle || 0) }} / {{ stockCapacity(p) }}
                </span>
              </div>

            </div>

            <div class="product-actions">

              <button
                class="action-btn edit-btn"
                @click="editProduct(p)"
              >
                <icon name="pencil" size="15" />
                Modifier
              </button>

              <button
                class="action-btn delete-btn"
                @click="removeProduct(p)"
                :disabled="deletingId === p.id"
              >
                <icon name="trash-2" size="15" />
                {{ deletingId === p.id ? 'Suppression...' : 'Supprimer' }}
              </button>

            </div>

          </div>

        </article>

      </div>

      <!-- PAGINATION -->
      <div v-if="totalPages > 1" class="pagination">

        <span>
          Affichage de
          {{ (page - 1) * pageSize + 1 }}
          à
          {{ Math.min(page * pageSize, filteredProducts.length) }}
          sur {{ filteredProducts.length }}
        </span>

        <div class="pagination-actions">

          <button
            @click="page--"
            :disabled="page <= 1"
          >
            <icon name="chevron-left" size="17" />
          </button>

          <span>{{ page }} / {{ totalPages }}</span>

          <button
            @click="page++"
            :disabled="page >= totalPages"
          >
            <icon name="chevron-right" size="17" />
          </button>

        </div>

      </div>

    </section>

    <!-- ALERTES -->
    <section v-if="lowStockProducts.length" class="alert-panel">

      <div class="alert-heading">
        <span>⚠️</span>
        <div>
          <strong>Attention : stocks à surveiller</strong>
          <p>Certains produits ont un stock inférieur ou égal à 24 bouteilles.</p>
        </div>
      </div>

      <div class="alert-products">
        <div
          v-for="p in lowStockProducts"
          :key="p.id"
          class="alert-product"
        >
          <span>{{ p.name }}</span>
          <strong>{{ p.quantityBottle || 0 }} bouteilles</strong>
        </div>
      </div>

    </section>

  </main>
</template>

<script>
import Navbar from "../components/NavbarPage.vue";
import Sidebar from "../components/SidebarPage.vue";

import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

import { db } from "../firebase";

export default {
  components: {
    Navbar,
    Sidebar
  },

  data() {
    return {
      products: [],

      search: "",
      stockFilter: "all",
      sortBy: "name",

      page: 1,
      pageSize: 6,

      editMode: false,
      editId: null,

      loading: true,
      saving: false,
      deletingId: null,

      form: {
        name: "",
        photo: "",
        priceBottle: 0,
        priceCrate: 0,
        quantityCrate: 0
      }
    };
  },

  computed: {
    safeCrates() {
      const value = Number(this.form.quantityCrate);
      return Number.isInteger(value) && value >= 0 ? value : 0;
    },

    safePriceBottle() {
      const value = Number(this.form.priceBottle);
      return Number.isFinite(value) && value >= 0 ? value : 0;
    },

    totalBottles() {
      return this.products.reduce((sum, p) => {
        return sum + Number(p.quantityBottle || 0);
      }, 0);
    },

    stockValue() {
      return this.products.reduce((sum, p) => {
        return sum +
          Number(p.quantityBottle || 0) *
          Number(p.priceBottle || 0);
      }, 0);
    },

    lowStockProducts() {
      return this.products
        .filter(p => Number(p.quantityBottle || 0) <= 24)
        .sort((a, b) => {
          return Number(a.quantityBottle || 0) -
            Number(b.quantityBottle || 0);
        });
    },

    lowStockCount() {
      return this.lowStockProducts.length;
    },

    filteredProducts() {
      const search = this.search.trim().toLowerCase();

      let result = this.products.filter(p => {
        const matchesSearch = String(p.name || "")
          .toLowerCase()
          .includes(search);

        const stock = Number(p.quantityBottle || 0);

        let matchesStock = true;

        if (this.stockFilter === "available") {
          matchesStock = stock > 24;
        } else if (this.stockFilter === "low") {
          matchesStock = stock > 0 && stock <= 24;
        } else if (this.stockFilter === "empty") {
          matchesStock = stock <= 0;
        }

        return matchesSearch && matchesStock;
      });

      result = [...result];

      if (this.sortBy === "name") {
        result.sort((a, b) =>
          String(a.name || "").localeCompare(
            String(b.name || ""),
            "fr"
          )
        );
      }

      if (this.sortBy === "stock") {
        result.sort((a, b) =>
          Number(b.quantityBottle || 0) -
          Number(a.quantityBottle || 0)
        );
      }

      if (this.sortBy === "price") {
        result.sort((a, b) =>
          Number(a.priceBottle || 0) -
          Number(b.priceBottle || 0)
        );
      }

      return result;
    },

    totalPages() {
      return Math.max(
        1,
        Math.ceil(this.filteredProducts.length / this.pageSize)
      );
    },

    paginatedProducts() {
      const start = (this.page - 1) * this.pageSize;

      return this.filteredProducts.slice(
        start,
        start + this.pageSize
      );
    }
  },

  watch: {
    search() {
      this.page = 1;
    },

    stockFilter() {
      this.page = 1;
    },

    sortBy() {
      this.page = 1;
    },

    totalPages(value) {
      if (this.page > value) {
        this.page = value;
      }
    }
  },

  methods: {
    async loadProducts() {
      this.loading = true;

      try {
        const snap = await getDocs(
          collection(db, "barProducts")
        );

        this.products = snap.docs.map(d => ({
          id: d.id,
          ...d.data()
        }));

      } catch (error) {
        console.error("Erreur chargement produits :", error);
        alert("Impossible de charger les produits du bar.");
      } finally {
        this.loading = false;
      }
    },

    async convertImage(event) {
      const file = event.target.files?.[0];

      if (!file) return;

      if (!file.type.startsWith("image/")) {
        alert("Veuillez sélectionner une image valide.");
        event.target.value = "";
        return;
      }

      if (file.size > 1024 * 1024) {
        alert("L'image ne doit pas dépasser 1 Mo.");
        event.target.value = "";
        return;
      }

      try {
        const compressed = await this.compressImage(file);
        this.form.photo = compressed;
      } catch (error) {
        console.error(error);
        alert("Impossible de traiter cette image.");
      }

      event.target.value = "";
    },

    compressImage(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onerror = () => reject(
          new Error("Lecture de l'image impossible.")
        );

        reader.onload = () => {
          const img = new Image();

          img.onerror = () => reject(
            new Error("Image invalide.")
          );

          img.onload = () => {
            const maxSize = 900;
            const ratio = Math.min(
              1,
              maxSize / Math.max(img.width, img.height)
            );

            const canvas = document.createElement("canvas");

            canvas.width = Math.round(img.width * ratio);
            canvas.height = Math.round(img.height * ratio);

            const ctx = canvas.getContext("2d");

            if (!ctx) {
              reject(new Error("Canvas indisponible."));
              return;
            }

            ctx.drawImage(
              img,
              0,
              0,
              canvas.width,
              canvas.height
            );

            resolve(
              canvas.toDataURL("image/jpeg", 0.78)
            );
          };

          img.src = reader.result;
        };

        reader.readAsDataURL(file);
      });
    },

    validateForm() {
      if (!this.form.name.trim()) {
        alert("Le nom de la boisson est obligatoire.");
        return false;
      }

      const bottlePrice = Number(this.form.priceBottle);
      const cratePrice = Number(this.form.priceCrate);
      const crates = Number(this.form.quantityCrate);

      if (
        !Number.isFinite(bottlePrice) ||
        bottlePrice < 0 ||
        !Number.isFinite(cratePrice) ||
        cratePrice < 0
      ) {
        alert("Veuillez saisir des prix valides.");
        return false;
      }

      if (!Number.isInteger(crates) || crates < 0) {
        alert("Le nombre de casiers doit être un entier positif ou nul.");
        return false;
      }

      return true;
    },

    async saveProduct() {
      if (this.saving) return;

      if (!this.validateForm()) return;

      this.saving = true;

      try {
        const data = {
          name: this.form.name.trim(),
          photo: this.form.photo || "",
          priceBottle: Number(this.form.priceBottle),
          priceCrate: Number(this.form.priceCrate),
          quantityCrate: Number(this.form.quantityCrate),
          quantityBottle: Number(this.form.quantityCrate) * 12,
          updatedAt: new Date()
        };

        if (this.editMode) {
          await updateDoc(
            doc(db, "barProducts", this.editId),
            data
          );
        } else {
          await addDoc(
            collection(db, "barProducts"),
            {
              ...data,
              createdAt: new Date()
            }
          );
        }

        this.reset();
        await this.loadProducts();

        alert(
          this.editMode
            ? "Boisson modifiée avec succès."
            : "Boisson ajoutée avec succès."
        );

      } catch (error) {
        console.error("Erreur enregistrement :", error);
        alert(error.message || "Impossible d'enregistrer la boisson.");
      } finally {
        this.saving = false;
      }
    },

    editProduct(product) {
      this.editMode = true;
      this.editId = product.id;

      const bottles = Number(product.quantityBottle || 0);

      this.form = {
        name: product.name || "",
        photo: product.photo || "",
        priceBottle: Number(product.priceBottle || 0),
        priceCrate: Number(product.priceCrate || 0),

        // Préserver les bouteilles restantes si le stock
        // n'est pas un multiple exact de 12.
        quantityCrate: Math.floor(bottles / 12)
      };

      this.$nextTick(() => {
        this.$refs.formSection?.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      });
    },

    startNewProduct() {
      this.reset();

      this.$nextTick(() => {
        this.$refs.formSection?.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      });
    },

    async removeProduct(product) {
      if (this.deletingId) return;

      if (!confirm(
        `Voulez-vous vraiment supprimer ${product.name} ?`
      )) {
        return;
      }

      this.deletingId = product.id;

      try {

        // array-contains compare l'objet entier : cette requête
        // ne permet donc pas de détecter de façon fiable un item
        // ayant d'autres propriétés.
        // On charge les ventes et on vérifie leurs lignes.
        const salesSnapshot = await getDocs(
          collection(db, "barSales")
        );

        const usedInSales = salesSnapshot.docs.some(saleDoc => {
          const sale = saleDoc.data();

          return (sale.items || []).some(item => {
            return item.productId === product.id;
          });
        });

        if (usedInSales) {
          alert(
            "Suppression impossible : cette boisson est présente " +
            "dans l'historique des ventes.\n\n" +
            "Tu peux conserver le produit avec un stock à zéro."
          );
          return;
        }

        if (Number(product.quantityBottle || 0) > 0) {
          const confirmStock = confirm(
            "Ce produit possède encore du stock.\n" +
            "Confirmer sa suppression ?"
          );

          if (!confirmStock) return;
        }

        await deleteDoc(
          doc(db, "barProducts", product.id)
        );

        if (this.editId === product.id) {
          this.reset();
        }

        await this.loadProducts();

        alert("Boisson supprimée avec succès.");

      } catch (error) {
        console.error("Erreur suppression :", error);
        alert("Impossible de supprimer cette boisson.");
      } finally {
        this.deletingId = null;
      }
    },

    stockClass(product) {
      const stock = Number(product.quantityBottle || 0);

      if (stock <= 0) return "danger";
      if (stock <= 24) return "warning";

      return "success";
    },

    stockLabel(product) {
      const stock = Number(product.quantityBottle || 0);

      if (stock <= 0) return "Épuisé";
      if (stock <= 24) return "Stock faible";

      return "Disponible";
    },

    stockCapacity(product) {
      // Repère visuel basé sur le stock actuel et un minimum de 120.
      return Math.max(120, Number(product.quantityBottle || 0));
    },

    stockPercentage(product) {
      const stock = Number(product.quantityBottle || 0);
      const capacity = this.stockCapacity(product);

      return Math.min(100, (stock / capacity) * 100);
    },

    reset() {
      this.editMode = false;
      this.editId = null;

      this.form = {
        name: "",
        photo: "",
        priceBottle: 0,
        priceCrate: 0,
        quantityCrate: 0
      };
    },

    formatMoney(value) {
      return new Intl.NumberFormat("fr-FR").format(
        Number(value) || 0
      ) + " FCFA";
    }
  },

  mounted() {
    this.loadProducts();
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
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 27px;
}

.eyebrow,
.section-kicker {
  display: block;
  font-size: 10px;
  letter-spacing: 1.5px;
  font-weight: 800;
  color: #8b97aa;
  margin-bottom: 8px;
}

.page-header h1 {
  margin: 0;
  font-size: 30px;
  letter-spacing: -1px;
  font-weight: 850;
}

.page-header h1 span {
  font-size: 25px;
}

.page-header p {
  color: #8995a8;
  font-size: 13px;
  margin: 8px 0 0;
}

/* BOUTONS */

.btn {
  border: none;
  border-radius: 10px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  font-size: 12px;
  font-weight: 750;
  padding: 12px 16px;
  transition: 0.2s;
}

.btn-primary {
  color: white;
  background: #2563eb;
  box-shadow: 0 5px 13px rgba(37, 99, 235, 0.16);
}

.btn-primary:hover:not(:disabled) {
  background: #1d4ed8;
  transform: translateY(-1px);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-light {
  background: #f0f3f8;
  color: #617089;
}

.header-button {
  min-height: 44px;
}

/* STATISTIQUES */

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 23px;
}

.stat-card {
  background: white;
  border: 1px solid #e9edf4;
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 4px 16px rgba(24, 39, 75, 0.035);
  min-width: 0;
}

.stat-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.stat-top > span {
  color: #8490a4;
  font-size: 11px;
  font-weight: 650;
}

.stat-icon {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  border-radius: 11px;
  font-size: 16px;
}

.stat-icon.blue {
  background: #edf4ff;
}

.stat-icon.green {
  background: #e8f8f0;
}

.stat-icon.purple {
  background: #f1edff;
}

.stat-icon.orange {
  background: #fff4e7;
}

.stat-value {
  display: block;
  margin-top: 17px;
  font-size: 25px;
  font-weight: 850;
  letter-spacing: -0.8px;
  overflow-wrap: anywhere;
}

.stat-footer {
  display: block;
  color: #a0aabc;
  font-size: 10px;
  margin-top: 6px;
}

/* PANELS */

.panel {
  background: white;
  border: 1px solid #e9edf4;
  border-radius: 17px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(24, 39, 75, 0.035);
  min-width: 0;
}

.panel-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 23px;
}

.panel-heading h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.4px;
}

.panel-heading p {
  margin: 7px 0 0;
  color: #95a0b1;
  font-size: 11px;
}

.form-icon {
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border-radius: 13px;
  background: #f0f5ff;
  font-size: 21px;
  flex-shrink: 0;
}

/* FORMULAIRE */

.form-panel {
  margin-bottom: 23px;
  scroll-margin-top: 25px;
}

.product-form-grid {
  display: grid;
  grid-template-columns: 205px minmax(0, 1fr);
  gap: 28px;
}

.image-section {
  min-width: 0;
}

.field-label,
.field label {
  display: block;
  color: #66738a;
  font-size: 11px;
  font-weight: 750;
  margin-bottom: 9px;
}

.image-upload {
  width: 100%;
  height: 190px;
  overflow: hidden;
  border: 1px dashed #cdd7e6;
  border-radius: 13px;
  background: #f8fafd;
  display: grid;
  place-items: center;
}

.image-upload img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.image-placeholder {
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 7px;
}

.image-placeholder span {
  font-size: 38px;
}

.image-placeholder strong {
  color: #64738a;
  font-size: 11px;
}

.image-placeholder small {
  color: #a0aabc;
  font-size: 10px;
}

.upload-button {
  height: 39px;
  margin-top: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  border: 1px solid #e2e8f2;
  border-radius: 9px;
  background: white;
  color: #4c617f;
  font-size: 11px;
  font-weight: 750;
  cursor: pointer;
  transition: 0.2s;
}

.upload-button:hover {
  background: #f4f7fc;
  border-color: #b9c9e3;
}

.upload-button input {
  display: none;
}

.remove-image {
  display: block;
  margin: 9px auto 0;
  border: none;
  background: none;
  color: #df5964;
  font-size: 10px;
  cursor: pointer;
}

.image-hint {
  display: block;
  color: #a1aabb;
  font-size: 9px;
  line-height: 1.5;
  text-align: center;
  margin-top: 10px;
}

.fields-section {
  min-width: 0;
}

.field {
  margin-bottom: 16px;
  min-width: 0;
}

.field label span {
  color: #e45d66;
}

.field input {
  width: 100%;
  height: 44px;
  border: 1px solid #e3e8f0;
  border-radius: 9px;
  background: #fafbfd;
  padding: 0 13px;
  outline: none;
  color: #29374f;
  font-size: 12px;
  transition: 0.2s;
}

.field input:focus {
  border-color: #4283f5;
  background: white;
  box-shadow: 0 0 0 3px rgba(66, 131, 245, 0.09);
}

.field input::placeholder {
  color: #adb6c4;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.input-with-icon {
  position: relative;
}

.input-with-icon > span {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 13px;
}

.input-with-icon input {
  padding-left: 39px;
}

/* APERÇU STOCK */

.stock-preview {
  background: #f4f7fc;
  border-radius: 12px;
  padding: 15px;
  margin: 4px 0 17px;
}

.preview-heading {
  color: #66748b;
  font-size: 11px;
  font-weight: 750;
  margin-bottom: 14px;
}

.preview-heading span {
  margin-right: 5px;
}

.preview-grid {
  display: grid;
  grid-template-columns: 0.7fr 1px 0.7fr 1px 1.4fr;
  align-items: center;
  gap: 13px;
}

.preview-grid > div:not(.preview-separator) {
  min-width: 0;
}

.preview-grid strong {
  display: block;
  color: #27364f;
  font-size: 17px;
  font-weight: 850;
  overflow-wrap: anywhere;
}

.preview-grid span {
  display: block;
  color: #99a4b4;
  font-size: 9px;
  margin-top: 5px;
}

.preview-separator {
  height: 30px;
  background: #dfe5ee;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.save-button {
  min-width: 190px;
  min-height: 43px;
}

/* INVENTAIRE */

.inventory-panel {
  margin-bottom: 23px;
}

.product-count {
  padding: 8px 12px;
  border-radius: 9px;
  background: #eff4ff;
  color: #3c6bd0;
  font-size: 10px;
  font-weight: 800;
  white-space: nowrap;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 11px;
  margin-bottom: 22px;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 9px;
  height: 42px;
  flex: 1;
  min-width: 150px;
  border: 1px solid #e5eaf1;
  background: #fafbfd;
  border-radius: 9px;
  padding: 0 12px;
  color: #95a1b3;
}

.search-box input {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  color: #35445c;
  font-size: 11px;
}

.search-box input::placeholder {
  color: #a9b3c1;
}

.filter-select {
  height: 42px;
  border: 1px solid #e5eaf1;
  border-radius: 9px;
  background: white;
  color: #64738b;
  font-size: 10px;
  padding: 0 10px;
  outline: none;
}

/* CARTES PRODUITS */

.products-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 17px;
}

.product-card {
  border: 1px solid #e9edf4;
  border-radius: 13px;
  overflow: hidden;
  background: white;
  transition: 0.2s;
  min-width: 0;
}

.product-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 9px 24px rgba(28, 47, 83, 0.08);
  border-color: #d9e2f1;
}

.product-image {
  height: 155px;
  position: relative;
  background: #f4f7fb;
  overflow: hidden;
  display: grid;
  place-items: center;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 13px;
}

.no-photo {
  font-size: 48px;
}

.stock-badge {
  position: absolute;
  top: 11px;
  right: 11px;
  border-radius: 20px;
  padding: 6px 9px;
  font-size: 9px;
  font-weight: 800;
}

.stock-badge.success {
  color: #13885b;
  background: #e5f8ef;
}

.stock-badge.warning {
  color: #bd7a1e;
  background: #fff3df;
}

.stock-badge.danger {
  color: #cf414d;
  background: #ffeaec;
}

.product-content {
  padding: 14px;
}

.product-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 13px;
}

.product-title-row h3 {
  margin: 0;
  color: #28364e;
  font-size: 13px;
  font-weight: 800;
  overflow-wrap: anywhere;
}

.product-reference {
  font-size: 9px;
  color: #a0aabb;
  flex-shrink: 0;
}

.prices-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.price-box {
  background: #f7f9fc;
  border-radius: 8px;
  padding: 10px;
  min-width: 0;
}

.price-box span {
  display: block;
  color: #929eb0;
  font-size: 9px;
  margin-bottom: 6px;
}

.price-box strong {
  display: block;
  color: #3d4c65;
  font-size: 11px;
  overflow-wrap: anywhere;
}

.product-stock {
  margin-top: 15px;
}

.stock-heading,
.stock-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.stock-heading span {
  color: #8995a8;
  font-size: 10px;
}

.stock-heading strong {
  color: #485872;
  font-size: 10px;
}

.stock-progress {
  height: 5px;
  background: #edf0f5;
  border-radius: 10px;
  overflow: hidden;
  margin: 9px 0 7px;
}

.stock-progress-bar {
  height: 100%;
  border-radius: 10px;
  transition: width 0.3s;
}

.stock-progress-bar.success {
  background: #20b47a;
}

.stock-progress-bar.warning {
  background: #efa53e;
}

.stock-progress-bar.danger {
  background: #e45b65;
}

.stock-details {
  color: #a0aabb;
  font-size: 9px;
}

.product-actions {
  display: flex;
  gap: 8px;
  margin-top: 15px;
  padding-top: 12px;
  border-top: 1px solid #f0f2f6;
}

.action-btn {
  flex: 1;
  min-width: 0;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 10px;
  font-weight: 750;
  transition: 0.2s;
}

.edit-btn {
  color: #346bd5;
  background: #edf3ff;
}

.edit-btn:hover {
  background: #dfeaff;
}

.delete-btn {
  color: #d6535e;
  background: #fff0f1;
}

.delete-btn:hover {
  background: #ffe1e3;
}

.delete-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* PAGINATION */

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  border-top: 1px solid #edf0f5;
  padding-top: 19px;
  margin-top: 23px;
  color: #8995a8;
  font-size: 10px;
}

.pagination-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pagination-actions button {
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  background: white;
  color: #52627c;
  border: 1px solid #e5eaf1;
  border-radius: 8px;
  cursor: pointer;
}

.pagination-actions button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.pagination-actions span {
  font-weight: 750;
  color: #52627c;
}

/* ALERTES */

.alert-panel {
  padding: 19px;
  border: 1px solid #f3dfbd;
  border-radius: 14px;
  background: #fffaf1;
  margin-bottom: 20px;
}

.alert-heading {
  display: flex;
  align-items: center;
  gap: 12px;
}

.alert-heading > span {
  font-size: 23px;
}

.alert-heading strong {
  display: block;
  color: #9d6b24;
  font-size: 12px;
}

.alert-heading p {
  color: #b39469;
  font-size: 10px;
  margin: 5px 0 0;
}

.alert-products {
  display: flex;
  flex-wrap: wrap;
  gap: 9px;
  margin-top: 15px;
}

.alert-product {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 11px;
  background: white;
  border: 1px solid #f1e5d2;
  border-radius: 8px;
  color: #8c7657;
  font-size: 10px;
}

.alert-product strong {
  color: #b77c2d;
}

/* ÉTATS VIDES */

.loading-state,
.empty-state {
  min-height: 190px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 10px;
  color: #929daf;
  font-size: 11px;
}

.empty-state > div {
  font-size: 35px;
}

.empty-state strong {
  color: #485770;
  font-size: 13px;
}

.empty-state p {
  margin: 0 0 8px;
  text-align: center;
}

.spinner {
  width: 15px;
  height: 15px;
  display: inline-block;
  border: 2px solid rgba(255,255,255,0.4);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

.blue-spinner {
  width: 23px;
  height: 23px;
  border-color: #e1e8f5;
  border-top-color: #2563eb;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* RESPONSIVE */

@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .products-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 850px) {
  .page {
    margin-left: 0;
    padding: 22px 16px;
  }
}

@media (max-width: 600px) {
  .page {
    padding: 17px 12px;
  }

  .page-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .page-header h1 {
    font-size: 25px;
  }

  .header-button {
    width: 100%;
  }

  .stats-grid {
    gap: 10px;
  }

  .stat-card {
    padding: 14px;
  }

  .stat-value {
    font-size: 19px;
  }

  .stat-top > span {
    font-size: 10px;
  }

  .stat-icon {
    width: 30px;
    height: 30px;
  }

  .panel {
    padding: 16px;
    border-radius: 13px;
  }

  .product-form-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .image-section {
    max-width: 260px;
    width: 100%;
    margin: auto;
  }

  .image-upload {
    height: 180px;
  }

  .form-grid {
    grid-template-columns: 1fr;
    gap: 0;
  }

  .preview-grid {
    gap: 8px;
    grid-template-columns: 0.7fr 1px 0.7fr 1px 1.3fr;
  }

  .preview-grid strong {
    font-size: 13px;
  }

  .preview-grid span {
    font-size: 8px;
  }

  .form-actions {
    flex-direction: column-reverse;
  }

  .form-actions button {
    width: 100%;
  }

  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .search-box {
    flex: auto;
  }

  .products-grid {
    grid-template-columns: 1fr;
  }

  .product-image {
    height: 185px;
  }

  .inventory-heading {
    align-items: flex-start;
  }

  .product-count {
    font-size: 9px;
  }

  .pagination {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
