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
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from "date-fns"
import { cn } from "@/lib/utils"
import { Button } from '@/components/ui/button'
import { ViewIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export interface CalendarAppointment {
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
  type: string
}

type CalendarView = 'day' | 'week' | 'month'

interface AppointmentCalendarProps {
  appointments: CalendarAppointment[]
  onDateSelect?: (date: Date) => void
  className?: string
  defaultView?: CalendarView
}

export function AppointmentCalendarEnhanced({ 
  appointments, 
  onDateSelect,
  className,
  defaultView = 'month'
}: AppointmentCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [view, setView] = useState<CalendarView>(defaultView)

  // Get appointments for a specific date
  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(apt => 
      isSameDay(new Date(apt.date), date)
    ).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )
  }

  // Get week view dates
  const getWeekDates = (date: Date) => {
    const start = startOfWeek(date, { weekStartsOn: 1 }) // Start week on Monday
    const end = endOfWeek(date, { weekStartsOn: 1 })
    return eachDayOfInterval({ start, end })
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return
    setSelectedDate(date)
    if (onDateSelect) {
      onDateSelect(date)
    }
  }

  const handlePrevious = () => {
    const newDate = new Date(selectedDate)
    if (view === 'day') {
      newDate.setDate(newDate.getDate() - 1)
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() - 7)
    } else {
      newDate.setMonth(newDate.getMonth() - 1)
    }
    setSelectedDate(newDate)
  }

  const handleNext = () => {
    const newDate = new Date(selectedDate)
    if (view === 'day') {
      newDate.setDate(newDate.getDate() + 1)
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() + 7)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setSelectedDate(newDate)
  }

  const renderDayView = (date: Date) => {
    const dayAppointments = getAppointmentsForDate(date)
    return (
      <div className="space-y-4">
        <h3 className="font-semibold">{format(date, "EEEE, MMMM d, yyyy")}</h3>
        {dayAppointments.length > 0 ? (
          <div className="space-y-2">
            {dayAppointments.map(apt => (
              <div key={apt.id} className="p-2 border rounded hover:bg-gray-50">
                <div className="font-medium">{format(new Date(apt.date), "h:mm a")}</div>
                <div>{apt.patient.name} with Dr. {apt.doctor.name}</div>
                <div className="text-sm text-gray-500">{apt.type} at {apt.location}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500">No appointments scheduled</div>
        )}
      </div>
    )
  }

  const renderWeekView = () => {
    const weekDates = getWeekDates(selectedDate)
    return (
      <div className="grid grid-cols-7 gap-4">
        {weekDates.map(date => (
          <div key={date.toISOString()} className="min-h-[200px]">
            <div className="font-semibold mb-2">{format(date, "EEE, MMM d")}</div>
            <div className="space-y-1">
              {getAppointmentsForDate(date).map(apt => (
                <div key={apt.id} className="p-1 text-xs bg-green-100 rounded">
                  {format(new Date(apt.date), "h:mm a")} - {apt.patient.name}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  const renderMonthView = () => (
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
          const dayAppointments = getAppointmentsForDate(date)
          
          return dayAppointments.length > 0 ? (
            <HoverCard>
              <HoverCardTrigger asChild>
                <div className="w-full h-full flex items-center justify-center cursor-pointer">
                  <div>
                    {date.getDate()}
                    <div className="h-1 w-1 bg-green-500 rounded-full mx-auto mt-1" />
                  </div>
                </div>
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <div className="space-y-2">
                  <h4 className="font-semibold">Appointments on {format(date, "MMMM d, yyyy")}</h4>
                  {dayAppointments.map(apt => (
                    <div key={apt.id} className="text-sm">
                      {format(new Date(apt.date), "h:mm a")} - {apt.patient.name} with Dr. {apt.doctor.name}
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
        <div className="flex items-center justify-between">
          <CardTitle>Appointment Calendar</CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={handlePrevious}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <ViewIcon className="mr-2 h-4 w-4" />
                  {view.charAt(0).toUpperCase() + view.slice(1)} View
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setView('day')}>Day View</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setView('week')}>Week View</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setView('month')}>Month View</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" size="icon" onClick={handleNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="border rounded-lg overflow-hidden">
          <div className="p-4">
            {view === 'day' && renderDayView(selectedDate)}
            {view === 'week' && renderWeekView()}
            {view === 'month' && renderMonthView()}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 