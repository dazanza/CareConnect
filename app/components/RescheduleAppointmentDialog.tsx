import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AddAppointmentForm } from '@/app/components/AddAppointmentForm'
import { Appointment } from '@/types'
import { useSupabase } from '@/app/hooks/useSupabase'
import { convertUTCToLocal } from '@/app/lib/dateUtils'  // Add this import

interface RescheduleAppointmentDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  appointmentId: number
  onSuccess: (newDate: Date) => void
}

export function RescheduleAppointmentDialog({
  isOpen,
  onOpenChange,
  appointmentId,
  onSuccess
}: RescheduleAppointmentDialogProps) {
  const { supabase } = useSupabase()
  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchAppointment() {
      if (!supabase || !appointmentId) return

      setIsLoading(true)
      try {
        const { data, error } = await supabase
          .from('appointments')
          .select(`
            *,
            patients (id, name),
            doctors (id, first_name, last_name)
          `)
          .eq('id', appointmentId)
          .single()

        if (error) throw error

        if (data) {
          const localDate = convertUTCToLocal(data.date);
          setAppointment({
            ...data,
            date: localDate,
            patient: data.patients,
            doctor: data.doctors
          });
        }
      } catch (error) {
        console.error('Error fetching appointment details:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (isOpen) {
      fetchAppointment()
    }
  }, [supabase, appointmentId, isOpen])

  if (isLoading || !appointment) {
    return null // Or a loading spinner
  }

  const appointmentTitle = `${appointment.type} with Dr. ${appointment.doctors.last_name}`

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reschedule {appointmentTitle}</DialogTitle>
        </DialogHeader>
        <AddAppointmentForm 
          initialData={appointment} 
          mode="reschedule"
          onSuccess={onSuccess}
          disablePatientDoctor={true}
        />
      </DialogContent>
    </Dialog>
  )
}