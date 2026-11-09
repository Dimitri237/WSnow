
<template>
  <main class="splash-screen">
    <!-- BACKGROUND DECORATION -->
    <div class="background-shape shape-one"></div>
    <div class="background-shape shape-two"></div>
    <div class="background-grid"></div>

    <section class="splash-content">

      <!-- LOGO -->
      <div class="logo-container">
        <div class="logo-ring ring-one"></div>
        <div class="logo-ring ring-two"></div>
        <div class="logo-ring ring-three"></div>

        <div class="logo-wrapper">
          <img
            src="../assets/logo2.png"
            alt="ACTILC"
            class="logo"
          />
        </div>

        <span class="orbit-dot dot-one"></span>
        <span class="orbit-dot dot-two"></span>
      </div>

      <!-- BRAND -->
      <div class="brand-content">
        <h1>ACTILC</h1>

        <p class="brand-subtitle">
          Association Camerounaise des Traducteurs
          et Interprètes de Langue Chinoise
        </p>

        <div class="brand-line"></div>

        <p class="loading-text">
          Préparation de votre espace
          <span class="loading-dots">
            <span>.</span>
            <span>.</span>
            <span>.</span>
          </span>
        </p>
      </div>

      <!-- LOADING -->
      <div class="loading-container">
        <div class="loading-track">
          <div class="loading-progress"></div>
        </div>

        <div class="loading-footer">
          <span>Chargement en cours</span>
          <span class="loading-percent">ACTILC</span>
        </div>
      </div>

      <!-- FOOTER -->
      <div class="splash-footer">
        <span class="footer-dot"></span>
        <span>Une plateforme au service de la traduction</span>
      </div>

    </section>
  </main>
</template>

<script>
export default {
  name: "SplashScreen",

  data() {
    return {
      redirectTimer: null,
      isRedirecting: false,
    };
  },

  mounted() {
    this.redirectTimer = window.setTimeout(() => {
      this.redirectToAuth();
    }, 2500);
  },

  beforeUnmount() {
    if (this.redirectTimer !== null) {
      window.clearTimeout(this.redirectTimer);
    }
  },

  methods: {
    async redirectToAuth() {
      if (this.isRedirecting) return;

      this.isRedirecting = true;

      try {
        if (this.$route.path !== "/auth") {
          await this.$router.replace("/auth");
        }
      } catch (error) {
        console.error("Erreur lors de la redirection :", error);
        this.isRedirecting = false;
      }
    },
  },
};
</script>

<style scoped>
/* =========================================
   MAIN SCREEN
========================================= */

.splash-screen {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  min-height: 100vh;
  min-height: 100dvh;
  background: linear-gradient(
    135deg,
    #071a35 0%,
    #102b55 48%,
    #153e72 100%
  );
  font-family: "Poppins", "Segoe UI", sans-serif;
  color: #ffffff;
}

/* =========================================
   BACKGROUND
========================================= */

.background-grid {
  position: absolute;
  inset: 0;
  opacity: 0.12;
  background-image:
    linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px);
  background-size: 45px 45px;
  mask-image: linear-gradient(to bottom, black, transparent);
}

.background-shape {
  position: absolute;
  border-radius: 50%;
  filter: blur(2px);
  pointer-events: none;
}

.shape-one {
  width: 420px;
  height: 420px;
  top: -200px;
  right: -120px;
  background: radial-gradient(
    circle,
    rgba(59, 130, 246, 0.25),
    transparent 70%
  );
}

.shape-two {
  width: 450px;
  height: 450px;
  bottom: -250px;
  left: -150px;
  background: radial-gradient(
    circle,
    rgba(212, 175, 55, 0.15),
    transparent 70%
  );
}

/* =========================================
   CONTENT
========================================= */

.splash-content {
  position: relative;
  z-index: 2;
  width: min(90%, 470px);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  animation: contentAppear 0.8s ease both;
}

/* =========================================
   LOGO
========================================= */

.logo-container {
  position: relative;
  width: 155px;
  height: 155px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 35px;
}

.logo-ring {
  position: absolute;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 50%;
}

.ring-one {
  inset: 0;
  border-top-color: #d4af37;
  animation: rotate 5s linear infinite;
}

.ring-two {
  inset: 12px;
  border-right-color: rgba(96, 165, 250, 0.8);
  animation: rotateReverse 7s linear infinite;
}

.ring-three {
  inset: 24px;
  border-bottom-color: rgba(212, 175, 55, 0.7);
  animation: rotate 9s linear infinite;
}

.logo-wrapper {
  position: relative;
  z-index: 2;
  width: 88px;
  height: 88px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 3px solid rgba(255, 255, 255, 0.8);
  border-radius: 25px;
  background: #ffffff;
  box-shadow:
    0 0 35px rgba(255, 255, 255, 0.12),
    0 15px 35px rgba(0, 0, 0, 0.2);
  animation: logoFloat 3s ease-in-out infinite;
}

.logo {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 5px;
}

.orbit-dot {
  position: absolute;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #d4af37;
  box-shadow: 0 0 15px rgba(212, 175, 55, 0.8);
}

.dot-one {
  top: 10px;
  right: 23px;
}

.dot-two {
  bottom: 17px;
  left: 14px;
  width: 6px;
  height: 6px;
  background: #60a5fa;
  box-shadow: 0 0 12px rgba(96, 165, 250, 0.8);
}

/* =========================================
   BRAND
========================================= */

.brand-content h1 {
  margin: 0;
  font-size: 35px;
  font-weight: 900;
  letter-spacing: 7px;
  color: #ffffff;
}

.brand-subtitle {
  max-width: 370px;
  margin: 13px auto 0;
  color: rgba(255, 255, 255, 0.65);
  font-size: 11px;
  line-height: 1.8;
  font-weight: 400;
}

.brand-line {
  width: 45px;
  height: 3px;
  margin: 24px auto;
  border-radius: 10px;
  background: linear-gradient(90deg, #d4af37, #f5d778);
}

.loading-text {
  margin: 0;
  color: #ffffff;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.3px;
}

.loading-dots span {
  display: inline-block;
  animation: dotAnimation 1.2s infinite;
}

.loading-dots span:nth-child(2) {
  animation-delay: 0.2s;
}

.loading-dots span:nth-child(3) {
  animation-delay: 0.4s;
}

/* =========================================
   PROGRESS BAR
========================================= */

.loading-container {
  width: 100%;
  max-width: 290px;
  margin-top: 35px;
}

.loading-track {
  width: 100%;
  height: 4px;
  overflow: hidden;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.15);
}

.loading-progress {
  width: 35%;
  height: 100%;
  border-radius: 10px;
  background: linear-gradient(90deg, #d4af37, #ffe59a);
  box-shadow: 0 0 12px rgba(212, 175, 55, 0.5);
  animation: progressAnimation 2.5s ease-in-out infinite;
}

.loading-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.loading-percent {
  color: #d4af37;
}

/* =========================================
   FOOTER
========================================= */

.splash-footer {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-top: 75px;
  color: rgba(255, 255, 255, 0.45);
  font-size: 10px;
  letter-spacing: 0.3px;
}

.footer-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #d4af37;
}

/* =========================================
   ANIMATIONS
========================================= */

@keyframes rotate {
  to {
    transform: rotate(360deg);
  }
}

@keyframes rotateReverse {
  to {
    transform: rotate(-360deg);
  }
}

@keyframes logoFloat {
  0%, 100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-7px);
  }
}

@keyframes dotAnimation {
  0%, 60%, 100% {
    opacity: 0.25;
    transform: translateY(0);
  }

  30% {
    opacity: 1;
    transform: translateY(-3px);
  }
}

@keyframes progressAnimation {
  0% {
    transform: translateX(-110%);
  }

  100% {
    transform: translateX(290%);
  }
}

@keyframes contentAppear {
  from {
    opacity: 0;
    transform: translateY(18px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* =========================================
   RESPONSIVE
========================================= */

@media (max-width: 480px) {
  .logo-container {
    width: 135px;
    height: 135px;
  }

  .logo-wrapper {
    width: 78px;
    height: 78px;
  }

  .brand-content h1 {
    font-size: 29px;
  }

  .brand-subtitle {
    font-size: 10px;
    padding: 0 10px;
  }

  .splash-footer {
    margin-top: 60px;
    font-size: 9px;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
  }
}
</style>
