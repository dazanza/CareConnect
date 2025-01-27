'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSupabase } from '@/app/hooks/useSupabase'
import { Appointment } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { CalendarIcon, ClockIcon, MapPinIcon } from 'lucide-react'
import { convertUTCToLocal, formatters } from '@/app/lib/dateUtils'
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

  const fetchAppointments = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true)
    try {
      const appointmentsData = await fetchAppointmentsApi(supabase, {
        userId,
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
  }, [userId, supabase, patientId, doctorId, showAll, limit, upcoming])

  useEffect(() => {
    fetchAppointments()
  }, [fetchAppointments])

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
                      {formatters.appointment(convertUTCToLocal(appointment.date))}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <ClockIcon className="w-4 h-4" />
                    <p>{formatters.time(convertUTCToLocal(appointment.date))}</p>
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <MapPinIcon className="w-4 h-4" />
                    <p>{appointment.location}</p>
                  </div>
                  {!patientId && (
                    <p className="mt-2">
                      Patient: {appointment.patients?.id ? (
                        <Link href={`/patients/${appointment.patients.id}`} className="text-blue-600 hover:underline">
                          {appointment.patients?.first_name} {appointment.patients?.last_name}
                        </Link>
                      ) : (
                        `${appointment.patients?.first_name} ${appointment.patients?.last_name}`
                      )}
                    </p>
                  )}
                  {!doctorId && (
                    <p>
                      Doctor: {appointment.doctors?.id ? (
                        <Link href={`/doctors/${appointment.doctors.id}`} className="text-blue-600 hover:underline">
                          Dr. {appointment.doctors?.first_name} {appointment.doctors?.last_name} - {appointment.doctors?.specialization}
                        </Link>
                      ) : (
                        `Dr. ${appointment.doctors?.first_name} ${appointment.doctors?.last_name} - ${appointment.doctors?.specialization}`
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
        onClose={() => setIsRescheduleDialogOpen(false)}
        appointmentId={selectedAppointment?.id || 0}
        onSuccess={handleRescheduleSuccess}
      />

      <CancelAppointmentDialog
        isOpen={isCancelDialogOpen}
        onClose={() => setIsCancelDialogOpen(false)}
        appointment={selectedAppointment}
        onCancel={handleCancelSuccess}
      />
    </Card>
  )
}