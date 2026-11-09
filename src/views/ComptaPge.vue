
<template>
  <Navbar />
  <Sidebar />

  <main class="page">
    <!-- HEADER -->
    <header class="page-header">
      <div class="header-content">
        <div class="header-icon">
          <span>📊</span>
        </div>

        <div>
          <h1>Comptabilité</h1>
          <p>Suivi financier et journal des sorties journalières</p>
        </div>
      </div>

      <button class="refresh-btn" @click="loadSales" :disabled="loading">
        <span :class="{ rotating: loading }">↻</span>
        Actualiser
      </button>
    </header>

    <!-- ERROR -->
    <div v-if="error" class="error-message">
      <span>⚠️</span>
      {{ error }}
      <button @click="loadSales">Réessayer</button>
    </div>

    <!-- STATISTICS -->
    <section class="stats-grid">
      <div class="stat-card primary-card">
        <div class="stat-top">
          <span class="stat-label">Chiffre d'affaires</span>
          <span class="stat-icon">💰</span>
        </div>
        <h2>{{ formatMoney(totalRevenue) }}</h2>
        <span class="stat-description">Sur la période affichée</span>
      </div>

      <div class="stat-card">
        <div class="stat-top">
          <span class="stat-label">Nombre de ventes</span>
          <span class="stat-icon blue">🧾</span>
        </div>
        <h2>{{ filteredSales.length }}</h2>
        <span class="stat-description">Transactions enregistrées</span>
      </div>

      <div class="stat-card">
        <div class="stat-top">
          <span class="stat-label">Articles vendus</span>
          <span class="stat-icon purple">📦</span>
        </div>
        <h2>{{ totalItems }}</h2>
        <span class="stat-description">Quantités d'articles vendues</span>
      </div>

      <div class="stat-card">
        <div class="stat-top">
          <span class="stat-label">Journées actives</span>
          <span class="stat-icon orange">📅</span>
        </div>
        <h2>{{ Object.keys(groupedSales).length }}</h2>
        <span class="stat-description">Journées avec des ventes</span>
      </div>
    </section>

    <!-- FILTERS -->
    <section class="filter-card">
      <div class="filter-heading">
        <div>
          <h3>Journal des transactions</h3>
          <p>Consulte et retrouve facilement tes opérations.</p>
        </div>

        <span class="results-badge">
          {{ filteredSales.length }} résultat(s)
        </span>
      </div>

      <div class="filters">
        <div class="search-field">
          <span>⌕</span>
          <input
            v-model="search"
            type="text"
            placeholder="Rechercher un client ou un produit..."
          />
          <button
            v-if="search"
            class="clear-search"
            @click="search = ''"
          >×</button>
        </div>

        <div class="date-field">
          <label>Du</label>
          <input type="date" v-model="startDate" />
        </div>

        <div class="date-field">
          <label>Au</label>
          <input type="date" v-model="endDate" />
        </div>

        <button class="reset-btn" @click="resetFilters">
          Réinitialiser
        </button>
      </div>
    </section>

    <!-- LOADING -->
    <div v-if="loading && !sales.length" class="loading-state">
      <div class="loader"></div>
      <p>Chargement de la comptabilité...</p>
    </div>

    <!-- EMPTY -->
    <div
      v-else-if="!Object.keys(groupedSales).length"
      class="empty-state"
    >
      <div class="empty-icon">📂</div>
      <h3>Aucune vente trouvée</h3>
      <p>
        Aucune transaction ne correspond à tes critères de recherche.
      </p>
      <button @click="resetFilters">Effacer les filtres</button>
    </div>

    <!-- DAILY GROUPS -->
    <section v-else class="sales-journal">
      <article
        v-for="(group, date) in groupedSales"
        :key="date"
        class="day-card"
      >
        <!-- DAY HEADER -->
        <div class="day-header">
          <div class="day-info">
            <div class="calendar-icon">📅</div>

            <div>
              <h3>{{ formatDisplayDate(date) }}</h3>

              <div class="day-meta">
                <span>{{ group.sales.length }} vente(s)</span>
                <span class="meta-dot"></span>
                <span>{{ group.itemsCount }} article(s)</span>
              </div>
            </div>
          </div>

          <div class="day-financial">
            <span class="day-total-label">Total journalier</span>
            <strong>{{ formatMoney(group.total) }}</strong>
          </div>
        </div>

        <!-- TABLE -->
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Client</th>
                <th>Produits</th>
                <th>Montant</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="sale in group.sales"
                :key="sale.id"
              >
                <td>
                  <div class="client-cell">
                    <div class="client-avatar">
                      {{ getInitials(getClientName(sale)) }}
                    </div>

                    <div class="client-info">
                      <strong>{{ getClientName(sale) }}</strong>
                      <small>
                        {{ sale.id.slice(0, 8) }}
                      </small>
                    </div>
                  </div>
                </td>

                <td>
                  <span class="products-count">
                    {{ getItemsCount(sale) }} article(s)
                  </span>
                </td>

                <td>
                  <strong class="amount">
                    {{ formatMoney(sale.total) }}
                  </strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- DAY FOOTER -->
        <div class="day-footer">
          <div class="footer-summary">
            <span>{{ group.sales.length }} transaction(s)</span>
            <span class="footer-separator">•</span>
            <strong>{{ formatMoney(group.total) }}</strong>
          </div>

          <button
            class="pdf-btn"
            @click="downloadPDF(date, group)"
          >
            <span>📄</span>
            Exporter le PDF
          </button>
        </div>
      </article>
    </section>

    <!-- BOTTOM SUMMARY -->
    <section
      v-if="filteredSales.length"
      class="bottom-summary"
    >
      <div>
        <span>Récapitulatif de la période</span>
        <strong>{{ formatMoney(totalRevenue) }}</strong>
      </div>

      <div class="summary-details">
        <span>{{ filteredSales.length }} ventes</span>
        <span>{{ totalItems }} articles</span>
        <span>{{ Object.keys(groupedSales).length }} journées</span>
      </div>
    </section>
  </main>
</template>

<script>
import { db } from "../firebase"
import Sidebar from "../components/SidebarPage.vue"
import Navbar from "../components/NavbarPage.vue"

import {
  collection,
  getDocs
} from "firebase/firestore"

import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

export default {
  components: {
    Navbar,
    Sidebar
  },

  data() {
    return {
      sales: [],
      loading: false,
      error: "",
      search: "",
      startDate: "",
      endDate: ""
    }
  },

  computed: {
    filteredSales() {
      let result = [...this.sales]

      // FILTRE DATE DE DEBUT
      if (this.startDate) {
        result = result.filter(sale => {
          const date = this.formatDateKey(sale.date)
          return date && date >= this.startDate
        })
      }

      // FILTRE DATE DE FIN
      if (this.endDate) {
        result = result.filter(sale => {
          const date = this.formatDateKey(sale.date)
          return date && date <= this.endDate
        })
      }

      // RECHERCHE
      if (this.search.trim()) {
        const query = this.search.toLowerCase().trim()

        result = result.filter(sale => {
          const client = this.getClientName(sale).toLowerCase()

          const products = (Array.isArray(sale.items) ? sale.items : [])
            .map(item => item.name || item.productName || "")
            .join(" ")
            .toLowerCase()

          return (
            client.includes(query) ||
            products.includes(query) ||
            sale.id.toLowerCase().includes(query)
          )
        })
      }

      return result
    },

    groupedSales() {
      const groups = {}

      this.filteredSales.forEach(sale => {
        const date = this.formatDateKey(sale.date)

        if (!date) return

        if (!groups[date]) {
          groups[date] = {
            sales: [],
            total: 0,
            itemsCount: 0
          }
        }

        groups[date].sales.push(sale)
        groups[date].total += this.getSaleTotal(sale)
        groups[date].itemsCount += this.getItemsCount(sale)
      })

      // Du plus récent au plus ancien
      return Object.keys(groups)
        .sort((a, b) => b.localeCompare(a))
        .reduce((acc, key) => {
          acc[key] = groups[key]
          return acc
        }, {})
    },

    totalRevenue() {
      return this.filteredSales.reduce(
        (total, sale) => total + this.getSaleTotal(sale),
        0
      )
    },

    totalItems() {
      return this.filteredSales.reduce(
        (total, sale) => total + this.getItemsCount(sale),
        0
      )
    }
  },

  methods: {
    async loadSales() {
      this.loading = true
      this.error = ""

      try {
        const snap = await getDocs(collection(db, "sales"))

        this.sales = snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))

      } catch (error) {
        console.error("Erreur chargement comptabilité :", error)
        this.error = "Impossible de charger les données comptables."
      } finally {
        this.loading = false
      }
    },

    // CONVERSION DATE FIRESTORE
    getDateObject(value) {
      if (!value) return null

      let date

      if (typeof value.toDate === "function") {
        date = value.toDate()
      } else if (value instanceof Date) {
        date = value
      } else if (typeof value === "number") {
        date = new Date(value)
      } else if (typeof value === "string") {
        date = new Date(value)
      } else if (value.seconds !== undefined) {
        date = new Date(value.seconds * 1000)
      } else {
        return null
      }

      return Number.isNaN(date.getTime()) ? null : date
    },

    formatDateKey(value) {
      const date = this.getDateObject(value)

      if (!date) return null

      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, "0")
      const day = String(date.getDate()).padStart(2, "0")

      return `${year}-${month}-${day}`
    },

    formatDisplayDate(dateString) {
      const [year, month, day] = dateString.split("-").map(Number)

      const date = new Date(year, month - 1, day)

      return date.toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric"
      })
    },

    formatMoney(amount) {
      const value = Number(amount) || 0

      return new Intl.NumberFormat("fr-FR", {
        maximumFractionDigits: 0
      }).format(value) + " FCFA"
    },

    getSaleTotal(sale) {
      return Number(sale.total) || 0
    },

    getItemsCount(sale) {
      if (!Array.isArray(sale.items)) return 0

      return sale.items.reduce((total, item) => {
        const quantity = Number(
          item.quantity ?? item.qty ?? 1
        )

        return total + (Number.isFinite(quantity) ? quantity : 0)
      }, 0)
    },

    getClientName(sale) {
      return (
        sale.clientName ||
        sale.client ||
        sale.customerName ||
        sale.customer?.name ||
        "Client non renseigné"
      )
    },

    getInitials(name) {
      if (!name) return "CL"

      return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map(part => part.charAt(0).toUpperCase())
        .join("")
    },

    resetFilters() {
      this.search = ""
      this.startDate = ""
      this.endDate = ""
    },

    // EXPORT PDF JOURNALIER
    downloadPDF(date, group) {
      try {
        const doc = new jsPDF()

        const pageWidth = doc.internal.pageSize.getWidth()

        // ENTETE
        doc.setFillColor(30, 64, 175)
        doc.rect(0, 0, pageWidth, 34, "F")

        doc.setTextColor(255, 255, 255)
        doc.setFont("helvetica", "bold")
        doc.setFontSize(17)

        doc.text("JOURNAL DES SORTIES", pageWidth / 2, 15, {
          align: "center"
        })

        doc.setFont("helvetica", "normal")
        doc.setFontSize(9)

        doc.text("RAPPORT COMPTABLE JOURNALIER", pageWidth / 2, 23, {
          align: "center"
        })

        // INFORMATIONS
        doc.setTextColor(45, 55, 72)
        doc.setFontSize(10)

        doc.text(
          `Date : ${this.formatDisplayDate(date)}`,
          14,
          45
        )

        doc.text(
          `Nombre de ventes : ${group.sales.length}`,
          14,
          52
        )

        doc.text(
          `Articles vendus : ${group.itemsCount}`,
          14,
          59
        )

        // TABLEAU
        const rows = group.sales.map(sale => {
          return [
            this.getClientName(sale),
            this.getItemsCount(sale).toString(),
            this.formatMoney(this.getSaleTotal(sale))
          ]
        })

        autoTable(doc, {
          startY: 68,

          head: [[
            "Client",
            "Articles",
            "Montant"
          ]],

          body: rows,

          theme: "grid",

          styles: {
            font: "helvetica",
            fontSize: 9,
            cellPadding: 4,
            textColor: [45, 55, 72]
          },

          headStyles: {
            fillColor: [30, 64, 175],
            textColor: [255, 255, 255],
            fontStyle: "bold"
          },

          alternateRowStyles: {
            fillColor: [245, 247, 251]
          },

          columnStyles: {
            1: {
              halign: "center",
              cellWidth: 30
            },
            2: {
              halign: "right"
            }
          },

          margin: {
            left: 14,
            right: 14
          }
        })

        // TOTAL
        let finalY = doc.lastAutoTable.finalY + 14

        if (finalY > doc.internal.pageSize.getHeight() - 25) {
          doc.addPage()
          finalY = 25
        }

        doc.setFillColor(239, 246, 255)
        doc.roundedRect(
          14,
          finalY - 7,
          pageWidth - 28,
          19,
          2,
          2,
          "F"
        )

        doc.setTextColor(30, 64, 175)
        doc.setFont("helvetica", "bold")
        doc.setFontSize(11)

        doc.text(
          "TOTAL DU JOUR :",
          19,
          finalY + 5
        )

        doc.text(
          this.formatMoney(group.total),
          pageWidth - 19,
          finalY + 5,
          { align: "right" }
        )

        // PIED DE PAGE
        const pageCount = doc.internal.getNumberOfPages()

        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i)

          doc.setFont("helvetica", "normal")
          doc.setFontSize(8)
          doc.setTextColor(130, 140, 155)

          doc.text(
            `Document généré le ${new Date().toLocaleDateString("fr-FR")}`,
            14,
            doc.internal.pageSize.getHeight() - 10
          )

          doc.text(
            `Page ${i}/${pageCount}`,
            pageWidth - 14,
            doc.internal.pageSize.getHeight() - 10,
            { align: "right" }
          )
        }

        doc.save(`journal-${date}.pdf`)

      } catch (error) {
        console.error("Erreur export PDF :", error)
        this.error = "Impossible de générer le fichier PDF."
      }
    }
  },

  mounted() {
    this.loadSales()
  }
}
</script>

<style scoped>
/* =========================
   PAGE
========================= */

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

/* =========================
   HEADER
========================= */

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
  gap: 16px;
}

.header-icon {
  width: 55px;
  height: 55px;
  border-radius: 16px;
  background: linear-gradient(135deg, #1d4ed8, #3b82f6);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 25px;
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.2);
}

.page-header h1 {
  margin: 0;
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -0.7px;
}

.page-header p {
  color: #8791a5;
  margin: 6px 0 0;
  font-size: 13px;
}

.refresh-btn {
  height: 42px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  gap: 9px;
  border: 1px solid #e1e6ef;
  border-radius: 10px;
  background: white;
  color: #344054;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
}

.refresh-btn:hover {
  border-color: #2563eb;
  color: #2563eb;
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: wait;
}

.refresh-btn span {
  font-size: 19px;
}

.rotating {
  display: inline-block;
  animation: rotate 0.8s linear infinite;
}

@keyframes rotate {
  to { transform: rotate(360deg); }
}

/* =========================
   STATISTICS
========================= */

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border: 1px solid #e9edf4;
  border-radius: 16px;
  padding: 22px;
  box-shadow: 0 3px 12px rgba(20, 40, 80, 0.025);
  transition: 0.25s;
  min-width: 0;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(20, 40, 80, 0.07);
}

.stat-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.stat-label {
  color: #7b879b;
  font-size: 12px;
  font-weight: 600;
}

.stat-icon {
  width: 38px;
  height: 38px;
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff7ed;
  font-size: 18px;
  flex-shrink: 0;
}

.stat-icon.blue {
  background: #eff6ff;
}

.stat-icon.purple {
  background: #f5f3ff;
}

.stat-icon.orange {
  background: #fff7ed;
}

.stat-card h2 {
  font-size: 23px;
  font-weight: 800;
  letter-spacing: -0.7px;
  margin: 17px 0 7px;
  overflow-wrap: anywhere;
}

.stat-description {
  font-size: 11px;
  color: #9aa3b2;
}

.primary-card {
  background: linear-gradient(135deg, #1e40af, #2563eb);
  border: none;
  color: white;
}

.primary-card .stat-label,
.primary-card .stat-description {
  color: rgba(255, 255, 255, 0.75);
}

.primary-card .stat-icon {
  background: rgba(255, 255, 255, 0.16);
}

/* =========================
   FILTERS
========================= */

.filter-card {
  background: white;
  border: 1px solid #e9edf4;
  border-radius: 16px;
  padding: 22px;
  margin-bottom: 25px;
  box-shadow: 0 3px 12px rgba(20, 40, 80, 0.025);
}

.filter-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
}

.filter-heading h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 750;
}

.filter-heading p {
  color: #929bad;
  margin: 5px 0 0;
  font-size: 12px;
}

.results-badge {
  background: #eff6ff;
  color: #2563eb;
  padding: 7px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}

.filters {
  display: flex;
  align-items: flex-end;
  gap: 12px;
}

.search-field {
  height: 43px;
  flex: 1;
  min-width: 180px;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 0 12px;
  border: 1px solid #e2e7ef;
  border-radius: 9px;
  background: #fafbfe;
}

.search-field:focus-within {
  border-color: #3b82f6;
  background: white;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.08);
}

.search-field > span {
  font-size: 23px;
  color: #98a2b3;
}

.search-field input {
  width: 100%;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  color: #263247;
  font-size: 12px;
}

.clear-search {
  border: none;
  background: none;
  font-size: 20px;
  color: #98a2b3;
  cursor: pointer;
}

.date-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.date-field label {
  font-size: 11px;
  font-weight: 700;
  color: #768196;
}

.date-field input {
  height: 43px;
  width: 145px;
  padding: 0 9px;
  border: 1px solid #e2e7ef;
  border-radius: 9px;
  background: #fafbfe;
  color: #344054;
  outline: none;
  font-size: 11px;
}

.date-field input:focus {
  border-color: #3b82f6;
}

.reset-btn {
  height: 43px;
  padding: 0 14px;
  background: #f1f5f9;
  color: #475569;
  border: none;
  border-radius: 9px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s;
}

.reset-btn:hover {
  background: #e2e8f0;
}

/* =========================
   DAILY CARDS
========================= */

.sales-journal {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.day-card {
  background: white;
  border: 1px solid #e8edf5;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 3px 12px rgba(20, 40, 80, 0.025);
}

.day-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  padding: 20px 22px;
  border-bottom: 1px solid #edf0f5;
}

.day-info {
  display: flex;
  align-items: center;
  gap: 13px;
  min-width: 0;
}

.calendar-icon {
  width: 43px;
  height: 43px;
  border-radius: 12px;
  background: #eff6ff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 19px;
  flex-shrink: 0;
}

.day-info h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 750;
  text-transform: capitalize;
}

.day-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
  font-size: 11px;
  color: #939caf;
}

.meta-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #cbd5e1;
}

.day-financial {
  text-align: right;
}

.day-total-label {
  display: block;
  color: #929bad;
  font-size: 10px;
  margin-bottom: 5px;
}

.day-financial strong {
  font-size: 17px;
  font-weight: 800;
  color: #16a36a;
  white-space: nowrap;
}

/* =========================
   TABLE
========================= */

.table-wrapper {
  width: 100%;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  min-width: 450px;
}

thead {
  background: #fafbfe;
}

th {
  padding: 13px 22px;
  text-align: left;
  color: #8993a5;
  font-size: 10px;
  font-weight: 750;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

td {
  padding: 13px 22px;
  border-top: 1px solid #f0f2f6;
  font-size: 12px;
  color: #475467;
}

tbody tr {
  transition: background 0.15s;
}

tbody tr:hover {
  background: #fafcff;
}

.client-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.client-avatar {
  width: 34px;
  height: 34px;
  background: #eff6ff;
  color: #2563eb;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 800;
  flex-shrink: 0;
}

.client-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.client-info strong {
  color: #344054;
  font-size: 12px;
}

.client-info small {
  color: #a0a8b6;
  font-size: 10px;
}

.products-count {
  background: #f1f5f9;
  color: #64748b;
  padding: 6px 10px;
  border-radius: 7px;
  font-size: 10px;
  font-weight: 700;
}

.amount {
  color: #172033;
  font-size: 12px;
  font-weight: 750;
}

/* =========================
   FOOTER
========================= */

.day-footer {
  padding: 15px 22px;
  border-top: 1px solid #edf0f5;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  background: #fcfdff;
}

.footer-summary {
  display: flex;
  align-items: center;
  gap: 9px;
  color: #8b95a7;
  font-size: 11px;
}

.footer-summary strong {
  color: #172033;
  font-size: 12px;
}

.footer-separator {
  color: #cbd5e1;
}

.pdf-btn {
  height: 37px;
  padding: 0 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1px solid #dbeafe;
  background: #eff6ff;
  color: #2563eb;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 750;
  cursor: pointer;
  transition: 0.2s;
}

.pdf-btn:hover {
  background: #2563eb;
  color: white;
  border-color: #2563eb;
}

/* =========================
   BOTTOM SUMMARY
========================= */

.bottom-summary {
  margin-top: 22px;
  padding: 20px 24px;
  border-radius: 14px;
  background: #172554;
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.bottom-summary > div:first-child {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.bottom-summary span {
  color: #bdc9e5;
  font-size: 11px;
}

.bottom-summary strong {
  font-size: 21px;
  font-weight: 800;
}

.summary-details {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

/* =========================
   EMPTY / LOADING / ERROR
========================= */

.empty-state,
.loading-state {
  background: white;
  border: 1px solid #e9edf4;
  border-radius: 16px;
  padding: 55px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 38px;
  margin-bottom: 12px;
}

.empty-state h3 {
  margin: 0;
  font-size: 16px;
}

.empty-state p,
.loading-state p {
  color: #929bad;
  font-size: 12px;
  margin: 8px 0 18px;
}

.empty-state button {
  background: #2563eb;
  border: none;
  color: white;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
}

.loader {
  width: 30px;
  height: 30px;
  margin: auto;
  border: 3px solid #e5edff;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: rotate 0.8s linear infinite;
}

.error-message {
  background: #fff1f2;
  color: #be123c;
  border: 1px solid #fecdd3;
  border-radius: 10px;
  padding: 13px 16px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
}

.error-message button {
  margin-left: auto;
  background: transparent;
  border: none;
  color: #be123c;
  font-weight: 800;
  cursor: pointer;
}

/* =========================
   RESPONSIVE
========================= */

@media (max-width: 1100px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .filters {
    flex-wrap: wrap;
  }

  .search-field {
    flex-basis: 100%;
  }
}

@media (max-width: 768px) {
  .page {
    margin-left: 0;
    padding: 20px 14px;
  }

  .page-header {
    align-items: flex-start;
  }

  .page-header h1 {
    font-size: 21px;
  }

  .header-icon {
    width: 45px;
    height: 45px;
    font-size: 21px;
  }

  .refresh-btn {
    width: 40px;
    height: 40px;
    padding: 0;
    justify-content: center;
    font-size: 0;
  }

  .refresh-btn span {
    font-size: 20px;
  }

  .stats-grid {
    gap: 10px;
  }

  .stat-card {
    padding: 15px;
  }

  .stat-card h2 {
    font-size: 19px;
  }

  .filter-card {
    padding: 16px;
  }

  .filter-heading {
    align-items: flex-start;
  }

  .filters {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  .search-field {
    grid-column: 1 / -1;
    min-width: 0;
  }

  .date-field input {
    width: 100%;
  }

  .reset-btn {
    grid-column: 1 / -1;
  }

  .day-header {
    padding: 16px;
  }

  .day-financial strong {
    font-size: 14px;
  }

  th,
  td {
    padding: 12px 14px;
  }

  .day-footer {
    padding: 13px 15px;
  }

  .bottom-summary {
    align-items: flex-start;
    flex-direction: column;
  }

  .summary-details {
    gap: 12px;
  }
}

@media (max-width: 420px) {
  .page {
    padding: 16px 10px;
  }

  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }

  .stat-card h2 {
    font-size: 16px;
  }

  .stat-label {
    font-size: 10px;
  }

  .day-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .day-financial {
    text-align: left;
    padding-left: 56px;
  }

  .day-footer {
    align-items: flex-start;
    flex-direction: column;
  }

  .pdf-btn {
    width: 100%;
  }

  .filter-heading {
    flex-direction: column;
  }

  .results-badge {
    align-self: flex-start;
  }
}
</style>
