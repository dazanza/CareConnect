'use client'

import { useEffect, useState } from 'react'
import { useSupabase } from '@/app/hooks/useSupabase'
import { Appointment, Prescription } from '@/types'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { CalendarDays, Clock, MapPin, User, PlusCircle, RefreshCw, Trash2, CalendarIcon, MapPinIcon } from 'lucide-react'
import { fetchAppointments } from '@/app/lib/dataFetching'
import { format } from 'date-fns'
import { AddAppointmentForm } from '@/app/components/AddAppointmentForm'
import Link from 'next/link'
import AppTodoList from '@/app/components/AppTodoList'
import { useAuth } from '@clerk/nextjs'
import { convertUTCToLocal, formatLocalDate } from '@/app/lib/dateUtils'
import { RescheduleAppointmentDialog } from '@/app/components/appointments/RescheduleAppointmentDialog'
import { CancelAppointmentDialog } from '@/app/components/appointments/CancelAppointmentDialog'
import { ErrorBoundary } from '@/app/components/ui/error-boundary'
import { DataLoadingState } from '@/app/components/ui/loading-states'
import { Suspense } from 'react'
import { toast } from 'react-hot-toast'
import { rescheduleAppointment, cancelAppointment } from '@/app/lib/appointment-actions'
import dynamic from 'next/dynamic'

// Dynamically import components that use Clerk
const UserButton = dynamic(
  () => import('@clerk/nextjs').then((mod) => mod.UserButton),
  { ssr: false }
)

export default function DashboardContent() {
  const { supabase } = useSupabase()
  const { userId } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [isAddAppointmentOpen, setIsAddAppointmentOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false)
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)

  useEffect(() => {
    async function fetchDashboardData() {
      if (!supabase || !userId) return

      try {
        setIsLoading(true)

        const appointmentsData = await fetchAppointments(supabase, userId, { 
          limit: 5, 
          upcoming: true, 
          allPatients: true // Add this line
        })
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
      } finally {
        setIsLoading(false)
      }
    }

    if (userId) {
      fetchDashboardData()
    }
  }, [supabase, userId])

  const handleAppointmentAdded = () => {
    setIsAddAppointmentOpen(false)
    // Refresh appointments
    if (userId) {
      fetchAppointments(supabase, userId, { limit: 5, upcoming: true }).then(setAppointments)
    }
  }

  const handleReschedule = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setIsRescheduleDialogOpen(true)
  }

  const handleCancel = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setIsCancelDialogOpen(true)
  }

  const handleRescheduleSuccess = async (newDate: Date) => {
    if (selectedAppointment && userId) {
      try {
        await rescheduleAppointment(supabase, selectedAppointment.id, newDate)
        toast.success('Appointment rescheduled successfully')
        const updatedAppointments = await fetchAppointments(supabase, userId, { 
          limit: 5, 
          upcoming: true, 
          allPatients: true 
        })
        setAppointments(updatedAppointments)
      } catch (error) {
        console.error('Error rescheduling appointment:', error)
        toast.error('Failed to reschedule appointment')
      }
      setIsRescheduleDialogOpen(false)
    }
  }

  const handleCancelSuccess = async () => {
    if (selectedAppointment && userId) {
      try {
        await cancelAppointment(supabase, selectedAppointment.id)
        toast.success('Appointment cancelled successfully')
        const updatedAppointments = await fetchAppointments(supabase, userId, { 
          limit: 5, 
          upcoming: true, 
          allPatients: true 
        })
        setAppointments(updatedAppointments)
      } catch (error) {
        console.error('Error cancelling appointment:', error)
        toast.error('Failed to cancel appointment')
      }
      setIsCancelDialogOpen(false)
    }
  }

  if (!userId) {
    return <div>Please sign in to view your dashboard.</div>
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <Suspense fallback={<DataLoadingState isLoading={true} isEmpty={false}>
            <div>Loading...</div>
          </DataLoadingState>}>
            <UserButton afterSignOutUrl="/" />
          </Suspense>
        </div>
        
        <DataLoadingState
          isLoading={isLoading}
          isEmpty={false}
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
            {/* Calendar */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-2xl font-semibold">Appointment Calendar</CardTitle>
                  <Dialog open={isAddAppointmentOpen} onOpenChange={setIsAddAppointmentOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                        <PlusCircle className="w-4 h-4 mr-1" />
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
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-1">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      className="rounded-md border w-full"
                      modifiers={{
                        hasAppointment: (date) => appointments.some(
                          (appointment) => new Date(appointment.date).toDateString() === date.toDateString()
                        )
                      }}
                      modifiersStyles={{
                        hasAppointment: { backgroundColor: '#93c5fd', color: '#1e40af' }
                      }}
                    />
                  </div>
                  <div className="md:col-span-2 space-y-4">
                    {appointments.length > 0 ? (
                      appointments.map((appointment) => (
                        <div 
                          key={appointment.id} 
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                        >
                          <div className="flex-grow">
                            <Link href={`/appointments/${appointment.id}`} className="block">
                              <div className="font-semibold text-blue-600 hover:text-blue-800">
                                {appointment.patients?.name} {appointment.type} with Dr. {appointment.doctors?.last_name}
                              </div>
                              <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                                <div className="flex items-center">
                                  <CalendarIcon className="w-4 h-4 mr-1" />
                                  {formatLocalDate(convertUTCToLocal(appointment.date), "MMMM d, yyyy")}
                                </div>
                                <div className="flex items-center">
                                  <Clock className="w-4 h-4 mr-1" />
                                  {formatLocalDate(convertUTCToLocal(appointment.date), "h:mm a")}
                                </div>
                                <div className="flex items-center">
                                  <MapPinIcon className="w-4 h-4 mr-1" />
                                  {appointment.location}
                                </div>
                              </div>
                            </Link>
                          </div>
                          <div className="flex space-x-2 ml-4">
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={(e) => {
                                e.preventDefault();
                                handleReschedule(appointment);
                              }}
                              className="flex items-center"
                              title="Reschedule"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={(e) => {
                                e.preventDefault();
                                handleCancel(appointment);
                              }}
                              className="flex items-center text-red-600 hover:text-red-800 hover:bg-red-100"
                              title="Cancel"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p>No upcoming appointments.</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Todo List */}
            <Card className="lg:col-span-1 bg-white shadow-md">
              <CardContent className="p-0 h-full">
                <AppTodoList userId={userId} />
              </CardContent>
            </Card>

            {/* Prescription Reminders */}
            <Card className="lg:col-span-3">
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
          </div>
        </DataLoadingState>

        <RescheduleAppointmentDialog
          isOpen={isRescheduleDialogOpen}
          appointmentId={selectedAppointment?.id || 0}
          onSuccess={handleRescheduleSuccess}
          onClose={() => setIsRescheduleDialogOpen(false)}
        />

        <CancelAppointmentDialog
          isOpen={isCancelDialogOpen}
          appointment={selectedAppointment}
          onCancel={handleCancelSuccess}
          onClose={() => setIsCancelDialogOpen(false)}
        />
      </div>
    </ErrorBoundary>
  )
}
