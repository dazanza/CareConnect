'use client'

import { useState } from 'react'
import { Calendar } from "@/components/ui/calendar"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
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
      </CardHeader>
      <CardContent className="p-6">
        <div className="border rounded-lg overflow-hidden">
          <div className="p-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              modifiers={{
                appointment: appointments.map(apt => new Date(apt.date))
              }}
              modifiersStyles={{
                appointment: {
                  backgroundColor: "hsl(142.1 76.2% 36.3%)",
                  color: "white",
                  borderRadius: "0"
                }
              }}
              components={{
                DayContent: ({ date }) => {
                  const dayAppointments = appointments.filter(
                    apt => new Date(apt.date).toDateString() === date.toDateString()
                  )
                  
                  return dayAppointments.length > 0 ? (
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <div className="w-full h-full flex items-center justify-center cursor-pointer">
                          {date.getDate()}
                        </div>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-80">
                        <div className="space-y-2">
                          <h4 className="font-semibold">Appointments on {format(date, "MMMM d, yyyy")}</h4>
                          {dayAppointments.map(apt => (
                            <div key={apt.id} className="text-sm">
                              {apt.patient.name} with Dr. {apt.doctor.name} at {format(new Date(apt.date), "h:mm a")}
                            </div>
                          ))}
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {date.getDate()}
                    </div>
                  )
                }
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
