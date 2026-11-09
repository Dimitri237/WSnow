
<template>
  <main class="auth-loading">
    <div class="loading-card">
      <!-- LOGO -->
      <div class="brand-logo">
        <img src="../assets/logo2.png" alt="Logo" />
      </div>

      <!-- INDICATEUR -->
      <div class="loader-container">
        <div class="loader-ring"></div>
        <div class="loader-inner">
          <span class="loader-dot"></span>
        </div>
      </div>

      <!-- TEXTE -->
      <div class="loading-content">
        <h1>Bienvenue</h1>
        <p v-if="!error">
          Vérification de votre session...
        </p>
        <p v-else class="error-message">
          Impossible de vérifier votre session.
        </p>
      </div>

      <!-- PROGRESSION -->
      <div class="progress-track">
        <div class="progress-bar"></div>
      </div>

      <span class="loading-footer">
        {{ error ? "Redirection en cours..." : "Veuillez patienter quelques instants" }}
      </span>
    </div>

    <div class="background-decoration decoration-one"></div>
    <div class="background-decoration decoration-two"></div>
  </main>
</template>

<script>
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

export default {
  name: "AuthRedirect",

  data() {
    return {
      unsubscribeAuth: null,
      error: false,
      redirecting: false
    };
  },

  mounted() {
    this.checkAuthentication();
  },

  beforeUnmount() {
    if (this.unsubscribeAuth) {
      this.unsubscribeAuth();
      this.unsubscribeAuth = null;
    }
  },

  methods: {
    checkAuthentication() {
      this.unsubscribeAuth = onAuthStateChanged(
        auth,

        user => {
          if (this.redirecting) return;

          this.redirecting = true;

          const destination = user ? "/dashboard" : "/login";

          this.$router.replace(destination).catch(error => {
            console.error("Erreur de redirection :", error);
          });
        },

        error => {
          console.error("Erreur Firebase Auth :", error);

          this.error = true;

          if (!this.redirecting) {
            this.redirecting = true;
            this.$router.replace("/login").catch(() => {});
          }
        }
      );
    }
  }
};
</script>

<style scoped>
/* ========================================
   AUTH LOADING PAGE
======================================== */

.auth-loading {
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #f8fafc 0%, #edf3ff 100%);
  font-family: "Inter", "Segoe UI", sans-serif;
  padding: 24px;
}

/* ========================================
   LOADING CARD
======================================== */

.loading-card {
  width: 100%;
  max-width: 420px;
  padding: 48px 38px;
  position: relative;
  z-index: 2;
  text-align: center;
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 24px;
  box-shadow:
    0 20px 60px rgba(15, 35, 75, 0.08),
    0 4px 15px rgba(15, 35, 75, 0.03);
  animation: cardAppear 0.7s ease both;
}

/* ========================================
   LOGO
======================================== */

.brand-logo {
  width: 76px;
  height: 76px;
  margin: 0 auto 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  border: 1px solid #edf0f5;
  border-radius: 20px;
  box-shadow: 0 8px 25px rgba(15, 35, 75, 0.06);
}

.brand-logo img {
  width: 55px;
  height: 55px;
  object-fit: contain;
}

/* ========================================
   LOADER
======================================== */

.loader-container {
  width: 76px;
  height: 76px;
  margin: 0 auto 28px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loader-ring {
  position: absolute;
  inset: 0;
  border: 4px solid #e8eef8;
  border-top-color: #2563eb;
  border-right-color: #2563eb;
  border-radius: 50%;
  animation: rotate 1.1s linear infinite;
}

.loader-inner {
  width: 43px;
  height: 43px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #eff6ff;
  border-radius: 50%;
}

.loader-dot {
  width: 10px;
  height: 10px;
  background: #2563eb;
  border-radius: 50%;
  box-shadow: 0 0 15px rgba(37, 99, 235, 0.4);
  animation: pulse 1.4s ease-in-out infinite;
}

/* ========================================
   TEXT
======================================== */

.loading-content h1 {
  margin: 0 0 10px;
  color: #14213d;
  font-size: 25px;
  font-weight: 750;
  letter-spacing: -0.8px;
}

.loading-content p {
  margin: 0;
  color: #8490a5;
  font-size: 14px;
  font-weight: 500;
}

.loading-content .error-message {
  color: #dc2626;
}

/* ========================================
   PROGRESS BAR
======================================== */

.progress-track {
  height: 5px;
  width: 100%;
  margin: 32px 0 18px;
  overflow: hidden;
  background: #edf1f7;
  border-radius: 20px;
}

.progress-bar {
  width: 35%;
  height: 100%;
  background: linear-gradient(90deg, #2563eb, #60a5fa);
  border-radius: 20px;
  animation: progress 1.8s ease-in-out infinite;
}

/* ========================================
   FOOTER
======================================== */

.loading-footer {
  display: block;
  color: #a0aabd;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.3px;
}

/* ========================================
   BACKGROUND DECORATIONS
======================================== */

.background-decoration {
  position: absolute;
  border-radius: 50%;
  filter: blur(2px);
  pointer-events: none;
}

.decoration-one {
  width: 380px;
  height: 380px;
  top: -180px;
  right: -100px;
  background: rgba(37, 99, 235, 0.07);
}

.decoration-two {
  width: 450px;
  height: 450px;
  bottom: -260px;
  left: -150px;
  background: rgba(96, 165, 250, 0.09);
}

/* ========================================
   ANIMATIONS
======================================== */

@keyframes rotate {
  to {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(0.8);
    opacity: 0.6;
  }

  50% {
    transform: scale(1.2);
    opacity: 1;
  }
}

@keyframes progress {
  0% {
    transform: translateX(-110%);
  }

  100% {
    transform: translateX(320%);
  }
}

@keyframes cardAppear {
  from {
    opacity: 0;
    transform: translateY(15px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ========================================
   RESPONSIVE
======================================== */

@media (max-width: 480px) {
  .loading-card {
    padding: 38px 24px;
    border-radius: 20px;
  }

  .loading-content h1 {
    font-size: 22px;
  }

  .brand-logo {
    width: 68px;
    height: 68px;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}
</style>
