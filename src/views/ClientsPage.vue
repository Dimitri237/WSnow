
<template>
  <Navbar />
  <Sidebar />

  <main class="page">
    <!-- HEADER -->
    <header class="page-header">
      <div class="header-content">
        <div class="header-icon">👥</div>
        <div>
          <h1>Clients</h1>
          <p>Gestion et suivi de ton portefeuille client</p>
        </div>
      </div>

      <button class="add-btn" @click="openAddModal">
        <span>＋</span>
        Nouveau client
      </button>
    </header>

    <!-- ERROR -->
    <div v-if="error" class="error-message">
      <span>⚠️</span>
      {{ error }}
      <button @click="load">Réessayer</button>
    </div>

    <!-- STATISTICS -->
    <section class="stats-grid">
      <div class="stat-card primary-card">
        <div class="stat-top">
          <span>Total clients</span>
          <span class="stat-icon">👥</span>
        </div>
        <h2>{{ clients.length }}</h2>
        <small>Clients enregistrés</small>
      </div>

      <div class="stat-card">
        <div class="stat-top">
          <span>Téléphones renseignés</span>
          <span class="stat-icon blue">📞</span>
        </div>
        <h2>{{ clientsWithPhone }}</h2>
        <small>Contacts disponibles</small>
      </div>

      <div class="stat-card">
        <div class="stat-top">
          <span>Nouveaux ce mois</span>
          <span class="stat-icon purple">✨</span>
        </div>
        <h2>{{ newClientsThisMonth }}</h2>
        <small>Clients enregistrés ce mois</small>
      </div>

      <div class="stat-card">
        <div class="stat-top">
          <span>Résultats affichés</span>
          <span class="stat-icon orange">🔎</span>
        </div>
        <h2>{{ filteredClients.length }}</h2>
        <small>Selon la recherche actuelle</small>
      </div>
    </section>

    <!-- CLIENTS SECTION -->
    <section class="content-card">
      <div class="section-heading">
        <div>
          <h3>Répertoire des clients</h3>
          <p>Retrouve et gère facilement tes clients.</p>
        </div>

        <span class="count-badge">
          {{ filteredClients.length }} client(s)
        </span>
      </div>

      <!-- SEARCH -->
      <div class="toolbar">
        <div class="search-box">
          <span>⌕</span>
          <input
            v-model="search"
            type="text"
            placeholder="Rechercher par nom ou téléphone..."
          />

          <button
            v-if="search"
            class="clear-search"
            @click="search = ''"
          >
            ×
          </button>
        </div>

        <button
          class="refresh-btn"
          @click="load"
          :disabled="loading"
        >
          <span :class="{ rotating: loading }">↻</span>
          Actualiser
        </button>
      </div>

      <!-- LOADING -->
      <div v-if="loading && !clients.length" class="loading-state">
        <div class="loader"></div>
        <p>Chargement des clients...</p>
      </div>

      <!-- EMPTY -->
      <div
        v-else-if="filteredClients.length === 0"
        class="empty-state"
      >
        <div class="empty-icon">👥</div>

        <h3>
          {{ search ? "Aucun résultat" : "Aucun client enregistré" }}
        </h3>

        <p>
          {{
            search
              ? "Aucun client ne correspond à ta recherche."
              : "Commence par enregistrer ton premier client."
          }}
        </p>

        <button
          v-if="!search"
          class="empty-btn"
          @click="openAddModal"
        >
          Ajouter un client
        </button>

        <button
          v-else
          class="empty-btn"
          @click="search = ''"
        >
          Effacer la recherche
        </button>
      </div>

      <!-- CLIENTS GRID -->
      <div v-else class="clients-grid">
        <article
          v-for="client in filteredClients"
          :key="client.id"
          class="client-card"
        >
          <div class="client-top">
            <div class="client-avatar">
              {{ getInitials(client.name) }}
            </div>

            <div class="client-actions">
              <button
                class="icon-btn edit-btn"
                title="Modifier"
                @click="openEditModal(client)"
              >
                ✏️
              </button>

              <button
                class="icon-btn delete-btn"
                title="Supprimer"
                @click="remove(client.id)"
                :disabled="deletingId === client.id"
              >
                {{ deletingId === client.id ? "…" : "🗑️" }}
              </button>
            </div>
          </div>

          <div class="client-main">
            <h3>{{ client.name || "Client sans nom" }}</h3>
            <span class="client-label">Client enregistré</span>
          </div>

          <div class="client-details">
            <div class="detail-row">
              <span class="detail-icon">📞</span>

              <span>
                {{ client.phone || "Téléphone non renseigné" }}
              </span>
            </div>

            <div class="detail-row">
              <span class="detail-icon">📅</span>

              <span>
                {{ formatCreatedAt(client.createdAt) }}
              </span>
            </div>
          </div>

          <div class="client-footer">
            <div>
              <small>Identifiant client</small>
              <strong>{{ client.id.slice(0, 10) }}</strong>
            </div>

            <span class="client-status">
              <i></i>
              Enregistré
            </span>
          </div>
        </article>
      </div>
    </section>

    <!-- MODAL -->
    <div
      v-if="showModal"
      class="modal-overlay"
      @click.self="closeModal"
    >
      <div class="modal">
        <div class="modal-header">
          <div>
            <div class="modal-icon">
              {{ editingId ? "✏️" : "👤" }}
            </div>

            <h2>
              {{ editingId ? "Modifier le client" : "Nouveau client" }}
            </h2>

            <p>
              {{
                editingId
                  ? "Mets à jour les coordonnées de ce client."
                  : "Renseigne les informations du nouveau client."
              }}
            </p>
          </div>

          <button class="close-btn" @click="closeModal">×</button>
        </div>

        <form @submit.prevent="saveClient">
          <div class="form-group">
            <label>Nom du client <span>*</span></label>

            <input
              v-model.trim="form.name"
              type="text"
              placeholder="Ex : Jean Dupont"
              required
              maxlength="100"
            />
          </div>

          <div class="form-group">
            <label>Téléphone</label>

            <input
              v-model.trim="form.phone"
              type="tel"
              placeholder="Ex : 6XXXXXXXX"
              maxlength="30"
            />
          </div>

          <div class="form-error" v-if="formError">
            {{ formError }}
          </div>

          <div class="modal-footer">
            <button
              type="button"
              class="cancel-btn"
              @click="closeModal"
              :disabled="saving"
            >
              Annuler
            </button>

            <button
              type="submit"
              class="submit-btn"
              :disabled="saving"
            >
              {{
                saving
                  ? "Enregistrement..."
                  : editingId
                    ? "Enregistrer les modifications"
                    : "Ajouter le client"
              }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </main>
</template>

<script>
import Sidebar from "../components/SidebarPage.vue"
import Navbar from "../components/NavbarPage.vue"
import { db } from "../firebase"

import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
  Timestamp
} from "firebase/firestore"

export default {
  components: {
    Sidebar,
    Navbar
  },

  data() {
    return {
      clients: [],

      loading: false,
      saving: false,
      deletingId: null,

      error: "",
      formError: "",

      search: "",
      showModal: false,
      editingId: null,

      form: {
        name: "",
        phone: ""
      }
    }
  },

  computed: {
    filteredClients() {
      const query = this.search.trim().toLowerCase()

      if (!query) return this.clients

      return this.clients.filter(client => {
        return (
          (client.name || "").toLowerCase().includes(query) ||
          (client.phone || "").toLowerCase().includes(query) ||
          client.id.toLowerCase().includes(query)
        )
      })
    },

    clientsWithPhone() {
      return this.clients.filter(client =>
        client.phone?.trim()
      ).length
    },

    newClientsThisMonth() {
      const now = new Date()

      return this.clients.filter(client => {
        const date = this.getDateObject(client.createdAt)

        if (!date) return false

        return (
          date.getFullYear() === now.getFullYear() &&
          date.getMonth() === now.getMonth()
        )
      }).length
    }
  },

  methods: {
    // CHARGEMENT
    async load() {
      this.loading = true
      this.error = ""

      try {
        const snap = await getDocs(collection(db, "clients"))

        this.clients = snap.docs.map(d => ({
          id: d.id,
          ...d.data()
        }))

        this.clients.sort((a, b) =>
          (a.name || "").localeCompare(b.name || "", "fr")
        )

      } catch (error) {
        console.error("Erreur chargement clients :", error)
        this.error = "Impossible de charger les clients."
      } finally {
        this.loading = false
      }
    },

    // OUVRIR AJOUT
    openAddModal() {
      this.editingId = null
      this.formError = ""

      this.form = {
        name: "",
        phone: ""
      }

      this.showModal = true
    },

    // OUVRIR MODIFICATION
    openEditModal(client) {
      this.editingId = client.id
      this.formError = ""

      this.form = {
        name: client.name || "",
        phone: client.phone || ""
      }

      this.showModal = true
    },

    closeModal() {
      if (this.saving) return

      this.showModal = false
      this.editingId = null
      this.formError = ""
    },

    // AJOUT OU MODIFICATION
    async saveClient() {
      this.formError = ""

      const name = this.form.name.trim()

      if (!name) {
        this.formError = "Le nom du client est obligatoire."
        return
      }

      this.saving = true

      try {
        const data = {
          name,
          phone: this.form.phone.trim()
        }

        if (this.editingId) {
          // MODIFICATION
          await updateDoc(
            doc(db, "clients", this.editingId),
            data
          )

        } else {
          // AJOUT
          await addDoc(collection(db, "clients"), {
            ...data,
            createdAt: Timestamp.now()
          })
        }

        this.showModal = false
        this.editingId = null

        await this.load()

      } catch (error) {
        console.error("Erreur enregistrement client :", error)
        this.formError = "Une erreur est survenue pendant l'enregistrement."
      } finally {
        this.saving = false
      }
    },

    // SUPPRESSION
    async remove(id) {
      const client = this.clients.find(c => c.id === id)

      if (!client) return

      const confirmed = confirm(
        `Voulez-vous vraiment supprimer le client "${client.name}" ?`
      )

      if (!confirmed) return

      this.deletingId = id
      this.error = ""

      try {
        await deleteDoc(doc(db, "clients", id))

        this.clients = this.clients.filter(c => c.id !== id)

      } catch (error) {
        console.error("Erreur suppression client :", error)
        this.error = "Impossible de supprimer ce client."
      } finally {
        this.deletingId = null
      }
    },

    // INITIALLES
    getInitials(name) {
      if (!name) return "CL"

      return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(part => part.charAt(0).toUpperCase())
        .join("")
    },

    // GESTION DES DATES
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

    formatCreatedAt(value) {
      const date = this.getDateObject(value)

      if (!date) return "Date non disponible"

      return date.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "long",
        year: "numeric"
      })
    }
  },

  mounted() {
    this.load()
  }
}
</script>

<style scoped>
/* PAGE */
.page {
  margin-left: 250px;
  min-height: 100vh;
  padding: 32px;
  background: #f5f7fb;
  color: #172033;
  font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.page * {
  box-sizing: border-box;
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
  gap: 15px;
}

.header-icon {
  width: 54px;
  height: 54px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1d4ed8, #3b82f6);
  border-radius: 16px;
  font-size: 24px;
  box-shadow: 0 8px 20px rgba(37, 99, 235, .2);
}

.page-header h1 {
  margin: 0;
  font-size: 25px;
  font-weight: 800;
  letter-spacing: -.7px;
}

.page-header p {
  margin: 6px 0 0;
  font-size: 12px;
  color: #8791a5;
}

.add-btn {
  height: 43px;
  padding: 0 17px;
  border: none;
  border-radius: 10px;
  background: #2563eb;
  color: white;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  box-shadow: 0 5px 12px rgba(37, 99, 235, .17);
  transition: .2s;
}

.add-btn:hover {
  background: #1d4ed8;
  transform: translateY(-2px);
}

.add-btn span {
  font-size: 21px;
}

/* STATISTIQUES */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 17px;
  margin-bottom: 25px;
}

.stat-card {
  padding: 21px;
  background: white;
  border: 1px solid #e9edf4;
  border-radius: 15px;
  box-shadow: 0 3px 12px rgba(20, 40, 80, .025);
  transition: .2s;
  min-width: 0;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(20, 40, 80, .07);
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
  font-weight: 650;
}

.stat-icon {
  width: 37px;
  height: 37px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 11px;
  background: #fff7ed;
  font-size: 17px;
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
  margin: 16px 0 6px;
  font-size: 27px;
  font-weight: 800;
}

.stat-card small {
  color: #9aa3b2;
  font-size: 10px;
}

.primary-card {
  background: linear-gradient(135deg, #1e40af, #2563eb);
  border: none;
  color: white;
}

.primary-card .stat-top > span:first-child,
.primary-card small {
  color: rgba(255, 255, 255, .75);
}

.primary-card .stat-icon {
  background: rgba(255, 255, 255, .16);
}

/* CONTENT */
.content-card {
  padding: 23px;
  background: white;
  border: 1px solid #e9edf4;
  border-radius: 16px;
  box-shadow: 0 3px 12px rgba(20, 40, 80, .025);
}

.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 20px;
}

.section-heading h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 800;
}

.section-heading p {
  margin: 5px 0 0;
  color: #929bad;
  font-size: 11px;
}

.count-badge {
  padding: 7px 12px;
  border-radius: 20px;
  background: #eff6ff;
  color: #2563eb;
  font-size: 11px;
  font-weight: 750;
  white-space: nowrap;
}

/* TOOLBAR */
.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 22px;
}

.search-box {
  height: 43px;
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 13px;
  background: #fafbfe;
  border: 1px solid #e2e7ef;
  border-radius: 9px;
}

.search-box:focus-within {
  border-color: #3b82f6;
  background: white;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, .08);
}

.search-box > span {
  color: #98a2b3;
  font-size: 22px;
}

.search-box input {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-size: 12px;
  color: #344054;
}

.clear-search {
  border: none;
  background: transparent;
  color: #98a2b3;
  font-size: 20px;
  cursor: pointer;
}

.refresh-btn {
  height: 43px;
  padding: 0 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  border: 1px solid #e2e7ef;
  border-radius: 9px;
  color: #475467;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
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

/* CARTES CLIENTS */
.clients-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 17px;
}

.client-card {
  border: 1px solid #e8edf5;
  border-radius: 14px;
  padding: 18px;
  background: white;
  transition: .25s;
  min-width: 0;
}

.client-card:hover {
  border-color: #bfdbfe;
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(20, 40, 80, .06);
}

.client-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.client-avatar {
  width: 47px;
  height: 47px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #eff6ff, #dbeafe);
  color: #2563eb;
  border-radius: 13px;
  font-size: 15px;
  font-weight: 800;
}

.client-actions {
  display: flex;
  gap: 7px;
}

.icon-btn {
  width: 33px;
  height: 33px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: .2s;
}

.icon-btn:disabled {
  opacity: .5;
  cursor: wait;
}

.edit-btn {
  background: #eff6ff;
}

.edit-btn:hover {
  background: #dbeafe;
}

.delete-btn {
  background: #fff1f2;
}

.delete-btn:hover {
  background: #ffe4e6;
}

.client-main {
  margin-top: 17px;
}

.client-main h3 {
  margin: 0;
  color: #202b40;
  font-size: 15px;
  font-weight: 800;
  overflow-wrap: anywhere;
}

.client-label {
  display: inline-block;
  margin-top: 6px;
  padding: 4px 8px;
  border-radius: 5px;
  background: #f1f5f9;
  color: #64748b;
  font-size: 9px;
  font-weight: 750;
  text-transform: uppercase;
  letter-spacing: .4px;
}

.client-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 19px 0;
  min-height: 61px;
}

.detail-row {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  color: #64748b;
  font-size: 11px;
  line-height: 1.5;
  overflow-wrap: anywhere;
}

.detail-icon {
  flex-shrink: 0;
}

.client-footer {
  padding-top: 14px;
  border-top: 1px solid #edf0f5;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.client-footer > div {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.client-footer small {
  color: #a0a8b6;
  font-size: 9px;
}

.client-footer strong {
  color: #475467;
  font-size: 10px;
  overflow-wrap: anywhere;
}

.client-status {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #16a36a;
  font-size: 9px;
  font-weight: 750;
  white-space: nowrap;
}

.client-status i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #16a36a;
}

/* MODAL */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(15, 23, 42, .55);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.modal {
  width: 100%;
  max-width: 490px;
  background: white;
  border-radius: 18px;
  padding: 25px;
  box-shadow: 0 25px 70px rgba(0, 0, 0, .2);
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 25px;
}

.modal-icon {
  width: 43px;
  height: 43px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #eff6ff;
  border-radius: 12px;
  font-size: 20px;
  margin-bottom: 13px;
}

.modal-header h2 {
  margin: 0;
  font-size: 19px;
  font-weight: 800;
}

.modal-header p {
  margin: 6px 0 0;
  color: #929bad;
  font-size: 11px;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  background: #f1f5f9;
  color: #64748b;
  font-size: 22px;
  cursor: pointer;
  flex-shrink: 0;
}

.form-group {
  margin-bottom: 17px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #344054;
  font-size: 11px;
  font-weight: 750;
}

.form-group label span {
  color: #ef4444;
}

.form-group input {
  width: 100%;
  padding: 12px 13px;
  border: 1px solid #e2e7ef;
  border-radius: 9px;
  background: #fafbfe;
  color: #344054;
  font-family: inherit;
  font-size: 12px;
  outline: none;
  transition: .2s;
}

.form-group input:focus {
  border-color: #3b82f6;
  background: white;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, .08);
}

.form-error {
  margin-bottom: 14px;
  padding: 11px;
  background: #fff1f2;
  color: #be123c;
  border-radius: 8px;
  font-size: 11px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 24px;
}

.cancel-btn,
.submit-btn {
  height: 41px;
  padding: 0 15px;
  border-radius: 9px;
  font-size: 11px;
  font-weight: 750;
  cursor: pointer;
}

.cancel-btn {
  border: 1px solid #e2e7ef;
  background: white;
  color: #64748b;
}

.submit-btn {
  border: none;
  background: #2563eb;
  color: white;
}

.submit-btn:hover {
  background: #1d4ed8;
}

.submit-btn:disabled,
.cancel-btn:disabled {
  opacity: .6;
  cursor: wait;
}

/* EMPTY / LOADING / ERROR */
.empty-state,
.loading-state {
  padding: 55px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 40px;
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

.empty-btn {
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
  width: 30px;
  height: 30px;
  margin: auto;
  border: 3px solid #e5edff;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: rotate .8s linear infinite;
}

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

/* RESPONSIVE */
@media (max-width: 1200px) {
  .clients-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
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
    font-size: 20px;
  }

  .add-btn {
    width: 42px;
    height: 42px;
    padding: 0;
    justify-content: center;
    font-size: 0;
  }

  .add-btn span {
    font-size: 23px;
  }

  .content-card {
    padding: 16px;
  }

  .toolbar {
    flex-wrap: wrap;
  }

  .search-box {
    flex-basis: 100%;
  }

  .refresh-btn {
    margin-left: auto;
  }
}

@media (max-width: 480px) {
  .page {
    padding: 16px 10px;
  }

  .stats-grid {
    gap: 10px;
  }

  .stat-card {
    padding: 14px;
  }

  .stat-card h2 {
    font-size: 22px;
  }

  .stat-top > span:first-child {
    font-size: 10px;
  }

  .clients-grid {
    grid-template-columns: 1fr;
  }

  .section-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .modal {
    padding: 19px;
  }

  .modal-footer {
    flex-direction: column-reverse;
  }

  .modal-footer button {
    width: 100%;
  }
}
</style>
