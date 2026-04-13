import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useAuthStore } from './authStore.js'

export const usePatientRecord = defineStore('patientRecord', () => {
  const authStore = useAuthStore()

  const getHeaders = () => {
    const token = localStorage.getItem('token')
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
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
  })

  const buildRecordPayload = (record, idOverride = null) => {
    const patientIdNum = Number(record.patientId ?? record.PatientId ?? 0)
    const dateValue = record.Date ?? record.date ?? null
    const diagnosis = record.Diagnosis ?? record.diagnosis ?? ''
    const symptom = record.Symptom ?? record.symptom ?? ''
    const treatment = record.Treatment ?? record.treatment ?? ''
    const notes = record.Notes ?? record.notes ?? ''
    const recordId = record.RecordId ?? record.recordId ?? ''
    const existingPatient = record.Patient ?? record.patient ?? null

    return {
      Id: idOverride ?? Number(record.Id ?? record.id ?? 0),
      RecordId: recordId,
      PatientId: patientIdNum,
      Patient: existingPatient || { Id: patientIdNum },
      Date: dateValue,
      Diagnosis: diagnosis,
      Symptom: symptom,
      Treatment: treatment,
      Notes: notes,
    }
  }

  // --- API Fetching ---
  const fetchRecords = async () => {
    try {
      const response = await fetch('/api/patientrecords', {
        headers: getHeaders()
      })
      if (!response.ok) throw new Error('Failed to fetch patient records')
      const data = await response.json()
      patientRecords.value = data.map(normalizeRecord)
      console.log('Patient records data fetched from API.')
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
  { immediate: true }
)

  // Re-introduced 'recordId' as the human-readable ID
  const recordForm = ref({
    id: null, // Server's auto-increment ID (internal)
    patientId: '',
    recordId: '', // Human-readable generated ID (e.g., R-001)
    date: '',
    diagnosis: '',
    symptom: '',
    treatment: '',
    notes: '',
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
    }
  }

  // Check against 'id' property
  const isEditMode = computed(() => !!recordForm.value.id)

  const setFormforEdit = (record) => {
    // Record fetched from API now must have both 'id' and 'recordId'
    recordForm.value = { ...record }
  }

  // This correctly filters records by the associated patientId
  const getpatient = (id) => {
    return patientRecords.value.filter((r) => String(r.patientId ?? r.PatientId) === String(id))
  }

  // Helper to generate the next sequential ID (R-001, R-002, etc.)
  const getNextRecordId = () => {
    const records = patientRecords.value
    if (records.length === 0) {
      return 'R-001'
    }

    // Find the highest number used in existing recordIds
    const maxNum = records.reduce((max, record) => {
      if (
        record.recordId &&
        typeof record.recordId === 'string' &&
        record.recordId.startsWith('R-')
      ) {
        const num = parseInt(record.recordId.substring(2), 10)
        return num > max ? num : max
      }
      return max
    }, 0)

    const nextNum = maxNum + 1
    // Format as R-padded number
    return 'R-' + nextNum.toString().padStart(3, '0')
  }

  // --- CRUD: Add Record ---
  const addRecord = async (newRecord) => {
    const normalized = normalizeRecord(newRecord)
    if (!normalized.recordId) {
      normalized.recordId = getNextRecordId()
      normalized.RecordId = normalized.recordId
    }

    const recordToPost = buildRecordPayload(normalized, 0)

    try {
      const response = await fetch('/api/patientrecords', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(recordToPost),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Server response error:', errorText)
        throw new Error('Failed to add record')
      }

      const addedRecord = normalizeRecord(await response.json())
      patientRecords.value.push(addedRecord)

      console.log(
        `Record ${addedRecord.recordId || addedRecord.RecordId} for patient ${normalized.patientId} added successfully.`,
      )
      return true
    } catch (error) {
      console.error('Error adding record:', error)
      return false
    }
  }

  // --- CRUD: Edit Record ---
  const editRecord = async (id, updatedRecord) => {
    const serverId = Number(id)
    const recordToPut = buildRecordPayload(updatedRecord, serverId)

    try {
      const response = await fetch(`/api/patientrecords/${serverId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(recordToPut),
      })
      if (!response.ok) throw new Error('Failed to update record')

      const index = patientRecords.value.findIndex(
        (record) => Number(record.id ?? record.Id) === serverId
      )
      if (index !== -1) {
        patientRecords.value[index] = normalizeRecord({ ...patientRecords.value[index], ...recordToPut, id: serverId, Id: serverId })
        console.log(`Record with ID ${id} has been updated.`)
      }
      return true
    } catch (error) {
      console.error('Error updating record:', error)
      return false
    }
  }

  // --- CRUD: Delete Record ---
  const deleteRecord = async (id) => {
    const serverId = id // The id passed is the server's primary key

    try {
      const response = await fetch(`/api/patientrecords/${serverId}`, {
        method: 'DELETE',
        headers: getHeaders()
      })
      if (!response.ok) throw new Error('Failed to delete record')

      // Filter based on the server 'id'
      patientRecords.value = patientRecords.value.filter((record) => Number(record.id ?? record.Id) !== Number(id))
      console.log(`Record with ${id} has been deleted.`)
      return true
    } catch (error) {
      console.error('Error deleting record:', error)
      return false
    }
  }

  const submitRecord = async () => {
    let success = false
    if (isEditMode.value) {
      // Use form's 'id' property (server ID)
      success = await editRecord(recordForm.value.id, recordForm.value)
    } else {
      success = await addRecord(recordForm.value)
    }
    if (success) {
      resetRecordForm()
    }
    return success
  }

  // Updated return object to reflect the use of 'id' in the records
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
  }
})
