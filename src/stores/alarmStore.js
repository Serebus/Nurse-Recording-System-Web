import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { useAuthStore } from './authStore.js'
import * as signalR from '@microsoft/signalr'

export const useAlarmStore = defineStore('alarmStore', () => {
  const authStore = useAuthStore()
  const devices = ref({})

  const getHeaders = () => {
    const token = localStorage.getItem('token')
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  const getDeviceState = (deviceId) => {
    if (!devices.value[deviceId]) devices.value[deviceId] = { rawState: 0 }
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

  // ── SignalR hub connection ────────────────────────────────────────
  let connection = null

  const buildConnection = () => {
    const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

    return new signalR.HubConnectionBuilder()
      .withUrl(`${base}/alarmhub`, {
        // SignalR handles JWT auth cleanly via accessTokenFactory
        accessTokenFactory: () => localStorage.getItem('token') ?? '',
      })
      .withAutomaticReconnect()        // built-in reconnect, no manual timer needed
      .configureLogging(signalR.LogLevel.Warning)
      .build()
  }

  const startListening = async () => {
    if (connection) return

    connection = buildConnection()

    // Server calls this when any alarm state changes
connection.on('AlarmUpdated', (alarm) => {
  const id = alarm.DeviceId ?? alarm.deviceId
  if (id != null) {
    getDeviceState(id).rawState = alarm.State ?? alarm.state ?? 0
  }
})

    // Server calls this on connect to send all current states
connection.on('AlarmSnapshot', (alarms) => {
  alarms.forEach((alarm) => {
    const id = alarm.DeviceId ?? alarm.deviceId
    if (id != null) {
      getDeviceState(id).rawState = alarm.State ?? alarm.state ?? 0
    }
  })
})

    try {
      await connection.start()
      console.log('[AlarmStore] SignalR connected')
    } catch (err) {
      console.error('[AlarmStore] SignalR connection failed:', err)
    }
  }

  const stopListening = async () => {
    if (connection) {
      await connection.stop()
      connection = null
    }
    devices.value = {}
  }

  // ── Actions (REST PATCH — unchanged) ────────────────────────────
  const updateAlarmState = async (deviceId, newState) => {
    try {
      const response = await fetch(`/api/Alarm/${deviceId}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ State: newState }),
      })
      if (!response.ok) throw new Error('Failed to update alarm')
      getDeviceState(deviceId).rawState = newState  // optimistic
      return true
    } catch (error) {
      console.error('Error updating alarm:', error)
      return false
    }
  }

  const setComing   = (deviceId) => updateAlarmState(deviceId, 2)
  const dismissCall = (deviceId) => updateAlarmState(deviceId, 0)
  const endCall     = (deviceId) => updateAlarmState(deviceId, 3)

  watch(
    () => authStore.isAuthenticated,
    (isAuth) => { if (!isAuth) stopListening() },
    { immediate: true }
  )

  return {
    devices,
    callStateFor,
    isVisibleFor,
    startListening,
    stopListening,
    setComing,
    dismissCall,
    endCall,
  }
})