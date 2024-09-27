'use client'

import { useEffect, useState } from 'react'
import { useSupabase } from '@/app/hooks/useSupabase'
import { Appointment, Prescription } from '@/types'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { CalendarDays, Clock, MapPin, User, PlusCircle } from 'lucide-react'
import { fetchAppointments } from '@/app/lib/dataFetching'
import { format } from 'date-fns'
import { AddAppointmentForm } from '@/app/components/AddAppointmentForm'
import Link from 'next/link'

export default function DashboardContent() {
  const { supabase } = useSupabase()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [isAddAppointmentOpen, setIsAddAppointmentOpen] = useState(false)

  useEffect(() => {
    async function fetchDashboardData() {
      if (!supabase) return

      try {
        const appointmentsData = await fetchAppointments(supabase, { limit: 5, upcoming: true })
        setAppointments(appointmentsData)

        const { data: prescriptionsData, error: prescriptionsError } = await supabase
          .from('prescriptions')
          .select('*')
          .order('next_dose', { ascending: true })
          .limit(5)

        if (prescriptionsError) throw prescriptionsError
        setPrescriptions(prescriptionsData)

      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      }
    }

    fetchDashboardData()
  }, [supabase])

  const formatAppointmentDate = (date: string) => {
    return format(new Date(date), "MMMM d, yyyy 'at' h:mm a")
  }

  const handleAppointmentAdded = () => {
    setIsAddAppointmentOpen(false)
    // Refresh appointments
    fetchAppointments(supabase, { limit: 5, upcoming: true }).then(setAppointments)
  }

  return (
    <div className="space-y-6">
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
                    (appointment) => new Date(appointment.date).toDateString() === date.toDateString()
                  )
                }}
                modifiersStyles={{
                  hasAppointment: { backgroundColor: '#93c5fd', color: '#1e40af' }
                }}
              />
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-semibold mb-3">Upcoming Appointments</h2>
                <ul className="space-y-3">
                  {appointments.map((appointment) => (
                    <li key={appointment.id} className="text-sm border-b pb-2 last:border-b-0">
                      <Link 
                        href={`/appointments/${appointment.id}`} 
                        className="block hover:bg-gray-50 p-2 rounded transition duration-150 ease-in-out"
                      >
                        <div className="font-semibold text-blue-600 hover:text-blue-800">
                          {appointment.type} with Dr. {appointment.doctors?.last_name}
                        </div>
                        <p className="text-gray-600 mt-1">{appointment.patients?.name}</p>
                        <p className="text-gray-500 text-xs">{formatAppointmentDate(appointment.date)}</p>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span>{appointment.location}</span>
                        </div>
                      </Link>
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
            {prescriptions.length > 0 ? (
              <ul className="space-y-2">
                {prescriptions.map((prescription) => (
                  <li key={prescription.id} className="text-sm">
                    <p className="font-medium">{prescription.medication}</p>
                    <p className="text-gray-600">Next dose: {format(new Date(prescription.next_dose), 'MMMM d, yyyy h:mm a')}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600">No prescription reminders</p>
            )}
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
        <Dialog open={isAddAppointmentOpen} onOpenChange={setIsAddAppointmentOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <PlusCircle className="mr-2 h-4 w-4" />
              Schedule Appointment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Schedule New Appointment</DialogTitle>
            </DialogHeader>
            <AddAppointmentForm onSuccess={handleAppointmentAdded} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}