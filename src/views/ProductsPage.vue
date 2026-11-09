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
          <input v-model.trim="name" type="text" placeholder="Ex : Bière, Boisson, Jus..." maxlength="120" required />
        </div>

        <div class="field price-field">
          <label>Prix unitaire (FCFA)</label>
          <input v-model.number="price" type="number" min="0" step="1" placeholder="Ex : 2500" required />
        </div>

        <button type="submit" class="btn-add" :disabled="loading || !name.trim() || !validPrice">
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

        <div class="heading-actions">
          <span class="count-badge">
            {{ filteredProducts.length }} produit(s)
          </span>

          <button type="button" class="btn-export" @click="exportProductsPDF"
            :disabled="!products.length || exportingPDF">
            <span v-if="exportingPDF" class="mini-spinner"></span>
            <template v-else>
              <span>↓</span>
              Télécharger la fiche PDF
            </template>
          </button>
        </div>
      </div>

      <!-- RECHERCHE ET FILTRES -->
      <div class="toolbar">
        <div class="search-box">
          <span class="search-icon">⌕</span>
          <input v-model.trim="search" type="search" placeholder="Rechercher un produit..." />
          <button v-if="search" class="clear-search" @click="search = ''" type="button">
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
      <transition-group v-else-if="filteredProducts.length" name="list" tag="div" class="products-grid">
        <article v-for="p in filteredProducts" :key="p.id" class="product-card">
          <!-- CARD HEADER -->
          <div class="product-top">
            <div class="product-avatar">
              {{ getInitials(p.name) }}
            </div>

            <div class="product-title">
              <h3>{{ p.name }}</h3>
              <span class="product-reference">Produit enregistré</span>
            </div>

            <button v-if="canEditProducts" type="button" class="edit-button" title="Modifier le produit"
              @click="openEdit(p)">
              ✎
            </button>

            <button v-if="currentUser?.role === 'Administrateur'" type="button" class="delete-button"
              title="Supprimer le produit" @click="deleteProduct(p)" :disabled="deletingId === p.id">
              <span v-if="deletingId === p.id" class="mini-spinner"></span>
              <span v-else>✕</span>
            </button>
          </div>

          <!-- MODIFICATION DU PRODUIT -->
          <div v-if="canEditProducts && editingId === p.id" class="edit-product-form">
            <div class="edit-form-heading">
              <div>
                <strong>Modifier le produit</strong>
                <p>Modifiez les informations et les quantités en stock.</p>
              </div>
              <span class="edit-icon">✎</span>
            </div>

            <!-- NOM -->
            <div class="field">
              <label>Nom du produit</label>
              <input v-model.trim="editForm.name" type="text" maxlength="120" placeholder="Nom du produit" />
            </div>

            <!-- PRIX -->
            <div class="field">
              <label>Prix unitaire (FCFA)</label>
              <input v-model.number="editForm.price" type="number" min="0" step="1" placeholder="Prix du produit" />
            </div>

            <!-- MODIFICATION DES STOCKS -->
            <div class="edit-stock-container">

              <div class="edit-stock-heading">
                <div>
                  <strong>Gestion des quantités</strong>
                  <p>Modifiez le stock disponible dans chaque dépôt.</p>
                </div>

                <span class="stock-edit-icon">▤</span>
              </div>

              <div v-for="depot in getEditableDepots(p)" :key="depot.id" class="edit-stock-item">
                <div class="edit-stock-info">
                  <span class="depot-indicator"></span>

                  <div>
                    <strong>{{ depot.name }}</strong>
                    <small>Quantité disponible</small>
                  </div>
                </div>

                <div class="stock-input-wrapper">
                  <input v-model.number="editForm.stocks[depot.id]" type="number" min="0" step="any" placeholder="0"
                    :disabled="savingEdit" />

                  <span>Casier(s)</span>
                </div>
              </div>

              <div v-if="!getEditableDepots(p).length" class="no-stock">
                Aucun dépôt disponible.
              </div>

              <!-- TOTAL -->
              <div class="edit-stock-total">
                <span>Stock total après modification</span>

                <strong>
                  {{ getEditStockTotal().toLocaleString("fr-FR") }}
                  casier(s)
                </strong>
              </div>

            </div>

            <!-- ACTIONS -->
            <div class="edit-actions">

              <button type="button" class="btn-cancel-edit" @click="cancelEdit" :disabled="savingEdit">
                Annuler
              </button>

              <button type="button" class="btn-save-edit" @click="saveEdit(p)" :disabled="savingEdit ||
                !editForm.name.trim() ||
                !validEditPrice ||
                !validEditStocks
                ">
                <span v-if="savingEdit" class="mini-spinner"></span>
                <template v-else>✓ Enregistrer</template>
              </button>

            </div>
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
                {{ formatQuantity(getTotalProductStock(p)) }} casier(s)
              </strong>
            </div>

            <div v-if="getProductDepots(p).length" class="depot-list">
              <div v-for="depot in getProductDepots(p)" :key="depot.id" class="depot-item">
                <div class="depot-indicator"></div>
                <span class="depot-name">{{ depot.id }}</span>
                <strong>{{ formatQuantity(depot.quantity) }}</strong>
              </div>
            </div>

            <div v-else class="no-stock">
              <span>○</span>
              Aucun stock disponible
            </div>
          </div>

          <!-- FOOTER -->
          <div class="product-footer">
            <span class="stock-status" :class="getTotalProductStock(p) > 0 ? 'available' : 'empty'">
              <span class="status-dot"></span>
              {{ formatQuantity(getTotalProductStock(p)) > 0 ? 'En stock' : 'Stock épuisé' }}
            </span>

            <span class="product-id">
              ID : {{ p.id ? p.id.slice(0, 7) : 'Non disponible' }}
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

        <button v-if="search" class="reset-search" @click="search = ''">
          Réinitialiser la recherche
        </button>
      </div>

      <!-- FOOTER LISTE -->
      <div v-if="filteredProducts.length" class="list-footer">
        <span>Affichage de {{ filteredProducts.length }} produit(s)</span>
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
  doc,
  updateDoc
} from "firebase/firestore"

import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"

export default {
  components: {
    Navbar,
    Sidebar
  },

  data() {
    return {
      products: [],
      depots: [],

      name: "",
      price: null,

      loading: false,
      pageLoading: false,
      deletingId: null,

      currentUser: null,

      search: "",
      sortBy: "name",

      editingId: null,

      editForm: {
        name: "",
        price: null,
        stocks: {}
      },

      savingEdit: false,
      exportingPDF: false
    }
  },

  computed: {
    canEditProducts() {
      return (
        String(this.currentUser?.email || "")
          .trim()
          .toLowerCase() === "ditsaffo@gmail.com"
      )
    },

    validEditPrice() {
      return (
        this.editForm.price !== null &&
        this.editForm.price !== "" &&
        Number.isFinite(Number(this.editForm.price)) &&
        Number(this.editForm.price) >= 0
      )
    },

    validEditStocks() {
      const stocks = this.editForm.stocks || {}

      return Object.values(stocks).every(quantity => {
        return (
          quantity !== "" &&
          quantity !== null &&
          Number.isFinite(Number(quantity)) &&
          Number(quantity) >= 0
        )
      })
    },

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
        (total, product) =>
          total + this.getTotalProductStock(product),
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

      if (this.search) {
        const query = this.search.toLocaleLowerCase("fr")

        result = result.filter(p =>
          String(p.name || "")
            .toLocaleLowerCase("fr")
            .includes(query)
        )
      }

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
            (a, b) =>
              this.getTotalProductStock(b) -
              this.getTotalProductStock(a)
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

    // =====================================
    // GESTION DES DEPOTS
    // =====================================

    async loadDepots() {
      try {
        const snap = await getDocs(collection(db, "depots"))

        this.depots = snap.docs.map(d => ({
          ...d.data(),
          id: d.id
        }))
      } catch (error) {
        console.error("Erreur chargement dépôts :", error)
        this.depots = []
      }
    },

    getEditableDepots(product) {
      const depotMap = new Map()

      // Dépôts enregistrés dans Firestore
      this.depots.forEach(depot => {
        depotMap.set(depot.id, {
          id: depot.id,
          name: depot.name || depot.nom || depot.label || depot.id
        })
      })

      // Conserver également les dépôts déjà présents
      // dans le stock du produit, même s'ils ne figurent
      // plus dans la collection des dépôts.
      Object.keys(product?.stocks || {}).forEach(id => {
        if (!depotMap.has(id)) {
          depotMap.set(id, {
            id,
            name: id
          })
        }
      })

      return Array.from(depotMap.values())
    },

    getEditStockTotal() {
      return Object.values(this.editForm.stocks || {})
        .reduce((total, quantity) => {
          const value = Number(quantity)

          return total + (
            Number.isFinite(value) && value >= 0 ? value : 0
          )
        }, 0)
    },

    // =====================================
    // MODIFICATION DES PRODUITS ET STOCKS
    // =====================================

    openEdit(product) {
      if (!this.canEditProducts) {
        alert("Vous n'êtes pas autorisé à modifier les produits.")
        return
      }

      if (!product?.id) {
        alert("Identifiant du produit introuvable.")
        return
      }

      this.editingId = product.id

      // Initialiser les quantités de tous les dépôts
      const stocks = {}

      this.getEditableDepots(product).forEach(depot => {
        stocks[depot.id] = Number(product.stocks?.[depot.id]) || 0
      })

      this.editForm = {
        name: product.name || "",
        price: Number(product.price) || 0,
        stocks
      }
    },

    cancelEdit() {
      if (this.savingEdit) return

      this.editingId = null

      this.editForm = {
        name: "",
        price: null,
        stocks: {}
      }
    },

    async saveEdit(product) {
      if (!this.canEditProducts) {
        alert("Accès refusé : modification non autorisée.")
        return
      }

      if (!product?.id || this.savingEdit) return

      const name = String(this.editForm.name || "").trim()
      const price = Number(this.editForm.price)

      if (!name) {
        alert("Veuillez saisir le nom du produit.")
        return
      }

      if (
        this.editForm.price === null ||
        this.editForm.price === "" ||
        !Number.isFinite(price) ||
        price < 0
      ) {
        alert("Veuillez saisir un prix valide.")
        return
      }

      // VALIDATION DES STOCKS
      const stocks = {}

      for (const [depotId, quantity] of Object.entries(
        this.editForm.stocks || {}
      )) {
        const value = Number(quantity)

        if (
          quantity === "" ||
          quantity === null ||
          !Number.isFinite(value) ||
          value < 0
        ) {
          alert(
            `Quantité invalide pour le dépôt ${depotId}.`
          )
          return
        }

        // Autoriser les nombres décimaux
        stocks[depotId] = value
      }
      this.savingEdit = true

      try {
        // Mise à jour Firestore
        await updateDoc(doc(db, "products", product.id), {
          name,
          price,
          stocks
        })

        // Mise à jour immédiate de l'interface
        const index = this.products.findIndex(
          p => p.id === product.id
        )

        if (index !== -1) {
          this.products[index] = {
            ...this.products[index],
            name,
            price,
            stocks
          }
        }

        this.cancelEdit()

        alert(
          "Produit et quantités en stock modifiés avec succès !"
        )

      } catch (error) {
        console.error("Erreur modification produit :", error)

        alert(
          "Impossible de modifier le produit et ses stocks."
        )
      } finally {
        this.savingEdit = false
      }
    },

    // =====================================
    // EXPORTATION PDF
    // =====================================

    async exportProductsPDF() {
      if (this.exportingPDF) return

      if (!this.products.length) {
        alert("Aucun produit à exporter.")
        return
      }

      this.exportingPDF = true

      try {
        const pdf = new jsPDF({
          orientation: "landscape",
          unit: "mm",
          format: "a4"
        })

        const pageWidth = pdf.internal.pageSize.getWidth()

        pdf.setFillColor(23, 43, 77)
        pdf.rect(0, 0, pageWidth, 37, "F")

        pdf.setTextColor(255, 255, 255)
        pdf.setFont("helvetica", "bold")
        pdf.setFontSize(19)
        pdf.text("CATALOGUE DES PRODUITS", 15, 17)

        pdf.setFont("helvetica", "normal")
        pdf.setFontSize(9)
        pdf.text(
          "GESTION COMMERCIALE | FICHE PRODUITS",
          15,
          25
        )

        const date = new Date().toLocaleString("fr-FR", {
          dateStyle: "long",
          timeStyle: "short"
        })

        pdf.setFontSize(9)
        pdf.text(
          `Généré le : ${date}`,
          pageWidth - 15,
          25,
          { align: "right" }
        )

        pdf.setTextColor(45, 55, 72)
        pdf.setFontSize(10)
        pdf.setFont("helvetica", "bold")

        pdf.text(
          `Nombre de produits : ${this.products.length}`,
          15,
          47
        )

        pdf.text(
          `Stock total : ${this.totalStock.toLocaleString("fr-FR")} casier(s)`,
          95,
          47
        )

        pdf.text(
          `Prix moyen : ${this.formatMoney(this.averagePrice)}`,
          200,
          47
        )

        const rows = this.products.map((product, index) => {
          const depots = this.getProductDepots(product)

          const depotDetails = depots.length
            ? depots.map(d => `${d.id} : ${d.quantity}`).join("\n")
            : "Aucun stock"

          return [
            index + 1,
            product.name || "Sans nom",
            this.formatMoney(product.price),
            this.getTotalProductStock(product).toLocaleString("fr-FR"),
            depotDetails,
            product.id || "Non disponible"
          ]
        })

        autoTable(pdf, {
          startY: 55,

          head: [[
            "N°",
            "Nom du produit",
            "Prix unitaire",
            "Stock total",
            "Répartition par dépôt",
            "Identifiant"
          ]],

          body: rows,
          theme: "grid",

          styles: {
            font: "helvetica",
            fontSize: 8,
            cellPadding: 3,
            textColor: [45, 55, 72],
            lineColor: [225, 231, 240],
            lineWidth: 0.2,
            valign: "middle",
            overflow: "linebreak"
          },

          headStyles: {
            fillColor: [37, 99, 235],
            textColor: [255, 255, 255],
            fontStyle: "bold",
            halign: "center"
          },

          alternateRowStyles: {
            fillColor: [246, 248, 252]
          },

          columnStyles: {
            0: { cellWidth: 10, halign: "center" },
            1: { cellWidth: 43 },
            2: { cellWidth: 30, halign: "right" },
            3: { cellWidth: 22, halign: "center" },
            4: { cellWidth: 75 },
            5: { cellWidth: 102 }
          },

          margin: {
            top: 55,
            right: 15,
            bottom: 20,
            left: 15
          },

          didDrawPage: () => {
            const pageHeight = pdf.internal.pageSize.getHeight()

            pdf.setFontSize(8)
            pdf.setTextColor(130, 140, 155)

            pdf.text(
              "Document de gestion commerciale - Catalogue des produits",
              15,
              pageHeight - 9
            )

            pdf.text(
              `Page ${pdf.internal.getNumberOfPages()}`,
              pageWidth - 15,
              pageHeight - 9,
              { align: "right" }
            )
          }
        })

        pdf.save(
          `catalogue_produits_${new Date().toISOString().slice(0, 10)}.pdf`
        )

      } catch (error) {
        console.error("Erreur exportation PDF :", error)
        alert("Impossible de générer le fichier PDF.")
      } finally {
        this.exportingPDF = false
      }
    },

    // =====================================
    // CHARGEMENT DES PRODUITS
    // =====================================

    async load() {
      this.pageLoading = true

      try {
        const snap = await getDocs(collection(db, "products"))

        this.products = snap.docs.map(d => ({
          ...d.data(),
          id: d.id
        }))

        await this.loadDepots()

      } catch (error) {
        console.error("Erreur chargement produits :", error)
        alert("Impossible de charger les produits.")
      } finally {
        this.pageLoading = false
      }
    },

    // =====================================
    // FORMATAGE
    // =====================================

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

    // =====================================
    // CALCUL DES STOCKS
    // =====================================

    getTotalProductStock(product) {
  if (!product?.stocks || typeof product.stocks !== "object") {
    return 0
  }

  return Object.values(product.stocks).reduce(
    (total, quantity) => {
      const value = Number(quantity)

      return total + (
        Number.isFinite(value) && value > 0 ? value : 0
      )
    },
    0
  )
},
formatQuantity(quantity) {
  return new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 3
  }).format(Number(quantity) || 0)
},
   getProductDepots(product) {
  if (!product?.stocks || typeof product.stocks !== "object") {
    return []
  }

  return Object.entries(product.stocks)
    .filter(([, quantity]) => {
      return Number.isFinite(Number(quantity)) &&
        Number(quantity) > 0
    })
    .map(([id, quantity]) => ({
      id,
      quantity: Number(quantity)
    }))
    .sort((a, b) => b.quantity - a.quantity)
},

    // =====================================
    // AJOUT PRODUIT
    // =====================================

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

    // =====================================
    // SUPPRESSION PRODUIT
    // =====================================

    async deleteProduct(product) {
      if (this.currentUser?.role !== "Administrateur") {
        alert("Vous n'avez pas l'autorisation de supprimer ce produit.")
        return
      }

      if (!product?.id || this.deletingId) return

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

/* =====================================
   MODIFICATION DES STOCKS
===================================== */

.edit-stock-container {
  margin-top: 18px;
  padding: 17px;
  background: #f7f9fc;
  border: 1px solid #e5eaf2;
  border-radius: 14px;
}

.edit-stock-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 15px;
}

.edit-stock-heading strong {
  display: block;
  color: #172b4d;
  font-size: 13px;
  font-weight: 750;
}

.edit-stock-heading p {
  margin: 5px 0 0;
  color: #8490a3;
  font-size: 11px;
}

.stock-edit-icon {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  color: #2563eb;
  background: #eaf1ff;
  border-radius: 10px;
  font-size: 17px;
}

.edit-stock-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
  padding: 12px;
  margin-bottom: 9px;
  background: #fff;
  border: 1px solid #e8edf4;
  border-radius: 10px;
}

.edit-stock-info {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.edit-stock-info .depot-indicator {
  width: 8px;
  height: 8px;
  flex-shrink: 0;
  background: #16a36a;
  border-radius: 50%;
}

.edit-stock-info strong {
  display: block;
  color: #263750;
  font-size: 12px;
  overflow-wrap: anywhere;
}

.edit-stock-info small {
  display: block;
  margin-top: 4px;
  color: #929daf;
  font-size: 10px;
}

.stock-input-wrapper {
  display: flex;
  align-items: center;
  gap: 7px;
  flex-shrink: 0;
}

.stock-input-wrapper input {
  width: 85px;
  height: 38px;
  padding: 0 9px;
  color: #172b4d;
  background: #f8fafc;
  border: 1px solid #dce4ef;
  border-radius: 8px;
  outline: none;
  font-size: 13px;
  font-weight: 700;
  text-align: center;
  transition: .2s ease;
}

.stock-input-wrapper input:focus {
  background: #fff;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, .09);
}

.stock-input-wrapper span {
  color: #8490a3;
  font-size: 10px;
  white-space: nowrap;
}

.edit-stock-total {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: 14px;
  padding: 13px;
  background: #eaf1ff;
  border-radius: 9px;
}

.edit-stock-total span {
  color: #526783;
  font-size: 11px;
  font-weight: 600;
}

.edit-stock-total strong {
  color: #1d4ed8;
  font-size: 13px;
  white-space: nowrap;
}

@media (max-width: 480px) {
  .edit-stock-container {
    padding: 11px;
  }

  .edit-stock-item {
    align-items: flex-start;
    flex-direction: column;
  }

  .stock-input-wrapper {
    width: 100%;
  }

  .stock-input-wrapper input {
    flex: 1;
    width: 100%;
  }

  .edit-stock-total {
    align-items: flex-start;
    flex-direction: column;
  }
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

.heading-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  flex-wrap: wrap;
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

.btn-export {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  padding: 10px 15px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #159b68, #08784d);
  color: white;
  font-size: 11px;
  font-weight: 750;
  box-shadow: 0 5px 13px rgba(21, 155, 104, .16);
  transition: .25s ease;
}

.btn-export:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 18px rgba(21, 155, 104, .25);
}

.btn-export:disabled {
  opacity: .5;
  cursor: not-allowed;
}

.btn-export>span {
  font-size: 17px;
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

.edit-button {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  border: 1px solid #dce8ff;
  border-radius: 9px;
  background: #edf3ff;
  color: #2563eb;
  font-size: 18px;
  transition: .2s ease;
}

.edit-button:hover {
  background: #2563eb;
  color: white;
  transform: translateY(-2px);
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

/* EDIT FORM */

.edit-product-form {
  margin-top: 18px;
  padding: 17px;
  border: 1px solid #dce8ff;
  border-radius: 12px;
  background: linear-gradient(145deg, #f8faff, #ffffff);
  animation: cardAppear .25s ease;
}

.edit-form-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 17px;
}

.edit-form-heading strong {
  font-size: 13px;
  color: #243b63;
}

.edit-form-heading p {
  margin: 5px 0 0;
  color: #8c9ab0;
  font-size: 10px;
}

.edit-icon {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  background: #e8efff;
  color: #2563eb;
}

.edit-product-form .field {
  margin-bottom: 13px;
}

.edit-product-form .field input {
  background: white;
}

.edit-actions {
  display: flex;
  gap: 9px;
  margin-top: 17px;
}

.btn-cancel-edit,
.btn-save-edit {
  flex: 1;
  min-height: 39px;
  padding: 9px 12px;
  border-radius: 9px;
  font-size: 11px;
  font-weight: 750;
  transition: .2s;
}

.btn-cancel-edit {
  border: 1px solid #e3e8f0;
  background: white;
  color: #68758a;
}

.btn-cancel-edit:hover:not(:disabled) {
  background: #f1f4f8;
}

.btn-save-edit {
  border: none;
  background: linear-gradient(135deg, #2563eb, #1746b0);
  color: white;
  box-shadow: 0 4px 12px rgba(37, 99, 235, .16);
}

.btn-save-edit:hover:not(:disabled) {
  transform: translateY(-2px);
}

.btn-save-edit:disabled,
.btn-cancel-edit:disabled {
  opacity: .5;
  cursor: not-allowed;
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
  border: 2px solid rgba(255, 255, 255, .4);
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
  to {
    transform: rotate(360deg);
  }
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
    flex-wrap: wrap;
  }

  .heading-actions {
    width: 100%;
    justify-content: space-between;
  }

  .btn-export {
    flex: 1;
    padding: 11px 8px;
    font-size: 10px;
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
