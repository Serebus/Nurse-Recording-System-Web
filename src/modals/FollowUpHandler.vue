<template>
  <div
    class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-poppins"
    @click.self="closeModal"
  >
    <div
      class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto border border-gray-100"
    >
      <!-- Header -->
      <div class="sticky top-0 bg-white border-b border-gray-100 p-6 rounded-t-2xl z-10">
        <div class="flex items-center justify-between">
          <div>
            <h2
              class="text-2xl font-bold bg-gradient-to-r from-[#2933FF] to-[#FF5451] bg-clip-text text-transparent"
            >
              {{ store.isEditMode ? 'Edit Follow-up' : 'New Follow-up' }}
            </h2>
            <p class="text-sm text-gray-500 mt-1">
              {{
                store.isEditMode ? 'Update follow-up details below' : 'Record a new follow-up visit'
              }}
            </p>
          </div>
          <button
            @click="closeModal"
            class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-all hover:scale-110 active:scale-95"
          >
            <i class="fa-solid fa-xmark text-gray-600"></i>
          </button>
        </div>
      </div>

      <form @submit.prevent="submitHandler" class="p-6 space-y-5">
        <!-- Date -->
        <div class="form-group">
          <label class="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <i class="fa-solid fa-calendar text-[#2933FF]"></i>
            Follow-up Date:
          </label>
          <input
            type="date"
            v-model="store.FollowupForm.date"
            required
            class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2933FF]/50 focus:border-transparent transition-all text-gray-800"
          />
        </div>

        <!-- Symptoms row -->
        <div class="grid grid-cols-2 gap-4">
          <div class="form-group">
            <label class="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <i class="fa-solid fa-user-injured text-[#2933FF]"></i>
              Previous Symptom:
            </label>
            <textarea
              v-model="store.FollowupForm.symptom"
              rows="3"
              placeholder="Carry over from initial record..."
              class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2933FF]/50 focus:border-transparent transition-all resize-none text-gray-800 placeholder-gray-400"
            ></textarea>
          </div>
          <div class="form-group">
            <label class="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <i class="fa-solid fa-plus-circle text-orange-500"></i>
              New Symptom:
            </label>
            <textarea
              v-model="store.FollowupForm.new_symptom"
              rows="3"
              placeholder="Any new or changed symptoms..."
              class="w-full px-4 py-3 rounded-xl border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-300/50 focus:border-transparent transition-all resize-none text-gray-800 placeholder-gray-400"
            ></textarea>
          </div>
        </div>

        <!-- Diagnosis row -->
        <div class="grid grid-cols-2 gap-4">
          <div class="form-group">
            <label class="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <i class="fa-solid fa-stethoscope text-[#2933FF]"></i>
              Previous Diagnosis:
            </label>
            <textarea
              v-model="store.FollowupForm.diagnosis"
              rows="3"
              placeholder="From the original record..."
              class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2933FF]/50 focus:border-transparent transition-all resize-none text-gray-800 placeholder-gray-400"
            ></textarea>
          </div>
          <div class="form-group">
            <label class="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <i class="fa-solid fa-plus-circle text-orange-500"></i>
              Updated Diagnosis:
            </label>
            <textarea
              v-model="store.FollowupForm.new_diagnostic"
              rows="3"
              placeholder="Revised or new diagnostic..."
              class="w-full px-4 py-3 rounded-xl border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-300/50 focus:border-transparent transition-all resize-none text-gray-800 placeholder-gray-400"
            ></textarea>
          </div>
        </div>

        <!-- Treatment row -->
        <div class="grid grid-cols-2 gap-4">
          <div class="form-group">
            <label class="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <i class="fa-solid fa-pills text-[#FF5451]"></i>
              Previous Treatment:
            </label>
            <textarea
              v-model="store.FollowupForm.treatment"
              rows="3"
              placeholder="Ongoing treatments..."
              class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2933FF]/50 focus:border-transparent transition-all resize-none text-gray-800 placeholder-gray-400"
            ></textarea>
          </div>
          <div class="form-group">
            <label class="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <i class="fa-solid fa-plus-circle text-emerald-500"></i>
              Additional Treatment:
            </label>
            <textarea
              v-model="store.FollowupForm.additional_treatment"
              rows="3"
              placeholder="New or additional treatments..."
              class="w-full px-4 py-3 rounded-xl border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-300/50 focus:border-transparent transition-all resize-none text-gray-800 placeholder-gray-400"
            ></textarea>
          </div>
        </div>

        <!-- Notes -->
        <div class="form-group">
          <label class="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <i class="fa-solid fa-notes-medical text-[#2933FF]"></i>
            Notes:
          </label>
          <textarea
            v-model="store.FollowupForm.notes"
            rows="3"
            placeholder="Additional observations or instructions..."
            class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2933FF]/50 focus:border-transparent transition-all resize-none text-gray-800 placeholder-gray-400"
          ></textarea>
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            @click="closeModal"
            type="button"
            class="px-6 py-3 bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl transition-all hover:bg-gray-200 active:scale-95"
          >
            <i class="fa-solid fa-xmark mr-1"></i>
            Cancel
          </button>
          <button
            type="submit"
            class="px-6 py-3 bg-gradient-to-r from-[#2933FF] to-[#FF5451] text-white text-sm font-semibold rounded-xl transition-all hover:shadow-lg hover:scale-105 active:scale-95"
          >
            <i class="fa-solid fa-check mr-1"></i>
            {{ store.isEditMode ? 'Update Follow-up' : 'Save Follow-up' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { useFollowupStore } from '@/stores/FollowupStore'

const store = useFollowupStore()
const emit = defineEmits(['modalClose', 'saved'])

const closeModal = () => {
  emit('modalClose')
}

const submitHandler = async () => {
  const success = await store.submitFollowupForm()
  if (success) {
    emit('saved')
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
</style>
