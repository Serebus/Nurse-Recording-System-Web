import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const API_BASE_URL = 'http://localhost:3000'

export const useFollowupStore = defineStore('followupStore', () => {
  const followups = ref([])

  const fetchFollowups = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/followups`)
      if (!response.ok) throw new Error('Failed to fetch follow-ups')
      followups.value = await response.json()
      console.log('Follow-ups fetched successfully')
    } catch (error) {
      console.error('Error fetching follow-ups:', error)
    }
  }

  fetchFollowups()

  const FollowupForm = ref({
    id: null,
    patientId: '',
    recordId: '',
    date: '',
    diagnosis: '',
    new_diagnostic: '',
    symptom: '',
    new_symptom: '',
    treatment: '',
    additional_treatment: '',
    notes: '',
  })

  const resetFollowupForm = () => {
    FollowupForm.value = {
      id: null,
      patientId: '',
      recordId: '',
      date: '',
      diagnosis: '',
      new_diagnostic: '',
      symptom: '',
      new_symptom: '',
      treatment: '',
      additional_treatment: '',
      notes: '',
    }
  }

  const addFollowup = async (newFollowup) => {
    try {
      const response = await fetch(`${API_BASE_URL}/followups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFollowup),
      })
      if (!response.ok) throw new Error('Failed to add follow-up')

      const addedFollowup = await response.json()
      console.log('Follow-up added successfully:', addedFollowup)
      fetchFollowups()
      return true
    } catch (error) {
      console.error('Error adding follow-up:', error)
      return false
    }
  }

  const deleteFollowup = async (id) => {
    const followup = followups.value.find((f) => f.id === id)
    if (!followup) {
      console.error('Follow-up not found:', id)
      return false
    }
    try {
      const response = await fetch(`${API_BASE_URL}/followups/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete follow-up')
      fetchFollowups()
      return true
    } catch (error) {
      console.error('Error deleting follow-up:', error)
      return false
    }
  }

  const isEditMode = computed(() => FollowupForm.value.id !== null)

  const setFormforEdit = (followup) => {
    FollowupForm.value = { ...followup }
  }

  const editFollowup = async (id, updatedFollowup) => {
    const serverID = id
    const followupToPut = { ...updatedFollowup }
    delete followupToPut.id

    try {
      const response = await fetch(`${API_BASE_URL}/followups/${serverID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(followupToPut),
      })
      if (!response.ok) throw new Error('Failed to update follow-up')

      const updatedData = await response.json()
      const index = followups.value.findIndex((f) => f.id === id)
      if (index !== -1) {
        followups.value[index] = updatedData
        console.log(`Follow-up with ID ${id} has been updated.`)
      }
      return true
    } catch (error) {
      console.error('Error updating follow-up:', error)
      return false
    }
  }

  const submitFollowupForm = async () => {
    if (isEditMode.value) {
      return await editFollowup(FollowupForm.value.id, FollowupForm.value)
    } else {
      const payload = { ...FollowupForm.value }
      delete payload.id
      return await addFollowup(payload)
    }
  }

  return {
    followups,
    FollowupForm,
    isEditMode,
    fetchFollowups,
    resetFollowupForm,
    setFormforEdit,
    submitFollowupForm,
    deleteFollowup,
  }
})