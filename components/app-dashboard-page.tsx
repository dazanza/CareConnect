'use client'

import Link from 'next/link'
import { useState } from 'react'
import { CalendarDays, Clock, MapPin, User, UserPlus, Stethoscope, ClipboardList, PlusCircle } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export function Page() {
  const [date, setDate] = useState<Date | undefined>(new Date())

  // Sample appointments data
  const appointments = [
    { date: new Date(2024, 8, 27, 15, 52), patient: 'Dad Azanza', doctor: 'Dr. Fabio Posas', type: 'Checkup', location: 'Suite 806, MAB, St. Luke\'s BGC' },
    { date: new Date(2024, 9, 2, 13, 57), patient: 'Luca', doctor: 'Dr. Romeo Nuguid', type: 'Follow-up', location: 'Westgate' },
    { date: new Date(2024, 9, 15, 10, 0), patient: 'Mom Azanza', doctor: 'Dr. Emily Chen', type: 'Annual Physical', location: 'Main Hospital, Room 305' },
  ]

  const formatAppointmentDate = (date: Date) => {
    return `${date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })} at ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-full lg:w-64 bg-white shadow-md">
        <div className="p-4">
          <h1 className="text-2xl font-bold text-blue-600">CareConnect</h1>
        </div>
        <nav className="mt-6">
          <Link href="/dashboard" className="block px-4 py-2 text-blue-600 bg-blue-100 font-medium">
            Dashboard
          </Link>
          <Link href="/patients" className="block px-4 py-2 text-gray-600 hover:bg-gray-100">
            Patients
          </Link>
          <Link href="/doctors" className="block px-4 py-2 text-gray-600 hover:bg-gray-100">
            Doctors
          </Link>
          <Link href="/appointments" className="block px-4 py-2 text-gray-600 hover:bg-gray-100">
            Appointments
          </Link>
          <Link href="/prescriptions" className="block px-4 py-2 text-gray-600 hover:bg-gray-100">
            Prescriptions
          </Link>
        </nav>
        <div className="mt-6 px-4 space-y-2">
          <Button asChild className="w-full bg-blue-600 text-white hover:bg-blue-700">
            <Link href="/appointments/add">
              <CalendarDays className="mr-2 h-4 w-4" />
              Add Appointment
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full text-blue-600 hover:bg-blue-50">
            <Link href="/patients/add">
              <UserPlus className="mr-2 h-4 w-4" />
              Add Patient
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full text-blue-600 hover:bg-blue-50">
            <Link href="/doctors/add">
              <Stethoscope className="mr-2 h-4 w-4" />
              Add Doctor
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full text-blue-600 hover:bg-blue-50">
            <Link href="/logs/add">
              <ClipboardList className="mr-2 h-4 w-4" />
              Add Log
            </Link>
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Calendar */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-2xl font-semibold">Appointment Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border w-full lg:w-auto"
                  modifiers={{
                    hasAppointment: (date) => appointments.some(
                      (appointment) => appointment.date.toDateString() === date.toDateString()
                    )
                  }}
                  modifiersStyles={{
                    hasAppointment: { backgroundColor: '#93c5fd', color: '#1e40af' }
                  }}
                />
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-semibold mb-3">Upcoming Appointments</h2>
                  <ul className="space-y-3">
                    {appointments.map((appointment, index) => (
                      <li key={index} className="text-sm border-b pb-2 last:border-b-0">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="link" className="p-0 h-auto font-semibold text-blue-600 hover:text-blue-800">
                              <span className="text-left break-words">{appointment.type} with {appointment.doctor}</span>
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-80">
                            <div className="space-y-2">
                              <h4 className="font-semibold">{appointment.type} with {appointment.doctor}</h4>
                              <p className="text-sm text-gray-600">{formatAppointmentDate(appointment.date)}</p>
                              <div className="flex items-center text-sm text-gray-600">
                                <User className="h-4 w-4 mr-2" />
                                <span>{appointment.patient}</span>
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <MapPin className="h-4 w-4 mr-2" />
                                <span>{appointment.location}</span>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                        <p className="text-gray-600 mt-1">{appointment.patient}</p>
                        <p className="text-gray-500 text-xs">{formatAppointmentDate(appointment.date)}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Prescription Reminders */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-2xl font-semibold">Prescription Reminders</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">No prescription reminders</p>
            </CardContent>
          </Card>

          {/* To-Do List */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-2xl font-semibold">To-Do List</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-gray-700">Schedule annual check-up</span>
                </li>
                <li className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-gray-700">Refill prescription for Dad</span>
                </li>
                <li className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-gray-700">Upload recent lab results</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
            <Link href="/appointments/schedule">
              <PlusCircle className="mr-2 h-4 w-4" />
              Schedule Appointment
            </Link>
          </Button>
        </div>
      </main>
    </div>
  )
}