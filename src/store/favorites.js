import { reactive } from 'vue'

const STORAGE_KEY = 'beninto_favorites'

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

const slugs = reactive(new Set(load()))

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...slugs]))
}

export function useFavorites() {
  function isFavorite(slug) {
    return slugs.has(slug)
  }
  function toggleFavorite(slug) {
    if (slugs.has(slug)) slugs.delete(slug)
    else slugs.add(slug)
    persist()
  }
  function removeFavorite(slug) {
    slugs.delete(slug)
    persist()
  }
  return { favoriteSlugs: slugs, isFavorite, toggleFavorite, removeFavorite }
}
