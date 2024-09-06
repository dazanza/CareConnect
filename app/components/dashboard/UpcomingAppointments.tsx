import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

interface Appointment {
  id: number
  patient: string
  date: string
  type: string
  doctor: string
  location: string
}

interface UpcomingAppointmentsProps {
  appointments: Appointment[]
}

export default function UpcomingAppointments({ appointments }: UpcomingAppointmentsProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium text-blue-800">Upcoming Appointments</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          {appointments.map((appointment, index) => (
            <div key={appointment.id}>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-blue-600">{appointment.patient}</p>
                  <p className="text-sm text-gray-600">{appointment.type}</p>
                  <p className="text-sm text-gray-600">{appointment.doctor} - {appointment.location}</p>
                </div>
                <p className="text-sm font-medium text-gray-700">{appointment.date}</p>
              </div>
              {index < appointments.length - 1 && <Separator />}
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}