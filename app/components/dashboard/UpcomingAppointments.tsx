import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Appointment } from '@/types'
import { format } from 'date-fns'
import Link from 'next/link'
import { Calendar as CalendarIcon, Clock as ClockIcon, MapPin as MapPinIcon } from 'lucide-react'

interface UpcomingAppointmentsProps {
  appointments: Appointment[]
}

export default function UpcomingAppointments({ appointments }: UpcomingAppointmentsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Appointments</CardTitle>
      </CardHeader>
      <CardContent>
        {appointments.length > 0 ? (
          <ul className="space-y-4">
            {appointments.map((appointment) => (
              <li key={appointment.id} className="border-b pb-2">
                <Link href={`/appointments/${appointment.id}`} className="block hover:bg-gray-50 p-2 rounded">
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
                  <p className="mt-2">
                    Patient: {appointment.patients?.id ? (
                      <Link href={`/patients/${appointment.patients.id}`} className="text-blue-600 hover:underline">
                        {appointment.patients?.name || 'N/A'}
                      </Link>
                    ) : (
                      appointment.patients?.name || 'N/A'
                    )}
                  </p>
                  <p>
                    Doctor: {appointment.doctors?.id ? (
                      <Link href={`/doctors/${appointment.doctors.id}`} className="text-blue-600 hover:underline">
                        Dr. {appointment.doctors?.first_name || 'N/A'} {appointment.doctors?.last_name || ''}
                      </Link>
                    ) : (
                      `Dr. ${appointment.doctors?.first_name || 'N/A'} ${appointment.doctors?.last_name || ''}`
                    )}
                  </p>
                  <p>Type: {appointment.type}</p>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p>No upcoming appointments</p>
        )}
      </CardContent>
    </Card>
  )
}