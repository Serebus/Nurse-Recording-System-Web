<template>
  <div class="min-h-screen flex font-poppins bg-[#F0F2FF] text-gray-900">
    <SidebarComponent />

    <div class="main flex-1 ml-[280px] overflow-auto">

      <!-- Top bar -->
      <div class="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100 px-10 py-5 flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-extrabold bg-gradient-to-r from-[#2933FF] to-[#FF5451] bg-clip-text text-transparent tracking-tight">
            Patients
          </h1>
          <p class="text-xs text-gray-400 mt-0.5">{{ store.filteredpatients.length }} registered</p>
        </div>
        <button
          @click="openAddPatientModal"
          class="group flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#2933FF] to-[#FF5451] text-white text-sm font-semibold rounded-xl shadow hover:shadow-lg hover:scale-105 active:scale-95 transition-all"
        >
          <i class="fa-solid fa-user-plus text-xs group-hover:rotate-12 transition-transform"></i>
          Add Patient
        </button>
      </div>

      <div class="p-10">

        <!-- Search -->
        <div class="relative mb-8">
          <i class="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 text-sm"></i>
          <input
            type="text"
            v-model="store.searchterm"
            placeholder="Search by name, email, or contact..."
            class="w-full pl-11 pr-5 py-3.5 bg-white rounded-2xl border border-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2933FF]/30 focus:border-[#2933FF]/40 text-sm text-gray-700 placeholder-gray-300 transition-all"
          />
        </div>

        <!-- Empty state -->
        <div v-if="store.filteredpatients.length === 0" class="flex flex-col items-center justify-center py-24">
          <div class="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#2933FF]/10 to-[#FF5451]/10 flex items-center justify-center mb-4 shadow-inner">
            <i class="fa-solid fa-users-slash text-2xl bg-gradient-to-r from-[#2933FF] to-[#FF5451] bg-clip-text text-transparent"></i>
          </div>
          <p class="text-gray-400 font-medium">No patients found</p>
          <p class="text-gray-300 text-sm mt-1">Try a different search or add a new patient</p>
        </div>

        <!-- Patient Grid -->
        <div class="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="patient in store.filteredpatients"
            :key="patient.id"
            @click="patientsrecord(patient.id)"
            class="group cursor-pointer bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
          >
            <!-- Card top accent -->
            <div class="h-1.5 w-full bg-gradient-to-r from-[#2933FF] to-[#FF5451] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            <div class="p-6 flex flex-col flex-1">
              <!-- Avatar + name -->
              <div class="flex items-center gap-4 mb-5">
                <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#2933FF] to-[#FF5451] flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-md">
                  {{ (patient.firstname?.[0] ?? '') }}{{ (patient.lastname?.[0] ?? '') }}
                </div>
                <div class="min-w-0">
                  <h3 class="font-bold text-gray-800 leading-tight truncate">
                    {{ patient.firstname }}
                    {{ patient.middlename ? patient.middlename + ' ' : '' }}{{ patient.lastname }}
                  </h3>
                  <p class="text-xs text-gray-400 mt-0.5">ID #{{ patient.id }}</p>
                </div>
              </div>

              <!-- Info rows -->
              <div class="space-y-2.5 flex-1 mb-5">
                <div class="flex items-center gap-3 text-sm text-gray-600">
                  <span class="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <i class="fa-solid fa-phone text-[10px] text-[#2933FF]"></i>
                  </span>
                  <span class="truncate">{{ patient.emergencyContact || '—' }}</span>
                </div>
                <div class="flex items-center gap-3 text-sm text-gray-600">
                  <span class="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                    <i class="fa-solid fa-envelope text-[10px] text-[#FF5451]"></i>
                  </span>
                  <span class="truncate">{{ patient.email || '—' }}</span>
                </div>
                <div v-if="patient.address" class="flex items-center gap-3 text-sm text-gray-600">
                  <span class="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <i class="fa-solid fa-location-dot text-[10px] text-[#2933FF]"></i>
                  </span>
                  <span class="truncate">{{ patient.address }}</span>
                </div>
              </div>

              <!-- Divider -->
              <div class="border-t border-gray-100 pt-4 flex items-center justify-between">
                <span class="text-xs text-[#2933FF] font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  View records <i class="fa-solid fa-arrow-right text-[10px]"></i>
                </span>
                <div class="flex gap-2" @click.stop>
                  <button
                    @click="handleEdit(patient)"
                    class="w-8 h-8 rounded-lg bg-blue-50 hover:bg-blue-100 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                    title="Edit"
                  >
                    <i class="fa-solid fa-pen text-[11px] text-[#2933FF]"></i>
                  </button>
                  <button
                    @click="confirmDelete(patient)"
                    class="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                    title="Delete"
                  >
                    <i class="fa-solid fa-trash text-[11px] text-red-500"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <PatientHandlerModal v-if="showPatientModal" @modalClose="closePatientModal" />

    <!-- Delete Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-gray-100 p-6">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
            <i class="fa-solid fa-exclamation-triangle text-xl text-red-500"></i>
          </div>
          <div>
            <h3 class="text-lg font-bold text-gray-800">Delete Patient</h3>
            <p class="text-sm text-gray-400">This action cannot be undone</p>
          </div>
        </div>
        <p class="text-gray-600 text-sm mb-6">
          Are you sure you want to delete
          <span class="font-semibold text-gray-800">{{ patientToDelete?.firstname }} {{ patientToDelete?.lastname }}</span>?
        </p>
        <div class="flex justify-end gap-3">
          <button @click="cancelDelete" class="px-5 py-2.5 bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-200 transition-all active:scale-95">
            Cancel
          </button>
          <button @click="handleDelete" class="px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:scale-105 active:scale-95 transition-all">
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, provide } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { usePatientStore } from '@/stores/patientsStore'
import { useAuthStore } from '@/stores/authStore'
import SidebarComponent from '@/components/SidebarComponent.vue'
import PatientHandlerModal from '@/modals/PatientHandler.vue'

const store = usePatientStore()
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

provide('router', router)
provide('route', route)
provide('authStore', authStore)

const showPatientModal = ref(false)
const showDeleteModal = ref(false)
const patientToDelete = ref(null)

const patientsrecord = (id) => router.push({ name: 'patientrecords', params: { id } })

const openAddPatientModal = () => {
  store.resetForm()
  showPatientModal.value = true
}

const handleEdit = (patient) => {
  store.setFormforEdit(patient)
  showPatientModal.value = true
}

const closePatientModal = () => {
  showPatientModal.value = false
}

const confirmDelete = (patient) => {
  patientToDelete.value = patient
  showDeleteModal.value = true
}

const cancelDelete = () => {
  patientToDelete.value = null
  showDeleteModal.value = false
}

const handleDelete = async () => {
  if (patientToDelete.value) {
    await store.deletePatient(patientToDelete.value.id ?? patientToDelete.value.Id)
    showDeleteModal.value = false
    patientToDelete.value = null
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
</style>