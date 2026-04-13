import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import { useAuthStore } from './authStore.js'

export const usePatientStore = defineStore('patientStore', () => {
  const authStore = useAuthStore()
  const searchterm = ref('')
  const patients = ref([])

  const getHeaders = () => {
    const token = localStorage.getItem('token')
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  }

const fetchPatients = async () => {
  try {
    const response = await fetch('/api/patients', {
      headers: getHeaders()
    })
    if (!response.ok) throw new Error('Failed to fetch patients')
    const apiPatients = await response.json();
    patients.value = apiPatients.map(p => ({
      ...p,
      id: p.Id || p.id,
      email: p.Email || p.email || ''
    }));
    console.log('Patients fetched successfully')
  } catch (error) {
    console.error('Error fetching patients:', error)
  }
}


watch(() => authStore.isAuthenticated, (isAuth) => {
  if (isAuth) fetchPatients()
  else patients.value = []
}, { immediate: true })



  const formPatient = ref({
    id: null,
    firstname: '',
    middlename: '',
    lastname: '',
    address: '',
    password: '',
    facebook: '',
    email: '',
    emergencyContact: ''.toString(),
  })

  const resetForm = () => {
    formPatient.value = {
      id: null,
      firstname: '',
      middlename: '',
      lastname: '',
      address: '',
      password: '',
      facebook: '',
      email: '',
      emergencyContact: '',
    }
  }

  const isEditMode = computed(() => !!formPatient.value.id || !!formPatient.value.Id)

  const setFormforEdit = (patient) => {
    formPatient.value = { ...patient }
    formPatient.value.id = patient.Id || patient.id
  }

  const filteredpatients = computed(() => {
    const term = searchterm.value.toLowerCase()
    return patients.value.filter((patient) =>
      Object.values(patient).some((val) => String(val).toLowerCase().includes(term)),
    )
  })

  const toPascalCase = (obj) => {
    const pascal = {}
    for (const [key, value] of Object.entries(obj)) {
      const pascalKey = key.charAt(0).toUpperCase() + key.slice(1)
      pascal[pascalKey] = value
    }
    // Remove Id for POST (backend auto-generates)
    delete pascal.Id
    return pascal
  }

  const addPatient = async (newPatient) => {
    try {
      const patientData = toPascalCase(newPatient)
      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(patientData),
      })
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Backend error:', errorText)
        throw new Error(`Failed to add patient: ${errorText}`)
      }

      const addedPatient = await response.json()
      patients.value.push(addedPatient)
      console.log(
        `Patient ${addedPatient.Firstname} ${addedPatient.Middlename} ${addedPatient.Lastname} added successfully`,
      )
      return true
    } catch (error) {
      console.error('Error adding patient:', error)
      return false
    }
  }

  const existingPatientDetails = (newPatient) => {
    const currentId = newPatient.id || newPatient.Id;
    const patientExist = patients.value.some(
      (p) =>
        (p.Id !== currentId && p.id !== currentId) &&
        (p.Firstname || p.firstname) === newPatient.firstname &&
        (p.Lastname || p.lastname) === newPatient.lastname &&
        (p.Middlename || p.middlename) === newPatient.middlename,
    )
    if (patientExist) {
      console.error(
        `Patient ${newPatient.firstname} ${newPatient.middlename} ${newPatient.lastname} already exist`,
      )
      return false
    }
    return true
  }

  const deletePatient = async (id) => {
    try {
      const response = await fetch(`/api/patients/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      })
      if (!response.ok) throw new Error('Failed to delete patient')
      patients.value = patients.value.filter((patient) => patient.Id !== id)
      console.log(`Patient with ID ${id} has been deleted`)
      return true
    } catch (error) {
      console.error('Error deleting patient:', error)
      return false
    }
  }

  const editPatient = async (id, updatedPatient) => {
    try {
      const patientData = toPascalCase(updatedPatient)
      patientData.Id = id // Re-add Id for PUT request since toPascalCase deletes it
      const response = await fetch(`/api/patients/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(patientData),
      })
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Backend error:', errorText)
        throw new Error('Failed to update patient')
      }

      // Check if the response actually has a body before parsing it as JSON
      const responseText = await response.text()
      const updatedData = responseText ? JSON.parse(responseText) : { ...patientData, id: id, email: patientData.Email || updatedPatient.email }

      const index = patients.value.findIndex((patient) => patient.Id == id || patient.id == id)
      if (index !== -1) {
        patients.value[index] = { ...patients.value[index], ...updatedData }
        console.log(`Patient with ID ${id} has been updated`)
      }
      
      return true
    } catch (error) {
      console.error('Error updating patient:', error)
      return false
    }
  }

  const submitPatient = async () => {
    if (
      !emailVerification(formPatient.value) ||
      !phoneVerification(formPatient.value) ||
      !existingPatientDetails(formPatient.value)
    ) {
      return false
    }

    let success
    if (isEditMode.value) {
      success = await editPatient(formPatient.value.id || formPatient.value.Id, formPatient.value)
    } else {
      success = await addPatient(formPatient.value)
    }
    if (success) resetForm()
    return success
  }

  const emailVerification = (patient) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (isEditMode.value) return true

    const emailExist = patients.value.some((p) => p.email === patient.email)

    if (patient.email && emailExist) {
      console.error(`Patient email ${patient.email} is already in use`)
      return false
    }
    if (patient.email && !emailRegex.test(patient.email)) {
      console.error(`Patient Email ${patient.email} is not a valid format`)
      return false
    }
    return true
  }

  const phoneVerification = (newPatient) => {
    const phoneNumber = String(newPatient.emergencyContact)
    if (phoneNumber.length !== 11) {
      console.error(
        `Patient phone number: ${newPatient.emergencyContact} should be 11 characters long`,
      )
      return false
    }
    return true
  }

  return {
    searchterm,
    patients,
    filteredpatients,
    formPatient,
    isEditMode,
    deletePatient,
    setFormforEdit,
    submitPatient,
    resetForm,
  }
})
