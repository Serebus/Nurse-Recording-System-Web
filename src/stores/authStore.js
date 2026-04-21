import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/**
 * Decode a JWT and return its payload, or null if malformed.
 */
function decodeJwt(token) {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    )
    return JSON.parse(json)
  } catch {
    return null
  }
}

/**
 * Returns true if the JWT token is expired (or invalid).
 */
function isTokenExpired(token) {
  if (!token) return true
  const payload = decodeJwt(token)
  if (!payload?.exp) return false // no exp claim → treat as non-expiring
  return Date.now() >= payload.exp * 1000
}

export const useAuthStore = defineStore('authStore', () => {
  const storedNurse = localStorage.getItem('nurse')
  const storedToken = localStorage.getItem('token')

  const nurse = ref(storedNurse ? JSON.parse(storedNurse) : null)
  const token = ref(storedToken || null)

  const formLogin = ref({
    email: '',
    password: '',
  })

  const resetFormLogin = () => {
    formLogin.value = { email: '', password: '' }
  }

  /** Clears session state without hitting the server */
  const clearSession = () => {
    token.value = null
    nurse.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('nurse')
    localStorage.removeItem('nurseId')
  }

  /**
   * isAuthenticated — false if no nurse data OR if the stored token is
   * already expired at page load / store init time.
   */
  const isAuthenticated = computed(() => {
    if (!nurse.value) return false
    if (isTokenExpired(token.value)) {
      // Side-effect: clear stale data so the router guard fires correctly.
      // We do this lazily rather than in a watcher to avoid reactivity loops.
      clearSession()
      return false
    }
    return true
  })

  const getToken = computed(() => token.value)

  /**
   * Central fetch wrapper used by all stores.
   * - Injects the Authorization header automatically.
   * - On 401 it clears the session and reloads to /login.
   */
  const apiFetch = async (url, options = {}) => {
    const currentToken = localStorage.getItem('token')

    // Pre-flight expiry check
    if (currentToken && isTokenExpired(currentToken)) {
      clearSession()
      window.location.href = '/login'
      return null
    }

    const headers = {
      'Content-Type': 'application/json',
      ...(currentToken ? { Authorization: `Bearer ${currentToken}` } : {}),
      ...(options.headers ?? {}),
    }

    const response = await fetch(url, { ...options, headers })

    if (response.status === 401) {
      clearSession()
      window.location.href = '/login'
      return null
    }

    return response
  }

  const login = async () => {
    try {
      console.log('Login attempt:', formLogin.value)
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formLogin.value),
      })
      console.log('Response status:', response.status)
      const data = await response.json()
      console.log('Response data:', data)

      const tokenFromResponse = data.accessToken || data.token
      if (tokenFromResponse) {
        token.value = tokenFromResponse
        localStorage.setItem('token', tokenFromResponse)

        const nurseData = data.user?.nurse || data.user || null
        nurse.value = nurseData
        localStorage.setItem('nurse', JSON.stringify(nurseData))
        localStorage.setItem('nurseId', data.user?.nurseDetails?.nurseId || nurseData?.Id || nurseData?.id || '')

        console.log('Login success')
        return true
      } else {
        console.error('Login failed:', data.message || 'No token received')
        return false
      }
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
    } catch (error) {
      console.error('Logout error', error)
    } finally {
      clearSession()
    }
  }

  /**
   * Start a periodic check (every 60 s) that kicks the user out the moment
   * their token expires while the tab is open.
   */
  const startExpiryWatcher = () => {
    const interval = setInterval(() => {
      const t = localStorage.getItem('token')
      if (t && isTokenExpired(t)) {
        clearInterval(interval)
        clearSession()
        window.location.href = '/login'
      }
    }, 60_000)
    return interval
  }

  return {
    nurse,
    token,
    formLogin,
    isAuthenticated,
    getToken,
    login,
    logout,
    resetFormLogin,
    clearSession,
    apiFetch,
    startExpiryWatcher,
    isTokenExpired,
  }
})