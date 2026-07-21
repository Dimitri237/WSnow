<!-- components/Navbar.vue -->

<template>
  <header class="navbar" ref="navbar">
    <div class="container nav-content">
      <div></div>
      <div class="nav-right">
        <div  class="user-box">

          <!-- PHOTO -->
          <img :src="currentUser?.image ||
            'https://via.placeholder.com/100x100?text=ACTILC'
            " alt="user" class="user-avatar" />

          <!-- NOM -->
          <div class="user-info">
            <span class="welcome">
              Bienvenue
            </span>

            <strong>
              {{ currentUser?.name }}
            </strong>
          </div>
          <!-- LOGOUT -->
          <button class="logout-btn" @click="logout">
            <img src="./icons/decon.png" alt="logout" />
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
export default {
  name: "NavbarPage",

  data() {
    return {
      isLoggedIn: false,

      /**
       * Utilisateur connecté
       */
      currentUser: null,
    };
  },

  mounted() {
    this.syncUser();
    window.addEventListener("auth-changed", this.syncUser);
    window.addEventListener("storage", this.syncUser);
    /**
     * Récupération utilisateur
     */
    const user = localStorage.getItem("user");

    if (user) {
      this.currentUser = JSON.parse(user);
      this.isLoggedIn = true;
    }

    document.addEventListener(
      "click",
      this.handleClickOutside
    );
  },

  beforeUnmount() {
    document.removeEventListener(
      "click",
      this.handleClickOutside
    );
    window.removeEventListener("auth-changed", this.syncUser);
    window.removeEventListener("storage", this.syncUser);
  },

  methods: {
    handleImageUpload(event) {

      const file = event.target.files[0];

      if (!file) return;

      const reader = new FileReader();

      reader.onload = (e) => {
        this.editUser.image = e.target.result;
      };

      reader.readAsDataURL(file);
    },
    logout() {
      localStorage.removeItem("user");

      this.currentUser = null;
      this.isLoggedIn = false;
      this.mobileMenu = false;
      this.$router.push("/");
      this.$forceUpdate();
    },
    syncUser() {
      const user = localStorage.getItem("user");

      if (user) {
        this.currentUser = JSON.parse(user);
        this.isLoggedIn = true;
      } else {
        this.currentUser = null;
        this.isLoggedIn = false;
      }
    },
  },
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Poppins:wght@300;400;500;600&display=swap");

.navbar {
  /* background: white; */
  
  height: 90px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  top: 0;
  /* box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05); */
  font-family: "Poppins", sans-serif;
}

.container {
  max-width: 1320px;
  margin: auto;
}

.nav-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.user-box {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #1d6b2f;
}



/* CLOSE */

.close-profile-modal {
  position: absolute;

  top: 20px;
  right: 20px;

  width: 48px;
  height: 48px;

  border: none;
  border-radius: 50%;

  background: #f3f3f3;

  cursor: pointer;

  font-size: 1.1rem;
}

/* HEADER */

.profile-header {
  display: flex;
  align-items: center;
  gap: 25px;

  margin-bottom: 35px;
}

.profile-preview {
  width: 110px;
  height: 110px;

  border-radius: 24px;

  object-fit: cover;
}

/* FORM */

.profile-form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 22px;
}

.input-group {
  display: flex;
  flex-direction: column;
}

.input-group label {
  margin-bottom: 10px;
  font-weight: 600;
}

.input-group input {
  height: 58px;

  border: none;
  border-radius: 16px;

  background: #f5f5f5;

  padding: 0 18px;

  font-size: 1rem;
}

.input-group input:focus {
  outline: none;

  box-shadow:
    0 0 0 4px rgba(47, 168, 79, 0.12);

  background: white;
}

/* FOOTER */

.profile-footer {
  display: flex;
  justify-content: flex-end;
  gap: 16px;

  margin-top: 35px;
}

.cancel-btn {
  height: 56px;
  padding: 0 24px;

  border: none;
  border-radius: 16px;

  background: rgb(211, 42, 42);

  cursor: pointer;

  font-weight: 600;
}

.save-btn {
  height: 56px;
  padding: 0 28px;

  border: none;
  border-radius: 16px;

  background:
    linear-gradient(135deg,
      #2fa84f,
      #1d7b35);

  color: white;

  cursor: pointer;

  font-weight: 600;

  box-shadow:
    0 10px 25px rgba(47, 168, 79, 0.25);
}

/* RESPONSIVE */

@media (max-width: 768px) {
  .profile-modal-overlay {

    padding: 20px 0;
  }

  .profile-form {
    grid-template-columns: 1fr;
  }

  .profile-header {
    flex-direction: column;
    text-align: center;
  }

  .profile-footer {
    flex-direction: column;
  }

  .cancel-btn,
  .save-btn {
    width: 100%;
  }
}

.user-info {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.welcome {
  font-size: 0.75rem;
  color: #777;
}

.user-info strong {
  font-size: 0.95rem;
  color: #1c5d2d;
  max-width: 140px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.logout-btn {
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.logout-btn img {
  width: 48px;
  height: 48px;
  transition: 0.3s ease;
}

.logout-btn img:hover {
  transform: scale(1.08);
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo img {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
}

.logo span {
  font-size: 2rem;
  font-weight: 700;
  color: #1c5d2d;
  font-family: "Playfair Display", serif;
}

.nav-links {
  display: flex;
  gap: 40px;
}

.nav-links a {
  text-decoration: none;
  color: #222;
  font-weight: 500;
  transition: 0.3s ease;
}

.nav-links a:hover {
  color: #23853d;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 18px;
}

.lang {
  font-weight: 500;
}

.primary-btn {
  border: none;
  background: linear-gradient(135deg, #1d6b2f, #41b15d);
  color: white;
  padding: 14px 26px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.3s ease;
}

.primary-btn:hover {
  transform: translateY(-2px);
}

.menu-btn {
  color: #1c5d2d;
  display: none;
  border: none;
  background: transparent;
  font-size: 2rem;
  cursor: pointer;
}

/* RESPONSIVE */

@media (max-width: 992px) {

  .nav-links{
    display: none;
  }

  .menu-btn {
    display: block;
  }
}
</style>