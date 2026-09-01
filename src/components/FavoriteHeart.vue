<script setup>
import { useFavorites } from '../store/favorites.js'
import Icon from './Icon.vue'

const props = defineProps({
  slug: { type: String, required: true },
})

const { isFavorite, toggleFavorite } = useFavorites()

function onClick(e) {
  e.preventDefault()
  e.stopPropagation()
  toggleFavorite(props.slug)
}
</script>

<template>
  <button
    type="button" class="favorite-heart" :class="{ active: isFavorite(slug) }"
    :aria-label="isFavorite(slug) ? 'Retirer des favoris' : 'Ajouter aux favoris'"
    @click="onClick"
  >
    <Icon name="heart" />
  </button>
</template>
