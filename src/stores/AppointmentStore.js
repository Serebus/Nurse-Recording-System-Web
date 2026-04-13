import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { usePatientStore } from './patientsStore'
import { useAuthStore } from './authStore.js'

export const useAppointmentStore = defineStore('appointmentStore', () => {
  const patientStore = usePatientStore()
  const authStore = useAuthStore()
  const appointments = ref([])

  const getHeaders = () => {
    const token = localStorage.getItem('token')
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  const patientSearchTerm = ref('')
  const selectedPatientId = ref(null)

  const appointmentsForm = ref({
    id: null,
    appointmentId: null,
    patientId: null,
    date: '',
    time: '',
    reason: '',
  })

  // --- ID Generation Logic ---
  const generateAppointmentId = () => {
    if (appointments.value.length === 0) {
      return 'P-001'
    }

    // Find the appointment with the highest sequential number
    const lastAppointment = appointments.value.reduce(
      (latest, current) => {
        if (!latest.appointmentId || !current.appointmentId) return latest

        const latestNum = parseInt(latest.appointmentId.split('-')[1])
        const currentNum = parseInt(current.appointmentId.split('-')[1])

        return currentNum > latestNum ? current : latest
      },
      { appointmentId: 'P-000' },
    )

    const lastId = lastAppointment.appointmentId
    const numberPart = parseInt(lastId.split('-')[1])
    const nextNumber = numberPart + 1

    // Pad the number with leading zeros
    const nextId = 'P-' + String(nextNumber).padStart(3, '0')
    return nextId
  }
  // ----------------------------

  const resetForm = () => {
    appointmentsForm.value = {
      id: null,
      appointmentId: null,
      patientId: null,
      date: '',
      time: '',
      reason: '',
    }
    selectedPatientId.value = null
    patientSearchTerm.value = ''
  }

  const isEditMode = computed(() => !!appointmentsForm.value.id)

  // Filter patients based on search term for dynamic dropdown
  const filteredPatients = computed(() => {
    if (!patientSearchTerm.value || patientSearchTerm.value.trim() === '') {
      return []
    }

    const term = patientSearchTerm.value.toLowerCase().trim()

    return patientStore.patients.filter((patient) => {
      try {
        const firstname = (patient.Firstname || '').toLowerCase()
        const lastname = (patient.Lastname || '').toLowerCase()
        const middlename = (patient.Middlename || '').toLowerCase()
        const contact = String(patient.EmergencyContact || '')
        const fullName = `${firstname} ${middlename} ${lastname}`.toLowerCase()

        return (
          fullName.includes(term) ||
          firstname.includes(term) ||
          lastname.includes(term) ||
          middlename.includes(term) ||
          contact.includes(term)
        )
      } catch (error) {
        console.error('Error filtering patient:', patient, error)
        return false
      }
    })
  })

  // Computed property to get the details of the selected registered patient
  const selectedPatient = computed(() => {
    if (selectedPatientId.value) {
      const patient = patientStore.patients.find((p) => p.Id == selectedPatientId.value)

      if (patient) {
        appointmentsForm.value.patientId = patient.Id
      }
      return patient
    }
    appointmentsForm.value.patientId = null
    return null
  })

  const buildAppointmentPayload = (formData, appointmentIdOverride = null) => {
    const patient = patientStore.patients.find((p) => p.Id == selectedPatientId.value)
    const patientId = Number(selectedPatientId.value || formData.patientId || 0)

    return {
      Id: formData.id || 0,
      AppointmentId: appointmentIdOverride ?? formData.appointmentId ?? '',
      PatientId: patientId,
      Patient: patient
        ? {
            Id: patient.Id,
            Firstname: patient.Firstname ?? '',
            Middlename: patient.Middlename ?? '',
            Lastname: patient.Lastname ?? '',
            Address: patient.Address ?? '',
            Password: patient.Password ?? '',
            Facebook: patient.Facebook ?? '',
            Email: patient.Email ?? '',
            EmergencyContact: patient.EmergencyContact ?? '',
          }
        : null,
      Date: formData.date,
      Time: formData.time,
      Reason: formData.reason,
      Status: formData.status || 'Pending',
    }
  }

  // Function to be called when a search result is clicked
  const selectPatient = (patient) => {
    selectedPatientId.value = patient.Id
    // Clear the search term to close the dropdown
    patientSearchTerm.value = ''
  }

  // Debug watcher
  watch(patientSearchTerm, (newVal) => {
    console.log('Search term changed:', newVal)
  })

  watch(selectedPatientId, (newVal) => {
    console.log('Selected patient ID:', newVal)
  })

  const normalizeAppointment = (a) => ({
    ...a,
    id: a.id ?? a.Id,
    appointmentId: a.appointmentId ?? a.AppointmentId,
    patientId: a.patientId ?? a.PatientId,
    date: a.date ?? a.Date,
    time: a.time ?? a.Time,
    reason: a.reason ?? a.Reason,
    status: a.status ?? a.Status,
  })

  const fetchAppointments = async () => {
    try {
      const response = await fetch('/api/appointments', {
        headers: getHeaders(),
      })
      if (!response.ok) throw new Error('Failed to fetch appointments')
      const apiAppointments = await response.json()
      appointments.value = apiAppointments.map(normalizeAppointment)
      console.log('Appointments fetched successfully')
    } catch (error) {
      console.error('Error fetching appointments:', error)
    }
  }

  watch(
    () => authStore.isAuthenticated,
    (isAuth) => {
      if (isAuth) fetchAppointments()
      else appointments.value = []
    },
    { immediate: true },
  )

  const addAppointment = async (appointmentData) => {
    try {
      const newAppointmentId = generateAppointmentId()
      const payload = buildAppointmentPayload(appointmentData, newAppointmentId)

      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      })

      if (!response.ok) throw new Error('Failed to add appointment')
      const newAppointment = await response.json()
      appointments.value.push(normalizeAppointment(newAppointment))
      resetForm()
      return true
    } catch (error) {
      console.error('Error adding appointment:', error)
      return false
    }
  }

  const editAppointment = async (id, updatedAppointment) => {
    try {
      const payload = buildAppointmentPayload(updatedAppointment, updatedAppointment.appointmentId)

      const response = await fetch(`/api/appointments/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      })
      if (!response.ok) throw new Error('Failed to update appointment')

      const updatedData =
        response.status === 204 ? { ...updatedAppointment } : await response.json()

      const index = appointments.value.findIndex((a) => Number(a.id ?? a.Id) === Number(id))
      if (index !== -1) {
        appointments.value[index] = normalizeAppointment(updatedData)
        resetForm()
      }
      return true
    } catch (error) {
      console.error('Error updating appointment:', error)
      return false
    }
  }

  const submitAppointment = async () => {
    const form = appointmentsForm.value

    if (!form.date || !form.time || !form.reason || !form.patientId) {
      console.error('Date, Time, Reason, and a Registered Patient are required.')
      return false
    }

    if (isEditMode.value) {
      form.patientId = selectedPatientId.value
      return await editAppointment(form.id, form)
    } else {
      return await addAppointment(form)
    }
  }

  const setFormforEdit = (appointment) => {
    appointmentsForm.value = { ...appointment }
    selectedPatientId.value = appointment.patientId ?? appointment.PatientId

    // Clear the search term when editing (no need to show it)
    patientSearchTerm.value = ''
  }

  const deleteAppointment = async (id) => {
    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      })
      if (!response.ok) throw new Error('Failed to delete appointment')
      appointments.value = appointments.value.filter((a) => Number(a.id ?? a.Id) !== Number(id))
      return true
    } catch (error) {
      console.error('Error deleting appointment:', error)
      return false
    }
  }

  return {
    appointments,
    appointmentsForm,
    selectedPatientId,
    selectedPatient,
    patientSearchTerm,
    filteredPatients,
    isEditMode,
    selectPatient,
    fetchAppointments,
    submitAppointment,
    setFormforEdit,
    deleteAppointment,
    resetForm,
    editAppointment,
  }
})
