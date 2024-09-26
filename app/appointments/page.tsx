'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useSupabase } from '@/app/hooks/useSupabase'
import { Appointment } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import AddAppointmentForm from '@/app/components/AddAppointmentForm'
import { format } from 'date-fns'
import { fetchAppointments } from '@/app/lib/dataFetching'
import DashboardLayout from '@/app/components/layout/DashboardLayout'
import Link from 'next/link'
import { Calendar as CalendarIcon, Clock as ClockIcon, MapPin as MapPinIcon } from 'lucide-react'

export default function AppointmentsPage() {
  const { supabase } = useSupabase()
  const [appointmentsData, setAppointmentsData] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddAppointmentOpen, setIsAddAppointmentOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadAppointments = useCallback(async () => {
    if (!supabase) {
      console.log('Supabase client not available')
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      console.log('Fetching appointments...')
      const data = await fetchAppointments(supabase)
      console.log('Appointments fetched:', data.length)
      setAppointmentsData(data)
    } catch (error) {
      console.error('Error fetching appointments:', error)
      setError('Failed to load appointments')
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
          <Dialog open={isAddAppointmentOpen} onOpenChange={setIsAddAppointmentOpen}>
            <DialogTrigger asChild>
              <Button>Add Appointment</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Appointment</DialogTitle>
              </DialogHeader>
              <AddAppointmentForm onSuccess={handleAppointmentAdded} />
            </DialogContent>
          </Dialog>
        </div>

        {appointments.length > 0 ? (
          <ul className="space-y-4">
            {appointments.map((appointment) => (
              <li key={appointment.id} className="border-b pb-4">
                <div className="block hover:bg-gray-50 p-2 rounded">
                  <div>
                    <Link href={`/appointments/${appointment.id}`}>
                      <div className="flex items-center space-x-2">
                        <CalendarIcon className="w-4 h-4" />
                        <p className="font-semibold">
                          {format(new Date(appointment.date), 'MMMM d, yyyy')}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <ClockIcon className="w-4 h-4" />
                        <p>{format(new Date(appointment.date), 'h:mm a')}</p>
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <MapPinIcon className="w-4 h-4" />
                        <p>{appointment.location}</p>
                      </div>
                    </Link>
                  </div>
                  <p className="mt-2">
                    Patient: 
                    <Link href={`/patients/${appointment.patient_id}`} className="text-blue-600 hover:underline ml-1">
                      {appointment.patients?.name}
                    </Link>
                  </p>
                  <p>
                    Doctor: 
                    <Link href={`/doctors/${appointment.doctor_id}`} className="text-blue-600 hover:underline ml-1">
                      Dr. {appointment.doctors?.first_name} {appointment.doctors?.last_name}
                    </Link>
                  </p>
                  <p>Type: {appointment.type}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No appointments found.</p>
        )}
      </div>
    </DashboardLayout>
  )
}