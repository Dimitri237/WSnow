
<template>
  <div class="sidebar-component">

    <!-- BOUTON MOBILE -->
    <button
      class="mobile-toggle"
      :class="{ active: open }"
      @click="toggleSidebar"
      type="button"
      :aria-label="open ? 'Fermer le menu' : 'Ouvrir le menu'"
    >
      <span></span>
      <span></span>
      <span></span>
    </button>

    <!-- OVERLAY -->
    <Transition name="overlay">
      <div
        v-if="open"
        class="sidebar-overlay"
        @click="closeSidebar"
      ></div>
    </Transition>

    <!-- SIDEBAR -->
    <aside class="sidebar" :class="{ 'sidebar-open': open }">

      <!-- BRAND -->
      <div class="sidebar-brand">
        <router-link
          to="/dashboard"
          class="brand-link"
          @click="closeSidebar"
        >
          <div class="brand-icon">
            <span>G</span>
          </div>

          <div class="brand-text">
            <strong>GESTION PRO</strong>
            <small>Administration</small>
          </div>
        </router-link>

        <button
          class="mobile-close"
          @click="closeSidebar"
          type="button"
          aria-label="Fermer le menu"
        >
          ×
        </button>
      </div>

      <!-- NAVIGATION -->
      <div class="sidebar-content">

        <!-- PRINCIPAL -->
        <div class="nav-section">
          <span class="section-label">PRINCIPAL</span>

          <router-link
            to="/dashboard"
            class="nav-link"
            :class="{ active: isActive('/dashboard') }"
            @click="closeSidebar"
          >
            <span class="nav-icon">
              <svg viewBox="0 0 24 24">
                <rect x="3" y="3" width="8" height="8" rx="2"/>
                <rect x="13" y="3" width="8" height="5" rx="2"/>
                <rect x="13" y="10" width="8" height="11" rx="2"/>
                <rect x="3" y="13" width="8" height="8" rx="2"/>
              </svg>
            </span>
            <span>Dashboard</span>
            <span v-if="isActive('/dashboard')" class="active-indicator"></span>
          </router-link>
        </div>

        <!-- GESTION COMMERCIALE -->
        <div class="nav-section">
          <span class="section-label">GESTION COMMERCIALE</span>

          <router-link
            to="/products"
            class="nav-link"
            :class="{ active: isActive('/products') }"
            @click="closeSidebar"
          >
            <span class="nav-icon">
              <svg viewBox="0 0 24 24">
                <path d="M3 3h2l2.2 11.2a2 2 0 0 0 2 1.6h8.9a2 2 0 0 0 1.9-1.4L22 8H6"/>
                <circle cx="10" cy="20" r="1.5"/>
                <circle cx="18" cy="20" r="1.5"/>
              </svg>
            </span>
            <span>Produits</span>
            <span v-if="isActive('/products')" class="active-indicator"></span>
          </router-link>

          <router-link
            to="/entries"
            class="nav-link"
            :class="{ active: isActive('/entries') }"
            @click="closeSidebar"
          >
            <span class="nav-icon">
              <svg viewBox="0 0 24 24">
                <path d="M12 16V4"/>
                <path d="m7 9 5-5 5 5"/>
                <path d="M4 16v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4"/>
              </svg>
            </span>
            <span>Entrées de stock</span>
            <span v-if="isActive('/entries')" class="active-indicator"></span>
          </router-link>

          <router-link
            to="/sales"
            class="nav-link"
            :class="{ active: isActive('/sales') }"
            @click="closeSidebar"
          >
            <span class="nav-icon">
              <svg viewBox="0 0 24 24">
                <path d="M3 3v18h18"/>
                <path d="m7 14 4-4 4 3 6-7"/>
              </svg>
            </span>
            <span>Ventes</span>
            <span v-if="isActive('/sales')" class="active-indicator"></span>
          </router-link>

          <router-link
            to="/clients"
            class="nav-link"
            :class="{ active: isActive('/clients') }"
            @click="closeSidebar"
          >
            <span class="nav-icon">
              <svg viewBox="0 0 24 24">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </span>
            <span>Clients</span>
            <span v-if="isActive('/clients')" class="active-indicator"></span>
          </router-link>

          <router-link
            to="/suppliers"
            class="nav-link"
            :class="{ active: isActive('/suppliers') }"
            @click="closeSidebar"
          >
            <span class="nav-icon">
              <svg viewBox="0 0 24 24">
                <path d="M3 7h11v11H3z"/>
                <path d="M14 11h4l3 3v4h-7z"/>
                <circle cx="7.5" cy="19" r="1.5"/>
                <circle cx="17.5" cy="19" r="1.5"/>
              </svg>
            </span>
            <span>Fournisseurs</span>
            <span v-if="isActive('/suppliers')" class="active-indicator"></span>
          </router-link>
        </div>

        <!-- FINANCES -->
        <div class="nav-section">
          <span class="section-label">FINANCES</span>

          <router-link
            to="/compt"
            class="nav-link"
            :class="{ active: isActive('/compt') }"
            @click="closeSidebar"
          >
            <span class="nav-icon">
              <svg viewBox="0 0 24 24">
                <rect x="3" y="5" width="18" height="14" rx="2"/>
                <path d="M3 10h18"/>
                <path d="M7 15h4"/>
              </svg>
            </span>
            <span>Comptabilité</span>
            <span v-if="isActive('/compt')" class="active-indicator"></span>
          </router-link>
        </div>

        <!-- BAR -->
        <div class="nav-section">
          <span class="section-label">GESTION DU BAR</span>

          <router-link
            to="/barStock"
            class="nav-link"
            :class="{ active: isActive('/barStock') }"
            @click="closeSidebar"
          >
            <span class="nav-icon">
              <svg viewBox="0 0 24 24">
                <path d="M8 3h8v3l-1 15H9L8 6z"/>
                <path d="M8 8h8"/>
                <path d="M10 12h4"/>
              </svg>
            </span>
            <span>Stock Bar</span>
            <span v-if="isActive('/barStock')" class="active-indicator"></span>
          </router-link>

          <router-link
            to="/barSale"
            class="nav-link"
            :class="{ active: isActive('/barSale') }"
            @click="closeSidebar"
          >
            <span class="nav-icon">
              <svg viewBox="0 0 24 24">
                <path d="M4 3h16l-2 8H6L4 3z"/>
                <path d="M7 11v10h10V11"/>
                <path d="M10 15h4"/>
              </svg>
            </span>
            <span>Ventes Bar</span>
            <span v-if="isActive('/barSale')" class="active-indicator"></span>
          </router-link>
        </div>

      </div>

      <!-- FOOTER -->
      <div class="sidebar-footer">
        <div class="footer-status">
          <span class="status-dot"></span>
          <span>Système opérationnel</span>
        </div>

        <div class="footer-version">
          <span>GESTION PRO</span>
          <span>Version 1.0</span>
        </div>
      </div>

    </aside>
  </div>
</template>

<script>
export default {
  name: "SidebarPage",

  data() {
    return {
      open: false
    };
  },

  watch: {
    $route() {
      this.closeSidebar();
    },

    open(value) {
      document.body.style.overflow = value ? "hidden" : "";
    }
  },

  beforeUnmount() {
    document.body.style.overflow = "";
  },

  methods: {
    toggleSidebar() {
      this.open = !this.open;
    },

    closeSidebar() {
      this.open = false;
    },

    isActive(path) {
      return this.$route.path === path ||
        this.$route.path.startsWith(path + "/");
    }
  }
};
</script>

<style scoped>
/* =========================================
   SIDEBAR GLOBAL
========================================= */

.sidebar-component {
  font-family: "Inter", "Segoe UI", sans-serif;
}

/* =========================================
   SIDEBAR
========================================= */

.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  width: 230px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #10254a 0%, #132d55 100%);
  color: #ffffff;
  box-shadow: 8px 0 35px rgba(15, 35, 75, 0.08);
  transition: transform 0.3s ease;
}

/* =========================================
   BRAND
========================================= */

.sidebar-brand {
  min-height: 92px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.brand-link {
  display: flex;
  align-items: center;
  gap: 12px;
  color: white;
  text-decoration: none;
}

.brand-icon {
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 13px;
  background: linear-gradient(135deg, #3b82f6, #60a5fa);
  box-shadow: 0 5px 15px rgba(37, 99, 235, 0.3);
}

.brand-icon span {
  font-size: 21px;
  font-weight: 900;
}

.brand-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.brand-text strong {
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 1px;
}

.brand-text small {
  color: #9db1d0;
  font-size: 10px;
}

/* =========================================
   NAVIGATION CONTENT
========================================= */

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 25px 15px;
}

.sidebar-content::-webkit-scrollbar {
  width: 4px;
}

.sidebar-content::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.16);
  border-radius: 10px;
}

.nav-section {
  margin-bottom: 29px;
}

.section-label {
  display: block;
  margin: 0 0 12px 12px;
  color: #8298b8;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 1.5px;
}

/* =========================================
   NAV LINKS
========================================= */

.nav-link {
  min-height: 46px;
  position: relative;
  display: flex;
  align-items: center;
  gap: 13px;
  margin: 4px 0;
  padding: 0 13px;
  border-radius: 10px;
  color: #c1cee0;
  text-decoration: none;
  font-size: 12px;
  font-weight: 550;
  transition: all 0.22s ease;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.07);
  color: #ffffff;
  transform: translateX(3px);
}

.nav-link.active {
  background: linear-gradient(
    100deg,
    rgba(59, 130, 246, 0.28),
    rgba(59, 130, 246, 0.10)
  );
  color: #ffffff;
  font-weight: 750;
  box-shadow: inset 3px 0 #60a5fa;
}

.nav-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9db1d0;
  transition: color 0.2s;
}

.nav-icon svg {
  width: 19px;
  height: 19px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.6;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.nav-link.active .nav-icon,
.nav-link:hover .nav-icon {
  color: #60a5fa;
}

.active-indicator {
  width: 6px;
  height: 6px;
  margin-left: auto;
  border-radius: 50%;
  background: #60a5fa;
  box-shadow: 0 0 10px rgba(96, 165, 250, 0.8);
}

/* =========================================
   FOOTER
========================================= */

.sidebar-footer {
  padding: 18px 20px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.footer-status {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-bottom: 17px;
  color: #b5c6dd;
  font-size: 10px;
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #22c55e;
  box-shadow: 0 0 9px rgba(34, 197, 94, 0.6);
}

.footer-version {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #8298b8;
  font-size: 9px;
  font-weight: 650;
}

/* =========================================
   MOBILE TOGGLE
========================================= */

.mobile-toggle {
  display: none;
  position: fixed;
  top: 15px;
  left: 15px;
  z-index: 1100;
  width: 43px;
  height: 43px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  border: 1px solid #e2e8f0;
  border-radius: 11px;
  background: #ffffff;
  box-shadow: 0 4px 15px rgba(15, 35, 75, 0.1);
  cursor: pointer;
}

.mobile-toggle span {
  width: 19px;
  height: 2px;
  border-radius: 5px;
  background: #17345f;
  transition: all 0.25s ease;
}

.mobile-toggle.active span:first-child {
  transform: translateY(7px) rotate(45deg);
}

.mobile-toggle.active span:nth-child(2) {
  opacity: 0;
}

.mobile-toggle.active span:last-child {
  transform: translateY(-7px) rotate(-45deg);
}

/* =========================================
   MOBILE CLOSE
========================================= */

.mobile-close {
  display: none;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  background: rgba(255,255,255,0.08);
  color: white;
  font-size: 23px;
  cursor: pointer;
}

/* =========================================
   OVERLAY
========================================= */

.sidebar-overlay {
  display: none;
  position: fixed;
  inset: 0;
  z-index: 950;
  background: rgba(10, 20, 40, 0.55);
  backdrop-filter: blur(4px);
}

/* =========================================
   RESPONSIVE
========================================= */

@media (max-width: 900px) {
  .mobile-toggle {
    display: flex;
  }

  .sidebar {
    width: 280px;
    transform: translateX(-105%);
    z-index: 1050;
  }

  .sidebar.sidebar-open {
    transform: translateX(0);
  }

  .sidebar-overlay {
    display: block;
  }

  .mobile-close {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

/* =========================================
   OVERLAY TRANSITION
========================================= */

.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 0.25s ease;
}

.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .sidebar,
  .nav-link,
  .mobile-toggle span {
    transition: none !important;
  }
}
</style>
