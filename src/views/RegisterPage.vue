
<template>
  <main class="register-page">

    <!-- DECORATION -->
    <div class="background-shape shape-one"></div>
    <div class="background-shape shape-two"></div>

    <section class="register-container">

      <!-- BRAND / INTRODUCTION -->
      <aside class="register-aside">
        <div class="aside-content">

          <div class="brand">
            <img src="../assets/logo2.png" alt="Logo ACTILC" />
          </div>

          <span class="eyebrow">ESPACE PROFESSIONNEL</span>

          <h1>
            Rejoignez notre
            <span>communauté.</span>
          </h1>

          <p>
            Créez votre compte et accédez à votre espace personnel
            pour profiter de tous nos services.
          </p>

          <div class="benefits">
            <div class="benefit">
              <span class="benefit-icon">✓</span>
              <span>Un espace personnel sécurisé</span>
            </div>

            <div class="benefit">
              <span class="benefit-icon">✓</span>
              <span>Gestion simplifiée de votre profil</span>
            </div>

            <div class="benefit">
              <span class="benefit-icon">✓</span>
              <span>Accès à vos informations à tout moment</span>
            </div>
          </div>
        </div>

        <div class="aside-footer">
          <span class="footer-line"></span>
          <span>Votre espace professionnel</span>
        </div>
      </aside>

      <!-- FORMULAIRE -->
      <section class="register-content">

        <div class="register-card">

          <div class="mobile-brand">
            <img src="../assets/logo2.png" alt="Logo ACTILC" />
          </div>

          <div class="form-heading">
            <span class="form-eyebrow">CRÉATION DE COMPTE</span>
            <h2>Créer un compte</h2>
            <p>Complétez les informations pour vous inscrire.</p>
          </div>

          <!-- ALERTES -->
          <div v-if="success" class="alert success-alert">
            <span class="alert-icon">✓</span>
            {{ success }}
          </div>

          <div v-if="error" class="alert error-alert">
            <span class="alert-icon">!</span>
            {{ error }}
          </div>

          <form @submit.prevent="submitForm" novalidate>

            <!-- PHOTO DE PROFIL -->
            <div class="profile-section">

              <div class="profile-preview">
                <img
                  v-if="previewImage"
                  :src="previewImage"
                  alt="Photo de profil"
                />

                <span v-else class="profile-placeholder">
                  <svg viewBox="0 0 24 24" fill="none">
                    <circle
                      cx="12"
                      cy="8"
                      r="4"
                      stroke="currentColor"
                      stroke-width="1.7"
                    />
                    <path
                      d="M4 21C4 16.6 7.6 13 12 13C16.4 13 20 16.6 20 21"
                      stroke="currentColor"
                      stroke-width="1.7"
                      stroke-linecap="round"
                    />
                  </svg>
                </span>

                <span class="camera-badge">+</span>
              </div>

              <div class="profile-info">
                <strong>Photo de profil</strong>
                <p>JPG, PNG ou WEBP · 700 Ko maximum</p>

                <div class="photo-actions">
                  <label class="upload-btn">
                    {{ previewImage ? "Changer la photo" : "Ajouter une photo" }}

                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      @change="handleImage"
                      :disabled="loading"
                    />
                  </label>

                  <button
                    v-if="previewImage"
                    type="button"
                    class="remove-photo"
                    @click="removeImage"
                    :disabled="loading"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>

            <!-- INFORMATIONS PERSONNELLES -->
            <div class="section-title">
              <span class="section-number">01</span>
              <span>Informations personnelles</span>
            </div>

            <div class="form-grid">

              <!-- NOM -->
              <div class="form-group full-width">
                <label for="name">Nom complet <span>*</span></label>

                <div class="input-wrapper">
                  <span class="input-icon">👤</span>

                  <input
                    id="name"
                    v-model.trim="form.name"
                    type="text"
                    placeholder="Ex : Gaston Mboula"
                    autocomplete="name"
                    maxlength="100"
                    required
                  />
                </div>
              </div>

              <!-- ROLE -->
              <div class="form-group">
                <label for="role">Rôle / Fonction <span>*</span></label>

                <div class="input-wrapper">
                  <span class="input-icon">💼</span>

                  <select id="role" v-model="form.role" required>
                    <option disabled value="">Choisir un rôle</option>
                    <option value="Braiseuse">Braiseuse</option>
                    <option value="Barman">Barman</option>
                    <option value="Gerant(e)">Gérant(e)</option>
                    <option value="Administrateur">Administrateur</option>
                    <option value="Coiffeur(euse)">Coiffeur(euse)</option>
                  </select>
                </div>
              </div>

              <!-- DATE -->
              <div class="form-group">
                <label for="birthDate">Date de naissance <span>*</span></label>

                <div class="input-wrapper">
                  <span class="input-icon">📅</span>

                  <input
                    id="birthDate"
                    v-model="form.birthDate"
                    type="date"
                    :max="today"
                    required
                  />
                </div>
              </div>

              <!-- LOCALISATION -->
              <div class="form-group full-width">
                <label for="location">Localisation</label>

                <div class="input-wrapper">
                  <span class="input-icon">📍</span>

                  <input
                    id="location"
                    v-model.trim="form.location"
                    type="text"
                    placeholder="Ex : Yaoundé, Cameroun"
                    autocomplete="address-level2"
                    maxlength="150"
                  />
                </div>
              </div>

            </div>

            <!-- COORDONNÉES -->
            <div class="section-title">
              <span class="section-number">02</span>
              <span>Coordonnées</span>
            </div>

            <div class="form-grid">

              <div class="form-group">
                <label for="email">Adresse email <span>*</span></label>

                <div class="input-wrapper">
                  <span class="input-icon">✉</span>

                  <input
                    id="email"
                    v-model.trim="form.email"
                    type="email"
                    placeholder="exemple@email.com"
                    autocomplete="email"
                    maxlength="254"
                    required
                  />
                </div>
              </div>

              <div class="form-group">
                <label for="phone">Téléphone <span>*</span></label>

                <div class="input-wrapper">
                  <span class="input-icon">☎</span>

                  <input
                    id="phone"
                    v-model.trim="form.phone"
                    type="tel"
                    placeholder="+237 6XX XXX XXX"
                    autocomplete="tel"
                    maxlength="25"
                    required
                  />
                </div>
              </div>

            </div>

            <!-- SÉCURITÉ -->
            <div class="section-title">
              <span class="section-number">03</span>
              <span>Sécurité du compte</span>
            </div>

            <div class="form-group">
              <label for="password">Mot de passe <span>*</span></label>

              <div class="input-wrapper password-wrapper">
                <span class="input-icon">🔒</span>

                <input
                  id="password"
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Minimum 6 caractères"
                  autocomplete="new-password"
                  minlength="6"
                  maxlength="128"
                  required
                />

                <button
                  type="button"
                  class="password-toggle"
                  @click="showPassword = !showPassword"
                  :aria-label="showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'"
                >
                  {{ showPassword ? "Masquer" : "Afficher" }}
                </button>
              </div>

              <div class="password-strength" v-if="form.password">
                <div class="strength-track">
                  <span
                    v-for="n in 4"
                    :key="n"
                    :class="{ active: passwordStrength >= n }"
                  ></span>
                </div>

                <small :class="strengthClass">
                  {{ strengthLabel }}
                </small>
              </div>
            </div>

            <!-- CONDITIONS -->
            <label class="terms">
              <input
                type="checkbox"
                v-model="acceptedTerms"
                :disabled="loading"
              />

              <span>
                Je confirme l'exactitude des informations fournies.
              </span>
            </label>

            <!-- BOUTON -->
            <button
              type="submit"
              class="submit-btn"
              :disabled="loading || !acceptedTerms"
            >
              <span v-if="loading" class="button-loader"></span>

              <span>
                {{ loading ? "Création du compte..." : "Créer mon compte" }}
              </span>

              <span v-if="!loading" class="submit-arrow">→</span>
            </button>

          </form>

          <!-- CONNEXION -->
          <div class="login-link">
            Vous avez déjà un compte ?
            <router-link to="/login">
              Connectez-vous
            </router-link>
          </div>

          <div class="card-footer">
            <span class="footer-lock">🔐</span>
            Vos informations sont traitées de manière sécurisée.
          </div>

        </div>

      </section>

    </section>
  </main>
</template>

<script>
import { auth, db } from "../firebase";

import {
  createUserWithEmailAndPassword
} from "firebase/auth";

import {
  doc,
  setDoc,
  serverTimestamp
} from "firebase/firestore";

export default {
  name: "RegisterPage",

  data() {
    return {
      loading: false,
      showPassword: false,
      previewImage: null,
      acceptedTerms: false,
      error: "",
      success: "",

      form: {
        name: "",
        role: "",
        location: "",
        image: null,
        birthDate: "",
        email: "",
        phone: "",
        password: ""
      }
    };
  },

  computed: {
    today() {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");

      return `${year}-${month}-${day}`;
    },

    passwordStrength() {
      const password = this.form.password;

      if (!password) return 0;

      let score = 0;

      if (password.length >= 6) score++;
      if (password.length >= 10) score++;
      if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
      if (/[0-9]/.test(password) && /[^a-zA-Z0-9]/.test(password)) score++;

      return score;
    },

    strengthLabel() {
      const labels = [
        "",
        "Faible",
        "Moyen",
        "Bon",
        "Excellent"
      ];

      return labels[this.passwordStrength];
    },

    strengthClass() {
      return `strength-${this.passwordStrength}`;
    }
  },

  methods: {
    handleImage(event) {
      const file = event.target.files?.[0];

      if (!file) return;

      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp"
      ];

      if (!allowedTypes.includes(file.type)) {
        this.error = "Format invalide. Utilisez JPG, PNG ou WEBP.";
        event.target.value = "";
        return;
      }

      // Limite réduite pour éviter de dépasser la taille maximale
      // d'un document Firestore.
      const maxSize = 700 * 1024;

      if (file.size > maxSize) {
        this.error = "La photo ne doit pas dépasser 700 Ko.";
        event.target.value = "";
        return;
      }

      this.error = "";

      const reader = new FileReader();

      reader.onload = () => {
        this.previewImage = reader.result;
        this.form.image = reader.result;
      };

      reader.onerror = () => {
        this.error = "Impossible de lire cette image.";
      };

      reader.readAsDataURL(file);
    },

    removeImage() {
      this.previewImage = null;
      this.form.image = null;

      const input = document.querySelector(
        '.profile-info input[type="file"]'
      );

      if (input) input.value = "";
    },

    validateForm() {
      if (
        !this.form.name ||
        !this.form.role ||
        !this.form.birthDate ||
        !this.form.email ||
        !this.form.phone ||
        !this.form.password
      ) {
        this.error = "Veuillez remplir tous les champs obligatoires.";
        return false;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(this.form.email)) {
        this.error = "Veuillez saisir une adresse email valide.";
        return false;
      }

      const phoneDigits = this.form.phone.replace(/\D/g, "");

      if (phoneDigits.length < 8 || phoneDigits.length > 15) {
        this.error = "Veuillez saisir un numéro de téléphone valide.";
        return false;
      }

      if (this.form.birthDate > this.today) {
        this.error = "La date de naissance ne peut pas être dans le futur.";
        return false;
      }

      if (this.form.password.length < 6) {
        this.error = "Le mot de passe doit contenir au moins 6 caractères.";
        return false;
      }

      if (!this.acceptedTerms) {
        this.error = "Veuillez confirmer l'exactitude de vos informations.";
        return false;
      }

      return true;
    },

    getFirebaseError(error) {
      const messages = {
        "auth/email-already-in-use": "Cette adresse email est déjà utilisée.",
        "auth/invalid-email": "L'adresse email est invalide.",
        "auth/weak-password": "Le mot de passe est trop faible.",
        "auth/network-request-failed": "Problème de connexion Internet.",
        "auth/too-many-requests": "Trop de tentatives. Réessayez plus tard.",
        "auth/operation-not-allowed": "L'inscription par email n'est pas activée dans Firebase."
      };

      return messages[error.code] ||
        "Une erreur est survenue lors de la création du compte.";
    },

    async submitForm() {
      if (this.loading) return;

      this.error = "";
      this.success = "";

      if (!this.validateForm()) return;

      this.loading = true;

      let createdUser = null;

      try {
        const email = this.form.email.trim().toLowerCase();

        // 1. Création du compte Firebase Authentication
        const credential = await createUserWithEmailAndPassword(
          auth,
          email,
          this.form.password
        );

        createdUser = credential.user;

        // 2. Enregistrement du profil dans Firestore
        const profile = {
          uid: createdUser.uid,
          name: this.form.name.trim(),
          role: this.form.role,
          location: this.form.location.trim(),
          birthDate: this.form.birthDate,
          email,
          phone: this.form.phone.trim(),
          image: this.form.image || null,
          createdAt: serverTimestamp()
        };

        await setDoc(
          doc(db, "Utilisateur", createdUser.uid),
          profile
        );

        this.success = "Votre compte a été créé avec succès.";

        // Firebase connecte automatiquement l'utilisateur
        // après createUserWithEmailAndPassword.
        await this.$router.replace("/dashboard");

      } catch (error) {
        console.error("Erreur inscription :", error);

        if (createdUser && error.code !== "auth/email-already-in-use") {
          this.error =
            "Le compte a été créé, mais l'enregistrement du profil a échoué. Contactez l'administrateur avant de réessayer.";
        } else {
          this.error = this.getFirebaseError(error);
        }

      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
/* =========================================
   PAGE
========================================= */

.register-page {
  min-height: 100vh;
  padding: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  background: #f3f6fc;
  font-family: "Inter", "Segoe UI", sans-serif;
}

.background-shape {
  position: fixed;
  border-radius: 50%;
  pointer-events: none;
}

.shape-one {
  width: 550px;
  height: 550px;
  top: -300px;
  right: -120px;
  background: rgba(37, 99, 235, 0.07);
}

.shape-two {
  width: 450px;
  height: 450px;
  bottom: -280px;
  left: -160px;
  background: rgba(30, 64, 175, 0.06);
}

/* =========================================
   MAIN CONTAINER
========================================= */

.register-container {
  width: 100%;
  max-width: 1120px;
  min-height: 720px;
  display: grid;
  grid-template-columns: 0.85fr 1.15fr;
  position: relative;
  z-index: 1;
  overflow: hidden;
  background: #ffffff;
  border: 1px solid #e7edf6;
  border-radius: 25px;
  box-shadow: 0 25px 80px rgba(20, 40, 80, 0.09);
}

/* =========================================
   LEFT PANEL
========================================= */

.register-aside {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 55px 42px 35px;
  color: white;
  background:
    radial-gradient(circle at 90% 10%, rgba(96, 165, 250, 0.28), transparent 35%),
    linear-gradient(145deg, #10254d 0%, #173d78 55%, #1e56a5 100%);
  position: relative;
  overflow: hidden;
}

.register-aside::after {
  content: "";
  position: absolute;
  width: 340px;
  height: 340px;
  right: -180px;
  bottom: -100px;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 50%;
  box-shadow:
    0 0 0 35px rgba(255,255,255,0.025),
    0 0 0 70px rgba(255,255,255,0.02);
}

.brand {
  width: 100px;
  height: 100px;
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 20px;
  margin-bottom: 65px;
}

.brand img,
.mobile-brand img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.eyebrow {
  display: inline-block;
  margin-bottom: 18px;
  color: #93c5fd;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 2px;
}

.aside-content h1 {
  max-width: 360px;
  margin: 0 0 20px;
  font-size: clamp(32px, 3.4vw, 43px);
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: -1.5px;
}

.aside-content h1 span {
  display: block;
  color: #93c5fd;
}

.aside-content > p {
  max-width: 350px;
  color: #c5d4e9;
  font-size: 14px;
  line-height: 1.9;
}

.benefits {
  display: flex;
  flex-direction: column;
  gap: 19px;
  margin-top: 45px;
}

.benefit {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #e5edf9;
  font-size: 12px;
  font-weight: 500;
}

.benefit-icon {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(147, 197, 253, 0.2);
  color: #93c5fd;
  font-size: 12px;
  font-weight: 800;
}

.aside-footer {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #9eb4d4;
  font-size: 10px;
}

.footer-line {
  width: 30px;
  height: 2px;
  background: #60a5fa;
  border-radius: 5px;
}

/* =========================================
   RIGHT PANEL
========================================= */

.register-content {
  padding: 45px 55px;
  background: #ffffff;
}

.register-card {
  width: 100%;
  max-width: 560px;
  margin: 0 auto;
}

.mobile-brand {
  display: none;
}

.form-heading {
  margin-bottom: 30px;
}

.form-eyebrow {
  display: block;
  margin-bottom: 9px;
  color: #2563eb;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.5px;
}

.form-heading h2 {
  margin: 0 0 9px;
  color: #14213d;
  font-size: 29px;
  font-weight: 800;
  letter-spacing: -1px;
}

.form-heading p {
  margin: 0;
  color: #8995a8;
  font-size: 13px;
}

/* =========================================
   ALERTS
========================================= */

.alert {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 13px 15px;
  margin-bottom: 20px;
  border-radius: 10px;
  font-size: 12px;
  line-height: 1.6;
}

.alert-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-weight: 800;
}

.error-alert {
  color: #b91c1c;
  background: #fef2f2;
  border: 1px solid #fecaca;
}

.error-alert .alert-icon {
  color: white;
  background: #dc2626;
}

.success-alert {
  color: #166534;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
}

.success-alert .alert-icon {
  color: white;
  background: #16a34a;
}

/* =========================================
   PROFILE PHOTO
========================================= */

.profile-section {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 30px;
  padding: 17px;
  border: 1px solid #edf1f7;
  border-radius: 15px;
  background: #fbfcfe;
}

.profile-preview {
  width: 76px;
  height: 76px;
  position: relative;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible;
  border: 3px solid white;
  border-radius: 50%;
  background: #edf3ff;
  box-shadow: 0 0 0 1px #dce6f5;
}

.profile-preview > img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.profile-placeholder svg {
  width: 34px;
  height: 34px;
  color: #8aa1c5;
}

.camera-badge {
  position: absolute;
  right: -3px;
  bottom: 0;
  width: 23px;
  height: 23px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
  border-radius: 50%;
  background: #2563eb;
  color: white;
  font-size: 16px;
  font-weight: 700;
}

.profile-info strong {
  display: block;
  margin-bottom: 5px;
  color: #263550;
  font-size: 12px;
}

.profile-info p {
  margin: 0 0 9px;
  color: #98a2b3;
  font-size: 10px;
}

.photo-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.upload-btn {
  color: #2563eb;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
}

.upload-btn input {
  display: none;
}

.remove-photo {
  padding: 0;
  border: none;
  background: transparent;
  color: #dc2626;
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
}

/* =========================================
   SECTION TITLES
========================================= */

.section-title {
  display: flex;
  align-items: center;
  gap: 11px;
  margin: 28px 0 17px;
  color: #263550;
  font-size: 12px;
  font-weight: 750;
}

.section-number {
  width: 25px;
  height: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: #eff6ff;
  color: #2563eb;
  font-size: 10px;
  font-weight: 800;
}

/* =========================================
   FORM GRID
========================================= */

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 17px 15px;
}

.full-width {
  grid-column: 1 / -1;
}

.form-group {
  min-width: 0;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #40516b;
  font-size: 11px;
  font-weight: 700;
}

.form-group label > span {
  color: #ef4444;
}

.input-wrapper {
  min-height: 47px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 13px;
  border: 1px solid #e5eaf2;
  border-radius: 10px;
  background: #fbfcfe;
  transition: all 0.2s ease;
}

.input-wrapper:focus-within {
  border-color: #3b82f6;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.09);
}

.input-icon {
  flex-shrink: 0;
  color: #9aa8bb;
  font-size: 14px;
}

.input-wrapper input,
.input-wrapper select {
  width: 100%;
  min-width: 0;
  height: 45px;
  border: none;
  outline: none;
  background: transparent;
  color: #263550;
  font-family: inherit;
  font-size: 12px;
}

.input-wrapper input::placeholder {
  color: #aab4c2;
}

.input-wrapper select {
  cursor: pointer;
}

.password-wrapper {
  position: relative;
}

.password-toggle {
  flex-shrink: 0;
  border: none;
  background: transparent;
  color: #2563eb;
  font-size: 10px;
  font-weight: 700;
  cursor: pointer;
}

/* =========================================
   PASSWORD STRENGTH
========================================= */

.password-strength {
  margin-top: 9px;
}

.strength-track {
  display: flex;
  gap: 5px;
  margin-bottom: 5px;
}

.strength-track span {
  height: 4px;
  flex: 1;
  border-radius: 5px;
  background: #e8edf4;
}

.strength-track span.active {
  background: #2563eb;
}

.password-strength small {
  font-size: 10px;
  font-weight: 700;
}

.strength-1 {
  color: #dc2626;
}

.strength-2 {
  color: #d97706;
}

.strength-3 {
  color: #2563eb;
}

.strength-4 {
  color: #16a34a;
}

/* =========================================
   TERMS
========================================= */

.terms {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  margin: 24px 0;
  color: #718096;
  font-size: 11px;
  line-height: 1.6;
  cursor: pointer;
}

.terms input {
  width: 15px;
  height: 15px;
  margin: 1px 0 0;
  accent-color: #2563eb;
  cursor: pointer;
}

/* =========================================
   SUBMIT BUTTON
========================================= */

.submit-btn {
  width: 100%;
  min-height: 51px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 14px 18px;
  border: none;
  border-radius: 11px;
  background: linear-gradient(110deg, #1d4ed8, #2563eb);
  color: white;
  font-size: 13px;
  font-weight: 750;
  cursor: pointer;
  box-shadow: 0 7px 18px rgba(37, 99, 235, 0.17);
  transition: all 0.25s ease;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 11px 24px rgba(37, 99, 235, 0.24);
}

.submit-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  box-shadow: none;
}

.submit-arrow {
  margin-left: auto;
  font-size: 18px;
}

.button-loader {
  width: 17px;
  height: 17px;
  border: 2px solid rgba(255,255,255,0.35);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

/* =========================================
   LOGIN LINK
========================================= */

.login-link {
  margin-top: 25px;
  text-align: center;
  color: #8793a6;
  font-size: 11px;
}

.login-link a {
  margin-left: 4px;
  color: #2563eb;
  font-weight: 750;
  text-decoration: none;
}

.login-link a:hover {
  text-decoration: underline;
}

/* =========================================
   FOOTER
========================================= */

.card-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  margin-top: 25px;
  padding-top: 18px;
  border-top: 1px solid #edf1f6;
  color: #a0aabd;
  font-size: 10px;
}

/* =========================================
   ANIMATIONS
========================================= */

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* =========================================
   RESPONSIVE
========================================= */

@media (max-width: 900px) {
  .register-page {
    padding: 20px;
  }

  .register-container {
    max-width: 650px;
    grid-template-columns: 1fr;
  }

  .register-aside {
    display: none;
  }

  .register-content {
    padding: 40px;
  }

  .mobile-brand {
    width: 75px;
    height: 75px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px;
    margin-bottom: 28px;
    border: 1px solid #edf1f7;
    border-radius: 16px;
  }
}

@media (max-width: 520px) {
  .register-page {
    padding: 0;
    background: white;
  }

  .register-container {
    min-height: 100vh;
    border: none;
    border-radius: 0;
    box-shadow: none;
  }

  .register-content {
    padding: 28px 20px;
  }

  .form-heading h2 {
    font-size: 25px;
  }

  .form-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .full-width {
    grid-column: auto;
  }

  .profile-section {
    padding: 13px;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
