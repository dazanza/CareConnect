'use client'

import { useState } from 'react'
import { Calendar } from "@/components/ui/calendar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface CalendarAppointment {
  id: string
  date: string
  patient: {
    id: string
    name: string
  }
  doctor: {
    id: string
    name: string
  }
  location: string
}

interface AppointmentCalendarProps {
  appointments: CalendarAppointment[]
  onDateSelect?: (date: Date) => void
  className?: string
}

export function AppointmentCalendar({ 
  appointments, 
  onDateSelect,
  className 
}: AppointmentCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

  // Group appointments by date
  const appointmentsByDate = appointments.reduce((acc, appointment) => {
    const date = format(new Date(appointment.date), 'yyyy-MM-dd')
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(appointment)
    return acc
  }, {} as Record<string, CalendarAppointment[]>)

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    if (date && onDateSelect) {
      onDateSelect(date)
    }
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle>Appointment Calendar</CardTitle>
        <CardDescription>View and manage your appointments</CardDescription>
      </CardHeader>
      <CardContent>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          className="rounded-md border"
          components={{
            DayContent: ({ date }) => {
              const formattedDate = format(date, 'yyyy-MM-dd')
              const dayAppointments = appointmentsByDate[formattedDate] || []
              
              return (
                <div className="relative w-full h-full">
                  <div className="absolute top-0 left-0 right-0 text-center">
                    {date.getDate()}
                  </div>
                  {dayAppointments.length > 0 && (
                    <Badge 
                      variant="secondary" 
                      className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-xs"
                    >
                      {dayAppointments.length}
                    </Badge>
                  )}
                </div>
              )
            }
          }}
        />
        {selectedDate && (
          <div className="mt-4">
            <h3 className="font-medium mb-2">
              Appointments for {format(selectedDate, 'MMMM d, yyyy')}
            </h3>
            <div className="space-y-2">
              {appointmentsByDate[format(selectedDate, 'yyyy-MM-dd')]?.map((appointment) => (
                <div 
                  key={appointment.id}
                  className="p-2 border rounded-md"
                >
                  <div className="font-medium">{appointment.patient.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(appointment.date), 'h:mm a')} - Dr. {appointment.doctor.name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {appointment.location}
                  </div>
                </div>
              )) || (
                <div className="text-muted-foreground">
                  No appointments scheduled
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
