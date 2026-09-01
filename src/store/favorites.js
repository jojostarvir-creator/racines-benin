import { reactive } from 'vue'

function keyFor(email) {
  return email ? `beninto_favorites_${email}` : 'beninto_favorites_anon'
}

function load(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function persist(key, slugSet) {
  try {
    localStorage.setItem(key, JSON.stringify([...slugSet]))
  } catch {
    // localStorage unavailable — favorites just won't survive a reload.
  }
}

let activeEmail = undefined // undefined = not yet synced, distinct from null (anonymous)
const slugs = reactive(new Set(load(keyFor(null))))

function replaceSlugs(next) {
  slugs.clear()
  for (const s of next) slugs.add(s)
}

// Called from auth.js on boot, register, login and logout so the
// favorites list always matches whoever is currently signed in — and
// so favorites picked before creating an account aren't lost once
// they do (merged into their new account list, then the anonymous
// list is cleared).
export function setFavoritesUser(email) {
  if (email === activeEmail) return

  if (email) {
    const anonSlugs = load(keyFor(null))
    const accountSlugs = new Set(load(keyFor(email)))
    for (const s of anonSlugs) accountSlugs.add(s)
    persist(keyFor(email), accountSlugs)
    localStorage.removeItem(keyFor(null))
    replaceSlugs(accountSlugs)
  } else {
    replaceSlugs(load(keyFor(null)))
  }
  activeEmail = email
}

function persistActive() {
  persist(keyFor(activeEmail ?? null), slugs)
}

export function useFavorites() {
  function isFavorite(slug) {
    return slugs.has(slug)
  }
  function toggleFavorite(slug) {
    if (slugs.has(slug)) slugs.delete(slug)
    else slugs.add(slug)
    persistActive()
  }
  function removeFavorite(slug) {
    slugs.delete(slug)
    persistActive()
  }
  return { favoriteSlugs: slugs, isFavorite, toggleFavorite, removeFavorite }
}
