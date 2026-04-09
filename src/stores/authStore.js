import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

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
    formLogin.value = {
      email: '',
      password: '',
    }
  }

  const isAuthenticated = computed(() => !!nurse.value)

  const getToken = computed(() => token.value)

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
      console.log('Token extracted:', tokenFromResponse)
      if (tokenFromResponse) {
        token.value = tokenFromResponse
        localStorage.setItem('token', tokenFromResponse)
        nurse.value = data.user?.nurse || data.user
        localStorage.setItem('nurse', JSON.stringify(nurse.value))
        localStorage.setItem('nurseId', data.user?.nurseDetails?.nurseId || nurse.value?.Id)
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
      token.value = null
      nurse.value = null
      localStorage.removeItem('token')
      localStorage.removeItem('nurse')
      localStorage.removeItem('nurseId')
    }
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
  }
})
