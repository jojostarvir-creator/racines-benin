<script setup>
import { computed } from 'vue'
import { allFamilies } from '../data/familyDirectory.js'
import { useFavorites } from '../store/favorites.js'
import FavoriteHeart from '../components/FavoriteHeart.vue'
import Icon from '../components/Icon.vue'

const { favoriteSlugs } = useFavorites()
const families = allFamilies()

const favoriteFamilies = computed(() => families.filter((f) => favoriteSlugs.has(f.slug)))
</script>

<template>
  <section class="section directory-section">
    <div class="container">
      <div class="section-head">
        <div>
          <div class="eyebrow">Ma sélection</div>
          <h2>Familles favorites ({{ favoriteFamilies.length }})</h2>
        </div>
        <p>Retrouvez ici toutes les familles que vous avez ajoutées à vos favoris grâce à l'icône cœur.</p>
      </div>

      <div v-if="favoriteFamilies.length" class="directory-grid">
        <RouterLink v-for="f in favoriteFamilies" :key="f.slug" :to="`/famille/${f.slug}`" class="poster-card">
          <div class="poster-img">
            <img :src="f.image" :alt="f.name">
            <span v-if="f.verified" class="badge">Vérifiée</span>
            <FavoriteHeart :slug="f.slug" />
          </div>
          <div class="poster-body">
            <strong>{{ f.name }}</strong>
            <small>{{ f.department }} · {{ f.origin }}</small>
          </div>
        </RouterLink>
      </div>

      <div v-else class="favorites-empty">
        <Icon name="heart" />
        <h3>Aucun favori pour l'instant</h3>
        <p>Cliquez sur le cœur d'une famille pour l'ajouter ici.</p>
        <RouterLink to="/familles" class="btn btn-yellow">Parcourir les familles →</RouterLink>
      </div>
    </div>
  </section>
</template>
