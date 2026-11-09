
<template>
  <div class="login-page">
    <!-- BACKGROUND -->
    <div class="background-decoration">
      <div class="glow glow-one"></div>
      <div class="glow glow-two"></div>
      <div class="grid-pattern"></div>
    </div>

    <main class="login-wrapper">

      <!-- BRAND / PRESENTATION -->
      <section class="brand-panel">
        <div class="brand-content">

          <div class="brand-logo">
            <img src="../assets/logo2.png" alt="Logo de l'application" />
          </div>

          <div class="brand-text">
            <span class="eyebrow">ESPACE PROFESSIONNEL</span>

            <h1>
              Bienvenue dans votre
              <span>espace de gestion.</span>
            </h1>

            <p>
              Connectez-vous pour accéder à votre espace de travail
              et retrouver tous vos outils de gestion.
            </p>
          </div>

          <div class="brand-features">
            <div class="feature-item">
              <span class="feature-icon">◈</span>
              <div>
                <strong>Gestion centralisée</strong>
                <small>Toutes vos données au même endroit.</small>
              </div>
            </div>

            <div class="feature-item">
              <span class="feature-icon">⌁</span>
              <div>
                <strong>Expérience simplifiée</strong>
                <small>Une interface pensée pour votre productivité.</small>
              </div>
            </div>

            <div class="feature-item">
              <span class="feature-icon">✓</span>
              <div>
                <strong>Accès personnalisé</strong>
                <small>Retrouvez votre espace selon votre profil.</small>
              </div>
            </div>
          </div>

          <div class="brand-footer">
            <span class="status-dot"></span>
            Plateforme de gestion professionnelle
          </div>
        </div>
      </section>

      <!-- LOGIN FORM -->
      <section class="form-panel">
        <div class="login-card">

          <div class="mobile-logo">
            <img src="../assets/logo2.png" alt="Logo" />
          </div>

          <div class="form-heading">
            <span class="welcome-label">BON RETOUR</span>

            <h2>Connexion</h2>

            <p>
              Connectez-vous à votre compte pour continuer.
            </p>
          </div>

          <!-- ERROR -->
          <div v-if="formError" class="alert-error">
            <span class="alert-icon">!</span>
            <span>{{ formError }}</span>
          </div>

          <form @submit.prevent="login" novalidate>

            <!-- EMAIL -->
            <div class="form-group">
              <label for="email">Adresse email</label>

              <div class="input-wrapper" :class="{ focused: emailFocused }">
                <span class="input-icon">✉</span>

                <input
                  id="email"
                  v-model.trim="email"
                  type="email"
                  placeholder="exemple@email.com"
                  autocomplete="username"
                  required
                  maxlength="150"
                  @focus="emailFocused = true"
                  @blur="emailFocused = false"
                />
              </div>
            </div>

            <!-- PASSWORD -->
            <div class="form-group">
              <div class="label-row">
                <label for="password">Mot de passe</label>
              </div>

              <div class="input-wrapper" :class="{ focused: passwordFocused }">
                <span class="input-icon">♙</span>

                <input
                  id="password"
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Entrez votre mot de passe"
                  autocomplete="current-password"
                  required
                  @focus="passwordFocused = true"
                  @blur="passwordFocused = false"
                />

                <button
                  type="button"
                  class="eye-btn"
                  @click="showPassword = !showPassword"
                  :aria-label="showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'"
                >
                  {{ showPassword ? "◉" : "◎" }}
                </button>
              </div>
            </div>

            <!-- OPTIONS -->
            <div class="form-options">
              <label class="remember-option">
                <input type="checkbox" v-model="rememberMe" />
                <span>Se souvenir de moi</span>
              </label>
            </div>

            <!-- SUBMIT -->
            <button
              type="submit"
              class="login-btn"
              :disabled="loading"
            >
              <span v-if="loading" class="loader"></span>

              <template v-else>
                Se connecter
                <span class="button-arrow">→</span>
              </template>
            </button>

          </form>

          <div class="security-note">
            <span>♧</span>
            <p>Accès réservé aux utilisateurs autorisés.</p>
          </div>

          <div class="form-bottom">
            <span>© {{ currentYear }} · Tous droits réservés.</span>
          </div>

        </div>
      </section>
    </main>
  </div>
</template>

<script>
import { db } from "../firebase";

import {
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

export default {
  name: "LoginPage",

  data() {
    return {
      email: "",
      password: "",

      showPassword: false,
      rememberMe: false,

      loading: false,

      emailFocused: false,
      passwordFocused: false,

      formError: "",
    };
  },

  computed: {
    currentYear() {
      return new Date().getFullYear();
    }
  },

  methods: {
    async login() {
      // Éviter les connexions multiples
      if (this.loading) return;

      this.formError = "";

      const email = this.email.trim().toLowerCase();
      const password = this.password;

      // VALIDATION
      if (!email || !password) {
        this.formError = "Veuillez renseigner votre adresse email et votre mot de passe.";
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(email)) {
        this.formError = "Veuillez saisir une adresse email valide.";
        return;
      }

      this.loading = true;

      try {
        const q = query(
          collection(db, "Utilisateur"),
          where("email", "==", email),
          where("password", "==", password)
        );

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          this.formError = "Adresse email ou mot de passe incorrect.";
          return;
        }

        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();

        // INFORMATIONS UTILISATEUR
        const user = {
          uid: userDoc.id,
          name: userData.name || "",
          email: userData.email || "",
          image: userData.image || "",
          role: userData.role || "",
          location: userData.location || "",
        };

        // STOCKAGE
        if (this.rememberMe) {
          localStorage.setItem("user", JSON.stringify(user));
        } else {
          sessionStorage.setItem("user", JSON.stringify(user));
        }

        // REDIRECTION
        await this.$router.push("/dashboard");

      } catch (error) {
        console.error("Erreur lors de la connexion :", error);

        this.formError =
          "Une erreur est survenue. Vérifiez votre connexion internet et réessayez.";

      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
/* =========================================
   GLOBAL
========================================= */

* {
  box-sizing: border-box;
}

.login-page {
  min-height: 100vh;
  min-height: 100dvh;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 35px;
  background: #f4f7fc;
  font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  color: #17233d;
}

/* =========================================
   BACKGROUND
========================================= */

.background-decoration {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.grid-pattern {
  position: absolute;
  inset: 0;
  opacity: .25;
  background-image:
    linear-gradient(rgba(37, 99, 235, .05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(37, 99, 235, .05) 1px, transparent 1px);
  background-size: 45px 45px;
}

.glow {
  position: absolute;
  width: 450px;
  height: 450px;
  border-radius: 50%;
  filter: blur(100px);
  opacity: .16;
}

.glow-one {
  background: #2563eb;
  top: -200px;
  left: -150px;
}

.glow-two {
  background: #60a5fa;
  bottom: -220px;
  right: -100px;
}

/* =========================================
   MAIN WRAPPER
========================================= */

.login-wrapper {
  width: 100%;
  max-width: 1120px;
  min-height: 680px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  position: relative;
  z-index: 2;
  background: #fff;
  border-radius: 24px;
  overflow: hidden;
  box-shadow:
    0 30px 80px rgba(22, 42, 85, .10),
    0 5px 20px rgba(22, 42, 85, .04);
  animation: appear .7s ease both;
}

@keyframes appear {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* =========================================
   LEFT BRAND PANEL
========================================= */

.brand-panel {
  position: relative;
  display: flex;
  align-items: center;
  padding: 65px 55px;
  background: linear-gradient(145deg, #102449 0%, #153b78 55%, #2563b9 100%);
  color: white;
  overflow: hidden;
}

.brand-panel::before,
.brand-panel::after {
  content: "";
  position: absolute;
  border: 1px solid rgba(255,255,255,.09);
  border-radius: 50%;
  pointer-events: none;
}

.brand-panel::before {
  width: 480px;
  height: 480px;
  top: -220px;
  right: -250px;
}

.brand-panel::after {
  width: 350px;
  height: 350px;
  bottom: -210px;
  left: -190px;
}

.brand-content {
  position: relative;
  z-index: 2;
  width: 100%;
}

.brand-logo {
  width: 150px;
  height: 95px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 65px;
}

.brand-logo img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.eyebrow,
.welcome-label {
  display: block;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 2px;
}

.eyebrow {
  color: #93c5fd;
  margin-bottom: 20px;
}

.brand-text h1 {
  max-width: 440px;
  margin: 0;
  font-size: clamp(30px, 3.2vw, 43px);
  line-height: 1.2;
  letter-spacing: -1.8px;
  font-weight: 800;
}

.brand-text h1 span {
  display: block;
  color: #93c5fd;
}

.brand-text p {
  max-width: 370px;
  margin-top: 20px;
  color: rgba(255,255,255,.68);
  font-size: 13px;
  line-height: 1.9;
}

.brand-features {
  display: flex;
  flex-direction: column;
  gap: 23px;
  margin-top: 50px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 15px;
}

.feature-icon {
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 12px;
  background: rgba(255,255,255,.10);
  border: 1px solid rgba(255,255,255,.12);
  color: #bfdbfe;
  font-size: 21px;
}

.feature-item div {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.feature-item strong {
  font-size: 12px;
  font-weight: 750;
}

.feature-item small {
  color: rgba(255,255,255,.55);
  font-size: 10px;
}

.brand-footer {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-top: 60px;
  padding-top: 25px;
  border-top: 1px solid rgba(255,255,255,.13);
  color: rgba(255,255,255,.6);
  font-size: 10px;
}

.status-dot {
  width: 7px;
  height: 7px;
  background: #4ade80;
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(74,222,128,.5);
}

/* =========================================
   FORM PANEL
========================================= */

.form-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 55px 65px;
  background: #fff;
}

.login-card {
  width: 100%;
  max-width: 380px;
}

.mobile-logo {
  display: none;
}

.form-heading {
  margin-bottom: 35px;
}

.welcome-label {
  color: #2563eb;
  margin-bottom: 13px;
}

.form-heading h2 {
  margin: 0;
  color: #17233d;
  font-size: 32px;
  font-weight: 850;
  letter-spacing: -1px;
}

.form-heading p {
  margin: 10px 0 0;
  color: #8b96a9;
  font-size: 12px;
  line-height: 1.7;
}

/* =========================================
   ERROR MESSAGE
========================================= */

.alert-error {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 13px;
  margin-bottom: 22px;
  background: #fff1f2;
  border: 1px solid #fecdd3;
  border-radius: 10px;
  color: #be123c;
  font-size: 11px;
  line-height: 1.5;
}

.alert-icon {
  width: 21px;
  height: 21px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #ffe4e6;
  font-weight: 900;
}

/* =========================================
   FORM INPUTS
========================================= */

.form-group {
  margin-bottom: 23px;
}

.form-group label {
  display: block;
  margin-bottom: 10px;
  color: #344054;
  font-size: 11px;
  font-weight: 750;
}

.input-wrapper {
  height: 54px;
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 0 15px;
  border: 1px solid #e5eaf2;
  border-radius: 11px;
  background: #f9fafc;
  transition: .25s ease;
}

.input-wrapper:hover {
  border-color: #cbd5e1;
}

.input-wrapper.focused {
  background: #fff;
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59,130,246,.09);
}

.input-icon {
  color: #94a3b8;
  font-size: 17px;
  flex-shrink: 0;
}

.input-wrapper input {
  width: 100%;
  height: 100%;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  color: #17233d;
  font-family: inherit;
  font-size: 12px;
}

.input-wrapper input::placeholder {
  color: #aab3c2;
}

.eye-btn {
  border: none;
  background: transparent;
  color: #94a3b8;
  font-size: 19px;
  cursor: pointer;
  padding: 5px;
  flex-shrink: 0;
}

.eye-btn:hover {
  color: #2563eb;
}

/* =========================================
   OPTIONS
========================================= */

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 2px 0 28px;
}

.remember-option {
  display: flex;
  align-items: center;
  gap: 9px;
  color: #667085;
  font-size: 11px;
  cursor: pointer;
}

.remember-option input {
  width: 15px;
  height: 15px;
  accent-color: #2563eb;
  cursor: pointer;
}

/* =========================================
   LOGIN BUTTON
========================================= */

.login-btn {
  width: 100%;
  height: 54px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  border: none;
  border-radius: 11px;
  background: linear-gradient(110deg, #1d4ed8, #2563eb);
  color: white;
  font-family: inherit;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 8px 18px rgba(37,99,235,.20);
  transition: .25s ease;
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(37,99,235,.27);
  background: linear-gradient(110deg, #1e40af, #1d4ed8);
}

.login-btn:active:not(:disabled) {
  transform: translateY(0);
}

.login-btn:disabled {
  opacity: .7;
  cursor: wait;
}

.button-arrow {
  font-size: 18px;
  transition: transform .2s;
}

.login-btn:hover .button-arrow {
  transform: translateX(4px);
}

.loader {
  width: 19px;
  height: 19px;
  border: 2px solid rgba(255,255,255,.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin .7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* =========================================
   SECURITY / FOOTER
========================================= */

.security-note {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  margin-top: 30px;
  color: #98a2b3;
}

.security-note span {
  font-size: 17px;
}

.security-note p {
  font-size: 10px;
}

.form-bottom {
  margin-top: 48px;
  padding-top: 20px;
  border-top: 1px solid #edf0f5;
  text-align: center;
  color: #a1aaba;
  font-size: 10px;
}

/* =========================================
   RESPONSIVE
========================================= */

@media (max-width: 1000px) {
  .login-wrapper {
    max-width: 850px;
  }

  .brand-panel {
    padding: 45px 35px;
  }

  .form-panel {
    padding: 45px 35px;
  }

  .brand-text h1 {
    font-size: 32px;
  }

  .brand-logo {
    margin-bottom: 45px;
  }
}

@media (max-width: 700px) {
  .login-page {
    padding: 20px;
    background: #f4f7fc;
  }

  .login-wrapper {
    max-width: 470px;
    min-height: auto;
    grid-template-columns: 1fr;
    border-radius: 20px;
  }

  .brand-panel {
    display: none;
  }

  .form-panel {
    padding: 40px 30px;
  }

  .mobile-logo {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 90px;
    margin-bottom: 30px;
  }

  .mobile-logo img {
    max-width: 180px;
    max-height: 85px;
    object-fit: contain;
  }

  .form-heading {
    margin-bottom: 28px;
  }

  .form-heading h2 {
    font-size: 29px;
  }

  .form-bottom {
    margin-top: 35px;
  }
}

@media (max-width: 420px) {
  .login-page {
    padding: 12px;
  }

  .login-wrapper {
    border-radius: 16px;
  }

  .form-panel {
    padding: 32px 22px;
  }

  .input-wrapper,
  .login-btn {
    height: 51px;
  }

  .form-heading h2 {
    font-size: 27px;
  }
}

/* ACCESSIBILITÉ */
button:focus-visible,
input:focus-visible {
  outline-color: #3b82f6;
  outline-offset: 3px;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: .01ms !important;
    transition-duration: .01ms !important;
  }
}
</style>
