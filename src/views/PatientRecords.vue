<template>
  <div class="min-h-screen flex font-poppins bg-[#F0F2FF] text-gray-900">
    <!-- Sidebar -->
    <SidebarComponent />

    <!-- Main Content -->
    <div class="main flex-1 ml-[280px] p-10 overflow-auto">
      <!-- Back Button -->
      <button
        @click="goBack"
        class="mb-6 px-5 py-2.5 bg-white text-gray-700 border border-gray-200 rounded-xl font-semibold hover:shadow-md transition-all flex items-center gap-2 text-sm"
      >
        <i class="fa-solid fa-arrow-left text-[#2933FF]"></i>
        Back to Dashboard
      </button>

      <div class="Personalinfo bg-white rounded-2xl shadow-sm p-8 mb-8 border border-white">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div
              class="w-16 h-16 rounded-full bg-gradient-to-r from-[#2933FF] to-[#FF5451] flex items-center justify-center text-white text-2xl font-bold shadow-lg"
            >
              {{ patient?.firstname?.[0] }}{{ patient?.lastname?.[0] }}
            </div>
            <div>
              <h2
                class="text-3xl font-bold bg-gradient-to-r from-[#2933FF] to-[#FF5451] bg-clip-text text-transparent"
              >
                {{ patient?.firstname }} {{ patient?.lastname }}
              </h2>
              <p class="text-gray-500 text-sm mt-1">Patient Medical Records · #{{ patientId }}</p>
            </div>
          </div>
          <div class="flex gap-3">
            <button
              @click="printAllRecords"
              class="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-sm font-semibold rounded-xl transition-all hover:shadow-lg hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <i class="fa-solid fa-print"></i>
              Print All Records
            </button>
            <button
              @click="openAddRecordModal"
              class="px-6 py-3 bg-gradient-to-r from-[#2933FF] to-[#FF5451] text-white text-sm font-semibold rounded-xl transition-all hover:shadow-lg hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <i class="fa-solid fa-plus"></i>
              Add New Record
            </button>
          </div>
        </div>
      </div>

      <div class="PersonalRecords">
        <div class="search mb-8 relative">
          <div class="absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none">
            <i
              class="fa-solid fa-magnifying-glass text-xl bg-gradient-to-r from-[#2933FF] to-[#FF5451] bg-clip-text text-transparent"
            ></i>
          </div>
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search records..."
            class="w-full pl-14 pr-6 py-4 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2933FF]/50 focus:shadow-xl bg-white text-gray-800 placeholder-gray-400 transition-all duration-300 border border-gray-100"
          />
        </div>

        <div v-if="filteredRecords.length === 0" class="text-center py-12 bg-white rounded-2xl shadow-sm">
          <div
            class="w-20 h-20 rounded-full bg-gradient-to-r from-[#2933FF]/10 to-[#FF5451]/10 flex items-center justify-center mx-auto mb-4"
          >
            <i
              class="fa-solid fa-folder-open text-3xl bg-gradient-to-r from-[#2933FF] to-[#FF5451] bg-clip-text text-transparent"
            ></i>
          </div>
          <p class="text-gray-500 text-lg">No records found</p>
        </div>

        <div class="records grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="record in filteredRecords"
            :key="record.id"
            class="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 duration-300 border border-gray-100 group relative overflow-hidden cursor-pointer"
            @click="goToFollowup(record)"
          >
            <div
              class="absolute inset-0 bg-gradient-to-br from-[#2933FF]/5 to-[#FF5451]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            ></div>

            <div class="relative z-10 p-6">
              <div class="flex items-start justify-between mb-4">
                <div class="flex items-center gap-2">
                  <span
                    class="w-10 h-10 rounded-full bg-gradient-to-r from-[#2933FF]/10 to-[#FF5451]/10 flex items-center justify-center"
                  >
                    <i
                      class="fa-solid fa-stethoscope text-sm bg-gradient-to-r from-[#2933FF] to-[#FF5451] bg-clip-text text-transparent"
                    ></i>
                  </span>
                  <div>
                    <h2
                      class="text-xl font-bold bg-gradient-to-r from-[#2933FF] to-[#FF5451] bg-clip-text text-transparent"
                    >
                      {{ record.diagnosis }}
                    </h2>
                    <p class="text-xs text-gray-400 mt-0.5">{{ record.recordId }}</p>
                  </div>
                </div>
                <div class="flex gap-2" @click.stop>
                  <button
                    @click="printSingleRecord(record.id)"
                    class="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center hover:shadow-md transition-all hover:scale-110 active:scale-95"
                    title="Print Record"
                  >
                    <i class="fa-solid fa-print text-xs text-purple-600"></i>
                  </button>
                  <button
                    @click="handleEdit(record)"
                    class="w-8 h-8 rounded-lg bg-gradient-to-r from-[#2933FF]/10 to-[#FF5451]/10 flex items-center justify-center hover:shadow-md transition-all hover:scale-110 active:scale-95"
                    title="Edit Record"
                  >
                    <i
                      class="fa-solid fa-pen-to-square text-xs bg-gradient-to-r from-[#2933FF] to-[#FF5451] bg-clip-text text-transparent"
                    ></i>
                  </button>
                  <button
                    @click="confirmDelete(record)"
                    class="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center hover:shadow-md transition-all hover:scale-110 active:scale-95"
                    title="Delete Record"
                  >
                    <i class="fa-solid fa-trash text-xs text-red-500"></i>
                  </button>
                </div>
              </div>

              <div class="space-y-3">
                <div v-if="record.symptom" class="flex items-start gap-2">
                  <span
                    class="w-8 h-8 rounded-full bg-gradient-to-r from-[#2933FF]/10 to-[#FF5451]/10 flex items-center justify-center flex-shrink-0 mt-1"
                  >
                    <i
                      class="fa-solid fa-user-injured text-xs bg-gradient-to-r from-[#2933FF] to-[#FF5451] bg-clip-text text-transparent"
                    ></i>
                  </span>
                  <div>
                    <h3 class="text-sm font-semibold text-gray-700 mb-1">Symptom</h3>
                    <p class="text-sm text-gray-600 line-clamp-2">{{ record.symptom }}</p>
                  </div>
                </div>

                <div class="flex items-start gap-2">
                  <span
                    class="w-8 h-8 rounded-full bg-gradient-to-r from-[#2933FF]/10 to-[#FF5451]/10 flex items-center justify-center flex-shrink-0 mt-1"
                  >
                    <i
                      class="fa-solid fa-pills text-xs bg-gradient-to-r from-[#2933FF] to-[#FF5451] bg-clip-text text-transparent"
                    ></i>
                  </span>
                  <div>
                    <h3 class="text-sm font-semibold text-gray-700 mb-1">Treatment</h3>
                    <p class="text-sm text-gray-600 line-clamp-2">{{ record.treatment }}</p>
                  </div>
                </div>

                <div v-if="record.notes" class="flex items-start gap-2">
                  <span
                    class="w-8 h-8 rounded-full bg-gradient-to-r from-[#2933FF]/10 to-[#FF5451]/10 flex items-center justify-center flex-shrink-0 mt-1"
                  >
                    <i
                      class="fa-solid fa-notes-medical text-xs bg-gradient-to-r from-[#2933FF] to-[#FF5451] bg-clip-text text-transparent"
                    ></i>
                  </span>
                  <div>
                    <h3 class="text-sm font-semibold text-gray-700 mb-1">Notes</h3>
                    <p class="text-sm text-gray-600 line-clamp-2">{{ record.notes }}</p>
                  </div>
                </div>

                <div class="flex items-center justify-between pt-2 border-t border-gray-100">
                  <div class="flex items-center gap-2">
                    <span
                      class="w-8 h-8 rounded-full bg-gradient-to-r from-[#2933FF]/10 to-[#FF5451]/10 flex items-center justify-center"
                    >
                      <i
                        class="fa-solid fa-calendar text-xs bg-gradient-to-r from-[#2933FF] to-[#FF5451] bg-clip-text text-transparent"
                      ></i>
                    </span>
                    <p class="text-xs text-gray-500">{{ formatDate(record.date) }}</p>
                  </div>
                  <!-- Follow-up count badge -->
                  <span
                    class="text-xs font-semibold px-2.5 py-1 rounded-full bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 border border-emerald-100"
                  >
                    <i class="fa-solid fa-rotate-right mr-1 text-emerald-500"></i>
                    {{ getFollowupCount(record.id) }} follow-up{{ getFollowupCount(record.id) !== 1 ? 's' : '' }}
                  </span>
                </div>

                <!-- CTA hint -->
                <div class="opacity-0 group-hover:opacity-100 transition-opacity pt-1">
                  <p class="text-xs text-center text-[#2933FF] font-semibold">
                    Click to view details &amp; follow-ups →
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Records Handler Modal -->
    <RecordsHandler v-if="showRecordModal" @modalClose="closeRecordModal" />

    <!-- Delete Confirmation Modal -->
    <div
      v-if="showDeleteModal"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-poppins"
    >
      <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-gray-100 p-6">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
            <i class="fa-solid fa-exclamation-triangle text-xl text-red-500"></i>
          </div>
          <div>
            <h3 class="text-xl font-bold text-gray-800">Delete Record</h3>
            <p class="text-sm text-gray-500">This action cannot be undone</p>
          </div>
        </div>
        <p class="text-gray-600 mb-6">
          Are you sure you want to delete the record for
          <span class="font-semibold">{{ recordToDelete?.diagnosis }}</span>?
        </p>
        <div class="flex justify-end gap-3">
          <button
            @click="cancelDelete"
            class="px-6 py-3 bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl transition-all hover:bg-gray-200 hover:shadow-md active:scale-95"
          >
            Cancel
          </button>
          <button
            @click="handleDelete"
            class="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-semibold rounded-xl transition-all hover:shadow-lg hover:scale-105 active:scale-95"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { usePatientRecord } from '@/stores/patientRecord'
import { usePatientStore } from '@/stores/patientsStore'
import { useAuthStore } from '@/stores/authStore'
import { useFollowupStore } from '@/stores/FollowupStore'
import { computed, ref, provide } from 'vue'
import SidebarComponent from '@/components/SidebarComponent.vue'
import RecordsHandler from '@/modals/RecordsHandler.vue'

const route = useRoute()
const router = useRouter()
const patientsStore = usePatientStore()
const patientRecord = usePatientRecord()
const authStore = useAuthStore()
const followupStore = useFollowupStore()

provide('router', router)
provide('route', route)
provide('authStore', authStore)

const patientId = Number(route.params.id)
const searchQuery = ref('')
const showRecordModal = ref(false)
const showDeleteModal = ref(false)
const recordToDelete = ref(null)

const patient = computed(() => {
  return patientsStore.patients.find((p) => p.id === patientId)
})

const records = computed(() => {
  return patientRecord.getpatient(patientId)
})

const filteredRecords = computed(() => {
  if (!searchQuery.value) return records.value
  const query = searchQuery.value.toLowerCase()
  return records.value.filter(
    (record) =>
      record.diagnosis?.toLowerCase().includes(query) ||
      record.symptom?.toLowerCase().includes(query) ||
      record.treatment?.toLowerCase().includes(query) ||
      record.notes?.toLowerCase().includes(query) ||
      record.recordId?.toLowerCase().includes(query),
  )
})

const getFollowupCount = (recordId) => {
  return followupStore.followups.filter(
    f => String(f.patientId) === String(patientId) && String(f.recordId) === String(recordId)
  ).length
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

const goBack = () => {
  router.push({ name: 'home' })
}

const goToFollowup = (record) => {
  router.push({
    name: 'record',
    params: {
      patientId: patientId,
      recordId: record.id,
    },
  })
}

const printAllRecords = () => {
  router.push({ name: 'printview', params: { patientId: patientId } })
}

const printSingleRecord = (recordId) => {
  router.push({ name: 'printview', params: { patientId: patientId, recordId: recordId } })
}

const openAddRecordModal = () => {
  patientRecord.resetRecordForm()
  showRecordModal.value = true
}

const handleEdit = (record) => {
  patientRecord.setFormforEdit(record)
  showRecordModal.value = true
}

const closeRecordModal = () => {
  showRecordModal.value = false
}

const confirmDelete = (record) => {
  recordToDelete.value = record
  showDeleteModal.value = true
}

const cancelDelete = () => {
  recordToDelete.value = null
  showDeleteModal.value = false
}

const handleDelete = async () => {
  if (recordToDelete.value) {
    await patientRecord.deleteRecord(recordToDelete.value.id)
    showDeleteModal.value = false
    recordToDelete.value = null
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>