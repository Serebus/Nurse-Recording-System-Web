import defineStore from 'pinia'
import { ref } from 'vue'

const API_BASE_URL = 'http://localhost:3000'

export const useDashboardStore = defineStore('dashboardStore', () => {
  const stats = ref({
    totalPatients: 0,
    totalAppointments: 0,
    upcomingAppointments: 0,
    followUpsDue: 0,
    totalRecords: 0,
  })

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/stats`)
      if (!response.ok) throw new Error('Failed to fetch dashboard stats')
      const data = await response.json()
      stats.value = data
      console.log('Dashboard stats fetched successfully')
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    }
  }

  return { stats, fetchStats }
})
