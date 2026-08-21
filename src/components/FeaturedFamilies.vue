<script setup>
import { ref } from 'vue'
import { featuredFamilies } from '../data/families.js'
import FamilyCard from './FamilyCard.vue'

const railRef = ref(null)
const activeIndex = ref(0)
const step = 275 + 18 // card width + gap

function scrollByStep(dir) {
  railRef.value?.scrollBy({ left: dir * step, behavior: 'smooth' })
}

function scrollToIndex(i) {
  railRef.value?.scrollTo({ left: i * step, behavior: 'smooth' })
}

function onScroll() {
  if (!railRef.value) return
  const i = Math.round(railRef.value.scrollLeft / step)
  activeIndex.value = Math.min(Math.max(i, 0), featuredFamilies.length - 1)
}
</script>

<template>
  <section class="section" id="familles">
    <div class="container">
      <div class="section-head">
        <div><div class="eyebrow">Comme Netflix</div><h2>Familles en vedette</h2></div>
        <p>Des cartes visuelles pour donner envie de parcourir les lignées, puis d'ouvrir chaque histoire comme un documentaire.</p>
      </div>

      <div class="carousel-wrap">
        <button class="carousel-arrow prev" aria-label="Précédent" @click="scrollByStep(-1)">‹</button>

        <div class="rail" ref="railRef" @scroll="onScroll">
          <FamilyCard v-for="family in featuredFamilies" :key="family.name" :family="family" />
        </div>

        <button class="carousel-arrow next" aria-label="Suivant" @click="scrollByStep(1)">›</button>
      </div>

      <div class="carousel-dots">
        <button
          v-for="(family, i) in featuredFamilies"
          :key="family.name"
          class="dot"
          :class="{ active: i === activeIndex }"
          :aria-label="`Aller à ${family.name}`"
          @click="scrollToIndex(i)"
        ></button>
      </div>
    </div>
  </section>
</template>
