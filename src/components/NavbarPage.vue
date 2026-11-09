
<template>
  <header class="navbar">
    <div class="navbar-inner">

      <!-- LEFT : PAGE BRAND / CONTEXT -->
      <div class="navbar-left">
      </div>

      <!-- RIGHT : USER PROFILE -->
      <div class="navbar-right">

        <div class="user-wrapper" ref="userWrapper">

          <button
            class="user-profile"
            type="button"
            @click="toggleUserMenu"
            :aria-expanded="showUserMenu"
            aria-label="Ouvrir le menu utilisateur"
          >

            <div class="avatar-wrapper">
              <img
                :src="userAvatar"
                alt="Photo de profil"
                class="user-avatar"
                @error="handleAvatarError"
              />

              <span class="online-indicator"></span>
            </div>

            <div class="user-info">
              <span class="welcome-text">Bienvenue,</span>
              <strong>{{ currentUser?.name || 'Utilisateur' }}</strong>
            </div>

            <svg
              class="chevron"
              :class="{ rotated: showUserMenu }"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M6 9L12 15L18 9"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>

          </button>

          <!-- USER DROPDOWN -->
          <transition name="dropdown">

            <div
              v-if="showUserMenu"
              class="user-dropdown"
            >

              <div class="dropdown-header">

                <img
                  :src="userAvatar"
                  alt="Profil"
                  class="dropdown-avatar"
                  @error="handleAvatarError"
                />

                <div class="dropdown-user-info">
                  <strong>
                    {{ currentUser?.name || 'Utilisateur' }}
                  </strong>

                  <span>
                    {{ currentUser?.email || 'Compte w_snow' }}
                  </span>
                </div>

              </div>

              <div class="dropdown-divider"></div>

              <div class="account-status">
                <span class="status-dot"></span>
                Session active
              </div>

              <div class="dropdown-divider"></div>

              <button
                class="dropdown-logout"
                type="button"
                @click="logout"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M10 17L15 12L10 7M15 12H3M12 3H19C20.1 3 21 3.9 21 5V19C21 20.1 20.1 21 19 21H12"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>

                <span>Se déconnecter</span>
              </button>

            </div>

          </transition>

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
      currentUser: null,
      showUserMenu: false,

      defaultAvatar:
        "https://ui-avatars.com/api/?name=ACTILC&background=123D2C&color=ffffff&size=128",
    };
  },

  computed: {
    userAvatar() {
      return (
        this.currentUser?.image ||
        this.defaultAvatar
      );
    },
  },

  mounted() {
    this.syncUser();

    window.addEventListener(
      "auth-changed",
      this.syncUser
    );

    window.addEventListener(
      "storage",
      this.syncUser
    );

    document.addEventListener(
      "click",
      this.handleClickOutside
    );

    document.addEventListener(
      "keydown",
      this.handleEscape
    );
  },

  beforeUnmount() {
    window.removeEventListener(
      "auth-changed",
      this.syncUser
    );

    window.removeEventListener(
      "storage",
      this.syncUser
    );

    document.removeEventListener(
      "click",
      this.handleClickOutside
    );

    document.removeEventListener(
      "keydown",
      this.handleEscape
    );
  },

  methods: {
    syncUser() {
      try {
        const user = localStorage.getItem("user");

        this.currentUser = user
          ? JSON.parse(user)
          : null;

      } catch (error) {
        console.error(
          "Erreur de récupération utilisateur :",
          error
        );

        this.currentUser = null;
      }
    },

    toggleUserMenu() {
      this.showUserMenu = !this.showUserMenu;
    },

    handleClickOutside(event) {
      if (
        this.$refs.userWrapper &&
        !this.$refs.userWrapper.contains(event.target)
      ) {
        this.showUserMenu = false;
      }
    },

    handleEscape(event) {
      if (event.key === "Escape") {
        this.showUserMenu = false;
      }
    },

    handleAvatarError(event) {
      event.target.onerror = null;
      event.target.src = this.defaultAvatar;
    },

    async logout() {
      this.showUserMenu = false;

      localStorage.removeItem("user");

      this.currentUser = null;

      window.dispatchEvent(
        new Event("auth-changed")
      );

      try {
        await this.$router.replace("/");
      } catch (error) {
        console.error(
          "Erreur de redirection :",
          error
        );
      }
    },
  },
};
</script>

<style scoped>
/* =========================================
   NAVBAR - PREMIUM ADMIN DASHBOARD
========================================= */

.navbar {
  --sidebar-width: 260px;
  top: 0;
  left: var(--sidebar-width);
  right: 0;
  height: 76px;

  z-index: 1000;

  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);

  transition:
    left 0.3s ease,
    box-shadow 0.3s ease;
}

.navbar-inner {
  width: 95%;
  height: 100%;

  padding: 0 32px;

  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* LEFT */

.navbar-left {
  display: flex;
  align-items: center;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 11px;
}

.breadcrumb-label {
  color: #174d36;

  font-size: 13px;
  font-weight: 800;

  letter-spacing: 1.2px;
}

.breadcrumb-separator {
  color: #c4cdc6;
  font-size: 17px;
}

.breadcrumb-current {
  color: #7b8980;

  font-size: 13px;
  font-weight: 500;
}

/* RIGHT */

.navbar-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

/* USER */

.user-wrapper {
  position: relative;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 12px;

  padding: 7px 12px;

  border: 1px solid transparent;
  border-radius: 12px;

  background: transparent;

  cursor: pointer;

  transition: all 0.25s ease;
}

.user-profile:hover,
.user-profile[aria-expanded="true"] {
  background: #f5f8f5;
  border-color: #e8eee8;
}

.avatar-wrapper {
  position: relative;
  width: 42px;
  height: 42px;
  flex-shrink: 0;
}

.user-avatar {
  width: 100%;
  height: 100%;

  object-fit: cover;

  border-radius: 50%;

  border: 2px solid #e5eee7;

  display: block;
}

.online-indicator {
  position: absolute;

  width: 10px;
  height: 10px;

  right: 0;
  bottom: 1px;

  border-radius: 50%;

  background: #22a06b;

  border: 2px solid white;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 3px;
}

.welcome-text {
  color: #89958d;

  font-size: 11px;
  font-weight: 500;
}

.user-info strong {
  color: #243b2d;

  font-size: 13px;
  font-weight: 700;

  max-width: 180px;

  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.chevron {
  color: #849187;

  transition: transform 0.25s ease;
}

.chevron.rotated {
  transform: rotate(180deg);
}

/* DROPDOWN */

.user-dropdown {
  position: absolute;

  top: calc(100% + 13px);
  right: 0;

  width: 285px;

  padding: 14px;

  background: #ffffff;

  border: 1px solid #e8eee9;
  border-radius: 15px;

  box-shadow:
    0 15px 45px rgba(20, 55, 35, 0.13),
    0 3px 10px rgba(20, 55, 35, 0.04);

  z-index: 1100;
}

.dropdown-header {
  display: flex;
  align-items: center;
  gap: 12px;

  padding: 8px 4px 14px;
}

.dropdown-avatar {
  width: 43px;
  height: 43px;

  object-fit: cover;

  border-radius: 50%;
  border: 2px solid #e8eee9;
}

.dropdown-user-info {
  display: flex;
  flex-direction: column;
  gap: 5px;

  min-width: 0;
}

.dropdown-user-info strong {
  color: #243b2d;

  font-size: 13px;
  font-weight: 700;
}

.dropdown-user-info span {
  color: #89958d;

  font-size: 11px;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-divider {
  height: 1px;
  background: #edf1ed;
  margin: 5px 0;
}

/* STATUS */

.account-status {
  display: flex;
  align-items: center;
  gap: 9px;

  padding: 11px 5px;

  color: #647369;

  font-size: 12px;
}

.status-dot {
  width: 8px;
  height: 8px;

  border-radius: 50%;

  background: #24a36d;
}

/* LOGOUT */

.dropdown-logout {
  width: 100%;

  display: flex;
  align-items: center;
  gap: 11px;

  padding: 12px 10px;

  border: none;
  border-radius: 9px;

  background: transparent;

  color: #d04444;

  font-size: 13px;
  font-weight: 600;

  cursor: pointer;

  transition: all 0.2s ease;
}

.dropdown-logout:hover {
  background: #fff1f1;
  color: #b52d2d;
}

/* ANIMATION */

.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* =========================================
   RESPONSIVE
========================================= */

@media (max-width: 1024px) {
  .navbar {
    --sidebar-width: 230px;
  }

  .navbar-inner {
    padding: 0 22px;
  }
}

@media (max-width: 768px) {
  .navbar {
    --sidebar-width: 0px;

    height: 68px;
  }

  .navbar-inner {
    padding: 0 15px;
  }

  .breadcrumb-current,
  .breadcrumb-separator {
    display: none;
  }

  .user-profile {
    gap: 9px;
    padding: 5px;
  }

  .avatar-wrapper {
    width: 38px;
    height: 38px;
  }

  .user-info strong {
    max-width: 115px;
    font-size: 12px;
  }

  .welcome-text {
    font-size: 10px;
  }

  .user-dropdown {
    width: min(285px, calc(100vw - 30px));
  }
}

@media (max-width: 380px) {
  .navbar-inner {
    padding: 0 10px;
  }

  .user-info {
    display: none;
  }

  .breadcrumb-label {
    font-size: 11px;
  }
}
</style>
