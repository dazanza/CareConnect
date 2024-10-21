'use client'

import { useState, useEffect } from 'react'
import { useSupabase } from '@/app/hooks/useSupabase'
import { Appointment } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { CalendarIcon, ClockIcon, MapPinIcon } from 'lucide-react'
import { convertUTCToLocal, formatLocalDate } from '@/app/lib/dateUtils'
import { RescheduleAppointmentDialog } from './RescheduleAppointmentDialog'
import { CancelAppointmentDialog } from './CancelAppointmentDialog'
import { fetchAppointments as fetchAppointmentsApi } from '@/app/lib/dataFetching'

interface AppointmentsListProps {
  userId: string
  patientId?: number
  doctorId?: number
  limit?: number
  showAll?: boolean
  upcoming?: boolean
}

export function AppointmentsList({ userId, patientId, doctorId, limit = 5, showAll = false, upcoming = false }: AppointmentsListProps) {
  const { supabase } = useSupabase()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false)
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)

  useEffect(() => {
    if (userId) {
      fetchAppointments()
    }
  }, [userId, patientId, doctorId, showAll, upcoming])

  const fetchAppointments = async () => {
    if (!supabase || !userId) return

    setIsLoading(true)
    try {
      const appointmentsData = await fetchAppointmentsApi(supabase, userId, {
        patientId: patientId?.toString(),
        doctorId: doctorId?.toString(),
        limit: showAll ? undefined : limit,
        upcoming
      })
      setAppointments(appointmentsData || [])
    } catch (error) {
      console.error('Error fetching appointments:', error)
      setAppointments([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleReschedule = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setIsRescheduleDialogOpen(true)
  }

  const handleCancel = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setIsCancelDialogOpen(true)
  }

  const handleRescheduleSuccess = () => {
    setIsRescheduleDialogOpen(false)
    fetchAppointments()
  }

  const handleCancelSuccess = () => {
    setIsCancelDialogOpen(false)
    fetchAppointments()
  }

  if (isLoading) return <div>Loading appointments...</div>

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Appointments</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p>Loading appointments...</p>
        ) : appointments.length > 0 ? (
          <ul className="space-y-4">
            {appointments.map((appointment) => (
              <li key={appointment.id} className="border-b pb-2">
                <Link href={`/appointments/${appointment.id}`} className="block hover:bg-gray-50 p-2 rounded">
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
                  {!patientId && (
                    <p className="mt-2">
                      Patient: {appointment.patients?.id ? (
                        <Link href={`/patients/${appointment.patients.id}`} className="text-blue-600 hover:underline">
                          {appointment.patients?.name || 'N/A'}
                        </Link>
                      ) : (
                        appointment.patients?.name || 'N/A'
                      )}
                    </p>
                  )}
                  {!doctorId && (
                    <p>
                      Doctor: {appointment.doctors?.id ? (
                        <Link href={`/doctors/${appointment.doctors.id}`} className="text-blue-600 hover:underline">
                          Dr. {appointment.doctors?.first_name} {appointment.doctors?.last_name}
                        </Link>
                      ) : (
                        `Dr. ${appointment.doctors?.first_name} ${appointment.doctors?.last_name}`
                      )}
                    </p>
                  )}
                  <p>Type: {appointment.type}</p>
                </Link>
                <div className="mt-2 space-x-2">
                  <Button size="sm" variant="outline" onClick={() => handleReschedule(appointment)}>
                    Reschedule
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleCancel(appointment)}>
                    Cancel
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No upcoming appointments</p>
        )}
      </CardContent>

      <RescheduleAppointmentDialog
        isOpen={isRescheduleDialogOpen}
        onOpenChange={setIsRescheduleDialogOpen}
        appointmentId={selectedAppointment?.id || 0}
        onSuccess={handleRescheduleSuccess}
      />

      <CancelAppointmentDialog
        isOpen={isCancelDialogOpen}
        onOpenChange={setIsCancelDialogOpen}
        appointment={selectedAppointment}
        onCancel={handleCancelSuccess}
      />
    </Card>
  )
}