import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useAuthStore } from './authStore.js'

export const usePatientRecord = defineStore('patientRecord', () => {
  const authStore = useAuthStore()

  const getHeaders = () => {
    const token = localStorage.getItem('token')
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  const patientRecords = ref([])

  const normalizeRecord = (r) => ({
    id: r.id ?? r.Id ?? null,
    Id: r.Id ?? r.id ?? null,
    recordId: r.recordId ?? r.RecordId ?? '',
    RecordId: r.RecordId ?? r.recordId ?? '',
    patientId: String(r.patientId ?? r.PatientId ?? ''),
    PatientId: Number(r.PatientId ?? r.patientId ?? 0),
    patient: r.patient ?? r.Patient ?? null,
    Patient: r.Patient ?? r.patient ?? null,
    date: r.date ?? r.Date ?? '',
    Date: r.Date ?? r.date ?? '',
    diagnosis: r.diagnosis ?? r.Diagnosis ?? '',
    Diagnosis: r.Diagnosis ?? r.diagnosis ?? '',
    symptom: r.symptom ?? r.Symptom ?? '',
    Symptom: r.Symptom ?? r.symptom ?? '',
    treatment: r.treatment ?? r.Treatment ?? '',
    Treatment: r.Treatment ?? r.treatment ?? '',
    notes: r.notes ?? r.Notes ?? '',
    Notes: r.Notes ?? r.notes ?? '',
    closed: Boolean(r.closed ?? r.Closed ?? false),
    Closed: Boolean(r.Closed ?? r.closed ?? false),
  })

  const buildRecordPayload = (record, idOverride = null) => ({
    Id: idOverride ?? Number(record.Id ?? record.id ?? 0),
    RecordId: record.RecordId ?? record.recordId ?? '',
    PatientId: Number(record.PatientId ?? record.patientId ?? 0),
    Patient: record.Patient ?? record.patient ?? { Id: Number(record.PatientId ?? record.patientId ?? 0) },
    Date: record.Date ?? record.date ?? null,
    Diagnosis: record.Diagnosis ?? record.diagnosis ?? '',
    Symptom: record.Symptom ?? record.symptom ?? '',
    Treatment: record.Treatment ?? record.treatment ?? '',
    Notes: record.Notes ?? record.notes ?? '',
    Closed: Boolean(record.closed ?? record.Closed ?? false),
  })

  const fetchRecords = async () => {
    try {
      const response = await fetch('/api/patientrecords', { headers: getHeaders() })
      if (!response.ok) throw new Error('Failed to fetch patient records')
      const data = await response.json()
      patientRecords.value = data.map(normalizeRecord)
      console.log('Patient records fetched.')
    } catch (error) {
      console.error('Error fetching patient records:', error)
    }
  }

  watch(
    () => authStore.isAuthenticated,
    (isAuth) => {
      if (isAuth) fetchRecords()
      else patientRecords.value = []
    },
    { immediate: true },
  )

  const recordForm = ref({
    id: null,
    patientId: '',
    recordId: '',
    date: '',
    diagnosis: '',
    symptom: '',
    treatment: '',
    notes: '',
    closed: false,
  })

  const resetRecordForm = () => {
    recordForm.value = {
      id: null,
      patientId: '',
      recordId: '',
      date: '',
      diagnosis: '',
      symptom: '',
      treatment: '',
      notes: '',
      closed: false,
    }
  }

  const isEditMode = computed(() => !!recordForm.value.id)

  const setFormforEdit = (record) => {
    recordForm.value = { ...record }
  }

  const getpatient = (id) =>
    patientRecords.value.filter((r) => String(r.patientId ?? r.PatientId) === String(id))

  const getNextRecordId = () => {
    const maxNum = patientRecords.value.reduce((max, r) => {
      if (r.recordId?.startsWith('R-')) {
        const n = parseInt(r.recordId.substring(2), 10)
        return n > max ? n : max
      }
      return max
    }, 0)
    return 'R-' + (maxNum + 1).toString().padStart(3, '0')
  }

  const addRecord = async (newRecord) => {
    const normalized = normalizeRecord(newRecord)
    if (!normalized.recordId) {
      normalized.recordId = getNextRecordId()
      normalized.RecordId = normalized.recordId
    }
    try {
      const response = await fetch('/api/patientrecords', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(buildRecordPayload(normalized, 0)),
      })
      if (!response.ok) throw new Error('Failed to add record')
      const added = normalizeRecord(await response.json())
      patientRecords.value.push(added)
      return true
    } catch (error) {
      console.error('Error adding record:', error)
      return false
    }
  }

  const editRecord = async (id, updatedRecord) => {
    const serverId = Number(id)
    const payload = buildRecordPayload(updatedRecord, serverId)
    try {
      const response = await fetch(`/api/patientrecords/${serverId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      })
      if (!response.ok) throw new Error('Failed to update record')

      const index = patientRecords.value.findIndex(
        (r) => Number(r.id ?? r.Id) === serverId,
      )
      if (index !== -1) {
        patientRecords.value[index] = normalizeRecord({
          ...patientRecords.value[index],
          ...payload,
          id: serverId,
          Id: serverId,
        })
      }
      return true
    } catch (error) {
      console.error('Error updating record:', error)
      return false
    }
  }

  /**
   * Toggle closed status with optimistic update.
   * Changes the UI instantly, persists to API, rolls back on failure.
   */
  const toggleRecordClosed = async (record) => {
    const serverId = Number(record.id ?? record.Id)
    const newClosed = !record.closed

    const index = patientRecords.value.findIndex(
      (r) => Number(r.id ?? r.Id) === serverId,
    )
    if (index === -1) return false

    // Apply immediately so the UI responds without waiting for the network
    patientRecords.value[index] = {
      ...patientRecords.value[index],
      closed: newClosed,
      Closed: newClosed,
    }

    const payload = buildRecordPayload(patientRecords.value[index], serverId)

    try {
      const response = await fetch(`/api/patientrecords/${serverId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        // Rollback
        patientRecords.value[index] = {
          ...patientRecords.value[index],
          closed: !newClosed,
          Closed: !newClosed,
        }
        console.error('Failed to toggle record closed status')
        return false
      }
      return true
    } catch (error) {
      // Rollback
      patientRecords.value[index] = {
        ...patientRecords.value[index],
        closed: !newClosed,
        Closed: !newClosed,
      }
      console.error('Error toggling record closed:', error)
      return false
    }
  }

  const deleteRecord = async (id) => {
    try {
      const response = await fetch(`/api/patientrecords/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      })
      if (!response.ok) throw new Error('Failed to delete record')
      patientRecords.value = patientRecords.value.filter(
        (r) => Number(r.id ?? r.Id) !== Number(id),
      )
      return true
    } catch (error) {
      console.error('Error deleting record:', error)
      return false
    }
  }

  const submitRecord = async () => {
    const success = isEditMode.value
      ? await editRecord(recordForm.value.id, recordForm.value)
      : await addRecord(recordForm.value)
    if (success) resetRecordForm()
    return success
  }

  return {
    patientRecords,
    recordForm,
    isEditMode,
    resetRecordForm,
    setFormforEdit,
    getpatient,
    deleteRecord,
    submitRecord,
    fetchRecords,
    toggleRecordClosed,
  }
})