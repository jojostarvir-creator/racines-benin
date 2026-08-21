<script setup>
const steps = [
  { icon: '⌕', title: 'Explorer', desc: "Parcourez les familles par région, origine, période ou tradition et suivez le fil d'une lignée." },
  { icon: '✦', title: 'Raconter', desc: 'Déposez vos souvenirs, photos, noms, documents et témoignages pour enrichir l\'histoire familiale.' },
  { icon: '✓', title: 'Vérifier', desc: 'Les récits peuvent être associés à des sources, archives et validations familiales pour construire une mémoire fiable.' },
]
</script>

<template>
  <section class="section" id="methode">
    <div class="container">
      <div class="section-head">
        <div><div class="eyebrow">Comme Wikipédia</div><h2>Une mémoire documentée, pas un simple site d'actualité.</h2></div>
        <p>Chaque récit peut être relié à une famille, une personne, une localité, une période, une tradition ou une archive.</p>
      </div>
      <div class="how">
        <article class="how-card" v-for="step in steps" :key="step.title">
          <div class="icon">{{ step.icon }}</div>
          <h3>{{ step.title }}</h3>
          <p>{{ step.desc }}</p>
        </article>
      </div>
    </div>
  </section>
</template>
