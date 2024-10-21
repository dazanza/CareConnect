'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useSupabase } from '@/app/hooks/useSupabase'
import { Appointment } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { AddAppointmentForm } from '@/app/components/AddAppointmentForm'
import { format } from 'date-fns'
import { fetchAppointments } from '@/app/lib/dataFetching'
import DashboardLayout from '@/app/components/layout/DashboardLayout'
import Link from 'next/link'
import { Calendar as CalendarIcon, Clock as ClockIcon, MapPin as MapPinIcon } from 'lucide-react'
import { convertUTCToLocal, formatLocalDate } from '@/app/lib/dateUtils'
import { rescheduleAppointment, cancelAppointment } from "@/app/lib/appointments"

export default function AppointmentsPage() {
  const { supabase } = useSupabase()
  const [appointmentsData, setAppointmentsData] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddAppointmentOpen, setIsAddAppointmentOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false)
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)

  const loadAppointments = useCallback(async () => {
    if (!supabase) {
      console.log('Supabase client not available')
      setError('Supabase client not available')
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      console.log('Fetching appointments...')
      const data = await fetchAppointments(supabase)
      console.log('Appointments fetched:', data)
      if (data.length === 0) {
        setError('No appointments found in the database')
      }
      setAppointmentsData(data)
    } catch (error) {
      console.error('Error fetching appointments:', error)
      setError(`Failed to load appointments: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    console.log('AppointmentsPage mounted')
    loadAppointments()
    return () => {
      console.log('AppointmentsPage unmounted')
    }
  }, [loadAppointments])

  const appointments = useMemo(() => appointmentsData, [appointmentsData])

  const handleAppointmentAdded = useCallback(async () => {
    setIsAddAppointmentOpen(false)
    await loadAppointments()
  }, [loadAppointments])

  const handleReschedule = async (newDate: Date) => {
    if (selectedAppointment) {
      try {
        await rescheduleAppointment(supabase, selectedAppointment.id, newDate)
        toast.success('Appointment rescheduled successfully')
        loadAppointments()
      } catch (error) {
        console.error('Error rescheduling appointment:', error)
        toast.error('Failed to reschedule appointment')
      }
      setIsRescheduleDialogOpen(false)
    }
  }

  const handleCancel = async () => {
    if (selectedAppointment) {
      try {
        await cancelAppointment(supabase, selectedAppointment.id)
        toast.success('Appointment cancelled successfully')
        loadAppointments()
      } catch (error) {
        console.error('Error cancelling appointment:', error)
        toast.error('Failed to cancel appointment')
      }
      setIsCancelDialogOpen(false)
    }
  }

  console.log('AppointmentsPage rendering, isLoading:', isLoading)

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <p>Loading appointments...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <p className="text-red-500">{error}</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">All Appointments</h1>
          <Button onClick={loadAppointments}>Refresh Appointments</Button>
          <Dialog open={isAddAppointmentOpen} onOpenChange={setIsAddAppointmentOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Appointment</DialogTitle>
              </DialogHeader>
              <AddAppointmentForm onSuccess={handleAppointmentAdded} />
            </DialogContent>
          </Dialog>
        </div>

        {console.log('Rendering appointments:', appointments)} 
        {appointments.length > 0 ? (
          <ul className="space-y-4">
            {appointments.map((appointment) => (
              <li key={appointment.id} className="border-b pb-4">
                <div className="block hover:bg-gray-50 p-2 rounded">
                  <Link href={`/appointments/${appointment.id}`} className="block mb-2">
                    <div className="flex items-center space-x-2">
                      <CalendarIcon className="w-4 h-4" />
                      <p className="font-semibold">
                        {formatLocalDate(convertUTCToLocal(appointment.date), 'MMMM d, yyyy')}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <ClockIcon className="w-4 h-4" />
                      <p>{formatLocalDate(convertUTCToLocal(appointment.date), 'h:mm a')}</p>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <MapPinIcon className="w-4 h-4" />
                      <p>{appointment.location}</p>
                    </div>
                    {/* ... (patient and doctor info) */}
                    <p>Type: {appointment.type}</p>
                  </Link>
                  <div className="mt-2 space-x-2">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSelectedAppointment(appointment)
                        setIsRescheduleDialogOpen(true)
                      }}
                    >
                      Reschedule
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={() => {
                        setSelectedAppointment(appointment)
                        setIsCancelDialogOpen(true)
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No appointments found.</p>
        )}
      </div>

      <RescheduleAppointmentDialog
        isOpen={isRescheduleDialogOpen}
        onOpenChange={setIsRescheduleDialogOpen}
        appointmentId={selectedAppointment?.id || 0}
        onSuccess={(newDate) => handleReschedule(newDate)}
      />

      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Appointment</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this appointment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)}>No, keep appointment</Button>
            <Button variant="destructive" onClick={handleCancel}>Yes, cancel appointment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}