import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { useAuthStore } from './authStore.js'

export const useAlarmStore = defineStore('alarmStore', () => {
  const authStore = useAuthStore()

  const POLL_MS = 2000

  const devices = ref({})

  const getHeaders = () => {
    const token = localStorage.getItem('token')
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  const getDeviceState = (deviceId) => {
    if (!devices.value[deviceId]) {
      devices.value[deviceId] = { rawState: 0 }
    }
    return devices.value[deviceId]
  }

  const callStateFor = (deviceId) => {
    const map = { 0: 'idle', 1: 'calling', 2: 'coming', 3: 'ended' }
    return map[getDeviceState(deviceId).rawState] || 'idle'
  }

  const isVisibleFor = (deviceId) => {
    const s = getDeviceState(deviceId).rawState
    return s >= 1 && s <= 3
  }

  // ── Single global poll ──────────────────────────────────────────
  let globalPollInterval = null

  const fetchAllAlarms = async () => {
    try {
      const response = await fetch('/api/Alarm', { headers: getHeaders() })
      if (!response.ok) throw new Error('Failed to fetch alarms')
      const data = await response.json()

      data.forEach((alarm) => {
        const id = alarm.DeviceId ?? alarm.deviceId
        if (id) {
          getDeviceState(id).rawState = alarm.State ?? alarm.state ?? 0
        }
      })
    } catch (error) {
      console.error('Error fetching alarms:', error)
    }
  }

  const startPolling = () => {
    fetchAllAlarms()
    if (!globalPollInterval) {
      globalPollInterval = setInterval(fetchAllAlarms, POLL_MS)
    }
  }

  const stopPolling = () => {
    if (globalPollInterval) {
      clearInterval(globalPollInterval)
      globalPollInterval = null
    }
  }

  const stopAllPolling = () => {
    stopPolling()
    devices.value = {}
  }

  // ── Alarm actions ───────────────────────────────────────────────
const updateAlarmState = async (deviceId, newState) => {
  try {
    const response = await fetch(`/api/Alarm/${deviceId}`, {  // ← deviceId in URL
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ State: newState }),               // ← only State in body
    })
    if (!response.ok) throw new Error('Failed to update alarm')
    getDeviceState(deviceId).rawState = newState
    return true
  } catch (error) {
    console.error('Error updating alarm:', error)
    return false
  }
}

  const setComing   = (deviceId) => updateAlarmState(deviceId, 2)
  const dismissCall = (deviceId) => updateAlarmState(deviceId, 0)
  const endCall     = (deviceId) => updateAlarmState(deviceId, 3)

  // ── Stop on logout ──────────────────────────────────────────────
  watch(
    () => authStore.isAuthenticated,
    (isAuth) => { if (!isAuth) stopAllPolling() },
    { immediate: true }
  )

  return {
    devices,
    callStateFor,
    isVisibleFor,
    startPolling,
    stopPolling,
    setComing,
    dismissCall,
    endCall,
  }
})