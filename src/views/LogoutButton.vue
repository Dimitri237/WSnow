
<template>
  <div class="logout-wrapper">

    <!-- BOUTON DE DÉCONNEXION -->
    <button
      class="logout-btn"
      @click="openConfirm"
      :disabled="loading"
      type="button"
    >
      <span class="logout-icon">
        <svg viewBox="0 0 24 24" fill="none">
          <path
            d="M10 17L15 12L10 7"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M15 12H3"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
          />
          <path
            d="M12 3H19C20.1 3 21 3.9 21 5V19C21 20.1 20.1 21 19 21H12"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
          />
        </svg>
      </span>

      <span>Déconnexion</span>
    </button>

    <!-- MODAL -->
    <Transition name="modal">
      <div
        v-if="showConfirm"
        class="modal-overlay"
        @click.self="closeConfirm"
        @keydown.esc="closeConfirm"
      >
        <div
          class="modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-title"
        >

          <!-- FERMETURE -->
          <button
            class="close-btn"
            @click="closeConfirm"
            :disabled="loading"
            aria-label="Fermer"
            type="button"
          >
            &times;
          </button>

          <!-- ICÔNE -->
          <div class="modal-icon">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M10 17L15 12L10 7"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M15 12H3"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
              />
              <path
                d="M12 3H19C20.1 3 21 3.9 21 5V19C21 20.1 20.1 21 19 21H12"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
              />
            </svg>
          </div>

          <!-- TEXTE -->
          <div class="modal-content">
            <span class="modal-label">SÉCURITÉ DU COMPTE</span>

            <h3 id="logout-title">Déconnexion</h3>

            <p>
              Voulez-vous vraiment quitter votre session ?
              Vous devrez vous reconnecter pour accéder à votre espace.
            </p>
          </div>

          <!-- ERREUR -->
          <div v-if="error" class="error-message">
            <span>!</span>
            {{ error }}
          </div>

          <!-- ACTIONS -->
          <div class="actions">
            <button
              class="btn cancel"
              @click="closeConfirm"
              :disabled="loading"
              type="button"
            >
              Annuler
            </button>

            <button
              class="btn danger"
              @click="logout"
              :disabled="loading"
              type="button"
            >
              <span v-if="loading" class="button-loader"></span>
              <span>{{ loading ? "Déconnexion..." : "Confirmer" }}</span>
            </button>
          </div>

          <div class="modal-footer">
            <span class="security-dot"></span>
            Votre session est protégée
          </div>

        </div>
      </div>
    </Transition>

  </div>
</template>

<script>
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

export default {
  name: "LogoutButton",

  data() {
    return {
      showConfirm: false,
      loading: false,
      error: ""
    };
  },

  methods: {
    openConfirm() {
      if (this.loading) return;

      this.error = "";
      this.showConfirm = true;
    },

    closeConfirm() {
      if (this.loading) return;

      this.showConfirm = false;
      this.error = "";
    },

    async logout() {
      if (this.loading) return;

      try {
        this.loading = true;
        this.error = "";

        await signOut(auth);

        // Nettoyage des anciennes données de session
        localStorage.removeItem("user");
        localStorage.removeItem("utilisateur");
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("utilisateur");

        this.showConfirm = false;

        await this.$router.replace("/login");

      } catch (e) {
        console.error("Erreur de déconnexion :", e);

        this.error =
          "La déconnexion a échoué. Veuillez réessayer.";

      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
/* ========================================
   LOGOUT BUTTON
======================================== */

.logout-wrapper {
  display: inline-flex;
  font-family: "Inter", "Segoe UI", sans-serif;
}

.logout-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 11px;
  padding: 11px 17px;
  border: 1px solid #fee2e2;
  border-radius: 11px;
  background: #fff7f7;
  color: #dc2626;
  font-size: 13px;
  font-weight: 650;
  cursor: pointer;
  transition: all 0.25s ease;
}

.logout-btn:hover:not(:disabled) {
  background: #dc2626;
  color: white;
  border-color: #dc2626;
  box-shadow: 0 6px 18px rgba(220, 38, 38, 0.18);
  transform: translateY(-2px);
}

.logout-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.logout-icon {
  width: 19px;
  height: 19px;
  display: flex;
}

.logout-icon svg {
  width: 100%;
  height: 100%;
}

/* ========================================
   MODAL OVERLAY
======================================== */

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(15, 23, 42, 0.58);
  backdrop-filter: blur(7px);
}

/* ========================================
   MODAL
======================================== */

.modal {
  position: relative;
  width: 100%;
  max-width: 420px;
  padding: 38px 34px 25px;
  background: #ffffff;
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 22px;
  text-align: center;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.2);
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 17px;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 9px;
  background: #f5f7fa;
  color: #64748b;
  font-size: 23px;
  cursor: pointer;
  transition: 0.2s;
}

.close-btn:hover:not(:disabled) {
  background: #fee2e2;
  color: #dc2626;
}

.close-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ========================================
   MODAL ICON
======================================== */

.modal-icon {
  width: 65px;
  height: 65px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 22px;
  border-radius: 20px;
  background: #fff1f2;
  color: #dc2626;
}

.modal-icon svg {
  width: 31px;
  height: 31px;
}

/* ========================================
   MODAL CONTENT
======================================== */

.modal-label {
  display: block;
  margin-bottom: 10px;
  color: #dc2626;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.5px;
}

.modal-content h3 {
  margin: 0 0 12px;
  color: #14213d;
  font-size: 24px;
  font-weight: 750;
  letter-spacing: -0.6px;
}

.modal-content p {
  max-width: 310px;
  margin: 0 auto;
  color: #8490a5;
  font-size: 13px;
  line-height: 1.8;
}

/* ========================================
   ERROR MESSAGE
======================================== */

.error-message {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
  padding: 12px;
  border: 1px solid #fecaca;
  border-radius: 10px;
  background: #fef2f2;
  color: #b91c1c;
  font-size: 12px;
  text-align: left;
}

.error-message span {
  width: 19px;
  height: 19px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 50%;
  background: #dc2626;
  color: white;
  font-weight: 800;
}

/* ========================================
   ACTIONS
======================================== */

.actions {
  display: flex;
  gap: 12px;
  margin-top: 30px;
}

.btn {
  flex: 1;
  min-height: 46px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  padding: 12px 15px;
  border-radius: 11px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.cancel {
  border: 1px solid #e2e8f0;
  background: #ffffff;
  color: #64748b;
}

.cancel:hover:not(:disabled) {
  background: #f8fafc;
  border-color: #cbd5e1;
  color: #334155;
}

.danger {
  border: 1px solid #dc2626;
  background: #dc2626;
  color: white;
  box-shadow: 0 5px 13px rgba(220, 38, 38, 0.15);
}

.danger:hover:not(:disabled) {
  background: #b91c1c;
  border-color: #b91c1c;
  transform: translateY(-1px);
}

/* ========================================
   BUTTON LOADER
======================================== */

.button-loader {
  width: 15px;
  height: 15px;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

/* ========================================
   FOOTER
======================================== */

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  margin-top: 24px;
  padding-top: 18px;
  border-top: 1px solid #f1f5f9;
  color: #a0aabd;
  font-size: 10px;
  font-weight: 600;
}

.security-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #16a34a;
}

/* ========================================
   TRANSITIONS
======================================== */

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease;
}

.modal-enter-active .modal,
.modal-leave-active .modal {
  transition: transform 0.25s ease, opacity 0.25s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal,
.modal-leave-to .modal {
  opacity: 0;
  transform: translateY(15px) scale(0.97);
}

/* ========================================
   ANIMATIONS
======================================== */

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ========================================
   RESPONSIVE
======================================== */

@media (max-width: 480px) {
  .modal {
    padding: 35px 22px 22px;
    border-radius: 19px;
  }

  .modal-content h3 {
    font-size: 21px;
  }

  .actions {
    flex-direction: column-reverse;
  }

  .btn {
    width: 100%;
  }
}
</style>
