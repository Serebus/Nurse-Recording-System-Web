<template>
  <div class="min-h-screen flex font-poppins bg-gray-50 text-gray-900">
    <SidebarComponent />

    <div class="main flex-1 ml-[280px] p-10 overflow-auto">
      <div class="header-section bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div
              class="w-16 h-16 rounded-full bg-gradient-to-r from-[#2933FF] to-[#FF5451] flex items-center justify-center text-white shadow-lg"
            >
              <i class="fa-solid fa-calendar-check text-2xl"></i>
            </div>
            <div>
              <h2
                class="text-3xl font-bold bg-gradient-to-r from-[#2933FF] to-[#FF5451] bg-clip-text text-transparent"
              >
                Appointments
              </h2>
              <p class="text-gray-500 text-sm mt-1">Manage patient appointments</p>
            </div>
          </div>
          <button
            @click="handleNewAppointment"
            class="px-6 py-3 bg-gradient-to-r from-[#2933FF] to-[#FF5451] text-white text-sm font-semibold rounded-xl transition-all hover:shadow-lg hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <i class="fa-solid fa-plus"></i>
            New Appointment
          </button>
        </div>
      </div>

      <!-- Search -->
      <div class="search mb-6 relative">
        <div class="absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none">
          <i
            class="fa-solid fa-magnifying-glass text-xl bg-gradient-to-r from-[#2933FF] to-[#FF5451] bg-clip-text text-transparent"
          ></i>
        </div>
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Search by reason, patient name, or date..."
          class="w-full pl-14 pr-6 py-4 rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-[#2933FF]/50 bg-white text-gray-800 placeholder-gray-400 transition-all duration-300 border border-gray-100"
        />
      </div>

      <!-- Filter tabs -->
      <div class="flex gap-3 mb-6">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          @click="activeFilter = tab.key"
          class="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
          :class="
            activeFilter === tab.key
              ? 'bg-gradient-to-r from-[#2933FF] to-[#FF5451] text-white shadow'
              : 'bg-white text-gray-600 border border-gray-200 hover:border-[#2933FF]/40'
          "
        >
          {{ tab.label }}
          <span class="ml-1 opacity-70 text-xs">({{ tab.count }})</span>
        </button>
      </div>

      <!-- Empty state -->
      <div v-if="displayedAppointments.length === 0" class="text-center py-16">
        <div
          class="w-20 h-20 rounded-full bg-gradient-to-r from-[#2933FF]/10 to-[#FF5451]/10 flex items-center justify-center mx-auto mb-4"
        >
          <i
            class="fa-solid fa-calendar-xmark text-3xl bg-gradient-to-r from-[#2933FF] to-[#FF5451] bg-clip-text text-transparent"
          ></i>
        </div>
        <p class="text-gray-500 text-lg">No appointments found</p>
      </div>

      <!-- Cards -->
      <div class="appointment-list grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="appointment in displayedAppointments"
          :key="appointment.id"
          class="bg-white rounded-2xl p-6 shadow-lg transition-all hover:-translate-y-1 duration-300 border group relative overflow-hidden"
          :class="isExpired(appointment) ? 'border-gray-200' : 'border-gray-100 hover:shadow-2xl'"
        >
          <!-- Gray tint for closed -->
          <div
            v-if="isExpired(appointment)"
            class="absolute inset-0 bg-gray-100/40 pointer-events-none z-0 rounded-2xl"
          ></div>
          <div
            class="absolute inset-0 bg-gradient-to-br from-[#2933FF]/5 to-[#FF5451]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
          ></div>

          <div class="relative z-10">
            <!-- Card header -->
            <div class="flex items-start justify-between mb-5">
              <div class="flex items-center gap-2 flex-1 min-w-0">
                <span
                  class="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center"
                  :class="isExpired(appointment) ? 'bg-gray-100' : 'bg-gradient-to-r from-[#2933FF]/10 to-[#FF5451]/10'"
                >
                  <i
                    class="fa-solid fa-calendar-days text-sm"
                    :class="isExpired(appointment) ? 'text-gray-400' : 'bg-gradient-to-r from-[#2933FF] to-[#FF5451] bg-clip-text text-transparent'"
                  ></i>
                </span>
                <div class="min-w-0">
                  <h2
                    class="text-base font-bold truncate"
                    :class="isExpired(appointment) ? 'text-gray-500' : 'bg-gradient-to-r from-[#2933FF] to-[#FF5451] bg-clip-text text-transparent'"
                  >
                    {{ appointment.reason }}
                  </h2>
                  <p class="text-xs text-gray-400 mt-0.5">
                    {{ appointment.appointmentId || `#${appointment.id}` }}
                  </p>
                </div>
              </div>

              <!-- Status badge + action buttons -->
              <div class="flex items-center gap-1.5 ml-2 flex-shrink-0">
                <span
                  class="text-xs font-bold px-2.5 py-1 rounded-full"
                  :class="isExpired(appointment) ? 'bg-gray-200 text-gray-500' : 'bg-green-100 text-green-700'"
                >
                  <i
                    class="mr-1 text-xs"
                    :class="isExpired(appointment) ? 'fa-solid fa-lock' : 'fa-solid fa-clock'"
                  ></i>
                  {{ isExpired(appointment) ? 'Closed' : 'Upcoming' }}
                </span>
                <button
                  @click="handleEdit(appointment)"
                  :disabled="isExpired(appointment)"
                  class="w-8 h-8 rounded-lg flex items-center justify-center transition-all bg-gradient-to-r from-[#2933FF]/10 to-[#FF5451]/10 hover:shadow-md hover:scale-110 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
                  title="Edit"
                >
                  <i
                    class="fa-solid fa-pen-to-square text-xs bg-gradient-to-r from-[#2933FF] to-[#FF5451] bg-clip-text text-transparent"
                  ></i>
                </button>
                <button
                  @click="confirmDelete(appointment)"
                  class="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center hover:shadow-md transition-all hover:scale-110 active:scale-95"
                  title="Delete"
                >
                  <i class="fa-solid fa-trash text-xs text-red-500"></i>
                </button>
              </div>
            </div>

            <!-- Details -->
            <div class="space-y-3">
              <!-- Patient name -->
              <div class="flex items-center gap-3 py-2 px-3 rounded-xl bg-gray-50">
                <i
                  class="fa-solid fa-user text-xs w-4 text-center"
                  :class="isExpired(appointment) ? 'text-gray-400' : 'text-[#2933FF]'"
                ></i>
                <div>
                  <p class="text-xs text-gray-400 font-medium">Patient</p>
                  <p class="text-sm font-semibold text-gray-700">
                    {{ appointment._patientName || getPatientName(appointment.patientId) }}
                  </p>
                </div>
              </div>

              <!-- Date + Time row -->
              <div class="grid grid-cols-2 gap-2">
                <div class="flex items-center gap-2 py-2 px-3 rounded-xl bg-gray-50">
                  <i
                    class="fa-solid fa-calendar text-xs"
                    :class="isExpired(appointment) ? 'text-gray-400' : 'text-[#2933FF]'"
                  ></i>
                  <div>
                    <p class="text-xs text-gray-400 font-medium">Date</p>
                    <p class="text-sm text-gray-700 font-semibold">{{ formatDate(appointment.date) }}</p>
                  </div>
                </div>
                <div class="flex items-center gap-2 py-2 px-3 rounded-xl bg-gray-50">
                  <i
                    class="fa-solid fa-clock text-xs"
                    :class="isExpired(appointment) ? 'text-gray-400' : 'text-[#FF5451]'"
                  ></i>
                  <div>
                    <p class="text-xs text-gray-400 font-medium">Time</p>
                    <p class="text-sm text-gray-700 font-semibold">{{ formatTime(appointment.time) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Appointment modal -->
    <AppointmentHandler v-if="showAppointmentModal" @modalClose="closeAppointmentModal" />

    <!-- Delete confirmation -->
    <div
      v-if="showDeleteModal"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-gray-100 p-6">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
            <i class="fa-solid fa-exclamation-triangle text-xl text-red-500"></i>
          </div>
          <div>
            <h3 class="text-xl font-bold text-gray-800">Delete Appointment</h3>
            <p class="text-sm text-gray-500">This action cannot be undone</p>
          </div>
        </div>
        <p class="text-gray-600 mb-6">
          Are you sure you want to delete
          <span class="font-semibold">{{ appointmentToDelete?.reason }}</span>?
        </p>
        <div class="flex justify-end gap-3">
          <button
            @click="cancelDelete"
            class="px-6 py-3 bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-200 active:scale-95 transition-all"
          >
            Cancel
          </button>
          <button
            @click="handleDelete"
            class="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:scale-105 active:scale-95 transition-all"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, provide } from 'vue'
import { useAppointmentStore } from '@/stores/AppointmentStore'
import { usePatientStore } from '@/stores/patientsStore'
import { useAuthStore } from '@/stores/authStore'
import { useRouter, useRoute } from 'vue-router'
import SidebarComponent from '@/components/SidebarComponent.vue'
import AppointmentHandler from '@/modals/AppoitmentHandler.vue'

const store = useAppointmentStore()
const patientStore = usePatientStore()
const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

provide('router', router)
provide('route', route)
provide('authStore', authStore)

const searchQuery = ref('')
const activeFilter = ref('All')
const showAppointmentModal = ref(false)
const showDeleteModal = ref(false)
const appointmentToDelete = ref(null)

/**
 * An appointment is "closed" (expired) when its date+time is in the past.
 * Handles both "YYYY-MM-DD" dates and "HH:MM" or "HH:MM:SS" times.
 * Falls back to date-only comparison if time is missing.
 */
const isExpired = (appointment) => {
  const dateStr = appointment.date ?? appointment.Date
  const timeStr = appointment.time ?? appointment.Time
  if (!dateStr) return false
  try {
    // Build a full ISO string, padding seconds if needed
    const isoStr = timeStr
      ? `${dateStr}T${timeStr.length === 5 ? timeStr + ':00' : timeStr}`
      : `${dateStr}T23:59:59`
    return new Date(isoStr) < new Date()
  } catch {
    return false
  }
}

const getPatientName = (patientId) => {
  if (!patientId) return 'Unknown Patient'
  const p = patientStore.patients.find(
    (pt) => String(pt.id ?? pt.Id) === String(patientId),
  )
  if (!p) return 'Unknown Patient'
  const first = p.firstname ?? p.Firstname ?? ''
  const last = p.lastname ?? p.Lastname ?? ''
  return `${first} ${last}`.trim() || 'Unknown Patient'
}

const filtered = computed(() => {
  if (!searchQuery.value) return store.appointments
  const q = searchQuery.value.toLowerCase()
  return store.appointments.filter((a) => {
    const name = (a._patientName || getPatientName(a.patientId)).toLowerCase()
    return (
      (a.reason ?? '').toLowerCase().includes(q) ||
      (a.appointmentId ?? '').toLowerCase().includes(q) ||
      name.includes(q) ||
      (a.date ?? '').includes(q)
    )
  })
})

const upcoming = computed(() => filtered.value.filter((a) => !isExpired(a)))
const closed = computed(() => filtered.value.filter((a) => isExpired(a)))

const tabs = computed(() => [
  { key: 'All', label: 'All', count: filtered.value.length },
  { key: 'Upcoming', label: 'Upcoming', count: upcoming.value.length },
  { key: 'Closed', label: 'Closed', count: closed.value.length },
])

const displayedAppointments = computed(() => {
  let list = filtered.value
  if (activeFilter.value === 'Upcoming') list = upcoming.value
  else if (activeFilter.value === 'Closed') list = closed.value

  // Sort: upcoming first (soonest first), closed after (most-recent first)
  return [...list].sort((a, b) => {
    const aExp = isExpired(a)
    const bExp = isExpired(b)
    if (aExp !== bExp) return aExp ? 1 : -1
    const dateA = new Date(`${a.date ?? ''}T${a.time ?? '00:00'}`)
    const dateB = new Date(`${b.date ?? ''}T${b.time ?? '00:00'}`)
    return aExp ? dateB - dateA : dateA - dateB
  })
})

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

const formatTime = (timeString) => {
  if (!timeString) return 'N/A'
  const [hours, minutes] = timeString.split(':')
  const hour = parseInt(hours)
  return `${hour % 12 || 12}:${minutes} ${hour >= 12 ? 'PM' : 'AM'}`
}

const handleNewAppointment = () => {
  store.resetForm()
  showAppointmentModal.value = true
}

const handleEdit = (appointment) => {
  if (isExpired(appointment)) return
  store.setFormforEdit(appointment)
  showAppointmentModal.value = true
}

const closeAppointmentModal = () => {
  showAppointmentModal.value = false
}

const confirmDelete = (appointment) => {
  appointmentToDelete.value = appointment
  showDeleteModal.value = true
}

const cancelDelete = () => {
  appointmentToDelete.value = null
  showDeleteModal.value = false
}

const handleDelete = async () => {
  if (appointmentToDelete.value) {
    await store.deleteAppointment(
      appointmentToDelete.value.id ?? appointmentToDelete.value.Id,
    )
    showDeleteModal.value = false
    appointmentToDelete.value = null
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
</style>