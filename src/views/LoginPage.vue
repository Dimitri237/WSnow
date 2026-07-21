<!-- pages/LoginPage.vue -->

<template>
  <div class="login-page">
    <!-- LOGIN SECTION -->
    <section class="login-section">

      <div class="container">

        <!-- FORM -->
        <div class="login-card">

          <div class="image-side">

            <img src="../assets/logo2.png" alt="Translator" />

          </div>

          <p class="subtitle">
            Connectez-vous à votre compte
          </p>

          <form @submit.prevent="login">

            <!-- EMAIL -->
            <div class="input-group">

              <span class="input-icon">
                ✉
              </span>

              <input type="email" placeholder="Adresse Email" v-model="email" />

            </div>

            <!-- PASSWORD -->
            <div class="input-group">

              <span class="input-icon">
                🔒
              </span>

              <input :type="showPassword ? 'text' : 'password'" placeholder="Mot de Passe" v-model="password" />

              <button type="button" class="eye-btn" @click="showPassword = !showPassword">
                👁
              </button>

            </div>

            <!-- FORGOT -->
            <div class="forgot-password">
              <a href="#">
                Mot de passe oublié ?
              </a>
            </div>

            <button @click="login" :disabled="loading" class="login-btn">
              <span v-if="loading" class="loader"></span>
              <span v-else>Se connecter</span>
            </button>

          </form>

          <!-- DIVIDER -->
          <div class="divider">
            <span>Ou connectez-vous avec</span>
          </div>

          <!-- SOCIAL -->
          <div class="social-login">

            <button class="social-btn">
              <img src="https://cdn-icons-png.flaticon.com/512/281/281764.png" alt="Google" />
            </button>

            <button class="social-btn">
              <img src="https://cdn-icons-png.flaticon.com/512/5968/5968847.png" alt="WeChat" />
            </button>

          </div>

        </div>

        <!-- IMAGE -->


      </div>

    </section>
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
      loading: false
    };
  },

  methods: {
    async login() {

      /**
       * VALIDATION
       */
      if (!this.email || !this.password) {
        alert("Veuillez remplir tous les champs.");
        return;
      }

      this.loading = true;

      try {

        /**
         * IMPORTANT
         * Même collection que RegisterPage
         */
        const q = query(
          collection(db, "Utilisateur"),
          where("email", "==", this.email),
          where("password", "==", this.password)
        );

        const querySnapshot = await getDocs(q);

        /**
         * USER NOT FOUND
         */
        if (querySnapshot.empty) {
          alert("Email ou mot de passe incorrect.");
          this.loading = false;
          return;
        }

        /**
         * USER DATA
         */
        const doc = querySnapshot.docs[0];

        const userData = doc.data();

        const user = {
          uid: doc.id,

          name: userData.name || "",

          email: userData.email || "",

          image: userData.image || "",

          role: userData.role || "",

          location: userData.location || "",
        };

        /**
         * SAVE LOCAL STORAGE
         */
        localStorage.setItem(
          "user",
          JSON.stringify(user)
        );
        console.log(user);
        this.$router.push("/dashboard");

      } catch (error) {

        console.error(
          "Erreur lors de la connexion :",
          error
        );

        alert("Impossible de se connecter.");

      } finally {

        this.loading = false;

      }
    },
  },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Poppins:wght@300;400;500;600&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.login-page {
  min-height: 100vh;
  justify-content: space-around;
  display: flex;
  font-family: "Poppins", sans-serif;
  color: #222;
}

.container {
  width: 92%;
  max-width: 1320px;
  margin: auto;
}

.loader {
  width: 20px;
  height: 20px;
  border: 3px solid #fff;
  border-top: 3px solid transparent;
  border-radius: 50%;
  display: inline-block;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* LOGIN SECTION */

.login-section {
  width: 50%;
  position: relative;
  z-index: 5;
  padding-bottom: 80px;
}

/* CARD */

.login-card {
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(12px);
  border-radius: 28px;
  padding: 50px;
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.08);
}

.login-card h2 {
  font-family: "Playfair Display", serif;
  font-size: 4rem;
  color: #243f31;
  margin-bottom: 12px;
  text-align: center;
}

.subtitle {
  text-align: center;
  color: #666;
  margin-bottom: 35px;
  font-size: 1.1rem;
}

/* INPUT */

.input-group {
  position: relative;
  margin-bottom: 24px;
}

.input-group input {
  width: 100%;
  height: 68px;
  border: 1px solid #ddd;
  border-radius: 14px;
  padding: 0 55px;
  background: rgba(255, 255, 255, 0.85);
  font-size: 1.05rem;
  outline: none;
}

.input-group input:focus {
  border-color: #2f8b45;
}

.input-icon {
  position: absolute;
  left: 18px;
  top: 50%;
  transform: translateY(-50%);
  color: #777;
  font-size: 1.1rem;
}

.eye-btn {
  position: absolute;
  right: 18px;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 1rem;
}

/* FORGOT */

.forgot-password {
  text-align: right;
  margin-bottom: 28px;
}

.forgot-password a {
  text-decoration: none;
  color: #345944;
  font-weight: 500;
}

/* LOGIN BTN */

.login-btn {
  width: 100%;
  height: 64px;
  border: none;
  border-radius: 14px;
  background:
    linear-gradient(135deg,
      #1d6b2f,
      #45b05e);

  color: white;
  font-size: 1.35rem;
  font-weight: 700;
  cursor: pointer;
  transition: 0.3s ease;
}

.login-btn:hover {
  transform: translateY(-2px);
}

/* REGISTER */

.register-text {
  margin-top: 32px;
  text-align: center;
  color: #666;
  font-size: 1.05rem;
}

.register-text a {
  color: #1d6b2f;
  font-weight: 700;
  text-decoration: none;
}

/* DIVIDER */

.divider {
  position: relative;
  text-align: center;
  margin: 35px 0 25px;
}

.divider::before,
.divider::after {
  content: "";
  position: absolute;
  top: 50%;
  width: 32%;
  height: 1px;
  background: #ddd;
}

.divider::before {
  left: 0;
}

.divider::after {
  right: 0;
}

.divider span {
  background: white;
  padding: 0 14px;
  color: #777;
}

/* SOCIAL */

.social-login {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.social-btn {
  width: 75px;
  height: 75px;
  border-radius: 18px;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
  transition: 0.3s ease;
}

.social-btn:hover {
  transform: translateY(-3px);
}

.social-btn img {
  width: 34px;
  height: 34px;
}

/* IMAGE */
.image-side {
  width: 100%;
  display: flex;
}

.image-side img {
  width: 100px;
  margin: auto;
  align-items: center;
  border-radius: 28px;
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.08);
}

/* FOOTER */

.footer {
  padding: 40px 20px 60px;
  text-align: center;
}

.footer-links {
  display: flex;
  justify-content: center;
  gap: 18px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.footer-links a {
  text-decoration: none;
  color: #666;
}

.footer p {
  color: #777;
}

/* RESPONSIVE */

@media (max-width: 1100px) {


  .image-side {
    order: -1;
  }

}

@media (max-width: 768px) {

  .hero {
    height: auto;
    padding-bottom: 100px;
  }

  .login-card {
    padding: 35px 25px;
  }

  .login-card h2 {
    font-size: 3rem;
  }

  .input-group input {
    height: 60px;
  }

  .login-btn {
    height: 58px;
    font-size: 1.1rem;
  }

  .login-section {
    width: 100%;
    position: relative;
    z-index: 5;
    padding-bottom: 80px;
  }

}
</style>