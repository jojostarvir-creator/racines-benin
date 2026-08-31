<template>
  <footer>
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <RouterLink class="logo" to="/" aria-label="Béninto">
            <span class="logo-stack">
              <span class="logo-word"></span>
              <span class="logo-tagline"></span>
            </span>
          </RouterLink>
          <p>Une plateforme dédiée à la mémoire, aux origines et aux traditions des familles béninoises.</p>
        </div>
        <div class="footer-col"><h4>Explorer</h4><RouterLink to="/#familles">Familles</RouterLink><RouterLink to="/#territoires">Territoires</RouterLink><RouterLink to="/#statistiques">Données</RouterLink></div>
        <div class="footer-col"><h4>Participer</h4><RouterLink to="/#contribuer">Raconter mon histoire</RouterLink><RouterLink to="/#methode">Méthode</RouterLink><RouterLink to="/inscription">Devenir contributeur</RouterLink></div>
        <div class="footer-col"><h4>À propos</h4><a href="#">Notre mission</a><a href="#">Contact</a><a href="#">Mentions légales</a></div>
      </div>
      <div class="footer-bottom"><span>© 2026 BÉNINTO — HISTOIRE D'UN PEUPLE</span><span>Inspiré du patrimoine béninois</span></div>
    </div>
  </footer>
</template>
