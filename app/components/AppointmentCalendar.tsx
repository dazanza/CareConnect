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
import { format, addMonths } from "date-fns"
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
  const nextMonth = addMonths(new Date(), 1)

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    if (date && onDateSelect) {
      onDateSelect(date)
    }
  }

  const CalendarMonth = ({ date }: { date: Date }) => (
    <Calendar
      mode="single"
      selected={selectedDate}
      onSelect={handleDateSelect}
      className="rounded-md border px-4 py-3"
      month={date}
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
      classNames={{
        months: "space-y-4",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center mb-4",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex justify-between mb-2",
        head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full justify-between mt-2",
        cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md",
        day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
        day_range_end: "day-range-end",
        day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground hover:bg-accent/90",
        day_outside: "text-muted-foreground opacity-50",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible"
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
  )

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle>Appointment Calendar</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 xl:grid-cols-2 gap-4 p-2">
        <CalendarMonth date={new Date()} />
        <CalendarMonth date={nextMonth} />
      </CardContent>
    </Card>
  )
}
