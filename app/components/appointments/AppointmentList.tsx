import { showToast } from '@/app/lib/toast'

export function AppointmentList() {
  const { data: appointments = [], setData: setAppointments } = useAppointments()
  
  const handleCancel = async (appointment: Appointment) => {
    try {
      await cancelAppointment(appointment.id)
      setAppointments(appointments.filter(a => a.id !== appointment.id))
      showToast.success('Appointment cancelled successfully')
    } catch (error) {
      console.error('Error cancelling appointment:', error)
      showToast.error('Failed to cancel appointment')
      throw error
    }
  }

  const handleNavigate = (appointmentId: string) => {
    try {
      router.push(`/appointments/${appointmentId}`)
    } catch (error) {
      console.error('Navigation error:', error)
      showToast.error('Failed to navigate to appointment')
      router.push('/appointments')
    }
  }

  // ... rest of the component
} 