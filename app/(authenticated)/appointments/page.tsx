'use client'

import { useEffect, useState } from 'react'
import { useSupabase } from '@/app/hooks/useSupabase'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, RefreshCw, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'react-hot-toast'
import { RescheduleAppointmentDialog } from '@/app/components/RescheduleAppointmentDialog'
import { CancelAppointmentDialog } from '@/app/components/CancelAppointmentDialog'
import { AppointmentSkeleton } from '@/app/components/ui/skeletons'
import { AppointmentCalendar } from '@/app/components/AppointmentCalendar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Appointment {
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

export default function AppointmentsPage() {
  const { supabase } = useSupabase()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [showReschedule, setShowReschedule] = useState(false)
  const [showCancel, setShowCancel] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  useEffect(() => {
    fetchAppointments()
  }, [supabase])

  const fetchAppointments = async () => {
    if (!supabase) return
  
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          date,
          location,
          patient:patients!patient_id (
            id, 
            name
          ),
          doctor:doctors!doctor_id (
            id, 
            first_name,
            last_name
          )
        `)
        .order('date', { ascending: true })
  
      if (error) throw error
      
      // Transform the data to match the Appointment interface
      const transformedData: Appointment[] = data.map(apt => ({
        id: apt.id,
        date: apt.date,
        location: apt.location,
        patient: {
          id: apt.patient.id,
          name: apt.patient.name
        },
        doctor: {
          id: apt.doctor.id,
          name: `${apt.doctor.first_name} ${apt.doctor.last_name}`
        }
      }))
      
      setAppointments(transformedData)
    } catch (error) {
      console.error('Error fetching appointments:', error)
      toast.error('Failed to load appointments')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReschedule = async (date: string, time: string) => {
    if (!selectedAppointment || !supabase) return

    try {
      const newDateTime = `${date}T${time}:00`
      const { error } = await supabase
        .from('appointments')
        .update({ date: newDateTime })
        .eq('id', selectedAppointment.id)

      if (error) throw error

      setAppointments(appointments.map(apt => 
        apt.id === selectedAppointment.id 
          ? { ...apt, date: newDateTime }
          : apt
      ))
      toast.success('Appointment rescheduled successfully')
    } catch (error) {
      console.error('Error rescheduling appointment:', error)
      toast.error('Failed to reschedule appointment')
      throw error
    }
  }

  const handleCancel = async () => {
    if (!selectedAppointment || !supabase) return

    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', selectedAppointment.id)

      if (error) throw error

      setAppointments(appointments.filter(apt => apt.id !== selectedAppointment.id))
      toast.success('Appointment cancelled successfully')
    } catch (error) {
      console.error('Error cancelling appointment:', error)
      toast.error('Failed to cancel appointment')
      throw error
    }
  }

  if (isLoading) {
    return <AppointmentSkeleton />
  }

  const formatAppointmentDate = (date: string) => {
    return format(new Date(date), 'MMMM d, yyyy')
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Appointments</h1>
      
      <Tabs defaultValue="list" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list">
          <div className="grid gap-4">
            {appointments.length === 0 ? (
              <p className="text-muted-foreground">No appointments scheduled.</p>
            ) : (
              appointments.map((appointment) => (
                <Card key={appointment.id}>
                  <CardContent className="flex items-center justify-between p-6">
                    <div className="flex-1">
                      <h3 className="font-semibold">{appointment.patient.name}</h3>
                      <div className="flex items-center text-muted-foreground mt-1">
                        <Calendar className="w-4 h-4 mr-2" />
                        {formatAppointmentDate(appointment.date)}
                      </div>
                      <div className="flex items-center text-muted-foreground mt-1">
                        <Clock className="w-4 h-4 mr-2" />
                        {format(new Date(appointment.date), 'HH:mm')}
                      </div>
                      <div className="flex items-center text-muted-foreground mt-1">
                        <MapPin className="w-4 h-4 mr-2" />
                        {appointment.location}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setSelectedAppointment(appointment)
                          setShowReschedule(true)
                        }}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setSelectedAppointment(appointment)
                          setShowCancel(true)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="calendar">
          <AppointmentCalendar
            appointments={appointments}
            onDateSelect={setSelectedDate}
            className="min-h-[600px]"
          />
        </TabsContent>
      </Tabs>

      {selectedAppointment && (
        <>
          <RescheduleAppointmentDialog
            isOpen={showReschedule}
            onClose={() => {
              setShowReschedule(false)
              setSelectedAppointment(null)
            }}
            onReschedule={handleReschedule}
            currentDate={selectedAppointment.date.split('T')[0]}
            currentTime={selectedAppointment.date.split('T')[1].substring(0, 5)}
          />
          <CancelAppointmentDialog
            isOpen={showCancel}
            onClose={() => {
              setShowCancel(false)
              setSelectedAppointment(null)
            }}
            onCancel={handleCancel}
            appointmentDate={formatAppointmentDate(selectedAppointment.date)}
          />
        </>
      )}
    </div>
  )
}
