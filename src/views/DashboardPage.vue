
<template>
  <Navbar />
  <Sidebar />

  <main class="page">
    <!-- HEADER -->
    <header class="page-header">
      <div>
        <span class="eyebrow">ESPACE DE GESTION</span>
        <h1>Tableau de bord</h1>
        <p>Suivez les performances et l'évolution de votre activité.</p>
      </div>

      <div class="header-right">
        <div class="date-badge">
          <span>📅</span>
          {{ todayLabel }}
        </div>
        <button class="refresh-btn" @click="loadDashboard" :disabled="loading">
          <span :class="{ rotating: loading }">↻</span>
          Actualiser
        </button>
      </div>
    </header>

    <!-- ERREUR -->
    <div v-if="errorMessage" class="error-banner">
      <span>⚠️</span>
      {{ errorMessage }}
      <button @click="loadDashboard">Réessayer</button>
    </div>

    <!-- CHARGEMENT -->
    <div v-if="loading && !hasLoaded" class="loading-screen">
      <span class="spinner"></span>
      <p>Préparation de votre tableau de bord...</p>
    </div>

    <template v-else>
      <!-- SECTION FINANCIÈRE -->
      <div class="section-label">
        <span>APERÇU FINANCIER</span>
        <div></div>
      </div>

      <section class="stats-grid financial-grid">
        <article class="stat-card revenue-card">
          <div class="stat-top">
            <div class="stat-icon revenue-icon">💰</div>
            <span class="stat-tag">GLOBAL</span>
          </div>
          <span class="stat-label">Chiffre d'affaires total</span>
          <strong class="stat-value">{{ formatMoney(totalSales) }}</strong>
          <span class="stat-description">Toutes les ventes enregistrées</span>
        </article>

        <article class="stat-card">
          <div class="stat-top">
            <div class="stat-icon blue-icon">📅</div>
            <span class="stat-tag">CE MOIS</span>
          </div>
          <span class="stat-label">Chiffre d'affaires mensuel</span>
          <strong class="stat-value">{{ formatMoney(currentMonthSales) }}</strong>
          <span class="stat-description">Depuis le début du mois</span>
        </article>

        <article class="stat-card">
          <div class="stat-top">
            <div class="stat-icon gray-icon">📊</div>
            <span class="stat-tag">MOIS PRÉCÉDENT</span>
          </div>
          <span class="stat-label">Chiffre d'affaires précédent</span>
          <strong class="stat-value">{{ formatMoney(previousMonthSales) }}</strong>
          <span class="stat-description">{{ previousMonthLabel }}</span>
        </article>

        <article class="stat-card growth-card">
          <div class="stat-top">
            <div class="stat-icon" :class="growthRate >= 0 ? 'green-icon' : 'red-icon'">
              {{ growthRate >= 0 ? '↗' : '↘' }}
            </div>
            <span
              class="growth-badge"
              :class="growthRate >= 0 ? 'positive' : 'negative'"
            >
              {{ growthRate >= 0 ? 'En hausse' : 'En baisse' }}
            </span>
          </div>
          <span class="stat-label">Évolution mensuelle</span>
          <strong
            class="stat-value"
            :class="growthRate >= 0 ? 'positive-text' : 'negative-text'"
          >
            {{ growthRate > 0 ? '+' : '' }}{{ growthRate.toFixed(1) }} %
          </strong>
          <span class="stat-description">Par rapport au mois précédent</span>
        </article>
      </section>

      <!-- SECTION ACTIVITÉ -->
      <div class="section-label">
        <span>ACTIVITÉ COMMERCIALE</span>
        <div></div>
      </div>

      <section class="stats-grid activity-grid">
        <article class="stat-card">
          <div class="stat-top">
            <div class="stat-icon green-icon">📦</div>
            <span class="stat-tag">CATALOGUE</span>
          </div>
          <span class="stat-label">Produits enregistrés</span>
          <strong class="stat-value">{{ products.length }}</strong>
          <span class="stat-description">Références disponibles</span>
        </article>

        <article class="stat-card">
          <div class="stat-top">
            <div class="stat-icon orange-icon">📥</div>
            <span class="stat-tag">RÉCEPTION</span>
          </div>
          <span class="stat-label">Quantités réceptionnées</span>
          <strong class="stat-value">{{ formatNumber(totalEntries) }}</strong>
          <span class="stat-description">Casiers entrés en stock</span>
        </article>

        <article class="stat-card">
          <div class="stat-top">
            <div class="stat-icon purple-icon">🧾</div>
            <span class="stat-tag">VENTES</span>
          </div>
          <span class="stat-label">Nombre de ventes</span>
          <strong class="stat-value">{{ sales.length }}</strong>
          <span class="stat-description">Transactions enregistrées</span>
        </article>

        <article class="stat-card">
          <div class="stat-top">
            <div class="stat-icon teal-icon">🏬</div>
            <span class="stat-tag">INVENTAIRE</span>
          </div>
          <span class="stat-label">Stock disponible</span>
          <strong class="stat-value">{{ formatNumber(totalStock) }}</strong>
          <span class="stat-description">Casiers dans tous les dépôts</span>
        </article>
      </section>

      <!-- GRAPHIQUE -->
      <section class="content-card chart-card">
        <div class="section-heading">
          <div>
            <span class="eyebrow">ANALYSE DES PERFORMANCES</span>
            <h2>Évolution du chiffre d'affaires</h2>
            <p>Suivez vos ventes sur les 12 derniers mois.</p>
          </div>

          <div class="chart-legend">
            <span></span>
            Ventes mensuelles
          </div>
        </div>

        <div class="chart-summary">
          <div>
            <span>CA du mois actuel</span>
            <strong>{{ formatMoney(currentMonthSales) }}</strong>
          </div>
          <div>
            <span>Nombre de ventes</span>
            <strong>{{ currentMonthSalesCount }}</strong>
          </div>
        </div>

        <div class="chart-wrapper">
          <canvas ref="salesChart"></canvas>
        </div>
      </section>

      <!-- ALERTES STOCK -->
      <section class="content-card alert-card">
        <div class="section-heading">
          <div>
            <span class="eyebrow">SURVEILLANCE DU STOCK</span>
            <h2>Produits nécessitant une attention</h2>
            <p>Produits dont le stock total est inférieur ou égal à 5 casiers.</p>
          </div>

          <span
            class="alert-counter"
            :class="{ 'no-alert': !lowStockProducts.length }"
          >
            {{ lowStockProducts.length }} alerte(s)
          </span>
        </div>

        <div v-if="lowStockProducts.length" class="low-stock-list">
          <div
            v-for="product in lowStockProducts"
            :key="product.id"
            class="low-stock-item"
          >
            <div class="low-stock-product">
              <div class="product-icon">📦</div>
              <div>
                <strong>{{ product.name }}</strong>
                <span>Référence : {{ product.id.slice(0, 8) }}</span>
              </div>
            </div>

            <div class="stock-status">
              <span class="stock-number">{{ product.stockTotal }}</span>
              <span class="stock-unit">casier(s)</span>
              <span
                class="stock-indicator"
                :class="product.stockTotal === 0 ? 'out' : 'low'"
              >
                {{ product.stockTotal === 0 ? 'Épuisé' : 'Stock faible' }}
              </span>
            </div>
          </div>
        </div>

        <div v-else class="no-alerts">
          <div class="success-icon">✓</div>
          <div>
            <strong>Tout est en ordre !</strong>
            <p>Aucun produit ne présente actuellement un stock faible.</p>
          </div>
        </div>
      </section>

      <!-- DERNIÈRES VENTES -->
      <section class="content-card recent-sales-card">
        <div class="section-heading">
          <div>
            <span class="eyebrow">SUIVI COMMERCIAL</span>
            <h2>Dernières ventes</h2>
            <p>Les cinq transactions les plus récentes.</p>
          </div>

          <span class="recent-count">{{ sales.length }} vente(s)</span>
        </div>

        <div v-if="recentSales.length" class="recent-sales-list">
          <div
            v-for="sale in recentSales"
            :key="sale.id"
            class="recent-sale-item"
          >
            <div class="sale-icon">🧾</div>

            <div class="sale-info">
              <strong>{{ sale.client || sale.customerName || 'Client' }}</strong>
              <span>{{ formatDateTime(sale.date) }}</span>
            </div>

            <div class="sale-amount">
              <strong>{{ formatMoney(sale.total) }}</strong>
              <span>FCFA</span>
            </div>
          </div>
        </div>

        <div v-else class="no-alerts">
          <p>Aucune vente enregistrée pour le moment.</p>
        </div>
      </section>
    </template>
  </main>
</template>

<script>
import Navbar from "../components/NavbarPage.vue";
import Sidebar from "../components/SidebarPage.vue";
import Chart from "chart.js/auto";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

export default {
  components: {
    Navbar,
    Sidebar
  },

  data() {
    return {
      totalSales: 0,
      totalEntries: 0,
      totalStock: 0,

      products: [],
      entries: [],
      sales: [],

      currentMonthSales: 0,
      previousMonthSales: 0,
      currentMonthSalesCount: 0,

      lowStockProducts: [],

      loading: false,
      hasLoaded: false,
      errorMessage: "",

      chartInstance: null,

      LOW_STOCK_THRESHOLD: 5
    };
  },

  computed: {
    todayLabel() {
      return new Date().toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
      });
    },

    previousMonthLabel() {
      const date = new Date();
      date.setDate(1);
      date.setMonth(date.getMonth() - 1);

      return date.toLocaleDateString("fr-FR", {
        month: "long",
        year: "numeric"
      });
    },

    growthRate() {
      if (this.previousMonthSales > 0) {
        return (
          ((this.currentMonthSales - this.previousMonthSales) /
            this.previousMonthSales) * 100
        );
      }

      return this.currentMonthSales > 0 ? 100 : 0;
    },

    recentSales() {
      return [...this.sales]
        .sort((a, b) => this.getDateValue(b.date) - this.getDateValue(a.date))
        .slice(0, 5);
    }
  },

  methods: {
    formatMoney(amount) {
      return new Intl.NumberFormat("fr-FR", {
        maximumFractionDigits: 0
      }).format(Number(amount) || 0);
    },

    formatNumber(value) {
      return new Intl.NumberFormat("fr-FR").format(Number(value) || 0);
    },

    getDateValue(date) {
      if (!date) return 0;

      if (typeof date.toMillis === "function") {
        return date.toMillis();
      }

      if (typeof date.toDate === "function") {
        return date.toDate().getTime();
      }

      if (date instanceof Date) {
        return date.getTime();
      }

      if (typeof date === "number") {
        return date;
      }

      if (typeof date === "object" && date.seconds !== undefined) {
        return date.seconds * 1000;
      }

      const parsed = new Date(date).getTime();

      return Number.isNaN(parsed) ? 0 : parsed;
    },

    formatDateTime(date) {
      const value = this.getDateValue(date);

      if (!value) return "Date inconnue";

      return new Date(value).toLocaleString("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    },

    getProductStock(product) {
      // Structure actuelle : stocks par dépôt.
      if (product.stocks && typeof product.stocks === "object") {
        return Object.values(product.stocks).reduce((total, value) => {
          const quantity = Number(value);

          return total + (
            Number.isFinite(quantity) && quantity > 0 ? quantity : 0
          );
        }, 0);
      }

      // Compatibilité avec les anciens produits.
      const legacyStock = Number(product.stock || 0);

      return Number.isFinite(legacyStock) && legacyStock > 0
        ? legacyStock
        : 0;
    },

    calculateStatistics() {
      const now = new Date();

      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();

      // Total du chiffre d'affaires
      this.totalSales = this.sales.reduce((total, sale) => {
        return total + (Number(sale.total) || 0);
      }, 0);

      // Comparaison mensuelle
      let currentTotal = 0;
      let previousTotal = 0;
      let currentCount = 0;

      const previousMonthDate = new Date(
        currentYear,
        currentMonth - 1,
        1
      );

      const previousMonth = previousMonthDate.getMonth();
      const previousYear = previousMonthDate.getFullYear();

      this.sales.forEach(sale => {
        const timestamp = this.getDateValue(sale.date);

        if (!timestamp) return;

        const date = new Date(timestamp);
        const year = date.getFullYear();
        const month = date.getMonth();
        const amount = Number(sale.total) || 0;

        if (year === currentYear && month === currentMonth) {
          currentTotal += amount;
          currentCount++;
        }

        if (year === previousYear && month === previousMonth) {
          previousTotal += amount;
        }
      });

      this.currentMonthSales = currentTotal;
      this.previousMonthSales = previousTotal;
      this.currentMonthSalesCount = currentCount;

      // Stocks
      this.products = this.products.map(product => ({
        ...product,
        stockTotal: this.getProductStock(product)
      }));

      this.totalStock = this.products.reduce(
        (total, product) => total + product.stockTotal,
        0
      );

      this.lowStockProducts = this.products
        .filter(product => product.stockTotal <= this.LOW_STOCK_THRESHOLD)
        .sort((a, b) => a.stockTotal - b.stockTotal);

      // Quantités réceptionnées
      this.totalEntries = this.entries.reduce((total, entry) => {
        const quantity = (entry.items || []).reduce((sum, item) => {
          return sum + (Number(item.qty) || 0);
        }, 0);

        return total + quantity;
      }, 0);
    },

    getMonthlyChartData() {
      const now = new Date();

      // 12 mois calendaires, y compris les mois sans vente.
      const months = [];

      for (let i = 11; i >= 0; i--) {
        const date = new Date(
          now.getFullYear(),
          now.getMonth() - i,
          1
        );

        const key = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`;

        months.push({
          key,
          label: date.toLocaleDateString("fr-FR", {
            month: "short",
            year: "2-digit"
          }),
          total: 0
        });
      }

      const monthlyMap = new Map(
        months.map(month => [month.key, month])
      );

      this.sales.forEach(sale => {
        const timestamp = this.getDateValue(sale.date);

        if (!timestamp) return;

        const date = new Date(timestamp);

        const key = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`;

        const month = monthlyMap.get(key);

        if (month) {
          month.total += Number(sale.total) || 0;
        }
      });

      return months;
    },

    renderChart() {
      const canvas = this.$refs.salesChart;

      if (!canvas) return;

      // Évite de créer plusieurs graphiques sur le même canvas.
      if (this.chartInstance) {
        this.chartInstance.destroy();
        this.chartInstance = null;
      }

      const monthlyData = this.getMonthlyChartData();

      const context = canvas.getContext("2d");

      const gradient = context.createLinearGradient(0, 0, 0, 320);
      gradient.addColorStop(0, "rgba(37, 99, 235, 0.22)");
      gradient.addColorStop(1, "rgba(37, 99, 235, 0.00)");

      this.chartInstance = new Chart(context, {
        type: "line",

        data: {
          labels: monthlyData.map(item => item.label),

          datasets: [
            {
              label: "Chiffre d'affaires",
              data: monthlyData.map(item => item.total),

              borderColor: "#2563eb",
              backgroundColor: gradient,

              borderWidth: 3,
              fill: true,
              tension: 0.4,

              pointRadius: 4,
              pointHoverRadius: 7,
              pointBackgroundColor: "#ffffff",
              pointBorderColor: "#2563eb",
              pointBorderWidth: 2
            }
          ]
        },

        options: {
          responsive: true,
          maintainAspectRatio: false,

          interaction: {
            intersect: false,
            mode: "index"
          },

          plugins: {
            legend: {
              display: false
            },

            tooltip: {
              backgroundColor: "#17243b",
              padding: 13,
              cornerRadius: 9,

              callbacks: {
                label: context => {
                  return ` ${this.formatMoney(context.parsed.y)} FCFA`;
                }
              }
            }
          },

          scales: {
            x: {
              grid: {
                display: false
              },

              border: {
                display: false
              },

              ticks: {
                color: "#94a0b2",
                font: {
                  size: 11
                }
              }
            },

            y: {
              beginAtZero: true,

              border: {
                display: false
              },

              grid: {
                color: "#eef1f6",
                drawTicks: false
              },

              ticks: {
                color: "#94a0b2",
                padding: 12,
                font: {
                  size: 10
                },

                callback: value => {
                  return this.formatNumber(value);
                }
              }
            }
          }
        }
      });
    },

    async loadDashboard() {
      if (this.loading) return;

      this.loading = true;
      this.errorMessage = "";

      try {
        // Chargement parallèle des trois collections.
        const [salesSnap, productsSnap, entriesSnap] = await Promise.all([
          getDocs(collection(db, "sales")),
          getDocs(collection(db, "products")),
          getDocs(collection(db, "entries"))
        ]);

        this.sales = salesSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        this.products = productsSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        this.entries = entriesSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        this.calculateStatistics();

        this.hasLoaded = true;

        await this.$nextTick();

        this.renderChart();

      } catch (error) {
        console.error("Erreur tableau de bord :", error);

        this.errorMessage =
          "Impossible de charger les données. Vérifiez votre connexion et réessayez.";

      } finally {
        this.loading = false;
      }
    }
  },

  mounted() {
    this.loadDashboard();
  },

  beforeUnmount() {
    if (this.chartInstance) {
      this.chartInstance.destroy();
      this.chartInstance = null;
    }
  }
};
</script>

<style scoped>
.page {
  margin-left: 250px;
  min-height: 100vh;
  padding: 32px;
  background: #f5f7fb;
  color: #172033;
  font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

/* HEADER */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
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
  color: #17243b;
  letter-spacing: -1px;
  margin: 0;
}

.page-header p {
  color: #8b97a9;
  font-size: 13px;
  margin: 8px 0 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.date-badge,
.refresh-btn {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}

.date-badge {
  padding: 0 13px;
  background: white;
  border: 1px solid #e9edf4;
  color: #69768b;
}

.refresh-btn {
  border: none;
  padding: 0 14px;
  color: white;
  background: #2563eb;
  cursor: pointer;
  transition: .2s;
}

.refresh-btn:hover:not(:disabled) {
  background: #1d4ed8;
}

.refresh-btn:disabled {
  opacity: .6;
  cursor: wait;
}

.refresh-btn span {
  font-size: 17px;
}

.rotating {
  animation: rotate .8s linear infinite;
}

@keyframes rotate {
  to { transform: rotate(360deg); }
}

/* SECTION */
.section-label {
  display: flex;
  align-items: center;
  gap: 14px;
  margin: 29px 0 15px;
}

.section-label span {
  color: #929daf;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.2px;
  white-space: nowrap;
}

.section-label div {
  height: 1px;
  flex: 1;
  background: #e5eaf1;
}

/* STATISTIQUES */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 15px;
}

.stat-card {
  min-width: 0;
  padding: 20px;
  border: 1px solid #edf0f5;
  border-radius: 15px;
  background: white;
  box-shadow: 0 4px 16px rgba(25, 42, 70, .035);
  transition: .2s;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(25, 42, 70, .07);
}

.stat-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 18px;
}

.stat-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  font-size: 19px;
  font-weight: 800;
}

.revenue-icon {
  color: #fff;
  background: #2563eb;
}

.blue-icon {
  color: #2563eb;
  background: #eaf1ff;
}

.gray-icon {
  color: #64748b;
  background: #eff2f6;
}

.green-icon {
  color: #0e9f6e;
  background: #e6f7ef;
}

.orange-icon {
  color: #e18a2e;
  background: #fff2e4;
}

.purple-icon {
  color: #8755d8;
  background: #f1ebff;
}

.teal-icon {
  color: #078e9c;
  background: #e5f7f8;
}

.red-icon {
  color: #d94a4a;
  background: #ffeded;
}

.stat-tag {
  padding: 6px 8px;
  border-radius: 6px;
  background: #f5f7fa;
  color: #9aa4b3;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: .4px;
}

.stat-label {
  display: block;
  color: #8793a5;
  font-size: 11px;
  font-weight: 600;
  margin-bottom: 9px;
}

.stat-value {
  display: block;
  color: #17243b;
  font-size: clamp(18px, 1.7vw, 25px);
  font-weight: 800;
  letter-spacing: -.7px;
  overflow-wrap: anywhere;
  line-height: 1.3;
}

.stat-description {
  display: block;
  color: #a0aaba;
  font-size: 10px;
  margin-top: 8px;
}

.growth-badge {
  padding: 6px 9px;
  border-radius: 7px;
  font-size: 9px;
  font-weight: 800;
}

.growth-badge.positive {
  color: #0e9667;
  background: #e7f8ef;
}

.growth-badge.negative {
  color: #d34c4c;
  background: #fff0f0;
}

.positive-text {
  color: #0e9667;
}

.negative-text {
  color: #d34c4c;
}

/* CARTES PRINCIPALES */
.content-card {
  background: white;
  border: 1px solid #edf0f5;
  border-radius: 17px;
  padding: 24px;
  margin-top: 22px;
  box-shadow: 0 4px 18px rgba(25, 42, 70, .035);
}

.section-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
  margin-bottom: 23px;
}

.section-heading .eyebrow {
  margin-bottom: 7px;
}

.section-heading h2 {
  color: #1c2940;
  font-size: 17px;
  font-weight: 800;
  margin: 0;
}

.section-heading p {
  color: #99a3b2;
  font-size: 11px;
  margin: 7px 0 0;
}

/* GRAPHIQUE */
.chart-card {
  margin-top: 30px;
}

.chart-legend {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #8793a5;
  font-size: 11px;
  font-weight: 600;
}

.chart-legend span {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #2563eb;
}

.chart-summary {
  display: flex;
  gap: 35px;
  margin: 25px 0 18px;
  padding: 15px;
  border-radius: 11px;
  background: #f8faff;
}

.chart-summary span {
  display: block;
  color: #929daf;
  font-size: 10px;
  margin-bottom: 5px;
}

.chart-summary strong {
  color: #1d2a43;
  font-size: 15px;
  font-weight: 800;
}

.chart-wrapper {
  height: 300px;
  width: 100%;
  position: relative;
}

/* ALERTES */
.alert-card {
  margin-top: 22px;
}

.alert-counter {
  padding: 8px 11px;
  border-radius: 8px;
  color: #c77a18;
  background: #fff5e5;
  font-size: 10px;
  font-weight: 800;
  white-space: nowrap;
}

.alert-counter.no-alert {
  color: #0e9667;
  background: #e7f8ef;
}

.low-stock-list {
  display: flex;
  flex-direction: column;
}

.low-stock-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
  padding: 13px 0;
  border-bottom: 1px solid #f0f2f6;
}

.low-stock-item:last-child {
  border-bottom: none;
}

.low-stock-product {
  display: flex;
  align-items: center;
  gap: 11px;
  min-width: 0;
}

.product-icon,
.sale-icon {
  width: 39px;
  height: 39px;
  min-width: 39px;
  display: grid;
  place-items: center;
  border-radius: 11px;
  background: #fff3e6;
  font-size: 17px;
}

.low-stock-product strong {
  display: block;
  color: #344158;
  font-size: 12px;
}

.low-stock-product span {
  display: block;
  color: #a0aaba;
  font-size: 10px;
  margin-top: 4px;
}

.stock-status {
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

.stock-number {
  color: #d88725;
  font-size: 17px;
  font-weight: 800;
}

.stock-unit {
  color: #9aa4b4;
  font-size: 10px;
}

.stock-indicator {
  padding: 6px 8px;
  border-radius: 6px;
  font-size: 9px;
  font-weight: 800;
}

.stock-indicator.low {
  color: #c17b20;
  background: #fff5e5;
}

.stock-indicator.out {
  color: #d34c4c;
  background: #fff0f0;
}

.no-alerts {
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 17px;
  background: #f3fbf6;
  border: 1px solid #e2f3e9;
  border-radius: 12px;
}

.success-icon {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  color: #0e9667;
  background: #ddf5e7;
  font-weight: 900;
  font-size: 18px;
}

.no-alerts strong {
  color: #17865f;
  font-size: 12px;
}

.no-alerts p {
  color: #8a9b92;
  font-size: 11px;
  margin: 4px 0 0;
}

/* DERNIÈRES VENTES */
.recent-count {
  color: #748198;
  background: #f3f5f9;
  padding: 8px 10px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 700;
}

.recent-sales-list {
  display: flex;
  flex-direction: column;
}

.recent-sale-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 13px 0;
  border-bottom: 1px solid #f0f2f6;
}

.recent-sale-item:last-child {
  border-bottom: none;
}

.sale-icon {
  background: #eaf1ff;
}

.sale-info {
  flex: 1;
  min-width: 0;
}

.sale-info strong {
  display: block;
  color: #344158;
  font-size: 12px;
}

.sale-info span {
  display: block;
  color: #9aa4b4;
  font-size: 10px;
  margin-top: 5px;
}

.sale-amount {
  text-align: right;
}

.sale-amount strong {
  display: block;
  color: #15966b;
  font-size: 13px;
  font-weight: 800;
}

.sale-amount span {
  display: block;
  color: #9aa4b4;
  font-size: 9px;
  margin-top: 3px;
}

/* CHARGEMENT ET ERREURS */
.loading-screen {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  min-height: 300px;
  color: #8b97a9;
  gap: 15px;
  font-size: 12px;
}

.spinner {
  width: 30px;
  height: 30px;
  border: 3px solid #e1e9f5;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin .8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 13px 15px;
  background: #fff1f1;
  color: #c34848;
  border: 1px solid #ffdddd;
  border-radius: 10px;
  font-size: 12px;
  margin-bottom: 20px;
}

.error-banner button {
  margin-left: auto;
  border: none;
  background: transparent;
  color: #b43d3d;
  font-weight: 800;
  cursor: pointer;
  white-space: nowrap;
}

/* RESPONSIVE */
@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
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

  .header-right {
    width: 100%;
    flex-wrap: wrap;
  }

  .date-badge {
    flex: 1;
  }

  .page-header h1 {
    font-size: 25px;
  }

  .stats-grid {
    gap: 10px;
  }

  .stat-card {
    padding: 15px;
  }

  .stat-value {
    font-size: 20px;
  }

  .content-card {
    padding: 17px;
    border-radius: 14px;
  }

  .section-heading {
    align-items: flex-start;
  }

  .chart-wrapper {
    height: 250px;
  }

  .chart-summary {
    gap: 20px;
    flex-wrap: wrap;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .stat-card {
    padding: 12px;
  }

  .stat-icon {
    width: 35px;
    height: 35px;
    font-size: 16px;
  }

  .stat-value {
    font-size: 17px;
  }

  .stat-label {
    font-size: 10px;
  }

  .stat-description {
    font-size: 9px;
  }

  .stat-tag {
    font-size: 8px;
    padding: 5px 6px;
  }

  .section-heading h2 {
    font-size: 15px;
  }

  .chart-legend {
    font-size: 9px;
  }

  .chart-summary {
    padding: 12px;
  }

  .low-stock-item {
    align-items: flex-start;
    flex-direction: column;
  }

  .stock-status {
    margin-left: 50px;
  }

  .growth-badge {
    font-size: 8px;
  }
}
</style>
