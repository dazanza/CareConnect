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
          <ul>
            {appointments.map((appointment) => (
              <li key={appointment.id} className="mb-2">
                {format(new Date(appointment.date), 'MMMM d, yyyy h:mm a')} - {appointment.type}
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