import { useAuthStore } from './stores/authStore.js'
console.log('Auth store:', useAuthStore())
console.log('Token:', useAuthStore().token?.value)
console.log('isAuthenticated:', useAuthStore().isAuthenticated)
