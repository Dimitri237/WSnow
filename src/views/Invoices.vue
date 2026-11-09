
<template>
  <div>
    <Navbar />
    <Sidebar />

    <main class="page">

      <!-- HEADER -->
      <header class="page-header">
        <div class="header-content">
          <div class="header-icon">▤</div>

          <div>
            <span class="eyebrow">GESTION FINANCIÈRE</span>
            <h1>Factures</h1>
            <p>Consultez et suivez l'ensemble de vos factures.</p>
          </div>
        </div>

        <button
          class="refresh-btn"
          @click="loadInvoices"
          :disabled="loading"
        >
          <span :class="{ rotating: loading }">↻</span>
          Actualiser
        </button>
      </header>

      <!-- ERROR -->
      <div v-if="error" class="error-message">
        <span>⚠</span>
        {{ error }}

        <button @click="loadInvoices">
          Réessayer
        </button>
      </div>

      <!-- STATISTICS -->
      <section class="stats-grid">

        <article class="stat-card primary-card">
          <div class="stat-top">
            <span>Total des factures</span>
            <span class="stat-icon">▤</span>
          </div>

          <h2>{{ invoices.length }}</h2>
          <small>Factures enregistrées</small>

          <div class="stat-decoration"></div>
        </article>

        <article class="stat-card">
          <div class="stat-top">
            <span>Chiffre d'affaires</span>
            <span class="stat-icon blue">◈</span>
          </div>

          <h2>{{ formatAmount(totalRevenue) }}</h2>
          <small>Montant cumulé des factures</small>
        </article>

        <article class="stat-card">
          <div class="stat-top">
            <span>Montant moyen</span>
            <span class="stat-icon purple">◉</span>
          </div>

          <h2>{{ formatAmount(averageInvoice) }}</h2>
          <small>Valeur moyenne par facture</small>
        </article>

        <article class="stat-card">
          <div class="stat-top">
            <span>Ce mois-ci</span>
            <span class="stat-icon orange">▦</span>
          </div>

          <h2>{{ invoicesThisMonth }}</h2>
          <small>Factures créées ce mois</small>
        </article>

      </section>

      <!-- INVOICES CONTENT -->
      <section class="content-card">

        <div class="section-heading">
          <div>
            <h3>Répertoire des factures</h3>
            <p>Retrouvez rapidement vos documents de facturation.</p>
          </div>

          <span class="count-badge">
            {{ filteredInvoices.length }} résultat(s)
          </span>
        </div>

        <!-- TOOLBAR -->
        <div class="toolbar">

          <div class="search-box">
            <span class="search-icon">⌕</span>

            <input
              v-model="search"
              type="text"
              placeholder="Rechercher un client ou une facture..."
            />

            <button
              v-if="search"
              class="clear-btn"
              @click="search = ''"
              aria-label="Effacer la recherche"
            >
              ×
            </button>
          </div>

          <select v-model="period" class="filter-select">
            <option value="all">Toutes les périodes</option>
            <option value="month">Ce mois-ci</option>
            <option value="year">Cette année</option>
          </select>

          <select v-model="sortBy" class="filter-select">
            <option value="newest">Plus récentes</option>
            <option value="oldest">Plus anciennes</option>
            <option value="highest">Montant décroissant</option>
            <option value="lowest">Montant croissant</option>
          </select>

        </div>

        <!-- LOADING -->
        <div
          v-if="loading && invoices.length === 0"
          class="loading-state"
        >
          <div class="loader"></div>
          <h3>Chargement des factures</h3>
          <p>Récupération de vos données financières...</p>
        </div>

        <!-- EMPTY -->
        <div
          v-else-if="filteredInvoices.length === 0"
          class="empty-state"
        >
          <div class="empty-icon">▤</div>

          <h3>
            {{ invoices.length === 0
              ? "Aucune facture disponible"
              : "Aucun résultat trouvé"
            }}
          </h3>

          <p>
            {{ invoices.length === 0
              ? "Les factures enregistrées apparaîtront ici."
              : "Aucune facture ne correspond à vos critères de recherche."
            }}
          </p>

          <button
            v-if="search || period !== 'all'"
            class="reset-btn"
            @click="resetFilters"
          >
            Réinitialiser les filtres
          </button>
        </div>

        <!-- INVOICES GRID -->
        <div v-else class="invoices-grid">

          <article
            v-for="(invoice, index) in filteredInvoices"
            :key="invoice.id"
            class="invoice-card"
          >

            <div class="invoice-card-top">

              <div class="invoice-icon">
                <span>▤</span>
              </div>

              <span class="invoice-number">
                FACTURE #{{ String(index + 1).padStart(3, "0") }}
              </span>

              <span class="invoice-dot"></span>
            </div>

            <div class="invoice-main">

              <span class="invoice-label">CLIENT</span>

              <h3>
                {{ invoice.client || "Client non renseigné" }}
              </h3>

              <div class="invoice-date">
                <span>◷</span>
                {{ formatDate(invoice.date) }}
              </div>

            </div>

            <div class="invoice-divider"></div>

            <div class="invoice-bottom">

              <div class="invoice-total">
                <small>Montant total</small>

                <strong>
                  {{ formatAmount(invoice.total) }}
                </strong>
              </div>

              <div class="invoice-actions">
                <button
                  class="detail-btn"
                  @click="copyInvoiceId(invoice.id)"
                  title="Copier l'identifiant"
                >
                  <span>▣</span>
                </button>
              </div>

            </div>

            <div class="invoice-reference">
              Référence : {{ invoice.id }}
            </div>

          </article>

        </div>

        <!-- FOOTER -->
        <div
          v-if="filteredInvoices.length"
          class="list-footer"
        >
          <span>
            Affichage de
            <strong>{{ filteredInvoices.length }}</strong>
            facture(s)
          </span>

          <span class="footer-indicator">
            <i></i>
            Données Firebase
          </span>
        </div>

      </section>

    </main>
  </div>
</template>

<script>
import Navbar from "../components/NavbarPage.vue";
import Sidebar from "../components/SidebarPage.vue";

import { db } from "../firebase";

import {
  collection,
  getDocs
} from "firebase/firestore";

export default {
  name: "InvoicesPage",

  components: {
    Navbar,
    Sidebar
  },

  data() {
    return {
      invoices: [],

      loading: false,
      error: "",

      search: "",
      period: "all",
      sortBy: "newest"
    };
  },

  computed: {

    // CHIFFRE D'AFFAIRES TOTAL
    totalRevenue() {
      return this.invoices.reduce((total, invoice) => {
        return total + this.getAmount(invoice.total);
      }, 0);
    },

    // MONTANT MOYEN
    averageInvoice() {
      if (!this.invoices.length) return 0;

      return this.totalRevenue / this.invoices.length;
    },

    // FACTURES DU MOIS
    invoicesThisMonth() {
      const now = new Date();

      return this.invoices.filter(invoice => {
        const date = this.getDateObject(invoice.date);

        if (!date) return false;

        return (
          date.getMonth() === now.getMonth() &&
          date.getFullYear() === now.getFullYear()
        );
      }).length;
    },

    // RECHERCHE ET FILTRAGE
    filteredInvoices() {
      const query = this.search.trim().toLowerCase();

      const now = new Date();

      let result = this.invoices.filter(invoice => {

        // RECHERCHE
        const matchesSearch =
          !query ||
          (invoice.client || "").toLowerCase().includes(query) ||
          invoice.id.toLowerCase().includes(query);

        if (!matchesSearch) return false;

        // PÉRIODE
        const date = this.getDateObject(invoice.date);

        if (this.period !== "all" && !date) {
          return false;
        }

        if (this.period === "month") {
          if (
            date.getMonth() !== now.getMonth() ||
            date.getFullYear() !== now.getFullYear()
          ) {
            return false;
          }
        }

        if (this.period === "year") {
          if (date.getFullYear() !== now.getFullYear()) {
            return false;
          }
        }

        return true;
      });

      // TRI
      result = [...result].sort((a, b) => {

        if (this.sortBy === "newest") {
          return this.getTimestamp(b.date) - this.getTimestamp(a.date);
        }

        if (this.sortBy === "oldest") {
          return this.getTimestamp(a.date) - this.getTimestamp(b.date);
        }

        if (this.sortBy === "highest") {
          return this.getAmount(b.total) - this.getAmount(a.total);
        }

        if (this.sortBy === "lowest") {
          return this.getAmount(a.total) - this.getAmount(b.total);
        }

        return 0;
      });

      return result;
    }
  },

  methods: {

    // CHARGEMENT FIREBASE
    async loadInvoices() {
      if (this.loading) return;

      this.loading = true;
      this.error = "";

      try {
        const snap = await getDocs(
          collection(db, "invoices")
        );

        this.invoices = snap.docs.map(d => ({
          id: d.id,
          ...d.data()
        }));

      } catch (error) {
        console.error("Erreur chargement factures :", error);

        this.error =
          "Impossible de récupérer les factures. Vérifiez votre connexion.";
      } finally {
        this.loading = false;
      }
    },

    // CONVERSION DU MONTANT
    getAmount(value) {
      const amount = Number(value);

      return Number.isFinite(amount) ? amount : 0;
    },

    // FORMAT FCFA
    formatAmount(value) {
      return `${this.getAmount(value).toLocaleString("fr-FR", {
        maximumFractionDigits: 0
      })} FCFA`;
    },

    // CONVERSION DES DATES
    getDateObject(value) {
      if (!value) return null;

      let date;

      if (typeof value.toDate === "function") {
        date = value.toDate();

      } else if (value instanceof Date) {
        date = value;

      } else if (typeof value === "number") {
        date = new Date(value);

      } else if (typeof value === "string") {
        date = new Date(value);

      } else if (value.seconds !== undefined) {
        date = new Date(value.seconds * 1000);

      } else {
        return null;
      }

      return Number.isNaN(date.getTime()) ? null : date;
    },

    // TIMESTAMP POUR LE TRI
    getTimestamp(value) {
      const date = this.getDateObject(value);

      return date ? date.getTime() : 0;
    },

    // AFFICHAGE DATE
    formatDate(value) {
      const date = this.getDateObject(value);

      if (!date) return "Date non disponible";

      return date.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "long",
        year: "numeric"
      });
    },

    // RÉINITIALISER
    resetFilters() {
      this.search = "";
      this.period = "all";
      this.sortBy = "newest";
    },

    // COPIER IDENTIFIANT
    async copyInvoiceId(id) {
      try {
        await navigator.clipboard.writeText(id);
        alert("Identifiant de facture copié.");
      } catch (error) {
        console.error("Erreur copie :", error);
        alert("Impossible de copier cet identifiant.");
      }
    }
  },

  mounted() {
    this.loadInvoices();
  }
};
</script>

<style scoped>
/* =====================================
   GLOBAL
===================================== */

.page {
  margin-left: 250px;
  min-height: 100vh;
  padding: 32px;
  background: #f5f7fb;
  color: #17233d;
  font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.page * {
  box-sizing: border-box;
}

/* =====================================
   HEADER
===================================== */

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
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  background: linear-gradient(135deg, #1e40af, #3b82f6);
  color: white;
  font-size: 27px;
  box-shadow: 0 8px 20px rgba(37,99,235,.2);
}

.eyebrow {
  display: block;
  color: #2563eb;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 1.5px;
  margin-bottom: 5px;
}

.page-header h1 {
  margin: 0;
  font-size: 25px;
  font-weight: 850;
  letter-spacing: -.7px;
}

.page-header p {
  margin: 6px 0 0;
  color: #8791a5;
  font-size: 12px;
}

.refresh-btn {
  height: 42px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  gap: 9px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: white;
  color: #475467;
  font-size: 11px;
  font-weight: 750;
  cursor: pointer;
  transition: .2s;
}

.refresh-btn:hover {
  border-color: #93c5fd;
  color: #2563eb;
}

.refresh-btn:disabled {
  opacity: .6;
  cursor: wait;
}

.refresh-btn span {
  font-size: 19px;
}

.rotating {
  display: inline-block;
  animation: rotate .8s linear infinite;
}

@keyframes rotate {
  to { transform: rotate(360deg); }
}

/* =====================================
   STATISTICS
===================================== */

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 17px;
  margin-bottom: 26px;
}

.stat-card {
  position: relative;
  overflow: hidden;
  min-width: 0;
  padding: 21px;
  border: 1px solid #e9edf4;
  border-radius: 15px;
  background: white;
  box-shadow: 0 3px 12px rgba(20,40,80,.025);
  transition: .25s;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(20,40,80,.07);
}

.stat-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.stat-top > span:first-child {
  color: #7b879b;
  font-size: 11px;
  font-weight: 700;
}

.stat-icon {
  width: 37px;
  height: 37px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 11px;
  background: #fff7ed;
  color: #f59e0b;
  font-size: 18px;
}

.stat-icon.blue {
  background: #eff6ff;
  color: #2563eb;
}

.stat-icon.purple {
  background: #f5f3ff;
  color: #7c3aed;
}

.stat-icon.orange {
  background: #fff7ed;
  color: #ea580c;
}

.stat-card h2 {
  margin: 16px 0 7px;
  font-size: clamp(20px, 2vw, 27px);
  font-weight: 850;
  letter-spacing: -.7px;
  overflow-wrap: anywhere;
}

.stat-card small {
  color: #9aa3b2;
  font-size: 10px;
}

.primary-card {
  background: linear-gradient(135deg, #1e3a8a, #2563eb);
  color: white;
  border: none;
}

.primary-card .stat-top > span:first-child,
.primary-card small {
  color: rgba(255,255,255,.75);
}

.primary-card .stat-icon {
  background: rgba(255,255,255,.16);
  color: white;
}

.stat-decoration {
  position: absolute;
  width: 110px;
  height: 110px;
  right: -35px;
  bottom: -65px;
  border: 1px solid rgba(255,255,255,.13);
  border-radius: 50%;
}

/* =====================================
   CONTENT
===================================== */

.content-card {
  padding: 24px;
  background: white;
  border: 1px solid #e9edf4;
  border-radius: 17px;
  box-shadow: 0 3px 12px rgba(20,40,80,.025);
}

.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 23px;
}

.section-heading h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 850;
}

.section-heading p {
  margin: 6px 0 0;
  color: #929bad;
  font-size: 11px;
}

.count-badge {
  padding: 8px 12px;
  border-radius: 20px;
  background: #eff6ff;
  color: #2563eb;
  font-size: 10px;
  font-weight: 800;
  white-space: nowrap;
}

/* =====================================
   TOOLBAR
===================================== */

.toolbar {
  display: flex;
  align-items: center;
  gap: 11px;
  margin-bottom: 23px;
}

.search-box {
  height: 43px;
  flex: 1;
  min-width: 180px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 13px;
  background: #fafbfe;
  border: 1px solid #e2e7ef;
  border-radius: 9px;
  transition: .2s;
}

.search-box:focus-within {
  background: white;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59,130,246,.08);
}

.search-icon {
  color: #98a2b3;
  font-size: 23px;
}

.search-box input {
  width: 100%;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  color: #344054;
  font-size: 11px;
}

.clear-btn {
  border: none;
  background: transparent;
  color: #98a2b3;
  font-size: 20px;
  cursor: pointer;
}

.filter-select {
  height: 43px;
  padding: 0 12px;
  border: 1px solid #e2e7ef;
  border-radius: 9px;
  background: white;
  color: #475467;
  font-family: inherit;
  font-size: 10px;
  font-weight: 650;
  outline: none;
  cursor: pointer;
}

.filter-select:focus {
  border-color: #3b82f6;
}

/* =====================================
   INVOICE GRID
===================================== */

.invoices-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 17px;
}

.invoice-card {
  min-width: 0;
  padding: 19px;
  border: 1px solid #e8edf5;
  border-radius: 14px;
  background: white;
  transition: .25s;
}

.invoice-card:hover {
  transform: translateY(-3px);
  border-color: #bfdbfe;
  box-shadow: 0 12px 28px rgba(20,40,80,.07);
}

.invoice-card-top {
  display: flex;
  align-items: center;
  gap: 11px;
}

.invoice-icon {
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: linear-gradient(135deg, #eff6ff, #dbeafe);
  color: #2563eb;
  font-size: 21px;
}

.invoice-number {
  color: #64748b;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: .5px;
}

.invoice-dot {
  width: 7px;
  height: 7px;
  margin-left: auto;
  border-radius: 50%;
  background: #2563eb;
}

.invoice-main {
  margin-top: 22px;
}

.invoice-label {
  color: #9aa3b2;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 1px;
}

.invoice-main h3 {
  margin: 8px 0 12px;
  color: #202b40;
  font-size: 15px;
  font-weight: 850;
  overflow-wrap: anywhere;
}

.invoice-date {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #8994a7;
  font-size: 10px;
}

.invoice-date span {
  font-size: 15px;
}

.invoice-divider {
  height: 1px;
  margin: 19px 0;
  background: #edf0f5;
}

.invoice-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.invoice-total {
  display: flex;
  flex-direction: column;
  gap: 7px;
  min-width: 0;
}

.invoice-total small {
  color: #98a2b3;
  font-size: 10px;
}

.invoice-total strong {
  color: #1e40af;
  font-size: 19px;
  font-weight: 850;
  overflow-wrap: anywhere;
}

.invoice-actions {
  display: flex;
  gap: 7px;
}

.detail-btn {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 9px;
  background: #eff6ff;
  color: #2563eb;
  font-size: 16px;
  cursor: pointer;
  transition: .2s;
}

.detail-btn:hover {
  background: #dbeafe;
}

.invoice-reference {
  margin-top: 17px;
  padding-top: 12px;
  border-top: 1px solid #edf0f5;
  color: #a0a8b6;
  font-size: 9px;
  overflow-wrap: anywhere;
}

/* =====================================
   EMPTY / LOADING
===================================== */

.empty-state,
.loading-state {
  padding: 65px 20px;
  text-align: center;
}

.empty-icon {
  width: 65px;
  height: 65px;
  margin: 0 auto 17px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 19px;
  background: #eff6ff;
  color: #2563eb;
  font-size: 32px;
}

.empty-state h3,
.loading-state h3 {
  margin: 0;
  color: #26344d;
  font-size: 16px;
}

.empty-state p,
.loading-state p {
  margin: 9px 0 18px;
  color: #929bad;
  font-size: 11px;
}

.reset-btn {
  padding: 10px 15px;
  border: none;
  border-radius: 8px;
  background: #2563eb;
  color: white;
  font-size: 11px;
  font-weight: 750;
  cursor: pointer;
}

.loader {
  width: 32px;
  height: 32px;
  margin: 0 auto 17px;
  border: 3px solid #e5edff;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: rotate .8s linear infinite;
}

/* =====================================
   FOOTER
===================================== */

.list-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-top: 23px;
  padding-top: 17px;
  border-top: 1px solid #edf0f5;
  color: #929bad;
  font-size: 10px;
}

.list-footer strong {
  color: #344054;
}

.footer-indicator {
  display: flex;
  align-items: center;
  gap: 7px;
}

.footer-indicator i {
  width: 7px;
  height: 7px;
  background: #16a36a;
  border-radius: 50%;
}

/* =====================================
   ERROR
===================================== */

.error-message {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 13px 15px;
  margin-bottom: 20px;
  border-radius: 9px;
  border: 1px solid #fecdd3;
  background: #fff1f2;
  color: #be123c;
  font-size: 11px;
}

.error-message button {
  margin-left: auto;
  border: none;
  background: none;
  color: #be123c;
  font-weight: 800;
  cursor: pointer;
}

/* =====================================
   RESPONSIVE
===================================== */

@media (max-width: 1250px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .invoices-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .toolbar {
    flex-wrap: wrap;
  }

  .search-box {
    flex-basis: 100%;
  }

  .filter-select {
    flex: 1;
    min-width: 0;
  }
}

@media (max-width: 768px) {
  .page {
    margin-left: 0;
    padding: 20px 14px;
  }

  .page-header h1 {
    font-size: 22px;
  }

  .header-icon {
    width: 46px;
    height: 46px;
    font-size: 22px;
  }

  .content-card {
    padding: 17px;
  }

  .section-heading {
    align-items: flex-start;
  }

  .invoices-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 520px) {
  .page {
    padding: 16px 10px;
  }

  .page-header {
    align-items: flex-start;
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
    padding: 14px;
  }

  .stat-card h2 {
    font-size: 20px;
  }

  .stat-top > span:first-child {
    font-size: 10px;
  }

  .invoices-grid {
    grid-template-columns: 1fr;
  }

  .section-heading {
    flex-direction: column;
  }

  .toolbar {
    gap: 9px;
  }

  .filter-select {
    width: 100%;
    flex-basis: 100%;
  }

  .list-footer {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
