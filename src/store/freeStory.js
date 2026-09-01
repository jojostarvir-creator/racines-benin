const KEY = 'racines_free_story_slug'

export function getUnlockedSlug() {
  try {
    return localStorage.getItem(KEY)
  } catch {
    return null
  }
}

export function unlockSlug(slug) {
  try {
    localStorage.setItem(KEY, slug)
  } catch {
    // localStorage unavailable (private browsing, etc.) — fail open,
    // the visit is simply not remembered for next time.
  }
}
