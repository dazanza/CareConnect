import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Appointment } from '@/types'
import { format } from 'date-fns'

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
                <p className="font-semibold">
                  {format(new Date(appointment.date), 'MMMM d, yyyy h:mm a')}
                </p>
                <p>Patient: {appointment.patients?.name || 'N/A'}</p>
                <p>Doctor: Dr. {appointment.doctors?.first_name || 'N/A'} {appointment.doctors?.last_name || ''}</p>
                <p>Type: {appointment.type}</p>
                <p>Location: {appointment.location}</p>
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