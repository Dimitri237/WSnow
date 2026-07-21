<!-- pages/RegisterPage.vue -->

<template>
  <div class="register-page">

    <!-- REGISTER -->
    <section class="register-section">

      <div class="container ">

        <!-- FORM -->
        <div class="register-card">

          <div class="card-header">

            <div class="right-side">

              <img src="../assets/logo2.png" alt="ACTILC" />


            </div>

            <p>
              Complétez les informations ci-dessous
            </p>

          </div>

          <form @submit.prevent="submitForm">

            <!-- IMAGE -->
            <div class="profile-upload">

              <div class="preview">

                <img v-if="previewImage" :src="previewImage" alt="preview" />

                <span v-else>
                  📷
                </span>

              </div>

              <label class="upload-btn">

                Ajouter une photo

                <input type="file" accept="image/*" @change="handleImage" hidden />

              </label>

            </div>

            <!-- NAME -->
            <div class="form-group">
              <label>Nom complet</label>

              <input type="text" v-model="form.name" placeholder="Ex: Gaston Mboula" />
            </div>

            <!-- ROLE -->
            <div class="form-group">
              <label>Rôle</label>

              <select v-model="form.role">
                <option disabled value="">
                  Choisir un rôle
                </option>

                <option>
                  Braiseuse
                </option>

                <option>
                  Barman
                </option>

                <option>
                  Gerant(e)
                </option>

                <option>
                  Administrateur
                </option>
                <option>
                  Coiffeur(euse)
                </option>
              </select>
            </div>

            <!-- DATE -->
            <div class="form-group">
              <label>Date de naissance</label>

              <input type="date" v-model="form.birthDate" />
            </div>

            <!-- LOCATION -->
            <div class="form-group">
              <label>Localisation</label>

              <input type="text" v-model="form.location" placeholder="Ex: Yaoundé, Cameroun" />
            </div>

            <!-- EMAIL -->
            <div class="form-group">
              <label>Email</label>

              <input type="email" v-model="form.email" placeholder="Votre adresse email" />
            </div>
            <!-- Telephone -->
            <div class="form-group">
              <label>Telephone</label>

              <input type="number" v-model="form.phone" placeholder="Votre Numero de telephone" />
            </div>

            <!-- PASSWORD -->
            <div class="form-group">
              <label>Mot de passe</label>

              <div class="password-box">

                <input :type="showPassword ? 'text' : 'password'" v-model="form.password"
                  placeholder="Votre mot de passe" />

                <button type="button" class="eye-btn" @click="showPassword = !showPassword">
                  👁
                </button>

              </div>
            </div>
            <button :disabled="loading" class="submit-btn">
              <span v-if="loading" class="loader"></span>
              <span v-else>Créer mon compte</span>
            </button>
            <!-- SUBMIT -->
          </form>

          <!-- LOGIN -->
          <div class="login-link">

            Vous avez déjà un compte ?

            <router-link to="/">
              Connectez-vous
            </router-link>

          </div>

        </div>

        <!-- RIGHT -->


      </div>

    </section>
  </div>
</template>

<script>
import { db } from "../firebase";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
export default {
  name: "RegisterPage",

  data() {
    return {
      showPassword: false,

      previewImage: null,

      form: {
        name: "",
        role: "",
        location: "",
        image: null,
        birthDate: "",
        email: "",
        phone: "",
        password: "",
        loading: false
      },
    };
  },

  methods: {

    handleImage(event) {
      const file = event.target.files[0];

      if (!file) return;

      /**
       * Vérification type image
       */
      if (!file.type.startsWith("image/")) {
        alert("Veuillez sélectionner une image valide.");
        return;
      }

      /**
       * Limite taille (optionnel)
       * Exemple : 5MB max
       */
      const maxSize = 5 * 1024 * 1024;

      if (file.size > maxSize) {
        alert("L'image ne doit pas dépasser 5MB.");
        return;
      }

      /**
       * Conversion Base64
       */
      const reader = new FileReader();

      reader.onload = () => {
        /**
         * Base64 complet
         * ex: data:image/png;base64,XXXXX
         */
        this.previewImage = reader.result;

        /**
         * Stockage dans le formulaire
         */
        this.form.image = reader.result;
      };

      reader.onerror = () => {
        alert("Impossible de lire l'image.");
      };

      reader.readAsDataURL(file);
    },

    async submitForm() {
      if (
        !this.form.name ||
        !this.form.role ||
        !this.form.birthDate ||
        !this.form.email ||
        !this.form.phone ||
        !this.form.password
      ) {
        alert("Veuillez remplir tous les champs obligatoires.");
        return;
      }

      this.loading = true;

      try {
        const q = query(
          collection(db, "Utilisateur"),
          where("email", "==", this.form.email)
        );

        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          alert("Cet email est déjà utilisé.");
          this.loading = false;
          return;
        }

        /**
         * Sauvegarde Firestore avec image Base64
         */
        await addDoc(collection(db, "Utilisateur"), {
          name: this.form.name,
          role: this.form.role,
          location: this.form.location,
          birthDate: this.form.birthDate,
          email: this.form.email,
          phone: this.form.phone,
          password: this.form.password,

          /**
           * IMAGE BASE64
           */
          image: this.form.image,

          createdAt: new Date(),
        });

        alert("Compte créé avec succès.");

        this.form = {
          name: "",
          role: "",
          location: "",
          image: null,
          birthDate: "",
          email: "",
          phone: "",
          password: "",
        };

        this.previewImage = null;

        this.$router.push("/");

      } catch (error) {
        console.error(error);
        alert("Impossible de créer le compte.");
      } finally {
        this.loading = false;
      }
    },
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Poppins:wght@300;400;500;600&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.register-page {
  min-height: 100vh;
  justify-content: space-around;
  display: flex;
  font-family: "Poppins", sans-serif;
  color: #222;
}

.container {
  width: 92%;
  max-width: 1350px;
  margin: auto;
}

/* HERO */

.hero {
  position: relative;
  height: 500px;
  background-image: url("https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1800&auto=format&fit=crop");
  background-size: cover;
  background-position: center;
  overflow: hidden;
}

.hero::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    linear-gradient(90deg,
      rgba(0, 0, 0, 0.6),
      rgba(0, 0, 0, 0.25));
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(135deg,
      rgba(0, 128, 0, 0.15),
      rgba(255, 0, 0, 0.08),
      rgba(255, 215, 0, 0.05));
}

.hero-content {
  position: relative;
  z-index: 2;
  padding-top: 40px;
}

.back-link {
  text-decoration: none;
  color: #222;
  font-size: 1.1rem;
  font-weight: 500;
}

.hero-center {
  text-align: center;
  margin-top: 40px;
}

.logo {
  width: 260px;
  max-width: 90%;
}

.hero-center h1 {
  font-family: "Playfair Display", serif;
  font-size: 4.5rem;
  color: #f6faf8;
  margin-top: -60px;
}

.hero-center p {
  font-size: 1.3rem;
  color: #e2d8d8;
}

/* REGISTER */

.register-section {
  width: 50%;
  position: relative;
  z-index: 5;
  padding-bottom: 80px;
}

/* CARD */

.register-card {
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(12px);
  border-radius: 30px;
  padding: 45px;
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.08);
}

.card-header {
  text-align: center;
  margin-bottom: 35px;
}

.card-header h2 {
  font-family: "Playfair Display", serif;
  font-size: 3.5rem;
  color: #1e3d2d;
  margin-bottom: 10px;
}

.card-header p {
  color: #666;
}

/* IMAGE */

.profile-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 35px;
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

.preview {
  width: 130px;
  height: 130px;
  border-radius: 50%;
  overflow: hidden;
  background: #f0f0f0;
  border: 4px solid #e7e7e7;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: #777;
  margin-bottom: 18px;
}

.preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-btn {
  background:
    linear-gradient(135deg,
      #1d6b2f,
      #46b25f);

  color: white;
  padding: 12px 22px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
}

/* FORM */

.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  margin-bottom: 12px;
  font-weight: 500;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 16px;
  background: #fafafa;
  padding: 16px 18px;
  font-size: 1rem;
  font-family: "Poppins", sans-serif;
  outline: none;
}

.form-group textarea {
  resize: none;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  border-color: #2f8b45;
}

/* PASSWORD */

.password-box {
  position: relative;
}

.password-box input {
  padding-right: 60px;
}

.eye-btn {
  position: absolute;
  right: 18px;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: transparent;
  cursor: pointer;
}

/* TAGS */

.tags-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.tag-btn {
  border: none;
  padding: 12px 18px;
  border-radius: 999px;
  background: #ececec;
  cursor: pointer;
  transition: 0.3s ease;
  font-weight: 500;
}

.tag-btn.active {
  background:
    linear-gradient(135deg,
      #1d6b2f,
      #45b05e);

  color: white;
}

/* SUBMIT */

.submit-btn {
  width: 100%;
  height: 62px;
  border: none;
  border-radius: 16px;
  background:
    linear-gradient(135deg,
      #1d6b2f,
      #45b05e);

  color: white;
  font-size: 1.2rem;
  font-weight: 700;
  cursor: pointer;
  margin-top: 10px;
  transition: 0.3s ease;
}

.submit-btn:hover {
  transform: translateY(-2px);
}

/* LOGIN */

.login-link {
  margin-top: 30px;
  text-align: center;
  color: #666;
}

.login-link a {
  color: #1d6b2f;
  font-weight: 700;
  text-decoration: none;
}

/* RIGHT */

.right-side {
  width: 100%;
  display: flex;
}

.right-side img {
  width: 100px;
  margin: auto;
  align-items: center;
  border-radius: 28px;
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.08);
}

.overlay-card {
  margin-top: 25px;
  background: white;
  border-radius: 26px;
  padding: 35px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
}

.overlay-card h3 {
  font-family: "Playfair Display", serif;
  font-size: 2.4rem;
  margin-bottom: 16px;
  color: #1e3d2d;
}

.overlay-card p {
  color: #555;
  line-height: 1.9;
  margin-bottom: 20px;
}

.overlay-card ul {
  list-style: none;
}

.overlay-card li {
  margin-bottom: 14px;
  color: #444;
}

/* RESPONSIVE */

@media(max-width:1100px) {


  .right-side {
    position: relative;
    top: 0;
  }

}

@media(max-width:768px) {

  .hero {
    height: auto;
    padding-bottom: 90px;
  }

  .hero-center h1 {
    font-size: 3rem;
  }

  .hero-center p {
    font-size: 1.1rem;
  }

  .register-card {
    padding: 30px 22px;
  }

  .card-header h2 {
    font-size: 2.6rem;
  }
   .register-section {
    width: 100%;
    position: relative;
    z-index: 5;
    padding-bottom: 80px;
  }

}
</style>