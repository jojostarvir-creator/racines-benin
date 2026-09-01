<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const pages = {
  mission: {
    eyebrow: 'Notre mission',
    title: 'Une mémoire documentée, pas un simple site d\'actualité.',
    body: [
      "Béninto est né d'un constat simple : chaque famille béninoise porte une histoire riche — un lieu d'origine, une lignée, des récits transmis de génération en génération — mais ces histoires se perdent trop souvent faute d'être écrites quelque part.",
      "Notre mission est de donner à chaque famille un espace pour explorer, raconter et vérifier son histoire : un arbre généalogique, des souvenirs, des documents, des anecdotes, le tout organisé et transmissible aux générations suivantes.",
      "Nous croyons qu'un peuple qui connaît son histoire construit son avenir avec plus de fierté.",
    ],
  },
  contact: {
    eyebrow: 'Contact',
    title: 'Une question, une suggestion ?',
    body: [
      "Nous serions ravis d'avoir de vos nouvelles — que ce soit pour signaler une erreur dans l'histoire de votre famille, proposer une amélioration, ou simplement nous dire ce que vous pensez de Béninto.",
      "Vous pouvez nous écrire directement à contact@beninto.bj, nous répondons généralement sous quelques jours.",
    ],
  },
  mentions: {
    eyebrow: 'Mentions légales',
    title: 'Mentions légales',
    body: [
      "Béninto est une plateforme de démonstration dédiée à la mémoire des familles béninoises.",
      "Éditeur : Béninto — contact@beninto.bj",
      "Hébergement : ce site est hébergé par un prestataire technique standard de type hébergeur web.",
      "Données personnelles : les informations que vous renseignez (compte, histoires, souvenirs) restent stockées localement dans votre navigateur et ne sont partagées avec aucun tiers.",
      "Propriété intellectuelle : les textes, images et éléments graphiques de ce site sont la propriété de leurs auteurs respectifs.",
    ],
  },
}

const page = computed(() => pages[route.name] ?? pages.mission)
</script>

<template>
  <section class="section">
    <div class="container login-wrap">
      <div class="login-card static-page-card">
        <div class="eyebrow">{{ page.eyebrow }}</div>
        <h2>{{ page.title }}</h2>
        <p v-for="(p, i) in page.body" :key="i" class="lead static-page-p">{{ p }}</p>
      </div>
    </div>
  </section>
</template>
