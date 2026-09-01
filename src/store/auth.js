import { reactive, computed } from 'vue'
import { setFavoritesUser } from './favorites.js'

const USERS_KEY = 'racines_users'
const SESSION_KEY = 'racines_session'

function loadUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || []
  } catch {
    return []
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

function normalizeEmail(email) {
  return email.trim().toLowerCase()
}

function bytesToHex(bytes) {
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('')
}

function randomSalt() {
  return bytesToHex(crypto.getRandomValues(new Uint8Array(16)))
}

async function hashPassword(password, salt) {
  const data = new TextEncoder().encode(`${salt}:${password}`)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return bytesToHex(new Uint8Array(digest))
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

export function passwordIssues(password) {
  const issues = []
  if (password.length < 8) issues.push('au moins 8 caractères')
  if (!/[a-zA-Z]/.test(password)) issues.push('une lettre')
  if (!/[0-9]/.test(password)) issues.push('un chiffre')
  return issues
}

const state = reactive({
  currentUser: null,
})

try {
  const raw = localStorage.getItem(SESSION_KEY)
  state.currentUser = raw ? JSON.parse(raw) : null
} catch {
  state.currentUser = null
}
setFavoritesUser(state.currentUser?.email ?? null)

function persistSession() {
  if (state.currentUser) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(state.currentUser))
  } else {
    localStorage.removeItem(SESSION_KEY)
  }
}

export async function register({ fullName, familyName, email, password }) {
  const normalizedEmail = normalizeEmail(email)
  if (!isValidEmail(normalizedEmail)) {
    return { ok: false, error: 'Adresse email invalide.' }
  }
  const issues = passwordIssues(password)
  if (issues.length) {
    return { ok: false, error: `Le mot de passe doit contenir ${issues.join(', ')}.` }
  }
  const users = loadUsers()
  if (users.some((u) => u.email === normalizedEmail)) {
    return { ok: false, error: 'Un compte existe déjà avec cet email.' }
  }
  const salt = randomSalt()
  const passwordHash = await hashPassword(password, salt)
  users.push({ fullName: fullName.trim(), familyName: familyName.trim(), email: normalizedEmail, salt, passwordHash })
  saveUsers(users)
  state.currentUser = { fullName: fullName.trim(), familyName: familyName.trim(), email: normalizedEmail }
  persistSession()
  setFavoritesUser(normalizedEmail)
  return { ok: true }
}

export async function login({ email, password }) {
  const normalizedEmail = normalizeEmail(email)
  const users = loadUsers()
  const user = users.find((u) => u.email === normalizedEmail)
  // Always hash, even on a missing account, so response timing doesn't reveal
  // whether the email exists.
  const attemptHash = await hashPassword(password, user ? user.salt : 'decoy-salt')
  if (!user || attemptHash !== user.passwordHash) {
    return { ok: false, error: 'Email ou mot de passe incorrect.' }
  }
  state.currentUser = { fullName: user.fullName, familyName: user.familyName, email: user.email }
  persistSession()
  setFavoritesUser(user.email)
  return { ok: true }
}

export function logout() {
  state.currentUser = null
  persistSession()
  setFavoritesUser(null)
}

export function updateProfile({ fullName, avatar }) {
  if (!state.currentUser) return { ok: false, error: 'Non connecté·e.' }
  const users = loadUsers()
  const user = users.find((u) => u.email === state.currentUser.email)
  if (fullName !== undefined && fullName.trim()) {
    state.currentUser.fullName = fullName.trim()
    if (user) user.fullName = fullName.trim()
  }
  if (avatar !== undefined) {
    state.currentUser.avatar = avatar
    if (user) user.avatar = avatar
  }
  if (user) saveUsers(users)
  persistSession()
  return { ok: true }
}

export async function changePassword({ currentPassword, newPassword }) {
  if (!state.currentUser) return { ok: false, error: 'Non connecté·e.' }
  const users = loadUsers()
  const user = users.find((u) => u.email === state.currentUser.email)
  if (!user) return { ok: false, error: 'Compte introuvable.' }
  const attemptHash = await hashPassword(currentPassword, user.salt)
  if (attemptHash !== user.passwordHash) {
    return { ok: false, error: 'Mot de passe actuel incorrect.' }
  }
  const issues = passwordIssues(newPassword)
  if (issues.length) {
    return { ok: false, error: `Le nouveau mot de passe doit contenir ${issues.join(', ')}.` }
  }
  const salt = randomSalt()
  user.salt = salt
  user.passwordHash = await hashPassword(newPassword, salt)
  saveUsers(users)
  return { ok: true }
}

export function useAuth() {
  return {
    currentUser: computed(() => state.currentUser),
    isAuthenticated: computed(() => !!state.currentUser),
  }
}
